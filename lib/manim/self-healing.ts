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
import { enhancePromptToSpec, type TechnicalSpecification } from './prompt-enhancer';
import { validateGeneratedCode, getValidationSummary, formatValidationIssues } from './static-validator';
import { smartFix } from './quick-fixer';

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

// Enhanced error context for AI retry attempts
function enhanceErrorContext(error: string, stderr: string, attempt: number): string {
  let enhancedError = error;
  
  // Detect if this is a fallback error
  const isFallbackError = stderr.includes('fallback_scene.py') || error.includes('fallback');
  
  if (isFallbackError) {
    enhancedError = `FALLBACK CLEANUP ERROR: The fallback code cleanup introduced errors. Original error: ${error}`;
    
    // Extract line number and code snippet if available
    const lineMatch = stderr.match(/line (\d+)/);
    if (lineMatch) {
      enhancedError += `\n\nError occurred at line ${lineMatch[1]} in fallback code.`;
    }
    
    // Add specific guidance for fallback errors
    enhancedError += `\n\nIMPORTANT: This error was caused by the fallback cleanup process, not your original code. `;
    enhancedError += `Please generate clean, valid Python code that doesn't require fallback processing. `;
    enhancedError += `Focus on: proper indentation, correct imports, valid Manim syntax.`;
  } else {
    // For original code errors, provide more context
    enhancedError = `ORIGINAL CODE ERROR (attempt ${attempt}): ${error}`;
    
    // Add specific error type detection and guidance
    if (error.toLowerCase().includes('indentation')) {
      enhancedError += `\n\nINDENTATION ERROR: Check that all code blocks are properly indented. `;
      enhancedError += `Class methods should be indented 4 spaces, method content should be indented 8 spaces.`;
    } else if (error.toLowerCase().includes('syntax')) {
      enhancedError += `\n\nSYNTAX ERROR: Check for missing colons, parentheses, or quotes. `;
      enhancedError += `Ensure all strings are properly closed and all function calls have matching parentheses.`;
    } else if (error.toLowerCase().includes('import') || error.toLowerCase().includes('module')) {
      enhancedError += `\n\nIMPORT ERROR: Check that all imports are correct and available in Manim 0.18.1. `;
      enhancedError += `Use only standard Manim imports: from manim import *`;
    } else if (error.toLowerCase().includes('name') && error.toLowerCase().includes('not defined')) {
      enhancedError += `\n\nUNDEFINED NAME ERROR: Check that all variables and functions are properly defined before use. `;
      enhancedError += `Ensure all Manim objects are created before being used in animations.`;
    } else if (error.toLowerCase().includes('notimplementederror') && error.toLowerCase().includes('animation is not defined')) {
      enhancedError += `\n\nANIMATION API ERROR: You are using an invalid animation pattern. `;
      enhancedError += `NEVER use Create(Group(...)) or Write(Group(...)) - this causes NotImplementedError. `;
      enhancedError += `CORRECT PATTERNS:\n`;
      enhancedError += `- Use: self.play(LaggedStart(*[Create(obj) for obj in objects], lag_ratio=0.1))\n`;
      enhancedError += `- Or: self.play(*[Create(obj) for obj in objects])\n`;
      enhancedError += `- Or: Create/Write each object individually\n`;
      enhancedError += `Group() and VGroup() are for POSITIONING only, not for animations.`;
    }
  }
  
  // Add general guidance for retry attempts
  if (attempt > 1) {
    enhancedError += `\n\nThis is retry attempt ${attempt}. Please carefully review the error and generate corrected code.`;
  }
  
  return enhancedError;
}

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

// Helper function to generate code from technical specification
async function generateCodeFromSpec(
  spec: TechnicalSpecification | string,
  options: ManimGenerationOptions
): Promise<{ code: string; sceneName: string }> {
  const systemPrompt = options.hasVoiceover 
    ? getVoiceoverSystemPrompt(options)
    : getStandardSystemPrompt(options);
  
  // Convert spec to user prompt
  const userPrompt = typeof spec === 'string' 
    ? spec  // For retry attempts, spec is the fix prompt
    : `Generate Manim code from this technical specification:

${JSON.stringify(spec, null, 2)}

Follow the specification EXACTLY. Generate complete, working Manim Python code.
Return ONLY Python code, no markdown, no explanations.`;

  console.log(`💻 Stage 2: Generating Manim code...`);
  
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

  // Handle different response formats
  let rawCode = '';
  if (response.choices && response.choices[0]?.message?.content) {
    rawCode = response.choices[0].message.content.trim();
  } else if (response.output_text) {
    rawCode = response.output_text.trim();
  } else if (response.text && response.text.content) {
    rawCode = response.text.content.trim();
  } else if (response.text && typeof response.text === 'string') {
    rawCode = response.text.trim();
  } else if (response.content) {
    rawCode = response.content.trim();
  }
  
  const sceneName = typeof spec === 'object' ? generateSceneName(options.title) : generateSceneName(options.title);
  
  // Basic validation
  const validation = validateManimCode(rawCode);
  const code = validation.cleanedCode || rawCode;

  return { code, sceneName };
}

// Generate Manim code using OpenAI with full pipeline
async function generateManimCode(
  options: ManimGenerationOptions,
  isRetry: boolean = false,
  previousError?: string,
  previousCode?: string
): Promise<{ code: string; sceneName: string }> {
  
  // STAGE 1: Enhance prompt to technical specification (only on first attempt)
  let technicalSpec: TechnicalSpecification | string;
  
  if (!isRetry) {
    console.log(`📋 Stage 1: Enhancing prompt to technical specification...`);
    try {
      technicalSpec = await enhancePromptToSpec(options);
      console.log(`✅ Stage 1: Complete - Language: ${technicalSpec.language}, Scenes: ${technicalSpec.scenes.length}`);
    } catch (error) {
      console.error('❌ Stage 1 failed, using direct prompt:', error);
      technicalSpec = buildUserPrompt(options);
    }
  } else {
    // For retries, use fix prompt
    technicalSpec = getFixOnFailPrompt(previousCode || '', previousError || '');
    console.log(`🔄 Retry attempt: Using fix prompt`);
  }

  // STAGE 2: Generate code from specification
  const { code: generatedCode, sceneName } = await generateCodeFromSpec(technicalSpec, options);
  console.log(`✅ Stage 2: Code generated (${generatedCode.length} characters)`);

  // STAGE 2.5: Static validation
  console.log(`🔍 Stage 2.5: Running static validation...`);
  const validationIssues = validateGeneratedCode(generatedCode, options.hasVoiceover ? options.voiceStyle : undefined);
  const summary = getValidationSummary(validationIssues);
  
  console.log(`📊 Validation: ${summary.critical} critical, ${summary.high} high, ${summary.medium} medium, ${summary.low} low`);
  
  if (validationIssues.length > 0) {
    console.log(formatValidationIssues(validationIssues));
  }

  // STAGE 3: Quick fix if critical issues found
  let finalCode = generatedCode;
  if (summary.critical > 0) {
    console.log(`🔧 Stage 3: Fixing ${summary.critical} critical issue(s)...`);
    try {
      finalCode = await smartFix(generatedCode, validationIssues, true);
      
      // Re-validate after fix
      const remainingIssues = validateGeneratedCode(finalCode);
      const remainingSummary = getValidationSummary(remainingIssues);
      console.log(`✅ Stage 3: Complete - ${remainingSummary.critical} critical issues remaining`);
    } catch (error) {
      console.error('❌ Stage 3 failed:', error);
      finalCode = generatedCode;
    }
  } else {
    console.log(`✅ Stage 2.5: No critical issues found`);
  }

  console.log(`🎬 Pipeline complete: ${finalCode.length} characters, scene: ${sceneName}`);
  
  return { code: finalCode, sceneName };
}

// Legacy fallback function (kept for backward compatibility if validation fails)
function createIntelligentFallback(options: ManimGenerationOptions, sceneName: string): string {
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
  return fallbackCode;
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
        verbose: true,
        resolution: options.resolution,
        aspectRatio: options.aspectRatio,
        duration: options.duration,
        style: options.style
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
        
        // Enhanced error context for AI retry
        const enhancedError = enhanceErrorContext(lastError, renderResult.stderr, attempt);
        lastError = enhancedError;
        
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
