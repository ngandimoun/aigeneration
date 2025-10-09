import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateManimCodeWithRetry, handleTTSFailure } from '@/lib/manim/self-healing'
import { ManimGenerationOptions } from '@/lib/manim/claude-prompts'
import { getUserFriendlyError } from '@/lib/manim/error-messages'
import { reportBug } from '@/lib/manim/bug-reporter'

// Validation schema for explainer generation
const generateExplainerSchema = z.object({
  prompt: z.string().min(10).max(2000),
  hasVoiceover: z.boolean().default(false),
  voiceStyle: z.string().default('educational'),
  language: z.string().default('english'),
  duration: z.number().min(1).max(180).default(8),
  aspectRatio: z.string().default('16:9'),
  resolution: z.string().default('720p'),
  style: z.string().default('auto'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Explainer generation API called')
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = generateExplainerSchema.parse(body)

    console.log('📝 Generation request:', {
      prompt: validatedData.prompt,
      hasVoiceover: validatedData.hasVoiceover,
      voiceStyle: validatedData.voiceStyle,
      language: validatedData.language,
      duration: validatedData.duration,
      aspectRatio: validatedData.aspectRatio,
      resolution: validatedData.resolution,
      style: validatedData.style
    })

    // Create job record in database (let Supabase generate UUID)
    const { data: job, error: jobError } = await supabase
      .from('explainers')
      .insert({
        user_id: user.id,
        title: validatedData.prompt.slice(0, 100),
        description: validatedData.prompt,
        status: 'draft',
        duration: validatedData.duration,
        style: validatedData.style,
        metadata: {
          prompt: validatedData.prompt,
          hasVoiceover: validatedData.hasVoiceover,
          voiceStyle: validatedData.voiceStyle,
          language: validatedData.language,
          aspectRatio: validatedData.aspectRatio,
          resolution: validatedData.resolution,
          style: validatedData.style
        }
      })
      .select()
      .single()

    if (jobError) {
      console.error('❌ Error creating job:', jobError)
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }

    const jobId = job.id

    // Create Supabase signed upload URL
    const fileName = `renders/explainers/${user.id}/${jobId}.mp4`
    
    // Try to create signed upload URL with proper error handling
    let uploadData, uploadError;
    
    try {
      const result = await supabase.storage
        .from('dreamcut')
        .createSignedUploadUrl(fileName, {
          upsert: false, // Don't overwrite existing files
          expiresIn: 3600 // 1 hour expiration (3600 seconds)
        });
      
      uploadData = result.data;
      uploadError = result.error;
    } catch (err) {
      console.error('❌ Storage API error:', err);
      uploadError = err;
    }

    if (uploadError || !uploadData) {
      console.error('❌ Error creating upload URL:', uploadError)
      
      // If RLS policy fails, try a different approach - create a temporary file first
      try {
        // Create an empty file to establish the path
        const { error: createError } = await supabase.storage
          .from('dreamcut')
          .upload(fileName, new Blob(['']), {
            contentType: 'video/mp4',
            upsert: true
          });
        
        if (createError) {
          console.error('❌ Error creating placeholder file:', createError)
          return NextResponse.json({ 
            error: 'Storage access denied. Please check your Supabase Storage RLS policies.',
            details: uploadError?.message || createError?.message
          }, { status: 500 })
        }
        
        // Now try to get the signed URL again
        const retryResult = await supabase.storage
          .from('dreamcut')
          .createSignedUploadUrl(fileName, {
            expiresIn: 3600 // 1 hour expiration (3600 seconds)
          });
        
        uploadData = retryResult.data;
        uploadError = retryResult.error;
        
        if (uploadError || !uploadData) {
          return NextResponse.json({ 
            error: 'Failed to create upload URL after retry',
            details: uploadError?.message
          }, { status: 500 })
        }
      } catch (retryErr) {
        return NextResponse.json({ 
          error: 'Storage configuration issue',
          details: retryErr instanceof Error ? retryErr.message : 'Unknown error'
        }, { status: 500 })
      }
    }

    // Update job with upload URL
    await supabase
      .from('explainers')
      .update({ 
        output_url: fileName,
        status: 'processing'
      })
      .eq('id', jobId)

    // Start async generation process
    generateExplainerAsync(
      validatedData as ManimGenerationOptions,
      supabase,
      jobId,
      uploadData.signedUrl
    ).catch(error => {
      console.error('❌ Async generation failed:', error)
      // Update job status to failed
      supabase
        .from('explainers')
        .update({ 
          status: 'failed',
          metadata: {
            last_error: error.message
          }
        })
        .eq('id', jobId)
    })

    // Return job ID immediately
    return NextResponse.json({ 
      success: true, 
      jobId,
      message: 'Generation started'
    }, { status: 202 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 })
    }
    console.error('Unexpected error in POST /api/explainers/generate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Async function to handle the actual generation
async function generateExplainerAsync(
  options: ManimGenerationOptions,
  supabase: any,
  jobId: string,
  uploadUrl: string
) {
  try {
    console.log(`🎬 Starting generation for job ${jobId}`)
    
    // Update status to processing
    await supabase
      .from('explainers')
      .update({ status: 'processing' })
      .eq('id', jobId)

    // Generate with self-healing retry logic
    const result = await generateManimCodeWithRetry(
      options,
      supabase,
      jobId,
      uploadUrl,
      5 // Max 5 retry attempts
    )

    if (result.success) {
      console.log(`✅ Generation completed successfully for job ${jobId}`)
      
      // Update final status
      await supabase
        .from('explainers')
        .update({
          status: 'completed',
          metadata: {
            manim_code: result.code,
            logs: result.logs,
            stderr: result.stderr,
            retry_count: result.retryCount
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
    } else {
      console.log(`❌ Generation failed for job ${jobId}: ${result.error}`)
      
      // Try TTS fallback if voiceover was enabled and we haven't tried it yet
      if (options.hasVoiceover && !result.error?.includes('voiceover')) {
        console.log('🎙️ Attempting TTS fallback...')
        
        const fallbackResult = await handleTTSFailure(
          options,
          supabase,
          jobId,
          uploadUrl
        )
        
        if (fallbackResult.success) {
          console.log(`✅ TTS fallback successful for job ${jobId}`)
          return
        }
      }
      
      // Get user-friendly error message
      const friendlyError = getUserFriendlyError(result.error || 'Unknown error')
      console.log('📋 User-friendly error:', friendlyError)
      
      // Report bug automatically for analysis
      try {
        await reportBug({
          type: 'manim_render_failure',
          userPrompt: validatedData.prompt,
          generatedCode: result.code || '',
          technicalError: result.error || 'Unknown error',
          errorCategory: friendlyError.category,
          errorSeverity: friendlyError.severity,
          userId: user.id,
          attemptNumber: result.retryCount || 0,
          timestamp: new Date(),
          metadata: {
            duration: validatedData.duration,
            style: validatedData.style,
            aspectRatio: validatedData.aspectRatio,
            resolution: validatedData.resolution,
            hasVoiceover: validatedData.hasVoiceover,
            voiceStyle: validatedData.voiceStyle,
            language: validatedData.language
          }
        })
      } catch (bugReportError) {
        console.error('Failed to report bug:', bugReportError)
        // Don't fail the request if bug reporting fails
      }
      
      // Update final failed status with user-friendly message
      await supabase
        .from('explainers')
        .update({
          status: 'failed',
          error: friendlyError.message,
          metadata: {
            last_error: result.error,
            retry_count: result.retryCount,
            error_details: {
              technical: process.env.NODE_ENV === 'development' ? result.error : undefined,
              suggestion: friendlyError.suggestion,
              category: friendlyError.category,
              severity: friendlyError.severity
            }
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
    }
  } catch (error) {
    console.error(`❌ Unexpected error in generation for job ${jobId}:`, error)
    
    // Update job as failed
    await supabase
      .from('explainers')
      .update({
        status: 'failed',
        metadata: {
          last_error: (error as Error).message
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
  }
}

// GET endpoint to check job status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get job ID from query params
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    // Fetch job status
    const { data: job, error } = await supabase
      .from('explainers')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ job }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error in GET /api/explainers/generate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
