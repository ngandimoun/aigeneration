import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

// Cache for 30 seconds
export const revalidate = 30

// Validation schema for music/jingle creation
const createMusicJingleSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  styles: z.array(z.string()).optional(),
  duration: z.number().optional(),
  volume: z.number().optional(),
  fade_in: z.number().optional(),
  fade_out: z.number().optional(),
  loop_mode: z.string().optional(),
  stereo_mode: z.string().optional(),
  created_at: z.string().optional(),
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

    return NextResponse.json({ musicJingles }, { 
      status: 200,
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
        'CDN-Cache-Control': 'max-age=30'
      }
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/music-jingles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/music-jingles - Create new music/jingle
export async function POST(request: NextRequest) {
  try {
    console.log('🎵 Music jingle generation API called')
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createMusicJingleSchema.parse(body)

    console.log('📝 Music jingle generation data:', {
      title: validatedData.title,
      description: validatedData.description,
      styles: validatedData.styles,
      duration: validatedData.duration,
      volume: validatedData.volume,
      fade_in: validatedData.fade_in,
      fade_out: validatedData.fade_out,
      loop_mode: validatedData.loop_mode,
      stereo_mode: validatedData.stereo_mode
    })

    // Generate unique ID for this generation
    const generationId = `mj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const generationTimestamp = new Date().toISOString()

    // For now, we'll simulate audio generation with placeholder URLs
    // In a real implementation, you would call Suno API
    const generatedAudioUrl = `https://example.com/generated_music_${generationId}.mp3`
    const generatedStoragePath = `renders/music-jingles/${user.id}/generated/${uuidv4()}-generated_music.mp3`

    console.log('🎵 Generated audio:', generatedAudioUrl)

    // Create music jingle
    const { data: musicJingle, error } = await supabase
      .from('music_jingles')
      .insert({
        user_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        prompt: validatedData.description || 'Generated music jingle',
        
        // Suno API Settings (defaults for now)
        model: 'V5',
        custom_mode: false,
        instrumental: false,
        vocal_gender: 'auto',
        style_weight: 0.65,
        weirdness_constraint: 0.65,
        audio_weight: 0.65,
        negative_tags: null,
        audio_action: 'generate',
        upload_url: null,
        
        // Music Settings
        styles: validatedData.styles || [],
        duration: validatedData.duration || 30,
        volume: validatedData.volume || 50,
        fade_in: validatedData.fade_in || 0,
        fade_out: validatedData.fade_out || 0,
        loop_mode: validatedData.loop_mode || 'none',
        stereo_mode: validatedData.stereo_mode || 'stereo',
        
        // Generated Content
        generated_audio_path: generatedAudioUrl,
        storage_path: generatedStoragePath,
        audio_url: generatedAudioUrl,
        
        // Metadata
        status: 'completed',
        metadata: {
          generationTimestamp,
          generationId,
          title: validatedData.title,
          description: validatedData.description,
          styles: validatedData.styles,
          duration: validatedData.duration,
          volume: validatedData.volume,
          fade_in: validatedData.fade_in,
          fade_out: validatedData.fade_out,
          loop_mode: validatedData.loop_mode,
          stereo_mode: validatedData.stereo_mode,
          generated_via: 'music-jingle-generation',
          created_at: validatedData.created_at
        },
        content: {
          audio_url: generatedAudioUrl,
          generation_id: generationId,
          full_prompt: validatedData.description || 'Generated music jingle',
          suno_settings: {
            model: 'V5',
            custom_mode: false,
            instrumental: false,
            vocal_gender: 'auto',
            style_weight: 0.65,
            weirdness_constraint: 0.65,
            audio_weight: 0.65
          },
          music_settings: {
            styles: validatedData.styles,
            duration: validatedData.duration,
            volume: validatedData.volume,
            fade_in: validatedData.fade_in,
            fade_out: validatedData.fade_out,
            loop_mode: validatedData.loop_mode,
            stereo_mode: validatedData.stereo_mode
          },
          settings: validatedData
        }
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating music jingle:', error)
      return NextResponse.json({ error: 'Failed to create music jingle' }, { status: 500 })
    }

    console.log('✅ Music jingle saved to music_jingles table:', musicJingle.id)

    // Add to library_items table
    const { error: libraryError } = await supabase
      .from('library_items')
      .insert({
        user_id: user.id,
        content_type: 'music_jingles',
        content_id: musicJingle.id,
        date_added_to_library: new Date().toISOString()
      })

    if (libraryError) {
      console.error('Failed to add music jingle to library:', libraryError)
    } else {
      console.log(`✅ Music jingle ${musicJingle.id} added to library`)
    }

    return NextResponse.json({ 
      message: 'Music jingle generated and saved successfully', 
      musicJingle 
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Unexpected error in POST /api/music-jingles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
