"use client"

import { useEffect, useState } from "react"
import { useNavigation } from "@/hooks/use-navigation"
import { ArtifactCard } from "@/components/artifact-card"
import { ArtifactForm } from "@/components/artifact-form"
import { ImageGeneratorInterface } from "@/components/image-generator-interface"
import { IllustrationGeneratorInterface } from "@/components/illustration-generator-interface"
import { AvatarPersonaGeneratorInterface } from "@/components/avatar-persona-generator-interface"
import { VideoGeneratorInterface } from "@/components/video-generator-interface"
import { ProductMockupGeneratorInterface } from "@/components/product-mockup-generator-interface"
import { ChartsInfographicsGeneratorInterface } from "@/components/charts-infographics-generator-interface"
import { ConceptWorldsGeneratorInterface } from "@/components/concept-worlds-generator-interface"
import { VoiceCreationInterface } from "@/components/voice-creation-interface"
import { SoundFxInterface } from "@/components/sound-fx-interface"
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
import { Plus, FolderPlus, Globe, Lock } from "lucide-react"
import { ArtifactCardSkeleton } from "@/components/artifact-card-skeleton"

export function GeneratorPanel() {
  const [isMounted, setIsMounted] = useState(false)
  const { getDisplayTitle, selectedSection, getArtifactsBySection, addArtifact, deleteArtifact, showArtifactForm, setShowArtifactForm, showProjectForm, setShowProjectForm, artifacts, isLoadingArtifacts, setSelectedArtifact, setSelectedSection } = useNavigation()
  
  // États locaux pour l'interface de génération d'images (Illustration, Avatars & Personas, Product Mockups, Concept Worlds, et Charts & Infographics)
  const [showImageGenerator, setShowImageGenerator] = useState(false)
  const [selectedProject, setSelectedProject] = useState<{title: string, image: string, description: string} | null>(null)
  const [imageGeneratorSection, setImageGeneratorSection] = useState<string | null>(null)
  
  // États locaux pour l'interface de génération vidéo (Explainers, Talking Avatars, Social Cuts, Cinematic Clips, Product in Motion, UGC Ads)
  const [showVideoGenerator, setShowVideoGenerator] = useState(false)
  const [selectedVideoProject, setSelectedVideoProject] = useState<{title: string, image: string, description: string} | null>(null)
  const [videoGeneratorSection, setVideoGeneratorSection] = useState<string | null>(null)
  
  // États locaux pour l'interface de création de voix
  const [showVoiceCreation, setShowVoiceCreation] = useState(false)
  
  // États locaux pour l'interface de création de Sound FX
  const [showSoundFx, setShowSoundFx] = useState(false)
  
  // Obtenir les artifacts filtrés par section
  const sectionArtifacts = getArtifactsBySection(selectedSection)

  // Sections qui supportent la génération d'images
  const imageGenerationSections = ['illustration', 'avatars-personas', 'product-mockups', 'concept-worlds', 'charts-infographics', 'comics']
  
  // Sections qui supportent la génération vidéo
  const videoGenerationSections = ['explainers', 'talking-avatars', 'social-cuts', 'cinematic-clips', 'product-motion', 'ugc-ads']
  
  // Sections qui supportent la création de voix
  const voiceCreationSections = ['voice-creation']
  
  // Sections qui supportent la création de Sound FX
  const soundFxSections = ['sound-fx']
  
  // Sections qui supportent les nouveaux formulaires
  const newFormSections = ['explainers', 'ugc-ads', 'product-motion', 'cinematic-clips', 'social-cuts', 'talking-avatars', 'comics']
  
  // Helper functions
  const isImageGenerationSection = (section: string) => imageGenerationSections.includes(section)
  const isVideoGenerationSection = (section: string) => videoGenerationSections.includes(section)
  const isVoiceCreationSection = (section: string) => voiceCreationSections.includes(section)
  const isSoundFxSection = (section: string) => soundFxSections.includes(section)
  const isNewFormSection = (section: string) => newFormSections.includes(section)
  const shouldShowNewProjectButton = () => (isImageGenerationSection(selectedSection) || isNewFormSection(selectedSection)) && !showProjectForm && !showImageGenerator && !showVideoGenerator && !showVoiceCreation && !showSoundFx
  const shouldShowProjectGrid = () => (isImageGenerationSection(selectedSection) || isNewFormSection(selectedSection)) && sectionArtifacts.length > 0 && !showImageGenerator && !showVideoGenerator && !showVoiceCreation && !showSoundFx
  const shouldShowEmptyState = () => (isImageGenerationSection(selectedSection) || isNewFormSection(selectedSection)) && sectionArtifacts.length === 0 && !showProjectForm && !showImageGenerator && !showVideoGenerator && !showVoiceCreation && !showSoundFx

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

  // Fermer l'interface de création de voix quand on change de section
  useEffect(() => {
    if (showVoiceCreation && selectedSection !== 'voice-creation') {
      setShowVoiceCreation(false)
    }
  }, [selectedSection, showVoiceCreation])

  // Fermer l'interface de création de Sound FX quand on change de section
  useEffect(() => {
    if (showSoundFx && selectedSection !== 'sound-fx') {
      setShowSoundFx(false)
    }
  }, [selectedSection, showSoundFx])

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

  const handleCloseVoiceCreation = () => {
    setShowVoiceCreation(false)
  }

  const handleCloseSoundFx = () => {
    setShowSoundFx(false)
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
      description: artifact.description,
      type: artifact.type,
      section: artifact.section
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
        // Filter artifacts to show only artifacts from the main "artifacts" section
        const mainArtifactsForAvatars = availableArtifacts.filter(artifact => artifact.section === 'artifacts')
        return (
          <AvatarsForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={mainArtifactsForAvatars}
          />
        )
      case 'product-mockups':
        // Filter artifacts to show only artifacts from the main "artifacts" section
        const mainArtifactsForProductMockups = availableArtifacts.filter(artifact => artifact.section === 'artifacts')
        return (
          <ProductMockupsForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={mainArtifactsForProductMockups}
          />
        )
      case 'concept-worlds':
        // Filter artifacts to show only artifacts from the main "artifacts" section
        const mainArtifactsForConceptWorlds = availableArtifacts.filter(artifact => artifact.section === 'artifacts')
        return (
          <ConceptWorldsForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={mainArtifactsForConceptWorlds}
          />
        )
      case 'charts-infographics':
        // Filter artifacts to show only artifacts from the main "artifacts" section
        const mainArtifactsForCharts = availableArtifacts.filter(artifact => artifact.section === 'artifacts')
        return (
          <ChartsInfographicsForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={mainArtifactsForCharts}
          />
        )
      case 'explainers':
        // Filter artifacts to show only artifacts from the main "artifacts" section
        const mainArtifactsForExplainers = availableArtifacts.filter(artifact => artifact.section === 'artifacts')
        return (
          <ExplainersForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={mainArtifactsForExplainers}
          />
        )
      case 'ugc-ads':
        // Filter artifacts to show only artifacts from the main "artifacts" section
        const mainArtifactsForUGCAds = availableArtifacts.filter(artifact => artifact.section === 'artifacts')
        return (
          <UGCAdsForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={mainArtifactsForUGCAds}
          />
        )
      case 'product-motion':
        // Filter artifacts to show only artifacts from the main "artifacts" section
        const mainArtifactsForProductMotion = availableArtifacts.filter(artifact => artifact.section === 'artifacts')
        return (
          <ProductMotionForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={mainArtifactsForProductMotion}
          />
        )
      case 'cinematic-clips':
        // Filter artifacts to show only artifacts from the main "artifacts" section
        const mainArtifactsForCinematicClips = availableArtifacts.filter(artifact => artifact.section === 'artifacts')
        return (
          <CinematicClipsForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={mainArtifactsForCinematicClips}
          />
        )
      case 'social-cuts':
        // Filter artifacts to show only artifacts from the main "artifacts" section
        const mainArtifactsForSocialCuts = availableArtifacts.filter(artifact => artifact.section === 'artifacts')
        return (
          <SocialCutsForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={mainArtifactsForSocialCuts}
          />
        )
      case 'talking-avatars':
        // Filter artifacts to show only artifacts from the main "artifacts" section
        const mainArtifactsForTalkingAvatars = availableArtifacts.filter(artifact => artifact.section === 'artifacts')
        return (
          <TalkingAvatarsForm
            onSave={addArtifact}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={mainArtifactsForTalkingAvatars}
          />
        )
      case 'comics':
        // Filter artifacts to show only artifacts from the main "artifacts" section
        const mainArtifacts = availableArtifacts.filter(artifact => artifact.section === 'artifacts')
        return (
          <ComicsForm
            onSave={async (comicData) => {
              // Save the comic as an artifact
              await addArtifact(comicData)
              // Close the form
              setShowProjectForm(false)
              // Navigate to comics section to view the created comic
              setSelectedSection('comics')
              console.log('🎬 Comic saved and navigating to comics section')
            }}
            onCancel={() => setShowProjectForm(false)}
            availableArtifacts={mainArtifacts}
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
          <div className="aspect-square mb-3 overflow-hidden rounded-md relative">
            <img 
              src={artifact.image} 
              alt={artifact.title}
              className="w-full h-full object-cover"
            />
            {/* Public/Private indicator */}
            <div className="absolute top-2 right-2">
              {artifact.isPublic ? (
                <div className="bg-green-500/90 text-white rounded-full p-1.5 shadow-sm">
                  <Globe className="h-3 w-3" />
                </div>
              ) : (
                <div className="bg-gray-500/90 text-white rounded-full p-1.5 shadow-sm">
                  <Lock className="h-3 w-3" />
                </div>
              )}
            </div>
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
            isPublic={artifact.isPublic}
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

  // Composant pour l'état de chargement
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 gap-4">
      <ArtifactCardSkeleton />
      <ArtifactCardSkeleton />
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
          selectedSection === 'illustration' ? (
            <IllustrationGeneratorInterface 
              onClose={handleCloseImageGenerator}
              projectTitle={selectedProject.title}
            />
          ) : selectedSection === 'avatars-personas' ? (
            <AvatarPersonaGeneratorInterface 
              onClose={handleCloseImageGenerator}
              projectTitle={selectedProject.title}
            />
          ) : selectedSection === 'product-mockups' ? (
            <ProductMockupGeneratorInterface 
              onClose={handleCloseImageGenerator}
              projectTitle={selectedProject.title}
              selectedArtifact={selectedProject as any}
            />
          ) : selectedSection === 'charts-infographics' ? (
            <ChartsInfographicsGeneratorInterface 
              onClose={handleCloseImageGenerator}
              projectTitle={selectedProject.title}
            />
          ) : selectedSection === 'concept-worlds' ? (
            <ConceptWorldsGeneratorInterface />
          ) : (
            <ImageGeneratorInterface 
              onClose={handleCloseImageGenerator}
              projectTitle={selectedProject.title}
            />
          )
        )}
        
        {showVideoGenerator && selectedVideoProject && videoGeneratorSection === selectedSection && (
          <VideoGeneratorInterface 
            onClose={handleCloseVideoGenerator}
            projectTitle={selectedVideoProject.title}
          />
        )}
        
        {/* Voice Creation Interface */}
        {isVoiceCreationSection(selectedSection) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Voice Creation</h2>
                <p className="text-muted-foreground">Craft unique, emotionally intelligent voices that match your world's DNA.</p>
              </div>
              <Button
                size="sm"
                onClick={() => setShowVoiceCreation(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Voice
              </Button>
            </div>
            
            {showVoiceCreation && (
              <VoiceCreationInterface 
                onClose={handleCloseVoiceCreation}
                projectTitle="Voice Creation"
              />
            )}
          </div>
        )}
        
        {/* Sound FX Interface */}
        {isSoundFxSection(selectedSection) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Sound FX Studio</h2>
                <p className="text-muted-foreground">Craft emotionally intelligent sound design synchronized with your world's mood and story.</p>
              </div>
              <Button
                size="sm"
                onClick={() => setShowSoundFx(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Sound FX
              </Button>
            </div>
            
            {showSoundFx && (
              <SoundFxInterface 
                onClose={handleCloseSoundFx}
                projectTitle="Sound FX Studio"
              />
            )}
          </div>
        )}
        
        {/* Loading state for all sections */}
        {isLoadingArtifacts && (
          <LoadingSkeleton />
        )}
        
        {/* Artifacts grid */}
        {selectedSection === 'artifacts' && !isLoadingArtifacts && sectionArtifacts.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {sectionArtifacts.map((artifact) => (
              <ArtifactCard
                key={artifact.id}
                id={artifact.id}
                title={artifact.title}
                image={artifact.image}
                description={artifact.description}
                isPublic={artifact.isPublic}
                isDefault={artifact.isDefault}
                onDelete={deleteArtifact}
                onClick={() => setSelectedArtifact(artifact)}
              />
            ))}
          </div>
        )}
        
        {/* Project grids */}
        {shouldShowProjectGrid() && selectedSection === 'comics' && !isLoadingArtifacts && <ComicsGrid />}
        {shouldShowProjectGrid() && selectedSection !== 'comics' && !isLoadingArtifacts && <ProjectGrid />}
        
        {/* Empty states */}
        {selectedSection === 'artifacts' && !isLoadingArtifacts && sectionArtifacts.length === 0 && !showArtifactForm && (
          <EmptyState message="No artifacts yet. Create your first artifact!" />
        )}
        
        {shouldShowEmptyState() && (
          <EmptyState message="No projects yet. Create your first project!" />
        )}
      </div>
    </div>
  )
}
