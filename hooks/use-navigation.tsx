"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface Artifact {
  id: string
  title: string
  image: string
  description: string
  section: string
  isPublic?: boolean
}

interface NavigationContextType {
  selectedSection: string
  setSelectedSection: (section: string) => void
  getDisplayTitle: () => string
  artifacts: Artifact[]
  getArtifactsBySection: (section: string) => Artifact[]
  addArtifact: (artifact: Omit<Artifact, 'id' | 'section'>) => void
  showArtifactForm: boolean
  setShowArtifactForm: (show: boolean) => void
  showProjectForm: boolean
  setShowProjectForm: (show: boolean) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [selectedSection, setSelectedSection] = useState<string>("artifacts")
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [showArtifactForm, setShowArtifactForm] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)

  const getArtifactsBySection = (section: string) => {
    return artifacts.filter(artifact => artifact.section === section)
  }

  const addArtifact = (artifact: Omit<Artifact, 'id' | 'section'>) => {
    const newArtifact: Artifact = {
      ...artifact,
      id: Date.now().toString(),
      section: selectedSection
    }
    setArtifacts(prev => [...prev, newArtifact])
    setShowArtifactForm(false)
    setShowProjectForm(false)
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

  return (
    <NavigationContext.Provider value={{ 
      selectedSection, 
      setSelectedSection: handleSetSelectedSection, 
      getDisplayTitle, 
      artifacts, 
      getArtifactsBySection,
      addArtifact, 
      showArtifactForm, 
      setShowArtifactForm,
      showProjectForm,
      setShowProjectForm
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
