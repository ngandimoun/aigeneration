"use client"

import { useState, useRef, useEffect } from "react"
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
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"
import { filterFilledFields } from "@/lib/utils/prompt-builder"
import { PreviousGenerations } from "@/components/ui/previous-generations"

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
type ProductCategory = "Product" | "Chart" | "Infographic" | "Logo Animation" | "UI/UX Element"
type EmotionalTone = "Epic" | "Elegant" | "Calm" | "Poetic" | "Powerful"
type VisualStyle = "Photoreal" | "Cinematic" | "Stylized CG" | "Watercolor Softness"
type Environment = "Studio white" | "Urban twilight" | "Forest dawn" | "Black marble" | "Custom"
type LightingMood = "Soft Daylight" | "Glossy Specular" | "Backlit Sunset" | "High-Contrast Spot"
type MaterialFocus = "Glass" | "Metal" | "Liquid" | "Fabric" | "All"
type CameraType = "Macro Precision" | "Orbit Reveal" | "Tracking Pull-Back"
type FrameRate = "Slow Motion 120 fps" | "Cinematic 60 fps" | "Standard 30 fps"
type RevealType = "Assemble" | "Morph" | "Emerge" | "Disintegrate → Form" | "Morph From Form" | "Slide"
type SoundMode = "SFX only" | "Music driven" | "Hybrid"
type SoundMood = "Ambient minimal" | "Percussive energy" | "Cinematic warm"
type LogoMoment = "Morph From Form" | "Fade-In" | "Hover" | "None"

export function ProductMotionGeneratorInterface({ 
  onClose, 
  projectTitle,
  selectedArtifact 
}: ProductMotionGeneratorInterfaceProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 1️⃣ Product Description & Intent Capture
  const [productCategory, setProductCategory] = useState<ProductCategory>("Product")
  const [productName, setProductName] = useState("")
  const [prompt, setPrompt] = useState("")
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

  // Smart defaults based on category selection
  useEffect(() => {
    switch (productCategory) {
      case "Chart":
        // Chart defaults: Epic, Cinematic, 10s, Studio white, High-Contrast Spot, Glass/Metal/Liquid, Macro Precision, Cinematic 60 fps, Morph, 50% energy, SFX only, Ambient minimal
        setEmotionalTone("Epic")
        setVisualStyle("Cinematic")
        setDuration([10])
        setEnvironment("Studio white")
        setLightingMood("High-Contrast Spot")
        setMaterialFocus(["Glass", "Metal", "Liquid"])
        setCameraType("Macro Precision")
        setFrameRate("Cinematic 60 fps")
        setRevealType("Morph")
        setCameraEnergy([50])
        setHookIntensity([50])
        setEndEmotion([50])
        setSoundMode("SFX only")
        setSoundMood("Ambient minimal")
        setMixCurve([50])
        break
      case "Infographic":
        // Infographic defaults: Elegant, Stylized CG, 8s, Studio white, Soft Daylight, All materials, Orbit Reveal, Cinematic 60 fps, Assemble, 40% energy, Hybrid, Cinematic warm
        setEmotionalTone("Elegant")
        setVisualStyle("Stylized CG")
        setDuration([8])
        setEnvironment("Studio white")
        setLightingMood("Soft Daylight")
        setMaterialFocus(["All"])
        setCameraType("Orbit Reveal")
        setFrameRate("Cinematic 60 fps")
        setRevealType("Assemble")
        setCameraEnergy([40])
        setHookIntensity([40])
        setEndEmotion([60])
        setSoundMode("Hybrid")
        setSoundMood("Cinematic warm")
        setMixCurve([60])
        break
      case "Logo Animation":
        // Logo Animation defaults: Powerful, Cinematic, 6s, Studio white, Glossy Specular, Glass/Metal, Orbit Reveal, Cinematic 60 fps, Morph From Form, 60% energy, SFX only, Ambient minimal
        setEmotionalTone("Powerful")
        setVisualStyle("Cinematic")
        setDuration([6])
        setEnvironment("Studio white")
        setLightingMood("Glossy Specular")
        setMaterialFocus(["Glass", "Metal"])
        setCameraType("Orbit Reveal")
        setFrameRate("Cinematic 60 fps")
        setRevealType("Morph From Form")
        setCameraEnergy([60])
        setHookIntensity([70])
        setEndEmotion([80])
        setSoundMode("SFX only")
        setSoundMood("Ambient minimal")
        setMixCurve([40])
        setLogoMoment("Morph From Form")
        break
      case "UI/UX Element":
        // UI/UX defaults: Calm, Photoreal, 5s, Studio white, Soft Daylight, Glass/Fabric, Macro Precision, Standard 30 fps, Slide, 30% energy, SFX only, Ambient minimal
        setEmotionalTone("Calm")
        setVisualStyle("Photoreal")
        setDuration([5])
        setEnvironment("Studio white")
        setLightingMood("Soft Daylight")
        setMaterialFocus(["Glass", "Fabric"])
        setCameraType("Macro Precision")
        setFrameRate("Standard 30 fps")
        setRevealType("Slide")
        setCameraEnergy([30])
        setHookIntensity([30])
        setEndEmotion([40])
        setSoundMode("SFX only")
        setSoundMood("Ambient minimal")
        setMixCurve([30])
        break
      default: // Product
        // Product defaults: Epic, Cinematic, 10s, Studio white, Soft Daylight, All materials, Macro Precision, Cinematic 60 fps, Morph, 50% energy, SFX only, Ambient minimal
        setEmotionalTone("Epic")
        setVisualStyle("Cinematic")
        setDuration([10])
        setEnvironment("Studio white")
        setLightingMood("Soft Daylight")
        setMaterialFocus(["All"])
        setCameraType("Macro Precision")
        setFrameRate("Cinematic 60 fps")
        setRevealType("Morph")
        setCameraEnergy([50])
        setHookIntensity([50])
        setEndEmotion([50])
        setSoundMode("SFX only")
        setSoundMood("Ambient minimal")
        setMixCurve([50])
        break
    }
  }, [productCategory])

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

  // Helper function to get dynamic placeholders based on category
  const getCoreMomentPlaceholder = (category: ProductCategory): string => {
    switch (category) {
      case "Product":
        return "e.g., Foot strike morphs city pavement into forest floor"
      case "Chart":
        return "e.g., Stock prices rise as bars grow taller with data flowing"
      case "Infographic":
        return "e.g., Statistics animate into visual elements with smooth transitions"
      case "Logo Animation":
        return "e.g., Logo emerges from particles and settles into final form"
      case "UI/UX Element":
        return "e.g., Interface elements slide and morph into new layouts"
      default:
        return "Describe the key transformation or moment"
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing required field",
        description: "Please fill in the Prompt field.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    
    try {
      // Collect all creative fields
      const allFields = {
        // Product Description & Intent Capture
        product_category: productCategory,
        product_name: productName.trim() || null,
        core_moment: coreMoment.trim() || null,
        emotional_tone: emotionalTone,
        visual_style: visualStyle,
        duration: duration[0],
        
        // Visual Context
        environment: environment,
        custom_environment: environment === "Custom" ? customEnvironment.trim() || null : null,
        lighting_mood: lightingMood,
        material_focus: materialFocus,
        camera_type: cameraType,
        frame_rate: frameRate,
        
        // Motion & Energy
        reveal_type: revealType,
        camera_energy: cameraEnergy[0],
        loop_mode: loopMode,
        hook_intensity: hookIntensity[0],
        end_emotion: endEmotion[0],
        
        // Audio DNA
        sound_mode: soundMode,
        sound_mood: soundMood,
        key_effects: keyEffects,
        mix_curve: mixCurve[0],
        
        // Brand Touch
        accent_color_sync: accentColorSync,
        accent_color: accentColorSync ? accentColor : null,
        logo_moment: logoMoment,
        text_constraint: textConstraint,
        
        // Metadata
        projectTitle,
        selectedArtifact
      }

      // Filter to only filled fields
      const filledFields = filterFilledFields(allFields)

      // Prepare data for API
      const motionData = {
        // Product Description & Intent Capture
        product_category: productCategory,
        product_name: productName.trim() || null,
        prompt: prompt.trim(),
        core_moment: coreMoment.trim() || null,
        emotional_tone: emotionalTone,
        visual_style: visualStyle,
        duration: duration[0],
        
        // Visual Context
        environment: environment,
        custom_environment: environment === "Custom" ? customEnvironment.trim() || null : null,
        lighting_mood: lightingMood,
        material_focus: materialFocus,
        camera_type: cameraType,
        frame_rate: frameRate,
        
        // Motion & Energy
        reveal_type: revealType,
        camera_energy: cameraEnergy[0],
        loop_mode: loopMode,
        hook_intensity: hookIntensity[0],
        end_emotion: endEmotion[0],
        
        // Audio DNA
        sound_mode: soundMode,
        sound_mood: soundMood,
        key_effects: keyEffects,
        mix_curve: mixCurve[0],
        
        // Brand Touch
        accent_color_sync: accentColorSync,
        accent_color: accentColorSync ? accentColor : null,
        logo_moment: logoMoment,
        text_constraint: textConstraint,
        
        // Metadata
        projectTitle,
        selectedArtifact
      }

      console.log("Generating Product in Motion with data:", motionData)

      // Call API to save motion data
      const response = await fetch('/api/product-motion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(motionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate motion')
      }

      const result = await response.json()
      console.log('Motion generated successfully:', result)
      
      // Mock generated video URL for preview
      setGeneratedVideo("/placeholder-video.mp4")
      
      toast({
        title: `${productCategory} in Motion generated successfully!`,
        description: `"${productName || productCategory}" motion video is ready for preview.`,
      })
      
    } catch (error) {
      console.error('Generation failed:', error)
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Could not generate the motion video. Please try again.",
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
              <h2 className="text-xl font-semibold text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {productCategory} in Motion Studio
              </h2>
              <p className="text-sm text-muted-foreground">
                Transform "{projectTitle}" into a cinematic {productCategory.toLowerCase()} performance
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
          <div className="flex-1 border-r border-border overflow-y-auto">
            <div className="p-6 space-y-6">
              
              {/* 1️⃣ Product Description & Intent Capture */}
              <Collapsible 
                open={expandedSections.product} 
                onOpenChange={() => toggleSection('product')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-amber-600 dark:text-amber-400">✨ Product & Intent</span>
                  </div>
                  {expandedSections.product ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
                      🏷️ Product Name
                    </label>
                    <Input
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g., Adidas running shoe"
                      className="w-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800 focus:bg-gradient-to-r focus:from-amber-100 focus:to-orange-100 dark:focus:from-amber-900/30 dark:focus:to-orange-900/30 focus:border-amber-300 dark:focus:border-amber-700 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                      ✏️ Prompt *
                    </label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the motion and transformation you want to see..."
                      rows={3}
                      className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 focus:bg-gradient-to-r focus:from-blue-100 focus:to-indigo-100 dark:focus:from-blue-900/30 dark:focus:to-indigo-900/30 focus:border-blue-300 dark:focus:border-blue-700 transition-all duration-200 resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      * Only the Prompt field is required. All other fields are optional.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                      📂 Content Category
                    </label>
                    <Select value={productCategory} onValueChange={(value: ProductCategory) => setProductCategory(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Product">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Product
                          </div>
                        </SelectItem>
                        <SelectItem value="Chart">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Chart (CNBC/Bloomberg style)
                          </div>
                        </SelectItem>
                        <SelectItem value="Infographic">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            Infographic
                          </div>
                        </SelectItem>
                        <SelectItem value="Logo Animation">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                            Logo Animation
                          </div>
                        </SelectItem>
                        <SelectItem value="UI/UX Element">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                            UI/UX Element
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                      ⚡ Core Moment / Transformation
                    </label>
                    <Textarea
                      value={coreMoment}
                      onChange={(e) => setCoreMoment(e.target.value)}
                      placeholder={getCoreMomentPlaceholder(productCategory)}
                      rows={3}
                      className="w-full resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-pink-600 dark:text-pink-400 mb-2">
                      💫 Emotional Tone
                    </label>
                    <Select value={emotionalTone} onValueChange={(value: EmotionalTone) => setEmotionalTone(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Epic">⚡ Epic</SelectItem>
                        <SelectItem value="Elegant">✨ Elegant</SelectItem>
                        <SelectItem value="Calm">🌊 Calm</SelectItem>
                        <SelectItem value="Poetic">🌸 Poetic</SelectItem>
                        <SelectItem value="Powerful">💪 Powerful</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                      🎨 Visual Style
                    </label>
                    <Select value={visualStyle} onValueChange={(value: VisualStyle) => setVisualStyle(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Photoreal">📸 Photoreal</SelectItem>
                        <SelectItem value="Cinematic">🎬 Cinematic</SelectItem>
                        <SelectItem value="Stylized CG">🎨 Stylized CG</SelectItem>
                        <SelectItem value="Watercolor Softness">🎨 Watercolor Softness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-teal-600 dark:text-teal-400 mb-2">
                      ⏱️ Duration: {duration[0]}s
                    </label>
                    <Slider
                      value={duration}
                      onValueChange={setDuration}
                      min={5}
                      max={15}
                      step={1}
                      className="w-full [&_.slider-track]:bg-gradient-to-r [&_.slider-track]:from-teal-200 [&_.slider-track]:to-teal-400 [&_.slider-thumb]:bg-teal-500 [&_.slider-thumb]:border-teal-600"
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
                    <Camera className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-blue-600 dark:text-blue-400">📸 Visual Context</span>
                  </div>
                  {expandedSections.visual ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-2">
                      🌍 Environment
                    </label>
                    <Select value={environment} onValueChange={(value: Environment) => setEnvironment(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Studio white">🏢 Studio white</SelectItem>
                        <SelectItem value="Urban twilight">🌆 Urban twilight</SelectItem>
                        <SelectItem value="Forest dawn">🌲 Forest dawn</SelectItem>
                        <SelectItem value="Black marble">🖤 Black marble</SelectItem>
                        <SelectItem value="Custom">⚙️ Custom</SelectItem>
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
                    <label className="block text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                      💡 Lighting Mood
                    </label>
                    <Select value={lightingMood} onValueChange={(value: LightingMood) => setLightingMood(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Soft Daylight">☀️ Soft Daylight</SelectItem>
                        <SelectItem value="Glossy Specular">✨ Glossy Specular</SelectItem>
                        <SelectItem value="Backlit Sunset">🌅 Backlit Sunset</SelectItem>
                        <SelectItem value="High-Contrast Spot">💡 High-Contrast Spot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-2">
                      🎯 Material Focus
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
                    <label className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                      📹 Camera Type
                    </label>
                    <Select value={cameraType} onValueChange={(value: CameraType) => setCameraType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Macro Precision">🔍 Macro Precision</SelectItem>
                        <SelectItem value="Orbit Reveal">🔄 Orbit Reveal</SelectItem>
                        <SelectItem value="Tracking Pull-Back">📹 Tracking Pull-Back</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                      🎬 Frame Rate
                    </label>
                    <Select value={frameRate} onValueChange={(value: FrameRate) => setFrameRate(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Slow Motion 120 fps">🐌 Slow Motion 120 fps</SelectItem>
                        <SelectItem value="Cinematic 60 fps">🎬 Cinematic 60 fps</SelectItem>
                        <SelectItem value="Standard 30 fps">📺 Standard 30 fps</SelectItem>
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
                    <Zap className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-red-600 dark:text-red-400">⚡ Motion & Energy</span>
                  </div>
                  {expandedSections.motion ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                      ⚡ Reveal Type
                    </label>
                    <Select value={revealType} onValueChange={(value: RevealType) => setRevealType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Assemble">🧩 Assemble</SelectItem>
                        <SelectItem value="Morph">🔄 Morph</SelectItem>
                        <SelectItem value="Emerge">🌟 Emerge</SelectItem>
                        <SelectItem value="Disintegrate → Form">💫 Disintegrate → Form</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">
                      🔥 Camera Energy: {cameraEnergy[0]}%
                    </label>
                    <Slider
                      value={cameraEnergy}
                      onValueChange={setCameraEnergy}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full [&_.slider-track]:bg-gradient-to-r [&_.slider-track]:from-orange-200 [&_.slider-track]:to-orange-400 [&_.slider-thumb]:bg-orange-500 [&_.slider-thumb]:border-orange-600"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Still</span>
                      <span>Dynamic</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      🔄 Loop Mode
                    </label>
                    <Switch
                      checked={loopMode}
                      onCheckedChange={setLoopMode}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-pink-600 dark:text-pink-400 mb-2">
                      🎯 Hook Intensity: {hookIntensity[0]}%
                    </label>
                    <Slider
                      value={hookIntensity}
                      onValueChange={setHookIntensity}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full [&_.slider-track]:bg-gradient-to-r [&_.slider-track]:from-pink-200 [&_.slider-track]:to-pink-400 [&_.slider-thumb]:bg-pink-500 [&_.slider-thumb]:border-pink-600"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Subtle</span>
                      <span>Bold</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                      💫 End Emotion: {endEmotion[0]}%
                    </label>
                    <Slider
                      value={endEmotion}
                      onValueChange={setEndEmotion}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full [&_.slider-track]:bg-gradient-to-r [&_.slider-track]:from-purple-200 [&_.slider-track]:to-purple-400 [&_.slider-thumb]:bg-purple-500 [&_.slider-thumb]:border-purple-600"
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
                    <Music className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">🎵 Audio DNA</span>
                  </div>
                  {expandedSections.audio ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                      🎵 Sound Mode
                    </label>
                    <Select value={soundMode} onValueChange={(value: SoundMode) => setSoundMode(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SFX only">🔊 SFX only</SelectItem>
                        <SelectItem value="Music driven">🎵 Music driven</SelectItem>
                        <SelectItem value="Hybrid">🎶 Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-teal-600 dark:text-teal-400 mb-2">
                      🎶 Sound Mood
                    </label>
                    <Select value={soundMood} onValueChange={(value: SoundMood) => setSoundMood(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ambient minimal">🌊 Ambient minimal</SelectItem>
                        <SelectItem value="Percussive energy">🥁 Percussive energy</SelectItem>
                        <SelectItem value="Cinematic warm">🎬 Cinematic warm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">
                      🎵 Key Effects
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
                    <label className="block text-sm font-medium text-violet-600 dark:text-violet-400 mb-2">
                      📊 Mix Curve: {mixCurve[0]}%
                    </label>
                    <Slider
                      value={mixCurve}
                      onValueChange={setMixCurve}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full [&_.slider-track]:bg-gradient-to-r [&_.slider-track]:from-violet-200 [&_.slider-track]:to-violet-400 [&_.slider-thumb]:bg-violet-500 [&_.slider-thumb]:border-violet-600"
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
                    <Palette className="h-4 w-4 text-rose-500" />
                    <span className="font-medium text-rose-600 dark:text-rose-400">🎨 Brand Touch</span>
                  </div>
                  {expandedSections.brand ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-rose-600 dark:text-rose-400">
                      🎨 Accent Color Sync
                    </label>
                    <Switch
                      checked={accentColorSync}
                      onCheckedChange={setAccentColorSync}
                    />
                  </div>
                  
                  {accentColorSync && (
                    <div>
                      <label className="block text-sm font-medium text-rose-600 dark:text-rose-400 mb-2">
                        🎨 Accent Color
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
                    <label className="block text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">
                      🏷️ Logo Moment
                    </label>
                    <Select value={logoMoment} onValueChange={(value: LogoMoment) => setLogoMoment(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">❌ None</SelectItem>
                        <SelectItem value="Morph From Form">🔄 Morph From Form</SelectItem>
                        <SelectItem value="Fade-In">✨ Fade-In</SelectItem>
                        <SelectItem value="Hover">👆 Hover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      📝 Text Constraint
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


          {/* Right Panel - Smart Hints */}
          <div className="w-80 border-l border-border overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-4">💡 Smart Hints</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-accent/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Lighting Tip</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    🔥 Add vapor accent for cinematic depth?
                  </p>
                </div>
                
                <div className="p-3 bg-accent/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Camera Suggestion</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    🎞️ Try low-angle macro for premium feel?
                  </p>
                </div>
                
                <div className="p-3 bg-accent/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Audio Enhancement</span>
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
              disabled={isGenerating || !prompt.trim()}
              className="min-w-[140px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0"
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

      {/* Previous Generations */}
      <PreviousGenerations contentType="product_motions" userId={user?.id || ''} className="mt-8" />
    </div>
  )
}

