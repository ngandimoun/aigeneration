import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Cache for 30 seconds
export const revalidate = 30

// Validation schema for cinematic clip creation
const createCinematicClipSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  clip_type: z.string().optional(),
  genre: z.string().optional(),
  mood: z.string().optional(),
  duration: z.number().optional(),
  aspect_ratio: z.string().optional().default('16:9'),
  resolution: z.string().optional().default('1080p'),
  frame_rate: z.number().optional().default(24),
  color_grade: z.string().optional(),
  lighting_style: z.string().optional(),
  camera_movement: z.string().optional(),
  scene_setting: z.string().optional(),
  characters: z.record(z.any()).optional(),
  dialogue: z.boolean().optional().default(false),
  music_style: z.string().optional(),
  content: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  is_template: z.boolean().optional().default(false),
})

// GET /api/cinematic-clips - Get user's cinematic clips
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
      .from('cinematic_clips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination (use range instead of limit to avoid conflicts)
    query = query.range(offset, offset + limit - 1)

    const { data: cinematicClips, error } = await query

    if (error) {
      console.error('Error fetching cinematic clips:', error)
      return NextResponse.json({ error: 'Failed to fetch cinematic clips' }, { status: 500 })
    }

    return NextResponse.json({ cinematicClips }, { 
      status: 200,
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
        'CDN-Cache-Control': 'max-age=30'
      }
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/cinematic-clips:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/cinematic-clips - Create new cinematic clip
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
    const validatedData = createCinematicClipSchema.parse(body)

    // Create cinematic clip
    const { data: cinematicClip, error } = await supabase
      .from('cinematic_clips')
      .insert({
        user_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        clip_type: validatedData.clip_type,
        genre: validatedData.genre,
        mood: validatedData.mood,
        duration: validatedData.duration,
        aspect_ratio: validatedData.aspect_ratio,
        resolution: validatedData.resolution,
        frame_rate: validatedData.frame_rate,
        color_grade: validatedData.color_grade,
        lighting_style: validatedData.lighting_style,
        camera_movement: validatedData.camera_movement,
        scene_setting: validatedData.scene_setting,
        characters: validatedData.characters,
        dialogue: validatedData.dialogue,
        music_style: validatedData.music_style,
        content: validatedData.content,
        metadata: validatedData.metadata,
        is_template: validatedData.is_template,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating cinematic clip:', error)
      return NextResponse.json({ error: 'Failed to create cinematic clip' }, { status: 500 })
    }

    return NextResponse.json({ cinematicClip }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Unexpected error in POST /api/cinematic-clips:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
