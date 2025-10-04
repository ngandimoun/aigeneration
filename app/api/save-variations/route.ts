import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { variations, comicTitle = 'Previous Generation' } = body

    if (!variations || !Array.isArray(variations)) {
      return NextResponse.json({ error: 'Invalid variations data' }, { status: 400 })
    }

    console.log(`💾 Bulk saving ${variations.length} variations to Templates for user ${user.id}...`)

    const savedVariations = []
    const themes = ['elephant', 'lion', 'panda', 'penguin', 'koala', 'tiger', 'elephant', 'monkey']

    for (let i = 0; i < variations.length; i++) {
      const variationUrl = variations[i]
      const theme = themes[i] || 'character'
      const generation = i < 4 ? 1 : 2
      
      try {
        const { data: artifact, error } = await supabase
          .from('artifacts')
          .insert({
            user_id: user.id,
            title: `${comicTitle} - Character Variation ${i + 1}`,
            description: `Character variation from previous generation - ${theme} themed character`,
            type: 'template',
            content: { image: variationUrl },
            metadata: { 
              isPublic: true, 
              originalComic: comicTitle,
              variationNumber: i + 1,
              characterVariation: true,
              savedFromPreviousGeneration: true,
              theme: theme,
              generation: generation
            },
            is_template: true,
            is_default: false,
            status: 'completed'
          })
          .select()
          .single()

        if (error) {
          console.error(`❌ Failed to save variation ${i + 1}:`, error)
        } else {
          console.log(`✅ Saved variation ${i + 1} (${theme}) to Templates`)
          savedVariations.push(artifact)
        }
      } catch (error) {
        console.error(`❌ Error saving variation ${i + 1}:`, error)
      }
    }

    return NextResponse.json({ 
      success: true, 
      savedCount: savedVariations.length,
      totalCount: variations.length,
      message: `Successfully saved ${savedVariations.length} out of ${variations.length} variations to Templates`
    })

  } catch (error) {
    console.error('❌ Bulk save variations error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save variations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
