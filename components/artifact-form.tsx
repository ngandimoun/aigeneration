"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ArtifactFormProps {
  onSave: (artifact: { title: string; image: string; description: string }) => void
  onCancel: () => void
  type?: 'artifact' | 'project'
}

export function ArtifactForm({ onSave, onCancel, type = 'artifact' }: ArtifactFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
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
        description: description.trim()
      })
      
      setTitle("")
      setDescription("")
      setImagePreview(null)
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
        <h3 className="text-lg font-semibold text-foreground">
          {type === 'project' ? 'New Project' : 'New Artifact'}
        </h3>
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
