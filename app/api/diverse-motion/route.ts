import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Helper to convert null to undefined for Zod optional()
const nullToUndefined = z.literal('null').transform(() => undefined);

const createProductMotionSchema = z.object({
  // Mode and Template
  mode: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  template: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  custom_template: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  
  // Product Description & Intent Capture
  product_category: z.enum(['Data Visualizations', 'Infographic', 'Logo Animation', 'UI/UX Element', 'Cinematic Videos']),
  product_name: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  prompt: z.string().min(1, "Prompt is required"),
  core_moment: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  emotional_tone: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  visual_style: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  duration: z.union([z.number(), z.string()]).optional().nullable().transform(e => {
    if (e === '' || e === null || e === undefined) return 10; // Default to 10 seconds when not provided
    return typeof e === 'string' ? Number(e) : e;
  }).pipe(z.number().min(5).max(120).optional()).or(nullToUndefined),
  aspect_ratio: z.enum(['9:16', '16:9', '1:1']).optional().nullable(),
  
  // Visual Context
  environment: z.union([z.enum(['Studio white', 'Urban twilight', 'Forest dawn', 'Black marble', 'Custom']), z.literal('')]).optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  custom_environment: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  lighting_mood: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  material_focus: z.array(z.string()).optional(),
  camera_type: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  frame_rate: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  
  // Motion & Energy
  reveal_type: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  camera_energy: z.union([z.number(), z.string()]).optional().nullable().transform(e => {
    if (e === '' || e === null || e === undefined) return undefined;
    return typeof e === 'string' ? Number(e) : e;
  }).pipe(z.number().min(0).max(100).optional()).or(nullToUndefined),
  loop_mode: z.boolean().optional(),
  hook_intensity: z.union([z.number(), z.string()]).optional().nullable().transform(e => {
    if (e === '' || e === null || e === undefined) return undefined;
    return typeof e === 'string' ? Number(e) : e;
  }).pipe(z.number().min(0).max(100).optional()).or(nullToUndefined),
  end_emotion: z.union([z.number(), z.string()]).optional().nullable().transform(e => {
    if (e === '' || e === null || e === undefined) return undefined;
    return typeof e === 'string' ? Number(e) : e;
  }).pipe(z.number().min(0).max(100).optional()).or(nullToUndefined),
  
  // Audio DNA
  sound_mode: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  sound_mood: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  key_effects: z.array(z.string()).optional(),
  mix_curve: z.union([z.number(), z.string()]).optional().nullable().transform(e => {
    if (e === '' || e === null || e === undefined) return undefined;
    return typeof e === 'string' ? Number(e) : e;
  }).pipe(z.number().min(0).max(100).optional()).or(nullToUndefined),
  
  // Brand Touch
  accent_color_sync: z.boolean().optional(),
  accent_color: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  logo_moment: z.union([z.enum(['Morph From Form', 'Fade-In', 'Hover', 'None']), z.literal('')]).optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  text_constraint: z.boolean().optional(),
  
  // Category-specific fields - Data Visualizations
  chart_type: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  data_points: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  animation_style: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  color_scheme: z.string().optional().nullable().transform(e => e === '' ? undefined : e).or(nullToUndefined),
  
  // Dual and Multi mode controls
  transition_controls: z.object({
    type: z.string().optional(),
    duration: z.number().optional().default(1.0), // Default to 1 second when not provided
    easing: z.string().optional(),
    direction: z.string().optional()
  }).optional().nullable(),

  sequence_controls: z.object({
    style: z.string().optional(),
    global_transition: z.string().optional(),
    transition_duration: z.number().optional().default(0.5), // Default to 0.5 seconds when not provided
    total_duration: z.number().optional()
  }).optional().nullable(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Parse arrays from JSON strings if they exist
    if (body.material_focus && typeof body.material_focus === 'string') {
      body.material_focus = JSON.parse(body.material_focus);
    }
    if (body.key_effects && typeof body.key_effects === 'string') {
      body.key_effects = JSON.parse(body.key_effects);
    }

    const validatedData = createProductMotionSchema.parse(body);

          // For single mode, redirect to dedicated endpoint
          if (validatedData.mode === 'single') {
            return NextResponse.json({ 
              error: 'Single mode requests should be sent to /api/diverse-motion/single endpoint',
              redirect: '/api/diverse-motion/single'
            }, { status: 400 });
          }

          // For dual mode, redirect to dedicated endpoint
          if (validatedData.mode === 'dual') {
            return NextResponse.json({ 
              error: 'Dual mode requests should be sent to /api/diverse-motion/dual endpoint',
              redirect: '/api/diverse-motion/dual'
            }, { status: 400 });
          }

    const { data, error } = await supabase
      .from('diverse_motions')
      .insert([
        {
          user_id: user.id,
          // Mode and Template
          mode: validatedData.mode,
          template: validatedData.template,
          custom_template: validatedData.custom_template,
          // Product Description & Intent Capture
          product_category: validatedData.product_category,
          product_name: validatedData.product_name,
          prompt: validatedData.prompt,
          core_moment: validatedData.core_moment,
          emotional_tone: validatedData.emotional_tone,
          visual_style: validatedData.visual_style,
          duration: validatedData.duration,
          aspect_ratio: validatedData.aspect_ratio,
          
          // Visual Context
          environment: validatedData.environment,
          custom_environment: validatedData.custom_environment,
          lighting_mood: validatedData.lighting_mood,
          material_focus: validatedData.material_focus,
          camera_type: validatedData.camera_type,
          frame_rate: validatedData.frame_rate,
          
          // Motion & Energy
          reveal_type: validatedData.reveal_type,
          camera_energy: validatedData.camera_energy,
          loop_mode: validatedData.loop_mode,
          hook_intensity: validatedData.hook_intensity,
          end_emotion: validatedData.end_emotion,
          
          // Audio DNA
          sound_mode: validatedData.sound_mode,
          sound_mood: validatedData.sound_mood,
          key_effects: validatedData.key_effects,
          mix_curve: validatedData.mix_curve,
          
          // Brand Touch
          accent_color_sync: validatedData.accent_color_sync,
          accent_color: validatedData.accent_color,
          logo_moment: validatedData.logo_moment,
          text_constraint: validatedData.text_constraint,
          
          // Category-specific fields
          chart_type: validatedData.chart_type,
          data_points: validatedData.data_points,
          animation_style: validatedData.animation_style,
          color_scheme: validatedData.color_scheme,
          
          // Generation State
          status: 'pending',
          generated_video_url: null,
          storage_path: null,
          
          // Metadata
          metadata: {
            project_title: body.projectTitle || null,
            selected_artifact: body.selectedArtifact || null,
            template: validatedData.template || null,
            custom_template: validatedData.custom_template || null,
            transition_controls: validatedData.transition_controls || null,
            sequence_controls: validatedData.sequence_controls || null,
            generation_timestamp: new Date().toISOString()
          },
          content: {
            motion_dna: {
              category: validatedData.product_category,
              product: validatedData.product_name,
              prompt: validatedData.prompt,
              core_moment: validatedData.core_moment,
              style: `${validatedData.emotional_tone?.toLowerCase() || 'epic'} ${validatedData.visual_style?.toLowerCase() || 'cinematic'} kinetic reveal`,
              camera: {
                type: validatedData.camera_type?.toLowerCase().replace(/\s+/g, '-') || 'macro-precision',
                movement: `${validatedData.camera_type?.toLowerCase() || 'macro precision'} → ${validatedData.reveal_type?.toLowerCase().replace(/\s+/g, '-') || 'morph'} → hero reveal`,
                frame_rate: validatedData.frame_rate?.split(' ')[2] || "60fps",
                energy: (validatedData.camera_energy || 50) / 100
              },
              lighting: validatedData.lighting_mood?.toLowerCase().replace(/\s+/g, '-') || 'soft-daylight',
              environment: validatedData.environment === "Custom" ? validatedData.custom_environment : validatedData.environment?.toLowerCase().replace(/\s+/g, '-') || 'studio-white',
              materials: validatedData.material_focus?.filter(m => m !== "All").map(m => m.toLowerCase()) || [],
              motion: {
                reveal_type: validatedData.reveal_type?.toLowerCase().replace(/\s+/g, '-') || 'morph',
                camera_energy: (validatedData.camera_energy || 50) / 100,
                loop: validatedData.loop_mode || false,
                hook_intensity: (validatedData.hook_intensity || 50) / 100,
                end_emotion: (validatedData.end_emotion || 50) / 100
              },
              audio: {
                mode: validatedData.sound_mode?.toLowerCase().replace(/\s+/g, '_') || 'sfx_only',
                mood: validatedData.sound_mood?.toLowerCase().replace(/\s+/g, '_') || 'ambient_minimal',
                effects: validatedData.key_effects || [],
                mix_curve: (validatedData.mix_curve || 50) / 100
              },
              branding: {
                accent_color_sync: validatedData.accent_color_sync || false,
                accent_color: validatedData.accent_color || '#3B82F6',
                logo_moment: validatedData.logo_moment?.toLowerCase().replace(/\s+/g, '_') || 'none',
                text_constraint: validatedData.text_constraint || false
              },
              duration: validatedData.duration || 10,
              tone: `${validatedData.emotional_tone?.toLowerCase() || 'epic'}, modern, kinetically poetic`,
              category_specific: validatedData.product_category === "Data Visualizations" ? {
                chart_type: validatedData.chart_type || null,
                data_points: validatedData.data_points || null,
                animation_style: validatedData.animation_style || null,
                color_scheme: validatedData.color_scheme || null
              } : null
            }
          }
        },
      ])
      .select();

    if (error) {
      console.error('Error inserting diverse_motion:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add to library_items with correct schema
    const { error: libraryError } = await supabase
      .from('library_items')
      .insert([
        {
          user_id: user.id,
          content_type: 'diverse_motions',  // Updated to match new table name
          content_id: data[0].id,           // Changed from item_id
          // Removed: title, description, image_url, created_at (not in schema)
        },
      ]);

    if (libraryError) {
      console.error('Error inserting into library_items:', libraryError);
      // Decide if this should be a hard fail or just log the error
    }

    return NextResponse.json({ 
      message: 'Diverse motion generated and saved successfully', 
      data: data[0] 
    }, { status: 200 });

  } catch (validationError) {
    console.error('Validation error:', validationError);
    return NextResponse.json({ 
      error: (validationError as z.ZodError).errors 
    }, { status: 400 });
  }
}

// GET endpoint to fetch product_motions by user
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: diverseMotions, error } = await supabase
    .from('diverse_motions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching diverse_motions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(diverseMotions, { status: 200 });
}

// PUT endpoint to update a diverse_motion
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, ...updates } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Diverse motion ID is required for update' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('diverse_motions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select();

  if (error) {
    console.error('Error updating diverse_motion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Diverse motion not found or unauthorized' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Diverse motion updated successfully', data }, { status: 200 });
}

// DELETE endpoint to delete a diverse_motion
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Diverse motion ID is required for deletion' }, { status: 400 });
  }

  const { error } = await supabase
    .from('diverse_motions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting diverse_motion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Diverse motion deleted successfully' }, { status: 200 });
}