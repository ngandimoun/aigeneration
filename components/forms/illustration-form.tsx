"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Plus, X, Loader2, Check, ChevronsUpDown, Palette, Image as ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useArtifactsApi } from "@/hooks/use-artifacts-api"

interface IllustrationFormProps {
  onSave: (project: { title: string; image: string; description: string; selectedArtifact: string }) => Promise<void>
  onCancel: () => void
  availableArtifacts: Array<{ id: string; title: string; image: string; description: string }>
}

export function IllustrationForm({ onSave, onCancel, availableArtifacts }: IllustrationFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedArtifact, setSelectedArtifact] = useState<string>("")
  const [artifactOpen, setArtifactOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [realArtifacts, setRealArtifacts] = useState<Array<{ id: string; title: string; image: string; description: string }>>([])
  const { toast } = useToast()
  const { fetchArtifacts, loading: artifactsLoading } = useArtifactsApi()

  // Fetch real artifacts from the database
  useEffect(() => {
    const loadArtifacts = async () => {
      try {
        // Fetch all artifacts for the user (both public and private)
        const artifacts = await fetchArtifacts({})
        const formattedArtifacts = artifacts.map(artifact => ({
          id: artifact.id,
          title: artifact.title,
          image: artifact.metadata?.image || "/placeholder.jpg",
          description: artifact.description || "No description available"
        }))
        setRealArtifacts(formattedArtifacts)
      } catch (error) {
        console.error('Failed to load artifacts:', error)
        toast({
          title: "Error loading artifacts",
          description: "Could not load artifacts from database. Please try again.",
          variant: "destructive"
        })
      }
    }

    loadArtifacts()
  }, [fetchArtifacts, toast])

  // Use real artifacts from database, fallback to passed availableArtifacts if no real artifacts
  const artifactsToShow = realArtifacts.length > 0 ? realArtifacts : availableArtifacts
  
  // Filtrer les artifacts basé sur le terme de recherche
  const filteredArtifacts = artifactsToShow.filter(artifact =>
    artifact.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artifact.description.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Debug temporaire
  console.log('IllustrationForm - artifactOpen:', artifactOpen)
  console.log('IllustrationForm - artifactsToShow:', artifactsToShow)
  
  // Ref pour gérer le clic en dehors
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setArtifactOpen(false)
        setSearchTerm("") // Reset search when closing
      }
    }
    
    if (artifactOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [artifactOpen])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (title.trim() && imagePreview && description.trim() && selectedArtifact) {
      const illustrationData = {
        title: title.trim(),
        image: imagePreview,
        description: description.trim(),
        selectedArtifact
      }
      
      try {
        // Call onSave which now handles database persistence
        await onSave(illustrationData)
        
        // Clear form after successful save
        setTitle("")
        setDescription("")
        setImagePreview(null)
        setSelectedArtifact("")
        
        // Show success toast
        toast({
          title: "Illustration created successfully",
          description: `"${illustrationData.title}" has been added to your collection.`,
        })
      } catch (error) {
        console.error('Failed to save illustration:', error)
        toast({
          title: "Error",
          description: "Failed to create illustration. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  return (
    <div className="bg-background border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            New Illustration
          </h3>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="illustration-title" className="block text-sm font-medium text-foreground mb-1">
            Title
          </label>
          <Input
            id="illustration-title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter illustration title"
          />
        </div>

        <div>
          <div className="block text-sm font-medium text-foreground mb-1">
            Upload Reference Image
          </div>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="illustration-image-upload"
              name="image"
            />
            <label htmlFor="illustration-image-upload" className="cursor-pointer block">
              {imagePreview ? (
                <div className="space-y-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-md mx-auto"
                  />
                  <p className="text-sm text-muted-foreground">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Click to upload reference image</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Artifact(s)
          </label>
          {availableArtifacts.length === 0 && (
            <p className="text-xs text-muted-foreground mb-2">
              Using demo artifacts for testing. Create real artifacts in the "Artifacts" section.
            </p>
          )}
          
          {/* Version simplifiée avec Select natif */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => {
                console.log('Button clicked, current state:', artifactOpen)
                setArtifactOpen(!artifactOpen)
              }}
            >
              {selectedArtifact
                ? artifactsToShow.find((artifact) => artifact.id === selectedArtifact)?.title
                : "Select artifact..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
            
            {artifactOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto scrollbar-hover">
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search artifact..."
                    className="w-full px-3 py-2 text-sm border border-border rounded-md mb-2"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="space-y-1">
                    {filteredArtifacts.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                        No artifacts found matching "{searchTerm}"
                      </div>
                    ) : (
                      filteredArtifacts.map((artifact) => (
                      <div
                        key={artifact.id}
                        className="flex items-center px-3 py-2 text-sm hover:bg-accent rounded-md cursor-pointer"
                        onClick={() => {
                          setSelectedArtifact(artifact.id)
                          setArtifactOpen(false)
                          setSearchTerm("") // Reset search when selecting
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedArtifact === artifact.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {artifact.title}
                      </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="illustration-description" className="block text-sm font-medium text-foreground mb-1">
            Description
          </label>
          <Textarea
            id="illustration-description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your illustration concept..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          type="button"
          onClick={handleSave} 
          className="flex-1" 
          disabled={!title.trim() || !imagePreview || !description.trim() || !selectedArtifact}
        >
          Create Illustration
        </Button>
        <Button 
          type="button"
          variant="outline" 
          onClick={onCancel} 
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
