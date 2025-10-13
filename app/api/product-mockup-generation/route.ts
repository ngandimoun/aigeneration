import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fal } from '@fal-ai/client'
import { STYLE_MAP } from '@/lib/styles/style-map'
import { ProductMockupGenerationRequest, ProductMockupGenerationResult } from '@/lib/types/product-mockup'
import { downloadAndUploadMultipleImages } from '@/lib/storage/download-and-upload'
import { v4 as uuidv4 } from 'uuid'

// Helper function to convert null to undefined
const nullToUndefined = (value: string | null): string | undefined => {
  return value === null ? undefined : value
}

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_KEY,
})

// Validation schema for product mockup generation
const productMockupGenerationSchema = z.object({
  // Basic Settings
  prompt: z.string().min(1).max(5000), // Increased to support detailed prompts
  imageCount: z.number().min(1).max(4).default(4),
  aspectRatio: z.enum(['1:1', '4:5', '16:9', '9:16', '2:1', '3:4', '2:3', '4:3', '3:2']).default('1:1'),
  
  // Product Photos (will be handled as base64 strings)
  productPhotos: z.array(z.string()).max(4).optional().default([]), // base64 encoded images
  
  // Logo Upload
  logoFile: z.string().optional(), // base64 encoded logo
  logoUsagePrompt: z.string().max(500).optional(),
  
  // Art Direction & Visual Influence
  artDirection: z.string().optional(),
  visualInfluence: z.string().optional(),
  lightingPreset: z.string().optional(),
  backgroundEnvironment: z.string().optional(),
  moodContext: z.string().optional(),
  
  // Composition & Branding
  compositionTemplate: z.enum(['Centered Hero', 'Rule of Thirds', 'Floating Object', 'Flat Lay', 'Collage']).default('Centered Hero'),
  objectCount: z.union([z.number(), z.enum(['1', '2', '3'])]).default(1).transform(val => typeof val === 'number' ? val as 1 | 2 | 3 : parseInt(val) as 1 | 2 | 3),
  shadowType: z.enum(['Soft', 'Hard', 'Floating', 'Mirror']).default('Soft'),
  logoPlacement: z.enum(['Auto', 'Top Left', 'Top Right', 'Bottom Left', 'Bottom Right', 'Center']).default('Auto'),
  
  // Text & CTA Overlay
  headline: z.string().optional(),
  subtext: z.string().optional(),
  ctaText: z.string().optional(),
  fontFamily: z.enum(['serif', 'sans', 'condensed', 'rounded']).default('sans'),
  fontWeight: z.enum(['light', 'normal', 'medium', 'bold']).default('normal'),
  textCase: z.enum(['uppercase', 'title', 'sentence']).default('sentence'),
  letterSpacing: z.number().default(0),
  lineHeight: z.number().default(1.2),
  textColor: z.string().default('#000000'),
  textAlignment: z.enum(['left', 'center', 'right']).default('center'),
  textEffects: z.array(z.string()).default([]),
  
  // Advanced Typography
  highlightStyle: z.enum(['underline', 'boxed', 'glow', 'gradient', 'none']).default('none'),
  accentElement: z.enum(['line', 'shape', 'dot', 'none']).default('none'),
  brilliance: z.number().default(0),
  frostedGlass: z.boolean().default(false),
  dropShadowIntensity: z.number().default(0),
  motionAccent: z.enum(['fade', 'slide', 'sweep', 'none']).default('none'),
  
  // Alignment & Positioning
  layoutMode: z.enum(['centered', 'left', 'right', 'split']).default('centered'),
  verticalPosition: z.number().default(50),
  horizontalOffset: z.number().default(0),
  smartAnchor: z.boolean().default(true),
  safeZones: z.boolean().default(true),
  
  // Casting & Multiplicity
  useAvatars: z.boolean().default(false),
  selectedAvatarId: z.string().optional(),
  useBasicAvatar: z.boolean().optional(),
  basicAvatar: z.object({
    age: z.enum(['18-25', '26-35', '36-45', '46-55', '55+']),
    race: z.enum(['Caucasian', 'African', 'Asian', 'Hispanic', 'Middle Eastern', 'Mixed', 'Other']),
    gender: z.enum(['Male', 'Female', 'Non-binary']),
    description: z.string().max(500).optional()
  }).optional(),
  avatarRole: z.enum(['Model', 'User', 'Mascot', 'Spokesperson']).default('Model'),
  avatarInteraction: z.enum(['Holding', 'Wearing', 'Using', 'Observing']).default('Holding'),
  productMultiplicity: z.enum(['Single', 'Lineup', 'Bundle']).default('Single'),
  angleVarietyCount: z.union([z.number(), z.enum(['1', '2', '3', '4', '5'])]).default(1).transform(val => typeof val === 'number' ? val as 1 | 2 | 3 | 4 | 5 : parseInt(val) as 1 | 2 | 3 | 4 | 5),
  
  // Platform Target
  platformTarget: z.enum(['Instagram', 'Facebook', 'TikTok', 'YouTube', 'Banner', 'Print']).optional(),
  
  // Brand Colors
  brandColors: z.object({
    primary: z.string().default('#3B82F6'),
    secondary: z.string().default('#10B981'),
    accent: z.string().default('#F59E0B')
  }).optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional()
})

// Build comprehensive prompt from all settings
function buildProductMockupPrompt(request: ProductMockupGenerationRequest): string {
  const {
    prompt,
    logoFile,
    logoUsagePrompt,
    artDirection,
    visualInfluence,
    lightingPreset,
    backgroundEnvironment,
    moodContext,
    compositionTemplate,
    objectCount,
    shadowType,
    useAvatars,
    useBasicAvatar,
    basicAvatar,
    avatarRole,
    avatarInteraction,
    productMultiplicity,
    headline,
    subtext,
    ctaText,
    fontFamily,
    fontWeight,
    textCase,
    letterSpacing,
    lineHeight,
    textColor,
    textAlignment,
    textEffects,
    highlightStyle,
    accentElement,
    brilliance,
    frostedGlass,
    dropShadowIntensity,
    motionAccent,
    layoutMode,
    verticalPosition,
    horizontalOffset,
    smartAnchor,
    safeZones,
    platformTarget
  } = request

  // Get style information from STYLE_MAP
  const styleInfo = artDirection ? STYLE_MAP[artDirection]?.find((inf: any) => inf.label === visualInfluence) : undefined
  const moodInfo = styleInfo?.moodContexts.find((mc: any) => mc.name === moodContext)

  let promptParts = [
    // Base description
    prompt,
    
    // Art direction and visual style
    `${artDirection} style, ${visualInfluence} approach`,
    
    // Lighting and background
    `${lightingPreset} lighting, ${backgroundEnvironment} background`,
    
    // Mood and atmosphere
    moodInfo ? `${moodContext} mood with ${moodInfo.effect.temp || 'neutral'} temperature` : `${moodContext} mood`,
    
    // Composition
    `${compositionTemplate} composition`,
    `${objectCount} ${productMultiplicity.toLowerCase()} product${objectCount > 1 ? 's' : ''}`,
    `${shadowType.toLowerCase()} shadow`,
    
    // Avatar integration
    useAvatars ? (() => {
      if (useBasicAvatar && basicAvatar) {
        return `${avatarRole} (${basicAvatar.age} ${basicAvatar.gender.toLowerCase()} ${basicAvatar.race.toLowerCase()}, ${basicAvatar.description}) ${avatarInteraction.toLowerCase()} the product`
      } else {
        return `${avatarRole} ${avatarInteraction.toLowerCase()} the product`
      }
    })() : 'product-focused',
    
    // Logo integration
    ...(logoFile && logoUsagePrompt ? [`logo placement: ${logoUsagePrompt}`] : []),
    
    // Text overlay with advanced typography
    ...(headline ? [`headline: "${headline}" (${textCase} case, ${fontFamily} font, ${fontWeight} weight, letter-spacing: ${letterSpacing}px, line-height: ${lineHeight})`] : []),
    ...(subtext ? [`subtext: "${subtext}"`] : []),
    ...(ctaText ? [`CTA: "${ctaText}"`] : []),
    
    // Advanced typography effects
    ...(highlightStyle !== 'none' ? [`highlight style: ${highlightStyle}`] : []),
    ...(accentElement !== 'none' ? [`accent element: ${accentElement}`] : []),
    ...(brilliance > 0 ? [`brilliance effect: ${brilliance}%`] : []),
    ...(frostedGlass ? ['frosted glass background'] : []),
    ...(dropShadowIntensity > 0 ? [`drop shadow: ${dropShadowIntensity}%`] : []),
    ...(motionAccent !== 'none' ? [`motion accent: ${motionAccent}`] : []),
    
    // Layout and positioning
    `layout mode: ${layoutMode}`,
    `text alignment: ${textAlignment}`,
    `vertical position: ${verticalPosition}%`,
    `horizontal offset: ${horizontalOffset}px`,
    ...(smartAnchor ? ['smart anchor enabled'] : []),
    ...(safeZones ? ['platform safe zones enabled'] : []),
    
    // Platform optimization
    ...(platformTarget ? [`optimized for ${platformTarget}`] : []),
    
    // Quality and technical specs
    'high quality, professional product photography, commercial grade, detailed, sharp focus',
    
    // Style consistency
    'consistent lighting, proper exposure, clean composition, brand-appropriate styling'
  ]

  return promptParts.filter(Boolean).join(', ')
}

// Convert aspect ratio to dimensions
function getImageDimensions(aspectRatio: string): { width: number; height: number } {
  const ratioMap: Record<string, { width: number; height: number }> = {
    '1:1': { width: 1024, height: 1024 },
    '4:5': { width: 1024, height: 1280 },
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '2:1': { width: 1920, height: 960 },
    '3:4': { width: 1024, height: 1365 },
    '2:3': { width: 1024, height: 1536 },
    '4:3': { width: 1365, height: 1024 },
    '3:2': { width: 1536, height: 1024 }
  }
  
  return ratioMap[aspectRatio] || { width: 1024, height: 1024 }
}

// POST /api/product-mockup-generation - Generate product mockups
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Product mockup generation API called')
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data instead of JSON
    const formData = await request.formData()
    
    // Extract form fields
    const prompt = formData.get('prompt')?.toString() || ''
    const title = formData.get('title')?.toString() || ''
    const description = formData.get('description')?.toString() || ''
    const aspectRatio = formData.get('aspectRatio')?.toString() || '1:1'
    const artDirection = formData.get('artDirection')?.toString() || null
    const visualInfluence = formData.get('visualInfluence')?.toString() || null
    const lightingPreset = formData.get('lightingPreset')?.toString() || null
    const backgroundEnvironment = formData.get('backgroundEnvironment')?.toString() || null
    const moodContext = formData.get('moodContext')?.toString() || null
    const compositionTemplate = formData.get('compositionTemplate')?.toString() || 'Centered Hero'
    const objectCount = parseInt(formData.get('objectCount')?.toString() || '1') as 1 | 2 | 3
    const shadowType = formData.get('shadowType')?.toString() || 'Soft'
    const logoPlacement = formData.get('logoPlacement')?.toString() || 'Auto'
    const headline = formData.get('headline')?.toString() || null
    const subtext = formData.get('subtext')?.toString() || null
    const ctaText = formData.get('ctaText')?.toString() || null
    const fontFamily = formData.get('fontFamily')?.toString() || 'sans'
    const fontWeight = formData.get('fontWeight')?.toString() || 'normal'
    const textCase = formData.get('textCase')?.toString() || 'sentence'
    const letterSpacing = parseFloat(formData.get('letterSpacing')?.toString() || '0')
    const lineHeight = parseFloat(formData.get('lineHeight')?.toString() || '1.2')
    const textColor = formData.get('textColor')?.toString() || '#000000'
    const textAlignment = formData.get('textAlignment')?.toString() || 'center'
    const textEffects = formData.get('textEffects')?.toString() ? JSON.parse(formData.get('textEffects')?.toString() || '[]') : []
    const highlightStyle = formData.get('highlightStyle')?.toString() || 'none'
    const accentElement = formData.get('accentElement')?.toString() || 'none'
    const brilliance = parseInt(formData.get('brilliance')?.toString() || '0')
    const frostedGlass = formData.get('frostedGlass')?.toString() === 'true'
    const dropShadowIntensity = parseInt(formData.get('dropShadowIntensity')?.toString() || '0')
    const motionAccent = formData.get('motionAccent')?.toString() || 'none'
    const layoutMode = formData.get('layoutMode')?.toString() || 'centered'
    const verticalPosition = parseInt(formData.get('verticalPosition')?.toString() || '50')
    const horizontalOffset = parseInt(formData.get('horizontalOffset')?.toString() || '0')
    const smartAnchor = formData.get('smartAnchor')?.toString() === 'true'
    const safeZones = formData.get('safeZones')?.toString() === 'true'
    const useAvatars = formData.get('useAvatars')?.toString() === 'true'
    const selectedAvatarId = formData.get('selectedAvatarId')?.toString() || null
    const useBasicAvatar = formData.get('useBasicAvatar')?.toString() === 'true'
    const basicAvatar = formData.get('basicAvatar')?.toString() ? JSON.parse(formData.get('basicAvatar')?.toString() || '{}') : null
    const avatarRole = formData.get('avatarRole')?.toString() || 'Model'
    const avatarInteraction = formData.get('avatarInteraction')?.toString() || 'Holding'
    const productMultiplicity = formData.get('productMultiplicity')?.toString() || 'Single'
    const angleVarietyCount = parseInt(formData.get('angleVarietyCount')?.toString() || '1') as 1 | 2 | 3 | 4 | 5
    const platformTarget = formData.get('platformTarget')?.toString() || null
    const brandColors = formData.get('brandColors')?.toString() ? JSON.parse(formData.get('brandColors')?.toString() || '{}') : { primary: '#3B82F6', secondary: '#10B981', accent: '#F59E0B' }
    const metadata = formData.get('metadata')?.toString() ? JSON.parse(formData.get('metadata')?.toString() || '{}') : {}

    // Handle product photos upload
    const productPhotosPaths: string[] = []
    for (let i = 0; i < 2; i++) {
      const file = formData.get(`productPhoto_${i}`) as File | null
      if (file) {
        const filePath = `renders/product-mockups/${user.id}/references/${uuidv4()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('dreamcut')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error(`Error uploading product photo ${file.name}:`, uploadError)
          return NextResponse.json({ error: `Failed to upload product photo: ${uploadError.message}` }, { status: 500 })
        }
        productPhotosPaths.push(filePath)
      }
    }

    // Handle logo upload
    let logoImagePath: string | null = null
    const logoFile = formData.get('logoFile') as File | null
    if (logoFile) {
      const filePath = `renders/product-mockups/${user.id}/logo/${uuidv4()}-${logoFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('dreamcut')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading logo file:', uploadError)
        return NextResponse.json({ error: `Failed to upload logo: ${uploadError.message}` }, { status: 500 })
      }
      logoImagePath = filePath
    }

    // Create validated data object for compatibility with existing code
    const validatedData: ProductMockupGenerationRequest = {
      prompt,
      aspectRatio: aspectRatio as any,
      artDirection: nullToUndefined(artDirection),
      visualInfluence: nullToUndefined(visualInfluence),
      lightingPreset: nullToUndefined(lightingPreset),
      backgroundEnvironment: nullToUndefined(backgroundEnvironment),
      moodContext: nullToUndefined(moodContext),
      compositionTemplate: compositionTemplate as any,
      objectCount,
      shadowType: shadowType as any,
      logoPlacement: logoPlacement as any,
      headline: nullToUndefined(headline),
      subtext: nullToUndefined(subtext),
      ctaText: nullToUndefined(ctaText),
      fontFamily: fontFamily as any,
      fontWeight: fontWeight as any,
      textCase: textCase as any,
      letterSpacing,
      lineHeight,
      textColor,
      textAlignment: textAlignment as any,
      textEffects,
      highlightStyle: highlightStyle as any,
      accentElement: accentElement as any,
      brilliance,
      frostedGlass,
      dropShadowIntensity,
      motionAccent: motionAccent as any,
      layoutMode: layoutMode as any,
      verticalPosition,
      horizontalOffset,
      smartAnchor,
      safeZones,
      useAvatars,
      selectedAvatarId: nullToUndefined(selectedAvatarId),
      useBasicAvatar,
      basicAvatar,
      avatarRole: avatarRole as any,
      avatarInteraction: avatarInteraction as any,
      productMultiplicity: productMultiplicity as any,
      angleVarietyCount,
      platformTarget: nullToUndefined(platformTarget) as any,
      brandColors,
      metadata
    }

    console.log('📝 Product mockup generation data:', {
      prompt: validatedData.prompt,
      aspectRatio: validatedData.aspectRatio,
      artDirection: validatedData.artDirection,
      visualInfluence: validatedData.visualInfluence,
      useAvatars: validatedData.useAvatars,
      productPhotos: productPhotosPaths.length
    })

    // Build comprehensive prompt
    const fullPrompt = buildProductMockupPrompt(validatedData)
    console.log('📏 Full prompt length:', fullPrompt.length, 'characters')
    
    // Get image dimensions
    const dimensions = getImageDimensions(validatedData.aspectRatio)
    console.log('📐 Image dimensions:', dimensions)

    // Determine which model to use based on whether we have product photos
    const hasProductPhotos = productPhotosPaths.length > 0
    const model = hasProductPhotos 
      ? 'fal-ai/flux/dev' // Use Flux for image-to-image generation
      : 'fal-ai/flux/dev' // Use Flux for text-to-image generation

    console.log('🤖 Using model:', model)

    // Prepare the request parameters
    const requestParams: any = {
      input: {
        prompt: fullPrompt,
        image_size: { width: dimensions.width, height: dimensions.height },
        num_inference_steps: 28,
        enable_safety_checker: true,
        seed: Math.floor(Math.random() * 1000000) // Random seed for variety
      }
    }

    // Add product photos if available (for image-to-image generation)
    if (hasProductPhotos && model === 'fal-ai/flux/dev') {
      // For now, we'll generate without using the uploaded photos as reference
      // In a full implementation, you'd want to download and use the uploaded photos
      console.log('🖼️ Product photos uploaded, but using text-to-image generation for now')
    }

    console.log('⏳ Calling fal.ai API...')
    const startTime = Date.now()

    // Generate images
    const result = await fal.subscribe(model, requestParams)

    const endTime = Date.now()
    console.log(`✅ fal.ai API completed in ${endTime - startTime}ms`)
    console.log('📊 Generated', result.data.images?.length || 0, 'images')

    // Extract image URLs
    const imageUrls = result.data.images?.map((img: any) => img.url) || []
    console.log('🔗 Extracted image URLs:', imageUrls)

    // Generate unique ID for this generation
    const generationId = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Download and upload images to Supabase Storage
    console.log('📥 Downloading and uploading images to Supabase Storage...')
    const uploadResults = await downloadAndUploadMultipleImages(
      imageUrls,
      `renders/product-mockups/${user.id}`,
      generationId,
      'image/png'
    )

    // Check if all uploads were successful
    const failedUploads = uploadResults.filter(result => !result.success)
    if (failedUploads.length > 0) {
      console.error('❌ Some uploads failed:', failedUploads)
      return NextResponse.json({ 
        error: 'Failed to upload some images to storage',
        details: failedUploads.map(f => f.error)
      }, { status: 500 })
    }

    // Extract storage paths from successful uploads
    const storagePaths = uploadResults
      .filter(result => result.success)
      .map(result => result.storagePath!)
    
    console.log('✅ All images uploaded successfully:', storagePaths)

    // Build comprehensive metadata
    const generationTimestamp = new Date().toISOString()
    
    const variationsMetadata = storagePaths.map((storagePath: string, index: number) => ({
      storagePath,
      originalUrl: imageUrls[index], // Keep original URL for reference
      variationType: ['Hero', 'Lifestyle', 'Minimal', 'Conceptual'][index] || 'Variation',
      settings: {
        ...validatedData,
        variationIndex: index,
        generatedAt: generationTimestamp
      }
    }))

    // Save generation to database
    const { data: generationRecord, error: dbError } = await supabase
      .from('product_mockup_generations')
      .insert({
        user_id: user.id,
        generation_id: generationId,
        prompt: validatedData.prompt,
        full_prompt: fullPrompt,
        settings: validatedData,
        images: storagePaths, // Store storage paths instead of temporary URLs
        metadata: {
          generationTimestamp,
          model,
          dimensions,
          variations: variationsMetadata,
          projectTitle: validatedData.metadata?.projectTitle,
          selectedArtifact: validatedData.metadata?.selectedArtifact
        },
        status: 'completed'
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ Error saving generation to database:', dbError)
      // Continue even if database save fails
    } else {
      console.log('✅ Generation saved to database:', generationRecord.id)
    }

    // Save to product_mockups table with new schema
    console.log('🔄 Attempting to save to product_mockups table...')
    const productMockupData = {
        user_id: user.id,
        title: title || validatedData.prompt.substring(0, 255),
        description: description || validatedData.prompt,
        prompt: validatedData.prompt,
        
        // Product Photos & Logo (storage paths)
        product_photos_paths: productPhotosPaths,
        logo_image_path: logoImagePath,
        
        // Generated Images
        generated_images: imageUrls, // Store URLs for display
        storage_paths: storagePaths, // Store storage paths for management
        
        // Art Direction & Visual Influence
        art_direction: validatedData.artDirection,
        visual_influence: validatedData.visualInfluence,
        lighting_preset: validatedData.lightingPreset,
        background_environment: validatedData.backgroundEnvironment,
        mood_context: validatedData.moodContext,
        
        // Composition & Branding
        composition_template: validatedData.compositionTemplate,
        object_count: validatedData.objectCount,
        shadow_type: validatedData.shadowType,
        logo_placement: validatedData.logoPlacement,
        aspect_ratio: validatedData.aspectRatio,
        
        // Text & CTA Overlay
        headline: validatedData.headline,
        subtext: validatedData.subtext,
        cta_text: validatedData.ctaText,
        font_family: validatedData.fontFamily,
        font_weight: validatedData.fontWeight,
        text_case: validatedData.textCase,
        letter_spacing: validatedData.letterSpacing,
        line_height: validatedData.lineHeight,
        text_color: validatedData.textColor,
        text_alignment: validatedData.textAlignment,
        text_effects: validatedData.textEffects,
        
        // Advanced Typography
        highlight_style: validatedData.highlightStyle,
        accent_element: validatedData.accentElement,
        brilliance: validatedData.brilliance,
        frosted_glass: validatedData.frostedGlass,
        drop_shadow_intensity: validatedData.dropShadowIntensity,
        motion_accent: validatedData.motionAccent,
        
        // Alignment & Positioning
        layout_mode: validatedData.layoutMode,
        vertical_position: validatedData.verticalPosition,
        horizontal_offset: validatedData.horizontalOffset,
        smart_anchor: validatedData.smartAnchor,
        safe_zones: validatedData.safeZones,
        
        // Casting & Multiplicity
        use_avatars: validatedData.useAvatars,
        selected_avatar_id: validatedData.selectedAvatarId,
        use_basic_avatar: validatedData.useBasicAvatar,
        basic_avatar: validatedData.basicAvatar,
        avatar_role: validatedData.avatarRole,
        avatar_interaction: validatedData.avatarInteraction,
        product_multiplicity: validatedData.productMultiplicity,
        angle_variety_count: validatedData.angleVarietyCount,
        
        // Platform Target
        platform_target: validatedData.platformTarget,
        
        // Brand Colors
        brand_colors: validatedData.brandColors,
        
        // Metadata & Content
        content: {
          generation_id: generationId,
          full_prompt: fullPrompt,
          settings: validatedData,
          variations: variationsMetadata
        },
        metadata: {
          generationTimestamp,
          model,
          dimensions,
          projectTitle: validatedData.metadata?.projectTitle,
          selectedArtifact: validatedData.metadata?.selectedArtifact,
          generated_via: 'product-mockup-generation'
        },
        
        // Status
        status: 'completed'
      }
    
    console.log('📝 Product mockup data to insert:', JSON.stringify(productMockupData, null, 2))
    
    const { data: productMockupRecord, error: productMockupError } = await supabase
      .from('product_mockups')
      .insert(productMockupData)
      .select()
      .single()

    if (productMockupError) {
      console.error('❌ Error saving to product_mockups table:', productMockupError)
      console.error('❌ Full error details:', JSON.stringify(productMockupError, null, 2))
      // Continue even if this fails
    } else {
      console.log('✅ Product mockup saved to product_mockups table:', productMockupRecord.id)
      console.log('✅ Product mockup record:', JSON.stringify(productMockupRecord, null, 2))
      
      // Add to library_items table
      const { error: libraryError } = await supabase
        .from('library_items')
        .insert({
          user_id: user.id,
          content_type: 'product_mockups',
          content_id: productMockupRecord.id,
          date_added_to_library: new Date().toISOString()
        })

      if (libraryError) {
        console.error('Failed to add product mockup to library:', libraryError)
      } else {
        console.log(`✅ Product mockup ${productMockupRecord.id} added to library`)
      }
    }

    // Build response
    const response: ProductMockupGenerationResult = {
      success: true,
      images: storagePaths, // Return storage paths instead of temporary URLs
      metadata: {
        generationId,
        timestamp: generationTimestamp,
        settings: validatedData,
        variations: variationsMetadata as any, // Type assertion for now
        storagePaths // Include storage paths in metadata
      }
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('❌ Product mockup generation failed:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 })
    }

    const response: ProductMockupGenerationResult = {
      success: false,
      images: [],
      metadata: {
        generationId: '',
        timestamp: new Date().toISOString(),
        settings: {} as ProductMockupGenerationRequest,
        variations: []
      },
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// GET /api/product-mockup-generation - Get user's product mockup generations
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
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch user's generations
    const { data: generations, error } = await supabase
      .from('product_mockup_generations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ Error fetching product mockup generations:', error)
      return NextResponse.json({ error: 'Failed to fetch generations' }, { status: 500 })
    }

    return NextResponse.json({ generations }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error in GET /api/product-mockup-generation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

