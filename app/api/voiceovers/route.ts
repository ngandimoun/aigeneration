import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

// Cache for 30 seconds
export const revalidate = 30

// Validation schema for voiceover creation
const createVoiceoverSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  prompt: z.string().min(1),
  language: z.string().optional().default('English'),
  voice_id: z.string().optional(),
  emotion: z.string().optional(),
  use_case: z.string().optional(),
  audio_url: z.string().optional(),
  content: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/voiceovers - Get user's voiceovers
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query with filters
    let query = supabase
      .from('voiceovers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination (use range instead of limit to avoid conflicts)
    query = query.range(offset, offset + limit - 1)

    const { data: voiceovers, error } = await query

    if (error) {
      console.error('Error fetching voiceovers:', error)
      return NextResponse.json({ error: 'Failed to fetch voiceovers' }, { status: 500 })
    }

    return NextResponse.json({ voiceovers }, { 
      status: 200,
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
        'CDN-Cache-Control': 'max-age=30'
      }
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/voiceovers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/voiceovers - Create new voiceover
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Voiceover generation API called')
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createVoiceoverSchema.parse(body)

    console.log('📝 Voiceover generation data:', {
      title: validatedData.title,
      description: validatedData.description,
      prompt: validatedData.prompt,
      language: validatedData.language,
      voice_id: validatedData.voice_id,
      emotion: validatedData.emotion,
      use_case: validatedData.use_case
    })

    // Generate unique ID for this generation
    const generationId = `vo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const generationTimestamp = new Date().toISOString()

    // Extract ElevenLabs settings from content
    const elevenLabsSettings = validatedData.content?.elevenlabs_settings || {}
    const dreamcutVoice = validatedData.content?.dreamcut_voice || {}

    // For now, we'll simulate audio generation with placeholder URLs
    // In a real implementation, you would call ElevenLabs API
    const generatedAudioUrl = `https://example.com/generated_voiceover_${generationId}.mp3`
    const generatedStoragePath = `renders/voiceovers/${user.id}/generated/${uuidv4()}-generated_voiceover.mp3`

    console.log('🎵 Generated audio:', generatedAudioUrl)

    // Create voiceover
    const { data: voiceover, error } = await supabase
      .from('voiceovers')
      .insert({
        user_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        prompt: validatedData.prompt,
        
        // Voice Settings
        voice_id: validatedData.voice_id,
        language: validatedData.language,
        emotion: validatedData.emotion,
        use_case: validatedData.use_case,
        
        // ElevenLabs Settings
        stability: elevenLabsSettings.stability || 0.5,
        similarity_boost: elevenLabsSettings.similarity_boost || 0.75,
        style: elevenLabsSettings.style || 0.0,
        use_speaker_boost: elevenLabsSettings.use_speaker_boost || true,
        model_id: elevenLabsSettings.model_id || 'eleven_v3',
        output_format: elevenLabsSettings.output_format || 'mp3_44100_128',
        optimize_streaming_latency: elevenLabsSettings.optimize_streaming_latency || 0,
        enable_logging: elevenLabsSettings.enable_logging || true,
        
        // Generated Content
        generated_audio_path: generatedAudioUrl,
        storage_path: generatedStoragePath,
        
        // Metadata
        dreamcut_voice_name: dreamcutVoice.name,
        api_version: 'v1',
        status: 'completed',
        metadata: {
          generationTimestamp,
          generationId,
          title: validatedData.title,
          description: validatedData.description,
          prompt: validatedData.prompt,
          language: validatedData.language,
          voice_id: validatedData.voice_id,
          emotion: validatedData.emotion,
          use_case: validatedData.use_case,
          dreamcut_voice_name: dreamcutVoice.name,
          generated_via: 'voiceover-generation',
          ...validatedData.metadata
        },
        content: {
          audio_url: generatedAudioUrl,
          generation_id: generationId,
          full_prompt: validatedData.prompt,
          dreamcut_voice: dreamcutVoice,
          elevenlabs_settings: elevenLabsSettings,
          settings: validatedData
        }
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating voiceover:', error)
      return NextResponse.json({ error: 'Failed to create voiceover' }, { status: 500 })
    }

    console.log('✅ Voiceover saved to voiceovers table:', voiceover.id)

    // Add to library_items table
    const { error: libraryError } = await supabase
      .from('library_items')
      .insert({
        user_id: user.id,
        content_type: 'voiceovers',
        content_id: voiceover.id,
        date_added_to_library: new Date().toISOString()
      })

    if (libraryError) {
      console.error('Failed to add voiceover to library:', libraryError)
    } else {
      console.log(`✅ Voiceover ${voiceover.id} added to library`)
    }

    return NextResponse.json({ 
      message: 'Voiceover generated and saved successfully', 
      voiceover 
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Unexpected error in POST /api/voiceovers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

