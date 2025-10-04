import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for music/jingle creation
const createMusicJingleSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  selected_artifact: z.string().optional(),
  music_type: z.string().optional(),
  genre: z.string().optional(),
  mood: z.string().optional(),
  tempo: z.string().optional(),
  instruments: z.record(z.any()).optional(),
  duration: z.number().optional(),
  key_signature: z.string().optional(),
  time_signature: z.string().optional().default('4/4'),
  use_case: z.string().optional(),
  vocals: z.boolean().optional().default(false),
  lyrics: z.string().optional(),
  fade_in: z.boolean().optional().default(false),
  fade_out: z.boolean().optional().default(false),
  content: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  is_template: z.boolean().optional().default(false),
})

// GET /api/music-jingles - Get user's music/jingles
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
      .from('music_jingles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination (use range instead of limit to avoid conflicts)
    query = query.range(offset, offset + limit - 1)

    const { data: musicJingles, error } = await query

    if (error) {
      console.error('Error fetching music/jingles:', error)
      return NextResponse.json({ error: 'Failed to fetch music/jingles' }, { status: 500 })
    }

    return NextResponse.json({ musicJingles }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error in GET /api/music-jingles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/music-jingles - Create new music/jingle
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
    const validatedData = createMusicJingleSchema.parse(body)

    // Create music/jingle
    const { data: musicJingle, error } = await supabase
      .from('music_jingles')
      .insert({
        user_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        selected_artifact: validatedData.selected_artifact,
        music_type: validatedData.music_type,
        genre: validatedData.genre,
        mood: validatedData.mood,
        tempo: validatedData.tempo,
        instruments: validatedData.instruments,
        duration: validatedData.duration,
        key_signature: validatedData.key_signature,
        time_signature: validatedData.time_signature,
        use_case: validatedData.use_case,
        vocals: validatedData.vocals,
        lyrics: validatedData.lyrics,
        fade_in: validatedData.fade_in,
        fade_out: validatedData.fade_out,
        content: validatedData.content,
        metadata: validatedData.metadata,
        is_template: validatedData.is_template,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating music/jingle:', error)
      return NextResponse.json({ error: 'Failed to create music/jingle' }, { status: 500 })
    }

    return NextResponse.json({ musicJingle }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Unexpected error in POST /api/music-jingles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
