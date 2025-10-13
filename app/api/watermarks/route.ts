import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WatermarkInputs, WatermarkProject, ReplicateWatermarkResponse } from '@/lib/types/watermark'
import { downloadAndUploadVideo } from '@/lib/storage/download-and-upload'

// Cache for 30 seconds
export const revalidate = 30

// GET /api/watermarks - Fetch user's watermark projects
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's watermarks
    const { data: watermarks, error } = await supabase
      .from('watermarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching watermarks:', error)
      return NextResponse.json({ error: 'Failed to fetch watermarks' }, { status: 500 })
    }

    return NextResponse.json({ watermarks }, {
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
        'CDN-Cache-Control': 'max-age=30'
      }
    })
  } catch (error) {
    console.error('Error in GET /api/watermarks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/watermarks - Create watermark project and process
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const videoFile = formData.get('video_file') as File | null
    const videoSource = formData.get('video_source') as string
    const videoUrl = formData.get('video_url') as string
    const watermarkText = formData.get('watermark_text') as string
    const fontSize = parseInt(formData.get('font_size') as string)
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    // Validate required fields
    if (!videoUrl?.trim()) {
      return NextResponse.json({ error: 'Video file is required' }, { status: 400 })
    }

    if (!watermarkText?.trim()) {
      return NextResponse.json({ error: 'Watermark text is required' }, { status: 400 })
    }

    // Validate font size
    if (fontSize < 1 || fontSize > 500) {
      return NextResponse.json({ error: 'Font size must be between 1 and 500' }, { status: 400 })
    }

    // Handle file upload if video_source is 'upload'
    let inputVideoPath = videoUrl
    if (videoSource === 'upload' && videoFile) {
      const fileName = `${Date.now()}_${videoFile.name}`
      const filePath = `renders/watermarks/${user.id}/input/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('dreamcut')
        .upload(filePath, videoFile)
      
      if (uploadError) {
        console.error('Error uploading video file:', uploadError)
        return NextResponse.json({ error: 'Failed to upload video file' }, { status: 500 })
      }
      
      inputVideoPath = filePath
    }

    console.log('🚀 Watermark generation started:', {
      video: inputVideoPath,
      watermark: watermarkText,
      size: fontSize
    })

    // Create watermark record
    const { data: watermark, error } = await supabase
      .from('watermarks')
      .insert({
        user_id: user.id,
        title: title || `Watermark Project - ${new Date().toLocaleDateString()}`,
        description: description || 'Video watermark generation project',
        video_source: videoSource,
        video_url: videoUrl,
        watermark_text: watermarkText,
        font_size: fontSize,
        input_video_path: inputVideoPath,
        status: 'processing',
        content: {
          video_source: videoSource,
          video_url: videoUrl,
          watermark_text: watermarkText,
          font_size: fontSize
        },
        metadata: {
          videoFile: inputVideoPath,
          watermarkText: watermarkText,
          fontSize: fontSize,
          createdAt: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating watermark:', error)
      return NextResponse.json({ error: 'Failed to create watermark project' }, { status: 500 })
    }

    // Start watermark generation with Replicate
    try {
      const replicateResponse = await generateWatermarkWithReplicate({
        video: inputVideoPath,
        watermark: watermarkText,
        size: fontSize
      })
      
      if (replicateResponse.success && replicateResponse.outputVideoUrl) {
        // Download and upload the watermarked video to Supabase Storage
        console.log('📥 Downloading and uploading watermarked video to Supabase Storage...')
        const uploadResult = await downloadAndUploadVideo(
          replicateResponse.outputVideoUrl,
          `renders/watermarks/${user.id}/output`,
          watermark.id,
          'video/mp4'
        )

        if (!uploadResult.success) {
          console.error('❌ Failed to upload watermarked video:', uploadResult.error)
          throw new Error(`Upload failed: ${uploadResult.error}`)
        }

        console.log('✅ Watermarked video uploaded successfully:', uploadResult.storagePath)

        // Update watermark with success
        await supabase
          .from('watermarks')
          .update({
            output_video_url: uploadResult.storagePath, // Store Supabase storage path
            storage_path: uploadResult.storagePath, // Store storage path
            status: 'completed',
            updated_at: new Date().toISOString(),
            metadata: {
              ...watermark.metadata,
              processingTime: Date.now() - new Date(watermark.created_at).getTime(),
              completedAt: new Date().toISOString(),
              storagePath: uploadResult.storagePath,
              originalReplicateUrl: replicateResponse.outputVideoUrl
            }
          })
          .eq('id', watermark.id)

        // Add to library
        await supabase
          .from('library_items')
          .insert({
            user_id: user.id,
            content_type: 'watermarks',
            content_id: watermark.id,
            date_added_to_library: new Date().toISOString()
          })

        return NextResponse.json({
          success: true,
          projectId: watermark.id,
          outputVideoUrl: uploadResult.storagePath, // Return storage path instead of Replicate URL
          status: 'completed'
        })
      } else {
        // Update watermark with failure
        await supabase
          .from('watermarks')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
            metadata: {
              ...watermark.metadata,
              errorMessage: replicateResponse.error || 'Unknown error occurred',
              failedAt: new Date().toISOString()
            }
          })
          .eq('id', watermark.id)

        return NextResponse.json({
          success: false,
          projectId: watermark.id,
          error: replicateResponse.error || 'Watermark generation failed',
          status: 'failed'
        }, { status: 500 })
      }
    } catch (replicateError) {
      console.error('Replicate API error:', replicateError)
      
      // Update watermark with failure
      await supabase
        .from('watermarks')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
          metadata: {
            ...watermark.metadata,
            errorMessage: replicateError instanceof Error ? replicateError.message : 'Unknown error',
            failedAt: new Date().toISOString()
          }
        })
        .eq('id', watermark.id)

      return NextResponse.json({
        success: false,
        projectId: watermark.id,
        error: 'Failed to process watermark with Replicate',
        status: 'failed'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in POST /api/watermarks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/watermarks - Update watermark project status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, outputVideoUrl, error: errorMessage } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 })
    }

    // Update watermark status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (outputVideoUrl) {
      updateData.output_video_url = outputVideoUrl
    }

    if (errorMessage) {
      updateData.metadata = {
        errorMessage,
        failedAt: new Date().toISOString()
      }
    }

    const { error } = await supabase
      .from('watermarks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating watermark:', error)
      return NextResponse.json({ error: 'Failed to update watermark' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PATCH /api/watermarks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


// Helper function to call Replicate API for watermark generation
async function generateWatermarkWithReplicate(inputs: WatermarkInputs): Promise<{ success: boolean; outputVideoUrl?: string; error?: string }> {
  try {
    // For now, we'll simulate the Replicate API call
    // In a real implementation, you would call the actual Replicate watermark model
    
    console.log('🎬 Calling Replicate watermark API with:', {
      video: inputs.video,
      watermark: inputs.watermark,
      size: inputs.size
    })

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // For demo purposes, return a mock success response
    // In production, replace this with actual Replicate API call:
    /*
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'your-watermark-model-version',
        input: {
          video: inputs.video,
          watermark: inputs.watermark,
          size: inputs.size
        }
      })
    })

    const result = await response.json()
    */

    // Mock response for now
    const mockOutputUrl = `https://replicate.delivery/watermarked/${Date.now()}_watermarked.mp4`
    
    return {
      success: true,
      outputVideoUrl: mockOutputUrl
    }

  } catch (error) {
    console.error('Replicate API error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
