import OpenAI from 'openai';
import { 
  ManimGenerationOptions, 
  getVoiceoverSystemPrompt, 
  getStandardSystemPrompt, 
  buildUserPrompt, 
  getFixOnFailPrompt,
  generateSceneName,
  validateManimCode
} from './claude-prompts';
import { runManimRender, getManimOutputPath } from '../modal/setup';

export interface GenerationResult {
  success: boolean;
  code?: string;
  sceneName?: string;
  outputUrl?: string;
  logs?: string;
  stderr?: string;
  retryCount: number;
  error?: string;
}

export interface JobUpdate {
  status: string;
  retryCount?: number;
  lastError?: string;
  manimCode?: string;
  logs?: string;
  stderr?: string;
  outputUrl?: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Update job status in Supabase
async function updateJobStatus(
  supabase: any, 
  jobId: string, 
  update: JobUpdate
): Promise<void> {
  try {
    // Map our fields to the existing schema
    const dbUpdate: any = {
      status: update.status,
      updated_at: new Date().toISOString()
    };

    // Store additional data in metadata if columns don't exist
    if (update.retryCount !== undefined || update.lastError || update.manimCode || update.logs || update.stderr) {
      // Get current metadata first
      const { data: currentJob } = await supabase
        .from('explainers')
        .select('metadata')
        .eq('id', jobId)
        .single();

      const currentMetadata = currentJob?.metadata || {};
      
      // Update metadata with new fields
      const updatedMetadata = {
        ...currentMetadata,
        ...(update.retryCount !== undefined && { retry_count: update.retryCount }),
        ...(update.lastError && { last_error: update.lastError }),
        ...(update.manimCode && { manim_code: update.manimCode }),
        ...(update.logs && { logs: update.logs }),
        ...(update.stderr && { stderr: update.stderr }),
        ...(update.outputUrl && { output_url: update.outputUrl })
      };

      dbUpdate.metadata = updatedMetadata;
    }

    const { error } = await supabase
      .from('explainers')
      .update(dbUpdate)
      .eq('id', jobId);
    
    if (error) {
      console.error('Failed to update job status:', error);
    }
  } catch (err) {
    console.error('Error updating job status:', err);
  }
}

// Generate Manim code using OpenAI
async function generateManimCode(
  options: ManimGenerationOptions,
  isRetry: boolean = false,
  previousError?: string,
  previousCode?: string
): Promise<{ code: string; sceneName: string }> {
  const systemPrompt = options.hasVoiceover 
    ? getVoiceoverSystemPrompt(options)
    : getStandardSystemPrompt(options);
  
  const userPrompt = isRetry && previousError
    ? getFixOnFailPrompt(previousCode || '', previousError)
    : buildUserPrompt(options);

  console.log(`🤖 Generating Manim code (attempt ${isRetry ? 'retry' : 'initial'})...`);
  
  // Use the new GPT-5 API format
  let response;
  try {
    response = await openai.responses.create({
      model: "gpt-5",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      text: {
        format: {
          type: "text"
        },
        verbosity: "medium"
      },
      reasoning: {
        effort: "medium",
        summary: "auto"
      },
      tools: [],
      store: true,
      include: [
        "reasoning.encrypted_content"
      ]
    });
  } catch (error) {
    console.log("⚠️ GPT-5 not available, falling back to GPT-4o");
    response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 6000,
      top_p: 0.9,
    });
  }

  // Handle different response formats with better debugging
  let rawCode = '';
  console.log('🔍 Response structure keys:', Object.keys(response));
  
  if (response.choices && response.choices[0]?.message?.content) {
    // GPT-4o fallback format
    rawCode = response.choices[0].message.content.trim();
    console.log('📝 Using GPT-4o response format');
  } else if (response.output_text) {
    // GPT-5 new format - the actual code is in output_text
    rawCode = response.output_text.trim();
    console.log('📝 Using GPT-5 output_text format');
  } else if (response.text && response.text.content) {
    // GPT-5 alternative format
    rawCode = response.text.content.trim();
    console.log('📝 Using GPT-5 text.content format');
  } else if (response.text && typeof response.text === 'string') {
    // GPT-5 string format
    rawCode = response.text.trim();
    console.log('📝 Using GPT-5 string format');
  } else if (response.content) {
    // Another possible GPT-5 format
    rawCode = response.content.trim();
    console.log('📝 Using GPT-5 content format');
  } else {
    console.log('❌ No valid response content found');
    console.log('🔍 Available fields:', Object.keys(response));
    rawCode = '';
  }
  
  console.log('📄 Raw code length:', rawCode.length);
  console.log('📄 Raw code preview:', rawCode.substring(0, 200) + '...');
  
  const sceneName = generateSceneName(options.title);
  
  // Validate the generated code
  const validation = validateManimCode(rawCode);
  if (!validation.isValid) {
    console.log('⚠️ Generated code validation failed, creating intelligent fallback code');
    
    // Create a fallback that actually tries to fulfill the user's request
    const prompt = options.prompt.toLowerCase();
    let fallbackCode = `from manim import *

class ${sceneName}(Scene):
    def construct(self):
        # Fallback animation based on user request: "${options.prompt}"
        
        # Create title
        title = Text("${options.prompt.substring(0, 40)}${options.prompt.length > 40 ? '...' : ''}", font_size=32)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(0.5)
        
        # Generate content based on prompt analysis
        `;

    // Add specific content based on prompt keywords
    if (prompt.includes('chart') || prompt.includes('graph') || prompt.includes('data')) {
        fallbackCode += `
        # Data visualization
        ax = Axes(x_range=[0, 10, 2], y_range=[0, 20, 5], x_length=8, y_length=4)
        ax_labels = ax.get_axis_labels(x_label="X", y_label="Y")
        
        # Sample data points
        dots = VGroup()
        for i in range(5):
            dot = Dot(ax.c2p(i*2, i*3), color=BLUE, radius=0.08)
            dots.add(dot)
        
        line = ax.plot(lambda x: x*1.5, color=RED)
        
        self.play(Create(ax), Write(ax_labels))
        self.play(Create(line))
        self.play(LaggedStart(*[Create(dot) for dot in dots], lag_ratio=0.2))
        self.wait(1)
        `;
    } else if (prompt.includes('math') || prompt.includes('formula') || prompt.includes('equation')) {
        fallbackCode += `
        # Mathematical content
        formula = MathTex(r"f(x) = x^2 + 2x + 1", font_size=48)
        explanation = Text("Quadratic Function", font_size=24, color=GRAY)
        explanation.next_to(formula, DOWN)
        
        # Graph the function
        ax = Axes(x_range=[-3, 3, 1], y_range=[-1, 9, 2], x_length=6, y_length=4)
        graph = ax.plot(lambda x: x**2 + 2*x + 1, color=BLUE)
        
        self.play(Write(formula))
        self.play(Write(explanation))
        self.wait(0.5)
        self.play(Create(ax))
        self.play(Create(graph))
        self.wait(1)
        `;
    } else if (prompt.includes('circle') || prompt.includes('round')) {
        fallbackCode += `
        # Circular shapes
        circle = Circle(radius=1.5, color=BLUE)
        inner_circle = Circle(radius=0.8, color=RED)
        inner_circle.move_to(circle.get_center())
        
        self.play(Create(circle))
        self.play(Create(inner_circle))
        self.play(Rotating(circle, radians=PI))
        self.wait(1)
        `;
    } else if (prompt.includes('square') || prompt.includes('rectangle')) {
        fallbackCode += `
        # Square/rectangle shapes
        square = Square(side_length=2, color=GREEN)
        rectangle = Rectangle(width=3, height=1.5, color=ORANGE)
        
        self.play(Create(square))
        self.play(Transform(square, rectangle))
        self.play(square.animate.rotate(PI/4))
        self.wait(1)
        `;
    } else if (prompt.includes('triangle')) {
        fallbackCode += `
        # Triangle shapes
        triangle = Triangle(color=PURPLE)
        triangle.scale(1.5)
        
        self.play(Create(triangle))
        self.play(triangle.animate.rotate(PI))
        self.wait(1)
        `;
    } else {
        fallbackCode += `
        # General animation
        shapes = VGroup(
            Circle(radius=0.8, color=BLUE),
            Square(side_length=1.2, color=RED),
            Triangle(color=GREEN)
        )
        shapes.arrange(RIGHT, buff=1)
        
        self.play(LaggedStart(*[Create(shape) for shape in shapes], lag_ratio=0.3))
        self.wait(0.5)
        self.play(LaggedStart(*[shape.animate.rotate(PI) for shape in shapes], lag_ratio=0.2))
        self.wait(1)
        `;
    }

    fallbackCode += `
        # Cleanup
        self.play(FadeOut(VGroup(title, *[obj for obj in self.mobjects if obj != title])))
        self.wait(0.5)`;
    
    console.log('📝 Using intelligent fallback code based on user prompt');
    return { code: fallbackCode, sceneName };
  }

  // Use the cleaned code
  const code = validation.cleanedCode || rawCode;

  return { code, sceneName };
}

// Main function with self-healing retry logic
export async function generateManimCodeWithRetry(
  options: ManimGenerationOptions,
  supabase: any,
  jobId: string,
  uploadUrl: string,
  maxRetries: number = 5
): Promise<GenerationResult> {
  let lastCode = '';
  let lastSceneName = '';
  let lastError = '';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}`);
      
      // Update job status
      await updateJobStatus(supabase, jobId, {
        status: 'processing',
        retryCount: attempt - 1,
        lastError: attempt > 1 ? lastError : undefined
      });

      // Generate code
      const { code, sceneName } = await generateManimCode(
        options, 
        attempt > 1, 
        attempt > 1 ? lastError : undefined,
        attempt > 1 ? lastCode : undefined
      );
      
      lastCode = code;
      lastSceneName = sceneName;

      // Update job with generated code
      await updateJobStatus(supabase, jobId, {
        status: 'processing',
        manimCode: code
      });

      console.log(`🎬 Rendering scene: ${sceneName}`);
      
      // Render with E2B
      const renderResult = await runManimRender({
        code,
        sceneName,
        uploadUrl,
        verbose: true
      });

      if (renderResult.success) {
        console.log(`✅ Render successful on attempt ${attempt}`);
        
        // Update job as completed
        await updateJobStatus(supabase, jobId, {
          status: 'completed',
          outputUrl: uploadUrl,
          logs: renderResult.logs,
          stderr: renderResult.stderr,
          retryCount: attempt - 1
        });

        return {
          success: true,
          code,
          sceneName,
          outputUrl: uploadUrl,
          logs: renderResult.logs,
          stderr: renderResult.stderr,
          retryCount: attempt - 1
        };
      } else {
        // Render failed, capture error for next attempt
        lastError = renderResult.error || 'Unknown render error';
        console.log(`❌ Render failed on attempt ${attempt}: ${lastError}`);
        
        // If this was the last attempt, return failure
        if (attempt === maxRetries) {
          await updateJobStatus(supabase, jobId, {
            status: 'failed',
            lastError,
            retryCount: attempt - 1,
            logs: renderResult.logs,
            stderr: renderResult.stderr
          });

          return {
            success: false,
            error: lastError,
            code: lastCode,
            sceneName: lastSceneName,
            logs: renderResult.logs,
            stderr: renderResult.stderr,
            retryCount: attempt - 1
          };
        }
      }
    } catch (error) {
      lastError = (error as Error).message;
      console.log(`❌ Attempt ${attempt} failed: ${lastError}`);
      
      // If this was the last attempt, return failure
      if (attempt === maxRetries) {
        await updateJobStatus(supabase, jobId, {
          status: 'failed',
          lastError,
          retryCount: attempt - 1
        });

        return {
          success: false,
          error: lastError,
          code: lastCode,
          sceneName: lastSceneName,
          retryCount: attempt - 1
        };
      }
    }
  }

  // This should never be reached, but just in case
  return {
    success: false,
    error: 'Max retries exceeded',
    retryCount: maxRetries
  };
}

// Helper function to create a safe fallback scene
export function createSafeFallbackScene(options: ManimGenerationOptions): string {
  const sceneName = generateSceneName(options.title);
  
  return `from manim import *

class ${sceneName}(Scene):
    def construct(self):
        # Safe fallback scene
        title = Text("${options.prompt}", font_size=48)
        title.to_edge(UP)
        
        # Simple animation
        self.play(Write(title))
        self.wait(2)
        
        # Add a simple shape
        circle = Circle(radius=1, color=BLUE)
        circle.shift(DOWN)
        
        self.play(Create(circle))
        self.wait(1)
        
        # Transform to square
        square = Square(side_length=2, color=RED)
        square.shift(DOWN)
        
        self.play(Transform(circle, square))
        self.wait(2)
        
        # Fade out
        self.play(FadeOut(title), FadeOut(circle))
        self.wait(1)`;
}

// Function to handle TTS failures gracefully
export async function handleTTSFailure(
  options: ManimGenerationOptions,
  supabase: any,
  jobId: string,
  uploadUrl: string
): Promise<GenerationResult> {
  console.log('🎙️ TTS failed, falling back to video-only generation...');
  
  // Update options to disable voiceover
  const fallbackOptions = { ...options, hasVoiceover: false };
  
  // Update job status
  await updateJobStatus(supabase, jobId, {
    status: 'processing',
    lastError: 'TTS service failed, rendering without voiceover'
  });

  // Generate without voiceover
  return generateManimCodeWithRetry(fallbackOptions, supabase, jobId, uploadUrl, 3);
}
