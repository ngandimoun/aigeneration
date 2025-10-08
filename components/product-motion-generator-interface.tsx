"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { 
  X, 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  Camera,
  Lightbulb,
  Palette,
  Music,
  Volume2,
  Zap,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Loader2,
  Eye,
  Download,
  RefreshCw,
  Play,
  Pause,
  VolumeX
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ProductMotionGeneratorInterfaceProps {
  onClose: () => void
  projectTitle: string
  selectedArtifact?: {
    id: string
    title: string
    image: string
    description: string
  }
}

// Motion DNA Types
type EmotionalTone = "Epic" | "Elegant" | "Calm" | "Poetic" | "Powerful"
type VisualStyle = "Photoreal" | "Cinematic" | "Stylized CG" | "Watercolor Softness"
type Environment = "Studio white" | "Urban twilight" | "Forest dawn" | "Black marble" | "Custom"
type LightingMood = "Soft Daylight" | "Glossy Specular" | "Backlit Sunset" | "High-Contrast Spot"
type MaterialFocus = "Glass" | "Metal" | "Liquid" | "Fabric" | "All"
type CameraType = "Macro Precision" | "Orbit Reveal" | "Tracking Pull-Back"
type FrameRate = "Slow Motion 120 fps" | "Cinematic 60 fps" | "Standard 30 fps"
type RevealType = "Assemble" | "Morph" | "Emerge" | "Disintegrate → Form"
type SoundMode = "SFX only" | "Music driven" | "Hybrid"
type SoundMood = "Ambient minimal" | "Percussive energy" | "Cinematic warm"
type LogoMoment = "Morph From Form" | "Fade-In" | "Hover" | "None"

export function ProductMotionGeneratorInterface({ 
  onClose, 
  projectTitle,
  selectedArtifact 
}: ProductMotionGeneratorInterfaceProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 1️⃣ Product Description & Intent Capture
  const [productName, setProductName] = useState("")
  const [coreMoment, setCoreMoment] = useState("")
  const [emotionalTone, setEmotionalTone] = useState<EmotionalTone>("Epic")
  const [visualStyle, setVisualStyle] = useState<VisualStyle>("Cinematic")
  const [duration, setDuration] = useState([10]) // 5-15 seconds
  
  // 2️⃣ Visual Context
  const [environment, setEnvironment] = useState<Environment>("Studio white")
  const [customEnvironment, setCustomEnvironment] = useState("")
  const [lightingMood, setLightingMood] = useState<LightingMood>("Soft Daylight")
  const [materialFocus, setMaterialFocus] = useState<MaterialFocus[]>(["All"])
  const [cameraType, setCameraType] = useState<CameraType>("Macro Precision")
  const [frameRate, setFrameRate] = useState<FrameRate>("Cinematic 60 fps")
  
  // 3️⃣ Motion & Energy
  const [revealType, setRevealType] = useState<RevealType>("Morph")
  const [cameraEnergy, setCameraEnergy] = useState([50]) // 0-100 slider
  const [loopMode, setLoopMode] = useState(false)
  const [hookIntensity, setHookIntensity] = useState([50]) // 0-100 slider
  const [endEmotion, setEndEmotion] = useState([50]) // 0-100 slider (Clean ↔ Awe)
  
  // 4️⃣ Audio DNA
  const [soundMode, setSoundMode] = useState<SoundMode>("SFX only")
  const [soundMood, setSoundMood] = useState<SoundMood>("Ambient minimal")
  const [keyEffects, setKeyEffects] = useState<string[]>([])
  const [mixCurve, setMixCurve] = useState([50]) // 0-100 slider (Calm→Energetic)
  
  // 5️⃣ Brand Touch (Optional)
  const [accentColorSync, setAccentColorSync] = useState(false)
  const [accentColor, setAccentColor] = useState("#3B82F6")
  const [logoMoment, setLogoMoment] = useState<LogoMoment>("None")
  const [textConstraint, setTextConstraint] = useState(false)
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  
  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    product: true,
    visual: false,
    motion: false,
    audio: false,
    brand: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleMaterialFocusChange = (material: MaterialFocus) => {
    setMaterialFocus(prev => {
      if (material === "All") {
        return ["All"]
      }
      if (prev.includes(material)) {
        const newMaterials = prev.filter(m => m !== material)
        return newMaterials.length === 0 ? ["All"] : newMaterials
      } else {
        const newMaterials = prev.filter(m => m !== "All")
        return [...newMaterials, material]
      }
    })
  }

  const handleKeyEffectToggle = (effect: string) => {
    setKeyEffects(prev => 
      prev.includes(effect) 
        ? prev.filter(e => e !== effect)
        : [...prev, effect]
    )
  }

  const availableKeyEffects = [
    "Steam hiss", "Impact thud", "Logo chime", "Whoosh", "Crystal chime", 
    "Mechanical click", "Liquid splash", "Fabric rustle", "Metal ping"
  ]

  const handleGenerate = async () => {
    if (!productName.trim() || !coreMoment.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in Product Name and Core Moment/Transformation.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    
    try {
      // Compile all DNA layers into Veo 3 JSON
      const motionDNA = {
        product: productName.trim(),
        coreMoment: coreMoment.trim(),
        style: `${emotionalTone.toLowerCase()} ${visualStyle.toLowerCase()} kinetic reveal`,
        camera: {
          type: cameraType.toLowerCase().replace(/\s+/g, '-'),
          movement: `${cameraType.toLowerCase()} → ${revealType.toLowerCase()} → hero reveal`,
          frame_rate: frameRate.split(' ')[2] || "60fps",
          energy: cameraEnergy[0] / 100
        },
        lighting: lightingMood.toLowerCase().replace(/\s+/g, '-'),
        environment: environment === "Custom" ? customEnvironment : environment.toLowerCase().replace(/\s+/g, '-'),
        materials: materialFocus.filter(m => m !== "All").map(m => m.toLowerCase()),
        motion: {
          reveal_type: revealType.toLowerCase().replace(/\s+/g, '-'),
          camera_energy: cameraEnergy[0] / 100,
          loop: loopMode,
          hook_intensity: hookIntensity[0] / 100,
          end_emotion: endEmotion[0] / 100
        },
        audio: {
          mode: soundMode.toLowerCase().replace(/\s+/g, '_'),
          mood: soundMood.toLowerCase().replace(/\s+/g, '_'),
          effects: keyEffects,
          mix_curve: mixCurve[0] / 100
        },
        branding: {
          accent_color_sync: accentColorSync,
          accent_color: accentColor,
          logo_moment: logoMoment.toLowerCase().replace(/\s+/g, '_'),
          text_constraint: textConstraint
        },
        duration: duration[0],
        tone: `${emotionalTone.toLowerCase()}, modern, kinetically poetic`,
        metadata: {
          projectTitle,
          selectedArtifact,
          timestamp: new Date().toISOString()
        }
      }

      console.log("Generating Product in Motion with DNA:", motionDNA)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock generated video URL
      setGeneratedVideo("/placeholder-video.mp4")
      
      toast({
        title: "Product in Motion generated successfully!",
        description: `"${productName}" motion video is ready for preview.`,
      })
      
    } catch (error) {
      console.error('Generation failed:', error)
      toast({
        title: "Generation failed",
        description: "Could not generate the motion video. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Product in Motion Studio
              </h2>
              <p className="text-sm text-muted-foreground">
                Transform "{projectTitle}" into a cinematic performance
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - DNA Fields */}
          <div className="w-1/3 border-r border-border overflow-y-auto">
            <div className="p-6 space-y-6">
              
              {/* 1️⃣ Product Description & Intent Capture */}
              <Collapsible 
                open={expandedSections.product} 
                onOpenChange={() => toggleSection('product')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-medium">Product & Intent</span>
                  </div>
                  {expandedSections.product ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Product Name *
                    </label>
                    <Input
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g., Adidas running shoe"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Core Moment / Transformation *
                    </label>
                    <Textarea
                      value={coreMoment}
                      onChange={(e) => setCoreMoment(e.target.value)}
                      placeholder="e.g., Foot strike morphs city pavement into forest floor"
                      rows={3}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Emotional Tone
                    </label>
                    <Select value={emotionalTone} onValueChange={(value: EmotionalTone) => setEmotionalTone(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Epic">Epic</SelectItem>
                        <SelectItem value="Elegant">Elegant</SelectItem>
                        <SelectItem value="Calm">Calm</SelectItem>
                        <SelectItem value="Poetic">Poetic</SelectItem>
                        <SelectItem value="Powerful">Powerful</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Visual Style
                    </label>
                    <Select value={visualStyle} onValueChange={(value: VisualStyle) => setVisualStyle(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Photoreal">Photoreal</SelectItem>
                        <SelectItem value="Cinematic">Cinematic</SelectItem>
                        <SelectItem value="Stylized CG">Stylized CG</SelectItem>
                        <SelectItem value="Watercolor Softness">Watercolor Softness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Duration: {duration[0]}s
                    </label>
                    <Slider
                      value={duration}
                      onValueChange={setDuration}
                      min={5}
                      max={15}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* 2️⃣ Visual Context */}
              <Collapsible 
                open={expandedSections.visual} 
                onOpenChange={() => toggleSection('visual')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-primary" />
                    <span className="font-medium">Visual Context</span>
                  </div>
                  {expandedSections.visual ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Environment
                    </label>
                    <Select value={environment} onValueChange={(value: Environment) => setEnvironment(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Studio white">Studio white</SelectItem>
                        <SelectItem value="Urban twilight">Urban twilight</SelectItem>
                        <SelectItem value="Forest dawn">Forest dawn</SelectItem>
                        <SelectItem value="Black marble">Black marble</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {environment === "Custom" && (
                      <Input
                        value={customEnvironment}
                        onChange={(e) => setCustomEnvironment(e.target.value)}
                        placeholder="Describe your custom environment"
                        className="w-full mt-2"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Lighting Mood
                    </label>
                    <Select value={lightingMood} onValueChange={(value: LightingMood) => setLightingMood(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Soft Daylight">Soft Daylight</SelectItem>
                        <SelectItem value="Glossy Specular">Glossy Specular</SelectItem>
                        <SelectItem value="Backlit Sunset">Backlit Sunset</SelectItem>
                        <SelectItem value="High-Contrast Spot">High-Contrast Spot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Material Focus
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(["Glass", "Metal", "Liquid", "Fabric", "All"] as MaterialFocus[]).map((material) => (
                        <Badge
                          key={material}
                          variant={materialFocus.includes(material) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleMaterialFocusChange(material)}
                        >
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Camera Type
                    </label>
                    <Select value={cameraType} onValueChange={(value: CameraType) => setCameraType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Macro Precision">Macro Precision</SelectItem>
                        <SelectItem value="Orbit Reveal">Orbit Reveal</SelectItem>
                        <SelectItem value="Tracking Pull-Back">Tracking Pull-Back</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Frame Rate
                    </label>
                    <Select value={frameRate} onValueChange={(value: FrameRate) => setFrameRate(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Slow Motion 120 fps">Slow Motion 120 fps</SelectItem>
                        <SelectItem value="Cinematic 60 fps">Cinematic 60 fps</SelectItem>
                        <SelectItem value="Standard 30 fps">Standard 30 fps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* 3️⃣ Motion & Energy */}
              <Collapsible 
                open={expandedSections.motion} 
                onOpenChange={() => toggleSection('motion')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium">Motion & Energy</span>
                  </div>
                  {expandedSections.motion ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Reveal Type
                    </label>
                    <Select value={revealType} onValueChange={(value: RevealType) => setRevealType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Assemble">Assemble</SelectItem>
                        <SelectItem value="Morph">Morph</SelectItem>
                        <SelectItem value="Emerge">Emerge</SelectItem>
                        <SelectItem value="Disintegrate → Form">Disintegrate → Form</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Camera Energy: {cameraEnergy[0]}%
                    </label>
                    <Slider
                      value={cameraEnergy}
                      onValueChange={setCameraEnergy}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Still</span>
                      <span>Dynamic</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Loop Mode
                    </label>
                    <Switch
                      checked={loopMode}
                      onCheckedChange={setLoopMode}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Hook Intensity: {hookIntensity[0]}%
                    </label>
                    <Slider
                      value={hookIntensity}
                      onValueChange={setHookIntensity}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Subtle</span>
                      <span>Bold</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      End Emotion: {endEmotion[0]}%
                    </label>
                    <Slider
                      value={endEmotion}
                      onValueChange={setEndEmotion}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Clean</span>
                      <span>Awe</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* 4️⃣ Audio DNA */}
              <Collapsible 
                open={expandedSections.audio} 
                onOpenChange={() => toggleSection('audio')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-primary" />
                    <span className="font-medium">Audio DNA</span>
                  </div>
                  {expandedSections.audio ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Sound Mode
                    </label>
                    <Select value={soundMode} onValueChange={(value: SoundMode) => setSoundMode(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SFX only">SFX only</SelectItem>
                        <SelectItem value="Music driven">Music driven</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Sound Mood
                    </label>
                    <Select value={soundMood} onValueChange={(value: SoundMood) => setSoundMood(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ambient minimal">Ambient minimal</SelectItem>
                        <SelectItem value="Percussive energy">Percussive energy</SelectItem>
                        <SelectItem value="Cinematic warm">Cinematic warm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Key Effects
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableKeyEffects.map((effect) => (
                        <Badge
                          key={effect}
                          variant={keyEffects.includes(effect) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleKeyEffectToggle(effect)}
                        >
                          {effect}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Mix Curve: {mixCurve[0]}%
                    </label>
                    <Slider
                      value={mixCurve}
                      onValueChange={setMixCurve}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Calm</span>
                      <span>Energetic</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* 5️⃣ Brand Touch */}
              <Collapsible 
                open={expandedSections.brand} 
                onOpenChange={() => toggleSection('brand')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    <span className="font-medium">Brand Touch</span>
                  </div>
                  {expandedSections.brand ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Accent Color Sync
                    </label>
                    <Switch
                      checked={accentColorSync}
                      onCheckedChange={setAccentColorSync}
                    />
                  </div>
                  
                  {accentColorSync && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Accent Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-8 h-8 rounded border border-border"
                        />
                        <Input
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Logo Moment
                    </label>
                    <Select value={logoMoment} onValueChange={(value: LogoMoment) => setLogoMoment(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Morph From Form">Morph From Form</SelectItem>
                        <SelectItem value="Fade-In">Fade-In</SelectItem>
                        <SelectItem value="Hover">Hover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Text Constraint
                    </label>
                    <Switch
                      checked={textConstraint}
                      onCheckedChange={setTextConstraint}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Center Panel - Preview */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground mb-2">Live Preview</h3>
              <p className="text-sm text-muted-foreground">
                DNA thumbnail showing light and angle preview
              </p>
            </div>
            
            <div className="flex-1 p-6 flex items-center justify-center bg-muted/20">
              {generatedVideo ? (
                <div className="w-full max-w-2xl">
                  <video
                    src={generatedVideo}
                    controls
                    className="w-full rounded-lg shadow-lg"
                    poster="/placeholder.jpg"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto bg-muted rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-foreground mb-2">
                      Ready to generate your motion video
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Configure your DNA settings and click Generate to create your cinematic product motion
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Smart Hints */}
          <div className="w-80 border-l border-border overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Smart Hints</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-accent/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Lighting Tip</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    🔥 Add vapor accent for cinematic depth?
                  </p>
                </div>
                
                <div className="p-3 bg-accent/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Camera Suggestion</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    🎞️ Try low-angle macro for premium feel?
                  </p>
                </div>
                
                <div className="p-3 bg-accent/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Audio Enhancement</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    🎶 Let's match rhythm to logo morph—enable pulse sync?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              disabled={!generatedVideo}
            >
              {previewMode ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {previewMode ? 'Pause' : 'Preview'}
            </Button>
            
            {generatedVideo && (
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !productName.trim() || !coreMoment.trim()}
              className="min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Motion
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
