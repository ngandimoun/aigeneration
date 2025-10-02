"use client"

import { useEffect, useState } from "react"
import { useNavigation } from "@/hooks/use-navigation"
import { ArtifactCard } from "@/components/artifact-card"
import { ArtifactForm } from "@/components/artifact-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function GeneratorPanel() {
  const [isMounted, setIsMounted] = useState(false)
  const { getDisplayTitle, selectedSection, artifacts, addArtifact, showArtifactForm, setShowArtifactForm } = useNavigation()

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
    <div className="w-[380px] border-r border-border bg-background overflow-y-auto scrollbar-thin">
      <div className="p-6 space-y-6">
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
        </div>
        
        {selectedSection === 'artifacts' && showArtifactForm && (
          <ArtifactForm 
            onSave={addArtifact}
            onCancel={() => setShowArtifactForm(false)}
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
        
        {selectedSection === 'artifacts' && artifacts.length === 0 && !showArtifactForm && (
          <div className="text-center text-muted-foreground py-8">
            <p>No artifacts yet. Create your first artifact!</p>
          </div>
        )}
      </div>
    </div>
  )
}
