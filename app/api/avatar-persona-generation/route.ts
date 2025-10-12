import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Comprehensive validation schema for avatar/persona generation
const avatarPersonaGenerationSchema = z.object({
  // Basic settings
  prompt: z.string().min(1).max(5000), // Increased to support detailed prompts
  imageCount: z.number().min(1).max(4).default(4),
  aspectRatio: z.enum(['1:1', '3:4', '4:5', '2:3', '16:9', '4:3', '9:16', '21:9']).default('1:1'),
  aiPromptEnabled: z.boolean().default(true),
  
  // Visual Style Stack
  artDirection: z.string().min(1),
  visualInfluence: z.string().min(1),
  lightingPreset: z.string().min(1),
  backgroundEnvironment: z.string().min(1),
  moodContext: z.string().min(1),
  
  // Identity & Role
  personaName: z.string().optional(),
  roleArchetype: z.enum(['Hero', 'Mentor', 'Creator', 'Explorer', 'Rebel', 'Sage', 'Mascot', 'Teacher']).optional(),
  ageRange: z.enum(['Teen', 'Adult', 'Elder', 'Ageless']).optional(),
  genderExpression: z.enum(['Female', 'Male', 'Non-binary', 'Custom']).optional(),
  emotionBias: z.number().min(0).max(100).default(50),
  
  // Physical Traits & Outfits
  bodyType: z.enum(['Slim', 'Athletic', 'Curvy', 'Stocky', 'Custom']).optional(),
  skinTone: z.string().optional(),
  hairStyle: z.string().optional(),
  hairColor: z.string().optional(),
  eyeColor: z.string().optional(),
  eyeShape: z.enum(['Almond', 'Round', 'Hooded', 'Upturned', 'Downturned', 'Monolid', 'Deep Set']).optional(),
  outfitCategory: z.enum(['Streetwear', 'Business', 'Armor', 'Fantasy', 'Uniform', 'Minimalist']).optional(),
  outfitPalette: z.string().optional(),
  accessories: z.array(z.string()).optional(),
  
  // Reference Images
  referenceImages: z.array(z.object({
    name: z.string(),
    size: z.number(),
    type: z.string()
  })).optional(),
  
  // Additional metadata
  metadata: z.record(z.any()).optional(),
  
  // Public/Private status
  isPublic: z.boolean().optional().default(true)
})

// GET /api/avatar-persona-generation - Get user's avatar/persona generations
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('avatars')
      .select(`
        id,
        title,
        persona_name,
        role_archetype,
        art_direction,
        visual_influence,
        mood_context,
        aspect_ratio,
        image_count,
        status,
        created_at,
        updated_at,
        content,
        metadata
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: avatars, error } = await query

    if (error) {
      console.error('❌ Error fetching avatars:', error)
      return NextResponse.json({ error: 'Failed to fetch avatars' }, { status: 500 })
    }

    return NextResponse.json({ avatars }, { status: 200 })
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/avatar-persona-generation - Create new avatar/persona generation
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
    const validatedData = avatarPersonaGenerationSchema.parse(body)

    // Create comprehensive avatar/persona generation record
    const { data: avatar, error } = await supabase
      .from('avatars')
      .insert({
        user_id: user.id,
        title: validatedData.personaName || `Avatar ${new Date().toLocaleDateString()}`,
        description: validatedData.prompt,
        
        // Identity & Role
        persona_name: validatedData.personaName,
        role_archetype: validatedData.roleArchetype,
        age_range: validatedData.ageRange,
        gender_expression: validatedData.genderExpression,
        emotion_bias: validatedData.emotionBias,
        
        // Physical Traits & Outfits
        body_type: validatedData.bodyType,
        skin_tone: validatedData.skinTone,
        hair_style: validatedData.hairStyle,
        hair_color: validatedData.hairColor,
        eye_color: validatedData.eyeColor,
        eye_shape: validatedData.eyeShape,
        outfit_category: validatedData.outfitCategory,
        outfit_palette: validatedData.outfitPalette,
        accessories: validatedData.accessories,
        
        // Visual Style Stack
        art_direction: validatedData.artDirection,
        visual_influence: validatedData.visualInfluence,
        lighting_preset: validatedData.lightingPreset,
        background_environment: validatedData.backgroundEnvironment,
        mood_context: validatedData.moodContext,
        
        // Generation Settings
        image_count: validatedData.imageCount,
        aspect_ratio: validatedData.aspectRatio,
        ai_prompt_enabled: validatedData.aiPromptEnabled,
        reference_images: validatedData.referenceImages,
        
        // Legacy fields (for backward compatibility)
        character_type: validatedData.roleArchetype,
        gender: validatedData.genderExpression,
        clothing_style: validatedData.outfitCategory,
        
        // Metadata and content
        content: {
          prompt: validatedData.prompt,
          generation_settings: {
            imageCount: validatedData.imageCount,
            aspectRatio: validatedData.aspectRatio,
            aiPromptEnabled: validatedData.aiPromptEnabled
          },
          visual_style_stack: {
            artDirection: validatedData.artDirection,
            visualInfluence: validatedData.visualInfluence,
            lightingPreset: validatedData.lightingPreset,
            backgroundEnvironment: validatedData.backgroundEnvironment,
            moodContext: validatedData.moodContext
          },
          identity_role: {
            personaName: validatedData.personaName,
            roleArchetype: validatedData.roleArchetype,
            ageRange: validatedData.ageRange,
            genderExpression: validatedData.genderExpression,
            emotionBias: validatedData.emotionBias
          },
          physical_traits: {
            bodyType: validatedData.bodyType,
            skinTone: validatedData.skinTone,
            hairStyle: validatedData.hairStyle,
            hairColor: validatedData.hairColor,
            eyeColor: validatedData.eyeColor,
            eyeShape: validatedData.eyeShape,
            outfitCategory: validatedData.outfitCategory,
            outfitPalette: validatedData.outfitPalette,
            accessories: validatedData.accessories
          },
          reference_images: validatedData.referenceImages
        },
        metadata: validatedData.metadata,
        generation_settings: {
          timestamp: new Date().toISOString(),
          version: '2.0',
          interface: 'avatar-persona-generator'
        },
        is_public: validatedData.isPublic,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating avatar/persona generation:', error)
      return NextResponse.json({ error: 'Failed to create avatar/persona generation' }, { status: 500 })
    }

    return NextResponse.json({ avatar }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/avatar-persona-generation/[id] - Update avatar/persona generation
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get avatar ID from URL
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const avatarId = pathParts[pathParts.length - 1]

    if (!avatarId) {
      return NextResponse.json({ error: 'Avatar ID is required' }, { status: 400 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = avatarPersonaGenerationSchema.partial().parse(body)

    // Update avatar/persona generation
    const { data: avatar, error } = await supabase
      .from('avatars')
      .update({
        // Update only provided fields
        ...(validatedData.personaName && { persona_name: validatedData.personaName }),
        ...(validatedData.roleArchetype && { role_archetype: validatedData.roleArchetype }),
        ...(validatedData.ageRange && { age_range: validatedData.ageRange }),
        ...(validatedData.genderExpression && { gender_expression: validatedData.genderExpression }),
        ...(validatedData.emotionBias !== undefined && { emotion_bias: validatedData.emotionBias }),
        ...(validatedData.bodyType && { body_type: validatedData.bodyType }),
        ...(validatedData.skinTone && { skin_tone: validatedData.skinTone }),
        ...(validatedData.hairStyle && { hair_style: validatedData.hairStyle }),
        ...(validatedData.hairColor && { hair_color: validatedData.hairColor }),
        ...(validatedData.eyeColor && { eye_color: validatedData.eyeColor }),
        ...(validatedData.eyeShape && { eye_shape: validatedData.eyeShape }),
        ...(validatedData.outfitCategory && { outfit_category: validatedData.outfitCategory }),
        ...(validatedData.outfitPalette && { outfit_palette: validatedData.outfitPalette }),
        ...(validatedData.accessories && { accessories: validatedData.accessories }),
        ...(validatedData.artDirection && { art_direction: validatedData.artDirection }),
        ...(validatedData.visualInfluence && { visual_influence: validatedData.visualInfluence }),
        ...(validatedData.lightingPreset && { lighting_preset: validatedData.lightingPreset }),
        ...(validatedData.backgroundEnvironment && { background_environment: validatedData.backgroundEnvironment }),
        ...(validatedData.moodContext && { mood_context: validatedData.moodContext }),
        ...(validatedData.imageCount && { image_count: validatedData.imageCount }),
        ...(validatedData.aspectRatio && { aspect_ratio: validatedData.aspectRatio }),
        ...(validatedData.aiPromptEnabled !== undefined && { ai_prompt_enabled: validatedData.aiPromptEnabled }),
        ...(validatedData.referenceImages && { reference_images: validatedData.referenceImages }),
        ...(validatedData.metadata && { metadata: validatedData.metadata }),
        updated_at: new Date().toISOString()
      })
      .eq('id', avatarId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating avatar/persona generation:', error)
      return NextResponse.json({ error: 'Failed to update avatar/persona generation' }, { status: 500 })
    }

    if (!avatar) {
      return NextResponse.json({ error: 'Avatar not found' }, { status: 404 })
    }

    return NextResponse.json({ avatar }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/avatar-persona-generation/[id] - Delete avatar/persona generation
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get avatar ID from URL
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const avatarId = pathParts[pathParts.length - 1]

    if (!avatarId) {
      return NextResponse.json({ error: 'Avatar ID is required' }, { status: 400 })
    }

    // Delete avatar/persona generation
    const { error } = await supabase
      .from('avatars')
      .delete()
      .eq('id', avatarId)
      .eq('user_id', user.id)

    if (error) {
      console.error('❌ Error deleting avatar/persona generation:', error)
      return NextResponse.json({ error: 'Failed to delete avatar/persona generation' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Avatar/persona generation deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
