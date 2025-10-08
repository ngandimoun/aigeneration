"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  X, 
  Upload, 
  FileText, 
  Palette, 
  Type, 
  Layout, 
  MessageSquare,
  Download,
  Sparkles,
  Eye,
  Settings,
  Zap,
  Image as ImageIcon,
  Minus,
  Plus,
  Camera,
  Layers,
  Target,
  Heart,
  Leaf,
  Moon,
  Sun,
  Droplets,
  Zap as Energy,
  Gem,
  PartyPopper
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface IllustrationGeneratorInterfaceProps {
  onClose: () => void
  projectTitle: string
}

// Style maps and constants
const ART_DIRECTIONS = [
  { value: "flat-vector", label: "Flat Vector", description: "Clean, minimal 2D graphics" },
  { value: "isometric", label: "Isometric", description: "3D perspective with equal angles" },
  { value: "stylized-3d", label: "Stylized 3D", description: "Simplified 3D with artistic flair" },
  { value: "watercolor", label: "Watercolor", description: "Soft, flowing paint effects" },
  { value: "sketch", label: "Sketch", description: "Hand-drawn, organic lines" },
  { value: "editorial", label: "Editorial", description: "Professional, magazine-style" },
  { value: "cartoon", label: "Cartoon", description: "Playful, animated style" },
  { value: "surreal-concept", label: "Surreal Concept", description: "Dreamlike, abstract imagery" },
  { value: "photorealistic", label: "Photorealistic", description: "Lifelike, detailed rendering" },
  { value: "minimalist", label: "Minimalist", description: "Clean, essential elements only" },
  { value: "vintage", label: "Vintage", description: "Retro, nostalgic aesthetic" },
  { value: "cyberpunk", label: "Cyberpunk", description: "Futuristic, neon-lit style" }
]

const VISUAL_INFLUENCES = {
  "flat-vector": [
    { value: "bauhaus-geometry", label: "Bauhaus Geometry", description: "Geometric precision" },
    { value: "dribbble-minimal", label: "Dribbble Minimal", description: "Clean, modern design" },
    { value: "retro-80s", label: "Retro 80s", description: "Neon and synthwave vibes" },
    { value: "material-design", label: "Material Design", description: "Google's design language" }
  ],
  "isometric": [
    { value: "pixar-soft", label: "Pixar Soft", description: "Friendly, rounded forms" },
    { value: "retro-80s", label: "Retro 80s", description: "Vibrant, nostalgic colors" },
    { value: "tech-illustration", label: "Tech Illustration", description: "Modern, clean tech style" },
    { value: "game-art", label: "Game Art", description: "Video game aesthetics" }
  ],
  "stylized-3d": [
    { value: "pixar-soft", label: "Pixar Soft", description: "Smooth, friendly 3D" },
    { value: "vogue-editorial", label: "Vogue Editorial", description: "High-fashion styling" },
    { value: "blender-cycles", label: "Blender Cycles", description: "Realistic rendering" },
    { value: "low-poly", label: "Low Poly", description: "Geometric, faceted style" }
  ],
  "watercolor": [
    { value: "ukiyo-e", label: "Ukiyo-e", description: "Japanese woodblock style" },
    { value: "ghibli-warm", label: "Ghibli Warm", description: "Studio Ghibli aesthetic" },
    { value: "impressionist", label: "Impressionist", description: "Soft, painterly strokes" },
    { value: "botanical", label: "Botanical", description: "Natural, organic forms" }
  ],
  "sketch": [
    { value: "behance-editorial", label: "Behance Editorial", description: "Professional sketches" },
    { value: "vogue-editorial", label: "Vogue Editorial", description: "Fashion illustration" },
    { value: "architectural", label: "Architectural", description: "Technical drawing style" },
    { value: "life-drawing", label: "Life Drawing", description: "Classical figure study" }
  ],
  "editorial": [
    { value: "behance-editorial", label: "Behance Editorial", description: "Modern editorial style" },
    { value: "vogue-editorial", label: "Vogue Editorial", description: "High-fashion editorial" },
    { value: "new-yorker", label: "New Yorker", description: "Classic magazine style" },
    { value: "national-geographic", label: "National Geographic", description: "Documentary style" }
  ],
  "cartoon": [
    { value: "pixar-soft", label: "Pixar Soft", description: "Disney/Pixar animation" },
    { value: "ghibli-warm", label: "Ghibli Warm", description: "Studio Ghibli charm" },
    { value: "adventure-time", label: "Adventure Time", description: "Surreal cartoon style" },
    { value: "rick-morty", label: "Rick & Morty", description: "Adult animation style" }
  ],
  "surreal-concept": [
    { value: "vogue-editorial", label: "Vogue Editorial", description: "High-fashion surrealism" },
    { value: "behance-editorial", label: "Behance Editorial", description: "Modern surreal art" },
    { value: "dali-inspired", label: "Dalí Inspired", description: "Classic surrealism" },
    { value: "magritte-style", label: "Magritte Style", description: "Conceptual surrealism" }
  ],
  "photorealistic": [
    { value: "hyperrealism", label: "Hyperrealism", description: "Ultra-detailed realism" },
    { value: "cinematic", label: "Cinematic", description: "Movie-quality rendering" },
    { value: "product-photography", label: "Product Photography", description: "Commercial quality" },
    { value: "portrait-photography", label: "Portrait Photography", description: "Professional portraits" }
  ],
  "minimalist": [
    { value: "scandinavian", label: "Scandinavian", description: "Nordic design principles" },
    { value: "japanese-wabi-sabi", label: "Japanese Wabi-Sabi", description: "Imperfect beauty" },
    { value: "swiss-design", label: "Swiss Design", description: "Typography-focused" },
    { value: "brutalist", label: "Brutalist", description: "Raw, functional beauty" }
  ],
  "vintage": [
    { value: "art-deco", label: "Art Deco", description: "1920s geometric luxury" },
    { value: "mid-century", label: "Mid-Century", description: "1950s-60s modernism" },
    { value: "victorian", label: "Victorian", description: "Ornate, detailed style" },
    { value: "retro-futurism", label: "Retro Futurism", description: "Past's vision of future" }
  ],
  "cyberpunk": [
    { value: "blade-runner", label: "Blade Runner", description: "Neo-noir sci-fi" },
    { value: "ghost-in-shell", label: "Ghost in the Shell", description: "Anime cyberpunk" },
    { value: "matrix-style", label: "Matrix Style", description: "Digital rain aesthetic" },
    { value: "synthwave", label: "Synthwave", description: "80s neon nostalgia" }
  ]
}

const MEDIUM_TEXTURES = [
  { value: "paper-grain", label: "Paper Grain", description: "Natural paper texture" },
  { value: "digital-smooth", label: "Digital Smooth", description: "Clean, vector-like finish" },
  { value: "canvas", label: "Canvas", description: "Traditional painting surface" },
  { value: "glossy-3d", label: "Glossy 3D", description: "Shiny, reflective surface" },
  { value: "pencil", label: "Pencil", description: "Graphite drawing texture" },
  { value: "charcoal", label: "Charcoal", description: "Soft, smudged texture" },
  { value: "ink-wash", label: "Ink Wash", description: "Flowing, transparent ink" },
  { value: "acrylic", label: "Acrylic", description: "Bold, opaque paint" },
  { value: "oil-paint", label: "Oil Paint", description: "Rich, layered texture" },
  { value: "pastel", label: "Pastel", description: "Soft, chalky finish" },
  { value: "metallic", label: "Metallic", description: "Shiny, reflective metal" },
  { value: "matte", label: "Matte", description: "Non-reflective, flat finish" }
]

const LIGHTING_PRESETS = [
  { value: "soft-ambient", label: "Soft Ambient", description: "Even, gentle lighting" },
  { value: "golden-hour", label: "Golden Hour", description: "Warm, sunset lighting" },
  { value: "studio-spot", label: "Studio Spot", description: "Focused, dramatic light" },
  { value: "diffused", label: "Diffused", description: "Soft, scattered light" },
  { value: "glow-rim", label: "Glow Rim", description: "Backlit, glowing edges" },
  { value: "dramatic-shadow", label: "Dramatic Shadow", description: "High contrast, moody" },
  { value: "neon-glow", label: "Neon Glow", description: "Electric, vibrant lighting" },
  { value: "natural-daylight", label: "Natural Daylight", description: "Clear, bright sunlight" },
  { value: "moonlight", label: "Moonlight", description: "Cool, silvery light" },
  { value: "candlelight", label: "Candlelight", description: "Warm, flickering glow" },
  { value: "fluorescent", label: "Fluorescent", description: "Harsh, artificial light" },
  { value: "volumetric", label: "Volumetric", description: "Visible light rays" }
]

const PURPOSE_OPTIONS = [
  { value: "hero-visual", label: "Hero Visual" },
  { value: "scene", label: "Scene" },
  { value: "icon", label: "Icon" },
  { value: "diagram", label: "Diagram" },
  { value: "background", label: "Background" },
  { value: "character", label: "Character" },
  { value: "thumbnails-covers", label: "Thumbnails & Covers" }
]

const MOOD_CONTEXTS = [
  { value: "happy", label: "Happy", emoji: "😊", icon: Heart },
  { value: "calm", label: "Calm", emoji: "🌿", icon: Leaf },
  { value: "mysterious", label: "Mysterious", emoji: "🌑", icon: Moon },
  { value: "hopeful", label: "Hopeful", emoji: "🌅", icon: Sun },
  { value: "tragic", label: "Tragic", emoji: "💧", icon: Droplets },
  { value: "energetic", label: "Energetic", emoji: "⚡", icon: Energy },
  { value: "elegant", label: "Elegant", emoji: "💎", icon: Gem },
  { value: "playful", label: "Playful", emoji: "🎈", icon: PartyPopper }
]

const COLOR_PALETTE_MODES = [
  { value: "brand-core", label: "Brand Core" },
  { value: "analogous", label: "Analogous" },
  { value: "complementary", label: "Complementary" },
  { value: "neutral", label: "Neutral" }
]

const FONT_STYLES = [
  { value: "playfair", label: "Playfair" },
  { value: "inter", label: "Inter" },
  { value: "lora", label: "Lora" },
  { value: "bebas-neue", label: "Bebas Neue" }
]

const COMPOSITION_TEMPLATES = [
  { value: "hero-scene", label: "Hero Scene" },
  { value: "concept-diagram", label: "Concept Diagram" },
  { value: "character-portrait", label: "Character Portrait" },
  { value: "scene-composition", label: "Scene Composition" },
  { value: "background-texture", label: "Background Texture" },
  { value: "icon-set", label: "Icon Set (Batch)" },
  { value: "poster-layout", label: "Poster Layout" }
]

const CAMERA_ANGLES = [
  { value: "flat", label: "Flat" },
  { value: "isometric", label: "Isometric" },
  { value: "perspective", label: "Perspective" }
]

const SUBJECT_PLACEMENTS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" }
]

const WATERMARK_PLACEMENTS = [
  { value: "top-right", label: "Top-right" },
  { value: "bottom-left", label: "Bottom-left" },
  { value: "none", label: "None" }
]

export function IllustrationGeneratorInterface({ onClose, projectTitle }: IllustrationGeneratorInterfaceProps) {
  const { toast } = useToast()
  
  // Entry & Intent
  const [prompt, setPrompt] = useState("")
  const [purpose, setPurpose] = useState("")
  const [referenceImages, setReferenceImages] = useState<File[]>([])
  const [imageCount, setImageCount] = useState(4)
  
  // Art Direction & Visual Style
  const [artDirection, setArtDirection] = useState("")
  const [visualInfluence, setVisualInfluence] = useState("")
  const [mediumTexture, setMediumTexture] = useState("")
  const [lightingPreset, setLightingPreset] = useState("")
  const [outlineStyle, setOutlineStyle] = useState("hard")
  
  // Mood Context
  const [moodContext, setMoodContext] = useState("")
  const [toneIntensity, setToneIntensity] = useState([50])
  const [paletteWarmth, setPaletteWarmth] = useState([50])
  const [expressionHarmony, setExpressionHarmony] = useState(false)
  
  // Brand Sync & Palette
  const [brandSync, setBrandSync] = useState(false)
  const [colorPaletteMode, setColorPaletteMode] = useState("")
  const [accentColor, setAccentColor] = useState("#1E90FF")
  const [fontStyle, setFontStyle] = useState("")
  const [watermarkPlacement, setWatermarkPlacement] = useState("none")
  const [logoImage, setLogoImage] = useState<File | null>(null)
  
  // Composition Template
  const [compositionTemplate, setCompositionTemplate] = useState("")
  const [cameraAngle, setCameraAngle] = useState("")
  const [depthControl, setDepthControl] = useState([50])
  const [subjectPlacement, setSubjectPlacement] = useState("center")
  const [safeZoneOverlay, setSafeZoneOverlay] = useState(false)
  
  // Smart behavior states
  const [smartMessage, setSmartMessage] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Smart behavior logic
  useEffect(() => {
    let message = ""
    
    // Art Direction changes
    if (artDirection === "flat-vector") {
      setLightingPreset("") // Disable lighting for flat vector
      setMediumTexture("digital-smooth") // Auto-select appropriate texture
      message = "DreamCut disabled lighting and selected digital smooth texture for flat vector style."
    }
    
    if (artDirection === "watercolor") {
      setMediumTexture("paper-grain") // Auto-select paper texture
      setLightingPreset("soft-ambient") // Soft lighting for watercolor
      message = "DreamCut selected paper grain texture and soft ambient lighting for watercolor style."
    }
    
    if (artDirection === "sketch") {
      setMediumTexture("pencil") // Auto-select pencil texture
      setLightingPreset("") // No lighting for sketches
      message = "DreamCut selected pencil texture and disabled lighting for sketch style."
    }
    
    if (artDirection === "photorealistic") {
      setMediumTexture("canvas") // Auto-select canvas
      setLightingPreset("natural-daylight") // Natural lighting
      message = "DreamCut selected canvas texture and natural daylight for photorealistic style."
    }
    
    if (artDirection === "cyberpunk") {
      setLightingPreset("neon-glow") // Auto-select neon lighting
      setMediumTexture("metallic") // Metallic texture
      message = "DreamCut selected neon glow lighting and metallic texture for cyberpunk style."
    }
    
    if (purpose === "icon") {
      setArtDirection("flat-vector") // Force flat vector for icons
      setLightingPreset("") // Disable lighting
      message = "DreamCut forced flat vector style and disabled lighting for icon generation."
    }
    
    if (purpose === "thumbnails-covers") {
      setCompositionTemplate("hero-scene") // Force hero scene composition for thumbnails
      setLightingPreset("golden-hour") // Warm, engaging lighting for thumbnails
      setToneIntensity([75]) // High contrast for visibility at small sizes
      setSubjectPlacement("center") // Center subject for thumbnail focus
      setSafeZoneOverlay(true) // Enable safe zone for text overlays
      message = "DreamCut optimized composition, lighting, and contrast for thumbnail visibility and engagement."
    }
    
    // Mood context changes
    if (moodContext === "calm") {
      setToneIntensity([30]) // Lower contrast
      setLightingPreset("soft-ambient") // Soft lighting
      message = "DreamCut tuned lighting and edge softness to match your calm mood."
    } else if (moodContext === "playful") {
      setToneIntensity([80]) // Higher saturation
      setLightingPreset("golden-hour") // Warm lighting
      message = "DreamCut boosted saturation and brightened highlights for playful mood."
    } else if (moodContext === "elegant") {
      setFontStyle("playfair") // Auto-apply serif
      setLightingPreset("studio-spot") // Dramatic lighting
      message = "DreamCut introduced softer gradients and minimal shapes for elegant style."
    } else if (moodContext === "mysterious") {
      setLightingPreset("dramatic-shadow") // Dark, moody lighting
      setToneIntensity([20]) // Low contrast
      message = "DreamCut applied dramatic shadows and low contrast for mysterious mood."
    } else if (moodContext === "energetic") {
      setLightingPreset("neon-glow") // Bright, electric lighting
      setToneIntensity([90]) // High contrast
      message = "DreamCut applied neon glow and high contrast for energetic mood."
    }
    
    // Brand sync changes
    if (brandSync) {
      setColorPaletteMode("brand-core")
      message = "DreamCut locked color palette to brand core colors."
    }
    
    // Template changes
    if (compositionTemplate === "icon-set") {
      setArtDirection("flat-vector")
      setLightingPreset("")
      message = "DreamCut forced consistent grid and shared palette for icon set."
    }
    
    if (compositionTemplate === "hero-scene") {
      setLightingPreset("golden-hour") // Hero scenes often use warm lighting
      message = "DreamCut applied golden hour lighting for hero scene composition."
    }
    
    // Brand color warning
    if (brandSync && accentColor === "#1E90FF" && moodContext === "calm") {
      message = "Your brand blue (#1E90FF) is too cold for a Calm mood — shifting hue slightly warmer."
      setAccentColor("#4A90E2") // Warmer blue
    }
    
    setSmartMessage(message)
  }, [artDirection, moodContext, brandSync, compositionTemplate, accentColor, purpose])

  // Update visual influences when art direction changes
  useEffect(() => {
    if (artDirection && VISUAL_INFLUENCES[artDirection as keyof typeof VISUAL_INFLUENCES]) {
      setVisualInfluence("") // Reset to allow new selection
    }
  }, [artDirection])

  const handleImageCountChange = (delta: number) => {
    const newCount = imageCount + delta
    if (newCount >= 1 && newCount <= 4) {
      setImageCount(newCount)
    }
  }

  const handleReferenceImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length + referenceImages.length > 4) {
      toast({
        title: "Too many images",
        description: "Maximum 4 reference images allowed.",
        variant: "destructive"
      })
      return
    }
    setReferenceImages(prev => [...prev, ...files])
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoImage(file)
    }
  }

  const removeReferenceImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for your illustration.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    
    try {
      const formData = new FormData()
      
      // Entry & Intent
      formData.append('prompt', prompt)
      formData.append('purpose', purpose)
      formData.append('imageCount', imageCount.toString())
      
      // Art Direction & Visual Style
      formData.append('artDirection', artDirection)
      formData.append('visualInfluence', visualInfluence)
      formData.append('mediumTexture', mediumTexture)
      formData.append('lightingPreset', lightingPreset)
      formData.append('outlineStyle', outlineStyle)
      
      // Mood Context
      formData.append('moodContext', moodContext)
      formData.append('toneIntensity', toneIntensity[0].toString())
      formData.append('paletteWarmth', paletteWarmth[0].toString())
      formData.append('expressionHarmony', expressionHarmony.toString())
      
      // Brand Sync & Palette
      formData.append('brandSync', brandSync.toString())
      formData.append('colorPaletteMode', colorPaletteMode)
      formData.append('accentColor', accentColor)
      formData.append('fontStyle', fontStyle)
      formData.append('watermarkPlacement', watermarkPlacement)
      
      // Composition Template
      formData.append('compositionTemplate', compositionTemplate)
      formData.append('cameraAngle', cameraAngle)
      formData.append('depthControl', depthControl[0].toString())
      formData.append('subjectPlacement', subjectPlacement)
      formData.append('safeZoneOverlay', safeZoneOverlay.toString())
      
      // Add reference images
      referenceImages.forEach((file, index) => {
        formData.append(`referenceImage_${index}`, file)
      })
      
      // Add logo if present
      if (logoImage) {
        formData.append('logoImage', logoImage)
      }

      const response = await fetch('/api/illustrations', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate illustration')
      }

      const result = await response.json()
      
      toast({
        title: "Illustration generated!",
        description: `Successfully created ${imageCount} illustration(s) for "${projectTitle}".`,
      })
      
      onClose()
      
    } catch (error) {
      console.error('Illustration generation failed:', error)
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate illustration. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getAvailableVisualInfluences = () => {
    if (!artDirection) return []
    return VISUAL_INFLUENCES[artDirection as keyof typeof VISUAL_INFLUENCES] || []
  }

  const isLightingDisabled = () => {
    return artDirection === "flat-vector" || purpose === "icon"
  }

  return (
    <div className="bg-background border border-border rounded-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Generate Illustrations for: {projectTitle}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Smart Message */}
      {smartMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {smartMessage}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Entry & Intent */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-foreground border-b pb-2">Entry & Intent</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Flat vector hero of people planting trees."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="purpose">Purpose Selector</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {PURPOSE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Upload Reference (optional)</Label>
              <div className="mt-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleReferenceImageUpload}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">
                    Max 4 images
                  </span>
                </div>
                {referenceImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {referenceImages.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Reference ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeReferenceImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Number of Images</Label>
              <div className="flex items-center gap-3 mt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleImageCountChange(-1)}
                  disabled={imageCount <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium w-8 text-center">{imageCount}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleImageCountChange(1)}
                  disabled={imageCount >= 4}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">(Max 4)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Art Direction & Visual Style */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-foreground border-b pb-2">Art Direction & Visual Style</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="art-direction">Art Direction</Label>
              <Select value={artDirection} onValueChange={setArtDirection}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select art direction" />
                </SelectTrigger>
                <SelectContent>
                  {ART_DIRECTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="visual-influence">Visual Influence</Label>
              <Select 
                value={visualInfluence} 
                onValueChange={setVisualInfluence}
                disabled={!artDirection}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select visual influence" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableVisualInfluences().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="medium-texture">Medium Texture</Label>
              <Select value={mediumTexture} onValueChange={setMediumTexture}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select medium texture" />
                </SelectTrigger>
                <SelectContent>
                  {MEDIUM_TEXTURES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lighting-preset">Lighting Preset</Label>
              <Select 
                value={lightingPreset} 
                onValueChange={setLightingPreset}
                disabled={isLightingDisabled()}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select lighting preset" />
                </SelectTrigger>
                <SelectContent>
                  {LIGHTING_PRESETS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLightingDisabled() && (
                <p className="text-sm text-muted-foreground mt-1">
                  Lighting disabled for {artDirection === "flat-vector" ? "flat vector" : "icon"} style
                </p>
              )}
            </div>

            <div>
              <Label>Outline & Edge Style</Label>
              <RadioGroup value={outlineStyle} onValueChange={setOutlineStyle} className="mt-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hard" id="hard" />
                  <Label htmlFor="hard">Hard</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="soft" id="soft" />
                  <Label htmlFor="soft">Soft</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">None</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        {/* Mood Context */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-foreground border-b pb-2">Mood Context</h4>
          <div className="space-y-4">
            <div>
              <Label>Mood Context</Label>
              <RadioGroup value={moodContext} onValueChange={setMoodContext} className="mt-1">
                <div className="grid grid-cols-2 gap-3">
                  {MOOD_CONTEXTS.map((mood) => {
                    const IconComponent = mood.icon
                    return (
                      <div key={mood.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={mood.value} id={mood.value} />
                        <Label htmlFor={mood.value} className="flex items-center gap-2 cursor-pointer">
                          <span className="text-lg">{mood.emoji}</span>
                          <IconComponent className="h-4 w-4" />
                          {mood.label}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Tone Intensity: {toneIntensity[0]}%</Label>
              <Slider
                value={toneIntensity}
                onValueChange={setToneIntensity}
                max={100}
                step={1}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Adjusts contrast, saturation, texture depth
              </p>
            </div>

            <div>
              <Label>Palette Warmth: {paletteWarmth[0]}%</Label>
              <Slider
                value={paletteWarmth}
                onValueChange={setPaletteWarmth}
                max={100}
                step={1}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Warm → Cool spectrum
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="expression-harmony"
                checked={expressionHarmony}
                onCheckedChange={setExpressionHarmony}
              />
              <Label htmlFor="expression-harmony">
                Expression Harmony
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Aligns character expressions & background tone
            </p>
          </div>
        </div>

        {/* Brand Sync & Palette */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-foreground border-b pb-2">Brand Sync & Palette</h4>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="brand-sync"
                checked={brandSync}
                onCheckedChange={setBrandSync}
              />
              <Label htmlFor="brand-sync">Brand Sync</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Pulls Brand Kit (colors, fonts, logo)
            </p>

            <div>
              <Label htmlFor="color-palette-mode">Color Palette Mode</Label>
              <Select value={colorPaletteMode} onValueChange={setColorPaletteMode}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select color palette mode" />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_PALETTE_MODES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="accent-color">Accent Control</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#1E90FF"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="font-style">Font Style (for text inside illustration)</Label>
              <Select value={fontStyle} onValueChange={setFontStyle}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select font style" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_STYLES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="watermark-placement">Watermark / Logo Placement</Label>
              <Select value={watermarkPlacement} onValueChange={setWatermarkPlacement}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select watermark placement" />
                </SelectTrigger>
                <SelectContent>
                  {WATERMARK_PLACEMENTS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {watermarkPlacement !== "none" && (
              <div>
                <Label>Logo Image Upload</Label>
                <div className="mt-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  {logoImage && (
                    <div className="relative w-20 h-20">
                      <img
                        src={URL.createObjectURL(logoImage)}
                        alt="Logo preview"
                        className="w-full h-full object-cover rounded border"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => setLogoImage(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Composition Template */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-foreground border-b pb-2">Composition Template</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="composition-template">Composition Template</Label>
              <Select value={compositionTemplate} onValueChange={setCompositionTemplate}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select composition template" />
                </SelectTrigger>
                <SelectContent>
                  {COMPOSITION_TEMPLATES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="camera-angle">Camera Angle</Label>
              <Select value={cameraAngle} onValueChange={setCameraAngle}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select camera angle" />
                </SelectTrigger>
                <SelectContent>
                  {CAMERA_ANGLES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Depth Control: {depthControl[0]}%</Label>
              <Slider
                value={depthControl}
                onValueChange={setDepthControl}
                max={100}
                step={1}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="subject-placement">Subject Placement</Label>
              <Select value={subjectPlacement} onValueChange={setSubjectPlacement}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select subject placement" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECT_PLACEMENTS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="safe-zone-overlay"
                checked={safeZoneOverlay}
                onCheckedChange={setSafeZoneOverlay}
              />
              <Label htmlFor="safe-zone-overlay">Safe Zone Overlay</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Hero layout centers your subject and keeps 25% safe zone for text overlays
            </p>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt.trim()}
          className="min-w-[120px]"
        >
          {isGenerating ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
