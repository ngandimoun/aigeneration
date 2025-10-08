"use client"

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react"
import { useArtifactsApi } from "@/hooks/use-artifacts-api"

interface Artifact {
  id: string
  title: string
  image: string
  description: string
  section: string
  type: string
  isPublic?: boolean
  isDefault?: boolean
}

interface NavigationContextType {
  selectedSection: string
  setSelectedSection: (section: string) => void
  getDisplayTitle: () => string
  artifacts: Artifact[]
  getArtifactsBySection: (section: string) => Artifact[]
  addArtifact: (artifact: { 
    title: string; 
    image?: string; 
    description: string; 
    isPublic?: boolean; 
    style?: string;
    characterVariations?: string[];
    hasPublicArtifact?: boolean;
  }) => Promise<void>
  deleteArtifact: (id: string) => Promise<void>
  refreshArtifacts: () => Promise<void>
  showArtifactForm: boolean
  setShowArtifactForm: (show: boolean) => void
  showProjectForm: boolean
  setShowProjectForm: (show: boolean) => void
  isLoadingArtifacts: boolean
  // Character variations state - only available when there are artifacts or in comics section
  characterVariations?: string[]
  setCharacterVariations?: (variations: string[]) => void
  characterVariationsMetadata?: Array<{
    url: string
    variationNumber: number
    metadata: any
  }> | null
  setCharacterVariationsMetadata?: (metadata: Array<{
    url: string
    variationNumber: number
    metadata: any
  }> | null) => void
  isGeneratingVariations?: boolean
  setIsGeneratingVariations?: (isGenerating: boolean) => void
  // Selected artifact state
  selectedArtifact: Artifact | null
  setSelectedArtifact: (artifact: Artifact | null) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [selectedSection, setSelectedSection] = useState<string>("artifacts")
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [showArtifactForm, setShowArtifactForm] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [isLoadingArtifacts, setIsLoadingArtifacts] = useState(true)
  const [artifactsLoaded, setArtifactsLoaded] = useState(false)
  // Character variations state
  const [characterVariations, setCharacterVariations] = useState<string[]>([])
  const [characterVariationsMetadata, setCharacterVariationsMetadata] = useState<Array<{
    url: string
    variationNumber: number
    metadata: any
  }> | null>(null)
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false)
  // Selected artifact state
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)
  const { fetchArtifacts, createArtifact, deleteArtifact: deleteArtifactApi } = useArtifactsApi()

  // Stable references for character variations functions
  const setCharacterVariationsStable = useCallback((variations: string[]) => {
    console.log('🔄 NavigationProvider setCharacterVariationsStable called with:', variations)
    setCharacterVariations(variations)
    console.log('✅ NavigationProvider characterVariations state updated')
  }, [])

  const setIsGeneratingVariationsStable = useCallback((isGenerating: boolean) => {
    console.log('🔄 NavigationProvider setIsGeneratingVariationsStable called with:', isGenerating)
    setIsGeneratingVariations(isGenerating)
    console.log('✅ NavigationProvider isGeneratingVariations state updated')
  }, [])

  const setCharacterVariationsMetadataStable = useCallback((metadata: Array<{
    url: string
    variationNumber: number
    metadata: any
  }> | null) => {
    console.log('🔄 NavigationProvider setCharacterVariationsMetadataStable called with:', metadata)
    setCharacterVariationsMetadata(metadata)
    console.log('✅ NavigationProvider characterVariationsMetadata state updated')
  }, [])

  // Load section-specific data from Supabase
  const loadSectionData = async (section: string) => {
    setIsLoadingArtifacts(true)
    try {
      let data: any[] = []
      
      // Map sections to their corresponding API endpoints
      const sectionToApiMap: Record<string, string> = {
        'artifacts': '/api/artifacts',
        'comics': '/api/comics',
        'illustration': '/api/illustrations',
        'avatars-personas': '/api/avatars',
        'product-mockups': '/api/product-mockups',
        'concept-worlds': '/api/concept-worlds',
        'charts-infographics': '/api/charts-infographics',
        'cinematic-clips': '/api/cinematic-clips',
        'explainers': '/api/explainers',
        'product-motion': '/api/product-motion',
        'social-cuts': '/api/social-cuts',
        'talking-avatars': '/api/talking-avatars',
        'ugc-ads': '/api/ugc-ads',
        'voice-creation': '/api/voice-creation',
        'voiceovers': '/api/voiceovers',
        'sound-fx': '/api/sound-fx',
        'templates': '/api/templates'
      }
      
      const apiEndpoint = sectionToApiMap[section]
      
      if (apiEndpoint) {
        console.log(`🔄 Loading data for section "${section}" from ${apiEndpoint}`)
        const response = await fetch(apiEndpoint)
        
        if (response.ok) {
          const responseData = await response.json()
          
          // Handle different response formats from different APIs
          if (responseData.avatars) {
            data = responseData.avatars
          } else if (responseData.comics) {
            data = responseData.comics
          } else if (responseData.illustrations) {
            data = responseData.illustrations
          } else if (responseData.productMockups) {
            data = responseData.productMockups
          } else if (responseData.conceptWorlds) {
            data = responseData.conceptWorlds
          } else if (responseData.chartsInfographics) {
            data = responseData.chartsInfographics
          } else if (responseData.cinematicClips) {
            data = responseData.cinematicClips
          } else if (responseData.explainers) {
            data = responseData.explainers
          } else if (responseData.productMotion) {
            data = responseData.productMotion
          } else if (responseData.socialCuts) {
            data = responseData.socialCuts
          } else if (responseData.talkingAvatars) {
            data = responseData.talkingAvatars
          } else if (responseData.ugcAds) {
            data = responseData.ugcAds
          } else if (responseData.soundFx) {
            data = responseData.soundFx
          } else if (responseData.voiceCreations) {
            data = responseData.voiceCreations
          } else if (responseData.voiceovers) {
            data = responseData.voiceovers
          } else if (responseData.templates) {
            data = responseData.templates
          } else if (responseData.artifacts) {
            data = responseData.artifacts
          } else {
            data = responseData
          }
        } else {
          console.warn(`⚠️ Failed to load data for section "${section}": ${response.statusText}`)
        }
      } else {
        // Fallback to artifacts API for unknown sections
        console.log(`🔄 Loading fallback data for section "${section}" from /api/artifacts`)
        const supabaseArtifacts = await fetchArtifacts()
        data = supabaseArtifacts
      }
      
      // Convert data to the expected format
      const convertedArtifacts: Artifact[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        image: item.content?.image || item.image || '/placeholder.jpg',
        description: item.description || '',
        section: section,
        type: item.type || section,
        isPublic: item.is_public || item.isPublic || item.is_template || false,
        isDefault: item.is_default || item.isDefault || false
      }))
      
      console.log(`✅ Loaded ${convertedArtifacts.length} items for section "${section}"`)
      setArtifacts(convertedArtifacts)
      setArtifactsLoaded(true)
    } catch (error) {
      console.error(`❌ Failed to load data for section "${section}":`, error)
    } finally {
      setIsLoadingArtifacts(false)
    }
  }

  // Load data when component mounts or section changes
  useEffect(() => {
    loadSectionData(selectedSection)
  }, [selectedSection])


  const getArtifactsBySection = (section: string) => {
    return artifacts.filter(artifact => artifact.section === section)
  }

  // Function to refresh data for current section
  const refreshArtifacts = async () => {
    await loadSectionData(selectedSection)
  }

  // Refresh artifacts when page regains focus (e.g., user returns from another tab)
  useEffect(() => {
    const handleFocus = () => {
      if (artifactsLoaded) {
        refreshArtifacts()
      }
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [artifactsLoaded, refreshArtifacts])

  const addArtifact = async (artifact: { 
    title: string; 
    image?: string; 
    description: string; 
    isPublic?: boolean; 
    style?: string;
    characterVariations?: string[];
    hasPublicArtifact?: boolean;
    // Add support for all form metadata
    [key: string]: any;
  }) => {
    console.log('🔧 addArtifact called with:', artifact)
    try {
      // Map section to specific API endpoint
      const sectionToApiMap: Record<string, string> = {
        'comics': '/api/comics',
        'illustration': '/api/illustrations',
        'avatars-personas': '/api/avatars',
        'product-mockups': '/api/product-mockups',
        'concept-worlds': '/api/concept-worlds',
        'charts-infographics': '/api/charts-infographics',
        'cinematic-clips': '/api/cinematic-clips',
        'explainers': '/api/explainers',
        'product-motion': '/api/product-motion',
        'social-cuts': '/api/social-cuts',
        'talking-avatars': '/api/talking-avatars',
        'ugc-ads': '/api/ugc-ads',
        'voice-creation': '/api/voice-creation',
        'voiceovers': '/api/voiceovers',
        'sound-fx': '/api/sound-fx',
        'templates': '/api/templates', // Templates use independent templates API
        'artifacts': '/api/artifacts' // General artifacts use artifacts API
      }
      
      const apiEndpoint = sectionToApiMap[selectedSection] || '/api/artifacts'
      
      // Extract all form metadata (everything except title, image, description)
      const { title, image, description, isPublic, style, characterVariations, hasPublicArtifact, ...formMetadata } = artifact
      
      // Create content in specific API endpoint
      console.log('📝 Creating content via API endpoint:', apiEndpoint)
      console.log('📝 Form metadata:', formMetadata)
      
      // Special handling for talking avatars API
      let requestBody: any = {
        title: artifact.title,
        description: artifact.description,
        content: { image: artifact.image || '/placeholder.jpg' },
        metadata: { 
          isPublic: artifact.isPublic, 
          style: artifact.style,
          // Include all form-specific metadata for full traceability
          ...formMetadata
        },
        is_public: artifact.isPublic || false
      }

      // For talking avatars, we need to pass the selected_artifact directly
      if (selectedSection === 'talking-avatars') {
        requestBody = {
          title: artifact.title,
          description: artifact.description,
          script: 'Default script', // Default script since form doesn't collect it
          selected_artifact: artifact.selected_artifact,
          content: { image: artifact.image || '/placeholder.jpg' },
          metadata: { 
            isPublic: artifact.isPublic, 
            style: artifact.style,
            ...formMetadata
          },
          is_public: artifact.isPublic || false
        }
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create content: ${response.statusText}`)
      }
      
      const responseData = await response.json()
      
      // Handle different response formats from different APIs
      let createdArtifact
      if (responseData.avatar) {
        createdArtifact = responseData.avatar
      } else if (responseData.comic) {
        createdArtifact = responseData.comic
      } else if (responseData.illustration) {
        createdArtifact = responseData.illustration
      } else if (responseData.template) {
        createdArtifact = responseData.template
      } else if (responseData.artifact) {
        createdArtifact = responseData.artifact
      } else {
        createdArtifact = responseData
      }
      
      if (createdArtifact) {
        console.log('✅ Content created successfully:', createdArtifact)
        
        // For content type tables, we need to determine the section and type
        let mappedSection = selectedSection
        let contentType = selectedSection.replace('-', '_')
        
        // Map section names to proper artifact format
        const sectionMapping: Record<string, string> = {
          'avatars-personas': 'avatars-personas',
          'product-mockups': 'product-mockups',
          'concept-worlds': 'concept-worlds',
          'charts-infographics': 'charts-infographics',
          'cinematic-clips': 'cinematic-clips',
          'talking-avatars': 'talking-avatars',
          'ugc-ads': 'ugc-ads',
          'product-motion': 'product-motion',
          'social-cuts': 'social-cuts',
          'voice-creation': 'voice-creation',
          'voiceovers': 'voiceovers',
          'sound-fx': 'sound-fx'
        }
        
        mappedSection = sectionMapping[selectedSection] || selectedSection
        
        const newArtifact: Artifact = {
          id: createdArtifact.id,
          title: createdArtifact.title,
          image: createdArtifact.content?.image || '/placeholder.jpg',
          description: createdArtifact.description || '',
          section: mappedSection,
          isPublic: createdArtifact.is_public || false, // Updated to use is_public
          isDefault: createdArtifact.is_default || false // Updated to use is_default
        }
        console.log('📝 Adding content to local state:', newArtifact)
        setArtifacts(prev => {
          const updated = [...prev, newArtifact]
          console.log('📋 Updated artifacts list:', updated)
          return updated
        })

        // Note: Character variations are now automatically saved to Templates during generation
        // when a public artifact is selected, so no need to save them here
      }
      
      // Refresh the current section's data to ensure consistency
      await loadSectionData(selectedSection)
      
      setShowArtifactForm(false)
      setShowProjectForm(false)
    } catch (error) {
      console.error('Failed to create artifact:', error)
    }
  }

  const deleteArtifact = async (id: string) => {
    console.log('🗑️ deleteArtifact called with id:', id)
    try {
      // Delete artifact from database
      const success = await deleteArtifactApi(id)
      
      if (success) {
        console.log('✅ Artifact deleted successfully from database')
        // Remove artifact from local state
        setArtifacts(prev => {
          const updated = prev.filter(artifact => artifact.id !== id)
          console.log('📋 Updated artifacts list after deletion:', updated)
          return updated
        })
        
        // Refresh the current section's data to ensure consistency
        await loadSectionData(selectedSection)
      } else {
        throw new Error('Failed to delete artifact from database')
      }
    } catch (error) {
      console.error('Failed to delete artifact:', error)
      throw error // Re-throw to let the component handle the error
    }
  }

  const getDisplayTitle = () => {
    switch (selectedSection) {
      case "artifacts":
        return "Artifacts"
      case "templates":
        return "Templates"
      case "favorites":
        return "Favorites"
      case "comics":
        return "Comics"
      case "illustration":
        return "Illustration"
      case "avatars-personas":
        return "Avatars & Personas"
      case "product-mockups":
        return "Product Mockups"
      case "concept-worlds":
        return "Concept Worlds"
      case "charts-infographics":
        return "Charts & Infographics"
      case "voice-creation":
        return "Voice Creation"
      case "voiceovers":
        return "Voiceovers"
      case "music-jingles":
        return "Music & Jingles"
      case "sound-fx":
        return "Sound FX"
      case "explainers":
        return "Explainers"
      case "ugc-ads":
        return "UGC Ads"
      case "product-motion":
        return "Product in Motion"
      case "cinematic-clips":
        return "Cinematic Clips"
      case "social-cuts":
        return "Social Cuts"
      case "talking-avatars":
        return "Talking Avatars"
      case "thumbnails-covers":
        return "Thumbnails & Covers"
      case "storyboards-scripts":
        return "Storyboards & Scripts"
      case "ad-templates":
        return "Ad Templates"
      case "brand-kits":
        return "Brand Kits"
      case "merge-videos":
        return "Merge Videos"
      case "trim-video":
        return "Trim Video / Audio"
      case "add-subtitles":
        return "Add Subtitles"
      case "extract-audio":
        return "Extract Audio - Video"
      case "add-sound":
        return "Add Sound to Video"
      case "upscaling":
        return "Upscaling (HD → 4K)"
      case "style-transfer":
        return "Style Transfer"
      case "add-watermark":
        return "Add Watermark"
      case "stitch-clips":
        return "Stitch Clips Together"
      default:
        return "Generate images"
    }
  }

  // Fermer les formulaires quand on change de section
  const handleSetSelectedSection = (section: string) => {
    setSelectedSection(section)
    setShowArtifactForm(false)
    setShowProjectForm(false)
  }

  // Only include character variations data when there are artifacts or when in comics section
  const hasArtifacts = artifacts.length > 0
  const shouldIncludeCharacterVariations = selectedSection === 'comics' || hasArtifacts

  return (
    <NavigationContext.Provider value={{ 
      selectedSection, 
      setSelectedSection: handleSetSelectedSection, 
      getDisplayTitle, 
      artifacts, 
      getArtifactsBySection,
      addArtifact, 
      deleteArtifact,
      refreshArtifacts,
      showArtifactForm, 
      setShowArtifactForm,
      showProjectForm,
      setShowProjectForm,
      isLoadingArtifacts,
      ...(shouldIncludeCharacterVariations && {
        characterVariations,
        setCharacterVariations: setCharacterVariationsStable,
        characterVariationsMetadata,
        setCharacterVariationsMetadata: setCharacterVariationsMetadataStable,
        isGeneratingVariations,
        setIsGeneratingVariations: setIsGeneratingVariationsStable,
      }),
      selectedArtifact,
      setSelectedArtifact
    }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}
