import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getFalClient } from '@/lib/utils/fal-client';
import { buildDiverseMotionDualPrompt } from '@/lib/utils/diverse-motion-dual-prompt-builder';

// Helper to convert null to undefined for Zod optional()
const nullToUndefined = z.literal('null').transform(() => undefined);

const createDiverseMotionDualSchema = z.object({
  product_category: z.enum(['Data Visualizations', 'Infographic', 'Logo Animation', 'UI/UX Element', 'Cinematic Videos', 'Ads and UGC']),
  prompt: z.string().min(1, "Prompt is required"),
  product_name: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  duration: z.string().default('8s'), // Enforce 8s as per user request
  aspect_ratio: z.enum(['9:16', '16:9', '1:1']).default('16:9'),
  
  // Visual Context
  emotional_tone: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  visual_style: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  environment: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  custom_environment: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  lighting_mood: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  material_focus: z.string().optional().nullable().transform(e => e === '' ? undefined : JSON.parse(e as string)).or(nullToUndefined),
  camera_type: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  frame_rate: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  
  // Motion & Energy
  reveal_type: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  camera_energy: z.string().optional().nullable().transform(e => e === '' ? undefined : Number(e)).or(nullToUndefined),
  loop_mode: z.string().optional().nullable().transform(e => e === '' ? undefined : e === 'true').or(nullToUndefined),
  hook_intensity: z.string().optional().nullable().transform(e => e === '' ? undefined : Number(e)).or(nullToUndefined),
  end_emotion: z.string().optional().nullable().transform(e => e === '' ? undefined : Number(e)).or(nullToUndefined),
  
  // Audio DNA
  sound_mode: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  sound_mood: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  key_effects: z.string().optional().nullable().transform(e => e === '' ? undefined : JSON.parse(e as string)).or(nullToUndefined),
  mix_curve: z.string().optional().nullable().transform(e => e === '' ? undefined : Number(e)).or(nullToUndefined),
  
  // Brand Touch
  accent_color_sync: z.string().optional().nullable().transform(e => e === '' ? undefined : e === 'true').or(nullToUndefined),
  accent_color: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  logo_moment: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  text_constraint: z.string().optional().nullable().transform(e => e === '' ? undefined : e === 'true').or(nullToUndefined),

  // Category-specific fields
  chart_type: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  data_points: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  animation_style: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  color_scheme: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  layout_type: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  icon_style: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  text_emphasis: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  flow_direction: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  logo_type: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  animation_complexity: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  brand_colors: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  reveal_style: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  element_type: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  interaction_type: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  state_transitions: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  micro_interaction_level: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  scene_type: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  mood_genre: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  pacing: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  narrative_structure: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  content_format: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  platform_optimization: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  tone_style: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  cta_type: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  creator_persona: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  pacing_ads: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  hook_style: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),

  // First frame source
  first_frame_source: z.enum(['upload', 'library']),
  first_frame_file: z.any().optional(), // File object
  first_frame_asset_id: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),

  // Last frame source
  last_frame_source: z.enum(['upload', 'library']),
  last_frame_file: z.any().optional(), // File object
  last_frame_asset_id: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    const validatedData = createDiverseMotionDualSchema.parse(data);

    let firstFrameUrl: string | undefined;
    let firstFrameStoragePath: string | undefined;
    let lastFrameUrl: string | undefined;
    let lastFrameStoragePath: string | undefined;

    // Handle first frame
    if (validatedData.first_frame_source === 'upload' && validatedData.first_frame_file instanceof File) {
      const file = validatedData.first_frame_file;
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const imagePath = `renders/diverse-motion/${user.id}/inputs/first-${uuidv4()}-${sanitizedName}`;
      const { error: uploadErr } = await supabase.storage
        .from('dreamcut')
        .upload(imagePath, file, { cacheControl: '3600', upsert: false });

      if (uploadErr) {
        console.error('Supabase upload error for first frame:', uploadErr);
        return NextResponse.json({ error: `Failed to upload first frame: ${uploadErr.message}` }, { status: 500 });
      }
      const { data: signed } = await supabase.storage.from('dreamcut').createSignedUrl(imagePath, 86400);
      firstFrameUrl = signed?.signedUrl;
      firstFrameStoragePath = imagePath;
    } else if (validatedData.first_frame_source === 'library' && validatedData.first_frame_asset_id) {
      // Fetch first frame asset from library
      const { data: libraryItem, error: libraryError } = await supabase
        .from('library_items')
        .select('content_type, content_id')
        .eq('content_id', validatedData.first_frame_asset_id)
        .eq('user_id', user.id)
        .single();

      if (libraryError || !libraryItem) {
        console.error('First frame library item fetch error:', libraryError);
        return NextResponse.json({ error: 'Selected first frame library asset not found or unauthorized' }, { status: 400 });
      }

      let assetData: any;
      let imageUrlField: string | string[] | undefined;
      let storagePathField: string | string[] | undefined;

      switch (libraryItem.content_type) {
        case 'avatars_personas':
          const { data: avatarData } = await supabase.from('avatars_personas').select('generated_images, storage_paths').eq('id', libraryItem.content_id).single();
          assetData = avatarData;
          imageUrlField = avatarData?.generated_images?.[0];
          storagePathField = avatarData?.storage_paths?.[0];
          break;
        case 'product_mockups':
          const { data: mockupData } = await supabase.from('product_mockups').select('generated_image_url, storage_path').eq('id', libraryItem.content_id).single();
          assetData = mockupData;
          imageUrlField = mockupData?.generated_image_url;
          storagePathField = mockupData?.storage_path;
          break;
        case 'charts_infographics':
          const { data: chartData } = await supabase.from('charts_infographics').select('generated_image_url, storage_path').eq('id', libraryItem.content_id).single();
          assetData = chartData;
          imageUrlField = chartData?.generated_image_url;
          storagePathField = chartData?.storage_path;
          break;
        case 'illustrations':
          const { data: illustrationData } = await supabase.from('illustrations').select('generated_image_url, storage_path').eq('id', libraryItem.content_id).single();
          assetData = illustrationData;
          imageUrlField = illustrationData?.generated_image_url;
          storagePathField = illustrationData?.storage_path;
          break;
        default:
          return NextResponse.json({ error: `Unsupported first frame asset type: ${libraryItem.content_type}` }, { status: 400 });
      }

      if (storagePathField) {
        const { data: signed } = await supabase.storage.from('dreamcut').createSignedUrl(storagePathField as string, 86400);
        firstFrameUrl = signed?.signedUrl;
        firstFrameStoragePath = storagePathField as string;
      } else if (imageUrlField) {
        firstFrameUrl = imageUrlField as string;
      }

      if (!firstFrameUrl) {
        return NextResponse.json({ error: 'Could not retrieve first frame URL for selected library asset' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'No first frame source provided' }, { status: 400 });
    }

    // Handle last frame
    if (validatedData.last_frame_source === 'upload' && validatedData.last_frame_file instanceof File) {
      const file = validatedData.last_frame_file;
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const imagePath = `renders/diverse-motion/${user.id}/inputs/last-${uuidv4()}-${sanitizedName}`;
      const { error: uploadErr } = await supabase.storage
        .from('dreamcut')
        .upload(imagePath, file, { cacheControl: '3600', upsert: false });

      if (uploadErr) {
        console.error('Supabase upload error for last frame:', uploadErr);
        return NextResponse.json({ error: `Failed to upload last frame: ${uploadErr.message}` }, { status: 500 });
      }
      const { data: signed } = await supabase.storage.from('dreamcut').createSignedUrl(imagePath, 86400);
      lastFrameUrl = signed?.signedUrl;
      lastFrameStoragePath = imagePath;
    } else if (validatedData.last_frame_source === 'library' && validatedData.last_frame_asset_id) {
      // Fetch last frame asset from library
      const { data: libraryItem, error: libraryError } = await supabase
        .from('library_items')
        .select('content_type, content_id')
        .eq('content_id', validatedData.last_frame_asset_id)
        .eq('user_id', user.id)
        .single();

      if (libraryError || !libraryItem) {
        console.error('Last frame library item fetch error:', libraryError);
        return NextResponse.json({ error: 'Selected last frame library asset not found or unauthorized' }, { status: 400 });
      }

      let assetData: any;
      let imageUrlField: string | string[] | undefined;
      let storagePathField: string | string[] | undefined;

      switch (libraryItem.content_type) {
        case 'avatars_personas':
          const { data: avatarData } = await supabase.from('avatars_personas').select('generated_images, storage_paths').eq('id', libraryItem.content_id).single();
          assetData = avatarData;
          imageUrlField = avatarData?.generated_images?.[0];
          storagePathField = avatarData?.storage_paths?.[0];
          break;
        case 'product_mockups':
          const { data: mockupData } = await supabase.from('product_mockups').select('generated_image_url, storage_path').eq('id', libraryItem.content_id).single();
          assetData = mockupData;
          imageUrlField = mockupData?.generated_image_url;
          storagePathField = mockupData?.storage_path;
          break;
        case 'charts_infographics':
          const { data: chartData } = await supabase.from('charts_infographics').select('generated_image_url, storage_path').eq('id', libraryItem.content_id).single();
          assetData = chartData;
          imageUrlField = chartData?.generated_image_url;
          storagePathField = chartData?.storage_path;
          break;
        case 'illustrations':
          const { data: illustrationData } = await supabase.from('illustrations').select('generated_image_url, storage_path').eq('id', libraryItem.content_id).single();
          assetData = illustrationData;
          imageUrlField = illustrationData?.generated_image_url;
          storagePathField = illustrationData?.storage_path;
          break;
        default:
          return NextResponse.json({ error: `Unsupported last frame asset type: ${libraryItem.content_type}` }, { status: 400 });
      }

      if (storagePathField) {
        const { data: signed } = await supabase.storage.from('dreamcut').createSignedUrl(storagePathField as string, 86400);
        lastFrameUrl = signed?.signedUrl;
        lastFrameStoragePath = storagePathField as string;
      } else if (imageUrlField) {
        lastFrameUrl = imageUrlField as string;
      }

      if (!lastFrameUrl) {
        return NextResponse.json({ error: 'Could not retrieve last frame URL for selected library asset' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'No last frame source provided' }, { status: 400 });
    }

    const fal = getFalClient();

    const enhancedPrompt = buildDiverseMotionDualPrompt({
      productCategory: validatedData.product_category,
      prompt: validatedData.prompt,
      productName: validatedData.product_name,
      emotionalTone: validatedData.emotional_tone as any,
      visualStyle: validatedData.visual_style as any,
      environment: validatedData.environment as any,
      customEnvironment: validatedData.custom_environment,
      lightingMood: validatedData.lighting_mood as any,
      materialFocus: validatedData.material_focus as any,
      cameraType: validatedData.camera_type as any,
      frameRate: validatedData.frame_rate as any,
      revealType: validatedData.reveal_type as any,
      cameraEnergy: validatedData.camera_energy,
      loopMode: validatedData.loop_mode,
      hookIntensity: validatedData.hook_intensity,
      endEmotion: validatedData.end_emotion,
      soundMode: validatedData.sound_mode as any,
      soundMood: validatedData.sound_mood as any,
      keyEffects: validatedData.key_effects as any,
      mixCurve: validatedData.mix_curve,
      accentColorSync: validatedData.accent_color_sync,
      accentColor: validatedData.accent_color,
      logoMoment: validatedData.logo_moment as any,
      textConstraint: validatedData.text_constraint,
      chartType: validatedData.chart_type as any,
      dataPoints: validatedData.data_points as any,
      animationStyle: validatedData.animation_style as any,
      colorScheme: validatedData.color_scheme as any,
      layoutType: validatedData.layout_type as any,
      iconStyle: validatedData.icon_style as any,
      textEmphasis: validatedData.text_emphasis as any,
      flowDirection: validatedData.flow_direction as any,
      logoType: validatedData.logo_type as any,
      animationComplexity: validatedData.animation_complexity as any,
      brandColors: validatedData.brand_colors as any,
      revealStyle: validatedData.reveal_style as any,
      elementType: validatedData.element_type as any,
      interactionType: validatedData.interaction_type as any,
      stateTransitions: validatedData.state_transitions as any,
      microInteractionLevel: validatedData.micro_interaction_level as any,
      sceneType: validatedData.scene_type as any,
      moodGenre: validatedData.mood_genre as any,
      pacing: validatedData.pacing as any,
      narrativeStructure: validatedData.narrative_structure as any,
      contentFormat: validatedData.content_format as any,
      platformOptimization: validatedData.platform_optimization as any,
      toneStyle: validatedData.tone_style as any,
      ctaType: validatedData.cta_type as any,
      creatorPersona: validatedData.creator_persona as any,
      pacingAds: validatedData.pacing_ads as any,
      hookStyle: validatedData.hook_style as any,
    });

    console.log('Enhanced Dual Prompt for fal.ai:', enhancedPrompt);
    console.log('First Frame URL for fal.ai:', firstFrameUrl);
    console.log('Last Frame URL for fal.ai:', lastFrameUrl);

    const falResult = await fal.subscribe("fal-ai/veo3.1/first-last-frame-to-video", {
      input: {
        first_frame_url: firstFrameUrl,
        last_frame_url: lastFrameUrl,
        prompt: enhancedPrompt,
        aspect_ratio: validatedData.aspect_ratio,
        duration: validatedData.duration, // "8s"
        resolution: '1080p', // Enforce 1080p as per user request
        generate_audio: false // Always false as per user request
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    const outputUrl: string | undefined = falResult?.data?.video?.url;
    if (!outputUrl) {
      return NextResponse.json({ error: 'Failed to generate video from fal.ai' }, { status: 502 });
    }

    // Download generated video and upload to Supabase Storage
    const resp = await fetch(outputUrl);
    if (!resp.ok) {
      return NextResponse.json({ error: `Failed to download generated video: ${resp.status}` }, { status: 502 });
    }
    const arrayBuffer = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${uuidv4()}-dual-motion.mp4`;
    const storage_path = `renders/diverse-motion/${user.id}/generated/${fileName}`;
    const { error: uploadGenErr } = await supabase.storage
      .from('dreamcut')
      .upload(storage_path, buffer, { contentType: 'video/mp4', cacheControl: '3600' });

    if (uploadGenErr) {
      return NextResponse.json({ error: `Failed to store generated video: ${uploadGenErr.message}` }, { status: 500 });
    }
    const { data: signedVideo } = await supabase.storage.from('dreamcut').createSignedUrl(storage_path, 86400);

    // Persist DB record
    const { data: inserted, error: insertErr } = await supabase
      .from('diverse_motions')
      .insert([
        {
          user_id: user.id,
          title: validatedData.product_name || validatedData.product_category + " Dual Motion",
          mode: 'dual',
          product_category: validatedData.product_category,
          prompt: validatedData.prompt,
          product_name: validatedData.product_name,
          duration: parseInt(validatedData.duration.replace('s', '')),
          aspect_ratio: validatedData.aspect_ratio,
          emotional_tone: validatedData.emotional_tone,
          visual_style: validatedData.visual_style,
          environment: validatedData.environment,
          custom_environment: validatedData.custom_environment,
          lighting_mood: validatedData.lighting_mood,
          material_focus: validatedData.material_focus,
          camera_type: validatedData.camera_type,
          frame_rate: validatedData.frame_rate,
          reveal_type: validatedData.reveal_type,
          camera_energy: validatedData.camera_energy,
          loop_mode: validatedData.loop_mode,
          hook_intensity: validatedData.hook_intensity,
          end_emotion: validatedData.end_emotion,
          sound_mode: validatedData.sound_mode,
          sound_mood: validatedData.sound_mood,
          key_effects: validatedData.key_effects,
          mix_curve: validatedData.mix_curve,
          accent_color_sync: validatedData.accent_color_sync,
          accent_color: validatedData.accent_color,
          logo_moment: validatedData.logo_moment,
          text_constraint: validatedData.text_constraint,
          chart_type: validatedData.chart_type,
          data_points: validatedData.data_points,
          animation_style: validatedData.animation_style,
          color_scheme: validatedData.color_scheme,
          layout_type: validatedData.layout_type,
          icon_style: validatedData.icon_style,
          text_emphasis: validatedData.text_emphasis,
          flow_direction: validatedData.flow_direction,
          logo_type: validatedData.logo_type,
          animation_complexity: validatedData.animation_complexity,
          brand_colors: validatedData.brand_colors,
          reveal_style: validatedData.reveal_style,
          element_type: validatedData.element_type,
          interaction_type: validatedData.interaction_type,
          state_transitions: validatedData.state_transitions,
          micro_interaction_level: validatedData.micro_interaction_level,
          scene_type: validatedData.scene_type,
          mood_genre: validatedData.mood_genre,
          pacing: validatedData.pacing,
          narrative_structure: validatedData.narrative_structure,
          content_format: validatedData.content_format,
          platform_optimization: validatedData.platform_optimization,
          tone_style: validatedData.tone_style,
          cta_type: validatedData.cta_type,
          creator_persona: validatedData.creator_persona,
          pacing_ads: validatedData.pacing_ads,
          hook_style: validatedData.hook_style,
          status: 'completed',
          generated_video_url: signedVideo?.signedUrl || null,
          storage_path,
          fal_request_id: falResult?.requestId || null,
          first_frame_url: firstFrameUrl,
          last_frame_url: lastFrameUrl,
          first_frame_storage_path: firstFrameStoragePath,
          last_frame_storage_path: lastFrameStoragePath,
          metadata: {
            enhanced_prompt: enhancedPrompt,
            timestamp: new Date().toISOString(),
            first_frame_source: validatedData.first_frame_source,
            last_frame_source: validatedData.last_frame_source
          }
        }
      ])
      .select();

    if (insertErr) {
      console.error('Error inserting diverse_motion:', insertErr);
      return NextResponse.json({ error: 'Failed to save diverse motion' }, { status: 500 });
    }

    // Add to library
    await supabase
      .from('library_items')
      .insert({
        user_id: user.id,
        content_type: 'diverse_motions',
        content_id: inserted?.[0]?.id,
        date_added_to_library: new Date().toISOString()
      });

    return NextResponse.json({
      message: 'Diverse motion generated and saved successfully',
      diverseMotion: inserted?.[0] || null,
      requestId: falResult?.requestId || null
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error generating diverse motion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}