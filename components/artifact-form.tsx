"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Plus, X, Loader2, Check, ChevronsUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ArtifactFormProps {
  onSave: (artifact: { title: string; image: string; description: string; isPublic?: boolean; style?: string }) => void
  onCancel: () => void
  type?: 'artifact' | 'project'
}

// Données d'exemple pour la sélection de styles d'illustration
const illustrationStyles = [
  { value: "realistic", label: "Realistic" },
  { value: "cartoon", label: "Cartoon" },
  { value: "anime", label: "Anime" },
  { value: "watercolor", label: "Watercolor" },
  { value: "oil-painting", label: "Oil Painting" },
  { value: "digital-art", label: "Digital Art" },
  { value: "sketch", label: "Sketch" },
  { value: "vector", label: "Vector" },
  { value: "3d-render", label: "3D Render" },
  { value: "minimalist", label: "Minimalist" },
  { value: "vintage", label: "Vintage" },
  { value: "modern", label: "Modern" },
  { value: "abstract", label: "Abstract" },
  { value: "geometric", label: "Geometric" },
  { value: "hand-drawn", label: "Hand Drawn" },
]

export function ArtifactForm({ onSave, onCancel, type = 'artifact' }: ArtifactFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<string>("")
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

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
    if (title.trim() && imagePreview && description.trim()) {
      setIsLoading(true)
      
      // Simuler un délai de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      onSave({
        title: title.trim(),
        image: imagePreview,
        description: description.trim(),
        ...(type === 'artifact' && { isPublic }),
        ...(type === 'project' && selectedStyle && { style: selectedStyle })
      })
      
      setTitle("")
      setDescription("")
      setImagePreview(null)
      setIsPublic(false)
      setSelectedStyle("")
      setIsLoading(false)
      
      // Afficher le toast de confirmation
      toast({
        title: type === 'project' ? "Projet créé avec succès" : "Artifact créé avec succès",
        description: `"${title.trim()}" a été ajouté à votre collection.`,
      })
    }
  }

  return (
    <div className="bg-background border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-foreground">
            {type === 'project' ? 'New Project' : 'New Artifact'}
          </h3>
          {type === 'artifact' && (
            <div className="flex items-center gap-2">
              <label htmlFor="public-toggle" className="text-xs font-medium text-foreground">
                Public
              </label>
              <Switch
                id="public-toggle"
                checked={isPublic}
                onCheckedChange={setIsPublic}
                className="h-4 w-7 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#57e6f9] data-[state=checked]:via-blue-500 data-[state=checked]:to-purple-700"
              />
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === 'project' ? "Enter project title" : "Enter artifact title"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Upload Image
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
                  <Plus className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Click to upload image</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {type === 'project' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Style
            </label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedStyle
                    ? illustrationStyles.find((style) => style.value === selectedStyle)?.label
                    : "Select style..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search style..." />
                  <CommandList>
                    <CommandEmpty>No style found.</CommandEmpty>
                    <CommandGroup>
                      {illustrationStyles.map((style) => (
                        <CommandItem
                          key={style.value}
                          value={style.value}
                          onSelect={(currentValue) => {
                            setSelectedStyle(currentValue === selectedStyle ? "" : currentValue)
                            setOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedStyle === style.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {style.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={type === 'project' ? "Enter project description" : "Enter artifact description"}
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          onClick={handleSave} 
          className="flex-1" 
          disabled={isLoading || !title.trim() || !imagePreview || !description.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
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
