import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { buildUgcAdsEnhancedPrompt } from '@/lib/utils/ugc-ads-prompt-builder'
import { generateVeo } from '@/lib/kie'

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
  
  // Custom fields for when user selects "custom" option
  custom_voice_style: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  custom_tone_of_delivery: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  custom_language: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  custom_brand_tone: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  custom_visual_focus: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  custom_core_angle: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  custom_camera_rhythm: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  custom_music_mood: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  
  // New fields
  aspect_ratio: z.enum(['9:16', '16:9', '1:1']).default('16:9'),
  duration: z.number().int().min(5).max(120).default(30),
  mode: z.enum(['single', 'dual', 'multi']).optional(),
  template: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  
  // Single mode fields
  contains_both: z.boolean().optional().default(false),
  image_description: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  
  // Character fields
  character_presence: z.enum(['voiceover', 'show', 'partial']).optional(),
  character_source: z.enum(['library', 'upload', 'describe']).optional(),
  selected_avatar_id: z.string().uuid().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  partial_type: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  
  // JSON fields (will be parsed from strings)
  character_descriptions: z.array(z.any()).optional(),
  partial_character: z.object({}).passthrough().optional(),
  dialog_lines: z.array(z.any()).optional(),
  
  // Dual mode fields
  two_image_mode: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  scene_scripts: z.array(z.any()).optional(),
  
  // Multi mode fields
  scene_description: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
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
    const { searchParams } = new URL(request.url)
    const isDebug = searchParams.get('debug') === '1'
    const echo = searchParams.get('echo') === '1'

    // Extract all form fields (accept both new UI names and legacy names)
    const rawConfig = formData.get('config')?.toString()
    const parsedConfig = rawConfig ? JSON.parse(rawConfig) : undefined

    // Brand
    let brand_name = formData.get('brand_name')?.toString() || ''
    let brand_prompt = formData.get('brand_prompt')?.toString() || ''
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
    
    // Dialogue - accept alt keys from new UI
    const dialogue_voice_type = (formData.get('dialogue_voice_type') || formData.get('voice_style'))?.toString()
    const dialogue_script = (formData.get('dialogue_script') || formData.get('script'))?.toString()
    const dialogue_tone_of_voice = (formData.get('dialogue_tone_of_voice') || formData.get('tone_of_delivery'))?.toString()
    const dialogue_language = (formData.get('dialogue_language') || formData.get('language'))?.toString() || 'en'
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
    const selected_product_id = (formData.get('selected_product_id') || formData.get('product_id'))?.toString()
    const generated_json = formData.get('generated_json')?.toString()
    
    // Extract custom field values
    const custom_voice_style = formData.get('custom_voice_style')?.toString()
    const custom_tone_of_delivery = formData.get('custom_tone_of_delivery')?.toString()
    const custom_language = formData.get('custom_language')?.toString()
    const custom_brand_tone = formData.get('custom_brand_tone')?.toString()
    const custom_visual_focus = formData.get('custom_visual_focus')?.toString()
    const custom_core_angle = formData.get('custom_core_angle')?.toString()
    const custom_camera_rhythm = formData.get('custom_camera_rhythm')?.toString()
    const custom_music_mood = formData.get('custom_music_mood')?.toString()

    // Extract new fields
    const aspectRatio = formData.get('aspectRatio')?.toString() || '16:9'
    const duration = parseInt(formData.get('duration')?.toString() || '30')
    const mode = formData.get('mode')?.toString()
    const template = formData.get('template')?.toString()

    // Single mode fields
    const containsBoth = (formData.get('contains_both') || formData.get('containsBoth'))?.toString() === 'true'
    const imageDescription = (formData.get('image_description') || formData.get('imageDescription'))?.toString()

    // Character fields
    const characterPresence = (formData.get('character_presence') || formData.get('characterPresence'))?.toString()
    const characterSource = (formData.get('character_source') || formData.get('characterSource'))?.toString()
    const selectedAvatarId = (formData.get('selected_avatar_id') || formData.get('avatar_id') || formData.get('selectedAvatarId'))?.toString()
    const partialType = (formData.get('partial_type') || formData.get('partialType'))?.toString()

    // JSON fields - parse from strings
    const characterDescriptionsString = (formData.get('character_descriptions') || formData.get('characterDescriptions'))?.toString()
    const characterDescriptions = characterDescriptionsString ? JSON.parse(characterDescriptionsString) : undefined

    const partialCharacterString = (formData.get('partial_character') || formData.get('partialCharacter'))?.toString()
    const partialCharacter = partialCharacterString ? JSON.parse(partialCharacterString) : undefined

    const dialogLinesString = (formData.get('dialog_lines') || formData.get('dialogLines'))?.toString()
    const dialogLines = dialogLinesString ? JSON.parse(dialogLinesString) : undefined

    // Dual mode fields
    const twoImageMode = formData.get('twoImageMode')?.toString()
    const sceneScriptsString = formData.get('sceneScripts')?.toString()
    const sceneScripts = sceneScriptsString ? JSON.parse(sceneScriptsString) : undefined

    // Multi mode fields
    const sceneDescription = formData.get('sceneDescription')?.toString()

    // Backfill brand fields from config or dialogue if missing (to satisfy schema)
    if (!brand_name) brand_name = parsedConfig?.brandDNA?.name || 'UGC Ad'
    if (!brand_prompt) brand_prompt = dialogue_script || parsedConfig?.productEssence?.heroBenefit || 'UGC ad generation'

    // Validate the data (we may still return success in debug mode)
    let validatedData: z.infer<typeof createUgcAdSchema> | null = null
    let validationErrors: any = null
    try {
      validatedData = createUgcAdSchema.parse({
      brand_name, brand_prompt, brand_tone, brand_color_code,
      product_name, product_hero_benefit, product_visual_focus, product_environment,
      product_materials, product_transformation_type,
      story_core_angle, story_persona, story_emotion_tone, story_pattern_interrupt_type, story_hook_framework,
      dialogue_voice_type, dialogue_script, dialogue_tone_of_voice, dialogue_language, dialogue_voice_asset_source,
      camera_rhythm, camera_movement_style, camera_cut_frequency, camera_ending_type,
      audio_sound_mode, audio_sound_emotion, audio_key_sounds,
      use_custom_product, selected_product_id, generated_json,
      custom_voice_style, custom_tone_of_delivery, custom_language,
      custom_brand_tone, custom_visual_focus, custom_core_angle,
      custom_camera_rhythm, custom_music_mood,
      aspect_ratio: aspectRatio,
      duration,
      mode,
      template,
      contains_both: containsBoth,
      image_description: imageDescription,
      character_presence: characterPresence,
      character_source: characterSource,
      selected_avatar_id: selectedAvatarId,
      partial_type: partialType,
      character_descriptions: characterDescriptions,
      partial_character: partialCharacter,
      dialog_lines: dialogLines,
      two_image_mode: twoImageMode,
      scene_scripts: sceneScripts,
      scene_description: sceneDescription,
      })
    } catch (e) {
      validationErrors = (e as z.ZodError).errors
    }

    // In debug mode, skip uploads and DB writes; still resolve assets and build prompt
    // Resolve assets from prioritized APIs
    let resolvedProduct: { title?: string; description?: string | null; imageUrl?: string | null } | undefined
    let resolvedAvatar: { name?: string | null; ethnicity?: string | null; gender?: string | null } | undefined
    if (selected_product_id) {
      const { data: prod } = await supabase
        .from('product_mockups')
        .select('id,title,description,image_url,imageUrl')
        .eq('id', selected_product_id)
        .maybeSingle()
      if (prod) {
        resolvedProduct = {
          title: (prod as any).title,
          description: (prod as any).description,
          imageUrl: (prod as any).image_url || (prod as any).imageUrl || null
        }
      }
    }
    if (selectedAvatarId) {
      const { data: av } = await supabase
        .from('avatars_personas')
        .select('id,name,ethnicity,gender')
        .eq('id', selectedAvatarId)
        .maybeSingle()
      if (av) {
        resolvedAvatar = {
          name: (av as any).name,
          ethnicity: (av as any).ethnicity,
          gender: (av as any).gender
        }
      }
    }

    // Build multi/dual images context from form data (debug path does not upload)
    const maxImages = mode === 'multi' ? 3 : 2
    const imagesDebug: Array<{ index: number; source?: string | null; purpose?: string | null; containsBoth?: boolean; description?: string | null }> = []
    for (let i = 1; i <= maxImages; i++) {
      const source = formData.get(`image${i}Source`)?.toString() || undefined
      const purpose = formData.get(`image${i}Purpose`)?.toString() || undefined
      const containsBothImage = (formData.get(`image${i}ContainsBoth`)?.toString() || '').toLowerCase() === 'true'
      const descriptionImage = formData.get(`image${i}Description`)?.toString() || undefined
      if (source || descriptionImage || purpose) {
        imagesDebug.push({ index: i, source: source || null, purpose: purpose || null, containsBoth: containsBothImage, description: descriptionImage || null })
      }
    }

    // Build enhanced prompt (server-side)
    const enhancedPrompt = buildUgcAdsEnhancedPrompt({
      config: parsedConfig,
      dialogue: {
        script: dialogue_script || undefined,
        voiceStyle: dialogue_voice_type || undefined,
        toneOfDelivery: dialogue_tone_of_voice || undefined,
        language: dialogue_language || undefined,
      },
      aspectRatio: aspectRatio as any,
      duration,
      assets: {
        product: resolvedProduct,
        avatar: resolvedAvatar,
      },
      containsBoth,
      imageDescription,
      twoImageMode: twoImageMode as any,
      sceneDescription: sceneDescription || undefined,
      images: imagesDebug.map(img => ({
        source: (img.source as any) || undefined,
        purpose: img.purpose || undefined,
        containsBoth: img.containsBoth,
        description: img.description || undefined,
      })),
      sceneScripts: sceneScripts as any,
    })

    if (isDebug) {
      return NextResponse.json({
        debug: true,
        enhancedPrompt,
        normalized:
          validatedData ?? null,
        inputs: {
          aspectRatio,
          duration,
          mode,
          template,
          containsBoth,
          imageDescription,
          characterPresence,
          characterSource,
          selectedAvatarId,
          selected_product_id,
        },
        assets: { resolvedProduct, resolvedAvatar },
        dual: {
          twoImageMode,
          sceneScripts,
          images: imagesDebug.slice(0, 2),
        },
        multi: {
          sceneDescription,
          images: imagesDebug,
        },
        validationErrors,
      }, { status: 200 })
    }

    // Handle file uploads (non-debug only)
    let brand_logo_path: string | null = null
    let custom_product_image_path: string | null = null
    let product_image_path: string | null = null
    let character_image_path: string | null = null

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

    // Upload product image (new UI direct upload)
    const productImageFile = formData.get('product_image') as File | null
    if (productImageFile) {
      const filePath = `renders/ugc-ads/${user.id}/products/${uuidv4()}-${productImageFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('dreamcut')
        .upload(filePath, productImageFile, { cacheControl: '3600', upsert: false })
      if (uploadError) {
        console.error('Error uploading product image:', uploadError)
        return NextResponse.json({ error: `Failed to upload product image: ${uploadError.message}` }, { status: 500 })
      }
      product_image_path = filePath
    }

    // Upload character image (new UI direct upload)
    const characterImageFile = formData.get('character_image') as File | null
    if (characterImageFile) {
      const filePath = `renders/ugc-ads/${user.id}/characters/${uuidv4()}-${characterImageFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('dreamcut')
        .upload(filePath, characterImageFile, { cacheControl: '3600', upsert: false })
      if (uploadError) {
        console.error('Error uploading character image:', uploadError)
        return NextResponse.json({ error: `Failed to upload character image: ${uploadError.message}` }, { status: 500 })
      }
      character_image_path = filePath
    }

    // validatedData is required for non-debug insert
    if (!validatedData) {
      return NextResponse.json({ error: 'Invalid request data', details: validationErrors }, { status: 400 })
    }

    // Handle dual/multi image uploads and metadata (if any)
    const collectedImages: Array<{ index: number; source?: string; purpose?: string; containsBoth?: boolean; description?: string; storage_path?: string }> = []
    const maxUploadImages = mode === 'multi' ? 3 : 2
    for (let i = 1; i <= maxUploadImages; i++) {
      const file = formData.get(`image${i}`) as File | null
      const source = formData.get(`image${i}Source`)?.toString() || undefined
      const purpose = formData.get(`image${i}Purpose`)?.toString() || undefined
      const containsBothImage = (formData.get(`image${i}ContainsBoth`)?.toString() || '').toLowerCase() === 'true'
      const descriptionImage = formData.get(`image${i}Description`)?.toString() || undefined

      let storage_path: string | undefined
      if (file) {
        const path = `renders/ugc-ads/${user.id}/dual/${uuidv4()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('dreamcut')
          .upload(path, file, { cacheControl: '3600', upsert: false })
        if (uploadError) {
          console.error(`Error uploading dual image ${i}:`, uploadError)
          return NextResponse.json({ error: `Failed to upload image ${i}: ${uploadError.message}` }, { status: 500 })
        }
        storage_path = path
      }

      if (source || descriptionImage || storage_path || purpose) {
        collectedImages.push({ index: i, source, purpose, containsBoth: containsBothImage, description: descriptionImage, storage_path })
      }
    }

    // Build imageUrls for KIE (must be publicly accessible)
    const imageUrls: string[] = []
    if (mode === 'single') {
      if (product_image_path) {
        const { data: signed } = await supabase.storage
          .from('dreamcut')
          .createSignedUrl(product_image_path, 3600)
        if (signed?.signedUrl) imageUrls.push(signed.signedUrl)
      }
    } else if (mode === 'dual') {
      // Use first two uploaded dual images, in order
      const dualImages = collectedImages
        .sort((a, b) => a.index - b.index)
        .slice(0, 2)
      for (const img of dualImages) {
        if (img.storage_path) {
          const { data: signed } = await supabase.storage
            .from('dreamcut')
            .createSignedUrl(img.storage_path, 3600)
          if (signed?.signedUrl) imageUrls.push(signed.signedUrl)
        }
      }
    } else if (mode === 'multi') {
      const multiImages = collectedImages
        .sort((a, b) => a.index - b.index)
        .slice(0, 3)
      for (const img of multiImages) {
        if (img.storage_path) {
          const { data: signed } = await supabase.storage
            .from('dreamcut')
            .createSignedUrl(img.storage_path, 3600)
          if (signed?.signedUrl) imageUrls.push(signed.signedUrl)
        }
      }
    }

    // Determine generationType and base model
    let generationType: 'TEXT_2_VIDEO' | 'FIRST_AND_LAST_FRAMES_2_VIDEO' | 'REFERENCE_2_VIDEO' | undefined
    if (mode === 'single') {
      generationType = imageUrls.length >= 1 ? 'FIRST_AND_LAST_FRAMES_2_VIDEO' : 'TEXT_2_VIDEO'
    } else if (mode === 'dual') {
      generationType = 'FIRST_AND_LAST_FRAMES_2_VIDEO'
    } else if (mode === 'multi') {
      generationType = 'REFERENCE_2_VIDEO'
    }

    // Prepare payload
    const kiePayloadPrimary = {
      prompt: enhancedPrompt,
      imageUrls: imageUrls.length ? imageUrls : undefined,
      model: generationType === 'REFERENCE_2_VIDEO' ? 'veo3_fast' as const : 'veo3' as const,
      generationType,
      aspectRatio: '16:9' as const,
      enableTranslation: true,
    }

    // Primary attempt with veo3 (quality)
    let kieTaskId: string | null = null
    try {
      const genRes = await generateVeo(kiePayloadPrimary)
      if (genRes.code === 200 && genRes.data?.taskId) {
        kieTaskId = genRes.data.taskId
      } else {
        console.error('[UGC] KIE generate returned non-200', genRes)
        if (echo) {
          return NextResponse.json({ error: genRes.msg || 'KIE non-200', enhancedPrompt, kiePayload: kiePayloadPrimary, provider: genRes }, { status: 200 })
        }
        throw new Error(genRes.msg || 'KIE generate returned non-200 code')
      }
    } catch (e) {
      console.error('[UGC] KIE primary attempt failed, falling back to veo3_fast', (e as Error).message)
      // Fallback to veo3_fast when allowed
      const kiePayloadFallback = { ...kiePayloadPrimary, model: 'veo3_fast' as const }
      const genRes = await generateVeo(kiePayloadFallback)
      if (genRes.code === 200 && genRes.data?.taskId) {
        kieTaskId = genRes.data.taskId
      } else {
        console.error('[UGC] KIE fallback also failed', genRes)
        if (echo) {
          return NextResponse.json({ error: genRes.msg || 'Failed to create KIE task', enhancedPrompt, kiePayload: kiePayloadFallback, provider: genRes }, { status: 200 })
        }
        return NextResponse.json({ error: genRes.msg || 'Failed to create KIE task' }, { status: 502 })
      }
    }

    // Create UGC ad (pending state)
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
        product_image_path,
        character_image_path,
        
        // Generation State
        status: 'pending',
        generated_video_url: null,
        storage_path: null,
        kie_task_id: kieTaskId,
        generated_json: validatedData.generated_json,
        
        // New fields
        aspect_ratio: validatedData.aspect_ratio,
        duration: validatedData.duration,
        mode: validatedData.mode,
        template: validatedData.template,
        
        // Single mode fields
        contains_both: validatedData.contains_both,
        image_description: validatedData.image_description,
        
        // Character fields
        character_presence: validatedData.character_presence,
        character_source: validatedData.character_source,
        selected_avatar_id: validatedData.selected_avatar_id,
        partial_type: validatedData.partial_type,
        character_descriptions: validatedData.character_descriptions,
        partial_character: validatedData.partial_character,
        dialog_lines: validatedData.dialog_lines,
        
        // Dual mode fields
        two_image_mode: validatedData.two_image_mode,
        scene_scripts: validatedData.scene_scripts,
        
        // Multi mode fields
        scene_description: validatedData.scene_description,
        
        // Metadata
        metadata: {
          generation_completed: false,
          file_uploads: {
            brand_logo: brand_logo_path ? true : false,
            custom_product: custom_product_image_path ? true : false
          },
          kie: {
            model_attempt: generationType === 'REFERENCE_2_VIDEO' ? 'veo3_fast' : 'veo3',
            generationType,
            imageUrlsCount: imageUrls.length,
          },
          requested_duration: duration,
        },
        content: {
          original_config: parsedConfig || {
            brand_name: validatedData.brand_name,
            brand_prompt: validatedData.brand_prompt,
            product_name: validatedData.product_name,
            story_core_angle: validatedData.story_core_angle
          },
          custom_fields: {
            voice_style: validatedData.custom_voice_style,
            tone_of_delivery: validatedData.custom_tone_of_delivery,
            language: validatedData.custom_language,
            brand_tone: validatedData.custom_brand_tone,
            visual_focus: validatedData.custom_visual_focus,
            core_angle: validatedData.custom_core_angle,
            camera_rhythm: validatedData.custom_camera_rhythm,
            music_mood: validatedData.custom_music_mood
          },
          prompt: {
            enhanced: enhancedPrompt
          },
          twoImageMode: validatedData.two_image_mode,
          sceneScripts: validatedData.scene_scripts,
          sceneDescription: validatedData.scene_description,
          images: collectedImages,
          kie: {
            taskId: kieTaskId,
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

    const successPayload = { message: 'UGC ad task started', ugcAd, taskId: kieTaskId }
    if (echo) {
      return NextResponse.json({ ...successPayload, enhancedPrompt, kiePayload: kiePayloadPrimary }, { status: 201 })
    }
    return NextResponse.json(successPayload, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Unexpected error in POST /api/ugc-ads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
