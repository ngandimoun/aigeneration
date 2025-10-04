import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for product motion creation
const createProductMotionSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  selected_artifact: z.string().optional(),
  motion_type: z.string().optional(),
  product_type: z.string().optional(),
  animation_style: z.string().optional(),
  duration: z.number().optional(),
  loop_type: z.string().optional(),
  camera_angle: z.string().optional(),
  lighting_setup: z.string().optional(),
  background_type: z.string().optional(),
  focus_point: z.string().optional(),
  motion_speed: z.string().optional(),
  content: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  is_template: z.boolean().optional().default(false),
})

// GET /api/product-motion - Get user's product motion
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
      .from('product_motion')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination (use range instead of limit to avoid conflicts)
    query = query.range(offset, offset + limit - 1)

    const { data: productMotion, error } = await query

    if (error) {
      console.error('Error fetching product motion:', error)
      return NextResponse.json({ error: 'Failed to fetch product motion' }, { status: 500 })
    }

    return NextResponse.json({ productMotion }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error in GET /api/product-motion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/product-motion - Create new product motion
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createProductMotionSchema.parse(body)

    // Create product motion
    const { data: productMotion, error } = await supabase
      .from('product_motion')
      .insert({
        user_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        selected_artifact: validatedData.selected_artifact,
        motion_type: validatedData.motion_type,
        product_type: validatedData.product_type,
        animation_style: validatedData.animation_style,
        duration: validatedData.duration,
        loop_type: validatedData.loop_type,
        camera_angle: validatedData.camera_angle,
        lighting_setup: validatedData.lighting_setup,
        background_type: validatedData.background_type,
        focus_point: validatedData.focus_point,
        motion_speed: validatedData.motion_speed,
        content: validatedData.content,
        metadata: validatedData.metadata,
        is_template: validatedData.is_template,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating product motion:', error)
      return NextResponse.json({ error: 'Failed to create product motion' }, { status: 500 })
    }

    return NextResponse.json({ productMotion }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Unexpected error in POST /api/product-motion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
