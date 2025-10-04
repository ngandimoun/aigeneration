import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artifactId = params.id
    
    if (!artifactId) {
      return NextResponse.json(
        { error: 'Artifact ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all artifacts that were generated using this artifact
    // We look for artifacts with metadata.artifactContext.id matching the selected artifact
    const { data: generations, error } = await supabase
      .from('artifacts')
      .select('*')
      .eq('user_id', user.id)
      .contains('metadata', { artifactContext: { id: artifactId } })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching generations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch generations' },
        { status: 500 }
      )
    }

    // Process the generations to extract relevant information
    const processedGenerations = generations.map(generation => {
      const metadata = generation.metadata || {}
      const artifactContext = metadata.artifactContext || {}
      const generationMetadata = metadata.generationMetadata || {}
      const character = generationMetadata.character || {}
      const comicSettings = generationMetadata.comicSettings || {}
      const generationContext = generationMetadata.generationContext || {}

      return {
        id: generation.id,
        title: generation.title,
        description: generation.description,
        image: generation.content?.image || '/placeholder.jpg',
        type: generation.type,
        isPublic: generation.is_template || false,
        created_at: generation.created_at,
        // Generation-specific data
        comicTitle: generationContext.comicTitle || 'Untitled Comic',
        characterName: character.name || 'Unnamed Character',
        characterDescription: character.description || '',
        comicSettings: {
          inspirationStyle: comicSettings.inspirationStyle || '',
          vibe: comicSettings.vibe || '',
          type: comicSettings.type || ''
        },
        generationTimestamp: generationContext.timestamp || generation.created_at,
        variationNumber: metadata.variationNumber || 1,
        isCharacterVariation: metadata.characterVariation || false,
        autoSaved: metadata.autoSaved || false,
        manualSave: metadata.manualSave || false
      }
    })

    // Group generations by comic project for better organization
    const groupedGenerations = processedGenerations.reduce((acc, generation) => {
      const key = generation.comicTitle
      if (!acc[key]) {
        acc[key] = {
          comicTitle: generation.comicTitle,
          generations: [],
          totalVariations: 0,
          latestGeneration: generation.generationTimestamp
        }
      }
      acc[key].generations.push(generation)
      acc[key].totalVariations += 1
      
      // Update latest generation timestamp
      if (new Date(generation.generationTimestamp) > new Date(acc[key].latestGeneration)) {
        acc[key].latestGeneration = generation.generationTimestamp
      }
      
      return acc
    }, {} as Record<string, {
      comicTitle: string
      generations: typeof processedGenerations
      totalVariations: number
      latestGeneration: string
    }>)

    // Convert to array and sort by latest generation
    const groupedArray = Object.values(groupedGenerations).sort((a, b) => 
      new Date(b.latestGeneration).getTime() - new Date(a.latestGeneration).getTime()
    )

    return NextResponse.json({
      success: true,
      generations: groupedArray,
      totalGenerations: processedGenerations.length,
      totalProjects: groupedArray.length
    })

  } catch (error) {
    console.error('Error in generations API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
