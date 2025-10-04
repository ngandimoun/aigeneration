import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/artifacts/[id]/favorite - Toggle artifact favorite status
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

    // First get the current favorite status
    const { data: artifact, error: fetchError } = await supabase
      .from('artifacts')
      .select('is_favorite')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching artifact:', fetchError)
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
    }

    // Toggle the favorite status
    const newFavoriteStatus = !artifact.is_favorite
    const { error: updateError } = await supabase
      .from('artifacts')
      .update({ is_favorite: newFavoriteStatus })
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error toggling artifact favorite:', updateError)
      return NextResponse.json({ error: 'Failed to toggle favorite status' }, { status: 500 })
    }

    return NextResponse.json({ is_favorite: newFavoriteStatus })
  } catch (error) {
    console.error('Unexpected error in POST /api/artifacts/[id]/favorite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


