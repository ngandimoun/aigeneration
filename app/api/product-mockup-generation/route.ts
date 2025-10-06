import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fal } from '@fal-ai/client'
import { STYLE_MAP } from '@/lib/styles/style-map'
import { ProductMockupGenerationRequest, ProductMockupGenerationResult } from '@/lib/types/product-mockup'

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_KEY,
})

// Validation schema for product mockup generation
const productMockupGenerationSchema = z.object({
  // Basic Settings
  prompt: z.string().min(1).max(2000),
  imageCount: z.number().min(1).max(4).default(4),
  aspectRatio: z.enum(['1:1', '4:5', '16:9', '9:16', '2:1', '3:4', '2:3', '4:3', '3:2']).default('1:1'),
  
  // Product Photos (will be handled as base64 strings)
  productPhotos: z.array(z.string()).min(1).max(4), // base64 encoded images
  
  // Logo Upload
  logoFile: z.string().optional(), // base64 encoded logo
  logoUsagePrompt: z.string().max(500).optional(),
  
  // Art Direction & Visual Influence
  artDirection: z.string().min(1),
  visualInfluence: z.string().min(1),
  lightingPreset: z.string().min(1),
  backgroundEnvironment: z.string().min(1),
  moodContext: z.string().min(1),
  
  // Composition & Branding
  compositionTemplate: z.enum(['Centered Hero', 'Rule of Thirds', 'Floating Object', 'Flat Lay', 'Collage']).default('Centered Hero'),
  objectCount: z.enum(['1', '2', '3']).default('1').transform(val => parseInt(val) as 1 | 2 | 3),
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
    description: z.string().min(1).max(500)
  }).optional(),
  avatarRole: z.enum(['Model', 'User', 'Mascot', 'Spokesperson']).default('Model'),
  avatarInteraction: z.enum(['Holding', 'Wearing', 'Using', 'Observing']).default('Holding'),
  productMultiplicity: z.enum(['Single', 'Lineup', 'Bundle']).default('Single'),
  angleVarietyCount: z.enum(['1', '2', '3', '4', '5']).default('1').transform(val => parseInt(val) as 1 | 2 | 3 | 4 | 5),
  
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
  const styleInfo = STYLE_MAP[artDirection]?.find(inf => inf.label === visualInfluence)
  const moodInfo = styleInfo?.moodContexts.find(mc => mc.name === moodContext)

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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = productMockupGenerationSchema.parse(body)

    console.log('📝 Product mockup generation data:', {
      prompt: validatedData.prompt,
      imageCount: validatedData.imageCount,
      aspectRatio: validatedData.aspectRatio,
      artDirection: validatedData.artDirection,
      visualInfluence: validatedData.visualInfluence,
      useAvatars: validatedData.useAvatars,
      productPhotos: validatedData.productPhotos.length
    })

    // Build comprehensive prompt
    const fullPrompt = buildProductMockupPrompt(validatedData)
    console.log('📏 Full prompt length:', fullPrompt.length, 'characters')
    
    // Get image dimensions
    const dimensions = getImageDimensions(validatedData.aspectRatio)
    console.log('📐 Image dimensions:', dimensions)

    // Determine which model to use based on whether we have product photos
    const hasProductPhotos = validatedData.productPhotos && validatedData.productPhotos.length > 0
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
      // For now, use the first product photo as reference
      // In a full implementation, you'd want to handle multiple photos more intelligently
      requestParams.input.image_url = validatedData.productPhotos[0]
      console.log('🖼️ Using product photo for reference')
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

    // Build comprehensive metadata
    const generationTimestamp = new Date().toISOString()
    const generationId = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const variationsMetadata = imageUrls.map((url: string, index: number) => ({
      imageUrl: url,
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
        images: imageUrls,
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

    // Build response
    const response: ProductMockupGenerationResult = {
      success: true,
      images: imageUrls,
      metadata: {
        generationId,
        timestamp: generationTimestamp,
        settings: validatedData,
        variations: variationsMetadata
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

