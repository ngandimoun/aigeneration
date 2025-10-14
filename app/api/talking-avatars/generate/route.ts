import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Helper to convert null to undefined for Zod optional()
const nullToUndefined = z.literal('null').transform(() => undefined);

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
    const body = await request.json();
    const validatedData = createTalkingAvatarSchema.parse(body);

    // Simulate video generation and get a placeholder URL
    const generatedVideoFileName = `${uuidv4()}-generated.mp4`;
    const generatedStoragePath = `renders/talking-avatars/${user.id}/generated/${generatedVideoFileName}`;
    const generatedVideoUrl = `https://example.com/generated_talking_avatar/${generatedVideoFileName}`; // Placeholder URL

    const { data, error } = await supabase
      .from('talking_avatars')
      .insert([
        {
          user_id: user.id,
          title: validatedData.title,
          use_custom_image: validatedData.use_custom_image,
          custom_image_path: validatedData.custom_image_path,
          selected_avatar_id: validatedData.selected_avatar_id,
          use_custom_audio: validatedData.use_custom_audio,
          custom_audio_path: validatedData.custom_audio_path,
          audio_duration: validatedData.audio_duration,
          selected_voiceover_id: validatedData.selected_voiceover_id,
          aspect_ratio: validatedData.aspect_ratio,
          resolution: validatedData.resolution,
          fps: validatedData.fps,
          max_duration: validatedData.max_duration,
          facial_expressions: validatedData.facial_expressions,
          gestures: validatedData.gestures,
          eye_contact: validatedData.eye_contact,
          head_movement: validatedData.head_movement,
          generated_video_url: generatedVideoUrl,
          storage_path: generatedStoragePath,
          status: 'completed', // Assuming immediate completion for now
          metadata: validatedData.metadata || {},
          content: {}, // Can be expanded later if needed
        },
      ])
      .select();

    if (error) {
      console.error('Error inserting talking_avatar:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add to library_items with correct schema
    const { error: libraryError } = await supabase
      .from('library_items')
      .insert([
        {
          user_id: user.id,
          content_type: 'talking_avatars',  // Changed from item_type
          content_id: data[0].id,           // Changed from item_id
          // Removed: title, description, image_url, created_at (not in schema)
        },
      ]);

    if (libraryError) {
      console.error('Error inserting into library_items:', libraryError);
      // Decide if this should be a hard fail or just log the error
    }

    return NextResponse.json({ 
      message: 'Talking Avatar generated and saved successfully', 
      data,
      success: true,
      videoUrl: generatedVideoUrl
    }, { status: 200 });
  } catch (validationError) {
    console.error('Validation error:', validationError);
    return NextResponse.json({ error: (validationError as z.ZodError).errors }, { status: 400 });
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
