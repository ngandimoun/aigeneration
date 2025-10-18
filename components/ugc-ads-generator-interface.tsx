"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
  Package,
  Film,
  Users,
  Sparkles,
  Upload,
  ShoppingBag,
  MessageCircle,
  Clock,
  Settings,
  ChevronDown,
  ChevronRight,
  Loader2,
  Image,
  Palette,
  Music,
  Camera,
  Lightbulb
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface UGCAdsGeneratorInterfaceProps {
  onClose: () => void
  projectTitle: string
}

type Mode = 'single' | 'dual' | 'multi'

export function UGCAdsGeneratorInterface({ onClose, projectTitle }: UGCAdsGeneratorInterfaceProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Refs
  const productImageInputRef = useRef<HTMLInputElement>(null)
  const image1InputRef = useRef<HTMLInputElement>(null)
  const image2InputRef = useRef<HTMLInputElement>(null)
  const image3InputRef = useRef<HTMLInputElement>(null)
  const characterImageInputRef = useRef<HTMLInputElement>(null)
  
  // Mode Selection
  const [mode, setMode] = useState<Mode>('single')
  
  // Template Selection
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  
  // Product Image (Mode 1)
  const [productSource, setProductSource] = useState<'library' | 'upload'>('library')
  const [productFile, setProductFile] = useState<File | null>(null)
  const [productPreview, setProductPreview] = useState<string | null>(null)
  const [productId, setProductId] = useState<string>('')
  const [containsBoth, setContainsBoth] = useState<boolean>(false)
  const [imageDescription, setImageDescription] = useState<string>('')
  
  // Images for Mode 2 & 3
  const [images, setImages] = useState<Array<{
    id: string
    source: 'library' | 'upload'
    file?: File
    preview?: string
    productId?: string
    purpose?: string // Mode 3 only
    containsBoth: boolean
    description?: string
  }>>([
    { id: '1', source: 'library', containsBoth: false },
    { id: '2', source: 'library', containsBoth: false }
  ])
  
  // Mode 3 specific
  const [mode3SceneDescription, setMode3SceneDescription] = useState<string>('')
  
  // Character Presence
  const [characterPresence, setCharacterPresence] = useState<'voiceover' | 'show' | 'partial'>('voiceover')
  
  // Character Selection (when not voiceover)
  const [characterSource, setCharacterSource] = useState<'library' | 'upload' | 'describe'>('library')
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('')
  const [characterFile, setCharacterFile] = useState<File | null>(null)
  const [characterPreview, setCharacterPreview] = useState<string | null>(null)
  const [characterDescription, setCharacterDescription] = useState<string>('')
  const [partialType, setPartialType] = useState<string>('')
  
  // Available avatars
  const [availableAvatars, setAvailableAvatars] = useState<any[]>([])
  const [loadingAvatars, setLoadingAvatars] = useState(false)
  
  // Script
  const [script, setScript] = useState<string>('')
  const [voiceStyle, setVoiceStyle] = useState<string>('')
  const [toneOfDelivery, setToneOfDelivery] = useState<string>('')
  const [language, setLanguage] = useState<string>('en')
  
  // Duration
  const [duration, setDuration] = useState<number>(30)
  
  // Mode 2 specific state
  const [twoImageMode, setTwoImageMode] = useState<'start-end' | 'comparison' | 'transformation' | 'flexible'>('start-end')
  const [sceneScripts, setSceneScripts] = useState<{scene1: string, scene2: string, scene3: string}>({
    scene1: '',
    scene2: '',
    scene3: ''
  })
  
  // Advanced Toggle
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)
  
  // Available Products
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [useCustomProduct, setUseCustomProduct] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [customProductFile, setCustomProductFile] = useState<File | null>(null)
  const [customProductPreview, setCustomProductPreview] = useState<string | null>(null)
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  
  // AI Suggestions
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any>(null)
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  // Custom fields for UGC Ads Generator
  const [customVoiceStyle, setCustomVoiceStyle] = useState("")
  const [customToneOfDelivery, setCustomToneOfDelivery] = useState("")
  const [customLanguage, setCustomLanguage] = useState("")
  const [brandTone, setBrandTone] = useState("")
  const [customBrandTone, setCustomBrandTone] = useState("")
  const [visualFocus, setVisualFocus] = useState("")
  const [customVisualFocus, setCustomVisualFocus] = useState("")
  const [coreAngle, setCoreAngle] = useState("")
  const [customCoreAngle, setCustomCoreAngle] = useState("")
  const [cameraRhythm, setCameraRhythm] = useState("")
  const [customCameraRhythm, setCustomCameraRhythm] = useState("")
  const [musicMood, setMusicMood] = useState("")
  const [customMusicMood, setCustomMusicMood] = useState("")
  
  // Skeleton loader component
  const SkeletonLoader = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-muted rounded ${className || 'h-4 w-full'}`} />
  )
  
  // Load products and avatars on mount
  useEffect(() => {
    loadAvailableProducts()
    loadAvailableAvatars()
  }, [])
  
  // Manage image slots based on mode
  useEffect(() => {
    if (mode === 'dual' && images.length !== 2) {
      setImages([
        { id: '1', source: 'library', containsBoth: false },
        { id: '2', source: 'library', containsBoth: false }
      ])
    } else if (mode === 'multi' && images.length !== 3) {
      setImages([
        { id: '1', source: 'library', containsBoth: false, purpose: 'product' },
        { id: '2', source: 'library', containsBoth: false, purpose: 'product' },
        { id: '3', source: 'library', containsBoth: false, purpose: 'lifestyle' }
      ])
    }
  }, [mode])

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (productPreview) URL.revokeObjectURL(productPreview)
      if (characterPreview) URL.revokeObjectURL(characterPreview)
      images.forEach(img => {
        if (img.preview) URL.revokeObjectURL(img.preview)
      })
    }
  }, [productPreview, characterPreview, images])

  // Focus management when switching modes
  useEffect(() => {
    // Focus first input when mode changes
    const firstInput = document.querySelector(`[data-mode="${mode}"] input, [data-mode="${mode}"] textarea`)
    if (firstInput) {
      (firstInput as HTMLElement).focus()
    }
  }, [mode])
  
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
  
  const handleCharacterImageUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive"
      })
      return
    }
    
    try {
      setCharacterFile(file)
      setCharacterPreview(URL.createObjectURL(file))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load image preview",
        variant: "destructive"
      })
    }
  }

  const handleProductSelect = async (productId: string) => {
    setSelectedProductId(productId)
    
    // Fetch product details and show preview
    try {
      const response = await fetch(`/api/product-mockups/${productId}`)
      if (response.ok) {
        const product = await response.json()
        if (product.image_url) {
          setCustomProductPreview(product.image_url)
        }
        
        // Generate AI suggestions based on product
        generateAISuggestions(product)
      }
    } catch (error) {
      console.error('Error fetching product details:', error)
    }
  }

  const generateAISuggestions = (product: any) => {
    // Mock AI suggestions based on product type
    const suggestions = {
      voiceStyle: 'casual-friendly',
      duration: 30,
      environment: 'home',
      script: `I've been using this ${product.title || 'product'} and I have to say...`
    }
    
    setAiSuggestions(suggestions)
    setShowSuggestions(true)
  }

  const applySuggestions = () => {
    if (aiSuggestions) {
      setVoiceStyle(aiSuggestions.voiceStyle)
      setDuration(aiSuggestions.duration)
      if (aiSuggestions.script) {
        setScript(aiSuggestions.script)
      }
      setShowSuggestions(false)
      
      toast({
        title: "Suggestions Applied",
        description: "AI suggestions have been applied to your ad settings.",
      })
    }
  }

  // Validation function
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    // Check for required product image
    if (mode === 'single') {
      if (!productPreview && !customProductPreview && !selectedProductId) {
        errors.productImage = 'Please select or upload a product image'
      }
    } else {
      // Check for required images in dual/multi mode
      const requiredImageCount = mode === 'dual' ? 2 : 3
      for (let i = 0; i < requiredImageCount; i++) {
        if (!images[i]?.preview && !images[i]?.productId) {
          errors[`image${i + 1}`] = `Please select or upload image ${i + 1}`
        }
      }
    }
    
    // Check for required script
    if (!script.trim()) {
      errors.script = 'Please enter a script for your ad'
    }
    
    // Check for required scene description in multi mode
    if (mode === 'multi' && !mode3SceneDescription.trim()) {
      errors.sceneDescription = 'Please describe the scene for your multi-story ad'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  // Template handler
  const handleTemplateChange = (templateValue: string) => {
    setSelectedTemplate(templateValue)
    
    const templates: Record<string, any> = {
      'product-review': {
        duration: 60,
        voiceStyle: 'casual-friendly',
        script: 'Hey everyone! Today I\'m reviewing this amazing product...'
      },
      'unboxing': {
        duration: 30,
        voiceStyle: 'excited-energetic',
        script: 'Let\'s unbox this together! I\'m so excited to show you what\'s inside...'
      },
      'before-after': {
        duration: 30,
        voiceStyle: 'confident-bold',
        script: 'Watch this transformation! Before using this product vs after...'
      },
      'tutorial': {
        duration: 120,
        voiceStyle: 'professional-clear',
        script: 'In this tutorial, I\'ll show you step by step how to use this product...'
      },
      'comparison': {
        duration: 60,
        voiceStyle: 'professional-clear',
        script: 'Let\'s compare these options and see which one works best...'
      },
      'transformation': {
        duration: 30,
        voiceStyle: 'passionate-warm',
        script: 'You won\'t believe the difference! This product completely transformed...'
      },
      'professional-demo': {
        duration: 60,
        voiceStyle: 'professional-clear',
        script: 'Welcome to this professional demonstration of our product features...'
      },
      'lifestyle': {
        duration: 30,
        voiceStyle: 'sincere-heartfelt',
        script: 'This product has become part of my daily routine...'
      }
    }
    
    const template = templates[templateValue]
    if (template) {
      setDuration(template.duration)
      setVoiceStyle(template.voiceStyle)
      setScript(template.script)
      
      toast({
        title: "Template Applied",
        description: `"${templateValue.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}" settings loaded.`
      })
    }
  }

  // Validation functions
  const validateMode1 = () => {
    const errors: string[] = []
    
    // Check if product image is provided
    if (!useCustomProduct && !selectedProductId) {
      errors.push("Please select a product from your library or upload a custom product image")
    }
    if (useCustomProduct && !customProductFile) {
      errors.push("Please upload a product image")
    }
    
    // Check if script is provided
    if (!script.trim()) {
      errors.push("Please provide a script for your ad")
    }
    
    // Check character requirements if not voiceover
    if (characterPresence === 'show') {
      if (characterSource === 'library' && !selectedAvatarId) {
        errors.push("Please select an avatar from your library")
      }
      if (characterSource === 'upload' && !characterFile) {
        errors.push("Please upload a character image")
      }
      if (characterSource === 'describe' && !characterDescription.trim()) {
        errors.push("Please describe your character")
      }
    }
    
    if (characterPresence === 'partial' && !partialType) {
      errors.push("Please select a partial presence type")
    }
    
    return errors
  }

  const validateMode2 = () => {
    const errors: string[] = []
    
    // Check if both images are provided
    if (images.length < 2) {
      errors.push("Please provide 2 images for dual visual control")
    }
    
    // Check if at least one scene script is provided
    if (!sceneScripts.scene1.trim() && !sceneScripts.scene3.trim()) {
      errors.push("Please provide at least Scene 1 or Scene 3 script")
    }
    
    // Check character requirements if not voiceover
    if (characterPresence === 'show') {
      if (characterSource === 'library' && !selectedAvatarId) {
        errors.push("Please select an avatar from your library")
      }
      if (characterSource === 'upload' && !characterFile) {
        errors.push("Please upload a character image")
      }
      if (characterSource === 'describe' && !characterDescription.trim()) {
        errors.push("Please describe your character")
      }
    }
    
    if (characterPresence === 'partial' && !partialType) {
      errors.push("Please select a partial presence type")
    }
    
    return errors
  }

  const validateMode3 = () => {
    const errors: string[] = []
    
    // Check if all 3 images are provided
    if (images.length < 3) {
      errors.push("Please provide 3 images for multi-story mode")
    }
    
    // Check scene description
    if (!mode3SceneDescription.trim()) {
      errors.push("Please provide a scene description")
    }
    
    // Check script
    if (!script.trim()) {
      errors.push("Please provide a script for your ad")
    }
    
    // Check character requirements if not voiceover
    if (characterPresence === 'show') {
      if (characterSource === 'library' && !selectedAvatarId) {
        errors.push("Please select an avatar from your library")
      }
      if (characterSource === 'upload' && !characterFile) {
        errors.push("Please upload a character image")
      }
      if (characterSource === 'describe' && !characterDescription.trim()) {
        errors.push("Please describe your character")
      }
    }
    
    if (characterPresence === 'partial' && !partialType) {
      errors.push("Please select a partial presence type")
    }
    
    return errors
  }

  const handleGenerate = async () => {
    // Clear previous validation errors
    setValidationErrors({})
    
    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below before generating your ad.",
        variant: "destructive"
      })
      return
    }
    
    setIsGenerating(true)
    
    try {
      const formData = new FormData()
      
      // Add mode-specific data
      formData.append('mode', mode)
      formData.append('template', selectedTemplate)
      formData.append('script', script)
      // Utiliser la valeur custom si "custom" est sélectionné
      formData.append('voiceStyle', voiceStyle === 'custom' ? customVoiceStyle : voiceStyle)
      formData.append('toneOfDelivery', toneOfDelivery === 'custom' ? customToneOfDelivery : toneOfDelivery)
      formData.append('language', language === 'custom' ? customLanguage : language)
      formData.append('duration', duration.toString())
      formData.append('characterPresence', characterPresence)
      
      // Add character data if not voiceover
      if (characterPresence !== 'voiceover') {
        formData.append('characterSource', characterSource)
        if (characterSource === 'library') {
          formData.append('selectedAvatarId', selectedAvatarId)
        } else if (characterSource === 'upload' && characterFile) {
          formData.append('characterFile', characterFile)
        } else if (characterSource === 'describe') {
          formData.append('characterDescription', characterDescription)
        }
        if (characterPresence === 'partial') {
          formData.append('partialType', partialType)
          if (partialType === 'custom') {
            formData.append('characterDescription', characterDescription)
          }
        }
      }
      
      // Add mode-specific data
      if (mode === 'single') {
        if (useCustomProduct && customProductFile) {
          formData.append('productFile', customProductFile)
        } else {
          formData.append('selectedProductId', selectedProductId)
        }
        
        // Ajouter les valeurs custom pour Brand DNA, Product Essence, etc. (Mode Single uniquement)
        formData.append('brandTone', brandTone === 'custom' ? customBrandTone : brandTone)
        formData.append('visualFocus', visualFocus === 'custom' ? customVisualFocus : visualFocus)
        formData.append('coreAngle', coreAngle === 'custom' ? customCoreAngle : coreAngle)
        formData.append('cameraRhythm', cameraRhythm === 'custom' ? customCameraRhythm : cameraRhythm)
        formData.append('musicMood', musicMood === 'custom' ? customMusicMood : musicMood)
      } else if (mode === 'dual') {
        formData.append('twoImageMode', twoImageMode)
        formData.append('sceneScripts', JSON.stringify(sceneScripts))
        images.forEach((img, index) => {
          if (img.file) {
            formData.append(`image${index + 1}`, img.file)
          }
          formData.append(`image${index + 1}Source`, img.source)
          formData.append(`image${index + 1}ContainsBoth`, img.containsBoth.toString())
          formData.append(`image${index + 1}Description`, img.description || '')
        })
      } else if (mode === 'multi') {
        formData.append('sceneDescription', mode3SceneDescription)
        images.forEach((img, index) => {
          if (img.file) {
            formData.append(`image${index + 1}`, img.file)
          }
          formData.append(`image${index + 1}Source`, img.source)
          formData.append(`image${index + 1}Purpose`, img.purpose || '')
          formData.append(`image${index + 1}ContainsBoth`, img.containsBoth.toString())
          formData.append(`image${index + 1}Description`, img.description || '')
        })
      }
      
      // Call API
      const response = await fetch('/api/ugc-ads', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate UGC ad')
      }
      
      const result = await response.json()
      
      toast({
        title: "Success!",
        description: "Your UGC ad has been generated successfully!",
      })
      
      // Handle success (redirect, show result, etc.)
      console.log('Generated UGC ad:', result)
      
    } catch (error) {
      console.error('Error generating UGC ad:', error)
      toast({
        title: "Error",
        description: "Failed to generate UGC ad. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }
  
  // Image upload handler
  const handleProductImageUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive"
      })
      return
    }
    
    try {
      setCustomProductFile(file)
      setProductPreview(URL.createObjectURL(file))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load image preview",
        variant: "destructive"
      })
    }
  }
  
  // Script read time estimation
  const estimateReadTime = (text: string): number => {
    const words = text.trim().split(/\s+/).length
    const wordsPerSecond = 2.5
    return Math.ceil(words / wordsPerSecond)
  }
  
  // Mode 2 image management
  const updateImageSlot = (index: number, updates: Partial<typeof images[0]>) => {
    setImages(prev => {
      const newImages = [...prev]
      newImages[index] = { ...newImages[index], ...updates }
      return newImages
    })
  }
  
  const handleImageUpload = (index: number, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive"
      })
      return
    }
    
    updateImageSlot(index, {
      file,
      preview: URL.createObjectURL(file)
    })
  }
  
  const handleImageProductSelect = (index: number, productId: string) => {
    updateImageSlot(index, { productId })
  }
  
  const getModeDescription = () => {
    switch (mode) {
      case 'single':
        return 'Perfect for product reviews, demos, and unboxing. Focus on one product with optional character presence. Up to 2 minutes.'
      case 'dual':
        return 'Use 2 images for cinematic transitions, before/after reveals, product comparisons, or start/end frame control. Up to 2 minutes.'
      case 'multi':
        return 'Use up to 3 images for product bundles, tutorials, or complex narratives. Control character design, lighting, and environment. Up to 2 minutes.'
      default:
        return ''
    }
  }

  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-4 h-full overflow-hidden flex flex-col relative min-h-0">
      {/* Disabled overlay during generation */}
      {isGenerating && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-purple-600" />
            <p className="text-sm font-medium text-foreground">Generating your UGC ad...</p>
            <p className="text-xs text-muted-foreground mt-1">This may take a few moments</p>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto scrollbar-hover min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎬 UGC Ads Generator
            </h3>
            <p className="text-xs text-muted-foreground">
              {projectTitle}
            </p>
          </div>
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="h-6 w-6 shrink-0"
            aria-label="Close UGC Ads Generator"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Mode Selection Tabs */}
        <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)} className="w-full mb-4">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="single" className="text-xs py-2 px-1 data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
              <Package className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Single</span>
            </TabsTrigger>
            <TabsTrigger value="dual" className="text-xs py-2 px-1 data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
              <Film className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Dual</span>
            </TabsTrigger>
            <TabsTrigger value="multi" className="text-xs py-2 px-1 data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
              <Users className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Multi</span>
            </TabsTrigger>
          </TabsList>

          {/* Mode Description */}
          <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-xs text-purple-700 dark:text-purple-300 flex items-start gap-2">
              <Sparkles className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span className="leading-tight">{getModeDescription()}</span>
            </p>
          </div>

          {/* Mode 1: Single Product Showcase */}
          <TabsContent value="single" className="space-y-4 mt-4" data-mode="single">
            {/* Template Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-purple-600" />
                Quick Start Template (Optional)
              </label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Choose a template to get started quickly..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product-review">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex-shrink-0">⭐</span>
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <span className="font-medium text-xs truncate">Product Review</span>
                        <span className="text-[10px] text-muted-foreground truncate">Honest review & recommendation</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="unboxing">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex-shrink-0">📦</span>
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <span className="font-medium text-xs truncate">Unboxing</span>
                        <span className="text-[10px] text-muted-foreground truncate">First impressions & reveal</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="before-after">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex-shrink-0">🔄</span>
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <span className="font-medium text-xs truncate">Before/After</span>
                        <span className="text-[10px] text-muted-foreground truncate">Show the transformation</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="tutorial">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex-shrink-0">📚</span>
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <span className="font-medium text-xs truncate">Tutorial</span>
                        <span className="text-[10px] text-muted-foreground truncate">Step-by-step guide</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="comparison">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex-shrink-0">⚖️</span>
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <span className="font-medium text-xs truncate">Comparison</span>
                        <span className="text-[10px] text-muted-foreground truncate">Compare features & benefits</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="transformation">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex-shrink-0">✨</span>
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <span className="font-medium text-xs truncate">Transformation</span>
                        <span className="text-[10px] text-muted-foreground truncate">Dramatic change reveal</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="professional-demo">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex-shrink-0">💼</span>
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <span className="font-medium text-xs truncate">Professional Demo</span>
                        <span className="text-[10px] text-muted-foreground truncate">Detailed product showcase</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="lifestyle">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex-shrink-0">🎨</span>
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <span className="font-medium text-xs truncate">Lifestyle</span>
                        <span className="text-[10px] text-muted-foreground truncate">Product in daily life</span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Image Section */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <ShoppingBag className="h-3 w-3 text-purple-600" />
                Product Image <span className="text-red-500">*</span>
              </label>
              
              {/* Source Toggle */}
              <div className="flex gap-1 p-1 bg-muted/20 rounded-lg border border-border/50">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setProductSource('library')
                    setUseCustomProduct(false)
                  }}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    productSource === 'library'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <span className="truncate">From Library</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setProductSource('upload')
                    setUseCustomProduct(true)
                  }}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    productSource === 'upload'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <span className="truncate">Upload Image</span>
                </Button>
              </div>

              {/* Library Selection */}
              {productSource === 'library' && (
                <div className="space-y-2">
                  {loadingProducts ? (
                    <div className="space-y-2">
                      <SkeletonLoader className="h-8 w-full" />
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading products...
                      </div>
                    </div>
                  ) : (
                    <Select value={selectedProductId} onValueChange={handleProductSelect}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select a product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.length === 0 ? (
                          <SelectItem value="none" disabled>No products available</SelectItem>
                        ) : (
                          availableProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id} className="text-xs">
                              {product.title || product.name || 'Untitled Product'}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Upload */}
              {productSource === 'upload' && (
                <div className="space-y-2">
                  <input
                    ref={productImageInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleProductImageUpload(file)
                    }}
                  />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => productImageInputRef.current?.click()}
                          className="w-full h-8 text-xs"
                          aria-label="Upload product image"
                        >
                          <Upload className="h-3 w-3 mr-2" />
                          Choose Image
                        </Button>
                  <p className="text-[10px] text-muted-foreground">JPG, JPEG, PNG (max 10MB)</p>
                </div>
              )}

              {/* Preview */}
              {(productPreview || customProductPreview) && (
                <div className="relative w-full h-32 bg-muted/30 rounded-lg overflow-hidden border">
                  <img
                    src={productPreview ?? customProductPreview ?? ''}
                    alt={selectedProductId ? `Product preview for ${availableProducts.find(p => p.id === selectedProductId)?.title || 'selected product'}` : 'Uploaded product image preview'}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Validation Error */}
              {validationErrors.productImage && (
                <div className="text-xs text-red-500 flex items-center gap-1">
                  <span>⚠️</span>
                  {validationErrors.productImage}
                </div>
              )}

              {/* AI Smart Suggestions */}
              {showSuggestions && aiSuggestions && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="text-xs font-medium text-foreground flex items-center gap-2 mb-2">
                    <Lightbulb className="h-3 w-3 text-purple-600" />
                    💡 AI Suggestions
                  </h4>
                  <ul className="text-[10px] text-muted-foreground space-y-1 mb-3">
                    <li>Voice Style: {aiSuggestions.voiceStyle}</li>
                    <li>Duration: {aiSuggestions.duration}s</li>
                    <li>Environment: {aiSuggestions.environment}</li>
                  </ul>
                  <Button 
                    type="button"
                    onClick={applySuggestions}
                    size="sm"
                    className="h-6 text-[10px] px-2"
                  >
                    Apply All
                  </Button>
                </div>
              )}

              {/* Contains Both Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contains-both"
                  checked={containsBoth}
                  onCheckedChange={(checked) => setContainsBoth(checked as boolean)}
                />
                <label
                  htmlFor="contains-both"
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  This image contains both character and product
                </label>
              </div>

              {/* Optional Description */}
              <Input
                placeholder="Describe the product or how to use this image (optional)..."
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            {/* Character Presence Section */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Users className="h-3 w-3 text-purple-600" />
                Character Presence (Optional)
              </label>
              
              <div className="grid grid-cols-1 gap-2 p-1 bg-muted/20 rounded-lg border border-border/50">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCharacterPresence('voiceover')}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    characterPresence === 'voiceover'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  🎙️ Voiceover
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCharacterPresence('show')}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    characterPresence === 'show'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  👤 Show
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCharacterPresence('partial')}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    characterPresence === 'partial'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  ✋ Partial
                </Button>
              </div>
            </div>

            {/* Character Selection (when not voiceover) */}
            {characterPresence !== 'voiceover' && (
              <div className="space-y-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <label className="text-xs font-medium text-foreground flex items-center gap-2">
                  <Users className="h-3 w-3 text-purple-600" />
                  {characterPresence === 'show' ? 'Choose Your Character' : 'Partial Presence Type'}
                </label>

                {characterPresence === 'show' ? (
                  <>
                    {/* Character Source Toggle */}
                    <div className="grid grid-cols-1 gap-2 p-1 bg-muted/20 rounded-lg border border-border/50">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCharacterSource('library')}
                        className={`text-xs h-8 transition-all duration-200 font-medium ${
                          characterSource === 'library'
                            ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <span className="truncate">From Library</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCharacterSource('upload')}
                        className={`text-xs h-8 transition-all duration-200 font-medium ${
                          characterSource === 'upload'
                            ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <span className="truncate">Upload Image</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCharacterSource('describe')}
                        className={`text-xs h-8 transition-all duration-200 font-medium ${
                          characterSource === 'describe'
                            ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                      >
                        Describe Character
                      </Button>
                    </div>

                    {/* Avatar Library Selection */}
                    {characterSource === 'library' && (
                      loadingAvatars ? (
                        <div className="space-y-2">
                          <SkeletonLoader className="h-8 w-full" />
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading avatars...
                          </div>
                        </div>
                      ) : (
                        <Select value={selectedAvatarId} onValueChange={setSelectedAvatarId}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select an avatar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableAvatars.length === 0 ? (
                              <SelectItem value="none" disabled>No avatars available</SelectItem>
                            ) : (
                              availableAvatars.map((avatar) => (
                                <SelectItem key={avatar.id} value={avatar.id} className="text-xs">
                                  {avatar.title || avatar.name || 'Untitled Avatar'}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )
                    )}

                    {/* Character Upload */}
                    {characterSource === 'upload' && (
                      <div className="space-y-2">
                        <input
                          ref={characterImageInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleCharacterImageUpload(file)
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => characterImageInputRef.current?.click()}
                          className="w-full h-8 text-xs"
                          aria-label="Upload character image"
                        >
                          <Upload className="h-3 w-3 mr-2" />
                          Choose Character Image
                        </Button>
                        <p className="text-[10px] text-muted-foreground">JPG, JPEG, PNG (max 10MB)</p>
                      </div>
                    )}

                    {/* Character Description */}
                    {characterSource === 'describe' && (
                      <Textarea
                        placeholder="Describe your character... e.g., 'A friendly 25-year-old woman with curly brown hair, wearing casual clothes, smiling warmly'"
                        value={characterDescription}
                        onChange={(e) => setCharacterDescription(e.target.value)}
                        rows={3}
                        className="resize-none text-xs"
                      />
                    )}

                    {/* Character Preview */}
                    {characterPreview && (
                      <div className="relative w-full h-32 bg-muted/30 rounded-lg overflow-hidden border">
                        <img
                          src={characterPreview}
                          alt={selectedAvatarId ? `Character preview for ${availableAvatars.find(a => a.id === selectedAvatarId)?.name || 'selected character'}` : 'Uploaded character image preview'}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  /* Partial Presence Options */
                  <Select value={partialType} onValueChange={setPartialType}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="What part of the character should appear?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hands">✋ Hands Only</SelectItem>
                      <SelectItem value="face">👤 Face Close-up</SelectItem>
                      <SelectItem value="feet">🦶 Feet/Legs</SelectItem>
                      <SelectItem value="silhouette">👥 Silhouette</SelectItem>
                      <SelectItem value="custom">🎨 Custom</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Custom Partial Description */}
                {characterPresence === 'partial' && partialType === 'custom' && (
                  <Textarea
                    placeholder="Describe the partial presence... e.g., 'Just the hands holding the product, or a silhouette in the background'"
                    value={characterDescription}
                    onChange={(e) => setCharacterDescription(e.target.value)}
                    rows={2}
                    className="resize-none text-xs"
                  />
                )}
              </div>
            )}

            {/* Character Selection (when not voiceover) */}
            {characterPresence !== 'voiceover' && (
              <div className="space-y-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <label className="text-xs font-medium text-foreground flex items-center gap-2">
                  <Users className="h-3 w-3 text-purple-600" />
                  {characterPresence === 'show' ? 'Choose Your Character' : 'Partial Presence Type'}
                </label>

                {characterPresence === 'show' ? (
                  <>
                    {/* Character Source Toggle */}
                    <div className="grid grid-cols-1 gap-2 p-1 bg-muted/20 rounded-lg border border-border/50">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCharacterSource('library')}
                        className={`text-xs h-8 transition-all duration-200 font-medium ${
                          characterSource === 'library'
                            ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <span className="truncate">From Library</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCharacterSource('upload')}
                        className={`text-xs h-8 transition-all duration-200 font-medium ${
                          characterSource === 'upload'
                            ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <span className="truncate">Upload Image</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCharacterSource('describe')}
                        className={`text-xs h-8 transition-all duration-200 font-medium ${
                          characterSource === 'describe'
                            ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                      >
                        Describe Character
                      </Button>
                    </div>

                    {/* Avatar Library Selection */}
                    {characterSource === 'library' && (
                      loadingAvatars ? (
                        <div className="space-y-2">
                          <SkeletonLoader className="h-8 w-full" />
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading avatars...
                          </div>
                        </div>
                      ) : (
                        <Select value={selectedAvatarId} onValueChange={setSelectedAvatarId}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select an avatar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableAvatars.length === 0 ? (
                              <SelectItem value="none" disabled>No avatars available</SelectItem>
                            ) : (
                              availableAvatars.map((avatar) => (
                                <SelectItem key={avatar.id} value={avatar.id} className="text-xs">
                                  {avatar.title || avatar.name || 'Untitled Avatar'}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )
                    )}

                    {/* Character Upload */}
                    {characterSource === 'upload' && (
                      <div className="space-y-2">
                        <input
                          ref={characterImageInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleCharacterImageUpload(file)
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => characterImageInputRef.current?.click()}
                          className="w-full h-8 text-xs"
                          aria-label="Upload character image"
                        >
                          <Upload className="h-3 w-3 mr-2" />
                          Choose Character Image
                        </Button>
                        <p className="text-[10px] text-muted-foreground">JPG, JPEG, PNG (max 10MB)</p>
                      </div>
                    )}

                    {/* Character Description */}
                    {characterSource === 'describe' && (
                      <Textarea
                        placeholder="Describe your character... e.g., 'A friendly 25-year-old woman with curly brown hair, wearing casual clothes, smiling warmly'"
                        value={characterDescription}
                        onChange={(e) => setCharacterDescription(e.target.value)}
                        rows={3}
                        className="resize-none text-xs"
                      />
                    )}

                    {/* Character Preview */}
                    {characterPreview && (
                      <div className="relative w-full h-32 bg-muted/30 rounded-lg overflow-hidden border">
                        <img
                          src={characterPreview}
                          alt={selectedAvatarId ? `Character preview for ${availableAvatars.find(a => a.id === selectedAvatarId)?.name || 'selected character'}` : 'Uploaded character image preview'}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  /* Partial Presence Options */
                  <Select value={partialType} onValueChange={setPartialType}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="What part of the character should appear?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hands">✋ Hands Only</SelectItem>
                      <SelectItem value="face">👤 Face Close-up</SelectItem>
                      <SelectItem value="feet">🦶 Feet/Legs</SelectItem>
                      <SelectItem value="silhouette">👥 Silhouette</SelectItem>
                      <SelectItem value="custom">🎨 Custom</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Custom Partial Description */}
                {characterPresence === 'partial' && partialType === 'custom' && (
                  <Textarea
                    placeholder="Describe the partial presence... e.g., 'Just the hands holding the product, or a silhouette in the background'"
                    value={characterDescription}
                    onChange={(e) => setCharacterDescription(e.target.value)}
                    rows={2}
                    className="resize-none text-xs"
                  />
                )}
              </div>
            )}

            {/* Script Section */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <MessageCircle className="h-3 w-3 text-purple-600" />
                Script / Voice <span className="text-red-500">*</span>
              </label>
              
              <Textarea
                placeholder="Write your script here... What will be said in the ad?"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={4}
                className="resize-none text-xs"
              />
              
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{script.length} characters</span>
                <span>
                  Estimated read time: {estimateReadTime(script)}s
                  {estimateReadTime(script) > duration && script.length > 0 && (
                    <span className="text-red-500 ml-2">⚠️ Too long for {duration}s video</span>
                  )}
                </span>
              </div>

              {/* Voice Configuration */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Voice Style</label>
                  <Select value={voiceStyle} onValueChange={setVoiceStyle}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select style..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual-friendly" className="text-xs">😊 Casual & Friendly</SelectItem>
                      <SelectItem value="excited-energetic" className="text-xs">🎉 Excited & Energetic</SelectItem>
                      <SelectItem value="confident-bold" className="text-xs">💪 Confident & Bold</SelectItem>
                      <SelectItem value="calm-soothing" className="text-xs">🧘 Calm & Soothing</SelectItem>
                      <SelectItem value="professional-clear" className="text-xs">👔 Professional & Clear</SelectItem>
                      <SelectItem value="passionate-warm" className="text-xs">🔥 Passionate & Warm</SelectItem>
                      <SelectItem value="cool-minimalist" className="text-xs">❄️ Cool & Minimalist</SelectItem>
                      <SelectItem value="dramatic-theatrical" className="text-xs">🎭 Dramatic & Theatrical</SelectItem>
                      <SelectItem value="sincere-heartfelt" className="text-xs">💝 Sincere & Heartfelt</SelectItem>
                      <SelectItem value="playful-humorous" className="text-xs">😄 Playful & Humorous</SelectItem>
                      <SelectItem value="custom" className="text-xs">✏️ Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {voiceStyle === 'custom' && (
                    <Input
                      value={customVoiceStyle}
                      onChange={(e) => setCustomVoiceStyle(e.target.value)}
                      placeholder="Enter custom voice style..."
                      className="h-8 text-xs mt-2"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Tone of Delivery</label>
                  <Select value={toneOfDelivery} onValueChange={setToneOfDelivery}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select tone..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="natural" className="text-xs">💬 Natural & Conversational</SelectItem>
                      <SelectItem value="slow" className="text-xs">🐌 Slow & Emphasised</SelectItem>
                      <SelectItem value="fast" className="text-xs">⚡ Fast & Punchy</SelectItem>
                      <SelectItem value="whisper" className="text-xs">🤫 Whisper & Intimate</SelectItem>
                      <SelectItem value="loud" className="text-xs">📢 Loud & Commanding</SelectItem>
                      <SelectItem value="custom" className="text-xs">✏️ Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {toneOfDelivery === 'custom' && (
                    <Input
                      value={customToneOfDelivery}
                      onChange={(e) => setCustomToneOfDelivery(e.target.value)}
                      placeholder="Enter custom tone of delivery..."
                      className="h-8 text-xs mt-2"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select language..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en" className="text-xs">🇺🇸 English</SelectItem>
                      <SelectItem value="es" className="text-xs">🇪🇸 Spanish</SelectItem>
                      <SelectItem value="fr" className="text-xs">🇫🇷 French</SelectItem>
                      <SelectItem value="de" className="text-xs">🇩🇪 German</SelectItem>
                      <SelectItem value="it" className="text-xs">🇮🇹 Italian</SelectItem>
                      <SelectItem value="pt" className="text-xs">🇵🇹 Portuguese</SelectItem>
                      <SelectItem value="zh" className="text-xs">🇨🇳 Chinese</SelectItem>
                      <SelectItem value="ja" className="text-xs">🇯🇵 Japanese</SelectItem>
                      <SelectItem value="ko" className="text-xs">🇰🇷 Korean</SelectItem>
                      <SelectItem value="custom" className="text-xs">🌐 Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {language === 'custom' && (
                    <Input
                      value={customLanguage}
                      onChange={(e) => setCustomLanguage(e.target.value)}
                      placeholder="Enter custom language..."
                      className="h-8 text-xs mt-2"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Duration Presets */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Clock className="h-3 w-3 text-purple-600" />
                Video Duration
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={duration === 15 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(15)}
                  className="h-8 text-xs"
                >
                  ⚡ 15s
                </Button>
                <Button
                  type="button"
                  variant={duration === 30 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(30)}
                  className="h-8 text-xs"
                >
                  📱 30s
                </Button>
                <Button
                  type="button"
                  variant={duration === 60 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(60)}
                  className="h-8 text-xs"
                >
                  🎬 60s
                </Button>
                <Button
                  type="button"
                  variant={duration === 120 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(120)}
                  className="h-8 text-xs"
                >
                  🎥 120s
                </Button>
              </div>
              
              <p className="text-[10px] text-muted-foreground">
                {duration === 15 && '⚡ Perfect for TikTok and Instagram Reels'}
                {duration === 30 && '📱 Ideal for social media feeds'}
                {duration === 60 && '🎬 Standard YouTube and Facebook ads'}
                {duration === 120 && '🎥 Full-length product demonstrations'}
              </p>
            </div>

             {/* Advanced Fields (Collapsible) */}
             <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
               <CollapsibleTrigger asChild>
                 <Button variant="ghost" className="w-full justify-between h-8 text-xs">
                   <span className="flex items-center gap-2">
                     <Settings className="h-3 w-3" />
                     Advanced Creative Controls
                   </span>
                   {showAdvanced ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                 </Button>
               </CollapsibleTrigger>
               
               <CollapsibleContent className="space-y-4 mt-3">
                 {/* Brand DNA */}
                 <div className="p-3 bg-purple-50/50 dark:bg-purple-950/10 rounded-lg border border-purple-200 dark:border-purple-800">
                   <label className="text-xs font-medium text-foreground flex items-center gap-2 mb-2">
                     <Palette className="h-3 w-3 text-purple-600" />
                     Brand DNA
                   </label>
                   <div className="space-y-2">
                     <Input placeholder="Brand name (optional)" className="h-8 text-xs" />
                     <Select value={brandTone} onValueChange={setBrandTone}>
                       <SelectTrigger className="h-8 text-xs">
                         <SelectValue placeholder="Brand tone..." />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="professional">💼 Professional & Trustworthy</SelectItem>
                         <SelectItem value="friendly">😊 Friendly & Approachable</SelectItem>
                         <SelectItem value="luxury">💎 Luxury & Premium</SelectItem>
                         <SelectItem value="playful">🎉 Playful & Fun</SelectItem>
                         <SelectItem value="minimalist">✨ Minimalist & Clean</SelectItem>
                         <SelectItem value="custom">✏️ Custom</SelectItem>
                       </SelectContent>
                     </Select>
                     {brandTone === 'custom' && (
                       <Input
                         value={customBrandTone}
                         onChange={(e) => setCustomBrandTone(e.target.value)}
                         placeholder="Enter custom brand tone..."
                         className="h-8 text-xs"
                       />
                     )}
                     <Input placeholder="Brand color (hex code, optional)" className="h-8 text-xs" />
                   </div>
                 </div>

                 {/* Product Essence */}
                 <div className="p-3 bg-pink-50/50 dark:bg-pink-950/10 rounded-lg border border-pink-200 dark:border-pink-800">
                   <label className="text-xs font-medium text-foreground flex items-center gap-2 mb-2">
                     <Package className="h-3 w-3 text-pink-600" />
                     Product Essence
                   </label>
                   <div className="space-y-2">
                     <Textarea placeholder="Hero benefit - what makes this product special?" rows={2} className="resize-none text-xs" />
                     <Select value={visualFocus} onValueChange={setVisualFocus}>
                       <SelectTrigger className="h-8 text-xs">
                         <SelectValue placeholder="Visual focus..." />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="product">🔍 Product Close-up</SelectItem>
                         <SelectItem value="lifestyle">🏠 Lifestyle Context</SelectItem>
                         <SelectItem value="comparison">⚖️ Before/After</SelectItem>
                         <SelectItem value="process">⚙️ Usage Process</SelectItem>
                         <SelectItem value="custom">✏️ Custom</SelectItem>
                       </SelectContent>
                     </Select>
                     {visualFocus === 'custom' && (
                       <Input
                         value={customVisualFocus}
                         onChange={(e) => setCustomVisualFocus(e.target.value)}
                         placeholder="Enter custom visual focus..."
                         className="h-8 text-xs"
                       />
                     )}
                     <Select>
                       <SelectTrigger className="h-8 text-xs">
                         <SelectValue placeholder="Environment..." />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="home">Home Setting</SelectItem>
                         <SelectItem value="office">Office/Work</SelectItem>
                         <SelectItem value="outdoor">Outdoor</SelectItem>
                         <SelectItem value="studio">Studio/Neutral</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </div>

                 {/* Creative Angle */}
                 <div className="p-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-lg border border-blue-200 dark:border-blue-800">
                   <label className="text-xs font-medium text-foreground flex items-center gap-2 mb-2">
                     <Lightbulb className="h-3 w-3 text-blue-600" />
                     Creative Angle
                   </label>
                   <div className="space-y-2">
                     <Select value={coreAngle} onValueChange={setCoreAngle}>
                       <SelectTrigger className="h-8 text-xs">
                         <SelectValue placeholder="Core angle..." />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="problem-solution">🔧 Problem & Solution</SelectItem>
                         <SelectItem value="transformation">🦋 Transformation Story</SelectItem>
                         <SelectItem value="social-proof">👥 Social Proof</SelectItem>
                         <SelectItem value="urgency">⏰ Urgency & Scarcity</SelectItem>
                         <SelectItem value="emotional">💝 Emotional Connection</SelectItem>
                         <SelectItem value="custom">✏️ Custom</SelectItem>
                       </SelectContent>
                     </Select>
                     {coreAngle === 'custom' && (
                       <Input
                         value={customCoreAngle}
                         onChange={(e) => setCustomCoreAngle(e.target.value)}
                         placeholder="Enter custom creative angle..."
                         className="h-8 text-xs"
                       />
                     )}
                     <Input placeholder="Pattern interrupt - unexpected element" className="h-8 text-xs" />
                     <Textarea placeholder="Hook framework - opening line" rows={2} className="resize-none text-xs" />
                   </div>
                 </div>

                 {/* Camera DNA */}
                 <div className="p-3 bg-green-50/50 dark:bg-green-950/10 rounded-lg border border-green-200 dark:border-green-800">
                   <label className="text-xs font-medium text-foreground flex items-center gap-2 mb-2">
                     <Camera className="h-3 w-3 text-green-600" />
                     Camera DNA
                   </label>
                   <div className="space-y-2">
                     <Select value={cameraRhythm} onValueChange={setCameraRhythm}>
                       <SelectTrigger className="h-8 text-xs">
                         <SelectValue placeholder="Rhythm..." />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="fast">⚡ Fast & Dynamic</SelectItem>
                         <SelectItem value="medium">🎯 Medium Pace</SelectItem>
                         <SelectItem value="slow">🎬 Slow & Cinematic</SelectItem>
                         <SelectItem value="varied">🎭 Varied Rhythm</SelectItem>
                         <SelectItem value="custom">✏️ Custom</SelectItem>
                       </SelectContent>
                     </Select>
                     {cameraRhythm === 'custom' && (
                       <Input
                         value={customCameraRhythm}
                         onChange={(e) => setCustomCameraRhythm(e.target.value)}
                         placeholder="Enter custom camera rhythm..."
                         className="h-8 text-xs"
                       />
                     )}
                     <Select>
                       <SelectTrigger className="h-8 text-xs">
                         <SelectValue placeholder="Movement..." />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="static">📷 Static Shots</SelectItem>
                         <SelectItem value="pan">📹 Pan & Tilt</SelectItem>
                         <SelectItem value="zoom">🔍 Zoom In/Out</SelectItem>
                         <SelectItem value="tracking">🎥 Tracking Movement</SelectItem>
                       </SelectContent>
                     </Select>
                     <Select>
                       <SelectTrigger className="h-8 text-xs">
                         <SelectValue placeholder="Cut frequency..." />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="slow">Slow Cuts (2-3s)</SelectItem>
                         <SelectItem value="medium">Medium Cuts (1-2s)</SelectItem>
                         <SelectItem value="fast">Fast Cuts (&lt;1s)</SelectItem>
                         <SelectItem value="mixed">Mixed Pacing</SelectItem>
                       </SelectContent>
                     </Select>
                     <Select>
                       <SelectTrigger className="h-8 text-xs">
                         <SelectValue placeholder="Ending..." />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="fade">Fade Out</SelectItem>
                         <SelectItem value="cut">Hard Cut</SelectItem>
                         <SelectItem value="zoom">Zoom to Logo</SelectItem>
                         <SelectItem value="hold">Hold Final Frame</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </div>

                 {/* Audio DNA */}
                 <div className="p-3 bg-orange-50/50 dark:bg-orange-950/10 rounded-lg border border-orange-200 dark:border-orange-800">
                   <label className="text-xs font-medium text-foreground flex items-center gap-2 mb-2">
                     <Music className="h-3 w-3 text-orange-600" />
                     Audio DNA
                   </label>
                   <div className="space-y-2">
                     <Select value={musicMood} onValueChange={setMusicMood}>
                       <SelectTrigger className="h-8 text-xs">
                         <SelectValue placeholder="Music mood..." />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="upbeat">🎉 Upbeat & Energetic</SelectItem>
                         <SelectItem value="calm">🧘 Calm & Relaxing</SelectItem>
                         <SelectItem value="dramatic">🎭 Dramatic & Intense</SelectItem>
                         <SelectItem value="playful">🎪 Playful & Fun</SelectItem>
                         <SelectItem value="corporate">🏢 Corporate & Professional</SelectItem>
                         <SelectItem value="custom">✏️ Custom</SelectItem>
                       </SelectContent>
                     </Select>
                     {musicMood === 'custom' && (
                       <Input
                         value={customMusicMood}
                         onChange={(e) => setCustomMusicMood(e.target.value)}
                         placeholder="Enter custom music mood..."
                         className="h-8 text-xs"
                       />
                     )}
                     <div className="space-y-1">
                       <label className="text-[10px] font-medium text-muted-foreground">Sound Effects</label>
                       <div className="flex flex-wrap gap-1">
                         {['Click', 'Whoosh', 'Pop', 'Chime', 'Applause', 'Custom'].map((effect) => (
                           <Button key={effect} variant="outline" size="sm" className="h-6 text-[10px] px-2">
                             {effect}
                           </Button>
                         ))}
                       </div>
                     </div>
                     <Select>
                       <SelectTrigger className="h-8 text-xs">
                         <SelectValue placeholder="Sound mode..." />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="voice-over">Voice Over Music</SelectItem>
                         <SelectItem value="music-only">Music Only</SelectItem>
                         <SelectItem value="ambient">Ambient Sounds</SelectItem>
                         <SelectItem value="mixed">Mixed Audio</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </div>
               </CollapsibleContent>
             </Collapsible>
           </TabsContent>

          {/* Mode 2: Dual Visual Control */}
          <TabsContent value="dual" className="space-y-4 mt-4" data-mode="dual">
            {/* 2-Image Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Film className="h-3 w-3 text-purple-600" />
                2-Image Mode <span className="text-red-500">*</span>
              </label>
              <Select value={twoImageMode} onValueChange={(v) => setTwoImageMode(v as typeof twoImageMode)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="How should we use these 2 images?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start-end">
                    <div className="flex items-center gap-2">
                      <span>🎬</span>
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-xs">Start & End Frame Control</span>
                        <span className="text-[10px] text-muted-foreground">Smooth AI transition between frames</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="comparison">
                    <div className="flex items-center gap-2">
                      <span>⚖️</span>
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-xs">Product Comparison</span>
                        <span className="text-[10px] text-muted-foreground">Side-by-side or sequential</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="transformation">
                    <div className="flex items-center gap-2">
                      <span>🔄</span>
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-xs">Before & After Transformation</span>
                        <span className="text-[10px] text-muted-foreground">Visual metamorphosis</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="flexible">
                    <div className="flex items-center gap-2">
                      <span>✨</span>
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-xs">Flexible (Product + Reference)</span>
                        <span className="text-[10px] text-muted-foreground">One product, one style reference</span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image 1 */}
            <div className="space-y-2 p-3 bg-purple-50/50 dark:bg-purple-950/10 rounded-lg border border-purple-200 dark:border-purple-800">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <ShoppingBag className="h-3 w-3 text-purple-600" />
                Image 1 {twoImageMode === 'start-end' ? '(Start Frame)' : twoImageMode === 'transformation' ? '(Before)' : ''} <span className="text-red-500">*</span>
              </label>
              
              {/* Source Toggle */}
              <div className="grid grid-cols-1 gap-2 p-1 bg-muted/20 rounded-lg border border-border/50">
                <Button
                    type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateImageSlot(0, { source: 'library' })}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    images[0]?.source === 'library'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <span className="truncate">From Library</span>
                </Button>
                <Button
                    type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateImageSlot(0, { source: 'upload' })}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    images[0]?.source === 'upload'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  Upload
                </Button>
              </div>

              {/* Library Selection */}
              {images[0]?.source === 'library' && (
                <Select value={images[0]?.productId || ''} onValueChange={(v) => handleImageProductSelect(0, v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProducts ? (
                      <SelectItem value="loading" disabled>Loading products...</SelectItem>
                    ) : availableProducts.length === 0 ? (
                      <SelectItem value="none" disabled>No products available</SelectItem>
                    ) : (
                      availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id} className="text-xs">
                          {product.title || product.name || 'Untitled Product'}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}

              {/* Upload */}
              {images[0]?.source === 'upload' && (
                <div className="space-y-2">
                  <input
                    ref={image1InputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(0, file)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                          onClick={() => image1InputRef.current?.click()}
                          className="w-full h-8 text-xs"
                          aria-label="Upload image 1"
                        >
                          <Upload className="h-3 w-3 mr-2" />
                          Choose Image 1
                  </Button>
                  <p className="text-[10px] text-muted-foreground">JPG, JPEG, PNG (max 10MB)</p>
                </div>
              )}

              {/* Preview */}
              {images[0]?.preview && (
                <div className="relative w-full h-32 bg-muted/30 rounded-lg overflow-hidden border">
                  <img
                    src={images[0].preview}
                    alt={`Image 1 preview - ${images[0]?.purpose || 'product visual'}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Contains Both Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contains-both-1"
                  checked={images[0]?.containsBoth || false}
                  onCheckedChange={(checked) => updateImageSlot(0, { containsBoth: checked as boolean })}
                />
                <label htmlFor="contains-both-1" className="text-xs text-muted-foreground cursor-pointer">
                  This image contains both character and product
                </label>
              </div>

              {/* Optional Description */}
              <Input
                placeholder="Describe this image or how to use it (optional)..."
                value={images[0]?.description || ''}
                onChange={(e) => updateImageSlot(0, { description: e.target.value })}
                className="h-8 text-xs"
              />
              
              {/* Validation Error */}
              {validationErrors.image1 && (
                <div className="text-xs text-red-500 flex items-center gap-1">
                  <span>⚠️</span>
                  {validationErrors.image1}
                </div>
              )}
            </div>

            {/* Image 2 */}
            <div className="space-y-2 p-3 bg-pink-50/50 dark:bg-pink-950/10 rounded-lg border border-pink-200 dark:border-pink-800">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <ShoppingBag className="h-3 w-3 text-pink-600" />
                Image 2 {twoImageMode === 'start-end' ? '(End Frame)' : twoImageMode === 'transformation' ? '(After)' : ''} <span className="text-red-500">*</span>
              </label>
              
              {/* Source Toggle */}
              <div className="grid grid-cols-1 gap-2 p-1 bg-muted/20 rounded-lg border border-border/50">
                <Button
                    type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateImageSlot(1, { source: 'library' })}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    images[1]?.source === 'library'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <span className="truncate">From Library</span>
                </Button>
                <Button
                    type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateImageSlot(1, { source: 'upload' })}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    images[1]?.source === 'upload'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  Upload
                </Button>
              </div>

              {/* Library Selection */}
              {images[1]?.source === 'library' && (
                <Select value={images[1]?.productId || ''} onValueChange={(v) => handleImageProductSelect(1, v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProducts ? (
                      <SelectItem value="loading" disabled>Loading products...</SelectItem>
                    ) : availableProducts.length === 0 ? (
                      <SelectItem value="none" disabled>No products available</SelectItem>
                    ) : (
                      availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id} className="text-xs">
                          {product.title || product.name || 'Untitled Product'}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}

              {/* Upload */}
              {images[1]?.source === 'upload' && (
                <div className="space-y-2">
                  <input
                    ref={image2InputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(1, file)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                          onClick={() => image2InputRef.current?.click()}
                          className="w-full h-8 text-xs"
                          aria-label="Upload image 2"
                        >
                          <Upload className="h-3 w-3 mr-2" />
                          Choose Image 2
                  </Button>
                  <p className="text-[10px] text-muted-foreground">JPG, JPEG, PNG (max 10MB)</p>
                </div>
              )}

              {/* Preview */}
              {images[1]?.preview && (
                <div className="relative w-full h-32 bg-muted/30 rounded-lg overflow-hidden border">
                  <img
                    src={images[1].preview}
                    alt={`Image 2 preview - ${images[1]?.purpose || 'product visual'}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Contains Both Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contains-both-2"
                  checked={images[1]?.containsBoth || false}
                  onCheckedChange={(checked) => updateImageSlot(1, { containsBoth: checked as boolean })}
                />
                <label htmlFor="contains-both-2" className="text-xs text-muted-foreground cursor-pointer">
                  This image contains both character and product
                </label>
              </div>

              {/* Optional Description */}
              <Input
                placeholder="Describe this image or how to use it (optional)..."
                value={images[1]?.description || ''}
                onChange={(e) => updateImageSlot(1, { description: e.target.value })}
                className="h-8 text-xs"
              />
              
              {/* Validation Error */}
              {validationErrors.image2 && (
                <div className="text-xs text-red-500 flex items-center gap-1">
                  <span>⚠️</span>
                  {validationErrors.image2}
                </div>
              )}
            </div>

            {/* Scene-Based Script Input */}
            <div className="space-y-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <MessageCircle className="h-3 w-3 text-purple-600" />
                Scene-Based Script <span className="text-red-500">*</span>
              </label>

              {/* Scene 1 */}
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-purple-700 dark:text-purple-300">
                  Scene 1: Opening {twoImageMode === 'start-end' ? '(Start Frame)' : twoImageMode === 'transformation' ? '(Before)' : '(Image 1)'}
                </label>
                <Textarea
                  placeholder="What's said during the first image..."
                  value={sceneScripts.scene1}
                  onChange={(e) => setSceneScripts(prev => ({ ...prev, scene1: e.target.value }))}
                  rows={2}
                  className="resize-none text-xs"
                />
              </div>

              {/* Scene 2 - Transition */}
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-pink-700 dark:text-pink-300">
                  Scene 2: Transition (AI Generated)
                </label>
                <Textarea
                  placeholder="Optional: What's said during the transition..."
                  value={sceneScripts.scene2}
                  onChange={(e) => setSceneScripts(prev => ({ ...prev, scene2: e.target.value }))}
                  rows={2}
                  className="resize-none text-xs"
                />
              </div>

              {/* Scene 3 */}
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-purple-700 dark:text-purple-300">
                  Scene 3: Closing {twoImageMode === 'start-end' ? '(End Frame)' : twoImageMode === 'transformation' ? '(After)' : '(Image 2)'}
                </label>
                <Textarea
                  placeholder="What's said during the second image..."
                  value={sceneScripts.scene3}
                  onChange={(e) => setSceneScripts(prev => ({ ...prev, scene3: e.target.value }))}
                  rows={2}
                  className="resize-none text-xs"
                />
              </div>

              <div className="text-[10px] text-muted-foreground">
                Total estimated read time: {estimateReadTime(sceneScripts.scene1 + sceneScripts.scene2 + sceneScripts.scene3)}s
                {estimateReadTime(sceneScripts.scene1 + sceneScripts.scene2 + sceneScripts.scene3) > duration && (
                  <span className="text-red-500 ml-2">⚠️ Too long for {duration}s video</span>
                )}
              </div>
            </div>

            {/* Voice Configuration */}
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Voice Style</label>
                <Select value={voiceStyle} onValueChange={setVoiceStyle}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select style..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual-friendly" className="text-xs">😊 Casual & Friendly</SelectItem>
                    <SelectItem value="excited-energetic" className="text-xs">🎉 Excited & Energetic</SelectItem>
                    <SelectItem value="confident-bold" className="text-xs">💪 Confident & Bold</SelectItem>
                    <SelectItem value="calm-soothing" className="text-xs">🧘 Calm & Soothing</SelectItem>
                    <SelectItem value="professional-clear" className="text-xs">👔 Professional & Clear</SelectItem>
                    <SelectItem value="passionate-warm" className="text-xs">🔥 Passionate & Warm</SelectItem>
                    <SelectItem value="cool-minimalist" className="text-xs">❄️ Cool & Minimalist</SelectItem>
                    <SelectItem value="dramatic-theatrical" className="text-xs">🎭 Dramatic & Theatrical</SelectItem>
                    <SelectItem value="sincere-heartfelt" className="text-xs">💝 Sincere & Heartfelt</SelectItem>
                    <SelectItem value="playful-humorous" className="text-xs">😄 Playful & Humorous</SelectItem>
                    <SelectItem value="custom" className="text-xs">✏️ Custom</SelectItem>
                  </SelectContent>
                </Select>
                {voiceStyle === 'custom' && (
                  <Input
                    value={customVoiceStyle}
                    onChange={(e) => setCustomVoiceStyle(e.target.value)}
                    placeholder="Enter custom voice style..."
                    className="h-8 text-xs mt-2"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Tone of Delivery</label>
                <Select value={toneOfDelivery} onValueChange={setToneOfDelivery}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select tone..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural" className="text-xs">💬 Natural & Conversational</SelectItem>
                    <SelectItem value="slow" className="text-xs">🐌 Slow & Emphasised</SelectItem>
                    <SelectItem value="fast" className="text-xs">⚡ Fast & Punchy</SelectItem>
                    <SelectItem value="whisper" className="text-xs">🤫 Whisper & Intimate</SelectItem>
                    <SelectItem value="loud" className="text-xs">📢 Loud & Commanding</SelectItem>
                    <SelectItem value="custom" className="text-xs">✏️ Custom</SelectItem>
                  </SelectContent>
                </Select>
                {toneOfDelivery === 'custom' && (
                  <Input
                    value={customToneOfDelivery}
                    onChange={(e) => setCustomToneOfDelivery(e.target.value)}
                    placeholder="Enter custom tone of delivery..."
                    className="h-8 text-xs mt-2"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select language..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en" className="text-xs">🇺🇸 English</SelectItem>
                    <SelectItem value="es" className="text-xs">🇪🇸 Spanish</SelectItem>
                    <SelectItem value="fr" className="text-xs">🇫🇷 French</SelectItem>
                    <SelectItem value="de" className="text-xs">🇩🇪 German</SelectItem>
                    <SelectItem value="it" className="text-xs">🇮🇹 Italian</SelectItem>
                    <SelectItem value="pt" className="text-xs">🇵🇹 Portuguese</SelectItem>
                    <SelectItem value="zh" className="text-xs">🇨🇳 Chinese</SelectItem>
                    <SelectItem value="ja" className="text-xs">🇯🇵 Japanese</SelectItem>
                    <SelectItem value="ko" className="text-xs">🇰🇷 Korean</SelectItem>
                    <SelectItem value="custom" className="text-xs">🌐 Custom</SelectItem>
                  </SelectContent>
                </Select>
                {language === 'custom' && (
                  <Input
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    placeholder="Enter custom language..."
                    className="h-8 text-xs mt-2"
                  />
                )}
              </div>
            </div>

            {/* Duration Presets */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Clock className="h-3 w-3 text-purple-600" />
                Video Duration
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={duration === 15 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(15)}
                  className="h-8 text-xs"
                >
                  ⚡ 15s
                </Button>
                <Button
                  type="button"
                  variant={duration === 30 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(30)}
                  className="h-8 text-xs"
                >
                  📱 30s
                </Button>
                <Button
                  type="button"
                  variant={duration === 60 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(60)}
                  className="h-8 text-xs"
                >
                  🎬 60s
                </Button>
                <Button
                  type="button"
                  variant={duration === 120 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(120)}
                  className="h-8 text-xs"
                >
                  🎥 120s
                </Button>
              </div>
              
              <p className="text-[10px] text-muted-foreground">
                {duration === 15 && '⚡ Perfect for TikTok and Instagram Reels'}
                {duration === 30 && '📱 Ideal for social media feeds'}
                {duration === 60 && '🎬 Standard YouTube and Facebook ads'}
                {duration === 120 && '🎥 Full-length product demonstrations'}
              </p>
            </div>

            {/* Character Presence (Optional) */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Users className="h-3 w-3 text-purple-600" />
                Character Presence (Optional)
              </label>
              
              <div className="grid grid-cols-1 gap-2 p-1 bg-muted/20 rounded-lg border border-border/50">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCharacterPresence('voiceover')}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    characterPresence === 'voiceover'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  🎙️ Voiceover
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCharacterPresence('show')}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    characterPresence === 'show'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  👤 Show
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCharacterPresence('partial')}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    characterPresence === 'partial'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  ✋ Partial
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Mode 3: Multi-Story & Visual Mastery */}
          <TabsContent value="multi" className="space-y-4 mt-4" data-mode="multi">
            {/* Scene Description */}
            <div className="space-y-2 p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Film className="h-3 w-3 text-purple-600" />
                Scene Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Describe the action, mood, and what's happening in this scene..."
                value={mode3SceneDescription}
                onChange={(e) => setMode3SceneDescription(e.target.value)}
                rows={3}
                className={`resize-none text-xs ${validationErrors.sceneDescription ? 'border-red-500' : ''}`}
              />
              <p className="text-[10px] text-muted-foreground">
                Set the overall scene, atmosphere, and narrative flow for your multi-image story
              </p>
              
              {/* Validation Error */}
              {validationErrors.sceneDescription && (
                <div className="text-xs text-red-500 flex items-center gap-1">
                  <span>⚠️</span>
                  {validationErrors.sceneDescription}
                </div>
              )}
            </div>

            {/* Image 1 */}
            <div className="space-y-2 p-3 bg-purple-50/50 dark:bg-purple-950/10 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground flex items-center gap-2">
                  <ShoppingBag className="h-3 w-3 text-purple-600" />
                  Image 1 <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Purpose Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground">Purpose</label>
                <Select 
                  value={images[0]?.purpose || 'product'} 
                  onValueChange={(v) => updateImageSlot(0, { purpose: v })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="What is this image for?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">
                      <div className="flex items-center gap-2">
                        <span>🎁</span>
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-xs">Product Visual</span>
                          <span className="text-[10px] text-muted-foreground">The product itself</span>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="character">
                      <div className="flex items-center gap-2">
                        <span>👤</span>
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-xs">Character Reference</span>
                          <span className="text-[10px] text-muted-foreground">Person's style, appearance, mood</span>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="lighting">
                      <div className="flex items-center gap-2">
                        <span>💡</span>
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-xs">Lighting/Mood</span>
                          <span className="text-[10px] text-muted-foreground">Atmosphere, color grading</span>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="environment">
                      <div className="flex items-center gap-2">
                        <span>🌍</span>
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-xs">Environment/Setting</span>
                          <span className="text-[10px] text-muted-foreground">Background, location, scene</span>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="lifestyle">
                      <div className="flex items-center gap-2">
                        <span>🏠</span>
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-xs">Lifestyle Context</span>
                          <span className="text-[10px] text-muted-foreground">Product in use, real-world scenario</span>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="composition">
                      <div className="flex items-center gap-2">
                        <span>📐</span>
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-xs">Composition/Framing</span>
                          <span className="text-[10px] text-muted-foreground">Camera angle, shot structure</span>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="color">
                      <div className="flex items-center gap-2">
                        <span>🎨</span>
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-xs">Color Palette</span>
                          <span className="text-[10px] text-muted-foreground">Color scheme, tone reference</span>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Source Toggle */}
              <div className="grid grid-cols-1 gap-2 p-1 bg-muted/20 rounded-lg border border-border/50">
                <Button
                    type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateImageSlot(0, { source: 'library' })}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    images[0]?.source === 'library'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <span className="truncate">From Library</span>
                </Button>
                <Button
                    type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateImageSlot(0, { source: 'upload' })}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    images[0]?.source === 'upload'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  Upload
                </Button>
              </div>

              {/* Library Selection */}
              {images[0]?.source === 'library' && (
                <Select value={images[0]?.productId || ''} onValueChange={(v) => handleImageProductSelect(0, v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProducts ? (
                      <SelectItem value="loading" disabled>Loading products...</SelectItem>
                    ) : availableProducts.length === 0 ? (
                      <SelectItem value="none" disabled>No products available</SelectItem>
                    ) : (
                      availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id} className="text-xs">
                          {product.title || product.name || 'Untitled Product'}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}

              {/* Upload */}
              {images[0]?.source === 'upload' && (
                <div className="space-y-2">
                  <input
                    ref={image1InputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(0, file)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                          onClick={() => image1InputRef.current?.click()}
                          className="w-full h-8 text-xs"
                          aria-label="Upload image 1"
                        >
                          <Upload className="h-3 w-3 mr-2" />
                          Choose Image 1
                  </Button>
                  <p className="text-[10px] text-muted-foreground">JPG, JPEG, PNG (max 10MB)</p>
                </div>
              )}

              {/* Preview */}
              {images[0]?.preview && (
                <div className="relative w-full h-32 bg-muted/30 rounded-lg overflow-hidden border">
                  <img
                    src={images[0].preview}
                    alt={`Image 1 preview - ${images[0]?.purpose || 'product visual'}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Contains Both Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contains-both-m3-1"
                  checked={images[0]?.containsBoth || false}
                  onCheckedChange={(checked) => updateImageSlot(0, { containsBoth: checked as boolean })}
                />
                <label htmlFor="contains-both-m3-1" className="text-xs text-muted-foreground cursor-pointer">
                  This image contains both character and product
                </label>
              </div>

              {/* Optional Description */}
              <Input
                placeholder="Describe how to use this reference (optional)..."
                value={images[0]?.description || ''}
                onChange={(e) => updateImageSlot(0, { description: e.target.value })}
                className="h-8 text-xs"
              />
              
              {/* Validation Error */}
              {validationErrors.image1 && (
                <div className="text-xs text-red-500 flex items-center gap-1">
                  <span>⚠️</span>
                  {validationErrors.image1}
                </div>
              )}
            </div>

            {/* Image 2 */}
            <div className="space-y-2 p-3 bg-pink-50/50 dark:bg-pink-950/10 rounded-lg border border-pink-200 dark:border-pink-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground flex items-center gap-2">
                  <ShoppingBag className="h-3 w-3 text-pink-600" />
                  Image 2 <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Purpose Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground">Purpose</label>
                <Select 
                  value={images[1]?.purpose || 'product'} 
                  onValueChange={(v) => updateImageSlot(1, { purpose: v })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="What is this image for?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">🎁 Product Visual</SelectItem>
                    <SelectItem value="character">👤 Character Reference</SelectItem>
                    <SelectItem value="lighting">💡 Lighting/Mood</SelectItem>
                    <SelectItem value="environment">🌍 Environment/Setting</SelectItem>
                    <SelectItem value="lifestyle">🏠 Lifestyle Context</SelectItem>
                    <SelectItem value="composition">📐 Composition/Framing</SelectItem>
                    <SelectItem value="color">🎨 Color Palette</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Source Toggle */}
              <div className="grid grid-cols-1 gap-2 p-1 bg-muted/20 rounded-lg border border-border/50">
                <Button
                    type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateImageSlot(1, { source: 'library' })}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    images[1]?.source === 'library'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <span className="truncate">From Library</span>
                </Button>
                <Button
                    type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateImageSlot(1, { source: 'upload' })}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    images[1]?.source === 'upload'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  Upload
                </Button>
              </div>

              {/* Library/Upload (same pattern as Image 1) */}
              {images[1]?.source === 'library' && (
                <Select value={images[1]?.productId || ''} onValueChange={(v) => handleImageProductSelect(1, v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProducts ? (
                      <SelectItem value="loading" disabled>Loading products...</SelectItem>
                    ) : availableProducts.length === 0 ? (
                      <SelectItem value="none" disabled>No products available</SelectItem>
                    ) : (
                      availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id} className="text-xs">
                          {product.title || product.name || 'Untitled Product'}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}

              {images[1]?.source === 'upload' && (
                <div className="space-y-2">
                  <input
                    ref={image2InputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(1, file)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                          onClick={() => image2InputRef.current?.click()}
                          className="w-full h-8 text-xs"
                          aria-label="Upload image 2"
                        >
                          <Upload className="h-3 w-3 mr-2" />
                          Choose Image 2
                  </Button>
                  <p className="text-[10px] text-muted-foreground">JPG, JPEG, PNG (max 10MB)</p>
                </div>
              )}

              {images[1]?.preview && (
                <div className="relative w-full h-32 bg-muted/30 rounded-lg overflow-hidden border">
                  <img src={images[1].preview} alt="Image 2 preview" className="w-full h-full object-contain" />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contains-both-m3-2"
                  checked={images[1]?.containsBoth || false}
                  onCheckedChange={(checked) => updateImageSlot(1, { containsBoth: checked as boolean })}
                />
                <label htmlFor="contains-both-m3-2" className="text-xs text-muted-foreground cursor-pointer">
                  This image contains both character and product
                </label>
              </div>

              <Input
                placeholder="Describe how to use this reference (optional)..."
                value={images[1]?.description || ''}
                onChange={(e) => updateImageSlot(1, { description: e.target.value })}
                className="h-8 text-xs"
              />
              
              {/* Validation Error */}
              {validationErrors.image2 && (
                <div className="text-xs text-red-500 flex items-center gap-1">
                  <span>⚠️</span>
                  {validationErrors.image2}
                </div>
              )}
            </div>

            {/* Image 3 */}
            <div className="space-y-2 p-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground flex items-center gap-2">
                  <ShoppingBag className="h-3 w-3 text-blue-600" />
                  Image 3 <span className="text-red-500">*</span>
                </label>
              </div>

              {/* Purpose Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground">Purpose</label>
                <Select 
                  value={images[2]?.purpose || 'lifestyle'} 
                  onValueChange={(v) => updateImageSlot(2, { purpose: v })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="What is this image for?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">🎁 Product Visual</SelectItem>
                    <SelectItem value="character">👤 Character Reference</SelectItem>
                    <SelectItem value="lighting">💡 Lighting/Mood</SelectItem>
                    <SelectItem value="environment">🌍 Environment/Setting</SelectItem>
                    <SelectItem value="lifestyle">🏠 Lifestyle Context</SelectItem>
                    <SelectItem value="composition">📐 Composition/Framing</SelectItem>
                    <SelectItem value="color">🎨 Color Palette</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Source Toggle */}
              <div className="grid grid-cols-1 gap-2 p-1 bg-muted/20 rounded-lg border border-border/50">
                <Button
                    type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateImageSlot(2, { source: 'library' })}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    images[2]?.source === 'library'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <span className="truncate">From Library</span>
                </Button>
                <Button
                    type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateImageSlot(2, { source: 'upload' })}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    images[2]?.source === 'upload'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  Upload
                </Button>
              </div>

              {/* Library/Upload (same pattern) */}
              {images[2]?.source === 'library' && (
                <Select value={images[2]?.productId || ''} onValueChange={(v) => handleImageProductSelect(2, v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProducts ? (
                      <SelectItem value="loading" disabled>Loading products...</SelectItem>
                    ) : availableProducts.length === 0 ? (
                      <SelectItem value="none" disabled>No products available</SelectItem>
                    ) : (
                      availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id} className="text-xs">
                          {product.title || product.name || 'Untitled Product'}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}

              {images[2]?.source === 'upload' && (
                <div className="space-y-2">
                  <input
                    ref={image3InputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(2, file)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                          onClick={() => image3InputRef.current?.click()}
                          className="w-full h-8 text-xs"
                          aria-label="Upload image 3"
                        >
                          <Upload className="h-3 w-3 mr-2" />
                          Choose Image 3
                  </Button>
                  <p className="text-[10px] text-muted-foreground">JPG, JPEG, PNG (max 10MB)</p>
                </div>
              )}

              {images[2]?.preview && (
                <div className="relative w-full h-32 bg-muted/30 rounded-lg overflow-hidden border">
                  <img src={images[2].preview} alt={`Image 3 preview - ${images[2]?.purpose || 'lifestyle visual'}`} className="w-full h-full object-contain" />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contains-both-m3-3"
                  checked={images[2]?.containsBoth || false}
                  onCheckedChange={(checked) => updateImageSlot(2, { containsBoth: checked as boolean })}
                />
                <label htmlFor="contains-both-m3-3" className="text-xs text-muted-foreground cursor-pointer">
                  This image contains both character and product
                </label>
              </div>

              <Input
                placeholder="Describe how to use this reference (optional)..."
                value={images[2]?.description || ''}
                onChange={(e) => updateImageSlot(2, { description: e.target.value })}
                className="h-8 text-xs"
              />
              
              {/* Validation Error */}
              {validationErrors.image3 && (
                <div className="text-xs text-red-500 flex items-center gap-1">
                  <span>⚠️</span>
                  {validationErrors.image3}
                </div>
              )}
            </div>

            {/* Script Section */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <MessageCircle className="h-3 w-3 text-purple-600" />
                Script / Voice <span className="text-red-500">*</span>
              </label>
              
              <Textarea
                placeholder="Write your script here... What will be said in the ad?"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={4}
                className="resize-none text-xs"
              />
              
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{script.length} characters</span>
                <span>
                  Estimated read time: {estimateReadTime(script)}s
                  {estimateReadTime(script) > duration && script.length > 0 && (
                    <span className="text-red-500 ml-2">⚠️ Too long for {duration}s video</span>
                  )}
                </span>
              </div>

              {/* Voice Configuration */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Voice Style</label>
                  <Select value={voiceStyle} onValueChange={setVoiceStyle}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select style..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual-friendly" className="text-xs">😊 Casual & Friendly</SelectItem>
                      <SelectItem value="excited-energetic" className="text-xs">🎉 Excited & Energetic</SelectItem>
                      <SelectItem value="confident-bold" className="text-xs">💪 Confident & Bold</SelectItem>
                      <SelectItem value="calm-soothing" className="text-xs">🧘 Calm & Soothing</SelectItem>
                      <SelectItem value="professional-clear" className="text-xs">👔 Professional & Clear</SelectItem>
                      <SelectItem value="passionate-warm" className="text-xs">🔥 Passionate & Warm</SelectItem>
                      <SelectItem value="cool-minimalist" className="text-xs">❄️ Cool & Minimalist</SelectItem>
                      <SelectItem value="dramatic-theatrical" className="text-xs">🎭 Dramatic & Theatrical</SelectItem>
                      <SelectItem value="sincere-heartfelt" className="text-xs">💝 Sincere & Heartfelt</SelectItem>
                      <SelectItem value="playful-humorous" className="text-xs">😄 Playful & Humorous</SelectItem>
                      <SelectItem value="custom" className="text-xs">✏️ Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {voiceStyle === 'custom' && (
                    <Input
                      value={customVoiceStyle}
                      onChange={(e) => setCustomVoiceStyle(e.target.value)}
                      placeholder="Enter custom voice style..."
                      className="h-8 text-xs mt-2"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Tone of Delivery</label>
                  <Select value={toneOfDelivery} onValueChange={setToneOfDelivery}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select tone..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="natural" className="text-xs">💬 Natural & Conversational</SelectItem>
                      <SelectItem value="slow" className="text-xs">🐌 Slow & Emphasised</SelectItem>
                      <SelectItem value="fast" className="text-xs">⚡ Fast & Punchy</SelectItem>
                      <SelectItem value="whisper" className="text-xs">🤫 Whisper & Intimate</SelectItem>
                      <SelectItem value="loud" className="text-xs">📢 Loud & Commanding</SelectItem>
                      <SelectItem value="custom" className="text-xs">✏️ Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {toneOfDelivery === 'custom' && (
                    <Input
                      value={customToneOfDelivery}
                      onChange={(e) => setCustomToneOfDelivery(e.target.value)}
                      placeholder="Enter custom tone of delivery..."
                      className="h-8 text-xs mt-2"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select language..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en" className="text-xs">🇺🇸 English</SelectItem>
                      <SelectItem value="es" className="text-xs">🇪🇸 Spanish</SelectItem>
                      <SelectItem value="fr" className="text-xs">🇫🇷 French</SelectItem>
                      <SelectItem value="de" className="text-xs">🇩🇪 German</SelectItem>
                      <SelectItem value="it" className="text-xs">🇮🇹 Italian</SelectItem>
                      <SelectItem value="pt" className="text-xs">🇵🇹 Portuguese</SelectItem>
                      <SelectItem value="zh" className="text-xs">🇨🇳 Chinese</SelectItem>
                      <SelectItem value="ja" className="text-xs">🇯🇵 Japanese</SelectItem>
                      <SelectItem value="ko" className="text-xs">🇰🇷 Korean</SelectItem>
                      <SelectItem value="custom" className="text-xs">🌐 Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {language === 'custom' && (
                    <Input
                      value={customLanguage}
                      onChange={(e) => setCustomLanguage(e.target.value)}
                      placeholder="Enter custom language..."
                      className="h-8 text-xs mt-2"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Duration Presets */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Clock className="h-3 w-3 text-purple-600" />
                Video Duration
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={duration === 15 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(15)}
                  className="h-8 text-xs"
                >
                  ⚡ 15s
                </Button>
                <Button
                  type="button"
                  variant={duration === 30 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(30)}
                  className="h-8 text-xs"
                >
                  📱 30s
                </Button>
                <Button
                  type="button"
                  variant={duration === 60 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(60)}
                  className="h-8 text-xs"
                >
                  🎬 60s
                </Button>
                <Button
                  type="button"
                  variant={duration === 120 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(120)}
                  className="h-8 text-xs"
                >
                  🎥 120s
                </Button>
              </div>
              
              <p className="text-[10px] text-muted-foreground">
                {duration === 15 && '⚡ Perfect for TikTok and Instagram Reels'}
                {duration === 30 && '📱 Ideal for social media feeds'}
                {duration === 60 && '🎬 Standard YouTube and Facebook ads'}
                {duration === 120 && '🎥 Full-length product demonstrations'}
              </p>
            </div>

            {/* Character Presence (Optional) */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Users className="h-3 w-3 text-purple-600" />
                Character Presence (Optional)
              </label>
              
              <div className="grid grid-cols-1 gap-2 p-1 bg-muted/20 rounded-lg border border-border/50">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCharacterPresence('voiceover')}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    characterPresence === 'voiceover'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  🎙️ Voiceover
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCharacterPresence('show')}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    characterPresence === 'show'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  👤 Show
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCharacterPresence('partial')}
                  className={`text-xs h-8 transition-all duration-200 font-medium ${
                    characterPresence === 'partial'
                      ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  ✋ Partial
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Generate Button - Fixed at bottom */}
      <div className="pt-6 border-t border-border">
        <Button 
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white border-0 h-9 text-sm font-medium" 
          disabled={isGenerating}
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
    </div>
  )
}
