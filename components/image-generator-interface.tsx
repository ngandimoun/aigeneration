"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  X, 
  Sparkles, 
  Dice6, 
  Layers, 
  Square, 
  Star, 
  Grid3x3, 
  Image as ImageIcon, 
  User, 
  Shirt, 
  Palette,
  Minus,
  Plus,
  Cpu,
  ChevronRight
} from "lucide-react"

interface ImageGeneratorInterfaceProps {
  onClose: () => void
  projectTitle: string
}

export function ImageGeneratorInterface({ onClose, projectTitle }: ImageGeneratorInterfaceProps) {
  const [prompt, setPrompt] = useState("")
  const [aiPromptEnabled, setAiPromptEnabled] = useState(true)
  const [imageCount, setImageCount] = useState(4)
  const [aspectRatio, setAspectRatio] = useState("1:1")

  const handleImageCountChange = (delta: number) => {
    const newCount = imageCount + delta
    if (newCount >= 1 && newCount <= 10) {
      setImageCount(newCount)
    }
  }

  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          Generate Images for: {projectTitle}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Prompt Input Area */}
      <div className="space-y-2">
        <div className="relative">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your image or upload"
            className="min-h-[80px] pr-12 text-sm resize-none"
          />
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <span className="text-blue-500 text-xs cursor-pointer hover:underline">
              upload
            </span>
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
          </div>
          
          {/* AI Prompt Toggle inside textarea */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <Switch
              checked={aiPromptEnabled}
              onCheckedChange={setAiPromptEnabled}
              className="scale-75"
            />
            <span className="text-xs text-foreground">AI prompt</span>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Dice6 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-muted/70 transition-colors">
        <div className="flex items-center gap-2">
          <Cpu className="h-3 w-3 text-blue-500" />
          <span className="text-xs font-medium text-foreground">Model</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-foreground">Flux 1.0 Fast</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      {/* Customization Categories */}
      <div className="space-y-2">
        {/* Style */}
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-muted/70 transition-colors">
          <div className="flex items-center gap-2">
            <Star className="h-3 w-3 text-foreground" />
            <span className="text-xs text-foreground">Style</span>
          </div>
          <div className="flex items-center gap-1">
            <ImageIcon className="h-3 w-3 text-muted-foreground" />
            <div className="w-3 h-3 border border-muted-foreground rounded"></div>
            <Plus className="h-3 w-3 text-muted-foreground" />
            <ChevronRight className="h-3 w-3 text-muted-foreground ml-1" />
          </div>
        </div>

        {/* Composition */}
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-muted/70 transition-colors">
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-3 w-3 text-foreground" />
            <span className="text-xs text-foreground">Composition</span>
          </div>
          <div className="flex items-center gap-1">
            <ImageIcon className="h-3 w-3 text-muted-foreground" />
            <ChevronRight className="h-3 w-3 text-muted-foreground ml-1" />
          </div>
        </div>

        {/* Effects */}
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-muted/70 transition-colors">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-foreground" />
            <span className="text-xs text-foreground">Effects</span>
          </div>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </div>

        {/* Character */}
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-muted/70 transition-colors">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-foreground" />
            <span className="text-xs text-foreground">Character</span>
          </div>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </div>

        {/* Object */}
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-muted/70 transition-colors">
          <div className="flex items-center gap-2">
            <Shirt className="h-3 w-3 text-foreground" />
            <span className="text-xs text-foreground">Object</span>
          </div>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </div>

        {/* Colors */}
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-muted/70 transition-colors">
          <div className="flex items-center gap-2">
            <Palette className="h-3 w-3 text-foreground" />
            <span className="text-xs text-foreground">Colors</span>
          </div>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      {/* Generation Parameters - Aligned on same line */}
      <div className="flex items-center justify-between">
        {/* Image Count */}
        <div className="flex items-center gap-1">
          <Layers className="h-3 w-3 text-foreground" />
          <Button 
            variant="outline" 
            size="icon" 
            className="h-5 w-5"
            onClick={() => handleImageCountChange(-1)}
          >
            <Minus className="h-2 w-2" />
          </Button>
          <span className="text-xs font-medium text-foreground min-w-[12px] text-center">
            {imageCount}
          </span>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-5 w-5"
            onClick={() => handleImageCountChange(1)}
          >
            <Plus className="h-2 w-2" />
          </Button>
        </div>

        {/* Aspect Ratio */}
        <div className="flex items-center gap-1">
          <Square className="h-3 w-3 text-foreground" />
          <span className="text-xs text-foreground">1:1</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      {/* Generate Button */}
      <Button 
        className="w-full bg-muted text-muted-foreground hover:bg-muted/80 h-8 text-xs" 
        disabled={!prompt.trim()}
      >
        <Sparkles className="h-3 w-3 mr-1" />
        Generate
      </Button>
    </div>
  )
}
