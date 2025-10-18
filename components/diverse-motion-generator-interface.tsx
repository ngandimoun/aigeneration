"use client"

import React, { useState, useRef, useEffect } from "react"
import { DiverseMotionPreview } from "./diverse-motion-preview"
import { AssetLibraryModal } from "./asset-library-modal"
import { PresetManager } from "./preset-manager"
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
  ChevronUp,
  Plus,
  Minus,
  Check,
  Loader2,
  Eye,
  Download,
  RefreshCw,
  Play,
  Pause,
  VolumeX,
  Package,
  Film,
  Users,
  HelpCircle,
  MessageCircle,
  BarChart
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

interface DiverseMotionGeneratorInterfaceProps {
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
type ProductCategory = "Data Visualizations" | "Infographic" | "Logo Animation" | "UI/UX Element" | "Cinematic Videos"

// Helper function to get accepted file types based on category
const getAcceptedFileTypes = (category: ProductCategory): string => {
  switch (category) {
    case "Data Visualizations":
      return "image/*,.csv,.json" // Images + fichiers de données
    case "Infographic":
      return "image/*" // Images uniquement
    case "Logo Animation":
      return "image/*,video/*" // Images et vidéos
    case "UI/UX Element":
      return "image/*,video/*" // Images et vidéos
    case "Cinematic Videos":
      return "video/*" // Vidéos uniquement
    default:
      return "image/*,video/*"
  }
}

// Helper function to get help text based on category
const getHelpText = (category: ProductCategory): string => {
  switch (category) {
    case "Data Visualizations":
      return "Supported: JPG, PNG, CSV, JSON (Max 50MB)"
    case "Infographic":
      return "Supported: JPG, PNG, GIF (Max 50MB)"
    case "Logo Animation":
      return "Supported: JPG, PNG, MP4, MOV (Max 50MB)"
    case "UI/UX Element":
      return "Supported: JPG, PNG, MP4, MOV (Max 50MB)"
    case "Cinematic Videos":
      return "Supported: MP4, MOV, AVI (Max 50MB)"
    default:
      return "Supported: JPG, PNG, GIF, MP4, MOV (Max 50MB)"
  }
}
type Mode = 'none' | 'single' | 'dual' | 'multi'
type EmotionalTone = "Epic" | "Elegant" | "Calm" | "Poetic" | "Powerful" | "Custom"
type VisualStyle = "Photoreal" | "Cinematic" | "Stylized CG" | "Watercolor Softness" | "Custom"
type Environment = "Studio white" | "Urban twilight" | "Forest dawn" | "Black marble" | "Custom"
type LightingMood = "Soft Daylight" | "Glossy Specular" | "Backlit Sunset" | "High-Contrast Spot" | "Custom"
type MaterialFocus = "Glass" | "Metal" | "Liquid" | "Fabric" | "All"
type CameraType = "Macro Precision" | "Orbit Reveal" | "Tracking Pull-Back" | "Custom"
type FrameRate = "Slow Motion 120 fps" | "Cinematic 60 fps" | "Standard 30 fps" | "Custom"
type RevealType = "Assemble" | "Morph" | "Emerge" | "Disintegrate → Form" | "Morph From Form" | "Slide" | "Custom"
type SoundMode = "SFX only" | "Music driven" | "Hybrid" | "Custom"
type SoundMood = "Ambient minimal" | "Percussive energy" | "Cinematic warm" | "Custom"
type LogoMoment = "Morph From Form" | "Fade-In" | "Hover" | "None"

// Template Types
interface Template {
  id: string
  name: string
  description: string
  icon: string
}

// Template mappings per category with presets
const TEMPLATE_MAP: Record<ProductCategory, Template[]> = {
  "Data Visualizations": [
    { id: "stock-chart", name: "Stock Chart", description: "Animated stock price movements", icon: "📈" },
    { id: "sales-dashboard", name: "Sales Dashboard", description: "Interactive sales metrics", icon: "📊" },
    { id: "comparison-bars", name: "Comparison Bars", description: "Side-by-side data comparison", icon: "📊" },
    { id: "growth-metrics", name: "Growth Metrics", description: "Progressive growth visualization", icon: "📈" }
  ],
  "Infographic": [
    { id: "process-flow", name: "Process Flow", description: "Step-by-step process visualization", icon: "🔄" },
    { id: "timeline", name: "Timeline", description: "Chronological event sequence", icon: "⏰" },
    { id: "statistics-reveal", name: "Statistics Reveal", description: "Animated statistics presentation", icon: "📊" },
    { id: "icon-grid", name: "Icon Grid", description: "Icon-based information layout", icon: "🎯" }
  ],
  "Logo Animation": [
    { id: "minimal-reveal", name: "Minimal Reveal", description: "Clean, simple logo appearance", icon: "✨" },
    { id: "particle-formation", name: "Particle Formation", description: "Logo forms from particles", icon: "💫" },
    { id: "3d-spin", name: "3D Spin", description: "Three-dimensional rotation", icon: "🔄" },
    { id: "glitch-intro", name: "Glitch Intro", description: "Digital glitch effect entrance", icon: "⚡" }
  ],
  "UI/UX Element": [
    { id: "button-interaction", name: "Button Interaction", description: "Interactive button animations", icon: "🔘" },
    { id: "menu-transition", name: "Menu Transition", description: "Smooth menu state changes", icon: "📱" },
    { id: "loading-animation", name: "Loading Animation", description: "Loading state indicators", icon: "⏳" },
    { id: "card-flip", name: "Card Flip", description: "Card flip and reveal effects", icon: "🃏" }
  ],
  "Cinematic Videos": [
    { id: "funny-video", name: "Funny Video", description: "Comedy and humorous content", icon: "😂" },
    { id: "explanation-video", name: "Explanation Video", description: "Educational and tutorial content", icon: "📚" },
    { id: "movie-clip", name: "Movie Clip", description: "Dramatic and narrative scenes", icon: "🎬" },
    { id: "lifestyle-scene", name: "Lifestyle Scene", description: "Everyday and aspirational moments", icon: "🌟" }
  ]
}

// Template presets configuration
const TEMPLATE_PRESETS: Record<string, TemplatePreset> = {
  "funny-video": {
    autoConfig: {
      visualStyle: "Stylized CG",
      emotionalTone: "Powerful",
      cameraEnergy: 70,
      soundMode: "Hybrid",
      soundMood: "Percussive energy",
      revealType: "Emerge"
    },
    additionalFields: ["comedyTiming", "humorStyle"],
    description: "Optimized for comedic timing and playful energy"
  },
  "explanation-video": {
    autoConfig: {
      visualStyle: "Cinematic",
      emotionalTone: "Calm",
      cameraEnergy: 40,
      soundMode: "SFX only",
      soundMood: "Ambient minimal",
      environment: "Studio white"
    },
    additionalFields: ["explanationPacing", "visualAids"],
    description: "Clear and educational presentation style"
  },
  "movie-clip": {
    autoConfig: {
      visualStyle: "Cinematic",
      emotionalTone: "Epic",
      cameraEnergy: 60,
      soundMode: "Music driven",
      soundMood: "Cinematic warm",
      environment: "Urban twilight"
    },
    additionalFields: ["dramaticTension", "narrativeArc"],
    description: "Dramatic cinematic storytelling"
  },
  "lifestyle-scene": {
    autoConfig: {
      visualStyle: "Photoreal",
      emotionalTone: "Elegant",
      cameraEnergy: 50,
      soundMode: "Hybrid",
      soundMood: "Ambient minimal",
      environment: "Forest dawn"
    },
    additionalFields: ["lifestyleMood", "aspirationalLevel"],
    description: "Natural and aspirational lifestyle content"
  },
  "stock-chart": {
    autoConfig: {
      visualStyle: "Cinematic",
      emotionalTone: "Epic",
      cameraEnergy: 50,
      soundMode: "SFX only",
      soundMood: "Ambient minimal",
      revealType: "Morph"
    },
    additionalFields: ["dataTrend", "timePeriod"],
    description: "Professional financial data visualization"
  },
  "sales-dashboard": {
    autoConfig: {
      visualStyle: "Stylized CG",
      emotionalTone: "Powerful",
      cameraEnergy: 60,
      soundMode: "Hybrid",
      revealType: "Assemble"
    },
    additionalFields: ["metricType", "dashboardLayout"],
    description: "Dynamic business metrics presentation"
  },
  "minimal-reveal": {
    autoConfig: {
      visualStyle: "Cinematic",
      emotionalTone: "Elegant",
      cameraEnergy: 30,
      soundMode: "SFX only",
      soundMood: "Ambient minimal",
      revealType: "Morph From Form"
    },
    additionalFields: ["minimalistStyle", "brandEssence"],
    description: "Clean and sophisticated logo reveal"
  },
  "particle-formation": {
    autoConfig: {
      visualStyle: "Stylized CG",
      emotionalTone: "Epic",
      cameraEnergy: 70,
      soundMode: "Hybrid",
      revealType: "Assemble"
    },
    additionalFields: ["particleDensity", "formationPattern"],
    description: "Dynamic particle-based logo formation"
  },
  "comparison-bars": {
    autoConfig: {
      visualStyle: "Cinematic",
      emotionalTone: "Powerful",
      cameraEnergy: 55,
      soundMode: "SFX only",
      soundMood: "Percussive energy",
      revealType: "Assemble"
    },
    additionalFields: ["comparisonType", "dataHighlight"],
    description: "Side-by-side comparison with emphasis"
  },
  "growth-metrics": {
    autoConfig: {
      visualStyle: "Stylized CG",
      emotionalTone: "Epic",
      cameraEnergy: 65,
      soundMode: "Hybrid",
      soundMood: "Cinematic warm",
      revealType: "Emerge"
    },
    additionalFields: ["growthDirection", "metricType"],
    description: "Progressive growth visualization with impact"
  },
  "process-flow": {
    autoConfig: {
      visualStyle: "Cinematic",
      emotionalTone: "Calm",
      cameraEnergy: 45,
      soundMode: "SFX only",
      soundMood: "Ambient minimal",
      environment: "Studio white"
    },
    additionalFields: ["stepCount", "flowDirection"],
    description: "Clear step-by-step process visualization"
  },
  "timeline": {
    autoConfig: {
      visualStyle: "Cinematic",
      emotionalTone: "Elegant",
      cameraEnergy: 40,
      soundMode: "Hybrid",
      soundMood: "Ambient minimal",
      revealType: "Morph"
    },
    additionalFields: ["timelineOrientation", "eventEmphasis"],
    description: "Chronological timeline with smooth transitions"
  },
  "statistics-reveal": {
    autoConfig: {
      visualStyle: "Stylized CG",
      emotionalTone: "Powerful",
      cameraEnergy: 60,
      soundMode: "Hybrid",
      soundMood: "Percussive energy",
      revealType: "Emerge"
    },
    additionalFields: ["revealTiming", "numberAnimation"],
    description: "Impactful statistics presentation"
  },
  "icon-grid": {
    autoConfig: {
      visualStyle: "Stylized CG",
      emotionalTone: "Calm",
      cameraEnergy: 35,
      soundMode: "SFX only",
      soundMood: "Ambient minimal",
      revealType: "Assemble"
    },
    additionalFields: ["gridLayout", "iconStyle"],
    description: "Organized icon-based information layout"
  },
  "3d-spin": {
    autoConfig: {
      visualStyle: "Stylized CG",
      emotionalTone: "Epic",
      cameraEnergy: 75,
      soundMode: "Hybrid",
      soundMood: "Cinematic warm",
      revealType: "Emerge"
    },
    additionalFields: ["rotationAxis", "spinSpeed"],
    description: "Dynamic 3D rotation with depth"
  },
  "glitch-intro": {
    autoConfig: {
      visualStyle: "Stylized CG",
      emotionalTone: "Powerful",
      cameraEnergy: 80,
      soundMode: "Hybrid",
      soundMood: "Percussive energy",
      revealType: "Disintegrate → Form"
    },
    additionalFields: ["glitchIntensity", "digitalEffect"],
    description: "High-energy digital glitch entrance"
  },
  "button-interaction": {
    autoConfig: {
      visualStyle: "Stylized CG",
      emotionalTone: "Calm",
      cameraEnergy: 50,
      soundMode: "SFX only",
      soundMood: "Percussive energy",
      environment: "Studio white"
    },
    additionalFields: ["interactionType", "feedbackStyle"],
    description: "Smooth button interaction animations"
  },
  "menu-transition": {
    autoConfig: {
      visualStyle: "Cinematic",
      emotionalTone: "Elegant",
      cameraEnergy: 45,
      soundMode: "SFX only",
      soundMood: "Ambient minimal",
      revealType: "Morph"
    },
    additionalFields: ["transitionStyle", "menuType"],
    description: "Fluid menu state transitions"
  },
  "loading-animation": {
    autoConfig: {
      visualStyle: "Stylized CG",
      emotionalTone: "Calm",
      cameraEnergy: 40,
      soundMode: "SFX only",
      soundMood: "Ambient minimal",
      loopMode: true
    },
    additionalFields: ["loopStyle", "loadingType"],
    description: "Smooth looping loading indicators"
  },
  "card-flip": {
    autoConfig: {
      visualStyle: "Cinematic",
      emotionalTone: "Elegant",
      cameraEnergy: 55,
      soundMode: "SFX only",
      soundMood: "Percussive energy",
      revealType: "Morph"
    },
    additionalFields: ["flipAxis", "cardStyle"],
    description: "Elegant card flip and reveal effects"
  }
}

// Asset interface for multi-asset modes
interface MotionAsset {
  id: string
  prompt: string
  description?: string
  timing?: number // seconds
}

// Category-specific field configurations
interface CategoryConfig {
  fields: string[]
  icon: string
  color: string
  description: string
}

const CATEGORY_CONFIGS: Record<ProductCategory, CategoryConfig> = {
  "Data Visualizations": {
    fields: ["chartType", "dataPoints", "animationStyle", "colorScheme"],
    icon: "📊",
    color: "green",
    description: "Animated charts, graphs, and data-driven visualizations"
  },
  "Infographic": {
    fields: ["layoutType", "iconStyle", "textEmphasis", "flowDirection"],
    icon: "📋",
    color: "purple",
    description: "Information graphics with icons, text, and visual elements"
  },
  "Logo Animation": {
    fields: ["logoType", "animationComplexity", "brandColors", "revealStyle"],
    icon: "✨",
    color: "pink",
    description: "Animated logo reveals and brand identity animations"
  },
  "UI/UX Element": {
    fields: ["elementType", "interactionType", "stateTransitions", "microInteractionLevel"],
    icon: "🎨",
    color: "cyan",
    description: "User interface elements and micro-interactions"
  },
  "Cinematic Videos": {
    fields: ["sceneType", "moodGenre", "pacing", "narrativeStructure"],
    icon: "🎬",
    color: "orange",
    description: "Cinematic scenes with storytelling and dramatic elements"
  }
}

// Template presets with auto-configuration
interface TemplatePreset {
  autoConfig: {
    visualStyle?: VisualStyle
    emotionalTone?: EmotionalTone
    cameraEnergy?: number
    soundMode?: SoundMode
    soundMood?: SoundMood
    environment?: Environment
    revealType?: RevealType
    loopMode?: boolean
  }
  additionalFields?: string[]
  description: string
}

export function DiverseMotionGeneratorInterface({ 
  onClose, 
  projectTitle,
  selectedArtifact 
}: DiverseMotionGeneratorInterfaceProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Mode Selection
  const [mode, setMode] = useState<Mode>('none')
  
  // 1️⃣ Product Description & Intent Capture
  const [productCategory, setProductCategory] = useState<ProductCategory>("Data Visualizations")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom")
  const [customTemplateInstructions, setCustomTemplateInstructions] = useState("")
  const [productName, setProductName] = useState("")
  const [prompt, setPrompt] = useState("")
  const [coreMoment, setCoreMoment] = useState("")
  const [emotionalTone, setEmotionalTone] = useState<EmotionalTone>("Epic")
  const [customEmotionalTone, setCustomEmotionalTone] = useState("")
  const [visualStyle, setVisualStyle] = useState<VisualStyle>("Cinematic")
  const [customVisualStyle, setCustomVisualStyle] = useState("")
  const [duration, setDuration] = useState([10]) // 5-120 seconds (up to 2 minutes)
  
  // Category-specific fields - Data Visualizations
  const [chartType, setChartType] = useState<string>("Line Chart")
  const [customChartType, setCustomChartType] = useState("")
  const [dataPoints, setDataPoints] = useState<string>("10-20")
  const [customDataPoints, setCustomDataPoints] = useState("")
  const [animationStyle, setAnimationStyle] = useState<string>("Sequential")
  const [customAnimationStyle, setCustomAnimationStyle] = useState("")
  const [colorScheme, setColorScheme] = useState<string>("Gradient")
  const [customColorScheme, setCustomColorScheme] = useState("")
  
  // Category-specific fields - Infographic
  const [layoutType, setLayoutType] = useState<string>("Vertical")
  const [iconStyle, setIconStyle] = useState<string>("Flat")
  const [textEmphasis, setTextEmphasis] = useState<string>("Moderate")
  const [flowDirection, setFlowDirection] = useState<string>("Top-to-Bottom")
  
  // Category-specific fields - Logo Animation
  const [logoType, setLogoType] = useState<string>("Combined")
  const [animationComplexity, setAnimationComplexity] = useState<string>("Moderate")
  const [brandColors, setBrandColors] = useState<string>("")
  const [revealStyle, setRevealStyle] = useState<string>("Build-up")
  
  // Category-specific fields - UI/UX Element
  const [elementType, setElementType] = useState<string>("Button")
  const [interactionType, setInteractionType] = useState<string>("Hover")
  const [stateTransitions, setStateTransitions] = useState<string>("2-state")
  const [microInteractionLevel, setMicroInteractionLevel] = useState<string>("Noticeable")
  
  // Category-specific fields - Cinematic Videos
  const [sceneType, setSceneType] = useState<string>("Indoor")
  const [moodGenre, setMoodGenre] = useState<string>("Drama")
  const [pacing, setPacing] = useState<string>("Medium")
  const [narrativeStructure, setNarrativeStructure] = useState<string>("Linear")
  
  // Multi-asset support
  const [assets, setAssets] = useState<MotionAsset[]>([
    { id: '1', prompt: '', timing: 5 }
  ])
  
  // Asset file management
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [assetPreviews, setAssetPreviews] = useState<string[]>([])
  const [isUploadingAsset, setIsUploadingAsset] = useState(false)
  
  // Dual Asset transition controls
  const [transitionType, setTransitionType] = useState<string>("morph")
  const [customTransitionType, setCustomTransitionType] = useState("")
  const [transitionDuration, setTransitionDuration] = useState([1.0])
  const [transitionEasing, setTransitionEasing] = useState<string>("smooth")
  const [customTransitionEasing, setCustomTransitionEasing] = useState("")
  const [transitionDirection, setTransitionDirection] = useState<string>("forward")
  
  // Multi Asset sequence controls
  const [sequenceStyle, setSequenceStyle] = useState<string>("sequential")
  const [globalTransition, setGlobalTransition] = useState<string>("fade")
  const [sceneTransitionDuration, setSceneTransitionDuration] = useState([0.8])
  const [customSequenceStyle, setCustomSequenceStyle] = useState("")
  const [customGlobalTransition, setCustomGlobalTransition] = useState("")
  
  // Preview system state
  const [showPreview, setShowPreview] = useState(false)
  const [previewPlaying, setPreviewPlaying] = useState(false)
  const [previewTime, setPreviewTime] = useState(0)
  const [previewAssets, setPreviewAssets] = useState<any[]>([])
  const [previewTransitions, setPreviewTransitions] = useState<any[]>([])
  
  // Asset library state
  const [showAssetLibrary, setShowAssetLibrary] = useState(false)
  const [librarySelectionMode, setLibrarySelectionMode] = useState<'single' | 'dual' | 'multi'>('single')
  const [libraryTargetIndex, setLibraryTargetIndex] = useState<number>(0)
  
  // Preset manager state
  const [showPresetManager, setShowPresetManager] = useState(false)
  
  // Cinematic Videos - Character state
  const [characterCount, setCharacterCount] = useState(1)
  const [characters, setCharacters] = useState<Array<{
    id: string
    name: string
    description: string
    artStyle: string
    role: string
    gender: string
    ageRange: string
    personality: string
  }>>([])

  // Cinematic Videos - Dialog state
  const [dialogLines, setDialogLines] = useState<Array<{
    id: string
    characterId: string
    text: string
    expression: string
    emotion: string
  }>>([])
  
  // Initialize assets based on mode
  useEffect(() => {
    if (mode === 'none') {
      setAssets([])
    } else if (mode === 'dual') {
      setAssets([
        { id: '1', prompt: '', timing: 5 },
        { id: '2', prompt: '', timing: 5 }
      ])
    } else if (mode === 'multi') {
      setAssets([
        { id: '1', prompt: '', timing: 5 }
      ])
    } else {
      setAssets([
        { id: '1', prompt: '', timing: 5 }
      ])
    }
  }, [mode])
  
  // 2️⃣ Visual Context
  const [environment, setEnvironment] = useState<Environment>("Studio white")
  const [customEnvironment, setCustomEnvironment] = useState("")
  const [lightingMood, setLightingMood] = useState<LightingMood>("Soft Daylight")
  const [customLightingMood, setCustomLightingMood] = useState("")
  const [materialFocus, setMaterialFocus] = useState<MaterialFocus[]>(["All"])
  const [cameraType, setCameraType] = useState<CameraType>("Macro Precision")
  const [customCameraType, setCustomCameraType] = useState("")
  const [frameRate, setFrameRate] = useState<FrameRate>("Cinematic 60 fps")
  const [customFrameRate, setCustomFrameRate] = useState("")
  
  // 3️⃣ Motion & Energy
  const [revealType, setRevealType] = useState<RevealType>("Morph")
  const [customRevealType, setCustomRevealType] = useState("")
  const [cameraEnergy, setCameraEnergy] = useState([50]) // 0-100 slider
  const [loopMode, setLoopMode] = useState(false)
  const [hookIntensity, setHookIntensity] = useState([50]) // 0-100 slider
  const [endEmotion, setEndEmotion] = useState([50]) // 0-100 slider (Clean ↔ Awe)
  
  // 4️⃣ Audio DNA
  const [soundMode, setSoundMode] = useState<SoundMode>("SFX only")
  const [customSoundMode, setCustomSoundMode] = useState("")
  const [soundMood, setSoundMood] = useState<SoundMood>("Ambient minimal")
  const [customSoundMood, setCustomSoundMood] = useState("")
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
  
  // Collapsible sections (UGC Ads style)
  const [expandedSections, setExpandedSections] = useState({
    content: true,  // Always expanded by default
    visual: false,
    motion: false,
    audio: false,
    brand: false,
    characters: false,
    dialog: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Asset management functions
  const updateAsset = (index: number, updates: Partial<MotionAsset>) => {
    setAssets(prev => prev.map((asset, i) => i === index ? { ...asset, ...updates } : asset))
  }

  const addAsset = () => {
    if (assets.length < 3) {
      setAssets(prev => [...prev, { 
        id: (prev.length + 1).toString(), 
        prompt: '', 
        timing: 5 
      }])
    }
  }

  const removeAsset = (index: number) => {
    if (assets.length > 1) {
      setAssets(prev => prev.filter((_, i) => i !== index))
    }
  }

  // Template handling
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    // Apply template-specific defaults
    if (templateId !== 'custom') {
      const template = TEMPLATE_MAP[productCategory]?.find(t => t.id === templateId)
      if (template) {
        // Apply smart defaults based on template
        applyTemplateDefaults(templateId)
      }
    }
  }

  const applyTemplateDefaults = (templateId: string) => {
    const preset = TEMPLATE_PRESETS[templateId]
    if (!preset) return
    
    // Apply auto-configuration
    const { autoConfig } = preset
    if (autoConfig.visualStyle) setVisualStyle(autoConfig.visualStyle)
    if (autoConfig.emotionalTone) setEmotionalTone(autoConfig.emotionalTone)
    if (autoConfig.cameraEnergy !== undefined) setCameraEnergy([autoConfig.cameraEnergy])
    if (autoConfig.soundMode) setSoundMode(autoConfig.soundMode)
    if (autoConfig.soundMood) setSoundMood(autoConfig.soundMood)
    if (autoConfig.environment) setEnvironment(autoConfig.environment)
    if (autoConfig.revealType) setRevealType(autoConfig.revealType)
    if (autoConfig.loopMode !== undefined) setLoopMode(autoConfig.loopMode)
    
    // Show toast notification about applied preset
    toast({
      title: "Template Applied",
      description: preset.description,
      duration: 3000
    })
  }

  // Tooltip helper component
  const TooltipIcon = ({ content }: { content: string }) => (
    <div className="group relative inline-block">
      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  )

  // Preview handlers
  const handlePreviewPlayPause = () => {
    setPreviewPlaying(!previewPlaying)
  }

  const handlePreviewSeek = (time: number) => {
    setPreviewTime(time)
  }

  const handlePreviewExport = () => {
    // TODO: Implement preview export
    toast({
      title: "Preview Export",
      description: "Export functionality coming soon!",
      duration: 3000
    })
  }

  const handlePreviewFullscreen = () => {
    // TODO: Implement fullscreen
    toast({
      title: "Fullscreen",
      description: "Fullscreen mode coming soon!",
      duration: 2000
    })
  }

  // Asset library handlers
  const handleOpenAssetLibrary = (mode: 'single' | 'dual' | 'multi', targetIndex: number = 0) => {
    setLibrarySelectionMode(mode)
    setLibraryTargetIndex(targetIndex)
    setShowAssetLibrary(true)
  }

  const handleSelectFromLibrary = (selectedAssets: any[]) => {
    if (selectedAssets.length === 0) return

    // Convert library assets to files and previews
    const newFiles: File[] = []
    const newPreviews: string[] = []

    selectedAssets.forEach((asset) => {
      // Create a mock file object from library asset
      const mockFile = new File([], asset.name, { 
        type: asset.type === 'image' ? 'image/jpeg' : 'video/mp4' 
      })
      newFiles.push(mockFile)
      newPreviews.push(asset.url)
    })

    // Update uploaded files and previews
    if (librarySelectionMode === 'single') {
      setUploadedFiles([newFiles[0]])
      setAssetPreviews([newPreviews[0]])
    } else if (librarySelectionMode === 'dual') {
      if (libraryTargetIndex === 0) {
        setUploadedFiles([newFiles[0], ...uploadedFiles.slice(1)])
        setAssetPreviews([newPreviews[0], ...assetPreviews.slice(1)])
      } else {
        setUploadedFiles([...uploadedFiles.slice(0, 1), newFiles[0]])
        setAssetPreviews([...assetPreviews.slice(0, 1), newPreviews[0]])
      }
    } else {
      // Multi mode - replace or add assets
      const updatedFiles = [...uploadedFiles]
      const updatedPreviews = [...assetPreviews]
      
      selectedAssets.forEach((asset, index) => {
        const targetIdx = libraryTargetIndex + index
        updatedFiles[targetIdx] = newFiles[index]
        updatedPreviews[targetIdx] = newPreviews[index]
      })
      
      setUploadedFiles(updatedFiles)
      setAssetPreviews(updatedPreviews)
    }

    toast({
      title: "Assets Selected",
      description: `Selected ${selectedAssets.length} asset(s) from library`,
      duration: 3000
    })
  }

  // Preset manager handlers
  const handleLoadPreset = (preset: any) => {
    // Apply preset settings to current form
    if (preset.settings) {
      const settings = preset.settings
      
      // Apply visual settings
      if (settings.visualStyle) setVisualStyle(settings.visualStyle)
      if (settings.emotionalTone) setEmotionalTone(settings.emotionalTone)
      if (settings.cameraEnergy !== undefined) setCameraEnergy([settings.cameraEnergy])
      if (settings.soundMode) setSoundMode(settings.soundMode)
      if (settings.soundMood) setSoundMood(settings.soundMood)
      if (settings.environment) setEnvironment(settings.environment)
      if (settings.revealType) setRevealType(settings.revealType)
      if (settings.loopMode !== undefined) setLoopMode(settings.loopMode)
      
      // Apply transition settings
      if (settings.transitionType) setTransitionType(settings.transitionType)
      if (settings.transitionDuration !== undefined) setTransitionDuration([settings.transitionDuration])
      if (settings.transitionEasing) setTransitionEasing(settings.transitionEasing)
      if (settings.transitionDirection) setTransitionDirection(settings.transitionDirection)
      
      // Apply sequence settings
      if (settings.sequenceStyle) setSequenceStyle(settings.sequenceStyle)
      if (settings.globalTransition) setGlobalTransition(settings.globalTransition)
      if (settings.sceneTransitionDuration !== undefined) setSceneTransitionDuration([settings.sceneTransitionDuration])
    }

    toast({
      title: "Preset Loaded",
      description: `Applied "${preset.name}" settings`,
      duration: 3000
    })
  }

  // State for API dropdowns
  const [availableCharts, setAvailableCharts] = useState<any[]>([])
  const [availableAvatars, setAvailableAvatars] = useState<any[]>([])
  const [loadingCharts, setLoadingCharts] = useState(false)
  const [loadingAvatars, setLoadingAvatars] = useState(false)
  const [selectedChartId, setSelectedChartId] = useState<string>("")
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("")
  const [showChartsDropdown, setShowChartsDropdown] = useState(false)
  const [showAvatarsDropdown, setShowAvatarsDropdown] = useState(false)

  // Computed selected items
  const selectedChart = availableCharts.find(c => c.id === selectedChartId)
  const selectedAvatar = availableAvatars.find(a => a.id === selectedAvatarId)

  // Data fetching functions
  const loadAvailableCharts = async () => {
    setLoadingCharts(true)
    try {
      const response = await fetch('/api/charts-infographics')
      if (response.ok) {
        const data = await response.json()
        setAvailableCharts(data.chartsInfographics || [])
      }
    } catch (error) {
      console.error('Failed to load charts:', error)
    } finally {
      setLoadingCharts(false)
    }
  }

  const loadAvailableAvatars = async () => {
    setLoadingAvatars(true)
    try {
      const response = await fetch('/api/avatars')
      if (response.ok) {
        const data = await response.json()
        setAvailableAvatars(data.avatars || [])
      }
    } catch (error) {
      console.error('Failed to load avatars:', error)
    } finally {
      setLoadingAvatars(false)
    }
  }

  // Category-specific API handlers
  const handleOpenChartsAPI = () => {
    setShowChartsDropdown(!showChartsDropdown)
    if (!showChartsDropdown && availableCharts.length === 0) {
      loadAvailableCharts()
    }
  }

  const handleOpenAvatarAPI = () => {
    setShowAvatarsDropdown(!showAvatarsDropdown)
    if (!showAvatarsDropdown && availableAvatars.length === 0) {
      loadAvailableAvatars()
    }
  }

  // Helper functions for image URLs
  const getChartImageUrl = (chart: any) => {
    // Charts have generated_images array with signed URLs
    return chart.generated_images?.[0] || null
  }

  const getAvatarImageUrl = (avatar: any) => {
    // Avatars can have image in different properties
    if (avatar.image) return avatar.image
    if (avatar.generated_images && avatar.generated_images.length > 0) {
      return avatar.generated_images[0]
    }
    return null
  }

  // Character management functions
  const addCharacter = () => {
    const newChar = {
      id: Date.now().toString(),
      name: '',
      description: '',
      artStyle: 'realistic',
      role: 'supporting',
      gender: 'male',
      ageRange: 'adult',
      personality: 'friendly'
    }
    setCharacters([...characters, newChar])
  }

  const updateCharacter = (id: string, field: string, value: string) => {
    setCharacters(characters.map(char => 
      char.id === id ? { ...char, [field]: value } : char
    ))
  }

  const removeCharacter = (id: string) => {
    setCharacters(characters.filter(char => char.id !== id))
  }

  // Dialog management functions
  const addDialogLine = () => {
    const newLine = {
      id: Date.now().toString(),
      characterId: characters[0]?.id || '',
      text: '',
      expression: 'happy',
      emotion: 'neutral'
    }
    setDialogLines([...dialogLines, newLine])
  }

  const updateDialogLine = (id: string, field: string, value: string) => {
    setDialogLines(dialogLines.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ))
  }

  const removeDialogLine = (id: string) => {
    setDialogLines(dialogLines.filter(line => line.id !== id))
  }

  const moveDialogLine = (id: string, direction: 'up' | 'down') => {
    const index = dialogLines.findIndex(line => line.id === id)
    if (index === -1) return
    
    const newLines = [...dialogLines]
    if (direction === 'up' && index > 0) {
      [newLines[index], newLines[index - 1]] = [newLines[index - 1], newLines[index]]
    } else if (direction === 'down' && index < newLines.length - 1) {
      [newLines[index], newLines[index + 1]] = [newLines[index + 1], newLines[index]]
    }
    setDialogLines(newLines)
  }

  // Sync characters array with character count for Cinematic Videos
  useEffect(() => {
    if (productCategory === "Cinematic Videos") {
      const currentCount = characters.length
      if (characterCount > currentCount) {
        // Add characters
        const newChars = Array.from({ length: characterCount - currentCount }, (_, i) => ({
          id: `${Date.now()}-${i}`,
          name: '',
          description: '',
          artStyle: 'realistic',
          role: 'supporting',
          gender: 'male',
          ageRange: 'adult',
          personality: 'friendly'
        }))
        setCharacters([...characters, ...newChars])
      } else if (characterCount < currentCount) {
        // Remove characters
        setCharacters(characters.slice(0, characterCount))
      }
    }
  }, [characterCount, productCategory])

  // Update preview data when settings change
  useEffect(() => {
    const totalDuration = assets.reduce((sum, asset) => sum + (asset.timing || 5), 0) || duration[0]
    
    // Convert assets to preview format
    const previewAssetsData = assets.map((asset, index) => ({
      id: asset.id,
      type: uploadedFiles[index]?.type.startsWith('image/') ? 'image' : 
            uploadedFiles[index]?.type.startsWith('video/') ? 'video' : 'text',
      src: uploadedFiles[index] ? assetPreviews[index] : undefined,
      text: asset.prompt || `Asset ${index + 1}`,
      duration: asset.timing || 5,
      thumbnail: uploadedFiles[index] ? assetPreviews[index] : undefined
    }))

    // Convert transitions to preview format
    const previewTransitionsData = assets.slice(0, -1).map((_, index) => ({
      type: mode === 'dual' ? transitionType : globalTransition,
      duration: mode === 'dual' ? transitionDuration[0] : sceneTransitionDuration[0],
      easing: mode === 'dual' ? transitionEasing : 'smooth',
      direction: mode === 'dual' ? transitionDirection : 'forward'
    }))

    setPreviewAssets(previewAssetsData)
    setPreviewTransitions(previewTransitionsData)
  }, [assets, uploadedFiles, assetPreviews, mode, transitionType, transitionDuration, transitionEasing, transitionDirection, globalTransition, sceneTransitionDuration, duration])

  // Category change handler with smart defaults
  const handleCategoryChange = (category: ProductCategory) => {
    setProductCategory(category)
    setSelectedTemplate("custom") // Reset template when category changes
    
    // Apply smart category defaults
    switch (category) {
      case "Data Visualizations":
        setVisualStyle("Cinematic")
        setEmotionalTone("Powerful")
        setCameraEnergy([50])
        setSoundMode("SFX only")
        setRevealType("Emerge")
        break
      case "Infographic":
        setVisualStyle("Stylized CG")
        setEmotionalTone("Calm")
        setCameraEnergy([40])
        setSoundMode("SFX only")
        setRevealType("Assemble")
        break
      case "Logo Animation":
        setVisualStyle("Stylized CG")
        setEmotionalTone("Epic")
        setCameraEnergy([60])
        setSoundMode("Hybrid")
        setRevealType("Morph From Form")
        break
      case "UI/UX Element":
        setVisualStyle("Stylized CG")
        setEmotionalTone("Calm")
        setCameraEnergy([45])
        setSoundMode("SFX only")
        setRevealType("Morph")
        setEnvironment("Studio white")
        break
      case "Cinematic Videos":
        setVisualStyle("Cinematic")
        setEmotionalTone("Epic")
        setCameraEnergy([65])
        setSoundMode("Hybrid")
        setRevealType("Emerge")
        setEnvironment("Urban twilight")
        break
    }
    
    // Show toast notification about applied defaults
    toast({
      title: "Smart Defaults Applied",
      description: `Optimized settings for ${category.toLowerCase()} content`,
      duration: 3000
    })
  }
  
  // Asset file handling
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    
    const maxAssets = mode === 'single' ? 1 : mode === 'dual' ? 2 : 3
    const totalAssets = uploadedFiles.length + files.length
    
    if (totalAssets > maxAssets) {
      toast({
        title: "Too many assets",
        description: `${mode === 'single' ? 'Single' : mode === 'dual' ? 'Dual' : 'Multi'} Asset mode allows up to ${maxAssets} asset${maxAssets > 1 ? 's' : ''}.`,
        variant: "destructive"
      })
      return
    }
    
    setIsUploadingAsset(true)
    
    try {
      const newFiles: File[] = []
      const newPreviews: string[] = []
      
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image or video file.`,
            variant: "destructive"
          })
          continue
        }
        
        // Validate file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 50MB limit.`,
            variant: "destructive"
          })
          continue
        }
        
        newFiles.push(file)
        
        // Create preview
        const preview = URL.createObjectURL(file)
        newPreviews.push(preview)
      }
      
      setUploadedFiles(prev => [...prev, ...newFiles])
      setAssetPreviews(prev => [...prev, ...newPreviews])
      
      // En mode single, réinitialiser les sélections de chart/avatar
      if (mode === 'single') {
        setSelectedChartId("")
        setSelectedAvatarId("")
      }
      
      toast({
        title: "Assets uploaded",
        description: `${newFiles.length} asset${newFiles.length > 1 ? 's' : ''} uploaded successfully.`,
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload assets. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploadingAsset(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  
  const removeUploadedAsset = (index: number) => {
    // Revoke object URL to free memory
    if (assetPreviews[index]) {
      URL.revokeObjectURL(assetPreviews[index])
    }
    
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setAssetPreviews(prev => prev.filter((_, i) => i !== index))
    
    toast({
      title: "Asset removed",
      description: "Asset has been removed from the project."
    })
  }
  
  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      assetPreviews.forEach(preview => URL.revokeObjectURL(preview))
    }
  }, [assetPreviews])

  // Load available charts and avatars on component mount
  useEffect(() => {
    loadAvailableCharts()
    loadAvailableAvatars()
  }, [])
  
  // Render category-specific fields (context-aware based on mode)
  const renderCategorySpecificFields = () => {
    const config = CATEGORY_CONFIGS[productCategory]
    const hasAssets = mode !== 'none' // If mode is not 'none', user will provide assets
    
    return (
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              {hasAssets ? `${productCategory} Enhancement` : `${productCategory} Creation`}
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {hasAssets ? 'Enhance and modify your uploaded assets' : config.description}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {productCategory === "Data Visualizations" && !hasAssets && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Chart Type</label>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Line Chart">📈 Line Chart</SelectItem>
                    <SelectItem value="Bar Chart">📊 Bar Chart</SelectItem>
                    <SelectItem value="Pie Chart">🥧 Pie Chart</SelectItem>
                    <SelectItem value="Area Chart">📉 Area Chart</SelectItem>
                    <SelectItem value="Scatter Plot">⚫ Scatter Plot</SelectItem>
                    <SelectItem value="Custom">🎨 Custom</SelectItem>
                  </SelectContent>
                </Select>
                {chartType === 'Custom' && (
                  <Input
                    value={customChartType}
                    onChange={(e) => setCustomChartType(e.target.value)}
                    placeholder="Enter custom chart type..."
                    className="mt-2 bg-background border-border"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data Points</label>
                <Select value={dataPoints} onValueChange={setDataPoints}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5-10">5-10 points</SelectItem>
                    <SelectItem value="10-20">10-20 points</SelectItem>
                    <SelectItem value="20-50">20-50 points</SelectItem>
                    <SelectItem value="50+">50+ points</SelectItem>
                    <SelectItem value="Custom">🎨 Custom</SelectItem>
                  </SelectContent>
                </Select>
                {dataPoints === 'Custom' && (
                  <Input
                    value={customDataPoints}
                    onChange={(e) => setCustomDataPoints(e.target.value)}
                    placeholder="Enter custom data points..."
                    className="mt-2 bg-background border-border"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Animation Style</label>
                <Select value={animationStyle} onValueChange={setAnimationStyle}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sequential">🔢 Sequential</SelectItem>
                    <SelectItem value="Simultaneous">⚡ Simultaneous</SelectItem>
                    <SelectItem value="Wave">🌊 Wave</SelectItem>
                    <SelectItem value="Custom">🎨 Custom</SelectItem>
                  </SelectContent>
                </Select>
                {animationStyle === 'Custom' && (
                  <Input
                    value={customAnimationStyle}
                    onChange={(e) => setCustomAnimationStyle(e.target.value)}
                    placeholder="Enter custom animation style..."
                    className="mt-2 bg-background border-border"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color Scheme</label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gradient">🌈 Gradient</SelectItem>
                    <SelectItem value="Solid">⬛ Solid</SelectItem>
                    <SelectItem value="Multi-color">🎨 Multi-color</SelectItem>
                    <SelectItem value="Custom">🎨 Custom</SelectItem>
                  </SelectContent>
                </Select>
                {colorScheme === 'Custom' && (
                  <Input
                    value={customColorScheme}
                    onChange={(e) => setCustomColorScheme(e.target.value)}
                    placeholder="Enter custom color scheme..."
                    className="mt-2 bg-background border-border"
                  />
                )}
              </div>
            </>
          )}
          
          {/* Data Visualizations - Asset Enhancement Mode */}
          {productCategory === "Data Visualizations" && hasAssets && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Enhancement Focus</label>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Highlight Trends">📈 Highlight Trends</SelectItem>
                    <SelectItem value="Add Annotations">📝 Add Annotations</SelectItem>
                    <SelectItem value="Smooth Transitions">✨ Smooth Transitions</SelectItem>
                    <SelectItem value="Enhance Clarity">🔍 Enhance Clarity</SelectItem>
                    <SelectItem value="Custom">🎨 Custom</SelectItem>
                  </SelectContent>
                </Select>
                {chartType === 'Custom' && (
                  <Input
                    value={customChartType}
                    onChange={(e) => setCustomChartType(e.target.value)}
                    placeholder="Enter custom enhancement focus..."
                    className="mt-2 bg-background border-border"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data Emphasis</label>
                <Select value={dataPoints} onValueChange={setDataPoints}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Peak Values">⬆️ Peak Values</SelectItem>
                    <SelectItem value="Comparisons">⚖️ Comparisons</SelectItem>
                    <SelectItem value="Growth Areas">📊 Growth Areas</SelectItem>
                    <SelectItem value="Key Metrics">🎯 Key Metrics</SelectItem>
                    <SelectItem value="Custom">🎨 Custom</SelectItem>
                  </SelectContent>
                </Select>
                {dataPoints === 'Custom' && (
                  <Input
                    value={customDataPoints}
                    onChange={(e) => setCustomDataPoints(e.target.value)}
                    placeholder="Enter custom data emphasis..."
                    className="mt-2 bg-background border-border"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Visual Treatment</label>
                <Select value={animationStyle} onValueChange={setAnimationStyle}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enhance Clarity">🔍 Enhance Clarity</SelectItem>
                    <SelectItem value="Add Depth">📐 Add Depth</SelectItem>
                    <SelectItem value="Modernize Style">✨ Modernize Style</SelectItem>
                    <SelectItem value="Professional Polish">💎 Professional Polish</SelectItem>
                    <SelectItem value="Custom">🎨 Custom</SelectItem>
                  </SelectContent>
                </Select>
                {animationStyle === 'Custom' && (
                  <Input
                    value={customAnimationStyle}
                    onChange={(e) => setCustomAnimationStyle(e.target.value)}
                    placeholder="Enter custom visual treatment..."
                    className="mt-2 bg-background border-border"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Animation Approach</label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Follow Data Flow">🌊 Follow Data Flow</SelectItem>
                    <SelectItem value="Emphasize Key Points">⭐ Emphasize Key Points</SelectItem>
                    <SelectItem value="Smooth Reveal">✨ Smooth Reveal</SelectItem>
                    <SelectItem value="Dynamic Transitions">⚡ Dynamic Transitions</SelectItem>
                    <SelectItem value="Custom">🎨 Custom</SelectItem>
                  </SelectContent>
                </Select>
                {colorScheme === 'Custom' && (
                  <Input
                    value={customColorScheme}
                    onChange={(e) => setCustomColorScheme(e.target.value)}
                    placeholder="Enter custom animation approach..."
                    className="mt-2 bg-background border-border"
                  />
                )}
              </div>
            </>
          )}
          
          {productCategory === "Infographic" && !hasAssets && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Layout Type</label>
                <Select value={layoutType} onValueChange={setLayoutType}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vertical">⬇️ Vertical</SelectItem>
                    <SelectItem value="Horizontal">➡️ Horizontal</SelectItem>
                    <SelectItem value="Circular">⭕ Circular</SelectItem>
                    <SelectItem value="Grid">⊞ Grid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Icon Style</label>
                <Select value={iconStyle} onValueChange={setIconStyle}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Flat">🎨 Flat</SelectItem>
                    <SelectItem value="3D">📦 3D</SelectItem>
                    <SelectItem value="Line">📏 Line</SelectItem>
                    <SelectItem value="Filled">⬛ Filled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Text Emphasis</label>
                <Select value={textEmphasis} onValueChange={setTextEmphasis}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minimal">📝 Minimal</SelectItem>
                    <SelectItem value="Moderate">📄 Moderate</SelectItem>
                    <SelectItem value="Heavy">📚 Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Flow Direction</label>
                <Select value={flowDirection} onValueChange={setFlowDirection}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Top-to-Bottom">⬇️ Top-to-Bottom</SelectItem>
                    <SelectItem value="Left-to-Right">➡️ Left-to-Right</SelectItem>
                    <SelectItem value="Center-Out">💫 Center-Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          {/* Infographic - Asset Enhancement Mode */}
          {productCategory === "Infographic" && hasAssets && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Content Enhancement</label>
                <Select value={layoutType} onValueChange={setLayoutType}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Highlight Key Info">⭐ Highlight Key Info</SelectItem>
                    <SelectItem value="Add Visual Flow">🔄 Add Visual Flow</SelectItem>
                    <SelectItem value="Enhance Readability">📖 Enhance Readability</SelectItem>
                    <SelectItem value="Modernize Design">✨ Modernize Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Icon Treatment</label>
                <Select value={iconStyle} onValueChange={setIconStyle}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Animate Icons">💫 Animate Icons</SelectItem>
                    <SelectItem value="Add Icon Effects">✨ Add Icon Effects</SelectItem>
                    <SelectItem value="Enhance Icons">🎨 Enhance Icons</SelectItem>
                    <SelectItem value="Keep Original">📌 Keep Original</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Text Animation</label>
                <Select value={textEmphasis} onValueChange={setTextEmphasis}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Subtle Fade">🌫️ Subtle Fade</SelectItem>
                    <SelectItem value="Dynamic Reveal">⚡ Dynamic Reveal</SelectItem>
                    <SelectItem value="Highlight Key Words">✨ Highlight Key Words</SelectItem>
                    <SelectItem value="Smooth Transitions">🌊 Smooth Transitions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Flow Enhancement</label>
                <Select value={flowDirection} onValueChange={setFlowDirection}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Guide Eye Flow">👁️ Guide Eye Flow</SelectItem>
                    <SelectItem value="Sequential Reveal">🔢 Sequential Reveal</SelectItem>
                    <SelectItem value="Emphasize Hierarchy">📊 Emphasize Hierarchy</SelectItem>
                    <SelectItem value="Smooth Progression">➡️ Smooth Progression</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          {productCategory === "Logo Animation" && !hasAssets && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Logo Type</label>
                <Select value={logoType} onValueChange={setLogoType}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Text">🔤 Text Only</SelectItem>
                    <SelectItem value="Icon">🎯 Icon Only</SelectItem>
                    <SelectItem value="Combined">✨ Combined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Animation Complexity</label>
                <Select value={animationComplexity} onValueChange={setAnimationComplexity}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Simple">⚪ Simple</SelectItem>
                    <SelectItem value="Moderate">🔵 Moderate</SelectItem>
                    <SelectItem value="Complex">🔴 Complex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Brand Colors</label>
                <Input
                  value={brandColors}
                  onChange={(e) => setBrandColors(e.target.value)}
                  placeholder="e.g., #FF5733, #3498DB"
                  className="bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reveal Style</label>
                <Select value={revealStyle} onValueChange={setRevealStyle}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Build-up">🔨 Build-up</SelectItem>
                    <SelectItem value="Morph">🔄 Morph</SelectItem>
                    <SelectItem value="Particle">💫 Particle</SelectItem>
                    <SelectItem value="Glitch">⚡ Glitch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          {/* Logo Animation - Asset Enhancement Mode */}
          {productCategory === "Logo Animation" && hasAssets && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Animation Style</label>
                <Select value={logoType} onValueChange={setLogoType}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Elegant Reveal">✨ Elegant Reveal</SelectItem>
                    <SelectItem value="Dynamic Entry">⚡ Dynamic Entry</SelectItem>
                    <SelectItem value="Smooth Fade">🌫️ Smooth Fade</SelectItem>
                    <SelectItem value="Bold Impact">💥 Bold Impact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Enhancement Level</label>
                <Select value={animationComplexity} onValueChange={setAnimationComplexity}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Subtle">⚪ Subtle Enhancement</SelectItem>
                    <SelectItem value="Moderate">🔵 Moderate Effects</SelectItem>
                    <SelectItem value="Bold">🔴 Bold Transformation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color Treatment</label>
                <Input
                  value={brandColors}
                  onChange={(e) => setBrandColors(e.target.value)}
                  placeholder="Enhance existing colors"
                  className="bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Motion Effect</label>
                <Select value={revealStyle} onValueChange={setRevealStyle}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Add Glow">✨ Add Glow</SelectItem>
                    <SelectItem value="Add Particles">💫 Add Particles</SelectItem>
                    <SelectItem value="Add Depth">📐 Add Depth</SelectItem>
                    <SelectItem value="Keep Clean">🎯 Keep Clean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          {productCategory === "UI/UX Element" && !hasAssets && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Element Type</label>
                <Select value={elementType} onValueChange={setElementType}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Button">🔘 Button</SelectItem>
                    <SelectItem value="Card">🃏 Card</SelectItem>
                    <SelectItem value="Menu">📱 Menu</SelectItem>
                    <SelectItem value="Modal">🪟 Modal</SelectItem>
                    <SelectItem value="Toggle">🔄 Toggle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Interaction Type</label>
                <Select value={interactionType} onValueChange={setInteractionType}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hover">👆 Hover</SelectItem>
                    <SelectItem value="Click">👇 Click</SelectItem>
                    <SelectItem value="Swipe">👈 Swipe</SelectItem>
                    <SelectItem value="Drag">✊ Drag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State Transitions</label>
                <Select value={stateTransitions} onValueChange={setStateTransitions}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2-state">⚫⚪ 2-state</SelectItem>
                    <SelectItem value="3-state">⚫⚪🔵 3-state</SelectItem>
                    <SelectItem value="Multi-state">🎨 Multi-state</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Micro-interaction Level</label>
                <Select value={microInteractionLevel} onValueChange={setMicroInteractionLevel}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Subtle">🔹 Subtle</SelectItem>
                    <SelectItem value="Noticeable">🔸 Noticeable</SelectItem>
                    <SelectItem value="Bold">🔶 Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          {/* UI/UX Element - Asset Enhancement Mode */}
          {productCategory === "UI/UX Element" && hasAssets && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Interaction Enhancement</label>
                <Select value={elementType} onValueChange={setElementType}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Add Hover Effects">👆 Add Hover Effects</SelectItem>
                    <SelectItem value="Enhance Feedback">✨ Enhance Feedback</SelectItem>
                    <SelectItem value="Smooth Transitions">🌊 Smooth Transitions</SelectItem>
                    <SelectItem value="Modern Polish">💎 Modern Polish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Animation Type</label>
                <Select value={interactionType} onValueChange={setInteractionType}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Micro-interactions">✨ Micro-interactions</SelectItem>
                    <SelectItem value="State Changes">🔄 State Changes</SelectItem>
                    <SelectItem value="Loading States">⏳ Loading States</SelectItem>
                    <SelectItem value="Success Feedback">✅ Success Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Transition Style</label>
                <Select value={stateTransitions} onValueChange={setStateTransitions}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Smooth & Fluid">🌊 Smooth & Fluid</SelectItem>
                    <SelectItem value="Snappy & Quick">⚡ Snappy & Quick</SelectItem>
                    <SelectItem value="Elegant & Slow">✨ Elegant & Slow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Visual Impact</label>
                <Select value={microInteractionLevel} onValueChange={setMicroInteractionLevel}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Subtle">🔹 Subtle</SelectItem>
                    <SelectItem value="Noticeable">🔸 Noticeable</SelectItem>
                    <SelectItem value="Bold">🔶 Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          {productCategory === "Cinematic Videos" && !hasAssets && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Scene Type</label>
                <Select value={sceneType} onValueChange={setSceneType}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indoor">🏠 Indoor</SelectItem>
                    <SelectItem value="Outdoor">🌳 Outdoor</SelectItem>
                    <SelectItem value="Abstract">🎨 Abstract</SelectItem>
                    <SelectItem value="Mixed">🔄 Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mood/Genre</label>
                <Select value={moodGenre} onValueChange={setMoodGenre}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Comedy">😂 Comedy</SelectItem>
                    <SelectItem value="Drama">🎭 Drama</SelectItem>
                    <SelectItem value="Action">💥 Action</SelectItem>
                    <SelectItem value="Documentary">📹 Documentary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pacing</label>
                <Select value={pacing} onValueChange={setPacing}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Slow">🐢 Slow</SelectItem>
                    <SelectItem value="Medium">🚶 Medium</SelectItem>
                    <SelectItem value="Fast">🏃 Fast</SelectItem>
                    <SelectItem value="Dynamic">⚡ Dynamic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Narrative Structure</label>
                <Select value={narrativeStructure} onValueChange={setNarrativeStructure}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Linear">➡️ Linear</SelectItem>
                    <SelectItem value="Non-linear">🔀 Non-linear</SelectItem>
                    <SelectItem value="Montage">🎬 Montage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          {/* Cinematic Videos - Asset Enhancement Mode */}
          {productCategory === "Cinematic Videos" && hasAssets && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Cinematic Enhancement</label>
                <Select value={sceneType} onValueChange={setSceneType}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Color Grading">🎨 Color Grading</SelectItem>
                    <SelectItem value="Add Atmosphere">🌫️ Add Atmosphere</SelectItem>
                    <SelectItem value="Enhance Lighting">💡 Enhance Lighting</SelectItem>
                    <SelectItem value="Add Effects">✨ Add Effects</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mood Enhancement</label>
                <Select value={moodGenre} onValueChange={setMoodGenre}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Amplify Emotion">💫 Amplify Emotion</SelectItem>
                    <SelectItem value="Add Drama">🎭 Add Drama</SelectItem>
                    <SelectItem value="Enhance Energy">⚡ Enhance Energy</SelectItem>
                    <SelectItem value="Keep Natural">🌿 Keep Natural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pacing Adjustment</label>
                <Select value={pacing} onValueChange={setPacing}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Speed Up">🏃 Speed Up</SelectItem>
                    <SelectItem value="Slow Motion">🐢 Slow Motion</SelectItem>
                    <SelectItem value="Keep Original">⏸️ Keep Original</SelectItem>
                    <SelectItem value="Dynamic Timing">⚡ Dynamic Timing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Story Enhancement</label>
                <Select value={narrativeStructure} onValueChange={setNarrativeStructure}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Add Transitions">🔄 Add Transitions</SelectItem>
                    <SelectItem value="Emphasize Key Moments">⭐ Emphasize Key Moments</SelectItem>
                    <SelectItem value="Add Text Overlays">📝 Add Text Overlays</SelectItem>
                    <SelectItem value="Smooth Flow">🌊 Smooth Flow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // Smart defaults based on category selection
  useEffect(() => {
    switch (productCategory) {
      case "Data Visualizations":
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
      case "Cinematic Videos":
        // Cinematic Videos defaults: Epic/Powerful tone, Cinematic style, 12-15s duration, 
        // Urban twilight/Forest dawn environment, Backlit Sunset lighting, All materials,
        // Tracking Pull-Back camera, Slow Motion 120 fps, Emerge reveal, 70% energy,
        // Music driven or Hybrid sound, Cinematic warm mood
        setEmotionalTone("Epic")
        setVisualStyle("Cinematic")
        setDuration([12])
        setEnvironment("Urban twilight")
        setLightingMood("Backlit Sunset")
        setMaterialFocus(["All"])
        setCameraType("Tracking Pull-Back")
        setFrameRate("Slow Motion 120 fps")
        setRevealType("Emerge")
        setCameraEnergy([70])
        setHookIntensity([80])
        setEndEmotion([75])
        setSoundMode("Music driven")
        setSoundMood("Cinematic warm")
        setMixCurve([70])
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
      case "Data Visualizations":
        return "e.g., Stock prices rise as bars grow taller with data flowing"
      case "Infographic":
        return "e.g., Statistics animate into visual elements with smooth transitions"
      case "Logo Animation":
        return "e.g., Logo emerges from particles and settles into final form"
      case "UI/UX Element":
        return "e.g., Interface elements slide and morph into new layouts"
      case "Cinematic Videos":
        return "e.g., Hero walks through dramatic landscape as sun sets behind mountains"
      default:
        return "Describe the key transformation or moment"
    }
  }

  const handleGenerate = async () => {
    // Mode-specific validation
    if (mode === 'none') {
      // No Asset mode - only requires prompt
      if (!prompt.trim()) {
        toast({
          title: "Missing required field",
          description: "Please fill in the Prompt field.",
          variant: "destructive"
        })
        return
      }
    } else if (mode === 'single') {
      // Single Asset mode - requires 1 asset and prompt
      if (uploadedFiles.length < 1) {
        toast({
          title: "Missing asset",
          description: "Please upload an asset (image or video).",
          variant: "destructive"
        })
        return
      }
      if (!prompt.trim()) {
        toast({
          title: "Missing required field",
          description: "Please fill in the Prompt field.",
          variant: "destructive"
        })
        return
      }
    } else if (mode === 'dual') {
      // Dual Asset mode - requires 2 assets and prompts
      if (uploadedFiles.length < 2) {
        toast({
          title: "Missing assets",
          description: `Please upload both assets. You have uploaded ${uploadedFiles.length} of 2.`,
          variant: "destructive"
        })
        return
      }
      if (!assets[0]?.prompt.trim() || !assets[1]?.prompt.trim()) {
        toast({
          title: "Missing required fields",
          description: "Please fill in prompts for both assets.",
          variant: "destructive"
        })
        return
      }
    } else if (mode === 'multi') {
      // Multi Asset mode - requires matching assets and prompts
      if (uploadedFiles.length < assets.length) {
        toast({
          title: "Missing assets",
          description: `Please upload all assets. You have uploaded ${uploadedFiles.length} of ${assets.length}.`,
          variant: "destructive"
        })
        return
      }
      const emptyAssets = assets.filter(asset => !asset.prompt.trim())
      if (emptyAssets.length > 0) {
        toast({
          title: "Missing required fields",
          description: `Please fill in prompts for all ${assets.length} assets.`,
          variant: "destructive"
        })
        return
      }
    }

    setIsGenerating(true)
    
    try {
      // Collect all creative fields
      const allFields = {
        // Mode and Template
        mode: mode,
        template: selectedTemplate !== 'custom' ? selectedTemplate : null,
        custom_template: selectedTemplate === 'custom' && customTemplateInstructions.trim() ? customTemplateInstructions.trim() : null,
        
        // Product Description & Intent Capture
        product_category: productCategory,
        product_name: productName.trim() || null,
        core_moment: coreMoment.trim() || null,
        emotional_tone: emotionalTone === 'Custom' ? customEmotionalTone : emotionalTone,
        visual_style: visualStyle === 'Custom' ? customVisualStyle : visualStyle,
        duration: duration[0],
        
        // Asset data (mode-specific)
        primary_prompt: (mode === 'none' || mode === 'single') ? prompt.trim() : null,
        assets: (mode !== 'none' && mode !== 'single') ? assets : null,
        
        // Visual Context
        environment: environment,
        custom_environment: environment === "Custom" ? customEnvironment.trim() || null : null,
        lighting_mood: lightingMood === 'Custom' ? customLightingMood : lightingMood,
        material_focus: materialFocus,
        camera_type: cameraType === 'Custom' ? customCameraType : cameraType,
        frame_rate: frameRate === 'Custom' ? customFrameRate : frameRate,
        
        // Motion & Energy
        reveal_type: revealType === 'Custom' ? customRevealType : revealType,
        camera_energy: cameraEnergy[0],
        loop_mode: loopMode,
        hook_intensity: hookIntensity[0],
        end_emotion: endEmotion[0],
        
        // Audio DNA
        sound_mode: soundMode === 'Custom' ? customSoundMode : soundMode,
        sound_mood: soundMood === 'Custom' ? customSoundMood : soundMood,
        key_effects: keyEffects,
        mix_curve: mixCurve[0],
        
        // Brand Touch
        accent_color_sync: accentColorSync,
        accent_color: accentColorSync ? accentColor : null,
        logo_moment: logoMoment,
        text_constraint: textConstraint,
        
        // Category-specific fields
        category_specific: {
          // Data Visualizations
          chart_type: productCategory === "Data Visualizations" ? (chartType === 'Custom' ? customChartType : chartType) : null,
          data_points: productCategory === "Data Visualizations" ? (dataPoints === 'Custom' ? customDataPoints : dataPoints) : null,
          animation_style: productCategory === "Data Visualizations" ? (animationStyle === 'Custom' ? customAnimationStyle : animationStyle) : null,
          color_scheme: productCategory === "Data Visualizations" ? (colorScheme === 'Custom' ? customColorScheme : colorScheme) : null,
          
          // Infographic
          layout_type: productCategory === "Infographic" ? layoutType : null,
          icon_style: productCategory === "Infographic" ? iconStyle : null,
          text_emphasis: productCategory === "Infographic" ? textEmphasis : null,
          flow_direction: productCategory === "Infographic" ? flowDirection : null,
          
          // Logo Animation
          logo_type: productCategory === "Logo Animation" ? logoType : null,
          animation_complexity: productCategory === "Logo Animation" ? animationComplexity : null,
          brand_colors: productCategory === "Logo Animation" ? brandColors : null,
          reveal_style: productCategory === "Logo Animation" ? revealStyle : null,
          
          // UI/UX Element
          element_type: productCategory === "UI/UX Element" ? elementType : null,
          interaction_type: productCategory === "UI/UX Element" ? interactionType : null,
          state_transitions: productCategory === "UI/UX Element" ? stateTransitions : null,
          micro_interaction_level: productCategory === "UI/UX Element" ? microInteractionLevel : null,
          
          // Cinematic Videos
          scene_type: productCategory === "Cinematic Videos" ? sceneType : null,
          mood_genre: productCategory === "Cinematic Videos" ? moodGenre : null,
          pacing: productCategory === "Cinematic Videos" ? pacing : null,
          narrative_structure: productCategory === "Cinematic Videos" ? narrativeStructure : null
        },
        
        // Metadata
        projectTitle,
        selectedArtifact
      }

      // Filter to only filled fields
      const filledFields = filterFilledFields(allFields)

      // Prepare data for API
      const motionData = {
        // Mode and Template
        mode: mode,
        template: selectedTemplate !== 'custom' ? selectedTemplate : null,
        custom_template: selectedTemplate === 'custom' && customTemplateInstructions.trim() ? customTemplateInstructions.trim() : null,
        
        // Product Description & Intent Capture
        product_category: productCategory,
        product_name: productName.trim() || null,
        prompt: (mode === 'none' || mode === 'single') ? prompt.trim() : null,
        core_moment: coreMoment.trim() || null,
        emotional_tone: emotionalTone === 'Custom' ? customEmotionalTone : emotionalTone,
        visual_style: visualStyle === 'Custom' ? customVisualStyle : visualStyle,
        duration: duration[0],
        
        // Multi-asset support
        assets: (mode !== 'none' && mode !== 'single') ? assets : null,
        
        // Visual Context
        environment: environment,
        custom_environment: environment === "Custom" ? customEnvironment.trim() || null : null,
        lighting_mood: lightingMood === 'Custom' ? customLightingMood : lightingMood,
        material_focus: materialFocus,
        camera_type: cameraType === 'Custom' ? customCameraType : cameraType,
        frame_rate: frameRate === 'Custom' ? customFrameRate : frameRate,
        
        // Motion & Energy
        reveal_type: revealType === 'Custom' ? customRevealType : revealType,
        camera_energy: cameraEnergy[0],
        loop_mode: loopMode,
        hook_intensity: hookIntensity[0],
        end_emotion: endEmotion[0],
        
        // Audio DNA
        sound_mode: soundMode === 'Custom' ? customSoundMode : soundMode,
        sound_mood: soundMood === 'Custom' ? customSoundMood : soundMood,
        key_effects: keyEffects,
        mix_curve: mixCurve[0],
        
        // Brand Touch
        accent_color_sync: accentColorSync,
        accent_color: accentColorSync ? accentColor : null,
        logo_moment: logoMoment,
        text_constraint: textConstraint,
        
        // Category-specific fields
        category_specific: {
          // Data Visualizations
          chart_type: productCategory === "Data Visualizations" ? (chartType === 'Custom' ? customChartType : chartType) : null,
          data_points: productCategory === "Data Visualizations" ? (dataPoints === 'Custom' ? customDataPoints : dataPoints) : null,
          animation_style: productCategory === "Data Visualizations" ? (animationStyle === 'Custom' ? customAnimationStyle : animationStyle) : null,
          color_scheme: productCategory === "Data Visualizations" ? (colorScheme === 'Custom' ? customColorScheme : colorScheme) : null,
          
          // Infographic
          layout_type: productCategory === "Infographic" ? layoutType : null,
          icon_style: productCategory === "Infographic" ? iconStyle : null,
          text_emphasis: productCategory === "Infographic" ? textEmphasis : null,
          flow_direction: productCategory === "Infographic" ? flowDirection : null,
          
          // Logo Animation
          logo_type: productCategory === "Logo Animation" ? logoType : null,
          animation_complexity: productCategory === "Logo Animation" ? animationComplexity : null,
          brand_colors: productCategory === "Logo Animation" ? brandColors : null,
          reveal_style: productCategory === "Logo Animation" ? revealStyle : null,
          
          // UI/UX Element
          element_type: productCategory === "UI/UX Element" ? elementType : null,
          interaction_type: productCategory === "UI/UX Element" ? interactionType : null,
          state_transitions: productCategory === "UI/UX Element" ? stateTransitions : null,
          micro_interaction_level: productCategory === "UI/UX Element" ? microInteractionLevel : null,
          
          // Cinematic Videos
          scene_type: productCategory === "Cinematic Videos" ? sceneType : null,
          mood_genre: productCategory === "Cinematic Videos" ? moodGenre : null,
          pacing: productCategory === "Cinematic Videos" ? pacing : null,
          narrative_structure: productCategory === "Cinematic Videos" ? narrativeStructure : null
        },
        
        // Cinematic Videos - Characters and Dialog
        characters: productCategory === "Cinematic Videos" ? characters : null,
        dialog_lines: productCategory === "Cinematic Videos" ? dialogLines : null,
        character_count: productCategory === "Cinematic Videos" ? characterCount : null,
        
        // Dual Asset Transition Controls (Phase 2)
        transition_controls: mode === 'dual' ? {
          type: transitionType === 'custom' ? customTransitionType : transitionType,
          duration: transitionDuration[0],
          easing: transitionEasing === 'custom' ? customTransitionEasing : transitionEasing,
          direction: transitionDirection
        } : null,
        
        // Multi Asset Sequence Controls (Phase 2)
        sequence_controls: mode === 'multi' ? {
          style: sequenceStyle === 'custom' ? customSequenceStyle : sequenceStyle,
          global_transition: globalTransition === 'custom' ? customGlobalTransition : globalTransition,
          transition_duration: sceneTransitionDuration[0],
          total_duration: assets.reduce((sum, asset) => sum + (asset.timing || 5), 0)
        } : null,
        
        // Metadata
        projectTitle,
        selectedArtifact
      }

      console.log("Generating Diverse Motion with data:", motionData)

      // Call API to save motion data
      const response = await fetch('/api/diverse-motion', {
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
        title: `Diverse Motion generated successfully!`,
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
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Diverse Motion Studio
              </h2>
              <p className="text-xs text-muted-foreground">
                Transform "{projectTitle}" into cinematic motion
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPresetManager(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Presets
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Centered Content Container */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-4xl border-r border-border overflow-y-auto scrollbar-hover">
              <div className="p-6 space-y-6 max-w-3xl mx-auto">
              
              {/* Mode Selection Tabs */}
              <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-4">
                  <TabsTrigger value="none" className="text-xs py-2 px-1">
                    <span className="truncate">No Asset</span>
                  </TabsTrigger>
                  <TabsTrigger value="single" className="text-xs py-2 px-1">
                    <span className="truncate">Single</span>
                  </TabsTrigger>
                  <TabsTrigger value="dual" className="text-xs py-2 px-1">
                    <span className="truncate">Dual</span>
                  </TabsTrigger>
                  <TabsTrigger value="multi" className="text-xs py-2 px-1">
                    <span className="truncate">Multi</span>
                  </TabsTrigger>
                </TabsList>

                {/* Mode Description Card */}
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 max-w-2xl mx-auto">
                  {mode === 'none' && (
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900">No Asset Mode</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Create pure motion graphics from text descriptions only. Perfect for abstract animations, text-based content, and conceptual visualizations without requiring any image assets.
                        </p>
                      </div>
                    </div>
                  )}
                  {mode === 'single' && (
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900">Single Asset Motion</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Perfect for focused motion graphics, logo animations, and single-element reveals. One primary asset with full creative control.
                        </p>
                      </div>
                    </div>
                  )}
                  {mode === 'dual' && (
                    <div className="flex items-start gap-3">
                      <Film className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900">Dual Asset Control</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Use 2 assets for before/after reveals, comparisons, or smooth transitions. Control timing and transition effects between elements.
                        </p>
                      </div>
                    </div>
                  )}
                  {mode === 'multi' && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900">Multi Asset Sequences</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Up to 3 assets for complex narratives, multi-step tutorials, or product bundles. Full scene sequencing and timing control.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* No Asset Mode */}
                <TabsContent value="none" className="space-y-6 mt-6">
              
              {/* 1️⃣ Content Setup */}
              <Collapsible 
                open={expandedSections.content} 
                onOpenChange={() => toggleSection('content')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-amber-600 dark:text-amber-400">Content Setup</span>
                  </div>
                  {expandedSections.content ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 mt-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium text-purple-600 dark:text-purple-400">
                        📂 Content Category
                      </label>
                      <TooltipIcon content="Choose the type of motion content you want to create. Each category has optimized settings and templates." />
                    </div>
                    <Select value={productCategory} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Data Visualizations">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Data Visualizations
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
                        <SelectItem value="Cinematic Videos">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Cinematic Videos
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
                      🏷️ Product Name (Optional)
                    </label>
                    <Input
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g., Abstract Motion Graphics"
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
                  
                  {/* Template Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                      ⭐ Template (Optional) - Smart Presets
                    </label>
                    <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                      <SelectTrigger className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
                        <SelectValue placeholder="Select a template for smart defaults..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">
                          <div className="flex items-center gap-2">
                            <span>🎨</span>
                            <span className="font-medium">Custom (no template)</span>
                          </div>
                        </SelectItem>
                        {TEMPLATE_MAP[productCategory]?.map((template) => {
                          const preset = TEMPLATE_PRESETS[template.id]
                          return (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{template.icon}</span>
                                <span className="font-medium">{template.name}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    {selectedTemplate !== 'custom' && TEMPLATE_PRESETS[selectedTemplate] && (
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded text-xs">
                        <div className="font-medium text-green-700 dark:text-green-300 mb-1">✨ Auto-configured settings:</div>
                        <div className="text-green-600 dark:text-green-400 space-y-0.5">
                          {TEMPLATE_PRESETS[selectedTemplate].autoConfig.visualStyle && (
                            <div>• Visual Style: {TEMPLATE_PRESETS[selectedTemplate].autoConfig.visualStyle}</div>
                          )}
                          {TEMPLATE_PRESETS[selectedTemplate].autoConfig.emotionalTone && (
                            <div>• Emotional Tone: {TEMPLATE_PRESETS[selectedTemplate].autoConfig.emotionalTone}</div>
                          )}
                          {TEMPLATE_PRESETS[selectedTemplate].autoConfig.cameraEnergy !== undefined && (
                            <div>• Camera Energy: {TEMPLATE_PRESETS[selectedTemplate].autoConfig.cameraEnergy}%</div>
                          )}
                          {TEMPLATE_PRESETS[selectedTemplate].autoConfig.soundMode && (
                            <div>• Sound Mode: {TEMPLATE_PRESETS[selectedTemplate].autoConfig.soundMode}</div>
                          )}
                          {TEMPLATE_PRESETS[selectedTemplate].autoConfig.environment && (
                            <div>• Environment: {TEMPLATE_PRESETS[selectedTemplate].autoConfig.environment}</div>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedTemplate === 'custom' && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Custom Template Instructions
                        </label>
                        <Input
                          value={customTemplateInstructions}
                          onChange={(e) => setCustomTemplateInstructions(e.target.value)}
                          placeholder="Enter your custom template instructions here..."
                          className="bg-background border-border"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Category-Specific Fields */}
                  {renderCategorySpecificFields()}
                  
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
                        <SelectItem value="Custom">🎨 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {emotionalTone === 'Custom' && (
                      <Input
                        value={customEmotionalTone}
                        onChange={(e) => setCustomEmotionalTone(e.target.value)}
                        placeholder="Enter custom emotional tone..."
                        className="mt-2 bg-background border-border"
                      />
                    )}
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
                        <SelectItem value="Custom">🎨 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {visualStyle === 'Custom' && (
                      <Input
                        value={customVisualStyle}
                        onChange={(e) => setCustomVisualStyle(e.target.value)}
                        placeholder="Enter custom visual style..."
                        className="mt-2 bg-background border-border"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-teal-600 dark:text-teal-400 mb-2">
                      ⏱️ Duration: {duration[0]}s
                    </label>
                    <Slider
                      value={duration}
                      onValueChange={setDuration}
                      min={5}
                      max={120}
                      step={5}
                      className="w-full [&_.slider-track]:bg-gradient-to-r [&_.slider-track]:from-teal-200 [&_.slider-track]:to-teal-400 [&_.slider-thumb]:bg-teal-500 [&_.slider-thumb]:border-teal-600"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>5s</span>
                      <span>2 min</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* 2️⃣ Visual Context */}
              <Collapsible 
                open={expandedSections.visual} 
                onOpenChange={() => toggleSection('visual')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-blue-600 dark:text-blue-400">Visual Context</span>
                  </div>
                  {expandedSections.visual ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 mt-6">
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
                        <SelectItem value="Custom">🎨 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {lightingMood === 'Custom' && (
                      <Input
                        value={customLightingMood}
                        onChange={(e) => setCustomLightingMood(e.target.value)}
                        placeholder="Enter custom lighting mood..."
                        className="mt-2 bg-background border-border"
                      />
                    )}
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
                        <SelectItem value="Custom">🎨 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {cameraType === 'Custom' && (
                      <Input
                        value={customCameraType}
                        onChange={(e) => setCustomCameraType(e.target.value)}
                        placeholder="Enter custom camera type..."
                        className="mt-2 bg-background border-border"
                      />
                    )}
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
                        <SelectItem value="Custom">🎨 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {frameRate === 'Custom' && (
                      <Input
                        value={customFrameRate}
                        onChange={(e) => setCustomFrameRate(e.target.value)}
                        placeholder="Enter custom frame rate..."
                        className="mt-2 bg-background border-border"
                      />
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* 3️⃣ Motion & Energy */}
              <Collapsible 
                open={expandedSections.motion} 
                onOpenChange={() => toggleSection('motion')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-red-600 dark:text-red-400">Motion & Energy</span>
                  </div>
                  {expandedSections.motion ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 mt-6">
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
                        <SelectItem value="Custom">🎨 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {revealType === 'Custom' && (
                      <Input
                        value={customRevealType}
                        onChange={(e) => setCustomRevealType(e.target.value)}
                        placeholder="Enter custom reveal type..."
                        className="mt-2 bg-background border-border"
                      />
                    )}
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
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">Audio DNA</span>
                  </div>
                  {expandedSections.audio ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 mt-6">
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
                        <SelectItem value="Custom">🎨 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {soundMode === 'Custom' && (
                      <Input
                        value={customSoundMode}
                        onChange={(e) => setCustomSoundMode(e.target.value)}
                        placeholder="Enter custom sound mode..."
                        className="mt-2 bg-background border-border"
                      />
                    )}
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
                        <SelectItem value="Custom">🎨 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {soundMood === 'Custom' && (
                      <Input
                        value={customSoundMood}
                        onChange={(e) => setCustomSoundMood(e.target.value)}
                        placeholder="Enter custom sound mood..."
                        className="mt-2 bg-background border-border"
                      />
                    )}
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
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-rose-500" />
                    <span className="font-medium text-rose-600 dark:text-rose-400">Brand Touch</span>
                  </div>
                  {expandedSections.brand ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 mt-6">
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
                  {/* Cinematic Videos - Characters */}
                  {productCategory === "Cinematic Videos" && (
                    <Collapsible 
                      open={expandedSections.characters} 
                      onOpenChange={() => toggleSection('characters')}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-500" />
                          <span className="font-medium text-purple-600 dark:text-purple-400">Characters</span>
                        </div>
                        {expandedSections.characters ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-6 mt-6">
                        <div>
                          <label className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                            👥 How many characters? <span className="text-red-500">*</span>
                          </label>
                          <Select value={characterCount.toString()} onValueChange={(value) => setCharacterCount(parseInt(value))}>
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Select number of characters..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 character</SelectItem>
                              <SelectItem value="2">2 characters</SelectItem>
                              <SelectItem value="3">3 characters</SelectItem>
                              <SelectItem value="4">4 characters</SelectItem>
                              <SelectItem value="5">5 characters</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {characters.map((char, index) => (
                          <div key={char.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-purple-700 dark:text-purple-300">
                                Character {index + 1}
                              </h4>
                              {characterCount > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCharacter(char.id)}
                                  className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                                  Name
                                </label>
                                <Input
                                  value={char.name}
                                  onChange={(e) => updateCharacter(char.id, 'name', e.target.value)}
                                  placeholder="Character name (optional)"
                                  className="text-sm"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                                  Description
                                </label>
                                <Textarea
                                  value={char.description}
                                  onChange={(e) => updateCharacter(char.id, 'description', e.target.value)}
                                  placeholder="Describe the character's appearance, personality, or role..."
                                  rows={2}
                                  className="text-sm resize-none"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                                  Art Style: How should this character look?
                                </label>
                                <Select value={char.artStyle} onValueChange={(value) => updateCharacter(char.id, 'artStyle', value)}>
                                  <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="Select art style..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ultra-realistic">📸 Ultra Realistic</SelectItem>
                                    <SelectItem value="realistic">🎭 Realistic</SelectItem>
                                    <SelectItem value="semi-realistic">🎨 Semi-Realistic</SelectItem>
                                    <SelectItem value="anime-manga">🎌 Anime/Manga</SelectItem>
                                    <SelectItem value="comic-book">💥 Comic Book</SelectItem>
                                    <SelectItem value="cartoon">🎪 Cartoon</SelectItem>
                                    <SelectItem value="3d-render">🎮 3D Render</SelectItem>
                                    <SelectItem value="digital-art">🖼️ Digital Art</SelectItem>
                                    <SelectItem value="watercolor">🎨 Watercolor</SelectItem>
                                    <SelectItem value="oil-painting">🖌️ Oil Painting</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                                    Role
                                  </label>
                                  <Select value={char.role} onValueChange={(value) => updateCharacter(char.id, 'role', value)}>
                                    <SelectTrigger className="text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="protagonist">🦸 Protagonist</SelectItem>
                                      <SelectItem value="antagonist">🦹 Antagonist</SelectItem>
                                      <SelectItem value="supporting">👤 Supporting</SelectItem>
                                      <SelectItem value="narrator">🎙️ Narrator</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                                    Gender
                                  </label>
                                  <Select value={char.gender} onValueChange={(value) => updateCharacter(char.id, 'gender', value)}>
                                    <SelectTrigger className="text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="male">Male</SelectItem>
                                      <SelectItem value="female">Female</SelectItem>
                                      <SelectItem value="non-binary">Non-binary</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                                    Age Range
                                  </label>
                                  <Select value={char.ageRange} onValueChange={(value) => updateCharacter(char.id, 'ageRange', value)}>
                                    <SelectTrigger className="text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="child">Child (5-12)</SelectItem>
                                      <SelectItem value="teen">Teen (13-19)</SelectItem>
                                      <SelectItem value="young-adult">Young Adult (20-35)</SelectItem>
                                      <SelectItem value="adult">Adult (36-55)</SelectItem>
                                      <SelectItem value="senior">Senior (56+)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                                    Personality
                                  </label>
                                  <Select value={char.personality} onValueChange={(value) => updateCharacter(char.id, 'personality', value)}>
                                    <SelectTrigger className="text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="friendly">😊 Friendly</SelectItem>
                                      <SelectItem value="serious">😐 Serious</SelectItem>
                                      <SelectItem value="energetic">⚡ Energetic</SelectItem>
                                      <SelectItem value="calm">😌 Calm</SelectItem>
                                      <SelectItem value="mysterious">🕵️ Mysterious</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Cinematic Videos - Dialog/Conversation */}
                  {productCategory === "Cinematic Videos" && (
                    <Collapsible 
                      open={expandedSections.dialog} 
                      onOpenChange={() => toggleSection('dialog')}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-blue-600 dark:text-blue-400">Dialog / Conversation</span>
                        </div>
                        {expandedSections.dialog ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-6 mt-6">
                        {characterCount === 1 ? (
                          // Single character monologue
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div>
                              <label className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                                💬 What does the character say?
                              </label>
                              <Textarea
                                value={dialogLines.length > 0 ? dialogLines[0]?.text || '' : ''}
                                onChange={(e) => {
                                  if (dialogLines.length === 0) {
                                    addDialogLine()
                                  }
                                  updateDialogLine(dialogLines[0]?.id || '', 'text', e.target.value)
                                }}
                                placeholder="Enter the exact words they should speak..."
                                rows={4}
                                className="text-sm resize-none"
                              />
                            </div>
                          </div>
                        ) : (
                          // Multi-character conversation
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                💬 Turn-by-turn conversation
                              </label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={addDialogLine}
                                className="text-xs h-7"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Line
                              </Button>
                            </div>
                            
                            {dialogLines.map((line, index) => (
                              <div key={line.id} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    Line {index + 1}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => moveDialogLine(line.id, 'up')}
                                      disabled={index === 0}
                                      className="h-6 w-6 p-0"
                                    >
                                      <ChevronUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => moveDialogLine(line.id, 'down')}
                                      disabled={index === dialogLines.length - 1}
                                      className="h-6 w-6 p-0"
                                    >
                                      <ChevronDown className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeDialogLine(line.id)}
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <label className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                                      Who speaks?
                                    </label>
                                    <Select 
                                      value={line.characterId} 
                                      onValueChange={(value) => updateDialogLine(line.id, 'characterId', value)}
                                    >
                                      <SelectTrigger className="h-8 text-sm">
                                        <SelectValue placeholder="Select character..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {characters.map((char, idx) => (
                                          <SelectItem key={char.id} value={char.id}>
                                            Character {idx + 1} {char.name && `(${char.name})`}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                                      Expression for this line
                                    </label>
                                    <Select 
                                      value={line.expression} 
                                      onValueChange={(value) => updateDialogLine(line.id, 'expression', value)}
                                    >
                                      <SelectTrigger className="h-8 text-sm">
                                        <SelectValue placeholder="Select expression..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="happy">😊 Happy</SelectItem>
                                        <SelectItem value="serious">😐 Serious</SelectItem>
                                        <SelectItem value="excited">🤩 Excited</SelectItem>
                                        <SelectItem value="angry">😠 Angry</SelectItem>
                                        <SelectItem value="sad">😢 Sad</SelectItem>
                                        <SelectItem value="surprised">😲 Surprised</SelectItem>
                                        <SelectItem value="confident">😎 Confident</SelectItem>
                                        <SelectItem value="worried">😟 Worried</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                                    What do they say?
                                  </label>
                                  <Textarea
                                    value={line.text}
                                    onChange={(e) => updateDialogLine(line.id, 'text', e.target.value)}
                                    placeholder="Enter the dialog for this line..."
                                    rows={3}
                                    className="text-sm resize-none"
                                  />
                                </div>
                              </div>
                            ))}
                            
                            {dialogLines.length === 0 && (
                              <div className="text-center py-6 text-muted-foreground text-sm">
                                Click "Add Line" to start building your conversation
                              </div>
                            )}
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </TabsContent>

                {/* Single Asset Mode */}
                <TabsContent value="single" className="space-y-6 mt-6">
              
              {/* 1️⃣ Content Setup */}
              <Collapsible 
                open={expandedSections.content} 
                onOpenChange={() => toggleSection('content')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-amber-600 dark:text-amber-400">Content Setup</span>
                  </div>
                  {expandedSections.content ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 mt-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium text-purple-600 dark:text-purple-400">
                        📂 Content Category
                      </label>
                      <TooltipIcon content="Choose the type of motion content you want to create. Each category has optimized settings and templates." />
                    </div>
                    <Select value={productCategory} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Data Visualizations">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Data Visualizations
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
                        <SelectItem value="Cinematic Videos">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Cinematic Videos
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
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
                  
                  {/* Asset Upload Section */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                    <label className="block text-sm font-medium text-green-600 dark:text-green-400 mb-3">
                      🖼️ Upload Asset *
                    </label>
                    
                    {uploadedFiles.length === 0 ? (
                      <div className="space-y-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={getAcceptedFileTypes(productCategory)}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="space-y-2">
                          <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingAsset}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          >
                            {isUploadingAsset ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Choose Image or Video
                              </>
                            )}
                          </Button>

                          {/* Conditional API buttons based on category */}
                          {productCategory === "Data Visualizations" && (
                            <>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleOpenChartsAPI} 
                                className="w-full"
                              >
                                <BarChart className="mr-2 h-4 w-4" />
                                Choose from Charts & Infographics API
                              </Button>
                              
                              {showChartsDropdown && (
                                <Select value={selectedChartId} onValueChange={setSelectedChartId}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a chart or infographic..." />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-60">
                                    {loadingCharts ? (
                                      <SelectItem value="loading" disabled>Loading charts...</SelectItem>
                                    ) : availableCharts.length === 0 ? (
                                      <SelectItem value="none" disabled>No charts available</SelectItem>
                                    ) : (
                                      availableCharts.map((chart) => (
                                        <SelectItem key={chart.id} value={chart.id}>
                                          {chart.title || 'Untitled Chart'}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                              )}
                            </>
                          )}

                          {productCategory === "Cinematic Videos" && (
                            <>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleOpenAvatarAPI} 
                                className="w-full"
                              >
                                <Users className="mr-2 h-4 w-4" />
                                Choose from Avatar/Persona APIs
                              </Button>
                              
                              {showAvatarsDropdown && (
                                <Select value={selectedAvatarId} onValueChange={setSelectedAvatarId}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select an avatar or persona..." />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-60">
                                    {loadingAvatars ? (
                                      <SelectItem value="loading" disabled>Loading avatars...</SelectItem>
                                    ) : availableAvatars.length === 0 ? (
                                      <SelectItem value="none" disabled>No avatars available</SelectItem>
                                    ) : (
                                      availableAvatars.map((avatar) => (
                                        <SelectItem key={avatar.id} value={avatar.id}>
                                          {avatar.title || avatar.name || 'Untitled Avatar'}
                                          {avatar.role && ` - ${avatar.role}`}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                              )}
                            </>
                          )}

                          {/* Keep library button for other categories */}
                          {!["Data Visualizations", "Cinematic Videos"].includes(productCategory) && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => handleOpenAssetLibrary('single')} 
                              className="w-full"
                            >
                              <Package className="mr-2 h-4 w-4" />
                              Choose from Library
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 text-center">
                          {getHelpText(productCategory)}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-300">
                        {/* Miniature */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {uploadedFiles[0].type.startsWith('image/') ? (
                            <img 
                              src={assetPreviews[0]} 
                              alt="Asset" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <video 
                              src={assetPreviews[0]} 
                              className="w-full h-full object-cover" 
                            />
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-green-700 truncate">
                            {uploadedFiles[0].name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(uploadedFiles[0].size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        
                        {/* Bouton supprimer */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadedAsset(0)}
                          className="flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Preview for selected chart */}
                  {selectedChartId && selectedChart && uploadedFiles.length === 0 && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                      {/* Image du chart */}
                      {getChartImageUrl(selectedChart) ? (
                        <img 
                          src={getChartImageUrl(selectedChart)} 
                          alt={selectedChart.title}
                          className="w-12 h-12 object-cover rounded-lg border border-border flex-shrink-0"
                          onError={(e) => {
                            console.error('Chart image failed to load:', getChartImageUrl(selectedChart))
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-lg border border-border flex items-center justify-center flex-shrink-0">
                          <BarChart className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-primary text-sm truncate">
                          {selectedChart.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {selectedChart.description || 'Chart/Infographic'}
                        </p>
                      </div>
                      
                      {/* Bouton supprimer */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedChartId("")}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Preview for selected avatar */}
                  {selectedAvatarId && selectedAvatar && uploadedFiles.length === 0 && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                      {/* Image de l'avatar */}
                      {getAvatarImageUrl(selectedAvatar) ? (
                        <img 
                          src={getAvatarImageUrl(selectedAvatar)} 
                          alt={selectedAvatar.title || selectedAvatar.name}
                          className="w-12 h-12 object-cover rounded-lg border border-border flex-shrink-0"
                          onError={(e) => {
                            console.error('Avatar image failed to load:', getAvatarImageUrl(selectedAvatar))
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-lg border border-border flex items-center justify-center flex-shrink-0">
                          <Users className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-primary text-sm truncate">
                          {selectedAvatar.title || selectedAvatar.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {selectedAvatar.description || selectedAvatar.role}
                        </p>
                      </div>
                      
                      {/* Bouton supprimer */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAvatarId("")}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Template Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                      ⭐ Template (Optional) - Smart Presets
                    </label>
                    <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                      <SelectTrigger className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
                        <SelectValue placeholder="Select a template for smart defaults..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">
                          <div className="flex items-center gap-2">
                            <span>🎨</span>
                            <span className="font-medium">Custom (no template)</span>
                          </div>
                        </SelectItem>
                        {TEMPLATE_MAP[productCategory]?.map((template) => {
                          const preset = TEMPLATE_PRESETS[template.id]
                          return (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{template.icon}</span>
                                <span className="font-medium">{template.name}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    {selectedTemplate !== 'custom' && TEMPLATE_PRESETS[selectedTemplate] && (
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded text-xs">
                        <div className="font-medium text-green-700 dark:text-green-300 mb-1">✨ Auto-configured settings:</div>
                        <div className="text-green-600 dark:text-green-400 space-y-0.5">
                          {TEMPLATE_PRESETS[selectedTemplate].autoConfig.visualStyle && (
                            <div>• Visual Style: {TEMPLATE_PRESETS[selectedTemplate].autoConfig.visualStyle}</div>
                          )}
                          {TEMPLATE_PRESETS[selectedTemplate].autoConfig.emotionalTone && (
                            <div>• Emotional Tone: {TEMPLATE_PRESETS[selectedTemplate].autoConfig.emotionalTone}</div>
                          )}
                          {TEMPLATE_PRESETS[selectedTemplate].autoConfig.cameraEnergy !== undefined && (
                            <div>• Camera Energy: {TEMPLATE_PRESETS[selectedTemplate].autoConfig.cameraEnergy}%</div>
                          )}
                          {TEMPLATE_PRESETS[selectedTemplate].autoConfig.soundMode && (
                            <div>• Sound Mode: {TEMPLATE_PRESETS[selectedTemplate].autoConfig.soundMode}</div>
                          )}
                          {TEMPLATE_PRESETS[selectedTemplate].autoConfig.environment && (
                            <div>• Environment: {TEMPLATE_PRESETS[selectedTemplate].autoConfig.environment}</div>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedTemplate === 'custom' && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Custom Template Instructions
                        </label>
                        <Input
                          value={customTemplateInstructions}
                          onChange={(e) => setCustomTemplateInstructions(e.target.value)}
                          placeholder="Enter your custom template instructions here..."
                          className="bg-background border-border"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Category-Specific Fields */}
                  {renderCategorySpecificFields()}
                  
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
                        <SelectItem value="Custom">🎨 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {emotionalTone === 'Custom' && (
                      <Input
                        value={customEmotionalTone}
                        onChange={(e) => setCustomEmotionalTone(e.target.value)}
                        placeholder="Enter custom emotional tone..."
                        className="mt-2 bg-background border-border"
                      />
                    )}
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
                        <SelectItem value="Custom">🎨 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {visualStyle === 'Custom' && (
                      <Input
                        value={customVisualStyle}
                        onChange={(e) => setCustomVisualStyle(e.target.value)}
                        placeholder="Enter custom visual style..."
                        className="mt-2 bg-background border-border"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-teal-600 dark:text-teal-400 mb-2">
                      ⏱️ Duration: {duration[0]}s
                    </label>
                    <Slider
                      value={duration}
                      onValueChange={setDuration}
                      min={5}
                      max={120}
                      step={5}
                      className="w-full [&_.slider-track]:bg-gradient-to-r [&_.slider-track]:from-teal-200 [&_.slider-track]:to-teal-400 [&_.slider-thumb]:bg-teal-500 [&_.slider-thumb]:border-teal-600"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>5s</span>
                      <span>2 min</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* 2️⃣ Visual Context */}
              <Collapsible 
                open={expandedSections.visual} 
                onOpenChange={() => toggleSection('visual')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-blue-600 dark:text-blue-400">Visual Context</span>
                  </div>
                  {expandedSections.visual ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 mt-6">
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
                        <SelectItem value="Custom">🎨 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {lightingMood === 'Custom' && (
                      <Input
                        value={customLightingMood}
                        onChange={(e) => setCustomLightingMood(e.target.value)}
                        placeholder="Enter custom lighting mood..."
                        className="mt-2 bg-background border-border"
                      />
                    )}
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
                        <SelectItem value="Custom">🎨 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {cameraType === 'Custom' && (
                      <Input
                        value={customCameraType}
                        onChange={(e) => setCustomCameraType(e.target.value)}
                        placeholder="Enter custom camera type..."
                        className="mt-2 bg-background border-border"
                      />
                    )}
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
                        <SelectItem value="Custom">🎨 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {frameRate === 'Custom' && (
                      <Input
                        value={customFrameRate}
                        onChange={(e) => setCustomFrameRate(e.target.value)}
                        placeholder="Enter custom frame rate..."
                        className="mt-2 bg-background border-border"
                      />
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* 3️⃣ Motion & Energy */}
              <Collapsible 
                open={expandedSections.motion} 
                onOpenChange={() => toggleSection('motion')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-red-600 dark:text-red-400">Motion & Energy</span>
                  </div>
                  {expandedSections.motion ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 mt-6">
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
                        <SelectItem value="Custom">🎨 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {revealType === 'Custom' && (
                      <Input
                        value={customRevealType}
                        onChange={(e) => setCustomRevealType(e.target.value)}
                        placeholder="Enter custom reveal type..."
                        className="mt-2 bg-background border-border"
                      />
                    )}
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
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">Audio DNA</span>
                  </div>
                  {expandedSections.audio ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 mt-6">
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
                        <SelectItem value="Custom">🎨 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {soundMode === 'Custom' && (
                      <Input
                        value={customSoundMode}
                        onChange={(e) => setCustomSoundMode(e.target.value)}
                        placeholder="Enter custom sound mode..."
                        className="mt-2 bg-background border-border"
                      />
                    )}
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
                        <SelectItem value="Custom">🎨 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {soundMood === 'Custom' && (
                      <Input
                        value={customSoundMood}
                        onChange={(e) => setCustomSoundMood(e.target.value)}
                        placeholder="Enter custom sound mood..."
                        className="mt-2 bg-background border-border"
                      />
                    )}
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
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-rose-500" />
                    <span className="font-medium text-rose-600 dark:text-rose-400">Brand Touch</span>
                  </div>
                  {expandedSections.brand ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 mt-6">
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
                </TabsContent>

                {/* Dual Asset Mode */}
                <TabsContent value="dual" className="space-y-6 mt-6">
                  {/* Content Setup for Dual Mode */}
                  <Collapsible 
                    open={expandedSections.content} 
                    onOpenChange={() => toggleSection('content')}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span className="font-medium text-amber-600 dark:text-amber-400">Content Setup</span>
                      </div>
                      {expandedSections.content ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 mt-6">
                      {/* Category and Template (same as single mode) */}
                      <div>
                        <label className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                          📂 Content Category
                        </label>
                        <Select value={productCategory} onValueChange={handleCategoryChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Data Visualizations">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Data Visualizations
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
                            <SelectItem value="Cinematic Videos">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                Cinematic Videos
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Template Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                          ⭐ Template (Optional)
                        </label>
                        <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a template..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="custom">
                              <div className="flex items-center gap-2">
                                <span>🎨 Custom (no template)</span>
                              </div>
                            </SelectItem>
                            {TEMPLATE_MAP[productCategory]?.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                <div className="flex items-center gap-2">
                                  <span>{template.icon}</span>
                                  <div>
                                    <div className="font-medium">{template.name}</div>
                                    <div className="text-xs text-muted-foreground">{template.description}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedTemplate === 'custom' && (
                          <Input
                            value={customTemplateInstructions}
                            onChange={(e) => setCustomTemplateInstructions(e.target.value)}
                            placeholder="Enter custom template instructions..."
                            className="mt-2 bg-background border-border"
                          />
                        )}
                      </div>
                      
                      {/* Product Name */}
                      <div>
                        <label className="block text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
                          🏷️ Product Name (Optional)
                        </label>
                        <Input
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          placeholder="e.g., 'Nike Air Max', 'iPhone 15 Pro', 'Tesla Model S'"
                          className="text-sm"
                        />
                      </div>
                      
                      {/* Prompt */}
                      <div>
                        <label className="block text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                          ✏️ Prompt <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Describe what you want to create..."
                          rows={4}
                          className="w-full resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          * Only the Prompt field is required. All other fields are optional.
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Dual Asset Management */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Film className="h-5 w-5 text-blue-600" />
                      Dual Asset Setup
                    </h3>
                    
                    {/* Asset 1 */}
                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-blue-900">Asset 1 (Start)</h4>
                        <Badge variant="outline" className="text-blue-600">Primary</Badge>
                      </div>
                      <div className="space-y-3">
                        {/* Upload Asset 1 */}
                        {uploadedFiles.length < 1 ? (
                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-2">
                              Upload Asset 1 *
                            </label>
                            <div className="space-y-2">
                              <Button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingAsset}
                                className="w-full bg-blue-500 hover:bg-blue-600"
                              >
                                {isUploadingAsset ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose Image or Video
                                  </>
                                )}
                              </Button>

                              {/* Conditional API buttons based on category */}
                              {productCategory === "Data Visualizations" && (
                                <>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleOpenChartsAPI} 
                                    className="w-full"
                                  >
                                    <BarChart className="mr-2 h-4 w-4" />
                                    Choose from Charts & Infographics API
                                  </Button>
                                  
                                  {showChartsDropdown && (
                                    <Select value={selectedChartId} onValueChange={setSelectedChartId}>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a chart or infographic..." />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-60">
                                        {loadingCharts ? (
                                          <SelectItem value="loading" disabled>Loading charts...</SelectItem>
                                        ) : availableCharts.length === 0 ? (
                                          <SelectItem value="none" disabled>No charts available</SelectItem>
                                        ) : (
                                          availableCharts.map((chart) => (
                                            <SelectItem key={chart.id} value={chart.id}>
                                              {chart.title || 'Untitled Chart'}
                                            </SelectItem>
                                          ))
                                        )}
                                      </SelectContent>
                                    </Select>
                                  )}
                                </>
                              )}

                              {productCategory === "Cinematic Videos" && (
                                <>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleOpenAvatarAPI} 
                                    className="w-full"
                                  >
                                    <Users className="mr-2 h-4 w-4" />
                                    Choose from Avatar/Persona APIs
                                  </Button>
                                  
                                  {showAvatarsDropdown && (
                                    <Select value={selectedAvatarId} onValueChange={setSelectedAvatarId}>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select an avatar or persona..." />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-60">
                                        {loadingAvatars ? (
                                          <SelectItem value="loading" disabled>Loading avatars...</SelectItem>
                                        ) : availableAvatars.length === 0 ? (
                                          <SelectItem value="none" disabled>No avatars available</SelectItem>
                                        ) : (
                                          availableAvatars.map((avatar) => (
                                            <SelectItem key={avatar.id} value={avatar.id}>
                                              {avatar.title || avatar.name || 'Untitled Avatar'}
                                              {avatar.role && ` - ${avatar.role}`}
                                            </SelectItem>
                                          ))
                                        )}
                                      </SelectContent>
                                    </Select>
                                  )}
                                </>
                              )}

                              {/* Keep library button for other categories */}
                              {!["Data Visualizations", "Cinematic Videos"].includes(productCategory) && (
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => handleOpenAssetLibrary('dual')} 
                                  className="w-full"
                                >
                                  <Package className="mr-2 h-4 w-4" />
                                  Choose from Library
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : uploadedFiles[0] && (
                          <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-300">
                            {/* Miniature */}
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {uploadedFiles[0].type.startsWith('image/') ? (
                                <img 
                                  src={assetPreviews[0]} 
                                  alt="Asset 1" 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <video 
                                  src={assetPreviews[0]} 
                                  className="w-full h-full object-cover" 
                                />
                              )}
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-blue-700 truncate">
                                {uploadedFiles[0].name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(uploadedFiles[0].size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                            
                            {/* Bouton supprimer */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeUploadedAsset(0)}
                              className="flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">
                            Prompt/Description *
                          </label>
                          <Textarea
                            value={assets[0]?.prompt || ''}
                            onChange={(e) => updateAsset(0, { prompt: e.target.value })}
                            placeholder="Describe the first asset or scene..."
                            rows={3}
                            className="resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">
                            Timing (seconds)
                          </label>
                          <Input
                            type="number"
                            value={assets[0]?.timing || 5}
                            onChange={(e) => updateAsset(0, { timing: parseInt(e.target.value) || 5 })}
                            min="1"
                            max="60"
                            className="w-24"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Asset 2 */}
                    <div className="p-4 border border-green-200 rounded-lg bg-green-50/50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-green-900">Asset 2 (End)</h4>
                        <Badge variant="outline" className="text-green-600">Secondary</Badge>
                      </div>
                      <div className="space-y-3">
                        {/* Upload Asset 2 */}
                        {uploadedFiles.length < 2 ? (
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-2">
                              Upload Asset 2 *
                            </label>
                            <div className="space-y-2">
                              <Button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingAsset || uploadedFiles.length < 1}
                                className="w-full bg-green-500 hover:bg-green-600"
                              >
                                {isUploadingAsset ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose Image or Video
                                  </>
                                )}
                              </Button>

                              {/* Conditional API buttons based on category */}
                              {productCategory === "Data Visualizations" && (
                                <>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleOpenChartsAPI} 
                                    className="w-full"
                                    disabled={uploadedFiles.length < 1}
                                  >
                                    <BarChart className="mr-2 h-4 w-4" />
                                    Choose from Charts & Infographics API
                                  </Button>
                                  
                                  {showChartsDropdown && (
                                    <Select value={selectedChartId} onValueChange={setSelectedChartId}>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a chart or infographic..." />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-60">
                                        {loadingCharts ? (
                                          <SelectItem value="loading" disabled>Loading charts...</SelectItem>
                                        ) : availableCharts.length === 0 ? (
                                          <SelectItem value="none" disabled>No charts available</SelectItem>
                                        ) : (
                                          availableCharts.map((chart) => (
                                            <SelectItem key={chart.id} value={chart.id}>
                                              {chart.title || 'Untitled Chart'}
                                            </SelectItem>
                                          ))
                                        )}
                                      </SelectContent>
                                    </Select>
                                  )}
                                </>
                              )}

                              {productCategory === "Cinematic Videos" && (
                                <>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleOpenAvatarAPI} 
                                    className="w-full"
                                    disabled={uploadedFiles.length < 1}
                                  >
                                    <Users className="mr-2 h-4 w-4" />
                                    Choose from Avatar/Persona APIs
                                  </Button>
                                  
                                  {showAvatarsDropdown && (
                                    <Select value={selectedAvatarId} onValueChange={setSelectedAvatarId}>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select an avatar or persona..." />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-60">
                                        {loadingAvatars ? (
                                          <SelectItem value="loading" disabled>Loading avatars...</SelectItem>
                                        ) : availableAvatars.length === 0 ? (
                                          <SelectItem value="none" disabled>No avatars available</SelectItem>
                                        ) : (
                                          availableAvatars.map((avatar) => (
                                            <SelectItem key={avatar.id} value={avatar.id}>
                                              {avatar.title || avatar.name || 'Untitled Avatar'}
                                              {avatar.role && ` - ${avatar.role}`}
                                            </SelectItem>
                                          ))
                                        )}
                                      </SelectContent>
                                    </Select>
                                  )}
                                </>
                              )}

                              {/* Keep library button for other categories */}
                              {!["Data Visualizations", "Cinematic Videos"].includes(productCategory) && (
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => handleOpenAssetLibrary('dual')} 
                                  className="w-full"
                                  disabled={uploadedFiles.length < 1}
                                >
                                  <Package className="mr-2 h-4 w-4" />
                                  Choose from Library
                                </Button>
                              )}
                            </div>
                            {uploadedFiles.length < 1 && (
                              <p className="text-xs text-green-600 mt-1">Upload Asset 1 first</p>
                            )}
                          </div>
                        ) : uploadedFiles[1] && (
                          <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-300">
                            {/* Miniature */}
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {uploadedFiles[1].type.startsWith('image/') ? (
                                <img 
                                  src={assetPreviews[1]} 
                                  alt="Asset 2" 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <video 
                                  src={assetPreviews[1]} 
                                  className="w-full h-full object-cover" 
                                />
                              )}
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-green-700 truncate">
                                {uploadedFiles[1].name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(uploadedFiles[1].size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                            
                            {/* Bouton supprimer */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeUploadedAsset(1)}
                              className="flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-1">
                            Prompt/Description *
                          </label>
                          <Textarea
                            value={assets[1]?.prompt || ''}
                            onChange={(e) => updateAsset(1, { prompt: e.target.value })}
                            placeholder="Describe the second asset or scene..."
                            rows={3}
                            className="resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-1">
                            Timing (seconds)
                          </label>
                          <Input
                            type="number"
                            value={assets[1]?.timing || 5}
                            onChange={(e) => updateAsset(1, { timing: parseInt(e.target.value) || 5 })}
                            min="1"
                            max="60"
                            className="w-24"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Transition Controls */}
                    <div className="p-4 border-2 border-purple-300 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex items-center gap-2 mb-4">
                        <Film className="h-5 w-5 text-purple-600" />
                        <h4 className="font-semibold text-purple-900">Advanced Transition Control</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-purple-700 mb-2">
                              Transition Type
                            </label>
                            <Select value={transitionType} onValueChange={setTransitionType}>
                              <SelectTrigger className="bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="morph">🔄 Morph</SelectItem>
                                <SelectItem value="cut">✂️ Cut</SelectItem>
                                <SelectItem value="fade">✨ Fade</SelectItem>
                                <SelectItem value="slide">📱 Slide</SelectItem>
                                <SelectItem value="zoom">🔍 Zoom</SelectItem>
                                <SelectItem value="blur">🌫️ Blur</SelectItem>
                                <SelectItem value="custom">🎨 Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            {transitionType === 'custom' && (
                              <Input
                                value={customTransitionType}
                                onChange={(e) => setCustomTransitionType(e.target.value)}
                                placeholder="Enter custom transition type..."
                                className="mt-2 bg-white border-border"
                              />
                            )}
                            <p className="text-xs text-purple-600 mt-1">
                              {transitionType === 'morph' && 'Smooth organic blend'}
                              {transitionType === 'cut' && 'Instant switch'}
                              {transitionType === 'fade' && 'Cross dissolve'}
                              {transitionType === 'slide' && 'Directional movement'}
                              {transitionType === 'zoom' && 'Scale transition'}
                              {transitionType === 'blur' && 'Defocus blend'}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-purple-700 mb-2">
                              Easing Curve
                            </label>
                            <Select value={transitionEasing} onValueChange={setTransitionEasing}>
                              <SelectTrigger className="bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="smooth">🌊 Smooth (ease-in-out)</SelectItem>
                                <SelectItem value="linear">➡️ Linear</SelectItem>
                                <SelectItem value="snap">⚡ Snap (ease-out)</SelectItem>
                                <SelectItem value="bounce">🎾 Bounce</SelectItem>
                                <SelectItem value="custom">🎨 Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            {transitionEasing === 'custom' && (
                              <Input
                                value={customTransitionEasing}
                                onChange={(e) => setCustomTransitionEasing(e.target.value)}
                                placeholder="Enter custom easing curve..."
                                className="mt-2 bg-white border-border"
                              />
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-purple-700 mb-2">
                            Duration: {transitionDuration[0].toFixed(1)}s
                          </label>
                          <Slider
                            value={transitionDuration}
                            onValueChange={setTransitionDuration}
                            min={0.3}
                            max={3.0}
                            step={0.1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-purple-600 mt-1">
                            <span>Quick (0.3s)</span>
                            <span>Slow (3.0s)</span>
                          </div>
                        </div>
                        
                        {(transitionType === 'slide' || transitionType === 'zoom') && (
                          <div>
                            <label className="block text-sm font-medium text-purple-700 mb-2">
                              Direction
                            </label>
                            <Select value={transitionDirection} onValueChange={setTransitionDirection}>
                              <SelectTrigger className="bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="forward">➡️ Forward (Left to Right)</SelectItem>
                                <SelectItem value="backward">⬅️ Backward (Right to Left)</SelectItem>
                                <SelectItem value="up">⬆️ Up</SelectItem>
                                <SelectItem value="down">⬇️ Down</SelectItem>
                                {transitionType === 'zoom' && (
                                  <>
                                    <SelectItem value="zoom-in">🔍 Zoom In</SelectItem>
                                    <SelectItem value="zoom-out">🔎 Zoom Out</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        {/* Transition Preview Indicator */}
                        <div className="p-3 bg-white rounded border border-purple-200">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-8 bg-blue-200 rounded flex items-center justify-center text-xs font-medium">
                                A1
                              </div>
                              <div className="flex items-center gap-1 text-purple-600">
                                {transitionType === 'morph' && '🔄'}
                                {transitionType === 'cut' && '✂️'}
                                {transitionType === 'fade' && '✨'}
                                {transitionType === 'slide' && '📱'}
                                {transitionType === 'zoom' && '🔍'}
                                {transitionType === 'blur' && '🌫️'}
                                <span className="text-xs">{transitionDuration[0].toFixed(1)}s</span>
                              </div>
                              <div className="w-12 h-8 bg-green-200 rounded flex items-center justify-center text-xs font-medium">
                                A2
                              </div>
                            </div>
                            <Badge variant="outline" className="text-purple-600">
                              {transitionEasing}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DNA Sections (same as single mode) */}
                  <Collapsible 
                    open={expandedSections.visual} 
                    onOpenChange={() => toggleSection('visual')}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-blue-600 dark:text-blue-400">📸 Visual DNA</span>
                      </div>
                      {expandedSections.visual ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 mt-6">
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
                            <SelectItem value="Custom">🎨 Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {lightingMood === 'Custom' && (
                          <Input
                            value={customLightingMood}
                            onChange={(e) => setCustomLightingMood(e.target.value)}
                            placeholder="Enter custom lighting mood..."
                            className="mt-2 bg-background border-border"
                          />
                        )}
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
                            <SelectItem value="Custom">🎨 Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {cameraType === 'Custom' && (
                          <Input
                            value={customCameraType}
                            onChange={(e) => setCustomCameraType(e.target.value)}
                            placeholder="Enter custom camera type..."
                            className="mt-2 bg-background border-border"
                          />
                        )}
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
                            <SelectItem value="Custom">🎨 Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {frameRate === 'Custom' && (
                          <Input
                            value={customFrameRate}
                            onChange={(e) => setCustomFrameRate(e.target.value)}
                            placeholder="Enter custom frame rate..."
                            className="mt-2 bg-background border-border"
                          />
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 3️⃣ Motion & Energy */}
                  <Collapsible 
                    open={expandedSections.motion} 
                    onOpenChange={() => toggleSection('motion')}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-600 dark:text-red-400">Motion & Energy</span>
                      </div>
                      {expandedSections.motion ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 mt-6">
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
                            <SelectItem value="Custom">🎨 Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {revealType === 'Custom' && (
                          <Input
                            value={customRevealType}
                            onChange={(e) => setCustomRevealType(e.target.value)}
                            placeholder="Enter custom reveal type..."
                            className="mt-2 bg-background border-border"
                          />
                        )}
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
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-indigo-500" />
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">Audio DNA</span>
                      </div>
                      {expandedSections.audio ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 mt-6">
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
                            <SelectItem value="Custom">🎨 Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {soundMode === 'Custom' && (
                          <Input
                            value={customSoundMode}
                            onChange={(e) => setCustomSoundMode(e.target.value)}
                            placeholder="Enter custom sound mode..."
                            className="mt-2 bg-background border-border"
                          />
                        )}
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
                            <SelectItem value="Custom">🎨 Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {soundMood === 'Custom' && (
                          <Input
                            value={customSoundMood}
                            onChange={(e) => setCustomSoundMood(e.target.value)}
                            placeholder="Enter custom sound mood..."
                            className="mt-2 bg-background border-border"
                          />
                        )}
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
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-rose-500" />
                        <span className="font-medium text-rose-600 dark:text-rose-400">Brand Touch</span>
                      </div>
                      {expandedSections.brand ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 mt-6">
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
                </TabsContent>

                {/* Multi Asset Mode */}
                <TabsContent value="multi" className="space-y-6 mt-6">
                  {/* Content Setup for Multi Mode */}
                  <Collapsible 
                    open={expandedSections.content} 
                    onOpenChange={() => toggleSection('content')}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span className="font-medium text-amber-600 dark:text-amber-400">Content Setup</span>
                      </div>
                      {expandedSections.content ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 mt-6">
                      {/* Category and Template (same as other modes) */}
                      <div>
                        <label className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                          📂 Content Category
                        </label>
                        <Select value={productCategory} onValueChange={handleCategoryChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Data Visualizations">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Data Visualizations
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
                            <SelectItem value="Cinematic Videos">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                Cinematic Videos
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Template Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                          ⭐ Template (Optional)
                        </label>
                        <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a template..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="custom">
                              <div className="flex items-center gap-2">
                                <span>🎨 Custom (no template)</span>
                              </div>
                            </SelectItem>
                            {TEMPLATE_MAP[productCategory]?.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                <div className="flex items-center gap-2">
                                  <span>{template.icon}</span>
                                  <div>
                                    <div className="font-medium">{template.name}</div>
                                    <div className="text-xs text-muted-foreground">{template.description}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedTemplate === 'custom' && (
                          <Input
                            value={customTemplateInstructions}
                            onChange={(e) => setCustomTemplateInstructions(e.target.value)}
                            placeholder="Enter custom template instructions..."
                            className="mt-2 bg-background border-border"
                          />
                        )}
                      </div>
                      
                      {/* Product Name */}
                      <div>
                        <label className="block text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
                          🏷️ Product Name (Optional)
                        </label>
                        <Input
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          placeholder="e.g., 'Nike Air Max', 'iPhone 15 Pro', 'Tesla Model S'"
                          className="text-sm"
                        />
                      </div>
                      
                      {/* Prompt */}
                      <div>
                        <label className="block text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                          ✏️ Prompt <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Describe what you want to create..."
                          rows={4}
                          className="w-full resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          * Only the Prompt field is required. All other fields are optional.
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Multi Asset Management */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        Multi Asset Sequence
                      </h3>
                      <Button 
                        onClick={addAsset} 
                        disabled={assets.length >= 3}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Asset
                      </Button>
                    </div>
                    
                    {/* Dynamic Asset List */}
                    {assets.map((asset, index) => (
                      <div key={asset.id} className="p-4 border rounded-lg bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-purple-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-purple-900">Asset {index + 1}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-purple-600">
                              Scene {index + 1}
                            </Badge>
                            {assets.length > 1 && (
                              <Button
                                onClick={() => removeAsset(index)}
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-3">
                          {/* Upload Asset */}
                          {uploadedFiles.length <= index ? (
                            <div>
                              <label className="block text-sm font-medium text-purple-700 mb-2">
                                Upload Asset {index + 1} *
                              </label>
                              <div className="space-y-2">
                                <Button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={isUploadingAsset || (index > 0 && uploadedFiles.length < index)}
                                  className="w-full bg-purple-500 hover:bg-purple-600"
                                >
                                  {isUploadingAsset ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="mr-2 h-4 w-4" />
                                      Choose Image or Video
                                    </>
                                  )}
                                </Button>

                                {/* Conditional API buttons based on category */}
                                {productCategory === "Data Visualizations" && (
                                  <>
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      onClick={handleOpenChartsAPI} 
                                      className="w-full"
                                      disabled={index > 0 && uploadedFiles.length < index}
                                    >
                                      <BarChart className="mr-2 h-4 w-4" />
                                      Choose from Charts & Infographics API
                                    </Button>
                                    
                                    {showChartsDropdown && (
                                      <Select value={selectedChartId} onValueChange={setSelectedChartId}>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select a chart or infographic..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                          {loadingCharts ? (
                                            <SelectItem value="loading" disabled>Loading charts...</SelectItem>
                                          ) : availableCharts.length === 0 ? (
                                            <SelectItem value="none" disabled>No charts available</SelectItem>
                                          ) : (
                                            availableCharts.map((chart) => (
                                              <SelectItem key={chart.id} value={chart.id}>
                                                {chart.title || 'Untitled Chart'}
                                              </SelectItem>
                                            ))
                                          )}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </>
                                )}

                                {productCategory === "Cinematic Videos" && (
                                  <>
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      onClick={handleOpenAvatarAPI} 
                                      className="w-full"
                                      disabled={index > 0 && uploadedFiles.length < index}
                                    >
                                      <Users className="mr-2 h-4 w-4" />
                                      Choose from Avatar/Persona APIs
                                    </Button>
                                    
                                    {showAvatarsDropdown && (
                                      <Select value={selectedAvatarId} onValueChange={setSelectedAvatarId}>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select an avatar or persona..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                          {loadingAvatars ? (
                                            <SelectItem value="loading" disabled>Loading avatars...</SelectItem>
                                          ) : availableAvatars.length === 0 ? (
                                            <SelectItem value="none" disabled>No avatars available</SelectItem>
                                          ) : (
                                            availableAvatars.map((avatar) => (
                                              <SelectItem key={avatar.id} value={avatar.id}>
                                                {avatar.title || avatar.name || 'Untitled Avatar'}
                                                {avatar.role && ` - ${avatar.role}`}
                                              </SelectItem>
                                            ))
                                          )}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </>
                                )}

                                {/* Keep library button for other categories */}
                                {!["Data Visualizations", "Cinematic Videos"].includes(productCategory) && (
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => handleOpenAssetLibrary('multi')} 
                                    className="w-full"
                                    disabled={index > 0 && uploadedFiles.length < index}
                                  >
                                    <Package className="mr-2 h-4 w-4" />
                                    Choose from Library
                                  </Button>
                                )}
                              </div>
                              {index > 0 && uploadedFiles.length < index && (
                                <p className="text-xs text-purple-600 mt-1">Upload previous assets first</p>
                              )}
                            </div>
                          ) : uploadedFiles[index] && (
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-purple-300">
                              {/* Miniature */}
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                {uploadedFiles[index].type.startsWith('image/') ? (
                                  <img 
                                    src={assetPreviews[index]} 
                                    alt={`Asset ${index + 1}`} 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <video 
                                    src={assetPreviews[index]} 
                                    className="w-full h-full object-cover" 
                                  />
                                )}
                              </div>
                              
                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-purple-700 truncate">
                                  {uploadedFiles[index].name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(uploadedFiles[index].size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                              
                              {/* Bouton supprimer */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeUploadedAsset(index)}
                                className="flex-shrink-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          
                          <div>
                            <label className="block text-sm font-medium text-purple-700 mb-1">
                              Prompt/Description *
                            </label>
                            <Textarea
                              value={asset.prompt}
                              onChange={(e) => updateAsset(index, { prompt: e.target.value })}
                              placeholder={`Describe asset ${index + 1} or scene...`}
                              rows={3}
                              className="resize-none"
                            />
                          </div>
                          <div className="flex gap-4">
                            <div>
                              <label className="block text-sm font-medium text-purple-700 mb-1">
                                Timing (seconds)
                              </label>
                              <Input
                                type="number"
                                value={asset.timing || 5}
                                onChange={(e) => updateAsset(index, { timing: parseInt(e.target.value) || 5 })}
                                min="1"
                                max="60"
                                className="w-24"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-purple-700 mb-1">
                                Scene Order
                              </label>
                              <Badge variant="secondary" className="text-purple-600">
                                {index === 0 ? 'Opening' : index === assets.length - 1 ? 'Closing' : 'Middle'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Enhanced Sequence Controls */}
                    <div className="p-4 border-2 border-orange-300 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="h-5 w-5 text-orange-600" />
                        <h4 className="font-semibold text-orange-900">Advanced Sequence Control</h4>
                      </div>
                      <div className="space-y-4">
                        {/* Visual Timeline */}
                        <div className="p-3 bg-white rounded-lg border border-orange-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-orange-700">Visual Timeline</span>
                            <Badge variant="secondary" className="text-orange-600">
                              Total: {assets.reduce((sum, asset) => sum + (asset.timing || 5), 0)}s
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            {assets.map((asset, index) => {
                              const totalDuration = assets.reduce((sum, a) => sum + (a.timing || 5), 0)
                              const width = ((asset.timing || 5) / totalDuration) * 100
                              const colors = ['bg-blue-400', 'bg-green-400', 'bg-purple-400']
                              return (
                                <div
                                  key={asset.id}
                                  className={`${colors[index % 3]} rounded h-8 flex items-center justify-center text-xs font-medium text-white transition-all`}
                                  style={{ width: `${width}%` }}
                                  title={`Asset ${index + 1}: ${asset.timing}s`}
                                >
                                  {asset.timing}s
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-orange-700 mb-2">
                              Sequence Style
                            </label>
                            <Select value={sequenceStyle} onValueChange={setSequenceStyle}>
                              <SelectTrigger className="bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sequential">📖 Sequential</SelectItem>
                                <SelectItem value="overlapping">🔄 Overlapping</SelectItem>
                                <SelectItem value="staggered">⚡ Staggered</SelectItem>
                                <SelectItem value="synchronized">🎯 Synchronized</SelectItem>
                                <SelectItem value="custom">🎨 Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            {sequenceStyle === 'custom' && (
                              <Input
                                value={customSequenceStyle}
                                onChange={(e) => setCustomSequenceStyle(e.target.value)}
                                placeholder="Enter custom sequence style..."
                                className="mt-2 bg-white border-border"
                              />
                            )}
                            <p className="text-xs text-orange-600 mt-1">
                              {sequenceStyle === 'sequential' && 'One after another'}
                              {sequenceStyle === 'overlapping' && 'Blend between scenes'}
                              {sequenceStyle === 'staggered' && 'Offset timing'}
                              {sequenceStyle === 'synchronized' && 'Parallel elements'}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-orange-700 mb-2">
                              Global Transition
                            </label>
                            <Select value={globalTransition} onValueChange={setGlobalTransition}>
                              <SelectTrigger className="bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fade">✨ Fade</SelectItem>
                                <SelectItem value="cut">✂️ Cut</SelectItem>
                                <SelectItem value="slide">📱 Slide</SelectItem>
                                <SelectItem value="zoom">🔍 Zoom</SelectItem>
                                <SelectItem value="wipe">🌊 Wipe</SelectItem>
                                <SelectItem value="custom">🎨 Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            {globalTransition === 'custom' && (
                              <Input
                                value={customGlobalTransition}
                                onChange={(e) => setCustomGlobalTransition(e.target.value)}
                                placeholder="Enter custom global transition..."
                                className="mt-2 bg-white border-border"
                              />
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-orange-700 mb-2">
                            Transition Duration: {sceneTransitionDuration[0].toFixed(1)}s
                          </label>
                          <Slider
                            value={sceneTransitionDuration}
                            onValueChange={setSceneTransitionDuration}
                            min={0.2}
                            max={2.0}
                            step={0.1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-orange-600 mt-1">
                            <span>Quick (0.2s)</span>
                            <span>Slow (2.0s)</span>
                          </div>
                        </div>
                        
                        {/* Scene Flow Preview */}
                        <div className="p-3 bg-white rounded border border-orange-200">
                          <div className="text-xs font-medium text-orange-700 mb-2">Scene Flow Preview</div>
                          <div className="flex items-center gap-1 text-xs">
                            {assets.map((asset, index) => (
                              <React.Fragment key={asset.id}>
                                <div className="px-2 py-1 bg-orange-100 rounded font-medium">
                                  S{index + 1}
                                </div>
                                {index < assets.length - 1 && (
                                  <div className="text-orange-400">
                                    {globalTransition === 'fade' && '✨'}
                                    {globalTransition === 'cut' && '✂️'}
                                    {globalTransition === 'slide' && '📱'}
                                    {globalTransition === 'zoom' && '🔍'}
                                    {globalTransition === 'wipe' && '🌊'}
                                  </div>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                        
                        {/* Pacing Control */}
                        <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded border border-amber-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-amber-700">Pacing Analysis</div>
                              <div className="text-xs text-amber-600 mt-1">
                                {assets.length} scenes • {sequenceStyle} flow • {globalTransition} transitions
                              </div>
                            </div>
                            <Badge variant="outline" className="text-amber-600">
                              {assets.length <= 2 ? 'Simple' : assets.length === 3 ? 'Balanced' : 'Complex'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2️⃣ Visual DNA */}
                  <Collapsible 
                    open={expandedSections.visual} 
                    onOpenChange={() => toggleSection('visual')}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-blue-600 dark:text-blue-400">📸 Visual DNA</span>
                      </div>
                      {expandedSections.visual ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 mt-6">
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
                            <SelectItem value="Custom">🎨 Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {lightingMood === 'Custom' && (
                          <Input
                            value={customLightingMood}
                            onChange={(e) => setCustomLightingMood(e.target.value)}
                            placeholder="Enter custom lighting mood..."
                            className="mt-2 bg-background border-border"
                          />
                        )}
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
                            <SelectItem value="Custom">🎨 Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {cameraType === 'Custom' && (
                          <Input
                            value={customCameraType}
                            onChange={(e) => setCustomCameraType(e.target.value)}
                            placeholder="Enter custom camera type..."
                            className="mt-2 bg-background border-border"
                          />
                        )}
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
                            <SelectItem value="Custom">🎨 Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {frameRate === 'Custom' && (
                          <Input
                            value={customFrameRate}
                            onChange={(e) => setCustomFrameRate(e.target.value)}
                            placeholder="Enter custom frame rate..."
                            className="mt-2 bg-background border-border"
                          />
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 3️⃣ Motion & Energy */}
                  <Collapsible 
                    open={expandedSections.motion} 
                    onOpenChange={() => toggleSection('motion')}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-600 dark:text-red-400">Motion & Energy</span>
                      </div>
                      {expandedSections.motion ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 mt-6">
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
                            <SelectItem value="Custom">🎨 Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {revealType === 'Custom' && (
                          <Input
                            value={customRevealType}
                            onChange={(e) => setCustomRevealType(e.target.value)}
                            placeholder="Enter custom reveal type..."
                            className="mt-2 bg-background border-border"
                          />
                        )}
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
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-indigo-500" />
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">Audio DNA</span>
                      </div>
                      {expandedSections.audio ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 mt-6">
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
                            <SelectItem value="Custom">🎨 Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {soundMode === 'Custom' && (
                          <Input
                            value={customSoundMode}
                            onChange={(e) => setCustomSoundMode(e.target.value)}
                            placeholder="Enter custom sound mode..."
                            className="mt-2 bg-background border-border"
                          />
                        )}
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
                            <SelectItem value="Custom">🎨 Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {soundMood === 'Custom' && (
                          <Input
                            value={customSoundMood}
                            onChange={(e) => setCustomSoundMood(e.target.value)}
                            placeholder="Enter custom sound mood..."
                            className="mt-2 bg-background border-border"
                          />
                        )}
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
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-rose-500" />
                        <span className="font-medium text-rose-600 dark:text-rose-400">Brand Touch</span>
                      </div>
                      {expandedSections.brand ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 mt-6">
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
                </TabsContent>
              </Tabs>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview & Hints */}
          <div className="w-80 border-l border-border overflow-y-auto scrollbar-hover">
            <div className="p-6">
              {/* Preview Toggle */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {showPreview ? '🎬 Live Preview' : '💡 Smart Hints'}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs"
                >
                  {showPreview ? 'Show Hints' : 'Show Preview'}
                </Button>
              </div>
              
              {showPreview ? (
                /* Preview Panel */
                <div className="space-y-4">
                  {previewAssets.length > 0 ? (
                    <DiverseMotionPreview
                      assets={previewAssets}
                      transitions={previewTransitions}
                      totalDuration={assets.reduce((sum, asset) => sum + (asset.timing || 5), 0) || duration[0]}
                      isPlaying={previewPlaying}
                      currentTime={previewTime}
                      onTimeChange={setPreviewTime}
                      onPlayPause={handlePreviewPlayPause}
                      onSeek={handlePreviewSeek}
                      onExport={handlePreviewExport}
                      onFullscreen={handlePreviewFullscreen}
                      className="w-full"
                    />
                  ) : (
                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                      <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Preview will appear here
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Add assets and configure settings to see a live preview
                      </p>
                    </div>
                  )}
                  
                  {/* Preview Controls */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm text-blue-700 dark:text-blue-300">Preview Settings</span>
                    </div>
                    <div className="space-y-2 text-xs text-blue-600 dark:text-blue-400">
                      <div>• Real-time updates as you change settings</div>
                      <div>• Interactive timeline with seek controls</div>
                      <div>• Export preview as GIF (coming soon)</div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Smart Hints Panel */
                <div className="space-y-4">
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Lighting Tip</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      🔥 Add vapor accent for cinematic depth?
                    </p>
                  </div>
                  
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Camera className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Camera Suggestion</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      🎞️ Try low-angle macro for premium feel?
                    </p>
                  </div>
                  
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Music className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Audio Enhancement</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      🎶 Let's match rhythm to logo morph—enable pulse sync?
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm text-green-700 dark:text-green-300">Live Preview</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Toggle to preview mode to see your motion graphics in real-time as you make changes.
                    </p>
                  </div>
                </div>
              )}
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


      {/* Asset Library Modal */}
      <AssetLibraryModal
        isOpen={showAssetLibrary}
        onClose={() => setShowAssetLibrary(false)}
        onSelectAssets={handleSelectFromLibrary}
        multiSelect={librarySelectionMode === 'multi'}
        maxSelection={librarySelectionMode === 'multi' ? 10 : 1}
      />

      {/* Preset Manager Modal */}
      <PresetManager
        isOpen={showPresetManager}
        onClose={() => setShowPresetManager(false)}
        onLoadPreset={handleLoadPreset}
        currentSettings={{
          visualStyle,
          emotionalTone,
          cameraEnergy: cameraEnergy[0],
          soundMode,
          soundMood,
          environment,
          revealType,
          loopMode,
          transitionType,
          transitionDuration: transitionDuration[0],
          transitionEasing,
          transitionDirection,
          sequenceStyle,
          globalTransition,
          sceneTransitionDuration: sceneTransitionDuration[0]
        }}
        currentCategory={productCategory}
      />
    </div>
  )
}

