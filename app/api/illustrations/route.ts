import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    
    // Extract form data
    const title = formData.get('title') as string
    const prompt = formData.get('prompt') as string
    const purpose = formData.get('purpose') as string
    const aspectRatio = formData.get('aspectRatio') as string
    const artDirection = formData.get('artDirection') as string
    const visualInfluence = formData.get('visualInfluence') as string
    const mediumTexture = formData.get('mediumTexture') as string
    const lightingPreset = formData.get('lightingPreset') as string
    const outlineStyle = formData.get('outlineStyle') as string
    const moodContext = formData.get('moodContext') as string
    const toneIntensity = parseInt(formData.get('toneIntensity') as string)
    const paletteWarmth = parseInt(formData.get('paletteWarmth') as string)
    const expressionHarmony = formData.get('expressionHarmony') === 'true'
    const brandSync = formData.get('brandSync') === 'true'
    const colorPaletteMode = formData.get('colorPaletteMode') as string
    const accentColor = formData.get('accentColor') as string
    const fontStyle = formData.get('fontStyle') as string
    const watermarkPlacement = formData.get('watermarkPlacement') as string
    const compositionTemplate = formData.get('compositionTemplate') as string
    const cameraAngle = formData.get('cameraAngle') as string
    const depthControl = parseInt(formData.get('depthControl') as string)
    const subjectPlacement = formData.get('subjectPlacement') as string
    const safeZoneOverlay = formData.get('safeZoneOverlay') === 'true'

    // Validate required fields
    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Handle reference images upload
    const referenceImagesPaths: string[] = []
    const referenceImages = []
    
    for (let i = 0; i < 3; i++) {
      const file = formData.get(`referenceImage_${i}`) as File
      if (file) {
        referenceImages.push(file)
      }
    }

    // Upload reference images to Supabase Storage
    if (referenceImages.length > 0) {
      for (let i = 0; i < referenceImages.length; i++) {
        const file = referenceImages[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `ref_${Date.now()}_${i}.${fileExt}`
        const filePath = `renders/illustrations/${user.id}/references/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('dreamcut')
          .upload(filePath, file)
        
        if (uploadError) {
          console.error('Error uploading reference image:', uploadError)
          return NextResponse.json({ error: 'Failed to upload reference image' }, { status: 500 })
        }
        
        referenceImagesPaths.push(filePath)
      }
    }

    // Handle logo image upload
    let logoImagePath: string | null = null
    const logoImage = formData.get('logoImage') as File
    if (logoImage) {
      const fileExt = logoImage.name.split('.').pop()
      const fileName = `logo_${Date.now()}.${fileExt}`
      const filePath = `renders/illustrations/${user.id}/references/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('dreamcut')
        .upload(filePath, logoImage)
      
      if (uploadError) {
        console.error('Error uploading logo image:', uploadError)
        return NextResponse.json({ error: 'Failed to upload logo image' }, { status: 500 })
      }
      
      logoImagePath = filePath
    }

    // Create illustration record in database
    const { data: illustration, error: dbError } = await supabase
      .from('illustrations')
      .insert({
        user_id: user.id,
        title: title || 'Untitled Illustration',
        prompt,
        purpose,
        aspect_ratio: aspectRatio,
        art_direction: artDirection,
        visual_influence: visualInfluence,
        medium_texture: mediumTexture,
        lighting_preset: lightingPreset,
        outline_style: outlineStyle,
        mood_context: moodContext,
        tone_intensity: toneIntensity,
        palette_warmth: paletteWarmth,
        expression_harmony: expressionHarmony,
        brand_sync: brandSync,
        color_palette_mode: colorPaletteMode,
        accent_color: accentColor,
        font_style: fontStyle,
        watermark_placement: watermarkPlacement,
        composition_template: compositionTemplate,
        camera_angle: cameraAngle,
        depth_control: depthControl,
        subject_placement: subjectPlacement,
        safe_zone_overlay: safeZoneOverlay,
        reference_images_paths: referenceImagesPaths.length > 0 ? referenceImagesPaths : null,
        logo_image_path: logoImagePath,
        status: 'processing',
        metadata: {
          form_data: {
            purpose,
            aspect_ratio: aspectRatio,
            art_direction: artDirection,
            visual_influence: visualInfluence,
            medium_texture: mediumTexture,
            lighting_preset: lightingPreset,
            outline_style: outlineStyle,
            mood_context: moodContext,
            tone_intensity: toneIntensity,
            palette_warmth: paletteWarmth,
            expression_harmony: expressionHarmony,
            brand_sync: brandSync,
            color_palette_mode: colorPaletteMode,
            accent_color: accentColor,
            font_style: fontStyle,
            watermark_placement: watermarkPlacement,
            composition_template: compositionTemplate,
            camera_angle: cameraAngle,
            depth_control: depthControl,
            subject_placement: subjectPlacement,
            safe_zone_overlay: safeZoneOverlay
          }
        }
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to create illustration record' }, { status: 500 })
    }

    // TODO: Integrate with image generation service (fal.ai, DALL-E, etc.)
    // For now, we'll simulate the generation process
    // In a real implementation, you would:
    // 1. Call the image generation API
    // 2. Download the generated images
    // 3. Upload them to Supabase Storage
    // 4. Update the illustration record with the results

    // Simulate successful generation (remove this in production)
    setTimeout(async () => {
      await supabase
        .from('illustrations')
        .update({
          status: 'completed',
          generated_images: [
            {
              url: 'https://example.com/generated-image-1.jpg',
              path: `renders/illustrations/${user.id}/generated/${illustration.id}_1.jpg`
            }
          ],
          storage_paths: [`renders/illustrations/${user.id}/generated/${illustration.id}_1.jpg`]
        })
        .eq('id', illustration.id)
    }, 2000)

    return NextResponse.json({
      success: true,
      illustration: {
        id: illustration.id,
        title: illustration.title,
        status: illustration.status
      }
    })

  } catch (error) {
    console.error('Illustration generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's illustrations
    const { data: illustrations, error } = await supabase
      .from('illustrations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch illustrations' }, { status: 500 })
    }

    return NextResponse.json({ illustrations })

  } catch (error) {
    console.error('Fetch illustrations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}