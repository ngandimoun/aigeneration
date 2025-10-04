import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for sound effect creation
const createSoundFxSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  selected_artifact: z.string().optional(),
  sound_type: z.string().optional(),
  category: z.string().optional(),
  intensity: z.string().optional(),
  duration: z.number().optional(),
  frequency_range: z.string().optional(),
  use_case: z.string().optional(),
  loopable: z.boolean().optional().default(false),
  fade_in: z.boolean().optional().default(false),
  fade_out: z.boolean().optional().default(false),
  stereo: z.boolean().optional().default(true),
  sample_rate: z.number().optional().default(44100),
  bit_depth: z.number().optional().default(16),
  content: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  is_template: z.boolean().optional().default(false),
})

// GET /api/sound-fx - Get user's sound effects
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
      .from('sound_fx')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination (use range instead of limit to avoid conflicts)
    query = query.range(offset, offset + limit - 1)

    const { data: soundFx, error } = await query

    if (error) {
      console.error('Error fetching sound effects:', error)
      return NextResponse.json({ error: 'Failed to fetch sound effects' }, { status: 500 })
    }

    return NextResponse.json({ soundFx }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error in GET /api/sound-fx:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/sound-fx - Create new sound effect
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
    const validatedData = createSoundFxSchema.parse(body)

    // Create sound effect
    const { data: soundEffect, error } = await supabase
      .from('sound_fx')
      .insert({
        user_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        selected_artifact: validatedData.selected_artifact,
        sound_type: validatedData.sound_type,
        category: validatedData.category,
        intensity: validatedData.intensity,
        duration: validatedData.duration,
        frequency_range: validatedData.frequency_range,
        use_case: validatedData.use_case,
        loopable: validatedData.loopable,
        fade_in: validatedData.fade_in,
        fade_out: validatedData.fade_out,
        stereo: validatedData.stereo,
        sample_rate: validatedData.sample_rate,
        bit_depth: validatedData.bit_depth,
        content: validatedData.content,
        metadata: validatedData.metadata,
        is_template: validatedData.is_template,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating sound effect:', error)
      return NextResponse.json({ error: 'Failed to create sound effect' }, { status: 500 })
    }

    return NextResponse.json({ soundEffect }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Unexpected error in POST /api/sound-fx:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
