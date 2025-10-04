import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for product mockup creation
const createProductMockupSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  selected_artifact: z.string().optional(),
  product_type: z.string().optional(),
  mockup_style: z.string().optional(),
  device_type: z.string().optional(),
  orientation: z.string().optional(),
  background_type: z.string().optional(),
  lighting: z.string().optional(),
  angle: z.string().optional(),
  brand_colors: z.record(z.any()).optional(),
  logo_placement: z.string().optional(),
  text_overlay: z.record(z.any()).optional(),
  content: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  is_template: z.boolean().optional().default(false),
})

// GET /api/product-mockups - Get user's product mockups
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
      .from('product_mockups')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination (use range instead of limit to avoid conflicts)
    query = query.range(offset, offset + limit - 1)

    const { data: productMockups, error } = await query

    if (error) {
      console.error('Error fetching product mockups:', error)
      return NextResponse.json({ error: 'Failed to fetch product mockups' }, { status: 500 })
    }

    return NextResponse.json({ productMockups }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error in GET /api/product-mockups:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/product-mockups - Create new product mockup
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
    const validatedData = createProductMockupSchema.parse(body)

    // Create product mockup
    const { data: productMockup, error } = await supabase
      .from('product_mockups')
      .insert({
        user_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        selected_artifact: validatedData.selected_artifact,
        product_type: validatedData.product_type,
        mockup_style: validatedData.mockup_style,
        device_type: validatedData.device_type,
        orientation: validatedData.orientation,
        background_type: validatedData.background_type,
        lighting: validatedData.lighting,
        angle: validatedData.angle,
        brand_colors: validatedData.brand_colors,
        logo_placement: validatedData.logo_placement,
        text_overlay: validatedData.text_overlay,
        content: validatedData.content,
        metadata: validatedData.metadata,
        is_template: validatedData.is_template,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating product mockup:', error)
      return NextResponse.json({ error: 'Failed to create product mockup' }, { status: 500 })
    }

    return NextResponse.json({ productMockup }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Unexpected error in POST /api/product-mockups:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
