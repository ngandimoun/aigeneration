import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getFalClient } from '@/lib/utils/fal-client'

// Helper to convert null to undefined for Zod optional()
const nullToUndefined = z.literal('null').transform(() => undefined);

// Character schema for mode "Describe & Create"
const characterSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  artStyle: z.string(),
  customArtStyle: z.string().optional(),
  ageRange: z.string(),
  customAgeRange: z.string().optional(),
  ethnicity: z.string(),
  customEthnicity: z.string().optional(),
  gender: z.string(),
  customGender: z.string().optional(),
  role: z.string(),
  customRole: z.string().optional(),
  bodyType: z.string(),
  customBodyType: z.string().optional(),
  skinTone: z.string(),
  customSkinTone: z.string().optional(),
  hairStyle: z.string(),
  customHairStyle: z.string().optional(),
  hairColor: z.string(),
  customHairColor: z.string().optional(),
  eyeColor: z.string(),
  customEyeColor: z.string().optional(),
  eyeShape: z.string(),
  customEyeShape: z.string().optional(),
  outfitCategory: z.string(),
  customOutfitCategory: z.string().optional(),
  outfitColors: z.string(),
  customOutfitColors: z.string().optional(),
  accessories: z.array(z.string()),
  customAccessory: z.string().optional(),
  expression: z.string(),
  customExpression: z.string().optional(),
  voice: z.string(),
  customVoice: z.string().optional(),
});

const createTalkingAvatarSchema = z.object({
  title: z.string().min(1, "Title is required"),
  
  // Visuals
  use_custom_image: z.boolean(),
  custom_image_path: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  selected_avatar_id: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  
  // Audio Settings
  use_custom_audio: z.boolean(),
  custom_audio_path: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  audio_duration: z.number().optional().nullable().transform(e => e === 0 ? undefined : e).or(nullToUndefined),
  selected_voiceover_id: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  
  // Technical Specifications
  aspect_ratio: z.enum(['16:9', '1:1', '9:16', '4:3', '3:4']).default('16:9'),
  resolution: z.string().default('720p'),
  fps: z.number().default(25),
  max_duration: z.number().min(1).max(60).default(60),
  
  // Advanced Settings
  facial_expressions: z.boolean().default(true),
  gestures: z.boolean().default(true),
  eye_contact: z.boolean().default(true),
  head_movement: z.boolean().default(true),
  
  // Mode 2: Describe & Create
  mode: z.enum(['single', 'describe', 'multi']).optional(),
  main_prompt: z.string().optional(),
  character_count: z.number().optional(),
  characters: z.array(characterSchema).optional(),
  dialog_lines: z.array(z.object({
    id: z.string(),
    characterId: z.string(),
    text: z.string(),
    expression: z.string(),
  })).optional(),
  environment: z.string().optional(),
  custom_environment: z.string().optional(),
  background: z.string().optional(),
  custom_background: z.string().optional(),
  lighting: z.string().optional(),
  custom_lighting: z.string().optional(),
  background_music: z.string().optional(),
  custom_background_music: z.string().optional(),
  sound_effects: z.string().optional(),
  custom_sound_effects: z.string().optional(),
  
  // Mode 3: Multi-Character Scene
  use_custom_scene_image: z.boolean().optional(),
  scene_image: z.any().optional(), // File object
  selected_scene_avatar_id: z.string().optional(),
  scene_description: z.string().optional(),
  scene_character_count: z.number().optional(),
  scene_characters: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),
  scene_dialog_lines: z.array(z.object({
    id: z.string(),
    characterId: z.string(),
    text: z.string(),
    expression: z.string(),
  })).optional(),
  scene_environment: z.string().optional(),
  custom_scene_environment: z.string().optional(),
  scene_background: z.string().optional(),
  custom_scene_background: z.string().optional(),
  scene_lighting: z.string().optional(),
  custom_scene_lighting: z.string().optional(),
  scene_background_music: z.string().optional(),
  custom_scene_background_music: z.string().optional(),
  scene_sound_effects: z.string().optional(),
  custom_scene_sound_effects: z.string().optional(),

  // Metadata
  metadata: z.object({
    projectTitle: z.string().optional(),
    selectedArtifact: z.object({
      id: z.string(),
      title: z.string(),
      image: z.string(),
      description: z.string(),
    }).optional().nullable(),
    timestamp: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData()

    const mode = (formData.get('mode')?.toString() || 'single') as 'single' | 'describe' | 'multi'
    const title = formData.get('title')?.toString() || 'Untitled Talking Avatar'
    const aspect_ratio = (formData.get('aspect_ratio')?.toString() || '16:9') as '16:9' | '1:1' | '9:16' | '4:3' | '3:4'

    // Single mode inputs
    const use_custom_image = formData.get('use_custom_image')?.toString() === 'true'
    const selected_avatar_id = formData.get('selected_avatar_id')?.toString() || undefined
    const customImage = formData.get('customImage') as File | null

    const use_custom_audio = formData.get('use_custom_audio')?.toString() === 'true'
    const selected_voiceover_id = formData.get('selected_voiceover_id')?.toString() || undefined
    const audioFile = formData.get('audioFile') as File | null

    // Validate minimal required inputs
    if (!title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Resolve image_url
    let image_url: string | undefined
    if (use_custom_image && customImage) {
      const sanitizedName = customImage.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
      const imagePath = `renders/talking-avatars/${user.id}/inputs/${uuidv4()}-${sanitizedName}`
      const { error: uploadErr } = await supabase.storage
        .from('dreamcut')
        .upload(imagePath, customImage, { cacheControl: '3600', upsert: false })
      if (uploadErr) {
        return NextResponse.json({ error: `Failed to upload image: ${uploadErr.message}` }, { status: 500 })
      }
      const { data: signed } = await supabase.storage.from('dreamcut').createSignedUrl(imagePath, 86400)
      image_url = signed?.signedUrl
    } else if (!use_custom_image && selected_avatar_id) {
      // Fetch avatar by id to get an existing image path/url
      const { data: avatar } = await supabase
        .from('avatars_personas')
        .select('generated_images, storage_paths')
        .eq('id', selected_avatar_id)
        .single()
      const candidatePath = avatar?.storage_paths?.[0] as string | undefined
      if (candidatePath) {
        const { data: signed } = await supabase.storage.from('dreamcut').createSignedUrl(candidatePath, 86400)
        image_url = signed?.signedUrl
      } else if (avatar?.generated_images?.[0]) {
        image_url = avatar.generated_images[0]
      }
    }

    // Resolve audio_url
    let audio_url: string | undefined
    if (use_custom_audio && audioFile) {
      const sanitizedName = audioFile.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
      const audioPath = `renders/talking-avatars/${user.id}/inputs/${uuidv4()}-${sanitizedName}`
      const { error: uploadErr } = await supabase.storage
        .from('dreamcut')
        .upload(audioPath, audioFile, { cacheControl: '3600', upsert: false })
      if (uploadErr) {
        return NextResponse.json({ error: `Failed to upload audio: ${uploadErr.message}` }, { status: 500 })
      }
      const { data: signed } = await supabase.storage.from('dreamcut').createSignedUrl(audioPath, 86400)
      audio_url = signed?.signedUrl
    } else if (!use_custom_audio && selected_voiceover_id) {
      const { data: voiceover } = await supabase
        .from('voiceovers')
        .select('generated_audio_path, storage_path, content')
        .eq('id', selected_voiceover_id)
        .single()
      const candidateAudioPath = (voiceover?.storage_path || voiceover?.generated_audio_path) as string | undefined
      if (candidateAudioPath) {
        const { data: signed } = await supabase.storage.from('dreamcut').createSignedUrl(candidateAudioPath, 86400)
        audio_url = signed?.signedUrl
      } else if (voiceover?.content?.audio_url) {
        audio_url = voiceover.content.audio_url as string
      }
    }

    // Basic guards for Single mode: require at least one image and one audio source
    if (mode === 'single') {
      if (!image_url) {
        return NextResponse.json({ error: 'No image provided or found for selected avatar' }, { status: 400 })
      }
      if (!audio_url) {
        return NextResponse.json({ error: 'No audio provided or found for selected voiceover' }, { status: 400 })
      }
    }

    // Call fal.ai veed/fabric-1.0 (resolution forced to 720p)
    const fal = getFalClient()
    const falResult = await fal.subscribe('veed/fabric-1.0', {
      input: {
        image_url,
        audio_url,
        resolution: '720p'
      },
      logs: true
    })

    const outputUrl: string | undefined = falResult?.data?.video?.url
    if (!outputUrl) {
      return NextResponse.json({ error: 'Failed to generate video' }, { status: 502 })
    }

    // Download generated video and upload to Supabase Storage
    const resp = await fetch(outputUrl)
    if (!resp.ok) {
      return NextResponse.json({ error: `Failed to download generated video: ${resp.status}` }, { status: 502 })
    }
    const arrayBuffer = await resp.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileName = `${uuidv4()}-generated.mp4`
    const storage_path = `renders/talking-avatars/${user.id}/generated/${fileName}`
    const { error: uploadGenErr } = await supabase.storage
      .from('dreamcut')
      .upload(storage_path, buffer, { contentType: 'video/mp4', cacheControl: '3600' })
    if (uploadGenErr) {
      return NextResponse.json({ error: `Failed to store generated video: ${uploadGenErr.message}` }, { status: 500 })
    }
    const { data: signedVideo } = await supabase.storage.from('dreamcut').createSignedUrl(storage_path, 86400)

    // Persist DB record
    const { data: inserted, error: insertErr } = await supabase
      .from('talking_avatars')
      .insert([
        {
          user_id: user.id,
          title,
          use_custom_image,
          selected_avatar_id: selected_avatar_id || null,
          use_custom_audio,
          selected_voiceover_id: selected_voiceover_id || null,
          aspect_ratio,
          resolution: '720p',
          fps: 25,
          max_duration: 60,
          facial_expressions: true,
          gestures: true,
          eye_contact: true,
          head_movement: true,
          generated_video_url: signedVideo?.signedUrl || null,
          storage_path,
          status: 'completed',
          metadata: {
            mode,
            timestamp: new Date().toISOString()
          }
        }
      ])
      .select()

    if (insertErr) {
      return NextResponse.json({ error: 'Failed to save talking avatar' }, { status: 500 })
    }

    // Add to library
    await supabase
      .from('library_items')
      .insert({
        user_id: user.id,
        content_type: 'talking_avatars',
        content_id: inserted?.[0]?.id,
        date_added_to_library: new Date().toISOString()
      })

    return NextResponse.json({ 
      message: 'Talking Avatar generated and saved successfully',
      talkingAvatar: inserted?.[0] || null,
      requestId: falResult?.requestId || null
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error generating talking avatar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to fetch talking_avatars by user
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: talkingAvatars, error } = await supabase
    .from('talking_avatars')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching talking_avatars:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(talkingAvatars, { status: 200 });
}

// PUT endpoint to update a talking_avatar
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, ...updates } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Talking Avatar ID is required for update' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('talking_avatars')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select();

  if (error) {
    console.error('Error updating talking_avatar:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Talking Avatar not found or unauthorized' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Talking Avatar updated successfully', data }, { status: 200 });
}

// DELETE endpoint to delete a talking_avatar
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Talking Avatar ID is required for deletion' }, { status: 400 });
  }

  const { error } = await supabase
    .from('talking_avatars')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting talking_avatar:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Talking Avatar deleted successfully' }, { status: 200 });
}
