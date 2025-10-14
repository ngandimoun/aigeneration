import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

// Cache for 30 seconds
export const revalidate = 30

// Helper to convert null to undefined for Zod optional()
const nullToUndefined = z.literal('null').transform(() => undefined);

// Validation schema for UGC ad creation
const createUgcAdSchema = z.object({
  // Brand DNA
  brand_name: z.string().min(1, "Brand name is required"),
  brand_prompt: z.string().min(1, "Brand prompt is required"),
  brand_tone: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  brand_color_code: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  
  // Product Essence
  product_name: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  product_hero_benefit: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  product_visual_focus: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  product_environment: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  product_materials: z.array(z.string()).optional(),
  product_transformation_type: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  
  // Story DNA
  story_core_angle: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  story_persona: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  story_emotion_tone: z.number().min(0).max(100).optional(),
  story_pattern_interrupt_type: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  story_hook_framework: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  
  // Dialogue DNA
  dialogue_voice_type: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  dialogue_script: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  dialogue_tone_of_voice: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  dialogue_language: z.string().optional().default('en'),
  dialogue_voice_asset_source: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  
  // Camera DNA
  camera_rhythm: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  camera_movement_style: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  camera_cut_frequency: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  camera_ending_type: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  
  // Audio DNA
  audio_sound_mode: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  audio_sound_emotion: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  audio_key_sounds: z.array(z.string()).optional(),
  
  // Product Source
  use_custom_product: z.boolean().optional().default(false),
  selected_product_id: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  
  // Generation State
  generated_json: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
})

// GET /api/ugc-ads - Get user's UGC ads
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
      .from('ugc_ads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination (use range instead of limit to avoid conflicts)
    query = query.range(offset, offset + limit - 1)

    const { data: ugcAds, error } = await query

    if (error) {
      console.error('Error fetching UGC ads:', error)
      return NextResponse.json({ error: 'Failed to fetch UGC ads' }, { status: 500 })
    }

    return NextResponse.json({ ugcAds }, { 
      status: 200,
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
        'CDN-Cache-Control': 'max-age=30'
      }
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/ugc-ads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/ugc-ads - Create new UGC ad
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse FormData for file uploads
    const formData = await request.formData()

    // Extract all form fields
    const brand_name = formData.get('brand_name')?.toString() || ''
    const brand_prompt = formData.get('brand_prompt')?.toString() || ''
    const brand_tone = formData.get('brand_tone')?.toString()
    const brand_color_code = formData.get('brand_color_code')?.toString()
    
    const product_name = formData.get('product_name')?.toString()
    const product_hero_benefit = formData.get('product_hero_benefit')?.toString()
    const product_visual_focus = formData.get('product_visual_focus')?.toString()
    const product_environment = formData.get('product_environment')?.toString()
    const product_materialsString = formData.get('product_materials')?.toString()
    const product_materials = product_materialsString ? JSON.parse(product_materialsString) : []
    const product_transformation_type = formData.get('product_transformation_type')?.toString()
    
    const story_core_angle = formData.get('story_core_angle')?.toString()
    const story_persona = formData.get('story_persona')?.toString()
    const story_emotion_tone = parseInt(formData.get('story_emotion_tone')?.toString() || '50')
    const story_pattern_interrupt_type = formData.get('story_pattern_interrupt_type')?.toString()
    const story_hook_framework = formData.get('story_hook_framework')?.toString()
    
    const dialogue_voice_type = formData.get('dialogue_voice_type')?.toString()
    const dialogue_script = formData.get('dialogue_script')?.toString()
    const dialogue_tone_of_voice = formData.get('dialogue_tone_of_voice')?.toString()
    const dialogue_language = formData.get('dialogue_language')?.toString() || 'en'
    const dialogue_voice_asset_source = formData.get('dialogue_voice_asset_source')?.toString()
    
    const camera_rhythm = formData.get('camera_rhythm')?.toString()
    const camera_movement_style = formData.get('camera_movement_style')?.toString()
    const camera_cut_frequency = formData.get('camera_cut_frequency')?.toString()
    const camera_ending_type = formData.get('camera_ending_type')?.toString()
    
    const audio_sound_mode = formData.get('audio_sound_mode')?.toString()
    const audio_sound_emotion = formData.get('audio_sound_emotion')?.toString()
    const audio_key_soundsString = formData.get('audio_key_sounds')?.toString()
    const audio_key_sounds = audio_key_soundsString ? JSON.parse(audio_key_soundsString) : []
    
    const use_custom_product = formData.get('use_custom_product')?.toString() === 'true'
    const selected_product_id = formData.get('selected_product_id')?.toString()
    const generated_json = formData.get('generated_json')?.toString()

    // Validate the data
    const validatedData = createUgcAdSchema.parse({
      brand_name, brand_prompt, brand_tone, brand_color_code,
      product_name, product_hero_benefit, product_visual_focus, product_environment,
      product_materials, product_transformation_type,
      story_core_angle, story_persona, story_emotion_tone, story_pattern_interrupt_type, story_hook_framework,
      dialogue_voice_type, dialogue_script, dialogue_tone_of_voice, dialogue_language, dialogue_voice_asset_source,
      camera_rhythm, camera_movement_style, camera_cut_frequency, camera_ending_type,
      audio_sound_mode, audio_sound_emotion, audio_key_sounds,
      use_custom_product, selected_product_id, generated_json
    })

    // Handle file uploads
    let brand_logo_path: string | null = null
    let custom_product_image_path: string | null = null

    // Upload brand logo if provided
    const brandLogoFile = formData.get('brand_logo') as File | null
    if (brandLogoFile) {
      const filePath = `renders/ugc-ads/${user.id}/logos/${uuidv4()}-${brandLogoFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('dreamcut')
        .upload(filePath, brandLogoFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading brand logo:', uploadError)
        return NextResponse.json({ error: `Failed to upload brand logo: ${uploadError.message}` }, { status: 500 })
      }
      brand_logo_path = filePath
    }

    // Upload custom product image if provided
    const customProductFile = formData.get('custom_product_image') as File | null
    if (customProductFile) {
      const filePath = `renders/ugc-ads/${user.id}/products/${uuidv4()}-${customProductFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('dreamcut')
        .upload(filePath, customProductFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading custom product image:', uploadError)
        return NextResponse.json({ error: `Failed to upload custom product image: ${uploadError.message}` }, { status: 500 })
      }
      custom_product_image_path = filePath
    }

    // Simulate generated video
    const generatedVideoFileName = `${uuidv4()}-ugc-ad.mp4`
    const generatedStoragePath = `renders/ugc-ads/${user.id}/generated/${generatedVideoFileName}`
    const generatedVideoUrl = `https://example.com/generated_ugc_ad/${generatedVideoFileName}` // Placeholder URL

    // Create UGC ad
    const { data: ugcAd, error } = await supabase
      .from('ugc_ads')
      .insert({
        user_id: user.id,
        // Brand DNA
        brand_name: validatedData.brand_name,
        brand_prompt: validatedData.brand_prompt,
        brand_tone: validatedData.brand_tone,
        brand_color_code: validatedData.brand_color_code,
        brand_logo_path,
        
        // Product Essence
        product_name: validatedData.product_name,
        product_hero_benefit: validatedData.product_hero_benefit,
        product_visual_focus: validatedData.product_visual_focus,
        product_environment: validatedData.product_environment,
        product_materials: validatedData.product_materials,
        product_transformation_type: validatedData.product_transformation_type,
        
        // Story DNA
        story_core_angle: validatedData.story_core_angle,
        story_persona: validatedData.story_persona,
        story_emotion_tone: validatedData.story_emotion_tone,
        story_pattern_interrupt_type: validatedData.story_pattern_interrupt_type,
        story_hook_framework: validatedData.story_hook_framework,
        
        // Dialogue DNA
        dialogue_voice_type: validatedData.dialogue_voice_type,
        dialogue_script: validatedData.dialogue_script,
        dialogue_tone_of_voice: validatedData.dialogue_tone_of_voice,
        dialogue_language: validatedData.dialogue_language,
        dialogue_voice_asset_source: validatedData.dialogue_voice_asset_source,
        
        // Camera DNA
        camera_rhythm: validatedData.camera_rhythm,
        camera_movement_style: validatedData.camera_movement_style,
        camera_cut_frequency: validatedData.camera_cut_frequency,
        camera_ending_type: validatedData.camera_ending_type,
        
        // Audio DNA
        audio_sound_mode: validatedData.audio_sound_mode,
        audio_sound_emotion: validatedData.audio_sound_emotion,
        audio_key_sounds: validatedData.audio_key_sounds,
        
        // Product Source
        use_custom_product: validatedData.use_custom_product,
        selected_product_id: validatedData.selected_product_id,
        custom_product_image_path,
        
        // Generation State
        status: 'completed', // Assuming immediate completion for now
        generated_video_url: generatedVideoUrl,
        storage_path: generatedStoragePath,
        generated_json: validatedData.generated_json,
        
        // Metadata
        metadata: {
          generation_completed: true,
          file_uploads: {
            brand_logo: brand_logo_path ? true : false,
            custom_product: custom_product_image_path ? true : false
          }
        },
        content: {
          original_config: {
            brand_name: validatedData.brand_name,
            brand_prompt: validatedData.brand_prompt,
            product_name: validatedData.product_name,
            story_core_angle: validatedData.story_core_angle
          }
        }
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating UGC ad:', error)
      return NextResponse.json({ error: 'Failed to create UGC ad' }, { status: 500 })
    }

    // Add to library_items with correct schema
    const { error: libraryError } = await supabase
      .from('library_items')
      .insert([
        {
          user_id: user.id,
          content_type: 'ugc_ads',  // Changed from item_type
          content_id: ugcAd.id,     // Changed from item_id
          // Removed: title, description, image_url, created_at (not in schema)
        },
      ])

    if (libraryError) {
      console.error('Error inserting into library_items:', libraryError)
      // Decide if this should be a hard fail or just log the error
    }

    return NextResponse.json({ message: 'UGC ad generated and saved successfully', ugcAd }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Unexpected error in POST /api/ugc-ads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
