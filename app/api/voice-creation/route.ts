import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

// Cache for 30 seconds
export const revalidate = 30

// Validation schema for voice creation
const createVoiceCreationSchema = z.object({
  prompt: z.string().min(1),
  name: z.string().optional(),
  purpose: z.string().optional(),
  language: z.string().optional().default('English'),
  gender: z.string().optional(),
  age: z.string().optional(),
  accent: z.string().optional(),
  tone: z.string().optional(),
  pitch: z.number().min(0).max(100).optional().default(50),
  pacing: z.string().optional(),
  fidelity: z.string().optional(),
  mood: z.string().optional(),
  emotional_weight: z.number().min(0).max(100).optional().default(50),
  role: z.string().optional(),
  style: z.string().optional(),
  audio_quality: z.string().optional(),
  guidance_scale: z.number().min(0).max(100).optional().default(50),
  preview_text: z.string().optional(),
  brand_sync: z.boolean().optional().default(false),
  world_link: z.string().optional(),
  tone_match: z.number().min(0).max(100).optional().default(50),
  is_asmr_voice: z.boolean().optional().default(false),
  asmr_intensity: z.number().min(0).max(100).optional().default(50),
  asmr_triggers: z.array(z.string()).optional().default([]),
  asmr_background: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  created_at: z.string().optional(),
  content: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/voice-creation - Get user's voice creations
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
      .from('voices_creations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination (use range instead of limit to avoid conflicts)
    query = query.range(offset, offset + limit - 1)

    const { data: voiceCreations, error } = await query

    if (error) {
      console.error('Error fetching voice creations:', error)
      return NextResponse.json({ error: 'Failed to fetch voice creations' }, { status: 500 })
    }

    return NextResponse.json({ voiceCreations }, { 
      status: 200,
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
        'CDN-Cache-Control': 'max-age=30'
      }
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/voice-creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/voice-creation - Create new voice creation
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Voice creation API called')
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createVoiceCreationSchema.parse(body)

    console.log('📝 Voice creation data:', {
      prompt: validatedData.prompt,
      name: validatedData.name,
      purpose: validatedData.purpose,
      language: validatedData.language,
      gender: validatedData.gender,
      age: validatedData.age,
      accent: validatedData.accent,
      tone: validatedData.tone,
      pitch: validatedData.pitch,
      pacing: validatedData.pacing,
      fidelity: validatedData.fidelity,
      mood: validatedData.mood,
      emotional_weight: validatedData.emotional_weight,
      role: validatedData.role,
      style: validatedData.style,
      audio_quality: validatedData.audio_quality,
      guidance_scale: validatedData.guidance_scale,
      preview_text: validatedData.preview_text,
      brand_sync: validatedData.brand_sync,
      world_link: validatedData.world_link,
      tone_match: validatedData.tone_match,
      is_asmr_voice: validatedData.is_asmr_voice,
      asmr_intensity: validatedData.asmr_intensity,
      asmr_triggers: validatedData.asmr_triggers,
      asmr_background: validatedData.asmr_background,
      tags: validatedData.tags
    })

    // Generate unique ID for this generation
    const generationId = `vc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const generationTimestamp = new Date().toISOString()

    // For now, we'll simulate audio generation with placeholder URLs
    // In a real implementation, you would call an AI voice generation service
    const generatedAudioUrl = `https://example.com/generated_voice_${generationId}.mp3`
    const generatedStoragePath = `renders/voice-creation/${user.id}/generated/${uuidv4()}-generated_voice.mp3`

    console.log('🎵 Generated audio:', generatedAudioUrl)

    // Create voice creation
    const { data: voiceCreation, error } = await supabase
      .from('voices_creations')
      .insert({
        user_id: user.id,
        title: validatedData.name || `Voice_${Date.now()}`,
        description: validatedData.prompt,
        prompt: validatedData.prompt,
        
        // Voice Identity
        name: validatedData.name,
        purpose: validatedData.purpose,
        language: validatedData.language,
        gender: validatedData.gender,
        age: validatedData.age,
        accent: validatedData.accent,
        tone: validatedData.tone,
        pitch: validatedData.pitch,
        pacing: validatedData.pacing,
        fidelity: validatedData.fidelity,
        
        // Emotional DNA
        mood: validatedData.mood,
        emotional_weight: validatedData.emotional_weight,
        role: validatedData.role,
        style: validatedData.style,
        audio_quality: validatedData.audio_quality,
        guidance_scale: validatedData.guidance_scale,
        preview_text: validatedData.preview_text,
        
        // Brand / World Sync
        brand_sync: validatedData.brand_sync,
        world_link: validatedData.world_link,
        tone_match: validatedData.tone_match,
        
        // ASMR Voice Options
        is_asmr_voice: validatedData.is_asmr_voice,
        asmr_intensity: validatedData.asmr_intensity,
        asmr_triggers: validatedData.asmr_triggers,
        asmr_background: validatedData.asmr_background,
        
        // Generated Content
        generated_audio_path: generatedAudioUrl,
        storage_path: generatedStoragePath,
        
        // Metadata
        tags: validatedData.tags,
        status: 'completed',
        metadata: {
          generationTimestamp,
          generationId,
          prompt: validatedData.prompt,
          name: validatedData.name,
          purpose: validatedData.purpose,
          language: validatedData.language,
          gender: validatedData.gender,
          age: validatedData.age,
          accent: validatedData.accent,
          tone: validatedData.tone,
          pitch: validatedData.pitch,
          pacing: validatedData.pacing,
          fidelity: validatedData.fidelity,
          mood: validatedData.mood,
          emotional_weight: validatedData.emotional_weight,
          role: validatedData.role,
          style: validatedData.style,
          audio_quality: validatedData.audio_quality,
          guidance_scale: validatedData.guidance_scale,
          preview_text: validatedData.preview_text,
          brand_sync: validatedData.brand_sync,
          world_link: validatedData.world_link,
          tone_match: validatedData.tone_match,
          is_asmr_voice: validatedData.is_asmr_voice,
          asmr_intensity: validatedData.asmr_intensity,
          asmr_triggers: validatedData.asmr_triggers,
          asmr_background: validatedData.asmr_background,
          tags: validatedData.tags,
          generated_via: 'voice-creation'
        },
        content: {
          audio_url: generatedAudioUrl,
          generation_id: generationId,
          full_prompt: validatedData.prompt,
          settings: validatedData,
          created_at: validatedData.created_at || generationTimestamp
        }
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating voice creation:', error)
      return NextResponse.json({ error: 'Failed to create voice creation' }, { status: 500 })
    }

    console.log('✅ Voice creation saved to voices_creations table:', voiceCreation.id)

    // Add to library_items table
    const { error: libraryError } = await supabase
      .from('library_items')
      .insert({
        user_id: user.id,
        content_type: 'voices_creations',
        content_id: voiceCreation.id,
        date_added_to_library: new Date().toISOString()
      })

    if (libraryError) {
      console.error('Failed to add voice creation to library:', libraryError)
    } else {
      console.log(`✅ Voice creation ${voiceCreation.id} added to library`)
    }

    return NextResponse.json({ 
      message: 'Voice created and saved successfully', 
      voiceCreation 
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Unexpected error in POST /api/voice-creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
