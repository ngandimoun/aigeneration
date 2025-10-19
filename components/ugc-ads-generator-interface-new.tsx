"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Loader2,
  Package,
  Users,
  Film,
  Clock,
  Star,
  ShoppingBag,
  Box,
  RotateCcw,
  BookOpen,
  GitCompare,
  Briefcase,
  Image as ImageIcon,
  Play
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { PreviousGenerations } from "@/components/ui/previous-generations"

interface UGCAdsGeneratorInterfaceProps {
  onClose: () => void
  projectTitle: string
}

// DNA Types (from existing interface)
interface BrandDNA {
  name: string
  tone: string
  colorCode: string
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
  cameraDNA: CameraDNA
  audioDNA: AudioDNA
}

// Image slot type
interface ImageSlot {
  id: string
  source: 'library' | 'upload'
  file?: File
  preview?: string
  productId?: string
  purpose?: string // Mode 3 only
  containsBoth: boolean
  description?: string
}

export function UGCAdsGeneratorInterface({ onClose, projectTitle }: UGCAdsGeneratorInterfaceProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  
  // Refs
  const productImageInputRef = useRef<HTMLInputElement>(null)
  const characterImageInputRef = useRef<HTMLInputElement>(null)
  
  // Mode Selection
  const [mode, setMode] = useState<'single' | 'dual' | 'multi'>('single')
  
  // Images (dynamic based on mode)
  const [images, setImages] = useState<ImageSlot[]>([
    { id: '1', source: 'library', containsBoth: false }
  ])
  
  // Character Presence
  const [characterPresence, setCharacterPresence] = useState<'show' | 'voiceover' | 'partial'>('voiceover')
  const [partialType, setPartialType] = useState<string>('')
  const [characterSource, setCharacterSource] = useState<'library' | 'upload' | 'describe'>('library')
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('')
  const [characterFile, setCharacterFile] = useState<File | null>(null)
  const [characterPreview, setCharacterPreview] = useState<string | null>(null)
  const [characterDescription, setCharacterDescription] = useState<string>('')
  const [characterCount, setCharacterCount] = useState<number>(1)
  const [characterDescriptions, setCharacterDescriptions] = useState<string[]>([''])
  
  // Voice/Script (text-only)
  const [script, setScript] = useState<string>('')
  const [voiceStyle, setVoiceStyle] = useState<string>('')
  const [toneOfDelivery, setToneOfDelivery] = useState<string>('')
  const [language, setLanguage] = useState<string>('en')
  
  // Duration
  const [duration, setDuration] = useState<number>(30)
  
  // Advanced fields toggle (Mode 1 only)
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)
  
  // DNA Configuration
  const [config, setConfig] = useState<UGCVideoConfig>({
    brandDNA: {
      name: "",
      tone: "",
      colorCode: ""
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
  
  // Available assets
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [availableAvatars, setAvailableAvatars] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingAvatars, setLoadingAvatars] = useState(false)
  
  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState<any>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // Templates
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  
  // Temporary material/sound input
  const [currentMaterial, setCurrentMaterial] = useState("")
  const [currentKeySound, setCurrentKeySound] = useState("")
  
  // Load products on mount
  useEffect(() => {
    loadAvailableProducts()
  }, [])
  
  // Load avatars when character presence is 'show' and source is 'library'
  useEffect(() => {
    if (characterPresence === 'show' && characterSource === 'library' && availableAvatars.length === 0) {
      loadAvailableAvatars()
    }
  }, [characterPresence, characterSource])
  
  // Load available products
  const loadAvailableProducts = async () => {
    setLoadingProducts(true)
    try {
      const response = await fetch('/api/product-mockups')
      if (response.ok) {
        const data = await response.json()
        setAvailableProducts(data.productMockups || data || [])
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoadingProducts(false)
    }
  }
  
  // Load available avatars
  const loadAvailableAvatars = async () => {
    setLoadingAvatars(true)
    try {
      const response = await fetch('/api/avatars')
      if (response.ok) {
        const data = await response.json()
        setAvailableAvatars(data.avatars || data || [])
      }
    } catch (error) {
      console.error('Error loading avatars:', error)
    } finally {
      setLoadingAvatars(false)
    }
  }
  
  // Image management
  const updateImageSlot = (index: number, updates: Partial<ImageSlot>) => {
    setImages(prev => prev.map((img, i) => i === index ? { ...img, ...updates } : img))
  }
  
  const handleProductImageUpload = (index: number, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive"
      })
      return
    }
    
    const preview = URL.createObjectURL(file)
    updateImageSlot(index, { file, preview, productId: undefined })
  }
  
  const handleProductSelect = (index: number, productId: string) => {
    const product = availableProducts.find(p => p.id === productId)
    updateImageSlot(index, { 
      productId, 
      preview: product?.image_url || product?.imageUrl,
      file: undefined 
    })
  }
  
  // Character image upload
  const handleCharacterImageUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive"
      })
      return
    }
    
    setCharacterFile(file)
    setCharacterPreview(URL.createObjectURL(file))
  }
  
  // Script estimation
  const estimateReadTime = (text: string): number => {
    const words = text.trim().split(/\s+/).length
    const wordsPerSecond = 2.5 // Average speaking rate
    return Math.ceil(words / wordsPerSecond)
  }
  
  const validateScriptLength = (text: string, maxDuration: number): boolean => {
    const estimatedTime = estimateReadTime(text)
    return estimatedTime <= maxDuration
  }
  
  // Template loading
  const loadTemplate = (templateName: string) => {
    setSelectedTemplate(templateName)
    
    const templates: Record<string, Partial<UGCVideoConfig> & { duration?: number, voiceStyle?: string }> = {
      'Product Review': {
        duration: 60,
        voiceStyle: 'casual-friendly',
        productEssence: {
          ...config.productEssence,
          visualFocus: 'Full Product Reveal',
          environment: 'Home - Living Room'
        },
        cameraDNA: {
          ...config.cameraDNA,
          movementStyle: 'push-in',
          rhythm: 'smooth tracking'
        },
        audioDNA: {
          ...config.audioDNA,
          soundMode: 'Background Music + Narration',
          soundEmotion: 'Upbeat & Modern'
        }
      },
      'Unboxing': {
        duration: 30,
        voiceStyle: 'excited-energetic',
        productEssence: {
          ...config.productEssence,
          visualFocus: 'Macro Detail (Texture Focus)',
          environment: 'Studio - White Background'
        },
        cameraDNA: {
          ...config.cameraDNA,
          movementStyle: 'macro close-up',
          cutFrequency: 'fast'
        }
      },
      'Before/After': {
        duration: 30,
        voiceStyle: 'confident-bold',
        storyDNA: {
          ...config.storyDNA,
          hookFramework: 'Before/After Reveal',
          patternInterruptType: 'Visual Transformation'
        }
      },
      'Tutorial': {
        duration: 120,
        voiceStyle: 'professional-clear',
        productEssence: {
          ...config.productEssence,
          visualFocus: 'Lifestyle Context',
          environment: 'Home - Kitchen'
        },
        cameraDNA: {
          ...config.cameraDNA,
          movementStyle: 'static handheld',
          cutFrequency: 'medium'
        }
      },
      'Comparison': {
        duration: 60,
        voiceStyle: 'professional-clear',
        storyDNA: {
          ...config.storyDNA,
          hookFramework: 'Problem/Solution Split',
          coreAngle: 'Comparison'
        }
      },
      'Transformation': {
        duration: 30,
        voiceStyle: 'passionate-warm',
        storyDNA: {
          ...config.storyDNA,
          hookFramework: 'Before/After Reveal',
          patternInterruptType: 'Visual Transformation'
        },
        productEssence: {
          ...config.productEssence,
          transformationType: 'Dramatic Change'
        }
      },
      'Professional Demo': {
        duration: 60,
        voiceStyle: 'professional-clear',
        productEssence: {
          ...config.productEssence,
          visualFocus: 'Full Product Reveal',
          environment: 'Studio - White Background'
        },
        cameraDNA: {
          ...config.cameraDNA,
          movementStyle: 'static tripod',
          rhythm: 'slow deliberate'
        }
      },
      'Lifestyle': {
        duration: 30,
        voiceStyle: 'sincere-heartfelt',
        productEssence: {
          ...config.productEssence,
          visualFocus: 'Lifestyle Context',
          environment: 'Outdoor - Nature'
        },
        cameraDNA: {
          ...config.cameraDNA,
          movementStyle: 'orbit around',
          rhythm: 'smooth tracking'
        }
      }
    }
    
    const template = templates[templateName]
    if (template) {
      if (template.duration) setDuration(template.duration)
      if (template.voiceStyle) setVoiceStyle(template.voiceStyle)
      setConfig(prev => ({
        ...prev,
        ...template
      }))
      
      toast({
        title: "Template Applied",
        description: `"${templateName}" settings loaded successfully.`
      })
    }
  }
  
  // AI Suggestions (mock for now)
  const generateAISuggestions = async (imageData: any) => {
    // This would call an AI service in production
    const suggestions = {
      voiceStyle: 'excited-energetic',
      environment: 'Studio - White Background',
      cameraMovement: 'push-in',
      musicMood: 'Upbeat & Modern',
      duration: 30
    }
    
    setAiSuggestions(suggestions)
    setShowSuggestions(true)
  }
  
  const applySuggestions = () => {
    if (!aiSuggestions) return
    
    setVoiceStyle(aiSuggestions.voiceStyle)
    setDuration(aiSuggestions.duration)
    setConfig(prev => ({
      ...prev,
      productEssence: {
        ...prev.productEssence,
        environment: aiSuggestions.environment
      },
      cameraDNA: {
        ...prev.cameraDNA,
        movementStyle: aiSuggestions.cameraMovement
      },
      audioDNA: {
        ...prev.audioDNA,
        soundEmotion: aiSuggestions.musicMood
      }
    }))
    
    setShowSuggestions(false)
    toast({
      title: "Suggestions Applied",
      description: "AI recommendations have been applied to your settings."
    })
  }
  
  // Validation for Mode 1
  const validateMode1 = (): boolean => {
    const image = images[0]
    if (!image.productId && !image.file) {
      toast({
        title: "Product Image Required",
        description: "Please select a product from the library or upload an image.",
        variant: "destructive"
      })
      return false
    }
    
    if (!script.trim()) {
      toast({
        title: "Script Required",
        description: "Please enter a script for your UGC ad.",
        variant: "destructive"
      })
      return false
    }
    
    if (!validateScriptLength(script, duration)) {
      toast({
        title: "Script Too Long",
        description: `Your script is estimated to take ${estimateReadTime(script)}s, but your video is only ${duration}s. Please shorten the script or increase duration.`,
        variant: "destructive"
      })
      return false
    }
    
    if (characterPresence === 'show') {
      if (characterSource === 'library' && !selectedAvatarId) {
        toast({
          title: "Avatar Required",
          description: "Please select an avatar from the library.",
          variant: "destructive"
        })
        return false
      }
      if (characterSource === 'upload' && !characterFile) {
        toast({
          title: "Character Image Required",
          description: "Please upload a character image.",
          variant: "destructive"
        })
        return false
      }
      if (characterSource === 'describe') {
        const hasValidDescriptions = characterDescriptions.some(desc => desc.trim())
        if (!hasValidDescriptions) {
          toast({
            title: "Character Description Required",
            description: "Please describe at least one character.",
            variant: "destructive"
          })
          return false
        }
      }
    }
    
    if (characterPresence === 'partial' && !partialType) {
      toast({
        title: "Partial Presence Type Required",
        description: "Please select what part of the character to show.",
        variant: "destructive"
      })
      return false
    }
    
    return true
  }
  
  // Generate handler
  const handleGenerate = async () => {
    if (mode === 'single' && !validateMode1()) return
    
    setIsGenerating(true)
    
    try {
      const formData = new FormData()
      formData.append('mode', mode)
      formData.append('project_title', projectTitle)
      formData.append('user_id', user?.id || '')
      
      // Mode 1 specific data
      if (mode === 'single') {
        const image = images[0]
        if (image.file) {
          formData.append('product_image', image.file)
        } else if (image.productId) {
          formData.append('product_id', image.productId)
        }
        formData.append('contains_both', image.containsBoth.toString())
        if (image.description) {
          formData.append('image_description', image.description)
        }
      }
      
      // Character data
      formData.append('character_presence', characterPresence)
      if (characterPresence === 'show') {
        formData.append('character_source', characterSource)
        if (characterSource === 'library' && selectedAvatarId) {
          formData.append('avatar_id', selectedAvatarId)
        } else if (characterSource === 'upload' && characterFile) {
          formData.append('character_image', characterFile)
        } else if (characterSource === 'describe') {
          formData.append('character_descriptions', JSON.stringify(characterDescriptions))
        }
      } else if (characterPresence === 'partial') {
        formData.append('partial_type', partialType)
      }
      
      // Voice/Script data
      formData.append('script', script)
      formData.append('voice_style', voiceStyle)
      formData.append('tone_of_delivery', toneOfDelivery)
      formData.append('language', language)
      
      // Duration
      formData.append('duration', duration.toString())
      
      // DNA configuration
      formData.append('config', JSON.stringify(config))
      
      // Template if used
      if (selectedTemplate) {
        formData.append('template', selectedTemplate)
      }
      
      const response = await fetch('/api/ugc-ads', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Generation failed')
      }
      
      const data = await response.json()
      setGeneratedVideo(data.videoUrl)
      
      toast({
        title: "Success!",
        description: "Your UGC ad has been generated."
      })
    } catch (error) {
      console.error('Generation error:', error)
      toast({
        title: "Generation Failed",
        description: "There was an error generating your UGC ad. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }
  
  // Material management
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
  
  // Sound management
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10 rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎬 UGC Ads Generator
            </h2>
            <p className="text-sm text-gray-500 mt-1">Create authentic user-generated content ads</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mode Selection Tabs */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'single' | 'dual' | 'multi')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Single Product
              </TabsTrigger>
              <TabsTrigger value="dual" className="flex items-center gap-2">
                <Film className="h-4 w-4" />
                Dual Visual
              </TabsTrigger>
              <TabsTrigger value="multi" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Multi-Story
              </TabsTrigger>
            </TabsList>

            {/* Mode Description Card */}
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              {mode === 'single' && (
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-purple-900">Single Product Showcase</h3>
                    <p className="text-sm text-purple-700 mt-1">
                      Perfect for product reviews, demos, and unboxing. Focus on one product with optional character presence. Up to 2 minutes.
                    </p>
                  </div>
                </div>
              )}
              {mode === 'dual' && (
                <div className="flex items-start gap-3">
                  <Film className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-purple-900">Dual Visual Control</h3>
                    <p className="text-sm text-purple-700 mt-1">
                      Use 2 images for cinematic transitions, before/after reveals, product comparisons, or start/end frame control. Up to 2 minutes.
                    </p>
                  </div>
                </div>
              )}
              {mode === 'multi' && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-purple-900">Multi-Story & Visual Mastery</h3>
                    <p className="text-sm text-purple-700 mt-1">
                      Use up to 3 images for product bundles, tutorials, or complex narratives. Control character design, lighting, and environment. Up to 2 minutes.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* MODE 1: Single Product Showcase */}
            <TabsContent value="single" className="space-y-6 mt-6">
              {/* Template Bar */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-600" />
                  Quick Start Templates
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Product Review', 'Unboxing', 'Before/After', 'Tutorial', 'Comparison', 'Transformation', 'Professional Demo', 'Lifestyle'].map((template) => (
                    <Button
                      key={template}
                      variant={selectedTemplate === template ? "default" : "outline"}
                      size="sm"
                      onClick={() => loadTemplate(template)}
                      className="text-xs"
                    >
                      {template === 'Product Review' && '⭐'}
                      {template === 'Unboxing' && '📦'}
                      {template === 'Before/After' && '🔄'}
                      {template === 'Tutorial' && '📚'}
                      {template === 'Comparison' && '⚖️'}
                      {template === 'Transformation' && '✨'}
                      {template === 'Professional Demo' && '💼'}
                      {template === 'Lifestyle' && '🎨'}
                      {' '}{template}
                    </Button>
                  ))}
                </div>
              </div>


              {/* Product Image Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-purple-600" />
                  Product Image *
                </label>
                
                {/* Source Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={images[0].source === 'library' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateImageSlot(0, { source: 'library', file: undefined, preview: undefined })}
                  >
                    From Product Library
                  </Button>
                  <Button
                    variant={images[0].source === 'upload' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateImageSlot(0, { source: 'upload', productId: undefined })}
                  >
                    Upload Image
                  </Button>
                </div>

                {/* Library Selection */}
                {images[0].source === 'library' && (
                  <div className="space-y-2">
                    <Select
                      value={images[0].productId || ''}
                      onValueChange={(value) => handleProductSelect(0, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingProducts ? (
                          <SelectItem value="loading" disabled>Loading products...</SelectItem>
                        ) : availableProducts.length === 0 ? (
                          <SelectItem value="none" disabled>No products available</SelectItem>
                        ) : (
                          availableProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.title || product.name || 'Untitled Product'}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    
                    {/* Preview for selected product from library */}
                    {images[0].productId && (() => {
                      const product = availableProducts.find(p => p.id === images[0].productId)
                      const productImageUrl = product?.image_url || product?.imageUrl
                      return product ? (
                        <div className="p-3 bg-muted/30 rounded-lg border">
                          <div className="flex items-center gap-3">
                            {productImageUrl ? (
                              <img 
                                src={productImageUrl} 
                                alt={product.title || product.name}
                                className="w-12 h-12 object-cover rounded-lg border border-border"
                                onError={(e) => {
                                  console.error('Product image failed to load:', productImageUrl)
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded-lg border border-border flex items-center justify-center">
                                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-primary text-sm">
                                {product.title || product.name || 'Untitled Product'}
                              </p>
                              {product.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : null
                    })()}
                  </div>
                )}

                {/* Upload */}
                {images[0].source === 'upload' && (
                  <div className="space-y-2">
                    <input
                      ref={productImageInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleProductImageUpload(0, file)
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => productImageInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>
                    <p className="text-xs text-gray-500">JPG, JPEG, PNG (max 10MB)</p>
                  </div>
                )}

                {/* Preview */}
                {images[0].preview && (
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={images[0].preview}
                      alt="Product preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Contains Both Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="contains-both"
                    checked={images[0].containsBoth}
                    onCheckedChange={(checked) => updateImageSlot(0, { containsBoth: checked as boolean })}
                  />
                  <label
                    htmlFor="contains-both"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    This image contains both character and product
                  </label>
                </div>

                {/* Optional Description */}
                <Textarea
                  placeholder="Describe the product or how to use this image (optional)..."
                  value={images[0].description || ''}
                  onChange={(e) => updateImageSlot(0, { description: e.target.value })}
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>

              {/* Character Presence Section - Only show if image doesn't contain both */}
              {!images[0].containsBoth && (
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    Character Presence (Optional)
                  </label>
                
                <div className="flex gap-2">
                  <Button
                    variant={characterPresence === 'voiceover' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCharacterPresence('voiceover')}
                  >
                    🎙️ Voiceover Only
                  </Button>
                  <Button
                    variant={characterPresence === 'show' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCharacterPresence('show')}
                  >
                    👤 Show Character
                  </Button>
                  <Button
                    variant={characterPresence === 'partial' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCharacterPresence('partial')}
                  >
                    ✋ Partial Presence
                  </Button>
                </div>

                {/* Show Character Options - Single mode only allows description */}
                {characterPresence === 'show' && (
                  <div className="space-y-3 pl-4 border-l-2 border-purple-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium">Number of Characters</label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (characterCount > 1) {
                                setCharacterCount(characterCount - 1)
                                setCharacterDescriptions(prev => prev.slice(0, -1))
                              }
                            }}
                            disabled={characterCount <= 1}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{characterCount}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (characterCount < 5) {
                                setCharacterCount(characterCount + 1)
                                setCharacterDescriptions(prev => [...prev, ''])
                              }
                            }}
                            disabled={characterCount >= 5}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Describe each character separately. Maximum 5 characters. In single mode, you can only describe characters. Use multi-mode to upload or select from library.
                      </p>
                      
                      {/* Character description fields */}
                      {characterDescriptions.map((desc, index) => (
                        <div key={index} className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">
                            Character {index + 1}
                          </label>
                          <Textarea
                            placeholder={`Describe character ${index + 1} (appearance, style, mood, etc.)...`}
                            value={desc}
                            onChange={(e) => {
                              const newDescriptions = [...characterDescriptions]
                              newDescriptions[index] = e.target.value
                              setCharacterDescriptions(newDescriptions)
                            }}
                            rows={3}
                            className="resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Partial Presence Options */}
                {characterPresence === 'partial' && (
                  <div className="space-y-2 pl-4 border-l-2 border-purple-200">
                    <Select value={partialType} onValueChange={setPartialType}>
                      <SelectTrigger>
                        <SelectValue placeholder="What part to show?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hands">
                          <div className="flex flex-col items-start">
                            <span>✋ Hands Only</span>
                            <span className="text-xs text-gray-500">Holding product, pointing, gesturing</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="face">
                          <div className="flex flex-col items-start">
                            <span>👁️ Face Close-up</span>
                            <span className="text-xs text-gray-500">Reaction shots, expressions, eyes</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="feet">
                          <div className="flex flex-col items-start">
                            <span>🦵 Feet/Legs</span>
                            <span className="text-xs text-gray-500">Walking, standing, lifestyle shots</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="silhouette">
                          <div className="flex flex-col items-start">
                            <span>👤 Silhouette</span>
                            <span className="text-xs text-gray-500">Shadow, outline, mysterious presence</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="custom">
                          <div className="flex flex-col items-start">
                            <span>🎨 Custom Description</span>
                            <span className="text-xs text-gray-500">Describe specific needs</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {partialType === 'custom' && (
                      <Textarea
                        placeholder="Describe what part of the character to show and how..."
                        rows={2}
                      />
                    )}
                  </div>
                )}
                </div>
              )}

              {/* Script Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-purple-600" />
                  Script / Voice *
                </label>
                
                <Textarea
                  placeholder="Write your script here... What will be said in the ad?"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{script.length} characters</span>
                  <span>
                    Estimated read time: {estimateReadTime(script)}s
                    {!validateScriptLength(script, duration) && script.length > 0 && (
                      <span className="text-red-500 ml-2">⚠️ Too long for {duration}s video</span>
                    )}
                  </span>
                </div>

                {/* Voice Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Voice Style</label>
                    <Select value={voiceStyle} onValueChange={setVoiceStyle}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casual-friendly">😊 Casual & Friendly</SelectItem>
                        <SelectItem value="excited-energetic">🎉 Excited & Energetic</SelectItem>
                        <SelectItem value="confident-bold">💪 Confident & Bold</SelectItem>
                        <SelectItem value="calm-soothing">🧘 Calm & Soothing</SelectItem>
                        <SelectItem value="professional-clear">👔 Professional & Clear</SelectItem>
                        <SelectItem value="passionate-warm">🔥 Passionate & Warm</SelectItem>
                        <SelectItem value="cool-minimalist">❄️ Cool & Minimalist</SelectItem>
                        <SelectItem value="dramatic-theatrical">🎭 Dramatic & Theatrical</SelectItem>
                        <SelectItem value="sincere-heartfelt">💝 Sincere & Heartfelt</SelectItem>
                        <SelectItem value="playful-humorous">😄 Playful & Humorous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Tone of Delivery</label>
                    <Select value={toneOfDelivery} onValueChange={setToneOfDelivery}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="natural">Natural & Conversational</SelectItem>
                        <SelectItem value="slow">Slow & Emphasised</SelectItem>
                        <SelectItem value="fast">Fast & Punchy</SelectItem>
                        <SelectItem value="whisper">Whisper & Intimate</SelectItem>
                        <SelectItem value="loud">Loud & Commanding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Language</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Duration Presets */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  Video Duration
                </label>
                
                <div className="flex gap-2">
                  <Button
                    variant={duration === 15 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDuration(15)}
                  >
                    ⚡ 15s Quick
                  </Button>
                  <Button
                    variant={duration === 30 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDuration(30)}
                  >
                    📱 30s Social
                  </Button>
                  <Button
                    variant={duration === 60 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDuration(60)}
                  >
                    🎬 60s Standard
                  </Button>
                  <Button
                    variant={duration === 120 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDuration(120)}
                  >
                    🎥 120s Full
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500">
                  {duration === 15 && '⚡ Perfect for TikTok and Instagram Reels'}
                  {duration === 30 && '📱 Ideal for social media feeds'}
                  {duration === 60 && '🎬 Standard YouTube and Facebook ads'}
                  {duration === 120 && '🎥 Full-length product demonstrations'}
                </p>
              </div>

              {/* Advanced Fields (Collapsible) */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Advanced Creative Controls
                    </span>
                    {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-6 mt-4">
                  {/* Brand DNA */}
                  <div className="space-y-3 p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      Brand DNA
                    </h3>
                    
                    <div className="space-y-3">
                      <Input
                        placeholder="Brand Name"
                        value={config.brandDNA.name}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          brandDNA: { ...prev.brandDNA, name: e.target.value }
                        }))}
                      />
                      
                      <Select
                        value={config.brandDNA.tone}
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          brandDNA: { ...prev.brandDNA, tone: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Brand Tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="playful">Playful & Fun</SelectItem>
                          <SelectItem value="professional">Professional & Trustworthy</SelectItem>
                          <SelectItem value="luxury">Luxury & Premium</SelectItem>
                          <SelectItem value="eco">Eco-Friendly & Sustainable</SelectItem>
                          <SelectItem value="tech">Tech-Forward & Innovative</SelectItem>
                          <SelectItem value="minimal">Minimal & Clean</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Input
                        placeholder="Brand Color Code (e.g., #FF5733)"
                        value={config.brandDNA.colorCode}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          brandDNA: { ...prev.brandDNA, colorCode: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  {/* Product Essence */}
                  <div className="space-y-3 p-4 bg-pink-50 rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Box className="h-4 w-4 text-pink-600" />
                      Product Essence
                    </h3>
                    
                    <div className="space-y-3">
                      <Input
                        placeholder="Product Name"
                        value={config.productEssence.name}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          productEssence: { ...prev.productEssence, name: e.target.value }
                        }))}
                      />
                      
                      <Textarea
                        placeholder="Hero Benefit (What's the main value proposition?)"
                        value={config.productEssence.heroBenefit}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          productEssence: { ...prev.productEssence, heroBenefit: e.target.value }
                        }))}
                        rows={2}
                      />
                      
                      <Select
                        value={config.productEssence.visualFocus}
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          productEssence: { ...prev.productEssence, visualFocus: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Visual Focus" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="macro">Macro Detail (Texture Focus)</SelectItem>
                          <SelectItem value="lifestyle">Lifestyle Context</SelectItem>
                          <SelectItem value="full">Full Product Reveal</SelectItem>
                          <SelectItem value="action">Product in Action</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={config.productEssence.environment}
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          productEssence: { ...prev.productEssence, environment: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Environment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="studio-white">Studio - White Background</SelectItem>
                          <SelectItem value="studio-black">Studio - Black Background</SelectItem>
                          <SelectItem value="home-living">Home - Living Room</SelectItem>
                          <SelectItem value="home-kitchen">Home - Kitchen</SelectItem>
                          <SelectItem value="home-bedroom">Home - Bedroom</SelectItem>
                          <SelectItem value="outdoor-nature">Outdoor - Nature</SelectItem>
                          <SelectItem value="outdoor-urban">Outdoor - Urban</SelectItem>
                          <SelectItem value="office">Office/Workspace</SelectItem>
                          <SelectItem value="cafe">Café/Restaurant</SelectItem>
                          <SelectItem value="gym">Gym/Fitness</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Materials/Textures</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add material..."
                            value={currentMaterial}
                            onChange={(e) => setCurrentMaterial(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addMaterial()}
                          />
                          <Button size="sm" onClick={addMaterial}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {config.productEssence.materials.map((material, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {material}
                              <button onClick={() => removeMaterial(index)}>
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Creative Angle */}
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      Creative Angle
                    </h3>
                    
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Core Angle (What's the main creative approach?)"
                        value={config.storyDNA.coreAngle}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          storyDNA: { ...prev.storyDNA, coreAngle: e.target.value }
                        }))}
                        rows={2}
                      />
                      
                      <Select
                        value={config.storyDNA.patternInterruptType}
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          storyDNA: { ...prev.storyDNA, patternInterruptType: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pattern Interrupt Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visual-transform">Visual Transformation</SelectItem>
                          <SelectItem value="unexpected-reveal">Unexpected Reveal</SelectItem>
                          <SelectItem value="scale-shift">Scale Shift</SelectItem>
                          <SelectItem value="color-pop">Color Pop</SelectItem>
                          <SelectItem value="speed-change">Speed Change</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={config.storyDNA.hookFramework}
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          storyDNA: { ...prev.storyDNA, hookFramework: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Hook Framework" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="problem-solution">Problem/Solution</SelectItem>
                          <SelectItem value="before-after">Before/After Reveal</SelectItem>
                          <SelectItem value="question">Question Hook</SelectItem>
                          <SelectItem value="bold-claim">Bold Claim</SelectItem>
                          <SelectItem value="story">Story Opening</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Camera DNA */}
                  <div className="space-y-3 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Camera className="h-4 w-4 text-green-600" />
                      Camera DNA
                    </h3>
                    
                    <div className="space-y-3">
                      <Select
                        value={config.cameraDNA.rhythm}
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          cameraDNA: { ...prev.cameraDNA, rhythm: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Camera Rhythm" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="smooth">Smooth Tracking</SelectItem>
                          <SelectItem value="slow">Slow Deliberate</SelectItem>
                          <SelectItem value="dynamic">Dynamic Movement</SelectItem>
                          <SelectItem value="static">Static Locked</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={config.cameraDNA.movementStyle}
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          cameraDNA: { ...prev.cameraDNA, movementStyle: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Movement Style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="push-in">Push-in (Zoom In)</SelectItem>
                          <SelectItem value="pull-out">Pull-out (Zoom Out)</SelectItem>
                          <SelectItem value="orbit">Orbit Around</SelectItem>
                          <SelectItem value="macro">Macro Close-up</SelectItem>
                          <SelectItem value="handheld">Static Handheld</SelectItem>
                          <SelectItem value="tripod">Static Tripod</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={config.cameraDNA.cutFrequency}
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          cameraDNA: { ...prev.cameraDNA, cutFrequency: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Cut Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Cuts (Single Shot)</SelectItem>
                          <SelectItem value="slow">Slow (Every 5-8s)</SelectItem>
                          <SelectItem value="medium">Medium (Every 3-4s)</SelectItem>
                          <SelectItem value="fast">Fast (Every 1-2s)</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={config.cameraDNA.endingType}
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          cameraDNA: { ...prev.cameraDNA, endingType: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ending Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hero-closeup">Hero Product Close-up</SelectItem>
                          <SelectItem value="logo-reveal">Logo Reveal</SelectItem>
                          <SelectItem value="cta-text">CTA Text Card</SelectItem>
                          <SelectItem value="fade-out">Fade to Black</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Audio DNA */}
                  <div className="space-y-3 p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Music className="h-4 w-4 text-yellow-600" />
                      Audio DNA
                    </h3>
                    
                    <div className="space-y-3">
                      <Select
                        value={config.audioDNA.soundMode}
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          audioDNA: { ...prev.audioDNA, soundMode: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sound Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="music-narration">Background Music + Narration</SelectItem>
                          <SelectItem value="music-only">Music Only</SelectItem>
                          <SelectItem value="narration-only">Narration Only</SelectItem>
                          <SelectItem value="ambient">Ambient Sounds</SelectItem>
                          <SelectItem value="silent">Silent (Visual Only)</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={config.audioDNA.soundEmotion}
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          audioDNA: { ...prev.audioDNA, soundEmotion: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Music Mood" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upbeat">Upbeat & Modern</SelectItem>
                          <SelectItem value="calm">Calm & Relaxing</SelectItem>
                          <SelectItem value="epic">Epic & Cinematic</SelectItem>
                          <SelectItem value="minimal">Minimal & Subtle</SelectItem>
                          <SelectItem value="energetic">Energetic & Driving</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Key Sound Effects</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add sound effect..."
                            value={currentKeySound}
                            onChange={(e) => setCurrentKeySound(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addKeySound()}
                          />
                          <Button size="sm" onClick={addKeySound}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {config.audioDNA.keySounds.map((sound, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {sound}
                              <button onClick={() => removeKeySound(index)}>
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </TabsContent>

            {/* MODE 2: Dual Visual (Placeholder) */}
            <TabsContent value="dual" className="space-y-6 mt-6">
              <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed">
                <Film className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700 mb-2">Mode 2: Coming Soon</h3>
                <p className="text-sm text-gray-500">
                  Dual Visual Control with 2-image mode selector and scene-based scripts will be implemented next.
                </p>
              </div>
            </TabsContent>

            {/* MODE 3: Multi-Story (Placeholder) */}
            <TabsContent value="multi" className="space-y-6 mt-6">
              <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700 mb-2">Mode 3: Coming Soon</h3>
                <p className="text-sm text-gray-500">
                  Multi-Story & Visual Mastery with up to 3 images and multi-character dialog will be implemented last.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Generate Button */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>

          {/* Previous Generations */}
          <div className="mt-6">
            <PreviousGenerations
              contentType="ugc_ads"
              userId={user?.id || ''}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
