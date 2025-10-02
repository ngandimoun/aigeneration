"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Plus, X, Loader2, Check, ChevronsUpDown, BarChart3, Image as ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ChartsInfographicsFormProps {
  onSave: (project: { title: string; image: string; description: string; selectedArtifact: string }) => void
  onCancel: () => void
  availableArtifacts: Array<{ id: string; title: string; image: string; description: string }>
}

export function ChartsInfographicsForm({ onSave, onCancel, availableArtifacts }: ChartsInfographicsFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedArtifact, setSelectedArtifact] = useState<string>("")
  const [artifactOpen, setArtifactOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  // Données de simulation pour les artifacts
  const mockArtifacts = [
    { id: "1", title: "Sales Performance Chart", image: "/placeholder.jpg", description: "Monthly revenue visualization" },
    { id: "2", title: "User Analytics Dashboard", image: "/placeholder.jpg", description: "Website traffic metrics" },
    { id: "3", title: "Market Research Infographic", image: "/placeholder.jpg", description: "Industry trends analysis" },
    { id: "4", title: "Financial Report Graph", image: "/placeholder.jpg", description: "Quarterly earnings chart" },
    { id: "5", title: "Social Media Statistics", image: "/placeholder.jpg", description: "Engagement metrics display" },
    { id: "6", title: "Process Flow Diagram", image: "/placeholder.jpg", description: "Workflow visualization" },
    { id: "7", title: "Comparison Bar Chart", image: "/placeholder.jpg", description: "Product performance comparison" },
    { id: "8", title: "Timeline Infographic", image: "/placeholder.jpg", description: "Project milestone tracker" }
  ]

  // Utiliser les données de simulation si la liste est vide
  const artifactsToShow = availableArtifacts.length > 0 ? availableArtifacts : mockArtifacts
  
  // Filtrer les artifacts basé sur le terme de recherche
  const filteredArtifacts = artifactsToShow.filter(artifact =>
    artifact.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artifact.description.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
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
      setIsLoading(true)
      
      // Simuler un délai de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      onSave({
        title: title.trim(),
        image: imagePreview,
        description: description.trim(),
        selectedArtifact
      })
      
      setTitle("")
      setDescription("")
      setImagePreview(null)
      setSelectedArtifact("")
      setIsLoading(false)
      
      toast({
        title: "Chart & Infographic créé avec succès",
        description: `"${title.trim()}" a été ajouté à votre collection.`,
      })
    }
  }

  return (
    <div className="bg-background border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            New Chart & Infographic
          </h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Chart Name
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter chart name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Upload Reference Image
          </label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
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
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto" />
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
                console.log('Charts & Infographics Button clicked, current state:', artifactOpen)
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
          <label className="block text-sm font-medium text-foreground mb-1">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your chart or infographic, its data, and purpose..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          onClick={handleSave} 
          className="flex-1" 
          disabled={isLoading || !title.trim() || !imagePreview || !description.trim() || !selectedArtifact}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Chart"
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel} 
          className="flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
