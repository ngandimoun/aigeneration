import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { getFalClient } from '@/lib/utils/fal-client';
import { buildDiverseMotionPrompt } from '@/lib/utils/diverse-motion-prompt-builder';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    // Extract form fields
    const productCategory = formData.get('product_category')?.toString();
    const prompt = formData.get('prompt')?.toString();
    const productName = formData.get('product_name')?.toString();
    const duration = parseInt(formData.get('duration')?.toString() || '8');
    const aspectRatio = formData.get('aspect_ratio')?.toString() as '16:9' | '9:16';

    // Visual Context
    const emotionalTone = formData.get('emotional_tone')?.toString();
    const visualStyle = formData.get('visual_style')?.toString();
    const environment = formData.get('environment')?.toString();
    const customEnvironment = formData.get('custom_environment')?.toString();
    const lightingMood = formData.get('lighting_mood')?.toString();
    const materialFocus = formData.get('material_focus')?.toString() ? JSON.parse(formData.get('material_focus')?.toString() || '[]') : [];
    const cameraType = formData.get('camera_type')?.toString();
    const frameRate = formData.get('frame_rate')?.toString();

    // Motion & Energy
    const revealType = formData.get('reveal_type')?.toString();
    const cameraEnergy = parseInt(formData.get('camera_energy')?.toString() || '50');
    const loopMode = formData.get('loop_mode')?.toString() === 'true';
    const hookIntensity = parseInt(formData.get('hook_intensity')?.toString() || '50');
    const endEmotion = parseInt(formData.get('end_emotion')?.toString() || '50');

    // Audio DNA
    const soundMode = formData.get('sound_mode')?.toString();
    const soundMood = formData.get('sound_mood')?.toString();
    const keyEffects = formData.get('key_effects')?.toString() ? JSON.parse(formData.get('key_effects')?.toString() || '[]') : [];
    const mixCurve = parseInt(formData.get('mix_curve')?.toString() || '50');

    // Brand Touch
    const accentColorSync = formData.get('accent_color_sync')?.toString() === 'true';
    const accentColor = formData.get('accent_color')?.toString();
    const logoMoment = formData.get('logo_moment')?.toString();
    const textConstraint = formData.get('text_constraint')?.toString() === 'true';

    // Category-specific fields
    const chartType = formData.get('chart_type')?.toString();
    const dataPoints = formData.get('data_points')?.toString();
    const animationStyle = formData.get('animation_style')?.toString();
    const colorScheme = formData.get('color_scheme')?.toString();
    const logoType = formData.get('logo_type')?.toString();
    const animationComplexity = formData.get('animation_complexity')?.toString();
    const elementType = formData.get('element_type')?.toString();
    const interactionType = formData.get('interaction_type')?.toString();
    const sceneType = formData.get('scene_type')?.toString();
    const moodGenre = formData.get('mood_genre')?.toString();
    const pacing = formData.get('pacing')?.toString();
    const contentFormat = formData.get('content_format')?.toString();
    const platformOptimization = formData.get('platform_optimization')?.toString();
    const toneStyle = formData.get('tone_style')?.toString();
    const ctaType = formData.get('cta_type')?.toString();
    const creatorPersona = formData.get('creator_persona')?.toString();
    const pacingAds = formData.get('pacing_ads')?.toString();
    const hookStyle = formData.get('hook_style')?.toString();

    // Image handling
    const useCustomImage = formData.get('use_custom_image')?.toString() === 'true';
    const selectedAssetId = formData.get('selected_asset_id')?.toString();
    const customImage = formData.get('custom_image') as File | null;

    // Validation
    if (!productCategory) {
      return NextResponse.json({ error: 'Product category is required' }, { status: 400 });
    }

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!aspectRatio || !['16:9', '9:16'].includes(aspectRatio)) {
      return NextResponse.json({ error: 'Valid aspect ratio is required' }, { status: 400 });
    }

    // Resolve image URL
    let imageUrl: string | undefined;

    if (useCustomImage && customImage) {
      // Upload custom image
      const sanitizedName = customImage.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const imagePath = `renders/diverse-motion/${user.id}/inputs/${uuidv4()}-${sanitizedName}`;
      
      const { error: uploadErr } = await supabase.storage
        .from('dreamcut')
        .upload(imagePath, customImage, { 
          cacheControl: '3600', 
          upsert: false,
          contentType: customImage.type
        });

      if (uploadErr) {
        return NextResponse.json({ error: `Failed to upload image: ${uploadErr.message}` }, { status: 500 });
      }

      const { data: signed } = await supabase.storage
        .from('dreamcut')
        .createSignedUrl(imagePath, 86400);
      
      imageUrl = signed?.signedUrl;
    } else if (!useCustomImage && selectedAssetId) {
      // Fetch library asset
      const { data: asset } = await supabase
        .from('library_items')
        .select(`
          content_type,
          content_id,
          avatars_personas!inner(generated_images, storage_paths),
          product_mockups!inner(generated_images, storage_paths),
          charts_infographics!inner(generated_images, storage_paths),
          illustrations!inner(generated_images, storage_paths)
        `)
        .eq('id', selectedAssetId)
        .eq('user_id', user.id)
        .single();

      if (asset) {
        // Try to get image URL from the appropriate table
        let candidatePath: string | undefined;
        let candidateUrl: string | undefined;

        if (asset.content_type === 'avatars_personas' && asset.avatars_personas) {
          candidatePath = asset.avatars_personas.storage_paths?.[0];
          candidateUrl = asset.avatars_personas.generated_images?.[0];
        } else if (asset.content_type === 'product_mockups' && asset.product_mockups) {
          candidatePath = asset.product_mockups.storage_paths?.[0];
          candidateUrl = asset.product_mockups.generated_images?.[0];
        } else if (asset.content_type === 'charts_infographics' && asset.charts_infographics) {
          candidatePath = asset.charts_infographics.storage_paths?.[0];
          candidateUrl = asset.charts_infographics.generated_images?.[0];
        } else if (asset.content_type === 'illustrations' && asset.illustrations) {
          candidatePath = asset.illustrations.storage_paths?.[0];
          candidateUrl = asset.illustrations.generated_images?.[0];
        }

        if (candidatePath) {
          const { data: signed } = await supabase.storage
            .from('dreamcut')
            .createSignedUrl(candidatePath, 86400);
          imageUrl = signed?.signedUrl;
        } else if (candidateUrl) {
          imageUrl = candidateUrl;
        }
      }
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image provided or found for selected asset' }, { status: 400 });
    }

    // Build enhanced prompt
    const enhancedPrompt = buildDiverseMotionPrompt({
      basePrompt: prompt,
      emotionalTone,
      visualStyle,
      environment,
      customEnvironment,
      lightingMood,
      materialFocus,
      cameraType,
      frameRate,
      revealType,
      cameraEnergy,
      loopMode,
      hookIntensity,
      endEmotion,
      soundMode,
      soundMood,
      keyEffects,
      mixCurve,
      accentColorSync,
      accentColor,
      logoMoment,
      textConstraint,
      productCategory,
      chartType,
      dataPoints,
      animationStyle,
      colorScheme,
      logoType,
      animationComplexity,
      elementType,
      interactionType,
      sceneType,
      moodGenre,
      pacing,
      contentFormat,
      platformOptimization,
      toneStyle,
      ctaType,
      creatorPersona,
      pacingAds,
      hookStyle
    });

    console.log('🎬 Diverse Motion - Enhanced prompt:', enhancedPrompt);

    // Call fal.ai veo3.1/image-to-video API
    const fal = getFalClient();
    const falResult = await fal.subscribe('fal-ai/veo3.1/image-to-video', {
      input: {
        prompt: enhancedPrompt,
        image_url: imageUrl,
        aspect_ratio: aspectRatio,
        duration: '8s',
        resolution: '1080p',
        generate_audio: false
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          update.logs?.map((log) => log.message).forEach(console.log);
        }
      }
    });

    const outputUrl: string | undefined = falResult?.data?.video?.url;
    if (!outputUrl) {
      return NextResponse.json({ error: 'Failed to generate video' }, { status: 502 });
    }

    console.log('🎬 Diverse Motion - Video generated:', outputUrl);

    // Download generated video and upload to Supabase Storage
    const resp = await fetch(outputUrl);
    if (!resp.ok) {
      return NextResponse.json({ error: `Failed to download generated video: ${resp.status}` }, { status: 502 });
    }

    const arrayBuffer = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${uuidv4()}-motion.mp4`;
    const storagePath = `renders/diverse-motion/${user.id}/generated/${fileName}`;

    const { error: uploadGenErr } = await supabase.storage
      .from('dreamcut')
      .upload(storagePath, buffer, { 
        contentType: 'video/mp4', 
        cacheControl: '3600',
        upsert: false
      });

    if (uploadGenErr) {
      return NextResponse.json({ error: `Failed to store generated video: ${uploadGenErr.message}` }, { status: 500 });
    }

    const { data: signedVideo } = await supabase.storage
      .from('dreamcut')
      .createSignedUrl(storagePath, 86400);

    // Insert record to diverse_motions table
    const { data: inserted, error: insertErr } = await supabase
      .from('diverse_motions')
      .insert([{
        user_id: user.id,
        mode: 'single',
        product_category: productCategory,
        product_name: productName,
        prompt: prompt,
        emotional_tone: emotionalTone,
        visual_style: visualStyle,
        environment: environment,
        custom_environment: customEnvironment,
        lighting_mood: lightingMood,
        material_focus: materialFocus,
        camera_type: cameraType,
        frame_rate: frameRate,
        reveal_type: revealType,
        camera_energy: cameraEnergy,
        loop_mode: loopMode,
        hook_intensity: hookIntensity,
        end_emotion: endEmotion,
        sound_mode: soundMode,
        sound_mood: soundMood,
        key_effects: keyEffects,
        mix_curve: mixCurve,
        accent_color_sync: accentColorSync,
        accent_color: accentColor,
        logo_moment: logoMoment,
        text_constraint: textConstraint,
        chart_type: chartType,
        data_points: dataPoints,
        animation_style: animationStyle,
        color_scheme: colorScheme,
        duration: duration,
        aspect_ratio: aspectRatio,
        resolution: '1080p',
        status: 'completed',
        fal_request_id: falResult?.requestId,
        storage_path: storagePath,
        generated_video_url: signedVideo?.signedUrl,
        input_image_path: useCustomImage ? `renders/diverse-motion/${user.id}/inputs/${customImage?.name}` : undefined,
        metadata: {
          mode: 'single',
          enhanced_prompt: enhancedPrompt,
          use_custom_image: useCustomImage,
          selected_asset_id: selectedAssetId,
          timestamp: new Date().toISOString()
        },
        content: {
          motion_dna: {
            category: productCategory,
            product: productName,
            prompt: prompt,
            style: `${emotionalTone?.toLowerCase() || 'epic'} ${visualStyle?.toLowerCase() || 'cinematic'} kinetic reveal`,
            camera: {
              type: cameraType?.toLowerCase().replace(/\s+/g, '-') || 'macro-precision',
              movement: `${cameraType?.toLowerCase() || 'macro precision'} → ${revealType?.toLowerCase().replace(/\s+/g, '-') || 'morph'} → hero reveal`,
              frame_rate: frameRate?.split(' ')[2] || "60fps",
              energy: cameraEnergy / 100
            },
            lighting: lightingMood?.toLowerCase().replace(/\s+/g, '-') || 'soft-daylight',
            environment: environment === "Custom" ? customEnvironment : environment?.toLowerCase().replace(/\s+/g, '-') || 'studio-white',
            materials: materialFocus?.filter(m => m !== "All").map(m => m.toLowerCase()) || [],
            motion: {
              reveal_type: revealType?.toLowerCase().replace(/\s+/g, '-') || 'morph',
              camera_energy: cameraEnergy / 100,
              loop: loopMode || false,
              hook_intensity: hookIntensity / 100,
              end_emotion: endEmotion / 100
            },
            audio: {
              mode: soundMode?.toLowerCase().replace(/\s+/g, '_') || 'sfx_only',
              mood: soundMood?.toLowerCase().replace(/\s+/g, '_') || 'ambient_minimal',
              effects: keyEffects || [],
              mix_curve: mixCurve / 100
            },
            branding: {
              accent_color_sync: accentColorSync || false,
              accent_color: accentColor || '#3B82F6',
              logo_moment: logoMoment?.toLowerCase().replace(/\s+/g, '_') || 'none',
              text_constraint: textConstraint || false
            },
            duration: duration,
            tone: `${emotionalTone?.toLowerCase() || 'epic'}, modern, kinetically poetic`
          }
        }
      }])
      .select();

    if (insertErr) {
      console.error('❌ Diverse Motion database insertion failed:', insertErr);
      return NextResponse.json({ 
        error: 'Failed to save diverse motion', 
        details: insertErr.message 
      }, { status: 500 });
    }

    // Add to library_items
    await supabase
      .from('library_items')
      .insert({
        user_id: user.id,
        content_type: 'diverse_motions',
        content_id: inserted?.[0]?.id,
        date_added_to_library: new Date().toISOString()
      });

    return NextResponse.json({ 
      message: 'Diverse motion generated successfully',
      diverseMotion: inserted?.[0],
      requestId: falResult?.requestId
    }, { status: 201 });

  } catch (error) {
    console.error('Error generating diverse motion:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}