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
  Plus,
  Minus,
  Loader2,
  Download,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { filterFilledFields } from "@/lib/utils/prompt-builder"
import { PreviousGenerations } from "@/components/ui/previous-generations"

interface UGCAdsGeneratorInterfaceProps {
  onClose: () => void
  projectTitle: string
}

// Smart DNA Types
interface BrandDNA {
  name: string
  prompt?: string
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
  const { user } = useAuth()
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
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  
  // Product Source State
  const [useCustomProduct, setUseCustomProduct] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [customProductFile, setCustomProductFile] = useState<File | null>(null)
  const [customProductPreview, setCustomProductPreview] = useState<string | null>(null)

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    brandContext: true,
    productEssence: true,
    creativeAngle: false,
    dialogue: false,
    sound: false,
    camera: false
  })


  // Load available products
  const loadAvailableProducts = async () => {
    setLoadingProducts(true)
    try {
      const response = await fetch('/api/product-mockups')
      console.log('📦 API Response status:', response.status)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        console.log('📦 Content-Type:', contentType)
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          console.log('📦 Products loaded:', data)
          setAvailableProducts(data.productMockups || [])
        } else {
          console.error('❌ Response is not JSON, might be HTML (auth issue)')
          setAvailableProducts([])
        }
      } else {
        console.error('❌ Failed to load products:', response.status, response.statusText)
        setAvailableProducts([])
      }
    } catch (error) {
      console.error('❌ Error loading products:', error)
      setAvailableProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  // Load products on component mount
  useEffect(() => {
    loadAvailableProducts()
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

  // Handle custom product file upload
  const handleCustomProductUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCustomProductFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCustomProductPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
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
    if (!config.brandDNA.name || !config.brandDNA.prompt) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in Brand Name and Prompt.",
        variant: "destructive"
      })
      return
    }

    // Check product source
    if (!useCustomProduct && !selectedProductId) {
      toast({
        title: "Product Source Required",
        description: "Please select a product or upload a custom image.",
        variant: "destructive"
      })
      return
    }

    if (useCustomProduct && !customProductFile) {
      toast({
        title: "Custom Image Required",
        description: "Please upload a custom product image.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    
    try {
      // Generate JSON output first
      generateJSON()
      
      // Collect all creative fields
      const allFields = {
        // Brand DNA
        brand_name: config.brandDNA.name,
        brand_tone: config.brandDNA.tone,
        brand_color_code: config.brandDNA.colorCode,
        brand_logo: config.brandDNA.logo,
        
        // Product Essence
        product_name: config.productEssence.name,
        product_hero_benefit: config.productEssence.heroBenefit,
        product_visual_focus: config.productEssence.visualFocus,
        product_environment: config.productEssence.environment,
        product_materials: config.productEssence.materials,
        product_transformation_type: config.productEssence.transformationType,
        
        // Story DNA
        story_core_angle: config.storyDNA.coreAngle,
        story_persona: config.storyDNA.persona,
        story_emotion_tone: config.storyDNA.emotionTone,
        story_pattern_interrupt_type: config.storyDNA.patternInterruptType,
        story_hook_framework: config.storyDNA.hookFramework,
        
        // Dialogue DNA
        dialogue_voice_type: config.dialogueDNA.voiceType,
        dialogue_script: config.dialogueDNA.script,
        dialogue_tone_of_voice: config.dialogueDNA.toneOfVoice,
        dialogue_language: config.dialogueDNA.language,
        dialogue_voice_asset_source: config.dialogueDNA.voiceAssetSource,
        
        // Camera DNA
        camera_rhythm: config.cameraDNA.rhythm,
        camera_movement_style: config.cameraDNA.movementStyle,
        camera_cut_frequency: config.cameraDNA.cutFrequency,
        camera_ending_type: config.cameraDNA.endingType,
        
        // Audio DNA
        audio_sound_mode: config.audioDNA.soundMode,
        audio_sound_emotion: config.audioDNA.soundEmotion,
        audio_key_sounds: config.audioDNA.keySounds,
        
        // Product Source
        use_custom_product: useCustomProduct,
        selected_product_id: selectedProductId,
        custom_product_image: customProductFile,
        generated_json: generatedJSON
      }

      // Filter to only filled fields
      const filledFields = filterFilledFields(allFields)

      // Create FormData for API call
      const formData = new FormData()
      
      // Add original prompt
      formData.append('brand_prompt', config.brandDNA.prompt || '')
      
      // Brand DNA
      formData.append('brand_name', config.brandDNA.name)
      if (config.brandDNA.tone) formData.append('brand_tone', config.brandDNA.tone)
      if (config.brandDNA.colorCode) formData.append('brand_color_code', config.brandDNA.colorCode)
      if (config.brandDNA.logo) formData.append('brand_logo', config.brandDNA.logo)
      
      // Product Essence
      if (config.productEssence.name) formData.append('product_name', config.productEssence.name)
      if (config.productEssence.heroBenefit) formData.append('product_hero_benefit', config.productEssence.heroBenefit)
      if (config.productEssence.visualFocus) formData.append('product_visual_focus', config.productEssence.visualFocus)
      if (config.productEssence.environment) formData.append('product_environment', config.productEssence.environment)
      if (config.productEssence.materials.length > 0) formData.append('product_materials', JSON.stringify(config.productEssence.materials))
      if (config.productEssence.transformationType) formData.append('product_transformation_type', config.productEssence.transformationType)
      
      // Story DNA
      if (config.storyDNA.coreAngle) formData.append('story_core_angle', config.storyDNA.coreAngle)
      if (config.storyDNA.persona) formData.append('story_persona', config.storyDNA.persona)
      formData.append('story_emotion_tone', config.storyDNA.emotionTone.toString())
      if (config.storyDNA.patternInterruptType) formData.append('story_pattern_interrupt_type', config.storyDNA.patternInterruptType)
      if (config.storyDNA.hookFramework) formData.append('story_hook_framework', config.storyDNA.hookFramework)
      
      // Dialogue DNA
      if (config.dialogueDNA.voiceType) formData.append('dialogue_voice_type', config.dialogueDNA.voiceType)
      if (config.dialogueDNA.script) formData.append('dialogue_script', config.dialogueDNA.script)
      if (config.dialogueDNA.toneOfVoice) formData.append('dialogue_tone_of_voice', config.dialogueDNA.toneOfVoice)
      if (config.dialogueDNA.language) formData.append('dialogue_language', config.dialogueDNA.language)
      if (config.dialogueDNA.voiceAssetSource) formData.append('dialogue_voice_asset_source', config.dialogueDNA.voiceAssetSource)
      
      // Camera DNA
      if (config.cameraDNA.rhythm) formData.append('camera_rhythm', config.cameraDNA.rhythm)
      if (config.cameraDNA.movementStyle) formData.append('camera_movement_style', config.cameraDNA.movementStyle)
      if (config.cameraDNA.cutFrequency) formData.append('camera_cut_frequency', config.cameraDNA.cutFrequency)
      if (config.cameraDNA.endingType) formData.append('camera_ending_type', config.cameraDNA.endingType)
      
      // Audio DNA
      if (config.audioDNA.soundMode) formData.append('audio_sound_mode', config.audioDNA.soundMode)
      if (config.audioDNA.soundEmotion) formData.append('audio_sound_emotion', config.audioDNA.soundEmotion)
      if (config.audioDNA.keySounds.length > 0) formData.append('audio_key_sounds', JSON.stringify(config.audioDNA.keySounds))
      
      // Product Source
      formData.append('use_custom_product', useCustomProduct.toString())
      if (selectedProductId) formData.append('selected_product_id', selectedProductId)
      if (customProductFile) formData.append('custom_product_image', customProductFile)
      
      // Generated JSON
      if (generatedJSON) formData.append('generated_json', generatedJSON)
      
      // Call API
      const response = await fetch('/api/ugc-ads', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate UGC ad')
      }
      
      const result = await response.json()
      
      // Simulate generated video for display
      setGeneratedVideo("https://example.com/generated-video.mp4")
      
      toast({
        title: "UGC Ad Generated!",
        description: "Your UGC ad has been successfully generated and saved.",
      })
      
    } catch (error) {
      console.error('Error generating UGC ad:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }


  const isDialogueVisible = config.storyDNA.persona !== "silent visual story"

  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-6 max-h-[80vh] overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-hover space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎬 UGC Ads Generator
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
      <div className="space-y-4">
        <Collapsible 
          open={expandedSections.brandContext} 
          onOpenChange={() => toggleSection('brandContext')}
        >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Brand Context</span>
            </div>
            {expandedSections.brandContext ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-blue-600 dark:text-blue-400">🏷️ Brand Name</label>
            <Input
              value={config.brandDNA.name}
              onChange={(e) => updateConfig('brandDNA', 'name', e.target.value)}
              placeholder="SMEG, LEGO, DreamCut Beauty"
              className="text-xs h-8"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-green-600 dark:text-green-400">✏️ Prompt</label>
            <Textarea
              value={config.brandDNA.prompt || ""}
              onChange={(e) => updateConfig('brandDNA', 'prompt', e.target.value)}
              placeholder="Describe your UGC ad concept..."
              className="min-h-[60px] text-xs resize-none"
            />
          </div>
          
          {/* Product Source Section */}
          <div className="space-y-3 p-3 bg-gradient-to-r from-indigo-50/30 to-purple-50/30 dark:from-indigo-950/10 dark:to-purple-950/10 rounded-md border border-indigo-200/30 dark:border-indigo-800/30">
            <label className="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              📦 Product Source
              <span className="text-xs text-muted-foreground">*</span>
            </label>
            
            {/* Source Selection Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 px-3 text-xs font-medium transition-all duration-200 flex-1 ${
                  !useCustomProduct 
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 shadow-sm' 
                    : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setUseCustomProduct(false)}
              >
                <Target className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Use Product</span>
                <span className="sm:hidden">Product</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 px-3 text-xs font-medium transition-all duration-200 flex-1 ${
                  useCustomProduct 
                    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 shadow-sm' 
                    : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setUseCustomProduct(true)}
              >
                <Upload className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Upload Image</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            </div>

            {/* Product Selection */}
            {!useCustomProduct ? (
              <div className="space-y-2">
                <div className="relative">
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="w-full h-8 text-xs bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 focus:border-indigo-400 dark:focus:border-indigo-600 transition-colors">
                      <SelectValue placeholder={loadingProducts ? "🔄 Loading..." : "📦 Select product"}>
                        {selectedProductId && (() => {
                          const selectedProduct = availableProducts.find(p => p.id === selectedProductId)
                          if (selectedProduct) {
                            const productImage = selectedProduct.content?.images?.[0] || selectedProduct.image || null
                            return (
                              <div className="flex items-center gap-2 w-full">
                                <div className="w-5 h-5 rounded-sm overflow-hidden bg-muted flex-shrink-0">
                                  {productImage ? (
                                    <img 
                                      src={productImage} 
                                      alt={selectedProduct.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50">
                                      <span className="text-xs">📦</span>
                                    </div>
                                  )}
                                </div>
                                <span className="truncate">{selectedProduct.title}</span>
                              </div>
                            )
                          }
                          return "📦 Select product"
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {availableProducts.length > 0 ? (
                        availableProducts.map((product) => {
                          // Extract image from content.images or use a default
                          const productImage = product.content?.images?.[0] || product.image || null
                          return (
                            <SelectItem key={product.id} value={product.id} className="text-xs py-2">
                              <div className="flex items-center gap-3 w-full">
                                <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                  {productImage ? (
                                    <img 
                                      src={productImage} 
                                      alt={product.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50">
                                      <span className="text-xs">📦</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="font-medium truncate">{product.title}</span>
                                  {product.description && (
                                    <span className="text-xs text-muted-foreground truncate">
                                      {product.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          )
                        })
                      ) : (
                        <SelectItem value="no-products" disabled className="text-xs py-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span>📭</span>
                            No products available
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {loadingProducts && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
                    </div>
                  )}
                </div>
                
                {availableProducts.length === 0 && !loadingProducts && (
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded text-xs">
                    <p className="text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <span>💡</span>
                      No products found in your library. Try uploading a custom image instead.
                    </p>
                  </div>
                )}
                
              </div>
            ) : (
              <div className="space-y-2">
                {/* Upload Area */}
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCustomProductUpload}
                    className="hidden"
                  />
                  
                  {!customProductFile ? (
                    <div 
                      className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-md p-3 text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors bg-purple-50/30 dark:bg-purple-950/10"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                          <Upload className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
                            Click to upload
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 dark:text-green-400">📁</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-green-700 dark:text-green-300 truncate">
                              {customProductFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(customProductFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50"
                          onClick={() => {
                            setCustomProductFile(null)
                            setCustomProductPreview(null)
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ''
                            }
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {customProductPreview && (
                        <div className="relative w-full h-20 border border-purple-200 dark:border-purple-800 rounded-md overflow-hidden bg-white dark:bg-gray-900">
                          <img
                            src={customProductPreview}
                            alt="Product preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 left-1 right-1">
                            <p className="text-xs text-white font-medium bg-black/50 backdrop-blur-sm rounded px-1 py-0.5">
                              Preview
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {!customProductFile && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
                    <p className="text-blue-700 dark:text-blue-300 flex items-center gap-1">
                      <span>💡</span>
                      Upload high-quality image for best results
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-purple-600 dark:text-purple-400">🎨 Tone of Brand</label>
            <Select value={config.brandDNA.tone} onValueChange={(value) => updateConfig('brandDNA', 'tone', value)}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Select brand tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Modern" className="text-xs">🏢 Modern</SelectItem>
                <SelectItem value="Playful" className="text-xs">🎮 Playful</SelectItem>
                <SelectItem value="Luxury" className="text-xs">💎 Luxury</SelectItem>
                <SelectItem value="Techy" className="text-xs">⚡ Techy</SelectItem>
                <SelectItem value="Wholesome" className="text-xs">🌱 Wholesome</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
        </CollapsibleContent>
        </Collapsible>
      </div>

      {/* 2️⃣ Product Essence */}
      <div className="space-y-4">
        <Collapsible 
          open={expandedSections.productEssence} 
          onOpenChange={() => toggleSection('productEssence')}
        >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Product Essence</span>
            </div>
            {expandedSections.productEssence ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          
           <div className="space-y-2">
             <label className="text-xs font-medium text-orange-600 dark:text-orange-400">⭐ Hero Benefit / Moment</label>
             <div className="space-y-2">
               <Select onValueChange={(value) => updateConfig('productEssence', 'heroBenefit', value)}>
                 <SelectTrigger className="w-full h-8 text-xs">
                   <SelectValue placeholder="Choose a common benefit or write custom" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Transforms from clear to red when heated" className="text-xs">🔥 Transforms from clear to red when heated</SelectItem>
                   <SelectItem value="Changes color based on temperature" className="text-xs">🌡️ Changes color based on temperature</SelectItem>
                   <SelectItem value="Self-cleaning technology" className="text-xs">🧽 Self-cleaning technology</SelectItem>
                   <SelectItem value="One-touch operation" className="text-xs">👆 One-touch operation</SelectItem>
                   <SelectItem value="Instant results in seconds" className="text-xs">⚡ Instant results in seconds</SelectItem>
                   <SelectItem value="Waterproof and durable" className="text-xs">💧 Waterproof and durable</SelectItem>
                   <SelectItem value="Wireless charging capability" className="text-xs">🔋 Wireless charging capability</SelectItem>
                   <SelectItem value="Voice-activated control" className="text-xs">🎤 Voice-activated control</SelectItem>
                   <SelectItem value="Automatic shut-off safety" className="text-xs">🛡️ Automatic shut-off safety</SelectItem>
                   <SelectItem value="Multi-function versatility" className="text-xs">🔧 Multi-function versatility</SelectItem>
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
              <label className="text-xs font-medium text-cyan-600 dark:text-cyan-400">👁️ Visual Focus</label>
              <Select value={config.productEssence.visualFocus} onValueChange={(value) => updateConfig('productEssence', 'visualFocus', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select focus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Macro Detail" className="text-xs">🔍 Macro Detail</SelectItem>
                  <SelectItem value="Lifestyle in Context" className="text-xs">🏠 Lifestyle in Context</SelectItem>
                  <SelectItem value="Full Product Reveal" className="text-xs">📦 Full Product Reveal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-teal-600 dark:text-teal-400">🌍 Environment</label>
              <Select value={config.productEssence.environment} onValueChange={(value) => updateConfig('productEssence', 'environment', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Studio White" className="text-xs">🎬 Studio White</SelectItem>
                  <SelectItem value="Home Kitchen" className="text-xs">🏠 Home Kitchen</SelectItem>
                  <SelectItem value="Outdoor" className="text-xs">🌳 Outdoor</SelectItem>
                  <SelectItem value="Fantasy Sky" className="text-xs">☁️ Fantasy Sky</SelectItem>
                  <SelectItem value="Paper Page" className="text-xs">📄 Paper Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
           <div className="space-y-2">
             <label className="text-xs font-medium text-indigo-600 dark:text-indigo-400">🎨 Material / Texture Emphasis</label>
             <div className="space-y-2">
               <Select onValueChange={(value) => {
                 setCurrentMaterial(value)
                 addMaterial()
               }}>
                 <SelectTrigger className="w-full h-8 text-xs">
                   <SelectValue placeholder="Choose common materials or add custom" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Glass" className="text-xs">🪟 Glass</SelectItem>
                   <SelectItem value="Metal" className="text-xs">⚙️ Metal</SelectItem>
                   <SelectItem value="Liquid" className="text-xs">💧 Liquid</SelectItem>
                   <SelectItem value="Smoke" className="text-xs">💨 Smoke</SelectItem>
                   <SelectItem value="Wood" className="text-xs">🪵 Wood</SelectItem>
                   <SelectItem value="Plastic" className="text-xs">🧱 Plastic</SelectItem>
                   <SelectItem value="Fabric" className="text-xs">🧵 Fabric</SelectItem>
                   <SelectItem value="Ceramic" className="text-xs">🏺 Ceramic</SelectItem>
                   <SelectItem value="Leather" className="text-xs">👜 Leather</SelectItem>
                   <SelectItem value="Crystal" className="text-xs">💎 Crystal</SelectItem>
                   <SelectItem value="Steam" className="text-xs">♨️ Steam</SelectItem>
                   <SelectItem value="Foam" className="text-xs">🧼 Foam</SelectItem>
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
            <label className="text-xs font-medium text-pink-600 dark:text-pink-400">✨ Transformation Type</label>
            <Select value={config.productEssence.transformationType} onValueChange={(value) => updateConfig('productEssence', 'transformationType', value)}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Select transformation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Reveal" className="text-xs">🎭 Reveal</SelectItem>
                <SelectItem value="Color Morph" className="text-xs">🌈 Color Morph</SelectItem>
                <SelectItem value="Assemble" className="text-xs">🔧 Assemble</SelectItem>
                <SelectItem value="Grow" className="text-xs">🌱 Grow</SelectItem>
                <SelectItem value="Materialize" className="text-xs">✨ Materialize</SelectItem>
                <SelectItem value="2D→3D" className="text-xs">📐 2D→3D</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
        </Collapsible>
      </div>

      {/* 3️⃣ Creative Angle */}
      <div className="space-y-4">
        <Collapsible 
          open={expandedSections.creativeAngle} 
          onOpenChange={() => toggleSection('creativeAngle')}
        >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium text-violet-600 dark:text-violet-400">Creative Angle</span>
            </div>
            {expandedSections.creativeAngle ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
           <div className="space-y-2">
             <label className="text-xs font-medium text-rose-600 dark:text-rose-400">🎯 Core Angle</label>
             <div className="space-y-2">
               <Select onValueChange={(value) => updateConfig('storyDNA', 'coreAngle', value)}>
                 <SelectTrigger className="w-full h-8 text-xs">
                   <SelectValue placeholder="Choose a common angle or write custom" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="From transparency to color" className="text-xs">🌈 From transparency to color</SelectItem>
                   <SelectItem value="From drawing to real life" className="text-xs">🎨 From drawing to real life</SelectItem>
                   <SelectItem value="From chaos to order" className="text-xs">🌀 From chaos to order</SelectItem>
                   <SelectItem value="From broken to fixed" className="text-xs">🔧 From broken to fixed</SelectItem>
                   <SelectItem value="From empty to full" className="text-xs">📦 From empty to full</SelectItem>
                   <SelectItem value="From cold to hot" className="text-xs">🔥 From cold to hot</SelectItem>
                   <SelectItem value="From dark to light" className="text-xs">💡 From dark to light</SelectItem>
                   <SelectItem value="From old to new" className="text-xs">🆕 From old to new</SelectItem>
                   <SelectItem value="From simple to complex" className="text-xs">🧩 From simple to complex</SelectItem>
                   <SelectItem value="From invisible to visible" className="text-xs">👁️ From invisible to visible</SelectItem>
                   <SelectItem value="From flat to 3D" className="text-xs">📐 From flat to 3D</SelectItem>
                   <SelectItem value="From static to dynamic" className="text-xs">⚡ From static to dynamic</SelectItem>
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
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">👤 Persona</label>
              <Select value={config.storyDNA.persona} onValueChange={(value) => updateConfig('storyDNA', 'persona', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select persona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Creator on camera" className="text-xs">🎥 Creator on camera</SelectItem>
                  <SelectItem value="Narrator voice" className="text-xs">🎙️ Narrator voice</SelectItem>
                  <SelectItem value="Silent visual story" className="text-xs">🤫 Silent visual story</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-yellow-600 dark:text-yellow-400">⚡ Pattern Interrupt Type</label>
              <Select value={config.storyDNA.patternInterruptType} onValueChange={(value) => updateConfig('storyDNA', 'patternInterruptType', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select interrupt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unexpected Motion" className="text-xs">🎬 Unexpected Motion</SelectItem>
                  <SelectItem value="Visual Twist" className="text-xs">🌀 Visual Twist</SelectItem>
                  <SelectItem value="Sound Cue" className="text-xs">🔊 Sound Cue</SelectItem>
                  <SelectItem value="Cut Timing" className="text-xs">✂️ Cut Timing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-lime-600 dark:text-lime-400">🔗 Hook Framework Link</label>
              <Select value={config.storyDNA.hookFramework} onValueChange={(value) => updateConfig('storyDNA', 'hookFramework', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transformation" className="text-xs">🔄 Transformation</SelectItem>
                  <SelectItem value="Reveal" className="text-xs">🎭 Reveal</SelectItem>
                  <SelectItem value="Cause & Effect" className="text-xs">⚡ Cause & Effect</SelectItem>
                  <SelectItem value="Story in Motion" className="text-xs">🎬 Story in Motion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
        </Collapsible>
      </div>

      {/* 4️⃣ Dialogue / Voice (Conditional) */}
      <div className="space-y-4">
        <Collapsible 
          open={expandedSections.dialogue} 
          onOpenChange={() => toggleSection('dialogue')}
        >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">🎤 Dialogue / Voice</span>
            </div>
            {expandedSections.dialogue ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          {isDialogueVisible ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-cyan-600 dark:text-cyan-400">🗣️ Voice Type</label>
              <Select value={config.dialogueDNA.voiceType} onValueChange={(value) => updateConfig('dialogueDNA', 'voiceType', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select voice type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Creator on camera" className="text-xs">🎥 Creator on camera</SelectItem>
                  <SelectItem value="Voiceover narration" className="text-xs">🎙️ Voiceover narration</SelectItem>
                  <SelectItem value="Off-screen reaction" className="text-xs">😮 Off-screen reaction</SelectItem>
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
                  <SelectItem value="Casual" className="text-xs">😊 Casual</SelectItem>
                  <SelectItem value="Excited" className="text-xs">🎉 Excited</SelectItem>
                  <SelectItem value="Soft & Confident" className="text-xs">💪 Soft & Confident</SelectItem>
                  <SelectItem value="Mystical" className="text-xs">✨ Mystical</SelectItem>
                  <SelectItem value="Professional" className="text-xs">👔 Professional</SelectItem>
                  <SelectItem value="Friendly" className="text-xs">🤝 Friendly</SelectItem>
                  <SelectItem value="Energetic" className="text-xs">⚡ Energetic</SelectItem>
                  <SelectItem value="Calm" className="text-xs">🧘 Calm</SelectItem>
                  <SelectItem value="Authoritative" className="text-xs">👑 Authoritative</SelectItem>
                  <SelectItem value="Playful" className="text-xs">🎮 Playful</SelectItem>
                  <SelectItem value="Warm" className="text-xs">🔥 Warm</SelectItem>
                  <SelectItem value="Cool" className="text-xs">❄️ Cool</SelectItem>
                  <SelectItem value="Dramatic" className="text-xs">🎭 Dramatic</SelectItem>
                  <SelectItem value="Sincere" className="text-xs">💝 Sincere</SelectItem>
                  <SelectItem value="Humorous" className="text-xs">😄 Humorous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-emerald-600 dark:text-emerald-400">📝 Script Input</label>
            <Textarea
              value={config.dialogueDNA.script}
              onChange={(e) => updateConfig('dialogueDNA', 'script', e.target.value)}
              placeholder="I never believed a kettle could do this..."
              className="min-h-[60px] text-xs resize-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-indigo-600 dark:text-indigo-400">🌍 Language</label>
              <Select value={config.dialogueDNA.language} onValueChange={(value) => updateConfig('dialogueDNA', 'language', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en" className="text-xs">🇺🇸 English</SelectItem>
                  <SelectItem value="es" className="text-xs">🇪🇸 Spanish</SelectItem>
                  <SelectItem value="fr" className="text-xs">🇫🇷 French</SelectItem>
                  <SelectItem value="de" className="text-xs">🇩🇪 German</SelectItem>
                  <SelectItem value="it" className="text-xs">🇮🇹 Italian</SelectItem>
                  <SelectItem value="pt" className="text-xs">🇵🇹 Portuguese</SelectItem>
                  <SelectItem value="ru" className="text-xs">🇷🇺 Russian</SelectItem>
                  <SelectItem value="ja" className="text-xs">🇯🇵 Japanese</SelectItem>
                  <SelectItem value="ko" className="text-xs">🇰🇷 Korean</SelectItem>
                  <SelectItem value="zh" className="text-xs">🇨🇳 Chinese</SelectItem>
                  <SelectItem value="ar" className="text-xs">🇸🇦 Arabic</SelectItem>
                  <SelectItem value="hi" className="text-xs">🇮🇳 Hindi</SelectItem>
                  <SelectItem value="nl" className="text-xs">🇳🇱 Dutch</SelectItem>
                  <SelectItem value="sv" className="text-xs">🇸🇪 Swedish</SelectItem>
                  <SelectItem value="no" className="text-xs">🇳🇴 Norwegian</SelectItem>
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
      </div>

      {/* 6️⃣ Sound / Atmosphere */}
      <div className="space-y-4">
        <Collapsible 
          open={expandedSections.sound} 
          onOpenChange={() => toggleSection('sound')}
        >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">🎵 Sound / Atmosphere</span>
            </div>
            {expandedSections.sound ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-teal-600 dark:text-teal-400">🔊 Sound Mode</label>
              <Select value={config.audioDNA.soundMode} onValueChange={(value) => updateConfig('audioDNA', 'soundMode', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select sound mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Realistic SFX" className="text-xs">🎵 Realistic SFX</SelectItem>
                  <SelectItem value="Music-Driven" className="text-xs">🎶 Music-Driven</SelectItem>
                  <SelectItem value="Silence + Impact" className="text-xs">🤫 Silence + Impact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-pink-600 dark:text-pink-400">💫 Sound Emotion</label>
              <Select value={config.audioDNA.soundEmotion} onValueChange={(value) => updateConfig('audioDNA', 'soundEmotion', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select emotion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Warm" className="text-xs">🔥 Warm</SelectItem>
                  <SelectItem value="Cool" className="text-xs">❄️ Cool</SelectItem>
                  <SelectItem value="Mystical" className="text-xs">✨ Mystical</SelectItem>
                  <SelectItem value="Punchy" className="text-xs">💥 Punchy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
           <div className="space-y-2">
             <label className="text-xs font-medium text-orange-600 dark:text-orange-400">🎶 Key Sounds / FX</label>
             <div className="space-y-2">
               <Select onValueChange={(value) => {
                 setCurrentKeySound(value)
                 addKeySound()
               }}>
                 <SelectTrigger className="w-full h-8 text-xs">
                   <SelectValue placeholder="Choose common sounds or add custom" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Steam hiss" className="text-xs">♨️ Steam hiss</SelectItem>
                   <SelectItem value="Click ignition" className="text-xs">⚡ Click ignition</SelectItem>
                   <SelectItem value="Spark" className="text-xs">✨ Spark</SelectItem>
                   <SelectItem value="Fire crackle" className="text-xs">🔥 Fire crackle</SelectItem>
                   <SelectItem value="Water splash" className="text-xs">💧 Water splash</SelectItem>
                   <SelectItem value="Metal clink" className="text-xs">⚙️ Metal clink</SelectItem>
                   <SelectItem value="Glass tinkle" className="text-xs">🪟 Glass tinkle</SelectItem>
                   <SelectItem value="Whoosh" className="text-xs">💨 Whoosh</SelectItem>
                   <SelectItem value="Pop" className="text-xs">💥 Pop</SelectItem>
                   <SelectItem value="Sizzle" className="text-xs">🍳 Sizzle</SelectItem>
                   <SelectItem value="Bubble" className="text-xs">🫧 Bubble</SelectItem>
                   <SelectItem value="Hum" className="text-xs">🔊 Hum</SelectItem>
                   <SelectItem value="Beep" className="text-xs">📱 Beep</SelectItem>
                   <SelectItem value="Chime" className="text-xs">🔔 Chime</SelectItem>
                   <SelectItem value="Thud" className="text-xs">💥 Thud</SelectItem>
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
      </div>

      {/* 5️⃣ Camera & Motion Intelligence (Collapsible) */}
      <div className="space-y-4">
        <Collapsible 
          open={expandedSections.camera} 
          onOpenChange={() => toggleSection('camera')}
        >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-red-600 dark:text-red-400">📹 Camera & Motion Intelligence</span>
            </div>
            {expandedSections.camera ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-violet-600 dark:text-violet-400">🎬 Camera Rhythm</label>
              <Select value={config.cameraDNA.rhythm} onValueChange={(value) => updateConfig('cameraDNA', 'rhythm', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select rhythm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smooth tracking" className="text-xs">🎬 Smooth tracking</SelectItem>
                  <SelectItem value="dynamic cuts" className="text-xs">⚡ Dynamic cuts</SelectItem>
                  <SelectItem value="handheld" className="text-xs">📱 Handheld</SelectItem>
                  <SelectItem value="cinematic" className="text-xs">🎭 Cinematic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-amber-600 dark:text-amber-400">🎯 Key Movement Style</label>
              <Select value={config.cameraDNA.movementStyle} onValueChange={(value) => updateConfig('cameraDNA', 'movementStyle', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select movement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="push-in" className="text-xs">➡️ Push-in</SelectItem>
                  <SelectItem value="dolly" className="text-xs">🎬 Dolly</SelectItem>
                  <SelectItem value="arc" className="text-xs">🌙 Arc</SelectItem>
                  <SelectItem value="handheld" className="text-xs">📱 Handheld</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-cyan-600 dark:text-cyan-400">✂️ Cut Frequency</label>
              <Select value={config.cameraDNA.cutFrequency} onValueChange={(value) => updateConfig('cameraDNA', 'cutFrequency', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow" className="text-xs">🐌 Slow</SelectItem>
                  <SelectItem value="medium" className="text-xs">⚖️ Medium</SelectItem>
                  <SelectItem value="fast" className="text-xs">⚡ Fast</SelectItem>
                  <SelectItem value="dynamic" className="text-xs">🎬 Dynamic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-emerald-600 dark:text-emerald-400">🏁 Ending Type</label>
              <Select value={config.cameraDNA.endingType} onValueChange={(value) => updateConfig('cameraDNA', 'endingType', value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select ending" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero product close-up" className="text-xs">🎯 Hero Product Close-Up</SelectItem>
                  <SelectItem value="brand reveal" className="text-xs">🏷️ Brand Reveal</SelectItem>
                  <SelectItem value="call to action" className="text-xs">📢 Call to Action</SelectItem>
                  <SelectItem value="fade out" className="text-xs">🌅 Fade Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Generated Video */}
      {generatedVideo && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400">🎥 Generated UGC Ad</h4>
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

      </div>
      
      {/* Generate Button - Fixed at bottom */}
      <div className="pt-6 border-t border-border">
        <Button 
          className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white border-0 h-9 text-sm font-medium" 
          disabled={!config.brandDNA.name || !config.brandDNA.prompt || (!useCustomProduct && !selectedProductId) || (useCustomProduct && !customProductFile) || isGenerating}
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
      </div>

      {/* Previous Generations */}
      <PreviousGenerations contentType="ugc_ads" userId={user?.id || ''} className="mt-8" />
    </div>
  )
}