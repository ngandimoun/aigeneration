import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

// Helper function to convert empty strings to null
const emptyStringToNull = <T>(value: T): T | null => {
  if (typeof value === 'string' && value === '') {
    return null
  }
  return value
}

// Comprehensive validation schema for avatar/persona generation
const avatarPersonaGenerationSchema = z.object({
  // Basic settings
  prompt: z.string().min(1).max(5000), // Increased to support detailed prompts
  aspectRatio: z.enum(['1:1', '3:4', '4:5', '2:3', '16:9', '4:3', '9:16', '21:9']).default('1:1'),
  aiPromptEnabled: z.boolean().default(true),
  
  // Visual Style Stack
  artDirection: z.string().optional(),
  visualInfluence: z.string().optional(),
  lightingPreset: z.string().optional(),
  backgroundEnvironment: z.string().optional(),
  moodContext: z.string().optional(),
  
  // Identity & Role
  personaName: z.string().optional(),
  roleArchetype: z.enum(['Hero', 'Mentor', 'Creator', 'Explorer', 'Rebel', 'Sage', 'Mascot', 'Teacher']).or(z.literal('')).optional(),
  ageRange: z.enum(['Teen', 'Adult', 'Elder', 'Ageless']).or(z.literal('')).optional(),
  genderExpression: z.enum(['Female', 'Male', 'Non-binary', 'Custom']).or(z.literal('')).optional(),
  emotionBias: z.number().min(0).max(100).default(50),
  
  // Physical Traits & Outfits
  bodyType: z.enum(['Slim', 'Athletic', 'Curvy', 'Stocky', 'Custom']).or(z.literal('')).optional(),
  skinTone: z.string().optional(),
  hairStyle: z.string().optional(),
  hairColor: z.string().optional(),
  eyeColor: z.string().optional(),
  eyeShape: z.enum(['Almond', 'Round', 'Hooded', 'Upturned', 'Downturned', 'Monolid', 'Deep Set']).or(z.literal('')).optional(),
  outfitCategory: z.enum(['Streetwear', 'Business', 'Armor', 'Fantasy', 'Uniform', 'Minimalist']).or(z.literal('')).optional(),
  outfitPalette: z.string().optional(),
  accessories: z.array(z.string()).optional(),
  
  // Reference Images (now handled as FormData files)
  referenceImages: z.array(z.object({
    name: z.string(),
    size: z.number(),
    type: z.string()
  })).optional(),
  
  // Additional metadata
  metadata: z.record(z.any()).optional()
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
      .from('avatars_personas')
      .select(`
        id,
        title,
        persona_name,
        role_archetype,
        art_direction,
        visual_influence,
        mood_context,
        aspect_ratio,
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

    // Parse form data instead of JSON
    const formData = await request.formData()
    
    // Extract form fields
    const personaName = formData.get('personaName')?.toString() || ''
    const prompt = formData.get('prompt')?.toString() || ''
    const aspectRatio = formData.get('aspectRatio')?.toString() || '1:1'
    const aiPromptEnabled = formData.get('aiPromptEnabled')?.toString() === 'true'
    const artDirection = formData.get('artDirection')?.toString() || null
    const visualInfluence = formData.get('visualInfluence')?.toString() || null
    const lightingPreset = formData.get('lightingPreset')?.toString() || null
    const backgroundEnvironment = formData.get('backgroundEnvironment')?.toString() || null
    const moodContext = formData.get('moodContext')?.toString() || null
    const roleArchetype = formData.get('roleArchetype')?.toString() || null
    const ageRange = formData.get('ageRange')?.toString() || null
    const genderExpression = formData.get('genderExpression')?.toString() || null
    const emotionBias = parseInt(formData.get('emotionBias')?.toString() || '50')
    const bodyType = formData.get('bodyType')?.toString() || null
    const skinTone = formData.get('skinTone')?.toString() || null
    const hairStyle = formData.get('hairStyle')?.toString() || null
    const hairColor = formData.get('hairColor')?.toString() || null
    const eyeColor = formData.get('eyeColor')?.toString() || null
    const eyeShape = formData.get('eyeShape')?.toString() || null
    const outfitCategory = formData.get('outfitCategory')?.toString() || null
    const outfitPalette = formData.get('outfitPalette')?.toString() || null
    const accessories = formData.get('accessories')?.toString() ? JSON.parse(formData.get('accessories')?.toString() || '[]') : []
    
    // Handle reference images upload
    const referenceImagePaths: string[] = []
    for (let i = 0; i < 3; i++) {
      const file = formData.get(`referenceImage_${i}`) as File | null
      if (file) {
        const filePath = `renders/avatars/${user.id}/references/${uuidv4()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('dreamcut')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error(`Error uploading reference image ${file.name}:`, uploadError)
          return NextResponse.json({ error: `Failed to upload reference image: ${uploadError.message}` }, { status: 500 })
        }
        referenceImagePaths.push(filePath)
      }
    }

    // Handle logo upload
    let logoImagePath: string | null = null
    const logoImage = formData.get('logoImage') as File | null
    if (logoImage) {
      const filePath = `renders/avatars/${user.id}/logo/${uuidv4()}-${logoImage.name}`
      const { error: uploadError } = await supabase.storage
        .from('dreamcut')
        .upload(filePath, logoImage, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading logo image:', uploadError)
        return NextResponse.json({ error: `Failed to upload logo image: ${uploadError.message}` }, { status: 500 })
      }
      logoImagePath = filePath
    }

    // Prepare metadata from form data
    const metadata = {
      logoPlacement: formData.get('logoPlacement')?.toString() || 'None',
      logoImage: logoImage ? {
        name: logoImage.name,
        size: logoImage.size,
        type: logoImage.type
      } : null
    }

    console.log('📥 Received avatar generation data:', {
      personaName,
      prompt,
      aspectRatio,
      referenceImagePaths,
      logoImagePath
    })

    // Placeholder for actual image generation logic (e.g., calling an external AI service)
    // For now, we'll simulate generated images
    const generatedImageUrls = [
      'https://example.com/generated_avatar_1.jpg',
      'https://example.com/generated_avatar_2.jpg',
      'https://example.com/generated_avatar_3.jpg',
      'https://example.com/generated_avatar_4.jpg',
    ]
    const generatedStoragePaths = [
      `renders/avatars/${user.id}/generated/${uuidv4()}-generated_1.jpg`,
      `renders/avatars/${user.id}/generated/${uuidv4()}-generated_2.jpg`,
      `renders/avatars/${user.id}/generated/${uuidv4()}-generated_3.jpg`,
      `renders/avatars/${user.id}/generated/${uuidv4()}-generated_4.jpg`,
    ]

    // Create comprehensive avatar/persona generation record
    const { data: avatar, error } = await supabase
      .from('avatars_personas')
      .insert({
        user_id: user.id,
        title: personaName || `Avatar ${new Date().toLocaleDateString()}`,
        description: prompt,
        prompt: prompt,
        
        // Identity & Role
        persona_name: emptyStringToNull(personaName),
        role_archetype: emptyStringToNull(roleArchetype),
        age_range: emptyStringToNull(ageRange),
        gender_expression: emptyStringToNull(genderExpression),
        emotion_bias: emotionBias,
        
        // Physical Traits & Outfits
        body_type: emptyStringToNull(bodyType),
        skin_tone: emptyStringToNull(skinTone),
        hair_style: emptyStringToNull(hairStyle),
        hair_color: emptyStringToNull(hairColor),
        eye_color: emptyStringToNull(eyeColor),
        eye_shape: emptyStringToNull(eyeShape),
        outfit_category: emptyStringToNull(outfitCategory),
        outfit_palette: emptyStringToNull(outfitPalette),
        accessories: accessories,
        
        // Visual Style Stack
        art_direction: emptyStringToNull(artDirection),
        visual_influence: emptyStringToNull(visualInfluence),
        lighting_preset: emptyStringToNull(lightingPreset),
        background_environment: emptyStringToNull(backgroundEnvironment),
        mood_context: emptyStringToNull(moodContext),
        
        // Generation Settings
        aspect_ratio: aspectRatio,
        ai_prompt_enabled: aiPromptEnabled,
        reference_images_paths: referenceImagePaths,
        logo_image_path: logoImagePath,
        generated_images: generatedImageUrls,
        storage_paths: generatedStoragePaths,
        
        // Metadata and content
        content: {
          prompt: prompt,
          generation_settings: {
            aspectRatio: aspectRatio,
            aiPromptEnabled: aiPromptEnabled
          },
          visual_style_stack: {
            artDirection: artDirection,
            visualInfluence: visualInfluence,
            lightingPreset: lightingPreset,
            backgroundEnvironment: backgroundEnvironment,
            moodContext: moodContext
          },
          identity_role: {
            personaName: personaName,
            roleArchetype: roleArchetype,
            ageRange: ageRange,
            genderExpression: genderExpression,
            emotionBias: emotionBias
          },
          physical_traits: {
            bodyType: bodyType,
            skinTone: skinTone,
            hairStyle: hairStyle,
            hairColor: hairColor,
            eyeColor: eyeColor,
            eyeShape: eyeShape,
            outfitCategory: outfitCategory,
            outfitPalette: outfitPalette,
            accessories: accessories
          },
          reference_images: referenceImagePaths
        },
        metadata: metadata,
        status: 'completed' // Assuming immediate completion for now
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating avatar/persona generation:', error)
      return NextResponse.json({ error: 'Failed to create avatar/persona generation' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Avatar/persona generated and saved successfully', avatar }, { status: 201 })
  } catch (error) {
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
      .from('avatars_personas')
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
        ...(validatedData.aspectRatio && { aspect_ratio: validatedData.aspectRatio }),
        ...(validatedData.aiPromptEnabled !== undefined && { ai_prompt_enabled: validatedData.aiPromptEnabled }),
        ...(validatedData.referenceImages && { reference_images_paths: validatedData.referenceImages }),
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
      .from('avatars_personas')
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
