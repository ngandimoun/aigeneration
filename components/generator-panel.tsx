"use client"

import { useEffect, useState } from "react"
import { useNavigation } from "@/hooks/use-navigation"
import { ArtifactCard } from "@/components/artifact-card"
import { ArtifactForm } from "@/components/artifact-form"
import { ImageGeneratorInterface } from "@/components/image-generator-interface"
import { Button } from "@/components/ui/button"
import { Plus, FolderPlus } from "lucide-react"

export function GeneratorPanel() {
  const [isMounted, setIsMounted] = useState(false)
  const { getDisplayTitle, selectedSection, artifacts, addArtifact, showArtifactForm, setShowArtifactForm } = useNavigation()
  
  // États locaux pour l'interface de génération d'images (Illustration, Avatars & Personas, Product Mockups, Concept Worlds, et Charts & Infographics)
  const [showImageGenerator, setShowImageGenerator] = useState(false)
  const [selectedProject, setSelectedProject] = useState<{title: string, image: string, description: string} | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fonctions pour gérer l'interface de génération d'images (Illustration, Avatars & Personas, Product Mockups, Concept Worlds, et Charts & Infographics)
  const handleProjectClick = (artifact: {title: string, image: string, description: string}) => {
    if (selectedSection === 'illustration' || selectedSection === 'avatars-personas' || selectedSection === 'product-mockups' || selectedSection === 'concept-worlds' || selectedSection === 'charts-infographics') {
      setSelectedProject(artifact)
      setShowImageGenerator(true)
    }
  }

  const handleCloseImageGenerator = () => {
    setShowImageGenerator(false)
    setSelectedProject(null)
  }

  if (!isMounted) {
    return (
      <div className="w-[380px] border-r border-border bg-background overflow-y-auto scrollbar-thin">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Artifacts</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-[380px] border-r border-border bg-background ${showImageGenerator ? 'overflow-hidden' : 'overflow-y-auto scrollbar-thin'}`}>
      <div className={`${showImageGenerator ? 'p-4 space-y-4' : 'p-6 space-y-6'}`}>
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
          {selectedSection === 'illustration' && !showArtifactForm && !showImageGenerator && (
            <Button
              size="sm"
              onClick={() => setShowArtifactForm(true)}
              className="flex items-center gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              New Project
            </Button>
          )}
          {selectedSection === 'avatars-personas' && !showArtifactForm && !showImageGenerator && (
            <Button
              size="sm"
              onClick={() => setShowArtifactForm(true)}
              className="flex items-center gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              New Project
            </Button>
          )}
          {selectedSection === 'product-mockups' && !showArtifactForm && !showImageGenerator && (
            <Button
              size="sm"
              onClick={() => setShowArtifactForm(true)}
              className="flex items-center gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              New Project
            </Button>
          )}
          {selectedSection === 'concept-worlds' && !showArtifactForm && !showImageGenerator && (
            <Button
              size="sm"
              onClick={() => setShowArtifactForm(true)}
              className="flex items-center gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              New Project
            </Button>
          )}
          {selectedSection === 'charts-infographics' && !showArtifactForm && !showImageGenerator && (
            <Button
              size="sm"
              onClick={() => setShowArtifactForm(true)}
              className="flex items-center gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              New Project
            </Button>
          )}
        </div>
        
        {selectedSection === 'artifacts' && showArtifactForm && (
          <ArtifactForm 
            onSave={addArtifact}
            onCancel={() => setShowArtifactForm(false)}
          />
        )}
        
        {selectedSection === 'illustration' && showArtifactForm && (
          <ArtifactForm 
            onSave={addArtifact}
            onCancel={() => setShowArtifactForm(false)}
            type="project"
          />
        )}
        
        {selectedSection === 'illustration' && showImageGenerator && selectedProject && (
          <ImageGeneratorInterface 
            onClose={handleCloseImageGenerator}
            projectTitle={selectedProject.title}
          />
        )}
        
        {selectedSection === 'avatars-personas' && showImageGenerator && selectedProject && (
          <ImageGeneratorInterface 
            onClose={handleCloseImageGenerator}
            projectTitle={selectedProject.title}
          />
        )}
        
        {selectedSection === 'product-mockups' && showImageGenerator && selectedProject && (
          <ImageGeneratorInterface 
            onClose={handleCloseImageGenerator}
            projectTitle={selectedProject.title}
          />
        )}
        
        {selectedSection === 'concept-worlds' && showImageGenerator && selectedProject && (
          <ImageGeneratorInterface 
            onClose={handleCloseImageGenerator}
            projectTitle={selectedProject.title}
          />
        )}
        
        {selectedSection === 'charts-infographics' && showImageGenerator && selectedProject && (
          <ImageGeneratorInterface 
            onClose={handleCloseImageGenerator}
            projectTitle={selectedProject.title}
          />
        )}
        
        {selectedSection === 'avatars-personas' && showArtifactForm && (
          <ArtifactForm 
            onSave={addArtifact}
            onCancel={() => setShowArtifactForm(false)}
            type="project"
          />
        )}
        
        {selectedSection === 'product-mockups' && showArtifactForm && (
          <ArtifactForm 
            onSave={addArtifact}
            onCancel={() => setShowArtifactForm(false)}
            type="project"
          />
        )}
        
        {selectedSection === 'concept-worlds' && showArtifactForm && (
          <ArtifactForm 
            onSave={addArtifact}
            onCancel={() => setShowArtifactForm(false)}
            type="project"
          />
        )}
        
        {selectedSection === 'charts-infographics' && showArtifactForm && (
          <ArtifactForm 
            onSave={addArtifact}
            onCancel={() => setShowArtifactForm(false)}
            type="project"
          />
        )}
        
        {selectedSection === 'artifacts' && artifacts.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {artifacts.map((artifact) => (
              <ArtifactCard
                key={artifact.id}
                title={artifact.title}
                image={artifact.image}
                description={artifact.description}
              />
            ))}
          </div>
        )}
        
        {selectedSection === 'illustration' && artifacts.length > 0 && !showImageGenerator && (
          <div className="grid grid-cols-2 gap-4">
            {artifacts.map((artifact) => (
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
        )}
        
        {selectedSection === 'avatars-personas' && artifacts.length > 0 && !showImageGenerator && (
          <div className="grid grid-cols-2 gap-4">
            {artifacts.map((artifact) => (
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
        )}
        
        {selectedSection === 'product-mockups' && artifacts.length > 0 && !showImageGenerator && (
          <div className="grid grid-cols-2 gap-4">
            {artifacts.map((artifact) => (
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
        )}
        
        {selectedSection === 'concept-worlds' && artifacts.length > 0 && !showImageGenerator && (
          <div className="grid grid-cols-2 gap-4">
            {artifacts.map((artifact) => (
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
        )}
        
        {selectedSection === 'charts-infographics' && artifacts.length > 0 && !showImageGenerator && (
          <div className="grid grid-cols-2 gap-4">
            {artifacts.map((artifact) => (
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
        )}
        
        {selectedSection === 'artifacts' && artifacts.length === 0 && !showArtifactForm && (
          <div className="text-center text-muted-foreground py-8">
            <p>No artifacts yet. Create your first artifact!</p>
          </div>
        )}
        
        {selectedSection === 'illustration' && artifacts.length === 0 && !showArtifactForm && !showImageGenerator && (
          <div className="text-center text-muted-foreground py-8">
            <p>No projects yet. Create your first project!</p>
          </div>
        )}
        
        {selectedSection === 'avatars-personas' && artifacts.length === 0 && !showArtifactForm && !showImageGenerator && (
          <div className="text-center text-muted-foreground py-8">
            <p>No projects yet. Create your first project!</p>
          </div>
        )}
        
        {selectedSection === 'product-mockups' && artifacts.length === 0 && !showArtifactForm && !showImageGenerator && (
          <div className="text-center text-muted-foreground py-8">
            <p>No projects yet. Create your first project!</p>
          </div>
        )}
        
        {selectedSection === 'concept-worlds' && artifacts.length === 0 && !showArtifactForm && !showImageGenerator && (
          <div className="text-center text-muted-foreground py-8">
            <p>No projects yet. Create your first project!</p>
          </div>
        )}
        
        {selectedSection === 'charts-infographics' && artifacts.length === 0 && !showArtifactForm && !showImageGenerator && (
          <div className="text-center text-muted-foreground py-8">
            <p>No projects yet. Create your first project!</p>
          </div>
        )}
      </div>
    </div>
  )
}
