import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for general artifact creation
const createArtifactSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  content: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  is_public: z.boolean().optional().default(false),
  is_default: z.boolean().optional().default(false),
})

// GET /api/artifacts - Get user's artifacts
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
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const isPinned = searchParams.get('is_pinned')
    const isFavorite = searchParams.get('is_favorite')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build optimized query with filters
    let query = supabase
      .from('artifacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters (removed type filter since artifacts table no longer has type field)
    if (status) {
      query = query.eq('status', status)
    }
    if (isPinned !== null) {
      query = query.eq('is_pinned', isPinned === 'true')
    }
    if (isFavorite !== null) {
      query = query.eq('is_favorite', isFavorite === 'true')
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching artifacts:', error)
      return NextResponse.json({ error: 'Failed to fetch artifacts' }, { status: 500 })
    }

    return NextResponse.json({ artifacts: data })
  } catch (error) {
    console.error('Unexpected error in GET /api/artifacts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/artifacts - Create templates and general artifacts only
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
    console.log('📝 POST /api/artifacts - Request body:', body)
    const validatedData = createArtifactSchema.parse(body)
    console.log('✅ POST /api/artifacts - Validated data:', validatedData)

    // Create general artifact in the artifacts table
    console.log('📝 Creating general artifact in artifacts table')
    const { data: artifact, error } = await supabase
      .from('artifacts')
      .insert({
        user_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        content: validatedData.content,
        metadata: validatedData.metadata,
        is_public: validatedData.is_public,
        is_default: validatedData.is_default,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating artifact:', error)
      return NextResponse.json({ error: 'Failed to create artifact' }, { status: 500 })
    }

    console.log('✅ Artifact created successfully in main table:', artifact)
    return NextResponse.json({ artifact }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Unexpected error in POST /api/artifacts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


