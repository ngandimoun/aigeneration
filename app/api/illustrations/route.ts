import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for illustration creation
const createIllustrationSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  selected_artifact: z.string().optional(),
  style: z.string().optional(),
  subject: z.string().optional(),
  mood: z.string().optional(),
  color_palette: z.record(z.any()).optional(),
  dimensions: z.record(z.any()).optional(),
  medium: z.string().optional(),
  inspiration: z.string().optional(),
  content: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  is_template: z.boolean().optional().default(false),
  is_public: z.boolean().optional().default(true), // Ajout
})

// GET /api/illustrations - Get user's illustrations
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
      .from('illustrations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination (use range instead of limit to avoid conflicts)
    query = query.range(offset, offset + limit - 1)

    const { data: illustrations, error } = await query

    if (error) {
      console.error('Error fetching illustrations:', error)
      return NextResponse.json({ error: 'Failed to fetch illustrations' }, { status: 500 })
    }

    return NextResponse.json({ illustrations }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error in GET /api/illustrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/illustrations - Create new illustration
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
    const validatedData = createIllustrationSchema.parse(body)

    // Create illustration
    const { data: illustration, error } = await supabase
      .from('illustrations')
      .insert({
        user_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        selected_artifact: validatedData.selected_artifact,
        style: validatedData.style,
        subject: validatedData.subject,
        mood: validatedData.mood,
        color_palette: validatedData.color_palette,
        dimensions: validatedData.dimensions,
        medium: validatedData.medium,
        inspiration: validatedData.inspiration,
        content: validatedData.content,
        metadata: validatedData.metadata,
        is_template: validatedData.is_template,
        is_public: validatedData.is_public, // Ajout
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating illustration:', error)
      return NextResponse.json({ error: 'Failed to create illustration' }, { status: 500 })
    }

    return NextResponse.json({ illustration }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Unexpected error in POST /api/illustrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
