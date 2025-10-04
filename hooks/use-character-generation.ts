"use client"

import { useState, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'
import { useArtifactsApi } from '@/hooks/use-artifacts-api'

interface Character {
  name: string
  description: string
  role: string
  customRole?: string
  skinTone: string
  hairColor: string
  eyeColor: string
  outfitMain: string
  outfitAccent?: string
  images?: string[]
}

interface ComicSettings {
  inspirationStyle: string
  vibe: string
  type: string
}

interface GenerationResult {
  images: CharacterVariation[]
  variations: Array<{
    url: string
    variationNumber: number
    metadata: {
      character: any
      comicSettings: any
      artifactContext: any
      generationContext: any
      technical: any
    }
  }>
  seed: number
  prompt: string
  metadata: {
    totalVariations: number
    generationTimestamp: string
    comicTitle: string
    selectedArtifact: any
    generationContext: any
  }
}

export function useCharacterGeneration() {
  const [variations, setVariations] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined)
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null)
  const { createArtifact } = useArtifactsApi()

  const generateCharacter = useCallback(async (
    character: Character, 
    comicSettings: ComicSettings, 
    options?: {
      comicTitle?: string
      selectedArtifact?: { 
        id: string, 
        title?: string,
        isPublic?: boolean,
        type?: string,
        section?: string
      }
    }
  ) => {
    setIsGenerating(true)
    setVariations([])
    setSelectedIndex(undefined)
    setGenerationResult(null)

    console.log('🎨 Starting character generation...')
    console.log('Character:', character.name || 'Unnamed')
    console.log('Comic Settings:', comicSettings)
    console.log('Options:', options)

    // Build comprehensive metadata
    const metadata = {
      comicTitle: options?.comicTitle,
      selectedArtifact: options?.selectedArtifact ? {
        id: options.selectedArtifact.id,
        title: options.selectedArtifact.title,
        isPublic: options.selectedArtifact.isPublic,
        type: options.selectedArtifact.type,
        section: options.selectedArtifact.section
      } : undefined,
      generationContext: {
        formType: 'comics-form',
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
      }
    }

    try {
      console.log('📡 Sending request to fal.ai with metadata...')
      const response = await fetch('/api/generate-character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character,
          comicSettings,
          metadata
        }),
      })

      console.log('📡 Response received:', response.status)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate character')
      }

      if (data.success) {
        console.log('✅ Generation successful!', data.images?.length, 'images generated')
        console.log('🖼️ Frontend received images:', data.images)
        console.log('📊 Frontend received variations metadata:', data.variations)
        setVariations(data.images)
        setGenerationResult(data)
        console.log('🔄 Variations state updated:', data.images)
        
        // Automatically save character variations based on selected artifact's public status
        if (data.variations && data.variations.length > 0) {
          const comicTitle = options.comicTitle || 'Untitled Comic'
          const isPublicArtifact = options?.selectedArtifact?.isPublic || false
          
          if (isPublicArtifact) {
            console.log('🎨 Auto-saving character variations to Templates (public artifact selected)...')
          } else {
            console.log('🎨 Auto-saving character variations to main artifacts (private artifact selected)...')
          }
          
          for (const variation of data.variations) {
            try {
              await createArtifact({
                title: `${comicTitle} - Character Variation ${variation.variationNumber}`,
                description: `Character variation generated for "${comicTitle}" comic project using ${options?.selectedArtifact?.title || 'selected artifact'}`,
                type: (options?.selectedArtifact?.type || 'comic') as any, // Use the original artifact type
                content: { image: variation.url },
                metadata: { 
                  isPublic: isPublicArtifact, // Use the same public status as the selected artifact
                  originalComic: comicTitle,
                  variationNumber: variation.variationNumber,
                  characterVariation: true,
                  characterName: character.name || 'Unnamed Character',
                  characterDescription: character.description,
                  // Rich metadata from generation
                  generationMetadata: variation.metadata,
                  artifactContext: options?.selectedArtifact ? {
                    id: options.selectedArtifact.id,
                    title: options.selectedArtifact.title,
                    isPublic: options.selectedArtifact.isPublic,
                    type: options.selectedArtifact.type,
                    section: options.selectedArtifact.section
                  } : null,
                  generationTimestamp: data.metadata.generationTimestamp,
                  autoSaved: true
                },
                is_template: isPublicArtifact // Only set as template if the source artifact was public
              })
              console.log(`✅ Character variation ${variation.variationNumber} saved ${isPublicArtifact ? 'to Templates' : 'to main artifacts'} with rich metadata`)
            } catch (error) {
              console.error(`❌ Failed to save character variation ${variation.variationNumber}:`, error)
            }
          }
        }
        
        toast({
          title: "🎉 Character Generated!",
          description: `2 variations have been created. Choose your favorite!`,
        })
      } else {
        throw new Error(data.error || 'Generation failed')
      }
    } catch (error) {
      console.error('❌ Character generation error:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate character variations",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
      console.log('🏁 Generation process completed')
    }
  }, [])

  const regenerateCharacter = useCallback(async (
    character: Character, 
    comicSettings: ComicSettings, 
    options?: {
      comicTitle?: string
      selectedArtifact?: { 
        id: string, 
        title?: string,
        isPublic?: boolean,
        type?: string,
        section?: string
      }
    }
  ) => {
    await generateCharacter(character, comicSettings, options)
  }, [generateCharacter])

  const selectVariation = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  const confirmSelection = useCallback(() => {
    if (selectedIndex !== undefined && variations[selectedIndex]) {
      const selectedVariation = variations[selectedIndex]
      toast({
        title: "Character Selected!",
        description: `Variation ${selectedIndex + 1} has been chosen.`,
      })
      return selectedVariation
    }
    return null
  }, [selectedIndex, variations])

  const clearVariations = useCallback(() => {
    setVariations([])
    setSelectedIndex(undefined)
    setGenerationResult(null)
  }, [])

  // Function to save all existing variations to Templates
  const saveAllVariationsToTemplates = useCallback(async (comicTitle: string = 'Previous Generation') => {
    if (variations.length === 0) {
      console.log('No variations to save')
      return
    }

    console.log('💾 Saving all existing variations to Templates with metadata...')
    
    // Use generation result metadata if available, otherwise create basic metadata
    const baseMetadata = generationResult?.metadata || {
      totalVariations: variations.length,
      generationTimestamp: new Date().toISOString(),
      comicTitle: comicTitle,
      selectedArtifact: null,
      generationContext: { formType: 'comics-form', timestamp: new Date().toISOString() }
    }
    
    const isPublicArtifact = baseMetadata.selectedArtifact?.isPublic || false
    
    for (let i = 0; i < variations.length; i++) {
      const variationUrl = variations[i]
      const variationMetadata = generationResult?.variations?.[i]?.metadata
      
      try {
        await createArtifact({
          title: `${comicTitle} - Character Variation ${i + 1}`,
          description: `Character variation from previous generation${baseMetadata.selectedArtifact ? ` using ${baseMetadata.selectedArtifact.title || 'selected artifact'}` : ''}`,
          type: (baseMetadata.selectedArtifact?.type || 'comic') as any, // Use the original artifact type
          content: { image: variationUrl },
          metadata: { 
            isPublic: isPublicArtifact, // Use the same public status as the selected artifact
            originalComic: comicTitle,
            variationNumber: i + 1,
            characterVariation: true,
            savedFromPreviousGeneration: true,
            // Include rich metadata if available
            generationMetadata: variationMetadata || null,
            artifactContext: baseMetadata.selectedArtifact,
            generationTimestamp: baseMetadata.generationTimestamp,
            generationContext: baseMetadata.generationContext,
            manualSave: true
          },
          is_template: isPublicArtifact // Only set as template if the source artifact was public
        })
        console.log(`✅ Saved variation ${i + 1} ${isPublicArtifact ? 'to Templates' : 'to main artifacts'} with metadata`)
      } catch (error) {
        console.error(`❌ Failed to save variation ${i + 1}:`, error)
      }
    }
    
    toast({
      title: "💾 All Variations Saved!",
      description: `${variations.length} variations have been saved ${isPublicArtifact ? 'to Templates' : 'to main artifacts'} with rich metadata`,
    })
  }, [variations, generationResult, createArtifact, toast])

  return {
    variations,
    isGenerating,
    selectedIndex,
    generationResult,
    generateCharacter,
    regenerateCharacter,
    selectVariation,
    confirmSelection,
    clearVariations,
    saveAllVariationsToTemplates
  }
}
