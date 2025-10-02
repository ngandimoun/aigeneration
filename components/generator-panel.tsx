"use client"

import { useEffect, useState } from "react"
import { useNavigation } from "@/hooks/use-navigation"
import { ArtifactCard } from "@/components/artifact-card"
import { ArtifactForm } from "@/components/artifact-form"
import { ImageGeneratorInterface } from "@/components/image-generator-interface"
import { VideoGeneratorInterface } from "@/components/video-generator-interface"
import { IllustrationForm } from "@/components/forms/illustration-form"
import { AvatarsForm } from "@/components/forms/avatars-form"
import { ProductMockupsForm } from "@/components/forms/product-mockups-form"
import { ConceptWorldsForm } from "@/components/forms/concept-worlds-form"
import { ChartsInfographicsForm } from "@/components/forms/charts-infographics-form"
import { ExplainersForm } from "@/components/forms/explainers-form"
import { UGCAdsForm } from "@/components/forms/ugc-ads-form"
import { ProductMotionForm } from "@/components/forms/product-motion-form"
import { CinematicClipsForm } from "@/components/forms/cinematic-clips-form"
import { SocialCutsForm } from "@/components/forms/social-cuts-form"
import { TalkingAvatarsForm } from "@/components/forms/talking-avatars-form"
import { ComicsForm } from "@/components/forms/comics-form"
import { ComicCard } from "@/components/comic-card"
import { Button } from "@/components/ui/button"
import { Plus, FolderPlus } from "lucide-react"

export function GeneratorPanel() {
  const [isMounted, setIsMounted] = useState(false)
  const { getDisplayTitle, selectedSection, getArtifactsBySection, addArtifact, showArtifactForm, setShowArtifactForm, showProjectForm, setShowProjectForm, artifacts } = useNavigation()
  
  // États locaux pour l'interface de génération d'images (Illustration, Avatars & Personas, Product Mockups, Concept Worlds, et Charts & Infographics)
  const [showImageGenerator, setShowImageGenerator] = useState(false)
  const [selectedProject, setSelectedProject] = useState<{title: string, image: string, description: string} | null>(null)
  const [imageGeneratorSection, setImageGeneratorSection] = useState<string | null>(null)
  
  // États locaux pour l'interface de génération vidéo (Explainers, Talking Avatars, Social Cuts, Cinematic Clips, Product in Motion, UGC Ads)
  const [showVideoGenerator, setShowVideoGenerator] = useState(false)
  const [selectedVideoProject, setSelectedVideoProject] = useState<{title: string, image: string, description: string} | null>(null)
  const [videoGeneratorSection, setVideoGeneratorSection] = useState<string | null>(null)
  
  // Obtenir les artifacts filtrés par section
  const sectionArtifacts = getArtifactsBySection(selectedSection)

  // Sections qui supportent la génération d'images
  const imageGenerationSections = ['illustration', 'avatars-personas', 'product-mockups', 'concept-worlds', 'charts-infographics', 'comics']
  
  // Sections qui supportent la génération vidéo
  const videoGenerationSections = ['explainers', 'talking-avatars', 'social-cuts', 'cinematic-clips', 'product-motion', 'ugc-ads']
  
  // Sections qui supportent les nouveaux formulaires
  const newFormSections = ['explainers', 'ugc-ads', 'product-motion', 'cinematic-clips', 'social-cuts', 'talking-avatars', 'comics']
  
  // Helper functions
  const isImageGenerationSection = (section: string) => imageGenerationSections.includes(section)
  const isVideoGenerationSection = (section: string) => videoGenerationSections.includes(section)
  const isNewFormSection = (section: string) => newFormSections.includes(section)
  const shouldShowNewProjectButton = () => (isImageGenerationSection(selectedSection) || isNewFormSection(selectedSection)) && !showProjectForm && !showImageGenerator && !showVideoGenerator
  const shouldShowProjectGrid = () => (isImageGenerationSection(selectedSection) || isNewFormSection(selectedSection)) && sectionArtifacts.length > 0 && !showImageGenerator && !showVideoGenerator
  const shouldShowEmptyState = () => (isImageGenerationSection(selectedSection) || isNewFormSection(selectedSection)) && sectionArtifacts.length === 0 && !showProjectForm && !showImageGenerator && !showVideoGenerator

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fermer l'interface de génération d'images quand on change de section
  useEffect(() => {
    if (imageGeneratorSection && imageGeneratorSection !== selectedSection) {
      setShowImageGenerator(false)
      setSelectedProject(null)
      setImageGeneratorSection(null)
    }
  }, [selectedSection, imageGeneratorSection])

  // Fermer l'interface de génération vidéo quand on change de section
  useEffect(() => {
    if (videoGeneratorSection && videoGeneratorSection !== selectedSection) {
      setShowVideoGenerator(false)
      setSelectedVideoProject(null)
      setVideoGeneratorSection(null)
    }
  }, [selectedSection, videoGeneratorSection])

  // Fonctions pour gérer l'interface de génération d'images (Illustration, Avatars & Personas, Product Mockups, Concept Worlds, et Charts & Infographics)
  const handleProjectClick = (artifact: {title: string, image: string, description: string}) => {
    if (isImageGenerationSection(selectedSection)) {
      setSelectedProject(artifact)
      setImageGeneratorSection(selectedSection)
      setShowImageGenerator(true)
    } else if (isVideoGenerationSection(selectedSection)) {
      setSelectedVideoProject(artifact)
      setVideoGeneratorSection(selectedSection)
      setShowVideoGenerator(true)
    }
  }

  const handleCloseImageGenerator = () => {
    setShowImageGenerator(false)
    setSelectedProject(null)
    setImageGeneratorSection(null)
  }

  const handleCloseVideoGenerator = () => {
    setShowVideoGenerator(false)
    setSelectedVideoProject(null)
    setVideoGeneratorSection(null)
  }

  // Composant pour le bouton New Project
  const NewProjectButton = () => (
    <Button
      size="sm"
      onClick={() => setShowProjectForm(true)}
      className="flex items-center gap-2"
    >
      <FolderPlus className="h-4 w-4" />
      New Project
    </Button>
  )

  // Composant pour le formulaire d'artifact
  const ArtifactFormComponent = ({ type = "artifact" }: { type?: "artifact" | "project" }) => (
    <ArtifactForm 
      onSave={addArtifact}
      onCancel={() => {
        if (type === 'artifact') {
          setShowArtifactForm(false)
        } else {
          setShowProjectForm(false)
        }
      }}
      type={type}
    />
  )

  // Fonction pour rendre le bon formulaire selon la section
  const renderSectionForm = () => {
    const availableArtifacts = artifacts.map(artifact => ({
      id: artifact.id,
      title: artifact.title,
      image: artifact.image,
      description: artifact.description
    }))

    switch (selectedSection) {
      case 'illustration':
        return (
          <IllustrationForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={availableArtifacts}
          />
        )
      case 'avatars-personas':
        return (
          <AvatarsForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={availableArtifacts}
          />
        )
      case 'product-mockups':
        return (
          <ProductMockupsForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={availableArtifacts}
          />
        )
      case 'concept-worlds':
        return (
          <ConceptWorldsForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={availableArtifacts}
          />
        )
      case 'charts-infographics':
        return (
          <ChartsInfographicsForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={availableArtifacts}
          />
        )
      case 'explainers':
        return (
          <ExplainersForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={availableArtifacts}
          />
        )
      case 'ugc-ads':
        return (
          <UGCAdsForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={availableArtifacts}
          />
        )
      case 'product-motion':
        return (
          <ProductMotionForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={availableArtifacts}
          />
        )
      case 'cinematic-clips':
        return (
          <CinematicClipsForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={availableArtifacts}
          />
        )
      case 'social-cuts':
        return (
          <SocialCutsForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={availableArtifacts}
          />
        )
      case 'talking-avatars':
        return (
          <TalkingAvatarsForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={availableArtifacts}
          />
        )
      case 'comics':
        return (
          <ComicsForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={availableArtifacts}
          />
        )
      default:
        return (
          <ArtifactFormComponent type="project" />
        )
    }
  }

  // Composant pour la grille de projets
  const ProjectGrid = () => (
    <div className="grid grid-cols-2 gap-4">
      {sectionArtifacts.map((artifact) => (
        <div
          key={artifact.id}
          className="bg-background border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleProjectClick(artifact)}
        >
          <div className="aspect-square mb-3 overflow-hidden rounded-md">
            <img 
              src={artifact.image} 
              alt={artifact.title}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">
            {artifact.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-3">
            {artifact.description}
          </p>
        </div>
      ))}
    </div>
  )

  // Composant pour la grille de comics
  const ComicsGrid = () => (
    <div className="grid grid-cols-2 gap-4">
      {sectionArtifacts.map((artifact) => {
        // Extraire les données spécifiques au comic depuis l'artifact
        const comicData = artifact as any // Type assertion temporaire
        return (
          <ComicCard
            key={artifact.id}
            title={artifact.title}
            image={artifact.image}
            description={artifact.description}
            type={comicData.type || 'color'}
            vibe={comicData.vibe || 'action'}
            inspirationStyle={comicData.inspirationStyle}
            charactersCount={comicData.characters?.length || 0}
            onClick={() => handleProjectClick(artifact)}
          />
        )
      })}
    </div>
  )

  // Composant pour l'état vide
  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center text-muted-foreground py-8">
      <p>{message}</p>
    </div>
  )

  if (!isMounted) {
    return (
      <div className="w-[380px] border-r border-border bg-background overflow-y-auto scrollbar-hover">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Artifacts</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-[380px] border-r border-border bg-background ${(showImageGenerator || showVideoGenerator) ? 'overflow-hidden' : 'overflow-y-auto scrollbar-hover'}`}>
      <div className={`${(showImageGenerator || showVideoGenerator) ? 'p-4 space-y-4' : 'p-6 space-y-6'}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{getDisplayTitle()}</h2>
          {selectedSection === 'artifacts' && !showArtifactForm && (
            <Button
              size="sm"
              onClick={() => setShowArtifactForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Artifact
            </Button>
          )}
          {shouldShowNewProjectButton() && <NewProjectButton />}
        </div>
        
        {selectedSection === 'artifacts' && showArtifactForm && (
          <ArtifactFormComponent />
        )}
        
        {(isImageGenerationSection(selectedSection) || isNewFormSection(selectedSection)) && showProjectForm && (
          renderSectionForm()
        )}
        
        {showImageGenerator && selectedProject && imageGeneratorSection === selectedSection && (
          <ImageGeneratorInterface 
            onClose={handleCloseImageGenerator}
            projectTitle={selectedProject.title}
          />
        )}
        
        {showVideoGenerator && selectedVideoProject && videoGeneratorSection === selectedSection && (
          <VideoGeneratorInterface 
            onClose={handleCloseVideoGenerator}
            projectTitle={selectedVideoProject.title}
          />
        )}
        
        
        {selectedSection === 'artifacts' && sectionArtifacts.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {sectionArtifacts.map((artifact) => (
              <ArtifactCard
                key={artifact.id}
                title={artifact.title}
                image={artifact.image}
                description={artifact.description}
                isPublic={artifact.isPublic}
              />
            ))}
          </div>
        )}
        
        {shouldShowProjectGrid() && selectedSection === 'comics' && <ComicsGrid />}
        {shouldShowProjectGrid() && selectedSection !== 'comics' && <ProjectGrid />}
        
        {selectedSection === 'artifacts' && sectionArtifacts.length === 0 && !showArtifactForm && (
          <EmptyState message="No artifacts yet. Create your first artifact!" />
        )}
        
        {shouldShowEmptyState() && (
          <EmptyState message="No projects yet. Create your first project!" />
        )}
      </div>
    </div>
  )
}
