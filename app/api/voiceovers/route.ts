import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for voiceover creation
const createVoiceoverSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  selected_artifact: z.string().optional(),
  voiceover_type: z.string().optional(),
  voice_characteristics: z.record(z.any()).optional(),
  script: z.string().min(1),
  language: z.string().optional().default('en'),
  accent: z.string().optional(),
  tone: z.string().optional(),
  speed: z.string().optional(),
  emotion: z.string().optional(),
  duration_estimate: z.number().optional(),
  use_case: z.string().optional(),
  background_music: z.boolean().optional().default(false),
  sound_effects: z.boolean().optional().default(false),
  audio_quality: z.string().optional(),
  sample_rate: z.number().optional().default(44100),
  bit_depth: z.number().optional().default(16),
  guidance_scale: z.number().optional().default(50),
  seed_variability: z.number().optional().default(50),
  temperature: z.number().optional().default(0.7),
  content: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  is_template: z.boolean().optional().default(false),
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

    return NextResponse.json({ voiceovers }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error in GET /api/voiceovers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/voiceovers - Create new voiceover
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createVoiceoverSchema.parse(body)

    // Create voiceover
    const { data: voiceover, error } = await supabase
      .from('voiceovers')
      .insert({
        user_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        selected_artifact: validatedData.selected_artifact,
        voiceover_type: validatedData.voiceover_type,
        voice_characteristics: validatedData.voice_characteristics,
        script: validatedData.script,
        language: validatedData.language,
        accent: validatedData.accent,
        tone: validatedData.tone,
        speed: validatedData.speed,
        emotion: validatedData.emotion,
        duration_estimate: validatedData.duration_estimate,
        use_case: validatedData.use_case,
        background_music: validatedData.background_music,
        sound_effects: validatedData.sound_effects,
        audio_quality: validatedData.audio_quality,
        sample_rate: validatedData.sample_rate,
        bit_depth: validatedData.bit_depth,
        guidance_scale: validatedData.guidance_scale,
        seed_variability: validatedData.seed_variability,
        temperature: validatedData.temperature,
        content: validatedData.content,
        metadata: validatedData.metadata,
        is_template: validatedData.is_template,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating voiceover:', error)
      return NextResponse.json({ error: 'Failed to create voiceover' }, { status: 500 })
    }

    return NextResponse.json({ voiceover }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Unexpected error in POST /api/voiceovers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
