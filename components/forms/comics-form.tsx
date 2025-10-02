"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  X,
  Plus,
  Loader2,
  Upload,
  User,
  Save,
  Trash2,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronsUpDown
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ComicsFormProps {
  onSave: (comic: ComicData) => void
  onCancel: () => void
  availableArtifacts: Array<{ id: string, title: string, image: string, description: string }>
}

interface Character {
  id: string
  name: string
  age: number
  image?: string
}

interface ComicData {
  title: string
  image: string
  description: string
  selectedArtifact: string
  type: string[]
  vibe: string[]
  inspirationStyle: string[]
  characters: Character[]
}

// Options pour le type
const typeOptions = [
  { value: "black-white", label: "Black and white" },
  { value: "color", label: "Color" }
]

// Options pour le vibe/tone
const vibeOptions = [
  { value: "none", label: "None" },
  { value: "action", label: "Action" },
  { value: "comedy", label: "Comedy" },
  { value: "dark", label: "Dark" },
  { value: "romantic", label: "Romantic" },
  { value: "drama", label: "Drama" },
  { value: "horror", label: "Horror" },
  { value: "adventure", label: "Adventure" },
  { value: "mystery", label: "Mystery" },
  { value: "fantasy", label: "Fantasy" },
  { value: "sci-fi", label: "Sci-Fi" }
]

// Options pour le style d'inspiration
const inspirationStyles = [
  { value: "none", label: "None" },
  { value: "ghibli", label: "Ghibli" },
  { value: "shonen-anime", label: "Shonen Anime" },
  { value: "simpsons", label: "Simpsons" },
  { value: "marvel", label: "Marvel" },
  { value: "dc", label: "DC" },
  { value: "manga", label: "Manga" },
  { value: "western", label: "Western" },
  { value: "european", label: "European" },
  { value: "indie", label: "Indie" },
  { value: "classic", label: "Classic" }
]

// Options d'artifacts comics prédéfinies
const comicArtifacts = [
  {
    id: "comics-start",
    title: "Comics Start",
    image: "/placeholder.jpg",
    description: "Perfect for beginners - clean, simple layouts with clear storytelling",
    icon: "🚀"
  },
  {
    id: "comics-cosmos",
    title: "Comics Cosmos",
    image: "/placeholder.jpg",
    description: "Epic space adventures with cosmic themes and futuristic designs",
    icon: "🌌"
  },
  {
    id: "comics-joys",
    title: "Comics Joys",
    image: "/placeholder.jpg",
    description: "Bright, cheerful stories that bring happiness and positive vibes",
    icon: "😊"
  },
  {
    id: "comic-enjoys",
    title: "Comic Enjoys",
    image: "/placeholder.jpg",
    description: "Entertaining content designed to captivate and engage readers",
    icon: "🎭"
  }
]

export function ComicsForm({ onSave, onCancel, availableArtifacts }: ComicsFormProps) {
  // États du formulaire
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedArtifact, setSelectedArtifact] = useState<string>("")
  const [type, setType] = useState<string[]>([])
  const [vibe, setVibe] = useState<string[]>([])
  const [inspirationStyle, setInspirationStyle] = useState<string[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // État pour la navigation par étapes
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2

  // États pour les dialogs
  const [characterDialogOpen, setCharacterDialogOpen] = useState(false)
  const [artifactDialogOpen, setArtifactDialogOpen] = useState(false)
  const [vibeDialogOpen, setVibeDialogOpen] = useState(false)
  const [inspirationDialogOpen, setInspirationDialogOpen] = useState(false)

  // États pour le nouveau personnage
  const [newCharacterName, setNewCharacterName] = useState("")
  const [newCharacterAge, setNewCharacterAge] = useState<number>(18)
  const [newCharacterImage, setNewCharacterImage] = useState<string | null>(null)

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

  const handleCharacterImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewCharacterImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Fonctions pour gérer les sélections multiples
  const handleTypeChange = (value: string, checked: boolean) => {
    if (checked) {
      setType(prev => [...prev, value])
    } else {
      setType(prev => prev.filter(item => item !== value))
    }
  }

  const handleVibeChange = (value: string) => {
    // Sélection unique - remplacer complètement le tableau
    setVibe([value])
  }

  const handleInspirationChange = (value: string) => {
    // Sélection unique - remplacer complètement le tableau
    setInspirationStyle([value])
  }

  // Fonctions de navigation
  const canGoToNextStep = () => {
    if (currentStep === 1) {
      return title.trim() && imagePreview && description.trim() && selectedArtifact
    }
    return true
  }

  // Fonction pour obtenir le label du vibe sélectionné
  const getSelectedVibeLabel = () => {
    if (vibe.length === 0) return "Select vibe/tone..."
    const selectedVibe = vibeOptions.find(option => option.value === vibe[0])
    return selectedVibe ? selectedVibe.label : "Select vibe/tone..."
  }

  // Fonction pour obtenir le label du style d'inspiration sélectionné
  const getSelectedInspirationLabel = () => {
    if (inspirationStyle.length === 0) return "Select inspiration style..."
    const selected = inspirationStyles.find(option => option.value === inspirationStyle[0])
    return selected ? selected.label : "Select inspiration style..."
  }

  const handleNextStep = () => {
    if (canGoToNextStep() && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleAddCharacter = () => {
    if (newCharacterName.trim() && newCharacterAge > 0) {
      const newCharacter: Character = {
        id: Date.now().toString(),
        name: newCharacterName.trim(),
        age: newCharacterAge,
        image: newCharacterImage || undefined
      }
      setCharacters(prev => [...prev, newCharacter])
      setNewCharacterName("")
      setNewCharacterAge(18)
      setNewCharacterImage(null)
      setCharacterDialogOpen(false)
    }
  }

  const handleRemoveCharacter = (characterId: string) => {
    setCharacters(prev => prev.filter(char => char.id !== characterId))
  }

  const handleSave = async () => {
    if (title.trim() && imagePreview && description.trim() && selectedArtifact && type.length > 0 && vibe.length > 0 && !vibe.includes('none')) {
      setIsLoading(true)

      // Simuler un délai de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1500))

      const comicData: ComicData = {
        title: title.trim(),
        image: imagePreview,
        description: description.trim(),
        selectedArtifact,
        type,
        vibe,
        inspirationStyle,
        characters
      }

      onSave(comicData)

      // Reset form
      setTitle("")
      setDescription("")
      setImagePreview(null)
      setSelectedArtifact("")
      setType([])
      setVibe([])
      setInspirationStyle([])
      setCharacters([])
      setCurrentStep(1)
      setIsLoading(false)

      // Afficher le toast de confirmation
      toast({
        title: "Comic créé avec succès",
        description: `"${title.trim()}" a été ajouté à votre collection.`,
      })
    }
  }

  // Utiliser les options prédéfinies pour les comics
  const artifactsToShow = comicArtifacts
  const selectedArtifactData = artifactsToShow.find(artifact => artifact.id === selectedArtifact)

  // Composant pour l'indicateur de progression
  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-6">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex items-center">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            currentStep > index + 1
              ? "bg-primary text-primary-foreground"
              : currentStep === index + 1
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
          )}>
            {currentStep > index + 1 ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              index + 1
            )}
          </div>
          {index < totalSteps - 1 && (
            <div className={cn(
              "w-12 h-0.5 mx-2",
              currentStep > index + 1 ? "bg-primary" : "bg-muted"
            )} />
          )}
        </div>
      ))}
    </div>
  )

  // Étape 1: Informations de base
  const renderStep1 = () => (
    <div className="space-y-4">
      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Project Name
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter comic project name"
        />
      </div>

      {/* Upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Upload
        </label>
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="comic-image-upload"
          />
          <label htmlFor="comic-image-upload" className="cursor-pointer">
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
                <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Click to upload media</p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Artifact Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Artifact Selection
        </label>

        {/* Bouton pour ouvrir la sélection */}
        <Button
          variant="outline"
          onClick={() => setArtifactDialogOpen(true)}
          className="w-full justify-between h-12 text-left"
        >
          <div className="flex items-center gap-3">
            {selectedArtifactData ? (
              <>
                <span className="text-lg">{selectedArtifactData.icon}</span>
                <span className="font-medium">{selectedArtifactData.title}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Select artifact...</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>

        {/* Dialog pour la sélection d'artifacts */}
        <Dialog open={artifactDialogOpen} onOpenChange={setArtifactDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Artifact Selection</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {artifactsToShow.map((artifact) => (
                <div
                  key={artifact.id}
                  className={cn(
                    "relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01] group",
                    selectedArtifact === artifact.id
                      ? "border-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 bg-card"
                  )}
                  onClick={() => {
                    setSelectedArtifact(artifact.id)
                    setArtifactDialogOpen(false)
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center transition-all duration-300",
                        selectedArtifact === artifact.id
                          ? "from-primary/30 to-primary/20 shadow-md"
                          : "from-primary/20 to-primary/10"
                      )}>
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                          selectedArtifact === artifact.id
                            ? "bg-primary/40 shadow-sm"
                            : "bg-primary/30"
                        )}>
                          <span className="text-lg">
                            {artifact.icon}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-semibold text-sm mb-1 transition-colors duration-300",
                        selectedArtifact === artifact.id ? "text-primary" : "text-foreground"
                      )}>
                        {artifact.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {artifact.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {selectedArtifact === artifact.id && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {selectedArtifactData && (
          <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-xl shadow-sm animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/20 flex items-center justify-center shadow-sm">
                <span className="text-lg">
                  {selectedArtifactData.icon}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-primary text-sm">
                  {selectedArtifactData.title} Selected
                </p>
                <p className="text-xs text-muted-foreground">
                  Ready to create your comic with this style
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Description
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter comic description"
          rows={3}
        />
      </div>
    </div>
  )

  // Étape 2: Sélections et personnages
  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Type
        </label>
        <div className="space-y-2">
          {typeOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${option.value}`}
                checked={type.includes(option.value)}
                onCheckedChange={(checked) => handleTypeChange(option.value, checked as boolean)}
              />
              <label
                htmlFor={`type-${option.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Vibe/Tone */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Vibe/Tone
        </label>
        
        {/* Bouton pour ouvrir la sélection de vibe */}
        <Button
          variant="outline"
          onClick={() => setVibeDialogOpen(true)}
          className="w-full justify-between h-12 text-left"
        >
          <span className={vibe.length === 0 ? "text-muted-foreground" : "font-medium"}>
            {getSelectedVibeLabel()}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>

        {/* Dialog pour la sélection de vibe */}
        <Dialog open={vibeDialogOpen} onOpenChange={setVibeDialogOpen}>
          <DialogContent className="sm:max-w-lg max-h-[400px] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Select Vibe/Tone</DialogTitle>
            </DialogHeader>
            <div className="max-h-[280px] overflow-y-auto overflow-x-hidden scrollbar-hover">
              <div className="grid grid-cols-3 gap-2 py-4 px-1">
                {vibeOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "relative p-2 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] group min-w-0",
                      vibe.includes(option.value)
                        ? "border-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 bg-card"
                    )}
                    onClick={() => {
                      handleVibeChange(option.value)
                      setVibeDialogOpen(false)
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full border flex items-center justify-center transition-all duration-300",
                        vibe.includes(option.value)
                          ? "border-primary bg-primary"
                          : "border-border group-hover:border-primary/50"
                      )}>
                        {vibe.includes(option.value) && (
                          <div className="w-1 h-1 rounded-full bg-primary-foreground"></div>
                        )}
                      </div>
                      <h3 className={cn(
                        "font-medium text-xs text-center transition-colors duration-300 leading-tight break-words",
                        vibe.includes(option.value) ? "text-primary" : "text-foreground"
                      )}>
                        {option.label}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inspiration Style */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Inspiration Style (Optional)
        </label>
        
        {/* Bouton pour ouvrir la sélection d'inspiration */}
        <Button
          variant="outline"
          onClick={() => setInspirationDialogOpen(true)}
          className="w-full justify-between h-12 text-left"
        >
          <span className={inspirationStyle.length === 0 ? "text-muted-foreground" : "font-medium"}>
            {getSelectedInspirationLabel()}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>

        {/* Dialog pour la sélection d'inspiration */}
        <Dialog open={inspirationDialogOpen} onOpenChange={setInspirationDialogOpen}>
          <DialogContent className="sm:max-w-lg max-h-[400px] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Select Inspiration Style</DialogTitle>
            </DialogHeader>
            <div className="max-h-[280px] overflow-y-auto overflow-x-hidden scrollbar-hover">
              <div className="grid grid-cols-3 gap-2 py-4 px-1">
                {inspirationStyles.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "relative p-2 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] group min-w-0",
                      inspirationStyle.includes(option.value)
                        ? "border-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 bg-card"
                    )}
                    onClick={() => {
                      handleInspirationChange(option.value)
                      setInspirationDialogOpen(false)
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full border flex items-center justify-center transition-all duration-300",
                        inspirationStyle.includes(option.value)
                          ? "border-primary bg-primary"
                          : "border-border group-hover:border-primary/50"
                      )}>
                        {inspirationStyle.includes(option.value) && (
                          <div className="w-1 h-1 rounded-full bg-primary-foreground"></div>
                        )}
                      </div>
                      <h3 className={cn(
                        "font-medium text-xs text-center transition-colors duration-300 leading-tight break-words",
                        inspirationStyle.includes(option.value) ? "text-primary" : "text-foreground"
                      )}>
                        {option.label}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Characters */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">
            Characters
          </label>
          <Dialog open={characterDialogOpen} onOpenChange={setCharacterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Characters
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Character</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Name
                  </label>
                  <Input
                    value={newCharacterName}
                    onChange={(e) => setNewCharacterName(e.target.value)}
                    placeholder="Enter character name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Age
                  </label>
                  <Input
                    type="number"
                    value={newCharacterAge}
                    onChange={(e) => setNewCharacterAge(Number(e.target.value))}
                    placeholder="Enter character age"
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Character Image (Optional)
                  </label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-3 text-center hover:border-muted-foreground/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCharacterImageUpload}
                      className="hidden"
                      id="character-image-upload"
                    />
                    <label htmlFor="character-image-upload" className="cursor-pointer">
                      {newCharacterImage ? (
                        <div className="space-y-2">
                          <img 
                            src={newCharacterImage} 
                            alt="Character preview" 
                            className="w-16 h-16 object-cover rounded-md mx-auto"
                          />
                          <p className="text-xs text-muted-foreground">Click to change image</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
                          <p className="text-xs text-muted-foreground">Click to upload image</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddCharacter} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCharacterDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {characters.length > 0 && (
          <div className="space-y-2">
            {characters.map((character) => (
              <Card key={character.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {character.image ? (
                      <img 
                        src={character.image} 
                        alt={character.name}
                        className="w-8 h-8 object-cover rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{character.name}</span>
                      <Badge variant="secondary">{character.age} years</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCharacter(character.id)}
                    className="h-6 w-6"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="bg-background border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">New Comic Project</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <StepIndicator />

      <div className="min-h-[400px]">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
      </div>

      <div className="flex gap-2 pt-4">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
        )}

        {currentStep < totalSteps ? (
          <Button
            onClick={handleNextStep}
            className="flex-1 flex items-center gap-2"
            disabled={!canGoToNextStep() || isLoading}
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={isLoading || !title.trim() || !imagePreview || !description.trim() || !selectedArtifact || type.length === 0 || vibe.length === 0 || vibe.includes('none')}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
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
          </>
        )}
      </div>
    </div>
  )
}
