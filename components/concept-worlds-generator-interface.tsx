"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Globe, 
  Palette, 
  Camera, 
  Heart, 
  Building2, 
  Download,
  Sparkles,
  Upload,
  X,
  Check,
  Info,
  ChevronUp
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface WorldKit {
  id: string
  name: string
  prompt: string
  worldPurpose: string
  referenceImages: string[]
  seedVariability: number
  artDirection: string
  visualInfluence: string
  colorSystem: string
  lighting: string
  materialLanguage: string
  textureDetail: number
  environmentType: string
  locationArchetype: string
  cameraFraming: string
  depthLevel: number
  compositionScale: number
  atmosphericMotion: string
  spatialConsistencyLock: boolean
  mood: string
  culturalInfluence: string
  timeOfDay: string
  symbolicMotifs: string[]
  emotionalTone: string
  storyHook: string
  brandSync: boolean
  brandPaletteMode: string
  logoPlacement: string
  toneMatch: number
  typographyInWorld: string
  resolution: string
  exportType: string
  assets: { preview: string; depthMap?: string }
}

const WORLD_PURPOSES = [
  "Storytelling",
  "Product Context", 
  "Learning World",
  "Brand Universe",
  "Fantasy Realm",
  "Sci-Fi Environment",
  "Abstract Space"
]

const ART_DIRECTIONS = [
  "Realistic",
  "Stylized 3D",
  "Flat Vector",
  "Concept Matte",
  "Watercolor",
  "Clay Render",
  "Fantasy Painting",
  "Futuristic Minimal"
]

const VISUAL_INFLUENCES = [
  "Blade Runner",
  "Ghibli",
  "Pixar",
  "Wes Anderson",
  "Dune",
  "Arcane",
  "Bauhaus",
  "Ukiyo-e",
  "Cyberpunk 2077"
]

const COLOR_SYSTEMS = [
  "Natural Earth",
  "Neon Holographic",
  "Muted Editorial",
  "Warm Cinematic",
  "Monochrome Contrast"
]

const LIGHTING_PRESETS = [
  "Golden Hour",
  "Dual Tone Neon",
  "Soft Diffuse",
  "Ambient Fog",
  "Spotlight Drama"
]

const MATERIAL_LANGUAGES = [
  "Glass",
  "Metal",
  "Fabric",
  "Organic",
  "Paper",
  "Digital Plastic",
  "Concrete"
]

const ENVIRONMENT_TYPES = [
  "Interior",
  "Exterior",
  "Hybrid",
  "Abstract"
]

const LOCATION_ARCHETYPES = [
  "Forest",
  "Space Station",
  "Underwater City",
  "Studio Room",
  "Sky Island",
  "Desert Bazaar",
  "Mountain Peak",
  "Urban Alley",
  "Garden Oasis",
  "Crystal Cave"
]

const CAMERA_FRAMINGS = [
  "Wide",
  "Aerial",
  "Ground Level",
  "Close-up",
  "Isometric"
]

const ATMOSPHERIC_MOTIONS = [
  "Static",
  "Light Fog",
  "Particle Flow",
  "Dynamic Sky",
  "Water Ripple"
]

const MOODS = [
  { value: "hopeful", label: "Hopeful", emoji: "🌅" },
  { value: "calm", label: "Calm", emoji: "🌿" },
  { value: "mysterious", label: "Mysterious", emoji: "🌑" },
  { value: "energetic", label: "Energetic", emoji: "⚡" },
  { value: "tragic", label: "Tragic", emoji: "💧" },
  { value: "surreal", label: "Surreal", emoji: "🌀" }
]

const CULTURAL_INFLUENCES = [
  "Nordic",
  "Japanese Zen",
  "Moroccan",
  "Afro-futuristic",
  "Western Retro",
  "Oceanic",
  "Middle Eastern",
  "Global Contemporary"
]

const TIME_OF_DAY_OPTIONS = [
  "Morning",
  "Sunset",
  "Night",
  "Future",
  "Retro",
  "Timeless"
]

const SYMBOLIC_MOTIFS = [
  "Floating Islands",
  "Crystals",
  "Vines",
  "Digital Aura",
  "Desert Wind",
  "Light Beams",
  "Geometric Patterns",
  "Organic Growth",
  "Energy Fields",
  "Ancient Symbols"
]

const EMOTIONAL_TONES = [
  "Peaceful",
  "Tense",
  "Dreamlike",
  "Sacred",
  "Corporate",
  "Post-Apocalyptic"
]

const BRAND_PALETTE_MODES = [
  "Core",
  "Analogous",
  "Complementary",
  "Neutral"
]

const LOGO_PLACEMENTS = [
  "Hidden",
  "Discrete Signage",
  "Architectural Element"
]

const TYPOGRAPHY_OPTIONS = [
  "Use brand fonts for signage",
  "Use brand fonts for UI",
  "Use brand fonts for posters",
  "No typography integration"
]

const RESOLUTIONS = [
  "1024x1024",
  "1024x1792",
  "1792x1024",
  "2048x2048"
]

const EXPORT_TYPES = [
  "Static Image",
  "Animated Loop",
  "3D Scene",
  "Depth Map"
]

export function ConceptWorldsGeneratorInterface() {
  const [worldKit, setWorldKit] = useState<Partial<WorldKit>>({
    seedVariability: 50,
    textureDetail: 50,
    depthLevel: 50,
    compositionScale: 50,
    toneMatch: 50,
    spatialConsistencyLock: false,
    brandSync: false,
    symbolicMotifs: [],
    referenceImages: []
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const { toast } = useToast()

  // Smart conditional logic
  const isFlatVector = worldKit.artDirection === "Flat Vector"
  const isInterior = worldKit.environmentType === "Interior"
  const isLowDepth = (worldKit.depthLevel || 0) < 30
  const isSurreal = worldKit.mood === "surreal"
  const isBrandSynced = worldKit.brandSync

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages: string[] = []
      for (let i = 0; i < Math.min(files.length, 4); i++) {
        const file = files[i]
        const reader = new FileReader()
        reader.onload = (e) => {
          newImages.push(e.target?.result as string)
          if (newImages.length === Math.min(files.length, 4)) {
            setWorldKit(prev => ({
              ...prev,
              referenceImages: [...(prev.referenceImages || []), ...newImages].slice(0, 4)
            }))
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const removeReferenceImage = (index: number) => {
    setWorldKit(prev => ({
      ...prev,
      referenceImages: prev.referenceImages?.filter((_, i) => i !== index) || []
    }))
  }

  const toggleMotif = (motif: string) => {
    setWorldKit(prev => ({
      ...prev,
      symbolicMotifs: prev.symbolicMotifs?.includes(motif)
        ? prev.symbolicMotifs.filter(m => m !== motif)
        : [...(prev.symbolicMotifs || []), motif]
    }))
  }

  // Handle scroll to show/hide scroll button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setShowScrollButton(scrollTop > 100) // Lowered threshold for easier testing
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const generateWorld = async () => {
    if (!worldKit.prompt || !worldKit.name) {
      toast({
        title: "Missing required fields",
        description: "Please provide a world name and description.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    
    try {
      // Simulate generation process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast({
        title: "World generated successfully!",
        description: `"${worldKit.name}" has been created and saved to your collection.`,
      })
      
      // Reset form
      setWorldKit({
        seedVariability: 50,
        textureDetail: 50,
        depthLevel: 50,
        compositionScale: 50,
        toneMatch: 50,
        spatialConsistencyLock: false,
        brandSync: false,
        symbolicMotifs: [],
        referenceImages: []
      })
      
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "There was an error generating your world. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getWorldDNASummary = () => {
    const dna = []
    if (worldKit.artDirection) dna.push(worldKit.artDirection)
    if (worldKit.colorSystem) dna.push(worldKit.colorSystem)
    if (worldKit.mood) dna.push(MOODS.find(m => m.value === worldKit.mood)?.label)
    if (worldKit.culturalInfluence) dna.push(worldKit.culturalInfluence)
    return dna.filter(Boolean).join(" • ")
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Globe className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Concept Worlds Generator</h1>
        </div>
        <p className="text-muted-foreground">
          Design the rules of your universe so everything you create fits naturally inside it.
        </p>
      </div>

      {/* Smart Navigation */}
      <div className="sticky top-4 z-40 mb-6">
        <Card className="bg-background/95 backdrop-blur-sm border shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollToSection('world-intent')}
                className="text-xs"
              >
                1️⃣ World Intent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollToSection('visual-dna')}
                className="text-xs"
              >
                2️⃣ Visual DNA
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollToSection('spatial-dna')}
                className="text-xs"
              >
                3️⃣ Spatial DNA
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollToSection('narrative-dna')}
                className="text-xs"
              >
                4️⃣ Narrative DNA
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollToSection('brand-integration')}
                className="text-xs"
              >
                5️⃣ Brand Integration
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollToSection('preview-export')}
                className="text-xs"
              >
                6️⃣ Preview & Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        {/* 1️⃣ World Intent & Prompt */}
        <Card id="world-intent" className="border rounded-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <CardTitle className="text-lg">World Intent & Prompt</CardTitle>
                <CardDescription>Capture the core idea of the world</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">World Name</label>
                <Input
                  value={worldKit.name || ""}
                  onChange={(e) => setWorldKit(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your world name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prompt / Description</label>
                <Textarea
                  value={worldKit.prompt || ""}
                  onChange={(e) => setWorldKit(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="A floating eco-city above clouds powered by solar crystals..."
                  rows={3}
                />
                {worldKit.prompt && worldKit.prompt.includes("serene") && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-800">
                        Your world concept sounds serene — I'll bias the lighting and materials toward soft daylight.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">World Purpose</label>
                <Select
                  value={worldKit.worldPurpose || ""}
                  onValueChange={(value) => setWorldKit(prev => ({ ...prev, worldPurpose: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORLD_PURPOSES.map((purpose) => (
                      <SelectItem key={purpose} value={purpose.toLowerCase().replace(/\s+/g, '-')}>
                        {purpose}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reference Upload (Optional) - Max 4 images</label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="reference-upload"
                    disabled={(worldKit.referenceImages?.length || 0) >= 4}
                  />
                  <label htmlFor="reference-upload" className="cursor-pointer">
                    <div className="text-center space-y-2">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload reference images ({(worldKit.referenceImages?.length || 0)}/4)
                      </p>
                    </div>
                  </label>
                  
                  {worldKit.referenceImages && worldKit.referenceImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {worldKit.referenceImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img src={image} alt={`Reference ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
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
                <label className="block text-sm font-medium mb-2">
                  Seed Variability: {worldKit.seedVariability}%
                </label>
                <Slider
                  value={[worldKit.seedVariability || 50]}
                  onValueChange={([value]) => setWorldKit(prev => ({ ...prev, seedVariability: value }))}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Consistent</span>
                  <span>Experimental</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2️⃣ Visual DNA */}
        <Card id="visual-dna" className="border rounded-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <CardTitle className="text-lg">Visual DNA</CardTitle>
                <CardDescription>Define art direction, palette, and lighting rules</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Art Direction</label>
                  <Select
                    value={worldKit.artDirection || ""}
                    onValueChange={(value) => setWorldKit(prev => ({ ...prev, artDirection: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select art direction" />
                    </SelectTrigger>
                    <SelectContent>
                      {ART_DIRECTIONS.map((direction) => (
                        <SelectItem key={direction} value={direction.toLowerCase().replace(/\s+/g, '-')}>
                          {direction}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Visual Influence</label>
                  <Select
                    value={worldKit.visualInfluence || ""}
                    onValueChange={(value) => setWorldKit(prev => ({ ...prev, visualInfluence: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select influence" />
                    </SelectTrigger>
                    <SelectContent>
                      {VISUAL_INFLUENCES.map((influence) => (
                        <SelectItem key={influence} value={influence.toLowerCase().replace(/\s+/g, '-')}>
                          {influence}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Color System</label>
                  <Select
                    value={worldKit.colorSystem || ""}
                    onValueChange={(value) => setWorldKit(prev => ({ ...prev, colorSystem: value }))}
                    disabled={isBrandSynced}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select color system" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_SYSTEMS.map((system) => (
                        <SelectItem key={system} value={system.toLowerCase().replace(/\s+/g, '-')}>
                          {system}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Lighting Preset</label>
                  <Select
                    value={worldKit.lighting || ""}
                    onValueChange={(value) => setWorldKit(prev => ({ ...prev, lighting: value }))}
                    disabled={isFlatVector}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lighting" />
                    </SelectTrigger>
                    <SelectContent>
                      {LIGHTING_PRESETS.map((preset) => (
                        <SelectItem key={preset} value={preset.toLowerCase().replace(/\s+/g, '-')}>
                          {preset}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isFlatVector && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Lighting preset disabled for Flat Vector art direction
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Material Language</label>
                  <Select
                    value={worldKit.materialLanguage || ""}
                    onValueChange={(value) => setWorldKit(prev => ({ ...prev, materialLanguage: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIAL_LANGUAGES.map((material) => (
                        <SelectItem key={material} value={material.toLowerCase().replace(/\s+/g, '-')}>
                          {material}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Texture Detail: {worldKit.textureDetail}%
                  </label>
                  <Slider
                    value={[worldKit.textureDetail || 50]}
                    onValueChange={([value]) => setWorldKit(prev => ({ ...prev, textureDetail: value }))}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Minimal</span>
                    <span>Rich Detail</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-md">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Set lighting tone and material logic for your entire universe.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3️⃣ Spatial DNA */}
        <Card id="spatial-dna" className="border rounded-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <CardTitle className="text-lg">Spatial DNA</CardTitle>
                <CardDescription>Define environment type, camera, and spatial logic</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Environment Type</label>
                  <Select
                    value={worldKit.environmentType || ""}
                    onValueChange={(value) => setWorldKit(prev => ({ ...prev, environmentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENVIRONMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location Archetype</label>
                  <Select
                    value={worldKit.locationArchetype || ""}
                    onValueChange={(value) => setWorldKit(prev => ({ ...prev, locationArchetype: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_ARCHETYPES.map((archetype) => (
                        <SelectItem key={archetype} value={archetype.toLowerCase().replace(/\s+/g, '-')}>
                          {archetype}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Camera Framing</label>
                  <Select
                    value={worldKit.cameraFraming || ""}
                    onValueChange={(value) => setWorldKit(prev => ({ ...prev, cameraFraming: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select framing" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMERA_FRAMINGS.map((framing) => (
                        <SelectItem key={framing} value={framing.toLowerCase().replace(/\s+/g, '-')}>
                          {framing}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Atmospheric Motion</label>
                  <Select
                    value={worldKit.atmosphericMotion || ""}
                    onValueChange={(value) => setWorldKit(prev => ({ ...prev, atmosphericMotion: value }))}
                    disabled={isInterior}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select motion" />
                    </SelectTrigger>
                    <SelectContent>
                      {ATMOSPHERIC_MOTIONS.map((motion) => (
                        <SelectItem key={motion} value={motion.toLowerCase().replace(/\s+/g, '-')}>
                          {motion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isInterior && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Atmospheric motion limited for interior environments
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Depth Level: {worldKit.depthLevel}%
                  </label>
                  <Slider
                    value={[worldKit.depthLevel || 50]}
                    onValueChange={([value]) => setWorldKit(prev => ({ ...prev, depthLevel: value }))}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Flat (2D)</span>
                    <span>Volumetric (3D)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Composition Scale: {worldKit.compositionScale}%
                  </label>
                  <Slider
                    value={[worldKit.compositionScale || 50]}
                    onValueChange={([value]) => setWorldKit(prev => ({ ...prev, compositionScale: value }))}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Micro (object)</span>
                    <span>Macro (world)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="spatial-consistency"
                  checked={worldKit.spatialConsistencyLock || false}
                  onCheckedChange={(checked) => setWorldKit(prev => ({ ...prev, spatialConsistencyLock: checked }))}
                />
                <label htmlFor="spatial-consistency" className="text-sm font-medium">
                  Spatial Consistency Lock
                </label>
                <span className="text-xs text-muted-foreground">Keeps geometry coherent across scenes</span>
              </div>

              {worldKit.cameraFraming === "aerial" && (worldKit.depthLevel || 0) > 70 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      A wide aerial framing pairs well with volumetric depth for cinematic motion shots.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 4️⃣ Narrative DNA */}
        <Card id="narrative-dna" className="border rounded-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">4️⃣</span>
              <div>
                <CardTitle className="text-lg">Narrative DNA</CardTitle>
                <CardDescription>Encode meaning, emotion, and culture of the world</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Mood Context</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {MOODS.map((mood) => (
                    <Button
                      key={mood.value}
                      type="button"
                      variant={worldKit.mood === mood.value ? "default" : "outline"}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={() => setWorldKit(prev => ({ ...prev, mood: mood.value }))}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className="text-sm">{mood.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cultural Influence</label>
                  <Select
                    value={worldKit.culturalInfluence || ""}
                    onValueChange={(value) => setWorldKit(prev => ({ ...prev, culturalInfluence: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select culture" />
                    </SelectTrigger>
                    <SelectContent>
                      {CULTURAL_INFLUENCES.map((culture) => (
                        <SelectItem key={culture} value={culture.toLowerCase().replace(/\s+/g, '-')}>
                          {culture}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Time of Day / Era</label>
                  <Select
                    value={worldKit.timeOfDay || ""}
                    onValueChange={(value) => setWorldKit(prev => ({ ...prev, timeOfDay: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OF_DAY_OPTIONS.map((time) => (
                        <SelectItem key={time} value={time.toLowerCase()}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Symbolic Motifs</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SYMBOLIC_MOTIFS.map((motif) => (
                    <Button
                      key={motif}
                      type="button"
                      variant={worldKit.symbolicMotifs?.includes(motif) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleMotif(motif)}
                    >
                      {motif}
                    </Button>
                  ))}
                </div>
                {isSurreal && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Surreal mood automatically enables symbolic motifs for enhanced creativity
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Emotional Tone</label>
                <Select
                  value={worldKit.emotionalTone || ""}
                  onValueChange={(value) => setWorldKit(prev => ({ ...prev, emotionalTone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMOTIONAL_TONES.map((tone) => (
                      <SelectItem key={tone} value={tone.toLowerCase().replace(/\s+/g, '-')}>
                        {tone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Story Hook (Optional)</label>
                <Textarea
                  value={worldKit.storyHook || ""}
                  onChange={(e) => setWorldKit(prev => ({ ...prev, storyHook: e.target.value }))}
                  placeholder="A society that grows gardens in the sky..."
                  rows={2}
                />
              </div>

              {worldKit.culturalInfluence === "afro-futuristic" && worldKit.lighting === "dual-tone-neon" && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
                    <p className="text-sm text-purple-800">
                      Your Afro-futuristic tone blends best with Neon Lighting + Organic Materials.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 5️⃣ Brand Integration */}
        <Card id="brand-integration" className="border rounded-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">5️⃣</span>
              <div>
                <CardTitle className="text-lg">Brand Integration</CardTitle>
                <CardDescription>Apply brand kit to the world (Optional)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="brand-sync"
                  checked={worldKit.brandSync || false}
                  onCheckedChange={(checked) => setWorldKit(prev => ({ ...prev, brandSync: checked }))}
                />
                <label htmlFor="brand-sync" className="text-sm font-medium">
                  Brand Sync
                </label>
                <span className="text-xs text-muted-foreground">Pull Brand Kit for palette, fonts, watermark</span>
              </div>

              {isBrandSynced && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Brand Palette Mode</label>
                      <Select
                        value={worldKit.brandPaletteMode || ""}
                        onValueChange={(value) => setWorldKit(prev => ({ ...prev, brandPaletteMode: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select palette mode" />
                        </SelectTrigger>
                        <SelectContent>
                          {BRAND_PALETTE_MODES.map((mode) => (
                            <SelectItem key={mode} value={mode.toLowerCase()}>
                              {mode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Logo Placement (Optional)</label>
                      <Select
                        value={worldKit.logoPlacement || ""}
                        onValueChange={(value) => setWorldKit(prev => ({ ...prev, logoPlacement: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select placement" />
                        </SelectTrigger>
                        <SelectContent>
                          {LOGO_PLACEMENTS.map((placement) => (
                            <SelectItem key={placement} value={placement.toLowerCase().replace(/\s+/g, '-')}>
                              {placement}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Tone Match: {worldKit.toneMatch}%
                      </label>
                      <Slider
                        value={[worldKit.toneMatch || 50]}
                        onValueChange={([value]) => setWorldKit(prev => ({ ...prev, toneMatch: value }))}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>World Palette</span>
                        <span>Brand Palette</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Typography in World</label>
                      <Select
                        value={worldKit.typographyInWorld || ""}
                        onValueChange={(value) => setWorldKit(prev => ({ ...prev, typographyInWorld: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select typography" />
                        </SelectTrigger>
                        <SelectContent>
                          {TYPOGRAPHY_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option.toLowerCase().replace(/\s+/g, '-')}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <p className="text-sm text-green-800">
                        DreamCut is applying your brand tones as environmental accents.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 6️⃣ Preview & Export */}
        <Card id="preview-export" className="border rounded-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">6️⃣</span>
              <div>
                <CardTitle className="text-lg">Preview & Export</CardTitle>
                <CardDescription>Generate and save the world as a reusable kit</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Resolution</label>
                  <Select
                    value={worldKit.resolution || ""}
                    onValueChange={(value) => setWorldKit(prev => ({ ...prev, resolution: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOLUTIONS.map((resolution) => (
                        <SelectItem key={resolution} value={resolution}>
                          {resolution}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Export Type</label>
                  <Select
                    value={worldKit.exportType || ""}
                    onValueChange={(value) => setWorldKit(prev => ({ ...prev, exportType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select export type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPORT_TYPES.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {worldKit.exportType === "animated-loop" && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Animated export will show motion parameters (loop duration, camera path) in the next step.
                    </p>
                  </div>
                </div>
              )}

              {isLowDepth && worldKit.exportType === "3d-scene" && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-orange-600 mt-0.5" />
                    <p className="text-sm text-orange-800">
                      3D Scene export disabled for low depth levels. Consider increasing depth level for 3D export.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={generateWorld}
                  disabled={isGenerating || !worldKit.name || !worldKit.prompt}
                  className="flex-1"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Generating World...
                    </>
                  ) : (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      Generate World Kit
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* World DNA Summary */}
      {getWorldDNASummary() && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              World DNA Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getWorldDNASummary().split(" • ").map((item, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scroll to Top Button */}
      {showScrollButton && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
