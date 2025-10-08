"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  Sparkles, 
  ChevronDown,
  ChevronRight,
  Upload,
  Palette,
  Camera,
  Volume2,
  Settings,
  Eye,
  Wand2,
  Lightbulb,
  Target,
  MessageCircle,
  Mic,
  Music,
  Zap,
  ArrowUp,
  Plus,
  Minus,
  Loader2,
  Download,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface UGCAdsGeneratorInterfaceProps {
  onClose: () => void
  projectTitle: string
}

// Smart DNA Types
interface BrandDNA {
  name: string
  tone: string
  colorCode: string
  logo?: string
}

interface ProductEssence {
  name: string
  heroBenefit: string
  visualFocus: string
  environment: string
  materials: string[]
  transformationType: string
}

interface StoryDNA {
  coreAngle: string
  persona: string
  emotionTone: number
  patternInterruptType: string
  hookFramework: string
}

interface DialogueDNA {
  voiceType: string
  script: string
  toneOfVoice: string
  language: string
  voiceAssetSource: string
}

interface CameraDNA {
  rhythm: string
  movementStyle: string
  cutFrequency: string
  endingType: string
}

interface AudioDNA {
  soundMode: string
  soundEmotion: string
  keySounds: string[]
}

interface UGCVideoConfig {
  brandDNA: BrandDNA
  productEssence: ProductEssence
  storyDNA: StoryDNA
  dialogueDNA: DialogueDNA
  cameraDNA: CameraDNA
  audioDNA: AudioDNA
}

export function UGCAdsGeneratorInterface({ onClose, projectTitle }: UGCAdsGeneratorInterfaceProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Main state
  const [config, setConfig] = useState<UGCVideoConfig>({
    brandDNA: {
      name: "",
      tone: "",
      colorCode: "",
      logo: ""
    },
    productEssence: {
      name: "",
      heroBenefit: "",
      visualFocus: "",
      environment: "",
      materials: [],
      transformationType: ""
    },
    storyDNA: {
      coreAngle: "",
      persona: "silent visual story",
      emotionTone: 50,
      patternInterruptType: "",
      hookFramework: ""
    },
    dialogueDNA: {
      voiceType: "",
      script: "",
      toneOfVoice: "",
      language: "en",
      voiceAssetSource: ""
    },
    cameraDNA: {
      rhythm: "smooth tracking",
      movementStyle: "push-in",
      cutFrequency: "medium",
      endingType: "hero product close-up"
    },
    audioDNA: {
      soundMode: "",
      soundEmotion: "",
      keySounds: []
    }
  })

  // UI State
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentMaterial, setCurrentMaterial] = useState("")
  const [currentKeySound, setCurrentKeySound] = useState("")
  const [generatedJSON, setGeneratedJSON] = useState<string>("")
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    brandContext: true,
    productEssence: true,
    creativeAngle: false,
    dialogue: false,
    sound: false,
    camera: false
  })

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setShowScrollButton(scrollTop > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Smart auto-fill logic
  useEffect(() => {
    // Auto-detect 2D→3D pattern
    if (config.storyDNA.coreAngle.toLowerCase().includes("drawing to real") || 
        config.storyDNA.coreAngle.toLowerCase().includes("2d to 3d")) {
      setConfig(prev => ({
        ...prev,
        productEssence: {
          ...prev.productEssence,
          transformationType: "2D→3D"
        },
        storyDNA: {
          ...prev.storyDNA,
          hookFramework: "Transformation"
        }
      }))
    }

    // Auto-set luxury brand styling
    if (config.brandDNA.tone === "Luxury") {
      setConfig(prev => ({
        ...prev,
        productEssence: {
          ...prev.productEssence,
          environment: "Studio White"
        },
        cameraDNA: {
          ...prev.cameraDNA,
          rhythm: "smooth tracking",
          movementStyle: "dolly"
        }
      }))
    }
  }, [config.brandDNA.tone, config.storyDNA.coreAngle])

  // Smart field handlers
  const updateConfig = (section: keyof UGCVideoConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const addMaterial = () => {
    if (currentMaterial.trim()) {
      setConfig(prev => ({
        ...prev,
        productEssence: {
          ...prev.productEssence,
          materials: [...prev.productEssence.materials, currentMaterial.trim()]
        }
      }))
      setCurrentMaterial("")
    }
  }

  const removeMaterial = (index: number) => {
    setConfig(prev => ({
      ...prev,
      productEssence: {
        ...prev.productEssence,
        materials: prev.productEssence.materials.filter((_, i) => i !== index)
      }
    }))
  }

  const addKeySound = () => {
    if (currentKeySound.trim()) {
      setConfig(prev => ({
        ...prev,
        audioDNA: {
          ...prev.audioDNA,
          keySounds: [...prev.audioDNA.keySounds, currentKeySound.trim()]
        }
      }))
      setCurrentKeySound("")
    }
  }

  const removeKeySound = (index: number) => {
    setConfig(prev => ({
      ...prev,
      audioDNA: {
        ...prev.audioDNA,
        keySounds: prev.audioDNA.keySounds.filter((_, i) => i !== index)
      }
    }))
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Generate JSON output
  const generateJSON = () => {
    const output = {
      description: `${config.brandDNA.name} ${config.productEssence.name}: ${config.storyDNA.coreAngle}`,
      style: "cinematic, minimal, pattern-interrupt",
      camera: {
        type: config.productEssence.visualFocus.toLowerCase().replace(" ", "_"),
        movement: config.cameraDNA.movementStyle,
        rhythm: config.cameraDNA.rhythm
      },
      lighting: config.brandDNA.tone === "Luxury" ? "glossy controlled" : "natural",
      environment: {
        location: config.productEssence.environment.toLowerCase().replace(" ", "_"),
        props: config.productEssence.environment === "Home Kitchen" ? ["countertop", "steam reflection"] : []
      },
      elements: [
        config.productEssence.name,
        ...config.productEssence.materials
      ],
      motion: {
        type: config.productEssence.transformationType,
        pattern: config.storyDNA.patternInterruptType
      },
      audio: {
        mode: config.audioDNA.soundMode,
        emotion: config.audioDNA.soundEmotion,
        sfx: config.audioDNA.keySounds
      },
      dialogue: config.storyDNA.persona !== "silent visual story" ? {
        type: config.dialogueDNA.voiceType,
        script: config.dialogueDNA.script,
        tone: config.dialogueDNA.toneOfVoice
      } : null,
      ending: config.cameraDNA.endingType,
      text: "none",
      keywords: [
        config.brandDNA.name,
        config.productEssence.name,
        config.storyDNA.hookFramework,
        ...config.productEssence.materials
      ]
    }
    
    setGeneratedJSON(JSON.stringify(output, null, 2))
  }

  const handleGenerate = async () => {
    if (!config.brandDNA.name || !config.productEssence.name || !config.storyDNA.coreAngle) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in Brand Name, Product Name, and Core Angle.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    generateJSON()
    
    // Simulate generation process
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Simulate generated video
    setGeneratedVideo("https://example.com/generated-video.mp4")
    setIsGenerating(false)
    
    toast({
      title: "UGC Ad Generated!",
      description: "Your UGC ad has been successfully generated.",
    })
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const isDialogueVisible = config.storyDNA.persona !== "silent visual story"

  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            UGC Ads Generator
          </h3>
          <p className="text-xs text-muted-foreground">
            {projectTitle}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* 1️⃣ Brand Context */}
      <Collapsible 
        open={expandedSections.brandContext} 
        onOpenChange={() => toggleSection('brandContext')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="text-sm font-medium">Brand Context</span>
            </div>
            {expandedSections.brandContext ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Brand Name</label>
            <Input
              value={config.brandDNA.name}
              onChange={(e) => updateConfig('brandDNA', 'name', e.target.value)}
              placeholder="SMEG, LEGO, DreamCut Beauty"
              className="text-xs h-8"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Tone of Brand</label>
            <Select value={config.brandDNA.tone} onValueChange={(value) => updateConfig('brandDNA', 'tone', value)}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Select brand tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Modern" className="text-xs">Modern</SelectItem>
                <SelectItem value="Playful" className="text-xs">Playful</SelectItem>
                <SelectItem value="Luxury" className="text-xs">Luxury</SelectItem>
                <SelectItem value="Techy" className="text-xs">Techy</SelectItem>
                <SelectItem value="Wholesome" className="text-xs">Wholesome</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Logo / Color Palette</label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                <Upload className="h-3 w-3 mr-1" />
                Upload Logo
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                <Palette className="h-3 w-3 mr-1" />
                Auto-fetch Colors
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* 2️⃣ Product Essence */}
      <Collapsible 
        open={expandedSections.productEssence} 
        onOpenChange={() => toggleSection('productEssence')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">Product Essence</span>
            </div>
            {expandedSections.productEssence ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Product Name</label>
            <Input
              value={config.productEssence.name}
              onChange={(e) => updateConfig('productEssence', 'name', e.target.value)}
              placeholder="Transparent SMEG kettle"
              className="text-xs h-8"
            />
          </div>
          
           <div className="space-y-2">
             <label className="text-xs font-medium text-foreground">Hero Benefit / Moment</label>
             <div className="space-y-2">
               <Select onValueChange={(value) => updateConfig('productEssence', 'heroBenefit', value)}>
                 <SelectTrigger className="w-full h-8 text-xs">
                   <SelectValue placeholder="Choose a common benefit or write custom" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Transforms from clear to red when heated" className="text-xs">Transforms from clear to red when heated</SelectItem>
                   <SelectItem value="Changes color based on temperature" className="text-xs">Changes color based on temperature</SelectItem>
                   <SelectItem value="Self-cleaning technology" className="text-xs">Self-cleaning technology</SelectItem>
                   <SelectItem value="One-touch operation" className="text-xs">One-touch operation</SelectItem>
                   <SelectItem value="Instant results in seconds" className="text-xs">Instant results in seconds</SelectItem>
                   <SelectItem value="Waterproof and durable" className="text-xs">Waterproof and durable</SelectItem>
                   <SelectItem value="Wireless charging capability" className="text-xs">Wireless charging capability</SelectItem>
                   <SelectItem value="Voice-activated control" className="text-xs">Voice-activated control</SelectItem>
                   <SelectItem value="Automatic shut-off safety" className="text-xs">Automatic shut-off safety</SelectItem>
                   <SelectItem value="Multi-function versatility" className="text-xs">Multi-function versatility</SelectItem>
                 </SelectContent>
               </Select>
               <Textarea
                 value={config.productEssence.heroBenefit}
                 onChange={(e) => updateConfig('productEssence', 'heroBenefit', e.target.value)}
                 placeholder="Or write your custom hero benefit..."
                 className="min-h-[60px] text-xs resize-none"
               />
             </div>
           </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Visual Focus</label>
              <Select value={config.productEssence.visualFocus} onValueChange={(value) => updateConfig('productEssence', 'visualFocus', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select focus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Macro Detail" className="text-xs">Macro Detail</SelectItem>
                  <SelectItem value="Lifestyle in Context" className="text-xs">Lifestyle in Context</SelectItem>
                  <SelectItem value="Full Product Reveal" className="text-xs">Full Product Reveal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Environment</label>
              <Select value={config.productEssence.environment} onValueChange={(value) => updateConfig('productEssence', 'environment', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Studio White" className="text-xs">Studio White</SelectItem>
                  <SelectItem value="Home Kitchen" className="text-xs">Home Kitchen</SelectItem>
                  <SelectItem value="Outdoor" className="text-xs">Outdoor</SelectItem>
                  <SelectItem value="Fantasy Sky" className="text-xs">Fantasy Sky</SelectItem>
                  <SelectItem value="Paper Page" className="text-xs">Paper Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
           <div className="space-y-2">
             <label className="text-xs font-medium text-foreground">Material / Texture Emphasis</label>
             <div className="space-y-2">
               <Select onValueChange={(value) => {
                 setCurrentMaterial(value)
                 addMaterial()
               }}>
                 <SelectTrigger className="w-full h-8 text-xs">
                   <SelectValue placeholder="Choose common materials or add custom" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Glass" className="text-xs">Glass</SelectItem>
                   <SelectItem value="Metal" className="text-xs">Metal</SelectItem>
                   <SelectItem value="Liquid" className="text-xs">Liquid</SelectItem>
                   <SelectItem value="Smoke" className="text-xs">Smoke</SelectItem>
                   <SelectItem value="Wood" className="text-xs">Wood</SelectItem>
                   <SelectItem value="Plastic" className="text-xs">Plastic</SelectItem>
                   <SelectItem value="Fabric" className="text-xs">Fabric</SelectItem>
                   <SelectItem value="Ceramic" className="text-xs">Ceramic</SelectItem>
                   <SelectItem value="Leather" className="text-xs">Leather</SelectItem>
                   <SelectItem value="Crystal" className="text-xs">Crystal</SelectItem>
                   <SelectItem value="Steam" className="text-xs">Steam</SelectItem>
                   <SelectItem value="Foam" className="text-xs">Foam</SelectItem>
                 </SelectContent>
               </Select>
               <div className="flex gap-2 mb-2">
                 <Input
                   value={currentMaterial}
                   onChange={(e) => setCurrentMaterial(e.target.value)}
                   placeholder="Or type custom material..."
                   className="text-xs h-8"
                   onKeyPress={(e) => e.key === 'Enter' && addMaterial()}
                 />
                 <Button onClick={addMaterial} size="sm" className="h-8 w-8">
                   <Plus className="h-3 w-3" />
                 </Button>
               </div>
             </div>
             <div className="flex flex-wrap gap-2">
               {config.productEssence.materials.map((material, index) => (
                 <Badge key={index} variant="secondary" className="cursor-pointer text-xs" onClick={() => removeMaterial(index)}>
                   {material} ×
                 </Badge>
               ))}
             </div>
           </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Transformation Type</label>
            <Select value={config.productEssence.transformationType} onValueChange={(value) => updateConfig('productEssence', 'transformationType', value)}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Select transformation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Reveal" className="text-xs">Reveal</SelectItem>
                <SelectItem value="Color Morph" className="text-xs">Color Morph</SelectItem>
                <SelectItem value="Assemble" className="text-xs">Assemble</SelectItem>
                <SelectItem value="Grow" className="text-xs">Grow</SelectItem>
                <SelectItem value="Materialize" className="text-xs">Materialize</SelectItem>
                <SelectItem value="2D→3D" className="text-xs">2D→3D</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* 3️⃣ Creative Angle */}
      <Collapsible 
        open={expandedSections.creativeAngle} 
        onOpenChange={() => toggleSection('creativeAngle')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Creative Angle</span>
            </div>
            {expandedSections.creativeAngle ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
           <div className="space-y-2">
             <label className="text-xs font-medium text-foreground">Core Angle</label>
             <div className="space-y-2">
               <Select onValueChange={(value) => updateConfig('storyDNA', 'coreAngle', value)}>
                 <SelectTrigger className="w-full h-8 text-xs">
                   <SelectValue placeholder="Choose a common angle or write custom" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="From transparency to color" className="text-xs">From transparency to color</SelectItem>
                   <SelectItem value="From drawing to real life" className="text-xs">From drawing to real life</SelectItem>
                   <SelectItem value="From chaos to order" className="text-xs">From chaos to order</SelectItem>
                   <SelectItem value="From broken to fixed" className="text-xs">From broken to fixed</SelectItem>
                   <SelectItem value="From empty to full" className="text-xs">From empty to full</SelectItem>
                   <SelectItem value="From cold to hot" className="text-xs">From cold to hot</SelectItem>
                   <SelectItem value="From dark to light" className="text-xs">From dark to light</SelectItem>
                   <SelectItem value="From old to new" className="text-xs">From old to new</SelectItem>
                   <SelectItem value="From simple to complex" className="text-xs">From simple to complex</SelectItem>
                   <SelectItem value="From invisible to visible" className="text-xs">From invisible to visible</SelectItem>
                   <SelectItem value="From flat to 3D" className="text-xs">From flat to 3D</SelectItem>
                   <SelectItem value="From static to dynamic" className="text-xs">From static to dynamic</SelectItem>
                 </SelectContent>
               </Select>
               <Textarea
                 value={config.storyDNA.coreAngle}
                 onChange={(e) => updateConfig('storyDNA', 'coreAngle', e.target.value)}
                 placeholder="Or write your custom core angle..."
                 className="min-h-[60px] text-xs resize-none"
               />
             </div>
           </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Persona</label>
              <Select value={config.storyDNA.persona} onValueChange={(value) => updateConfig('storyDNA', 'persona', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select persona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Creator on camera" className="text-xs">Creator on camera</SelectItem>
                  <SelectItem value="Narrator voice" className="text-xs">Narrator voice</SelectItem>
                  <SelectItem value="Silent visual story" className="text-xs">Silent visual story</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Emotion Tone ({config.storyDNA.emotionTone})</label>
              <Slider
                value={[config.storyDNA.emotionTone]}
                onValueChange={([value]) => updateConfig('storyDNA', 'emotionTone', value)}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Calm</span>
                <span>Energetic</span>
                <span>Confident</span>
                <span>Magical</span>
                <span>Sincere</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Pattern Interrupt Type</label>
              <Select value={config.storyDNA.patternInterruptType} onValueChange={(value) => updateConfig('storyDNA', 'patternInterruptType', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select interrupt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unexpected Motion" className="text-xs">Unexpected Motion</SelectItem>
                  <SelectItem value="Visual Twist" className="text-xs">Visual Twist</SelectItem>
                  <SelectItem value="Sound Cue" className="text-xs">Sound Cue</SelectItem>
                  <SelectItem value="Cut Timing" className="text-xs">Cut Timing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Hook Framework Link</label>
              <Select value={config.storyDNA.hookFramework} onValueChange={(value) => updateConfig('storyDNA', 'hookFramework', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transformation" className="text-xs">Transformation</SelectItem>
                  <SelectItem value="Reveal" className="text-xs">Reveal</SelectItem>
                  <SelectItem value="Cause & Effect" className="text-xs">Cause & Effect</SelectItem>
                  <SelectItem value="Story in Motion" className="text-xs">Story in Motion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* 4️⃣ Dialogue / Voice (Conditional) */}
      <Collapsible 
        open={expandedSections.dialogue} 
        onOpenChange={() => toggleSection('dialogue')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span className="text-sm font-medium">Dialogue / Voice</span>
            </div>
            {expandedSections.dialogue ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          {isDialogueVisible ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Voice Type</label>
              <Select value={config.dialogueDNA.voiceType} onValueChange={(value) => updateConfig('dialogueDNA', 'voiceType', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select voice type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Creator on camera" className="text-xs">Creator on camera</SelectItem>
                  <SelectItem value="Voiceover narration" className="text-xs">Voiceover narration</SelectItem>
                  <SelectItem value="Off-screen reaction" className="text-xs">Off-screen reaction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Tone of Voice</label>
              <Select value={config.dialogueDNA.toneOfVoice} onValueChange={(value) => updateConfig('dialogueDNA', 'toneOfVoice', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casual" className="text-xs">Casual</SelectItem>
                  <SelectItem value="Excited" className="text-xs">Excited</SelectItem>
                  <SelectItem value="Soft & Confident" className="text-xs">Soft & Confident</SelectItem>
                  <SelectItem value="Mystical" className="text-xs">Mystical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Script Input</label>
            <Textarea
              value={config.dialogueDNA.script}
              onChange={(e) => updateConfig('dialogueDNA', 'script', e.target.value)}
              placeholder="I never believed a kettle could do this..."
              className="min-h-[60px] text-xs resize-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Language</label>
              <Select value={config.dialogueDNA.language} onValueChange={(value) => updateConfig('dialogueDNA', 'language', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en" className="text-xs">English</SelectItem>
                  <SelectItem value="es" className="text-xs">Spanish</SelectItem>
                  <SelectItem value="fr" className="text-xs">French</SelectItem>
                  <SelectItem value="de" className="text-xs">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Voice Asset Source</label>
              <Select value={config.dialogueDNA.voiceAssetSource} onValueChange={(value) => updateConfig('dialogueDNA', 'voiceAssetSource', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Upload" className="text-xs">Upload</SelectItem>
                  <SelectItem value="Record" className="text-xs">Record</SelectItem>
                  <SelectItem value="Generate with Fabric AI" className="text-xs">Generate with Fabric AI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground">
                Select a persona other than "Silent visual story" to configure dialogue settings.
              </p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* 6️⃣ Sound / Atmosphere */}
      <Collapsible 
        open={expandedSections.sound} 
        onOpenChange={() => toggleSection('sound')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span className="text-sm font-medium">Sound / Atmosphere</span>
            </div>
            {expandedSections.sound ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Sound Mode</label>
              <Select value={config.audioDNA.soundMode} onValueChange={(value) => updateConfig('audioDNA', 'soundMode', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select sound mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Realistic SFX" className="text-xs">Realistic SFX</SelectItem>
                  <SelectItem value="Music-Driven" className="text-xs">Music-Driven</SelectItem>
                  <SelectItem value="Silence + Impact" className="text-xs">Silence + Impact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Sound Emotion</label>
              <Select value={config.audioDNA.soundEmotion} onValueChange={(value) => updateConfig('audioDNA', 'soundEmotion', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select emotion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Warm" className="text-xs">Warm</SelectItem>
                  <SelectItem value="Cool" className="text-xs">Cool</SelectItem>
                  <SelectItem value="Mystical" className="text-xs">Mystical</SelectItem>
                  <SelectItem value="Punchy" className="text-xs">Punchy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
           <div className="space-y-2">
             <label className="text-xs font-medium text-foreground">Key Sounds / FX</label>
             <div className="space-y-2">
               <Select onValueChange={(value) => {
                 setCurrentKeySound(value)
                 addKeySound()
               }}>
                 <SelectTrigger className="w-full h-8 text-xs">
                   <SelectValue placeholder="Choose common sounds or add custom" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Steam hiss" className="text-xs">Steam hiss</SelectItem>
                   <SelectItem value="Click ignition" className="text-xs">Click ignition</SelectItem>
                   <SelectItem value="Spark" className="text-xs">Spark</SelectItem>
                   <SelectItem value="Fire crackle" className="text-xs">Fire crackle</SelectItem>
                   <SelectItem value="Water splash" className="text-xs">Water splash</SelectItem>
                   <SelectItem value="Metal clink" className="text-xs">Metal clink</SelectItem>
                   <SelectItem value="Glass tinkle" className="text-xs">Glass tinkle</SelectItem>
                   <SelectItem value="Whoosh" className="text-xs">Whoosh</SelectItem>
                   <SelectItem value="Pop" className="text-xs">Pop</SelectItem>
                   <SelectItem value="Sizzle" className="text-xs">Sizzle</SelectItem>
                   <SelectItem value="Bubble" className="text-xs">Bubble</SelectItem>
                   <SelectItem value="Hum" className="text-xs">Hum</SelectItem>
                   <SelectItem value="Beep" className="text-xs">Beep</SelectItem>
                   <SelectItem value="Chime" className="text-xs">Chime</SelectItem>
                   <SelectItem value="Thud" className="text-xs">Thud</SelectItem>
                 </SelectContent>
               </Select>
               <div className="flex gap-2 mb-2">
                 <Input
                   value={currentKeySound}
                   onChange={(e) => setCurrentKeySound(e.target.value)}
                   placeholder="Or type custom sound..."
                   className="text-xs h-8"
                   onKeyPress={(e) => e.key === 'Enter' && addKeySound()}
                 />
                 <Button onClick={addKeySound} size="sm" className="h-8 w-8">
                   <Plus className="h-3 w-3" />
                 </Button>
               </div>
             </div>
             <div className="flex flex-wrap gap-2">
               {config.audioDNA.keySounds.map((sound, index) => (
                 <Badge key={index} variant="secondary" className="cursor-pointer text-xs" onClick={() => removeKeySound(index)}>
                   {sound} ×
                 </Badge>
               ))}
             </div>
           </div>
        </CollapsibleContent>
      </Collapsible>

      {/* 5️⃣ Camera & Motion Intelligence (Collapsible) */}
      <Collapsible 
        open={expandedSections.camera} 
        onOpenChange={() => toggleSection('camera')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span className="text-sm font-medium">Camera & Motion Intelligence</span>
            </div>
            {expandedSections.camera ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Camera Rhythm</label>
              <Select value={config.cameraDNA.rhythm} onValueChange={(value) => updateConfig('cameraDNA', 'rhythm', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select rhythm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smooth tracking" className="text-xs">Smooth tracking</SelectItem>
                  <SelectItem value="dynamic cuts" className="text-xs">Dynamic cuts</SelectItem>
                  <SelectItem value="handheld" className="text-xs">Handheld</SelectItem>
                  <SelectItem value="cinematic" className="text-xs">Cinematic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Key Movement Style</label>
              <Select value={config.cameraDNA.movementStyle} onValueChange={(value) => updateConfig('cameraDNA', 'movementStyle', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select movement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="push-in" className="text-xs">Push-in</SelectItem>
                  <SelectItem value="dolly" className="text-xs">Dolly</SelectItem>
                  <SelectItem value="arc" className="text-xs">Arc</SelectItem>
                  <SelectItem value="handheld" className="text-xs">Handheld</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Cut Frequency</label>
              <Select value={config.cameraDNA.cutFrequency} onValueChange={(value) => updateConfig('cameraDNA', 'cutFrequency', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow" className="text-xs">Slow</SelectItem>
                  <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                  <SelectItem value="fast" className="text-xs">Fast</SelectItem>
                  <SelectItem value="dynamic" className="text-xs">Dynamic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Ending Type</label>
              <Select value={config.cameraDNA.endingType} onValueChange={(value) => updateConfig('cameraDNA', 'endingType', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select ending" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero product close-up" className="text-xs">Hero Product Close-Up</SelectItem>
                  <SelectItem value="brand reveal" className="text-xs">Brand Reveal</SelectItem>
                  <SelectItem value="call to action" className="text-xs">Call to Action</SelectItem>
                  <SelectItem value="fade out" className="text-xs">Fade Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Generated Video */}
      {generatedVideo && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">Generated UGC Ad</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => setGeneratedVideo(null)}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
          <div className="relative">
            <video 
              src={generatedVideo} 
              controls
              className="w-full h-48 object-cover rounded-md"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
              <Button variant="secondary" size="sm" className="text-xs h-6">
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button variant="secondary" size="sm" className="text-xs h-6">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <Button 
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm font-medium" 
        disabled={!config.brandDNA.name || !config.productEssence.name || !config.storyDNA.coreAngle || isGenerating}
        onClick={handleGenerate}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate UGC Ad
          </>
        )}
      </Button>

      {/* Floating Scroll to Top Button */}
      {showScrollButton && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}