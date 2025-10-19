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
  Plus,
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
  ChevronUp,
  ChevronRight,
  Loader2,
  Image,
  Palette,
  Music,
  Camera,
  Lightbulb,
  Zap,
  Info
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

// Character design constants
const ART_STYLES = [
  { value: "Ultra-realistic", label: "Ultra-realistic", icon: "📸" },
  { value: "Comic", label: "Comic", icon: "💥" },
  { value: "Anime", label: "Anime", icon: "🎌" },
  { value: "3D Render", label: "3D Render", icon: "🎮" },
  { value: "Cartoon", label: "Cartoon", icon: "🎨" },
  { value: "Custom", label: "Custom", icon: "✏️" }
]

const AGE_RANGES = [
  { value: "Teen", label: "Teen (13-19)", icon: "👦" },
  { value: "Twenties", label: "Twenties (20-29)", icon: "👨" },
  { value: "Thirties", label: "Thirties (30-39)", icon: "👨" },
  { value: "Forties", label: "Forties (40-49)", icon: "👨" },
  { value: "Fifties+", label: "Fifties+ (50+)", icon: "👴" },
  { value: "Custom", label: "Custom", icon: "✏️" }
]

const ETHNICITY_OPTIONS = [
  { value: "Caucasian", label: "Caucasian", icon: "👱" },
  { value: "African", label: "African", icon: "👨🏿" },
  { value: "Asian", label: "Asian", icon: "👨🏻" },
  { value: "Hispanic", label: "Hispanic", icon: "👨🏽" },
  { value: "Middle Eastern", label: "Middle Eastern", icon: "👳" },
  { value: "Mixed", label: "Mixed", icon: "👥" },
  { value: "Custom", label: "Custom", icon: "✏️" }
]

const GENDER_OPTIONS = [
  { value: "Female", label: "Female", icon: "👩" },
  { value: "Male", label: "Male", icon: "👨" },
  { value: "Non-binary", label: "Non-binary", icon: "🧑" },
  { value: "Custom", label: "Custom", icon: "🌈" }
]

const BODY_TYPES = [
  { value: "Slim", label: "Slim", icon: "🏃" },
  { value: "Athletic", label: "Athletic", icon: "💪" },
  { value: "Curvy", label: "Curvy", icon: "💃" },
  { value: "Stocky", label: "Stocky", icon: "🏋️" },
  { value: "Custom", label: "Custom", icon: "🎨" }
]

const OUTFIT_CATEGORIES = [
  { value: "Streetwear", label: "Streetwear", icon: "👕" },
  { value: "Business", label: "Business", icon: "👔" },
  { value: "Casual", label: "Casual", icon: "👖" },
  { value: "Athletic", label: "Athletic", icon: "🏃" },
  { value: "Formal", label: "Formal", icon: "🎩" },
  { value: "Custom", label: "Custom", icon: "✏️" }
]

const EXPRESSIONS = [
  { value: "Happy", label: "Happy", icon: "😊" },
  { value: "Serious", label: "Serious", icon: "😐" },
  { value: "Excited", label: "Excited", icon: "🤩" },
  { value: "Confident", label: "Confident", icon: "😎" },
  { value: "Friendly", label: "Friendly", icon: "🙂" },
  { value: "Custom", label: "Custom", icon: "✏️" }
]

// Partial character design constants
const PARTIAL_TYPES = [
  { value: "Hands", label: "Hands Only", icon: "✋" },
  { value: "Face", label: "Face Close-up", icon: "👤" },
  { value: "Feet", label: "Feet/Legs", icon: "🦶" },
  { value: "Silhouette", label: "Silhouette", icon: "👥" },
  { value: "Shadow", label: "Shadow", icon: "🌑" },
  { value: "Custom", label: "Custom", icon: "🎨" }
]

const VISIBILITY_LEVELS = [
  { value: "Prominent", label: "Prominent", icon: "🔆" },
  { value: "Subtle", label: "Subtle", icon: "🌤️" },
  { value: "Background", label: "Background", icon: "🌫️" },
  { value: "Barely Visible", label: "Barely Visible", icon: "👻" }
]

const POSITIONS = [
  { value: "Left", label: "Left Side", icon: "⬅️" },
  { value: "Right", label: "Right Side", icon: "➡️" },
  { value: "Center", label: "Center", icon: "⏺️" },
  { value: "Top", label: "Top", icon: "⬆️" },
  { value: "Bottom", label: "Bottom", icon: "⬇️" },
  { value: "Corner", label: "Corner", icon: "📐" },
  { value: "Custom", label: "Custom", icon: "✏️" }
]

const SKIN_TONES = [
  { value: "Fair", label: "Fair", color: "#FDBCB4" },
  { value: "Light", label: "Light", color: "#F1C27D" },
  { value: "Medium", label: "Medium", color: "#C68642" },
  { value: "Tan", label: "Tan", color: "#8D5524" },
  { value: "Dark", label: "Dark", color: "#4A2511" },
  { value: "Deep", label: "Deep", color: "#2C1810" }
]

const ACTIONS_POSES = [
  { value: "Holding Product", label: "Holding Product", icon: "🤲" },
  { value: "Pointing", label: "Pointing", icon: "☝️" },
  { value: "Gesturing", label: "Gesturing", icon: "👋" },
  { value: "Resting", label: "Resting", icon: "🤚" },
  { value: "Reaching", label: "Reaching", icon: "🫴" },
  { value: "Custom", label: "Custom", icon: "✏️" }
]

const HAND_ACCESSORIES = [
  { value: "Watch", label: "Watch", icon: "⌚" },
  { value: "Rings", label: "Rings", icon: "💍" },
  { value: "Bracelet", label: "Bracelet", icon: "📿" },
  { value: "Nail Polish", label: "Nail Polish", icon: "💅" },
  { value: "None", label: "None", icon: "🚫" }
]

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
  
  // Aspect Ratio
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('16:9')
  
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
  const [characterCount, setCharacterCount] = useState<number>(1)
  const [characterDescriptions, setCharacterDescriptions] = useState<Array<{
    description: string
    artStyle: string
    customArtStyle: string
    ageRange: string
    customAgeRange: string
    ethnicity: string
    customEthnicity: string
    gender: string
    customGender: string
    bodyType: string
    customBodyType: string
    outfitCategory: string
    customOutfitCategory: string
    outfitColors: string
    expression: string
    customExpression: string
  }>>([{
    description: '',
    artStyle: '',
    customArtStyle: '',
    ageRange: '',
    customAgeRange: '',
    ethnicity: '',
    customEthnicity: '',
    gender: '',
    customGender: '',
    bodyType: '',
    customBodyType: '',
    outfitCategory: '',
    customOutfitCategory: '',
    outfitColors: '',
    expression: '',
    customExpression: ''
  }])
  const [partialType, setPartialType] = useState<string>('')
  
  // Partial character structured fields (single mode only)
  const [partialCharacter, setPartialCharacter] = useState<{
    partialType: string
    customPartialType: string
    visibilityLevel: string
    position: string
    customPosition: string
    artStyle: string
    customArtStyle: string
    skinTone: string
    customSkinTone: string
    accessories: string[]
    handAccessories: string
    customHandAccessories: string
    expression: string
    customExpression: string
    actionPose: string
    customActionPose: string
    description: string
  }>({
    partialType: '',
    customPartialType: '',
    visibilityLevel: '',
    position: '',
    customPosition: '',
    artStyle: '',
    customArtStyle: '',
    skinTone: '',
    customSkinTone: '',
    accessories: [],
    handAccessories: '',
    customHandAccessories: '',
    expression: '',
    customExpression: '',
    actionPose: '',
    customActionPose: '',
    description: ''
  })
  
  // Dialog lines for conversation (single mode only)
  const [dialogLines, setDialogLines] = useState<Array<{
    id: string
    characterIndex: number  // Which character (0-4) is speaking
    text: string
    expression: string
  }>>([])
  
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

  // Dialog helper functions
  const addDialogLine = () => {
    const newLine = {
      id: Date.now().toString(),
      characterIndex: 0,
      text: '',
      expression: ''
    }
    setDialogLines([...dialogLines, newLine])
  }

  const updateDialogLine = (id: string, field: string, value: string | number) => {
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
      [newLines[index - 1], newLines[index]] = [newLines[index], newLines[index - 1]]
    } else if (direction === 'down' && index < newLines.length - 1) {
      [newLines[index], newLines[index + 1]] = [newLines[index + 1], newLines[index]]
    }
    setDialogLines(newLines)
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
    
    // Check for required script/dialog
    if (containsBoth || (!containsBoth && characterPresence === 'voiceover')) {
      // Simple script validation for manual entry or voiceover
    if (!script.trim()) {
      errors.script = 'Please enter a script for your ad'
      }
    } else if (!containsBoth && characterPresence !== 'voiceover') {
      // Dialog validation for character-based content
      if (characterCount === 1) {
        if (!dialogLines[0]?.text?.trim()) {
          errors.script = 'Please enter what the character should say'
        }
      } else {
        if (dialogLines.length === 0) {
          errors.script = 'Please add at least one dialog line'
        } else {
          const hasEmptyLines = dialogLines.some(line => !line.text.trim())
          if (hasEmptyLines) {
            errors.script = 'All dialog lines must have text'
          }
        }
      }
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
      if (characterSource === 'describe') {
        const hasValidDescriptions = characterDescriptions.some(character => {
          // Check if at least one structured field is filled OR description is filled
          return character.description.trim() || 
                 character.artStyle || 
                 character.ageRange || 
                 character.ethnicity || 
                 character.gender || 
                 character.bodyType || 
                 character.outfitCategory || 
                 character.outfitColors.trim() || 
                 character.expression
        })
        if (!hasValidDescriptions) {
          errors.push("Please fill in at least one character field (description, art style, age, etc.)")
        }
      }
    }
    
    if (characterPresence === 'partial') {
      if (mode === 'single') {
        // For single mode, check structured partial character fields
        const hasValidPartialFields = partialCharacter.partialType || 
                                     partialCharacter.visibilityLevel || 
                                     partialCharacter.position || 
                                     partialCharacter.artStyle || 
                                     partialCharacter.description.trim()
        if (!hasValidPartialFields) {
          errors.push("Please fill in at least one partial character field")
        }
      } else {
        // For dual/multi modes, check simple partial type
        if (!partialType) {
      errors.push("Please select a partial presence type")
        }
      }
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
      if (characterSource === 'describe') {
        const hasValidDescriptions = characterDescriptions.some(character => {
          // Check if at least one structured field is filled OR description is filled
          return character.description.trim() || 
                 character.artStyle || 
                 character.ageRange || 
                 character.ethnicity || 
                 character.gender || 
                 character.bodyType || 
                 character.outfitCategory || 
                 character.outfitColors.trim() || 
                 character.expression
        })
        if (!hasValidDescriptions) {
          errors.push("Please fill in at least one character field (description, art style, age, etc.)")
        }
      }
    }
    
    if (characterPresence === 'partial') {
      if (mode === 'single') {
        // For single mode, check structured partial character fields
        const hasValidPartialFields = partialCharacter.partialType || 
                                     partialCharacter.visibilityLevel || 
                                     partialCharacter.position || 
                                     partialCharacter.artStyle || 
                                     partialCharacter.description.trim()
        if (!hasValidPartialFields) {
          errors.push("Please fill in at least one partial character field")
        }
      } else {
        // For dual/multi modes, check simple partial type
        if (!partialType) {
      errors.push("Please select a partial presence type")
        }
      }
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
      if (characterSource === 'describe') {
        const hasValidDescriptions = characterDescriptions.some(character => {
          // Check if at least one structured field is filled OR description is filled
          return character.description.trim() || 
                 character.artStyle || 
                 character.ageRange || 
                 character.ethnicity || 
                 character.gender || 
                 character.bodyType || 
                 character.outfitCategory || 
                 character.outfitColors.trim() || 
                 character.expression
        })
        if (!hasValidDescriptions) {
          errors.push("Please fill in at least one character field (description, art style, age, etc.)")
        }
      }
    }
    
    if (characterPresence === 'partial') {
      if (mode === 'single') {
        // For single mode, check structured partial character fields
        const hasValidPartialFields = partialCharacter.partialType || 
                                     partialCharacter.visibilityLevel || 
                                     partialCharacter.position || 
                                     partialCharacter.artStyle || 
                                     partialCharacter.description.trim()
        if (!hasValidPartialFields) {
          errors.push("Please fill in at least one partial character field")
        }
      } else {
        // For dual/multi modes, check simple partial type
        if (!partialType) {
      errors.push("Please select a partial presence type")
        }
      }
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
      
      // Add script/dialog data based on mode and character presence
      if (containsBoth || (!containsBoth && characterPresence === 'voiceover')) {
        // Simple script for manual entry or voiceover
      formData.append('script', script)
      } else if (!containsBoth && characterPresence !== 'voiceover' && dialogLines.length > 0) {
        // Dialog lines for character-based content
        formData.append('dialogLines', JSON.stringify(dialogLines))
      } else {
        // Fallback to script
        formData.append('script', script)
      }
      // Utiliser la valeur custom si "custom" est sélectionné
      formData.append('voiceStyle', voiceStyle === 'custom' ? customVoiceStyle : voiceStyle)
      formData.append('toneOfDelivery', toneOfDelivery === 'custom' ? customToneOfDelivery : toneOfDelivery)
      formData.append('language', language === 'custom' ? customLanguage : language)
      formData.append('duration', duration.toString())
      formData.append('aspectRatio', aspectRatio)
      formData.append('characterPresence', characterPresence)
      
      // Add character data if not voiceover
      if (characterPresence !== 'voiceover') {
        formData.append('characterSource', characterSource)
        if (characterSource === 'library') {
          formData.append('selectedAvatarId', selectedAvatarId)
        } else if (characterSource === 'upload' && characterFile) {
          formData.append('characterFile', characterFile)
        } else if (characterSource === 'describe') {
          formData.append('characterDescriptions', JSON.stringify(characterDescriptions))
        }
        if (characterPresence === 'partial') {
          if (mode === 'single') {
            // For single mode, send structured partial character data
            formData.append('partialCharacter', JSON.stringify(partialCharacter))
          } else {
            // For dual/multi modes, send simple partial type
          formData.append('partialType', partialType)
          if (partialType === 'custom') {
            formData.append('characterDescription', characterDescription)
            }
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

              {/* Preview for selected product from library */}
              {selectedProductId && productSource === 'library' && (() => {
                const selectedProduct = availableProducts.find(p => p.id === selectedProductId)
                if (!selectedProduct) return null
                
                const productImageUrl = selectedProduct.generated_images?.[0] || selectedProduct.image_url || selectedProduct.imageUrl
                return (
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {productImageUrl ? (
                        <img 
                          src={productImageUrl} 
                          alt={selectedProduct.title || selectedProduct.name}
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
                          {selectedProduct.title || selectedProduct.name || 'Untitled Product'}
                        </p>
                        {selectedProduct.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {selectedProduct.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })()}

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


              {/* Contains Both Checkbox - Clean & Bold */}
              <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                <Checkbox
                  id="contains-both"
                  checked={containsBoth}
                  onCheckedChange={(checked) => setContainsBoth(checked as boolean)}
                    className="border-purple-600 data-[state=checked]:bg-purple-600"
                />
                <label
                  htmlFor="contains-both"
                    className="text-sm font-bold text-purple-900 dark:text-purple-100 cursor-pointer"
                >
                    ⚡ This image contains both character and product
                </label>
                </div>
              </div>

              {/* Optional Description */}
              <Textarea
                placeholder="Describe the product or how to use this image (optional)..."
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            {/* Character Presence Section - Only show if image doesn't contain both */}
            {!containsBoth && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Users className="h-3 w-3 text-purple-600" />
                Character Presence (Optional)
              </label>
              
              <div className="space-y-3">
                {/* Voiceover Option */}
                <div 
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    characterPresence === 'voiceover'
                      ? "border-purple-300 bg-purple-50/50 dark:border-purple-600 dark:bg-purple-950/20"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 dark:border-gray-700 dark:hover:border-purple-600 dark:hover:bg-purple-950/10"
                  }`}
                  onClick={() => setCharacterPresence('voiceover')}
                >
                  <input
                    type="radio"
                    id="voiceover"
                    name="characterPresence"
                    value="voiceover"
                    checked={characterPresence === 'voiceover'}
                    onChange={(e) => setCharacterPresence(e.target.value as any)}
                    className="mt-1"
                  />
                  <label htmlFor="voiceover" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🎙️</span>
                      <span className="font-medium text-sm">Voiceover</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Audio narration only - no character appears in the video. Perfect for product-focused content with professional voice explanation.
                    </p>
                  </label>
                </div>

                {/* Show Option */}
                <div 
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    characterPresence === 'show'
                      ? "border-purple-300 bg-purple-50/50 dark:border-purple-600 dark:bg-purple-950/20"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 dark:border-gray-700 dark:hover:border-purple-600 dark:hover:bg-purple-950/10"
                  }`}
                  onClick={() => setCharacterPresence('show')}
                >
                  <input
                    type="radio"
                    id="show"
                    name="characterPresence"
                    value="show"
                    checked={characterPresence === 'show'}
                    onChange={(e) => setCharacterPresence(e.target.value as any)}
                    className="mt-1"
                  />
                  <label htmlFor="show" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">👤</span>
                      <span className="font-medium text-sm">Show</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Full character visible in the video - complete body, face, and presence. Ideal for authentic, relatable UGC-style content.
                    </p>
                  </label>
                </div>

                {/* Partial Option */}
                <div 
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    characterPresence === 'partial'
                      ? "border-purple-300 bg-purple-50/50 dark:border-purple-600 dark:bg-purple-950/20"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 dark:border-gray-700 dark:hover:border-purple-600 dark:hover:bg-purple-950/10"
                  }`}
                  onClick={() => setCharacterPresence('partial')}
                >
                  <input
                    type="radio"
                    id="partial"
                    name="characterPresence"
                    value="partial"
                    checked={characterPresence === 'partial'}
                    onChange={(e) => setCharacterPresence(e.target.value as any)}
                    className="mt-1"
                  />
                  <label htmlFor="partial" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">✋</span>
                      <span className="font-medium text-sm">Partial</span>
              </div>
                    <p className="text-xs text-muted-foreground">
                      Partial character presence - show only hands, face, feet, or silhouette. Great for subtle human touch without full character focus.
                    </p>
                  </label>
            </div>
              </div>
            </div>
            )}

            {/* Character Selection (when not voiceover) - Multi mode only */}
            {mode !== 'single' && mode !== 'dual' && !containsBoth && characterPresence !== 'voiceover' && (
              <div className="space-y-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <label className="text-xs font-medium text-foreground flex items-center gap-2">
                  <Users className="h-3 w-3 text-purple-600" />
                  {characterPresence === 'show' ? 'Choose Your Character' : 'Partial Presence Type'}
                </label>

                {characterPresence === 'show' ? (
                  <>
                    {/* Character source buttons removed for single mode - using new section below */}
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

            {/* NEW: Multiple Character Description - Single mode only */}
            {mode === 'single' && !containsBoth && characterPresence === 'show' && (
              <div className="space-y-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <label className="text-xs font-medium text-foreground flex items-center gap-2">
                  <Users className="h-3 w-3 text-purple-600" />
                  Character Descriptions
                </label>
                
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
                        className="h-6 w-6 p-0"
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
                            setCharacterDescriptions(prev => [...prev, {
                              description: '',
                              artStyle: '',
                              customArtStyle: '',
                              ageRange: '',
                              customAgeRange: '',
                              ethnicity: '',
                              customEthnicity: '',
                              gender: '',
                              customGender: '',
                              bodyType: '',
                              customBodyType: '',
                              outfitCategory: '',
                              customOutfitCategory: '',
                              outfitColors: '',
                              expression: '',
                              customExpression: ''
                            }])
                          }
                        }}
                        disabled={characterCount >= 5}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Describe each character separately. Maximum 5 characters. In single mode, you can only describe characters.
                  </p>
                  
                  {/* Character description fields */}
                  {characterDescriptions.map((character, index) => (
                    <Collapsible key={index} className="space-y-2">
                      <CollapsibleTrigger asChild>
                      <Button
                          variant="outline"
                          className="w-full justify-between h-8 text-xs"
                        >
                          <span>Character {index + 1}</span>
                          <ChevronDown className="h-3 w-3" />
                      </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-3 p-3 bg-muted/20 rounded-lg border">
                        {/* Free-text description */}
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">
                            Additional Description (Optional)
                          </label>
                          <Textarea
                            placeholder={`Additional details for character ${index + 1}...`}
                            value={character.description}
                            onChange={(e) => {
                              const newDescriptions = [...characterDescriptions]
                              newDescriptions[index] = { ...newDescriptions[index], description: e.target.value }
                              setCharacterDescriptions(newDescriptions)
                            }}
                            rows={2}
                            className="resize-none text-xs"
                          />
                    </div>

                        {/* Structured fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Art Style */}
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">Art Style</label>
                            <Select 
                              value={character.artStyle} 
                              onValueChange={(value) => {
                                const newDescriptions = [...characterDescriptions]
                                newDescriptions[index] = { ...newDescriptions[index], artStyle: value }
                                setCharacterDescriptions(newDescriptions)
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select style..." />
                              </SelectTrigger>
                              <SelectContent>
                                {ART_STYLES.map((style) => (
                                  <SelectItem key={style.value} value={style.value}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">{style.icon}</span>
                                      <span className="text-sm">{style.label}</span>
                          </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {character.artStyle === 'Custom' && (
                              <Input
                                value={character.customArtStyle}
                                onChange={(e) => {
                                  const newDescriptions = [...characterDescriptions]
                                  newDescriptions[index] = { ...newDescriptions[index], customArtStyle: e.target.value }
                                  setCharacterDescriptions(newDescriptions)
                                }}
                                placeholder="Enter custom art style..."
                                className="h-8 text-xs mt-1"
                              />
                            )}
                        </div>

                          {/* Age Range */}
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">Age Range</label>
                            <Select 
                              value={character.ageRange} 
                              onValueChange={(value) => {
                                const newDescriptions = [...characterDescriptions]
                                newDescriptions[index] = { ...newDescriptions[index], ageRange: value }
                                setCharacterDescriptions(newDescriptions)
                              }}
                            >
                          <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select age..." />
                          </SelectTrigger>
                          <SelectContent>
                                {AGE_RANGES.map((age) => (
                                  <SelectItem key={age.value} value={age.value}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">{age.icon}</span>
                                      <span className="text-sm">{age.label}</span>
                                    </div>
                                </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {character.ageRange === 'Custom' && (
                              <Input
                                value={character.customAgeRange}
                                onChange={(e) => {
                                  const newDescriptions = [...characterDescriptions]
                                  newDescriptions[index] = { ...newDescriptions[index], customAgeRange: e.target.value }
                                  setCharacterDescriptions(newDescriptions)
                                }}
                                placeholder="Enter custom age..."
                                className="h-8 text-xs mt-1"
                              />
                            )}
                          </div>

                          {/* Ethnicity */}
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">Ethnicity</label>
                            <Select 
                              value={character.ethnicity} 
                              onValueChange={(value) => {
                                const newDescriptions = [...characterDescriptions]
                                newDescriptions[index] = { ...newDescriptions[index], ethnicity: value }
                                setCharacterDescriptions(newDescriptions)
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select ethnicity..." />
                              </SelectTrigger>
                              <SelectContent>
                                {ETHNICITY_OPTIONS.map((ethnicity) => (
                                  <SelectItem key={ethnicity.value} value={ethnicity.value}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">{ethnicity.icon}</span>
                                      <span className="text-sm">{ethnicity.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                            {character.ethnicity === 'Custom' && (
                              <Input
                                value={character.customEthnicity}
                                onChange={(e) => {
                                  const newDescriptions = [...characterDescriptions]
                                  newDescriptions[index] = { ...newDescriptions[index], customEthnicity: e.target.value }
                                  setCharacterDescriptions(newDescriptions)
                                }}
                                placeholder="Enter custom ethnicity..."
                                className="h-8 text-xs mt-1"
                              />
                            )}
                          </div>

                          {/* Gender */}
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">Gender</label>
                            <Select 
                              value={character.gender} 
                              onValueChange={(value) => {
                                const newDescriptions = [...characterDescriptions]
                                newDescriptions[index] = { ...newDescriptions[index], gender: value }
                                setCharacterDescriptions(newDescriptions)
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select gender..." />
                              </SelectTrigger>
                              <SelectContent>
                                {GENDER_OPTIONS.map((gender) => (
                                  <SelectItem key={gender.value} value={gender.value}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">{gender.icon}</span>
                                      <span className="text-sm">{gender.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {character.gender === 'Custom' && (
                              <Input
                                value={character.customGender}
                          onChange={(e) => {
                                  const newDescriptions = [...characterDescriptions]
                                  newDescriptions[index] = { ...newDescriptions[index], customGender: e.target.value }
                                  setCharacterDescriptions(newDescriptions)
                                }}
                                placeholder="Enter custom gender..."
                                className="h-8 text-xs mt-1"
                              />
                            )}
                          </div>

                          {/* Body Type */}
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">Body Type</label>
                            <Select 
                              value={character.bodyType} 
                              onValueChange={(value) => {
                                const newDescriptions = [...characterDescriptions]
                                newDescriptions[index] = { ...newDescriptions[index], bodyType: value }
                                setCharacterDescriptions(newDescriptions)
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select body type..." />
                              </SelectTrigger>
                              <SelectContent>
                                {BODY_TYPES.map((bodyType) => (
                                  <SelectItem key={bodyType.value} value={bodyType.value}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">{bodyType.icon}</span>
                                      <span className="text-sm">{bodyType.label}</span>
                      </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {character.bodyType === 'Custom' && (
                              <Input
                                value={character.customBodyType}
                                onChange={(e) => {
                                  const newDescriptions = [...characterDescriptions]
                                  newDescriptions[index] = { ...newDescriptions[index], customBodyType: e.target.value }
                                  setCharacterDescriptions(newDescriptions)
                                }}
                                placeholder="Enter custom body type..."
                                className="h-8 text-xs mt-1"
                              />
                            )}
                          </div>

                          {/* Outfit Category */}
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">Outfit Category</label>
                            <Select 
                              value={character.outfitCategory} 
                              onValueChange={(value) => {
                                const newDescriptions = [...characterDescriptions]
                                newDescriptions[index] = { ...newDescriptions[index], outfitCategory: value }
                                setCharacterDescriptions(newDescriptions)
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select outfit..." />
                              </SelectTrigger>
                              <SelectContent>
                                {OUTFIT_CATEGORIES.map((outfit) => (
                                  <SelectItem key={outfit.value} value={outfit.value}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">{outfit.icon}</span>
                                      <span className="text-sm">{outfit.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {character.outfitCategory === 'Custom' && (
                              <Input
                                value={character.customOutfitCategory}
                                onChange={(e) => {
                                  const newDescriptions = [...characterDescriptions]
                                  newDescriptions[index] = { ...newDescriptions[index], customOutfitCategory: e.target.value }
                                  setCharacterDescriptions(newDescriptions)
                                }}
                                placeholder="Enter custom outfit..."
                                className="h-8 text-xs mt-1"
                              />
                            )}
                          </div>

                          {/* Outfit Colors */}
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">Outfit Colors</label>
                            <Input
                              value={character.outfitColors}
                              onChange={(e) => {
                                const newDescriptions = [...characterDescriptions]
                                newDescriptions[index] = { ...newDescriptions[index], outfitColors: e.target.value }
                                setCharacterDescriptions(newDescriptions)
                              }}
                              placeholder="e.g., blue and white, black and gold..."
                              className="h-8 text-xs"
                        />
                      </div>

                          {/* Expression */}
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">Expression</label>
                            <Select 
                              value={character.expression} 
                              onValueChange={(value) => {
                                const newDescriptions = [...characterDescriptions]
                                newDescriptions[index] = { ...newDescriptions[index], expression: value }
                                setCharacterDescriptions(newDescriptions)
                              }}
                            >
                    <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select expression..." />
                    </SelectTrigger>
                    <SelectContent>
                                {EXPRESSIONS.map((expression) => (
                                  <SelectItem key={expression.value} value={expression.value}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">{expression.icon}</span>
                                      <span className="text-sm">{expression.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                    </SelectContent>
                  </Select>
                            {character.expression === 'Custom' && (
                              <Input
                                value={character.customExpression}
                                onChange={(e) => {
                                  const newDescriptions = [...characterDescriptions]
                                  newDescriptions[index] = { ...newDescriptions[index], customExpression: e.target.value }
                                  setCharacterDescriptions(newDescriptions)
                                }}
                                placeholder="Enter custom expression..."
                                className="h-8 text-xs mt-1"
                              />
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>
            )}

            {/* NEW: Structured Partial Character Design - Single mode only */}
            {mode === 'single' && !containsBoth && characterPresence === 'partial' && (
              <div className="space-y-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <label className="text-xs font-medium text-foreground flex items-center gap-2">
                  <Users className="h-3 w-3 text-purple-600" />
                  Partial Character Design
                </label>

                <Collapsible className="space-y-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-8 text-xs">
                      <span>Partial Character Settings</span>
                      <ChevronDown className="h-3 w-3" />
                      </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 p-3 bg-muted/20 rounded-lg border">
                    {/* Structured fields grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Partial Type */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Partial Type</label>
                        <Select 
                          value={partialCharacter.partialType} 
                          onValueChange={(value) => setPartialCharacter({...partialCharacter, partialType: value})}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select partial type..." />
                          </SelectTrigger>
                          <SelectContent>
                            {PARTIAL_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{type.icon}</span>
                                  <span className="text-sm">{type.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {partialCharacter.partialType === 'Custom' && (
                          <Input
                            value={partialCharacter.customPartialType}
                            onChange={(e) => setPartialCharacter({...partialCharacter, customPartialType: e.target.value})}
                            placeholder="Enter custom partial type..."
                            className="h-8 text-xs mt-1"
                          />
                        )}
                      </div>

                      {/* Visibility Level */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Visibility Level</label>
                        <Select 
                          value={partialCharacter.visibilityLevel} 
                          onValueChange={(value) => setPartialCharacter({...partialCharacter, visibilityLevel: value})}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select visibility..." />
                          </SelectTrigger>
                          <SelectContent>
                            {VISIBILITY_LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{level.icon}</span>
                                  <span className="text-sm">{level.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>

                      {/* Position */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Position</label>
                        <Select 
                          value={partialCharacter.position} 
                          onValueChange={(value) => setPartialCharacter({...partialCharacter, position: value})}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select position..." />
                          </SelectTrigger>
                          <SelectContent>
                            {POSITIONS.map((position) => (
                              <SelectItem key={position.value} value={position.value}>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{position.icon}</span>
                                  <span className="text-sm">{position.label}</span>
                          </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {partialCharacter.position === 'Custom' && (
                          <Input
                            value={partialCharacter.customPosition}
                            onChange={(e) => setPartialCharacter({...partialCharacter, customPosition: e.target.value})}
                            placeholder="Enter custom position..."
                            className="h-8 text-xs mt-1"
                          />
                        )}
                        </div>

                      {/* Art Style */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Art Style</label>
                        <Select 
                          value={partialCharacter.artStyle} 
                          onValueChange={(value) => setPartialCharacter({...partialCharacter, artStyle: value})}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select style..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ART_STYLES.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{style.icon}</span>
                                  <span className="text-sm">{style.label}</span>
                                </div>
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {partialCharacter.artStyle === 'Custom' && (
                          <Input
                            value={partialCharacter.customArtStyle}
                            onChange={(e) => setPartialCharacter({...partialCharacter, customArtStyle: e.target.value})}
                            placeholder="Enter custom art style..."
                            className="h-8 text-xs mt-1"
                          />
                        )}
                      </div>

                      {/* Skin Tone - conditional on partial type */}
                      {(partialCharacter.partialType === 'Hands' || partialCharacter.partialType === 'Face' || partialCharacter.partialType === 'Feet') && (
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Skin Tone</label>
                          <Select 
                            value={partialCharacter.skinTone} 
                            onValueChange={(value) => setPartialCharacter({...partialCharacter, skinTone: value})}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select skin tone..." />
                            </SelectTrigger>
                            <SelectContent>
                              {SKIN_TONES.map((tone) => (
                                <SelectItem key={tone.value} value={tone.value}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-4 h-4 rounded-full border border-gray-300" 
                                      style={{ backgroundColor: tone.color }}
                                    />
                                    <span className="text-sm">{tone.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        </div>
                      )}

                      {/* Hand Accessories - conditional on partial type = Hands */}
                      {partialCharacter.partialType === 'Hands' && (
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Hand Accessories</label>
                          <div className="space-y-1">
                            {HAND_ACCESSORIES.map((accessory) => (
                              <div key={accessory.value} className="flex items-center space-x-2">
                        <input
                                  type="checkbox"
                                  id={`accessory-${accessory.value}`}
                                  checked={partialCharacter.accessories.includes(accessory.value)}
                          onChange={(e) => {
                                    if (e.target.checked) {
                                      setPartialCharacter({
                                        ...partialCharacter, 
                                        accessories: [...partialCharacter.accessories, accessory.value]
                                      })
                                    } else {
                                      setPartialCharacter({
                                        ...partialCharacter, 
                                        accessories: partialCharacter.accessories.filter(a => a !== accessory.value)
                                      })
                                    }
                                  }}
                                  className="h-3 w-3"
                                />
                                <label htmlFor={`accessory-${accessory.value}`} className="text-xs flex items-center gap-1">
                                  <span>{accessory.icon}</span>
                                  <span>{accessory.label}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expression - conditional on partial type = Face */}
                      {partialCharacter.partialType === 'Face' && (
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">Expression</label>
                          <Select 
                            value={partialCharacter.expression} 
                            onValueChange={(value) => setPartialCharacter({...partialCharacter, expression: value})}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select expression..." />
                            </SelectTrigger>
                            <SelectContent>
                              {EXPRESSIONS.map((expression) => (
                                <SelectItem key={expression.value} value={expression.value}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{expression.icon}</span>
                                    <span className="text-sm">{expression.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {partialCharacter.expression === 'Custom' && (
                            <Input
                              value={partialCharacter.customExpression}
                              onChange={(e) => setPartialCharacter({...partialCharacter, customExpression: e.target.value})}
                              placeholder="Enter custom expression..."
                              className="h-8 text-xs mt-1"
                            />
                          )}
                      </div>
                    )}

                      {/* Action/Pose */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Action/Pose</label>
                        <Select 
                          value={partialCharacter.actionPose} 
                          onValueChange={(value) => setPartialCharacter({...partialCharacter, actionPose: value})}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select action..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ACTIONS_POSES.map((action) => (
                              <SelectItem key={action.value} value={action.value}>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{action.icon}</span>
                                  <span className="text-sm">{action.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {partialCharacter.actionPose === 'Custom' && (
                          <Input
                            value={partialCharacter.customActionPose}
                            onChange={(e) => setPartialCharacter({...partialCharacter, customActionPose: e.target.value})}
                            placeholder="Enter custom action..."
                            className="h-8 text-xs mt-1"
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Additional Description */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">
                        Additional Description (Optional)
                      </label>
                      <Textarea
                        placeholder="Additional details about the partial character..."
                        value={partialCharacter.description}
                        onChange={(e) => setPartialCharacter({...partialCharacter, description: e.target.value})}
                        rows={2}
                        className="resize-none text-xs"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                      </div>
                    )}

            {/* Character Selection (when not voiceover) - Multi mode only */}
            {mode !== 'single' && mode !== 'dual' && !containsBoth && characterPresence !== 'voiceover' && (
              <div className="space-y-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <label className="text-xs font-medium text-foreground flex items-center gap-2">
                  <Users className="h-3 w-3 text-purple-600" />
                  {characterPresence === 'show' ? 'Choose Your Character' : 'Partial Presence Type'}
                </label>

                {characterPresence === 'show' ? (
                  <>
                    {/* Character source buttons removed for single mode - using new section below */}
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
              
              {/* Case 1: Image contains both - Simple manual script entry */}
              {containsBoth && (
                <>
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
                </>
              )}
              
              {/* Case 2: User designs characters - Dynamic conversation dialog */}
              {!containsBoth && characterPresence !== 'voiceover' && (
                <div className="space-y-4">
                  {characterCount === 1 ? (
                    // Single character - simple textarea
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">What do they say?</label>
                      <Textarea
                        value={dialogLines.length > 0 ? dialogLines[0]?.text || '' : ''}
                        onChange={(e) => {
                          if (dialogLines.length === 0) {
                            addDialogLine()
                          }
                          updateDialogLine(dialogLines[0]?.id || '', 'text', e.target.value)
                        }}
                        placeholder="Enter the exact words they should speak..."
                        className="min-h-[80px] text-xs resize-none"
                      />
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{dialogLines[0]?.text?.length || 0} characters</span>
                        <span>
                          Estimated read time: {estimateReadTime(dialogLines[0]?.text || '')}s
                          {estimateReadTime(dialogLines[0]?.text || '') > duration && (dialogLines[0]?.text?.length || 0) > 0 && (
                            <span className="text-red-500 ml-2">⚠️ Too long for {duration}s video</span>
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Multiple characters - turn-by-turn conversation
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-foreground">Turn-by-turn conversation</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addDialogLine}
                          className="text-xs h-6"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Line
                        </Button>
                      </div>
                      
                      {dialogLines.map((line, index) => (
                        <div key={line.id} className="p-3 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">Line {index + 1}</span>
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

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-foreground">Who speaks?</label>
                              <Select 
                                value={line.characterIndex.toString()} 
                                onValueChange={(value) => updateDialogLine(line.id, 'characterIndex', parseInt(value))}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Select character..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: characterCount }).map((_, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                      Character {idx + 1}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-foreground">Expression for this line</label>
                              <Select 
                                value={line.expression} 
                                onValueChange={(value) => updateDialogLine(line.id, 'expression', value)}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Select expression..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="happy">😊 Happy</SelectItem>
                                  <SelectItem value="serious">😐 Serious</SelectItem>
                                  <SelectItem value="excited">🤩 Excited</SelectItem>
                                  <SelectItem value="confident">😎 Confident</SelectItem>
                                  <SelectItem value="friendly">🙂 Friendly</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-foreground">What do they say?</label>
                            <Textarea
                              value={line.text}
                              onChange={(e) => updateDialogLine(line.id, 'text', e.target.value)}
                              placeholder="Enter the dialog for this line..."
                              className="min-h-[60px] text-xs resize-none"
                            />
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>{line.text.length} characters</span>
                              <span>
                                Estimated read time: {estimateReadTime(line.text)}s
                                {estimateReadTime(line.text) > duration && line.text.length > 0 && (
                                  <span className="text-red-500 ml-2">⚠️ Too long for {duration}s video</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Case 3: Voiceover only - Simple script */}
              {!containsBoth && characterPresence === 'voiceover' && (
                <>
                  <Textarea
                    placeholder="Enter your voiceover script..."
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
                </>
              )}

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
                  variant={duration === 45 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(45)}
                  className="h-8 text-xs"
                >
                  ⏱️ 45s
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
                  variant={duration === 90 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(90)}
                  className="h-8 text-xs"
                >
                  🎯 90s
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
                {duration === 45 && '⏱️ Extended social media content'}
                {duration === 60 && '🎬 Standard YouTube and Facebook ads'}
                {duration === 90 && '🎯 In-depth product showcases'}
                {duration === 120 && '🎥 Full-length product demonstrations'}
              </p>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Camera className="h-3 w-3 text-purple-600" />
                Aspect Ratio
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={aspectRatio === '9:16' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAspectRatio('9:16')}
                  className="h-16 flex flex-col items-center justify-center gap-1"
                >
                  <div className="w-6 h-10 border-2 border-current rounded"></div>
                  <span className="text-xs">9:16</span>
                  <span className="text-[10px] text-muted-foreground">Vertical</span>
                </Button>
                
                <Button
                  type="button"
                  variant={aspectRatio === '16:9' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAspectRatio('16:9')}
                  className="h-16 flex flex-col items-center justify-center gap-1"
                >
                  <div className="w-10 h-6 border-2 border-current rounded"></div>
                  <span className="text-xs">16:9</span>
                  <span className="text-[10px] text-muted-foreground">Horizontal</span>
                </Button>
                
                <Button
                  type="button"
                  variant={aspectRatio === '1:1' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAspectRatio('1:1')}
                  className="h-16 flex flex-col items-center justify-center gap-1"
                >
                  <div className="w-8 h-8 border-2 border-current rounded"></div>
                  <span className="text-xs">1:1</span>
                  <span className="text-[10px] text-muted-foreground">Square</span>
                </Button>
              </div>
              
              {aspectRatio === '1:1' && (
                <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Square videos will be outpainted to fill the frame
                </p>
              )}
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

              {/* Preview for selected product from library - Image 1 */}
              {images[0]?.productId && images[0]?.source === 'library' && (() => {
                const selectedProduct = availableProducts.find(p => p.id === images[0].productId)
                if (!selectedProduct) return null
                
                const productImageUrl = selectedProduct.generated_images?.[0] || selectedProduct.image_url || selectedProduct.imageUrl
                return (
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {productImageUrl ? (
                        <img 
                          src={productImageUrl} 
                          alt={selectedProduct.title || selectedProduct.name}
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
                          {selectedProduct.title || selectedProduct.name || 'Untitled Product'}
                        </p>
                        {selectedProduct.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {selectedProduct.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })()}

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

              {/* Contains Both Checkbox - Clean & Bold */}
              <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                <Checkbox
                    id="contains-both-img1"
                  checked={images[0]?.containsBoth || false}
                  onCheckedChange={(checked) => updateImageSlot(0, { containsBoth: checked as boolean })}
                    className="border-purple-600 data-[state=checked]:bg-purple-600"
                  />
                  <label 
                    htmlFor="contains-both-img1" 
                    className="text-sm font-bold text-purple-900 dark:text-purple-100 cursor-pointer"
                  >
                    ⚡ This image contains both character and product
                </label>
                </div>
              </div>

              {/* Optional Description */}
              <Textarea
                placeholder="Describe this image or how to use it (optional)..."
                value={images[0]?.description || ''}
                onChange={(e) => updateImageSlot(0, { description: e.target.value })}
                rows={3}
                className="text-sm resize-none"
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

              {/* Preview for selected product from library - Image 2 */}
              {images[1]?.productId && images[1]?.source === 'library' && (() => {
                const selectedProduct = availableProducts.find(p => p.id === images[1].productId)
                if (!selectedProduct) return null
                
                const productImageUrl = selectedProduct.generated_images?.[0] || selectedProduct.image_url || selectedProduct.imageUrl
                return (
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {productImageUrl ? (
                        <img 
                          src={productImageUrl} 
                          alt={selectedProduct.title || selectedProduct.name}
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
                          {selectedProduct.title || selectedProduct.name || 'Untitled Product'}
                        </p>
                        {selectedProduct.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {selectedProduct.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })()}

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

              {/* Contains Both Checkbox - Clean & Bold */}
              <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                <Checkbox
                    id="contains-both-img2"
                  checked={images[1]?.containsBoth || false}
                  onCheckedChange={(checked) => updateImageSlot(1, { containsBoth: checked as boolean })}
                    className="border-purple-600 data-[state=checked]:bg-purple-600"
                  />
                  <label 
                    htmlFor="contains-both-img2" 
                    className="text-sm font-bold text-purple-900 dark:text-purple-100 cursor-pointer"
                  >
                    ⚡ This image contains both character and product
                </label>
                </div>
              </div>

              {/* Optional Description */}
              <Textarea
                placeholder="Describe this image or how to use it (optional)..."
                value={images[1]?.description || ''}
                onChange={(e) => updateImageSlot(1, { description: e.target.value })}
                rows={3}
                className="text-sm resize-none"
              />
              
              {/* Validation Error */}
              {validationErrors.image2 && (
                <div className="text-xs text-red-500 flex items-center gap-1">
                  <span>⚠️</span>
                  {validationErrors.image2}
                </div>
              )}
            </div>

            {/* Character Descriptions (Dual Mode - Show) */}
            {/* NEW: Multiple Character Description - Dual mode only */}
            {mode === 'dual' && !images[0]?.containsBoth && !images[1]?.containsBoth && characterPresence === 'show' && (
              <div className="space-y-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <label className="text-xs font-medium text-foreground flex items-center gap-2">
                  <Users className="h-3 w-3 text-purple-600" />
                  Character Descriptions
                </label>
                
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
                        className="h-6 w-6 p-0"
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
                            setCharacterDescriptions(prev => [...prev, {
                              description: '',
                              artStyle: '',
                              customArtStyle: '',
                              ageRange: '',
                              customAgeRange: '',
                              ethnicity: '',
                              customEthnicity: '',
                              gender: '',
                              customGender: '',
                              bodyType: '',
                              customBodyType: '',
                              outfitCategory: '',
                              customOutfitCategory: '',
                              outfitColors: '',
                              expression: '',
                              customExpression: ''
                            }])
                          }
                        }}
                        disabled={characterCount >= 5}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Describe each character separately. Maximum 5 characters. In dual mode, you can only describe characters.
                  </p>
                
                  {/* Character description fields */}
                  {characterDescriptions.map((character, index) => (
                    <Collapsible key={index} className="space-y-2">
                      <CollapsibleTrigger asChild>
                      <Button
                          variant="outline"
                          className="w-full justify-between h-8 text-xs"
                        >
                          <span>Character {index + 1}</span>
                          <ChevronDown className="h-3 w-3" />
                      </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-3 p-3 bg-muted/20 rounded-lg border">
                        {/* Free-text description */}
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">
                            Additional Description (Optional)
                          </label>
                          <Textarea
                            placeholder={`Additional details for character ${index + 1}...`}
                            value={character.description}
                            onChange={(e) => {
                              const newDescriptions = [...characterDescriptions]
                              newDescriptions[index] = { ...newDescriptions[index], description: e.target.value }
                              setCharacterDescriptions(newDescriptions)
                            }}
                            rows={2}
                            className="resize-none text-xs"
                          />
                    </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Art Style</label>
                          <Select value={character.artStyle} onValueChange={(value) => {
                            const newDescriptions = [...characterDescriptions]
                            newDescriptions[index] = { ...newDescriptions[index], artStyle: value }
                            setCharacterDescriptions(newDescriptions)
                          }}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select style..." />
                            </SelectTrigger>
                            <SelectContent>
                              {ART_STYLES.map((style) => (
                                <SelectItem key={style.value} value={style.value} className="text-xs">
                                  {style.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {character.artStyle === 'custom' && (
                            <Input
                              placeholder="Custom art style..."
                              value={character.customArtStyle}
                              onChange={(e) => {
                                const newDescriptions = [...characterDescriptions]
                                newDescriptions[index] = { ...newDescriptions[index], customArtStyle: e.target.value }
                                setCharacterDescriptions(newDescriptions)
                              }}
                              className="h-8 text-xs"
                            />
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Age Range</label>
                          <Select value={character.ageRange} onValueChange={(value) => {
                            const newDescriptions = [...characterDescriptions]
                            newDescriptions[index] = { ...newDescriptions[index], ageRange: value }
                            setCharacterDescriptions(newDescriptions)
                          }}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select age..." />
                            </SelectTrigger>
                            <SelectContent>
                              {AGE_RANGES.map((age) => (
                                <SelectItem key={age.value} value={age.value} className="text-xs">
                                  {age.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {character.ageRange === 'custom' && (
                            <Input
                              placeholder="Custom age range..."
                              value={character.customAgeRange}
                              onChange={(e) => {
                                const newDescriptions = [...characterDescriptions]
                                newDescriptions[index] = { ...newDescriptions[index], customAgeRange: e.target.value }
                                setCharacterDescriptions(newDescriptions)
                              }}
                              className="h-8 text-xs"
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Ethnicity</label>
                          <Select value={character.ethnicity} onValueChange={(value) => {
                            const newDescriptions = [...characterDescriptions]
                            newDescriptions[index] = { ...newDescriptions[index], ethnicity: value }
                            setCharacterDescriptions(newDescriptions)
                          }}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select ethnicity..." />
                            </SelectTrigger>
                            <SelectContent>
                              {ETHNICITY_OPTIONS.map((ethnicity) => (
                                <SelectItem key={ethnicity.value} value={ethnicity.value} className="text-xs">
                                  {ethnicity.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {character.ethnicity === 'custom' && (
                            <Input
                              placeholder="Custom ethnicity..."
                              value={character.customEthnicity}
                              onChange={(e) => {
                                const newDescriptions = [...characterDescriptions]
                                newDescriptions[index] = { ...newDescriptions[index], customEthnicity: e.target.value }
                                setCharacterDescriptions(newDescriptions)
                              }}
                              className="h-8 text-xs"
                            />
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Gender</label>
                          <Select value={character.gender} onValueChange={(value) => {
                            const newDescriptions = [...characterDescriptions]
                            newDescriptions[index] = { ...newDescriptions[index], gender: value }
                            setCharacterDescriptions(newDescriptions)
                          }}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select gender..." />
                            </SelectTrigger>
                            <SelectContent>
                              {GENDER_OPTIONS.map((gender) => (
                                <SelectItem key={gender.value} value={gender.value} className="text-xs">
                                  {gender.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {character.gender === 'custom' && (
                            <Input
                              placeholder="Custom gender..."
                              value={character.customGender}
                              onChange={(e) => {
                                const newDescriptions = [...characterDescriptions]
                                newDescriptions[index] = { ...newDescriptions[index], customGender: e.target.value }
                                setCharacterDescriptions(newDescriptions)
                              }}
                              className="h-8 text-xs"
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Body Type</label>
                          <Select value={character.bodyType} onValueChange={(value) => {
                            const newDescriptions = [...characterDescriptions]
                            newDescriptions[index] = { ...newDescriptions[index], bodyType: value }
                            setCharacterDescriptions(newDescriptions)
                          }}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select body type..." />
                            </SelectTrigger>
                            <SelectContent>
                              {BODY_TYPES.map((body) => (
                                <SelectItem key={body.value} value={body.value} className="text-xs">
                                  {body.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {character.bodyType === 'custom' && (
                            <Input
                              placeholder="Custom body type..."
                              value={character.customBodyType}
                              onChange={(e) => {
                                const newDescriptions = [...characterDescriptions]
                                newDescriptions[index] = { ...newDescriptions[index], customBodyType: e.target.value }
                                setCharacterDescriptions(newDescriptions)
                              }}
                              className="h-8 text-xs"
                            />
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Outfit Category</label>
                          <Select value={character.outfitCategory} onValueChange={(value) => {
                            const newDescriptions = [...characterDescriptions]
                            newDescriptions[index] = { ...newDescriptions[index], outfitCategory: value }
                            setCharacterDescriptions(newDescriptions)
                          }}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select outfit..." />
                            </SelectTrigger>
                            <SelectContent>
                              {OUTFIT_CATEGORIES.map((outfit) => (
                                <SelectItem key={outfit.value} value={outfit.value} className="text-xs">
                                  {outfit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {character.outfitCategory === 'custom' && (
                            <Input
                              placeholder="Custom outfit category..."
                              value={character.customOutfitCategory}
                              onChange={(e) => {
                                const newDescriptions = [...characterDescriptions]
                                newDescriptions[index] = { ...newDescriptions[index], customOutfitCategory: e.target.value }
                                setCharacterDescriptions(newDescriptions)
                              }}
                              className="h-8 text-xs"
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Outfit Colors</label>
                        <Input
                          placeholder="e.g., blue jeans, white t-shirt, red sneakers..."
                          value={character.outfitColors}
                          onChange={(e) => {
                            const newDescriptions = [...characterDescriptions]
                            newDescriptions[index] = { ...newDescriptions[index], outfitColors: e.target.value }
                            setCharacterDescriptions(newDescriptions)
                          }}
                          className="h-8 text-xs"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Expression</label>
                        <Select value={character.expression} onValueChange={(value) => {
                          const newDescriptions = [...characterDescriptions]
                          newDescriptions[index] = { ...newDescriptions[index], expression: value }
                          setCharacterDescriptions(newDescriptions)
                        }}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select expression..." />
                          </SelectTrigger>
                          <SelectContent>
                            {EXPRESSIONS.map((expression) => (
                              <SelectItem key={expression.value} value={expression.value} className="text-xs">
                                {expression.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {character.expression === 'custom' && (
                          <Input
                            placeholder="Custom expression..."
                            value={character.customExpression}
                            onChange={(e) => {
                              const newDescriptions = [...characterDescriptions]
                              newDescriptions[index] = { ...newDescriptions[index], customExpression: e.target.value }
                              setCharacterDescriptions(newDescriptions)
                            }}
                            className="h-8 text-xs"
                          />
                        )}
                      </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>
            )}

            {/* Partial Character Design (Dual Mode - Partial) */}
            {mode === 'dual' && !images[0]?.containsBoth && !images[1]?.containsBoth && characterPresence === 'partial' && (
              <div className="space-y-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <label className="text-xs font-medium text-foreground flex items-center gap-2">
                  <Users className="h-3 w-3 text-purple-600" />
                  Structured Partial Character Design
                </label>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Partial Type</label>
                    <Select value={partialCharacter.partialType} onValueChange={(value) => setPartialCharacter({ ...partialCharacter, partialType: value })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select partial type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PARTIAL_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-xs">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {partialCharacter.partialType === 'custom' && (
                      <Input
                        placeholder="Custom partial type..."
                        value={partialCharacter.customPartialType}
                        onChange={(e) => setPartialCharacter({ ...partialCharacter, customPartialType: e.target.value })}
                        className="h-8 text-xs"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Visibility Level</label>
                    <Select value={partialCharacter.visibilityLevel} onValueChange={(value) => setPartialCharacter({ ...partialCharacter, visibilityLevel: value })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select visibility..." />
                      </SelectTrigger>
                      <SelectContent>
                        {VISIBILITY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value} className="text-xs">
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Position</label>
                    <Select value={partialCharacter.position} onValueChange={(value) => setPartialCharacter({ ...partialCharacter, position: value })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select position..." />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITIONS.map((position) => (
                          <SelectItem key={position.value} value={position.value} className="text-xs">
                            {position.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {partialCharacter.position === 'custom' && (
                      <Input
                        placeholder="Custom position..."
                        value={partialCharacter.customPosition}
                        onChange={(e) => setPartialCharacter({ ...partialCharacter, customPosition: e.target.value })}
                        className="h-8 text-xs"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Art Style</label>
                    <Select value={partialCharacter.artStyle} onValueChange={(value) => setPartialCharacter({ ...partialCharacter, artStyle: value })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select art style..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ART_STYLES.map((style) => (
                          <SelectItem key={style.value} value={style.value} className="text-xs">
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {partialCharacter.artStyle === 'custom' && (
                      <Input
                        placeholder="Custom art style..."
                        value={partialCharacter.customArtStyle}
                        onChange={(e) => setPartialCharacter({ ...partialCharacter, customArtStyle: e.target.value })}
                        className="h-8 text-xs"
                      />
                    )}
                  </div>
                </div>
                
                {(partialCharacter.partialType === 'hands' || partialCharacter.partialType === 'face' || partialCharacter.partialType === 'custom') && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Skin Tone</label>
                    <Select value={partialCharacter.skinTone} onValueChange={(value) => setPartialCharacter({ ...partialCharacter, skinTone: value })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select skin tone..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SKIN_TONES.map((tone) => (
                          <SelectItem key={tone.value} value={tone.value} className="text-xs">
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {partialCharacter.skinTone === 'custom' && (
                      <Input
                        placeholder="Custom skin tone..."
                        value={partialCharacter.customSkinTone}
                        onChange={(e) => setPartialCharacter({ ...partialCharacter, customSkinTone: e.target.value })}
                        className="h-8 text-xs"
                      />
                    )}
                  </div>
                )}
                
                {partialCharacter.partialType === 'hands' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Hand Accessories</label>
                    <Select value={partialCharacter.handAccessories} onValueChange={(value) => setPartialCharacter({ ...partialCharacter, handAccessories: value })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select accessories..." />
                      </SelectTrigger>
                      <SelectContent>
                        {HAND_ACCESSORIES.map((accessory) => (
                          <SelectItem key={accessory.value} value={accessory.value} className="text-xs">
                            {accessory.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {partialCharacter.handAccessories === 'custom' && (
                      <Input
                        placeholder="Custom hand accessories..."
                        value={partialCharacter.customHandAccessories}
                        onChange={(e) => setPartialCharacter({ ...partialCharacter, customHandAccessories: e.target.value })}
                        className="h-8 text-xs"
                      />
                    )}
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-xs font-medium">Expression</label>
                  <Select value={partialCharacter.expression} onValueChange={(value) => setPartialCharacter({ ...partialCharacter, expression: value })}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select expression..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPRESSIONS.map((expression) => (
                        <SelectItem key={expression.value} value={expression.value} className="text-xs">
                          {expression.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {partialCharacter.expression === 'custom' && (
                    <Input
                      placeholder="Custom expression..."
                      value={partialCharacter.customExpression}
                      onChange={(e) => setPartialCharacter({ ...partialCharacter, customExpression: e.target.value })}
                      className="h-8 text-xs"
                    />
                  )}
                </div>
              </div>
            )}

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
                  variant={duration === 45 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(45)}
                  className="h-8 text-xs"
                >
                  ⏱️ 45s
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
                  variant={duration === 90 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(90)}
                  className="h-8 text-xs"
                >
                  🎯 90s
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
                {duration === 45 && '⏱️ Extended social media content'}
                {duration === 60 && '🎬 Standard YouTube and Facebook ads'}
                {duration === 90 && '🎯 In-depth product showcases'}
                {duration === 120 && '🎥 Full-length product demonstrations'}
              </p>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Camera className="h-3 w-3 text-purple-600" />
                Aspect Ratio
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={aspectRatio === '9:16' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAspectRatio('9:16')}
                  className="h-16 flex flex-col items-center justify-center gap-1"
                >
                  <div className="w-6 h-10 border-2 border-current rounded"></div>
                  <span className="text-xs">9:16</span>
                  <span className="text-[10px] text-muted-foreground">Vertical</span>
                </Button>
                
                <Button
                  type="button"
                  variant={aspectRatio === '16:9' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAspectRatio('16:9')}
                  className="h-16 flex flex-col items-center justify-center gap-1"
                >
                  <div className="w-10 h-6 border-2 border-current rounded"></div>
                  <span className="text-xs">16:9</span>
                  <span className="text-[10px] text-muted-foreground">Horizontal</span>
                </Button>
                
                <Button
                  type="button"
                  variant={aspectRatio === '1:1' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAspectRatio('1:1')}
                  className="h-16 flex flex-col items-center justify-center gap-1"
                >
                  <div className="w-8 h-8 border-2 border-current rounded"></div>
                  <span className="text-xs">1:1</span>
                  <span className="text-[10px] text-muted-foreground">Square</span>
                </Button>
              </div>
              
              {aspectRatio === '1:1' && (
                <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Square videos will be outpainted to fill the frame
                </p>
              )}
            </div>

            {/* Character Presence (Optional) - Only show if neither image contains both */}
            {!images[0]?.containsBoth && !images[1]?.containsBoth && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Users className="h-3 w-3 text-purple-600" />
                Character Presence (Optional)
              </label>
              
              <div className="space-y-3">
                {/* Voiceover Option */}
                <div 
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    characterPresence === 'voiceover'
                      ? "border-purple-300 bg-purple-50/50 dark:border-purple-600 dark:bg-purple-950/20"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 dark:border-gray-700 dark:hover:border-purple-600 dark:hover:bg-purple-950/10"
                  }`}
                  onClick={() => setCharacterPresence('voiceover')}
                >
                  <input
                    type="radio"
                    id="voiceover-option"
                    name="characterPresence"
                    value="voiceover"
                    checked={characterPresence === 'voiceover'}
                    onChange={(e) => setCharacterPresence(e.target.value as any)}
                    className="mt-1"
                  />
                  <label htmlFor="voiceover-option" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🎙️</span>
                      <span className="font-medium text-sm">Voiceover</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Audio narration only - no character appears in the video. Perfect for product-focused content with professional voice explanation.
                    </p>
                  </label>
                </div>

                {/* Show Option */}
                <div 
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    characterPresence === 'show'
                      ? "border-purple-300 bg-purple-50/50 dark:border-purple-600 dark:bg-purple-950/20"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 dark:border-gray-700 dark:hover:border-purple-600 dark:hover:bg-purple-950/10"
                  }`}
                  onClick={() => setCharacterPresence('show')}
                >
                  <input
                    type="radio"
                    id="show-option"
                    name="characterPresence"
                    value="show"
                    checked={characterPresence === 'show'}
                    onChange={(e) => setCharacterPresence(e.target.value as any)}
                    className="mt-1"
                  />
                  <label htmlFor="show-option" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">👤</span>
                      <span className="font-medium text-sm">Show</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Full character visible in the video - complete body, face, and presence. Ideal for authentic, relatable UGC-style content.
                    </p>
                  </label>
                </div>

                {/* Partial Option */}
                <div 
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    characterPresence === 'partial'
                      ? "border-purple-300 bg-purple-50/50 dark:border-purple-600 dark:bg-purple-950/20"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 dark:border-gray-700 dark:hover:border-purple-600 dark:hover:bg-purple-950/10"
                  }`}
                  onClick={() => setCharacterPresence('partial')}
                >
                  <input
                    type="radio"
                    id="partial-option"
                    name="characterPresence"
                    value="partial"
                    checked={characterPresence === 'partial'}
                    onChange={(e) => setCharacterPresence(e.target.value as any)}
                    className="mt-1"
                  />
                  <label htmlFor="partial-option" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">✋</span>
                      <span className="font-medium text-sm">Partial</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Partial character presence - show only hands, face, feet, or silhouette. Great for subtle human touch without full character focus.
                    </p>
                  </label>
                </div>
              </div>
            </div>
            )}

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

              {/* Preview for selected product from library - Image 1 */}
              {images[0]?.productId && images[0]?.source === 'library' && (() => {
                const selectedProduct = availableProducts.find(p => p.id === images[0].productId)
                if (!selectedProduct) return null
                
                const productImageUrl = selectedProduct.generated_images?.[0] || selectedProduct.image_url || selectedProduct.imageUrl
                return (
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {productImageUrl ? (
                        <img 
                          src={productImageUrl} 
                          alt={selectedProduct.title || selectedProduct.name}
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
                          {selectedProduct.title || selectedProduct.name || 'Untitled Product'}
                        </p>
                        {selectedProduct.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {selectedProduct.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })()}

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
              <Textarea
                placeholder="Describe how to use this reference (optional)..."
                value={images[0]?.description || ''}
                onChange={(e) => updateImageSlot(0, { description: e.target.value })}
                rows={3}
                className="text-sm resize-none"
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

              {/* Preview for selected product from library - Image 2 */}
              {images[1]?.productId && images[1]?.source === 'library' && (() => {
                const selectedProduct = availableProducts.find(p => p.id === images[1].productId)
                if (!selectedProduct) return null
                
                const productImageUrl = selectedProduct.generated_images?.[0] || selectedProduct.image_url || selectedProduct.imageUrl
                return (
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {productImageUrl ? (
                        <img 
                          src={productImageUrl} 
                          alt={selectedProduct.title || selectedProduct.name}
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
                          {selectedProduct.title || selectedProduct.name || 'Untitled Product'}
                        </p>
                        {selectedProduct.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {selectedProduct.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })()}

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

              <Textarea
                placeholder="Describe how to use this reference (optional)..."
                value={images[1]?.description || ''}
                onChange={(e) => updateImageSlot(1, { description: e.target.value })}
                rows={3}
                className="text-sm resize-none"
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

              {/* Preview for selected product from library - Image 3 */}
              {images[2]?.productId && images[2]?.source === 'library' && (() => {
                const selectedProduct = availableProducts.find(p => p.id === images[2].productId)
                if (!selectedProduct) return null
                
                const productImageUrl = selectedProduct.generated_images?.[0] || selectedProduct.image_url || selectedProduct.imageUrl
                return (
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {productImageUrl ? (
                        <img 
                          src={productImageUrl} 
                          alt={selectedProduct.title || selectedProduct.name}
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
                          {selectedProduct.title || selectedProduct.name || 'Untitled Product'}
                        </p>
                        {selectedProduct.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {selectedProduct.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })()}

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

              <Textarea
                placeholder="Describe how to use this reference (optional)..."
                value={images[2]?.description || ''}
                onChange={(e) => updateImageSlot(2, { description: e.target.value })}
                rows={3}
                className="text-sm resize-none"
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
              
              {(images[0]?.containsBoth || images[1]?.containsBoth || characterPresence === 'voiceover') ? (
                // Simple script textarea
                <>
              <Textarea
                    placeholder="Write your script or voiceover narration..."
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
                </>
              ) : (
                // Dynamic based on character count
                <>
                  {characterCount === 1 ? (
                    // Single character - simple dialog
                    <>
                      <Textarea
                        placeholder="What does the character say?"
                        value={dialogLines[0]?.text || ''}
                        onChange={(e) => updateDialogLine('0', 'text', e.target.value)}
                        rows={3}
                        className="resize-none text-xs"
                      />
                      
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{(dialogLines[0]?.text || '').length} characters</span>
                        <span>
                          Estimated read time: {estimateReadTime(dialogLines[0]?.text || '')}s
                          {estimateReadTime(dialogLines[0]?.text || '') > duration && (dialogLines[0]?.text || '').length > 0 && (
                            <span className="text-red-500 ml-2">⚠️ Too long for {duration}s video</span>
                          )}
                        </span>
                      </div>
                    </>
                  ) : (
                    // Multiple characters - turn-by-turn conversation
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium">Turn-by-Turn Conversation</label>
                        <Button 
                          type="button"
                          size="sm" 
                          onClick={addDialogLine}
                          className="h-6 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Line
                        </Button>
                      </div>
                      
                      {dialogLines.map((line, index) => (
                        <div key={index} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">Line {index + 1}</span>
                            <div className="flex gap-1">
                              {index > 0 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => moveDialogLine(index.toString(), 'up')}
                                  className="h-6 w-6 p-0"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                              )}
                              {index < dialogLines.length - 1 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => moveDialogLine(index.toString(), 'down')}
                                  className="h-6 w-6 p-0"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeDialogLine(index.toString())}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-xs font-medium">Who speaks?</label>
                              <Select 
                                value={line.characterIndex?.toString() || ''} 
                                onValueChange={(value) => updateDialogLine(index.toString(), 'characterIndex', parseInt(value))}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Select character..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: characterCount }, (_, i) => (
                                    <SelectItem key={i} value={i.toString()} className="text-xs">
                                      Character {i + 1}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-xs font-medium">Expression for this line</label>
                              <Select 
                                value={line.expression || ''} 
                                onValueChange={(value) => updateDialogLine(index.toString(), 'expression', value)}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Select expression..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {EXPRESSIONS.map((expression) => (
                                    <SelectItem key={expression.value} value={expression.value} className="text-xs">
                                      {expression.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-xs font-medium">What do they say?</label>
                            <Textarea
                              placeholder="Enter the dialog text..."
                              value={line.text}
                              onChange={(e) => updateDialogLine(index.toString(), 'text', e.target.value)}
                              rows={2}
                              className="resize-none text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

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
                  variant={duration === 45 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(45)}
                  className="h-8 text-xs"
                >
                  ⏱️ 45s
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
                  variant={duration === 90 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDuration(90)}
                  className="h-8 text-xs"
                >
                  🎯 90s
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
                {duration === 45 && '⏱️ Extended social media content'}
                {duration === 60 && '🎬 Standard YouTube and Facebook ads'}
                {duration === 90 && '🎯 In-depth product showcases'}
                {duration === 120 && '🎥 Full-length product demonstrations'}
              </p>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Camera className="h-3 w-3 text-purple-600" />
                Aspect Ratio
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={aspectRatio === '9:16' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAspectRatio('9:16')}
                  className="h-16 flex flex-col items-center justify-center gap-1"
                >
                  <div className="w-6 h-10 border-2 border-current rounded"></div>
                  <span className="text-xs">9:16</span>
                  <span className="text-[10px] text-muted-foreground">Vertical</span>
                </Button>
                
                <Button
                  type="button"
                  variant={aspectRatio === '16:9' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAspectRatio('16:9')}
                  className="h-16 flex flex-col items-center justify-center gap-1"
                >
                  <div className="w-10 h-6 border-2 border-current rounded"></div>
                  <span className="text-xs">16:9</span>
                  <span className="text-[10px] text-muted-foreground">Horizontal</span>
                </Button>
                
                <Button
                  type="button"
                  variant={aspectRatio === '1:1' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAspectRatio('1:1')}
                  className="h-16 flex flex-col items-center justify-center gap-1"
                >
                  <div className="w-8 h-8 border-2 border-current rounded"></div>
                  <span className="text-xs">1:1</span>
                  <span className="text-[10px] text-muted-foreground">Square</span>
                </Button>
              </div>
              
              {aspectRatio === '1:1' && (
                <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Square videos will be outpainted to fill the frame
                </p>
              )}
            </div>

            {/* Character Presence (Optional) - Only show if neither image contains both */}
            {!images[0]?.containsBoth && !images[1]?.containsBoth && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Users className="h-3 w-3 text-purple-600" />
                Character Presence (Optional)
              </label>
              
              <div className="space-y-3">
                {/* Voiceover Option */}
                <div 
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    characterPresence === 'voiceover'
                      ? "border-purple-300 bg-purple-50/50 dark:border-purple-600 dark:bg-purple-950/20"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 dark:border-gray-700 dark:hover:border-purple-600 dark:hover:bg-purple-950/10"
                  }`}
                  onClick={() => setCharacterPresence('voiceover')}
                >
                  <input
                    type="radio"
                    id="voiceover-option"
                    name="characterPresence"
                    value="voiceover"
                    checked={characterPresence === 'voiceover'}
                    onChange={(e) => setCharacterPresence(e.target.value as any)}
                    className="mt-1"
                  />
                  <label htmlFor="voiceover-option" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🎙️</span>
                      <span className="font-medium text-sm">Voiceover</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Audio narration only - no character appears in the video. Perfect for product-focused content with professional voice explanation.
                    </p>
                  </label>
                </div>

                {/* Show Option */}
                <div 
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    characterPresence === 'show'
                      ? "border-purple-300 bg-purple-50/50 dark:border-purple-600 dark:bg-purple-950/20"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 dark:border-gray-700 dark:hover:border-purple-600 dark:hover:bg-purple-950/10"
                  }`}
                  onClick={() => setCharacterPresence('show')}
                >
                  <input
                    type="radio"
                    id="show-option"
                    name="characterPresence"
                    value="show"
                    checked={characterPresence === 'show'}
                    onChange={(e) => setCharacterPresence(e.target.value as any)}
                    className="mt-1"
                  />
                  <label htmlFor="show-option" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">👤</span>
                      <span className="font-medium text-sm">Show</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Full character visible in the video - complete body, face, and presence. Ideal for authentic, relatable UGC-style content.
                    </p>
                  </label>
                </div>

                {/* Partial Option */}
                <div 
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    characterPresence === 'partial'
                      ? "border-purple-300 bg-purple-50/50 dark:border-purple-600 dark:bg-purple-950/20"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 dark:border-gray-700 dark:hover:border-purple-600 dark:hover:bg-purple-950/10"
                  }`}
                  onClick={() => setCharacterPresence('partial')}
                >
                  <input
                    type="radio"
                    id="partial-option"
                    name="characterPresence"
                    value="partial"
                    checked={characterPresence === 'partial'}
                    onChange={(e) => setCharacterPresence(e.target.value as any)}
                    className="mt-1"
                  />
                  <label htmlFor="partial-option" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">✋</span>
                      <span className="font-medium text-sm">Partial</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Partial character presence - show only hands, face, feet, or silhouette. Great for subtle human touch without full character focus.
                    </p>
                  </label>
                </div>
              </div>
            </div>
            )}

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
