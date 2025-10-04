import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for artifact updates
const updateArtifactSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  type: z.enum([
    'comic', 'illustration', 'avatar', 'product_mockup', 
    'concept_world', 'chart_infographic', 'cinematic_clip',
    'explainer', 'product_motion', 'social_cut', 'talking_avatar',
    'ugc_ad', 'template'
  ]).optional(),
  content: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  status: z.enum(['draft', 'processing', 'completed', 'failed']).optional(),
  is_template: z.boolean().optional(),
})

// GET /api/artifacts/[id] - Get specific artifact
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: artifact, error } = await supabase
      .from('artifacts')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
      }
      console.error('Error fetching artifact:', error)
      return NextResponse.json({ error: 'Failed to fetch artifact' }, { status: 500 })
    }

    return NextResponse.json({ artifact })
  } catch (error) {
    console.error('Unexpected error in GET /api/artifacts/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/artifacts/[id] - Update artifact
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateArtifactSchema.parse(body)

    // Update artifact
    const { data: artifact, error } = await supabase
      .from('artifacts')
      .update(validatedData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
      }
      console.error('Error updating artifact:', error)
      return NextResponse.json({ error: 'Failed to update artifact' }, { status: 500 })
    }

    return NextResponse.json({ artifact })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Unexpected error in PUT /api/artifacts/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/artifacts/[id] - Delete artifact
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if artifact exists and belongs to user
    const { data: existingArtifact, error: fetchError } = await supabase
      .from('artifacts')
      .select('id, is_default')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
      }
      console.error('Error checking artifact:', fetchError)
      return NextResponse.json({ error: 'Failed to check artifact' }, { status: 500 })
    }

    // Prevent deletion of default artifacts
    if (existingArtifact.is_default) {
      return NextResponse.json({ error: 'Cannot delete default artifact' }, { status: 400 })
    }

    // Delete artifact
    const { error } = await supabase
      .from('artifacts')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting artifact:', error)
      return NextResponse.json({ error: 'Failed to delete artifact' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Artifact deleted successfully' })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/artifacts/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


