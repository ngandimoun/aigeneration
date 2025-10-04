import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/artifacts/[id]/pin - Toggle artifact pin status
export async function POST(
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

    // First get the current pin status
    const { data: artifact, error: fetchError } = await supabase
      .from('artifacts')
      .select('is_pinned')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching artifact:', fetchError)
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
    }

    // Toggle the pin status
    const newPinStatus = !artifact.is_pinned
    const { error: updateError } = await supabase
      .from('artifacts')
      .update({ is_pinned: newPinStatus })
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error toggling artifact pin:', updateError)
      return NextResponse.json({ error: 'Failed to toggle pin status' }, { status: 500 })
    }

    return NextResponse.json({ is_pinned: newPinStatus })
  } catch (error) {
    console.error('Unexpected error in POST /api/artifacts/[id]/pin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


