"use client"

import { useState, useEffect, useRef } from "react"
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
  User, 
  Palette,
  Type,
  Layout,
  Camera,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Loader2,
  Eye,
  Download,
  RefreshCw
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
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { STYLE_MAP } from "@/lib/styles/style-map"
import { 
  ProductMockupGenerationRequest, 
  AvailableAvatar,
  ProductMockupGenerationResult 
} from "@/lib/types/product-mockup"

interface ProductMockupGeneratorInterfaceProps {
  onClose: () => void
  projectTitle: string
  selectedArtifact?: {
    id: string
    title: string
    image: string
    description: string
  }
}

// Aspect ratio visual components
const AspectRatioIcon = ({ ratio }: { ratio: string }) => {
  const getIconStyle = () => {
    switch (ratio) {
      case "1:1": return "w-3 h-3 border border-muted-foreground/50"
      case "4:5": return "w-3 h-4 border border-muted-foreground/50"
      case "16:9": return "w-4 h-2.5 border border-muted-foreground/50"
      case "9:16": return "w-2.5 h-4 border border-muted-foreground/50"
      case "2:1": return "w-4 h-2 border border-muted-foreground/50"
      case "3:4": return "w-3.5 h-4 border border-muted-foreground/50"
      case "2:3": return "w-3 h-4 border border-muted-foreground/50"
      case "4:3": return "w-4 h-3 border border-muted-foreground/50"
      case "3:2": return "w-4 h-3 border border-muted-foreground/50"
      default: return "w-3 h-3 border border-muted-foreground/50"
    }
  }
  return <div className={getIconStyle()} />
}

export function ProductMockupGeneratorInterface({ 
  onClose, 
  projectTitle, 
  selectedArtifact 
}: ProductMockupGeneratorInterfaceProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Basic Settings
  const [prompt, setPrompt] = useState("")
  const [imageCount, setImageCount] = useState(4)
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "16:9" | "9:16" | "2:1" | "3:4" | "2:3" | "4:3" | "3:2">("1:1")
  
  // Product Photos
  const [productPhotos, setProductPhotos] = useState<File[]>([])
  const [productPhotoPreviews, setProductPhotoPreviews] = useState<string[]>([])
  
  // Logo Upload
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoUsagePrompt, setLogoUsagePrompt] = useState("")
  
  // Art Direction & Visual Influence
  const [artDirection, setArtDirection] = useState<string>("")
  const [visualInfluence, setVisualInfluence] = useState<string>("")
  const [lightingPreset, setLightingPreset] = useState<string>("")
  const [backgroundEnvironment, setBackgroundEnvironment] = useState<string>("")
  const [moodContext, setMoodContext] = useState<string>("")
  
  // Composition & Branding
  const [compositionTemplate, setCompositionTemplate] = useState<"Centered Hero" | "Rule of Thirds" | "Floating Object" | "Flat Lay" | "Collage">("Centered Hero")
  const [objectCount, setObjectCount] = useState<1 | 2 | 3>(1)
  const [shadowType, setShadowType] = useState<"Soft" | "Hard" | "Floating" | "Mirror">("Soft")
  const [logoPlacement, setLogoPlacement] = useState<"Auto" | "Top Left" | "Top Right" | "Bottom Left" | "Bottom Right" | "Center">("Auto")
  
  // Text & CTA Overlay
  const [headline, setHeadline] = useState("")
  const [subtext, setSubtext] = useState("")
  const [ctaText, setCtaText] = useState("")
  const [fontFamily, setFontFamily] = useState<"serif" | "sans" | "condensed" | "rounded">("sans")
  const [fontWeight, setFontWeight] = useState<"light" | "normal" | "medium" | "bold">("normal")
  const [textCase, setTextCase] = useState<"uppercase" | "title" | "sentence">("sentence")
  const [letterSpacing, setLetterSpacing] = useState(0)
  const [lineHeight, setLineHeight] = useState(1.2)
  const [textColor, setTextColor] = useState("#000000")
  const [textAlignment, setTextAlignment] = useState<"left" | "center" | "right">("center")
  const [textEffects, setTextEffects] = useState<string[]>([])
  
  // Advanced Typography
  const [highlightStyle, setHighlightStyle] = useState<"underline" | "boxed" | "glow" | "gradient" | "none">("none")
  const [accentElement, setAccentElement] = useState<"line" | "shape" | "dot" | "none">("none")
  const [brilliance, setBrilliance] = useState(0)
  const [frostedGlass, setFrostedGlass] = useState(false)
  const [dropShadowIntensity, setDropShadowIntensity] = useState(0)
  const [motionAccent, setMotionAccent] = useState<"fade" | "slide" | "sweep" | "none">("none")
  
  // Alignment & Positioning
  const [layoutMode, setLayoutMode] = useState<"centered" | "left" | "right" | "split">("centered")
  const [verticalPosition, setVerticalPosition] = useState(50)
  const [horizontalOffset, setHorizontalOffset] = useState(0)
  const [smartAnchor, setSmartAnchor] = useState(true)
  const [safeZones, setSafeZones] = useState(true)
  
  // Casting & Multiplicity
  const [useAvatars, setUseAvatars] = useState(false)
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("")
  const [avatarRole, setAvatarRole] = useState<"Model" | "User" | "Mascot" | "Spokesperson">("Model")
  const [avatarInteraction, setAvatarInteraction] = useState<"Holding" | "Wearing" | "Using" | "Observing">("Holding")
  const [productMultiplicity, setProductMultiplicity] = useState<"Single" | "Lineup" | "Bundle">("Single")
  const [angleVarietyCount, setAngleVarietyCount] = useState<1 | 2 | 3 | 4 | 5>(1)
  
  // Platform Target
  const [platformTarget, setPlatformTarget] = useState<"Instagram" | "Facebook" | "TikTok" | "YouTube" | "Banner" | "Print" | undefined>(undefined)
  
  // Brand Colors
  const [brandColors, setBrandColors] = useState({
    primary: "#3B82F6",
    secondary: "#10B981",
    accent: "#F59E0B"
  })
  
  // Available Avatars (from existing AvatarPersonaGeneratorInterface)
  const [availableAvatars, setAvailableAvatars] = useState<AvailableAvatar[]>([])
  const [loadingAvatars, setLoadingAvatars] = useState(false)
  
  // Basic Avatar Options
  const [useBasicAvatar, setUseBasicAvatar] = useState(false)
  const [basicAvatarAge, setBasicAvatarAge] = useState<"18-25" | "26-35" | "36-45" | "46-55" | "55+">("26-35")
  const [basicAvatarRace, setBasicAvatarRace] = useState<"Caucasian" | "African" | "Asian" | "Hispanic" | "Middle Eastern" | "Mixed" | "Other">("Caucasian")
  const [basicAvatarGender, setBasicAvatarGender] = useState<"Male" | "Female" | "Non-binary">("Female")
  const [basicAvatarDescription, setBasicAvatarDescription] = useState("")
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [generationResult, setGenerationResult] = useState<ProductMockupGenerationResult | null>(null)
  
  // UI State
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    productPhotos: true,
    artDirection: true,
    composition: false,
    textOverlay: false,
    casting: false,
    platform: false
  })

  // Load available avatars on mount
  useEffect(() => {
    loadAvailableAvatars()
  }, [])

  // Update visual influence options when art direction changes
  useEffect(() => {
    if (artDirection && STYLE_MAP[artDirection]) {
      const influences = STYLE_MAP[artDirection]
      if (influences.length > 0) {
        setVisualInfluence(influences[0].label)
        setLightingPreset(influences[0].lightingPresets[0]?.name || "")
        setBackgroundEnvironment(influences[0].backgroundEnvironments[0]?.name || "")
        setMoodContext(influences[0].moodContexts[0]?.name || "")
      }
    }
  }, [artDirection])

  // Update lighting/background options when visual influence changes
  useEffect(() => {
    if (artDirection && visualInfluence && STYLE_MAP[artDirection]) {
      const influence = STYLE_MAP[artDirection].find(inf => inf.label === visualInfluence)
      if (influence) {
        if (influence.lightingPresets.length > 0 && !influence.lightingPresets.find(lp => lp.name === lightingPreset)) {
          setLightingPreset(influence.lightingPresets[0].name)
        }
        if (influence.backgroundEnvironments.length > 0 && !influence.backgroundEnvironments.find(be => be.name === backgroundEnvironment)) {
          setBackgroundEnvironment(influence.backgroundEnvironments[0].name)
        }
        if (influence.moodContexts.length > 0 && !influence.moodContexts.find(mc => mc.name === moodContext)) {
          setMoodContext(influence.moodContexts[0].name)
        }
      }
    }
  }, [visualInfluence, artDirection])

  const loadAvailableAvatars = async () => {
    setLoadingAvatars(true)
    try {
      // Fetch avatars from the avatars API
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Limit to 4 images max
    const newFiles = [...productPhotos, ...files].slice(0, 4)
    setProductPhotos(newFiles)

    // Create previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file))
    setProductPhotoPreviews(newPreviews)
  }

  const removeProductPhoto = (index: number) => {
    const newFiles = productPhotos.filter((_, i) => i !== index)
    const newPreviews = productPhotoPreviews.filter((_, i) => i !== index)
    setProductPhotos(newFiles)
    setProductPhotoPreviews(newPreviews)
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const preview = URL.createObjectURL(file)
      setLogoPreview(preview)
    }
  }

  const removeLogo = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
    }
    setLogoFile(null)
    setLogoPreview(null)
    setLogoUsagePrompt("")
  }

  const toggleTextEffect = (effect: string) => {
    setTextEffects(prev => 
      prev.includes(effect) 
        ? prev.filter(e => e !== effect)
        : [...prev, effect]
    )
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for your product mockup.",
        variant: "destructive"
      })
      return
    }

    if (productPhotos.length === 0) {
      toast({
        title: "Product Photos Required",
        description: "Please upload at least one product photo.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      // Convert File objects to base64 strings
      const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            // Remove the data:image/...;base64, prefix
            const base64 = result.split(',')[1]
            resolve(base64)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }

      const productPhotosBase64 = await Promise.all(
        productPhotos.map(convertFileToBase64)
      )

      const logoFileBase64 = logoFile ? await convertFileToBase64(logoFile) : undefined

      const generationData: ProductMockupGenerationRequest = {
        prompt: prompt.trim(),
        imageCount,
        aspectRatio,
        productPhotos: productPhotosBase64,
        logoFile: logoFileBase64,
        logoUsagePrompt: logoUsagePrompt.trim() || undefined,
        artDirection,
        visualInfluence,
        lightingPreset,
        backgroundEnvironment,
        moodContext,
        compositionTemplate,
        objectCount,
        shadowType,
        logoPlacement,
        headline: headline.trim() || undefined,
        subtext: subtext.trim() || undefined,
        ctaText: ctaText.trim() || undefined,
        fontFamily,
        fontWeight,
        textCase,
        letterSpacing,
        lineHeight,
        textColor,
        textAlignment,
        textEffects,
        highlightStyle,
        accentElement,
        brilliance,
        frostedGlass,
        dropShadowIntensity,
        motionAccent,
        layoutMode,
        verticalPosition,
        horizontalOffset,
        smartAnchor,
        safeZones,
        useAvatars,
        selectedAvatarId: useBasicAvatar ? "basic" : (selectedAvatarId || undefined),
        useBasicAvatar,
        basicAvatar: useBasicAvatar ? {
          age: basicAvatarAge,
          race: basicAvatarRace,
          gender: basicAvatarGender,
          description: basicAvatarDescription
        } : undefined,
        avatarRole,
        avatarInteraction,
        productMultiplicity,
        angleVarietyCount,
        platformTarget,
        brandColors,
        metadata: {
          projectTitle,
          selectedArtifact,
          timestamp: new Date().toISOString()
        }
      }

      console.log("Generating product mockup with:", generationData)

      // Call the API
      const response = await fetch('/api/product-mockup-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate product mockup')
      }

      const result: ProductMockupGenerationResult = await response.json()
      console.log("Product mockup generation result:", result)
      
      if (result.success) {
        setGeneratedImages(result.images)
        setGenerationResult(result)
        
        toast({
          title: "Product Mockup Generated!",
          description: `Successfully generated ${result.images.length} mockup variations.`,
        })
      } else {
        throw new Error(result.error || 'Generation failed')
      }
      
    } catch (error) {
      console.error('Generation failed:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate product mockup. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getCurrentVisualInfluence = () => {
    if (!artDirection || !visualInfluence) return null
    return STYLE_MAP[artDirection]?.find(inf => inf.label === visualInfluence)
  }

  const currentInfluence = getCurrentVisualInfluence()

  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Product Mockup Generator
          </h3>
          <p className="text-xs text-muted-foreground">
            {projectTitle}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Product Photos Upload */}
      <Collapsible 
        open={expandedSections.productPhotos} 
        onOpenChange={() => toggleSection('productPhotos')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">Product Photos</span>
              <span className="text-xs text-muted-foreground">({productPhotos.length}/4)</span>
            </div>
            {expandedSections.productPhotos ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {productPhotoPreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img 
                  src={preview} 
                  alt={`Product ${index + 1}`}
                  className="w-full h-20 object-cover rounded-md"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeProductPhoto(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {productPhotos.length < 4 && (
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-md h-20 flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center">
                  <Plus className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add Photo</span>
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </CollapsibleContent>
      </Collapsible>

      {/* User Prompt */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Description</label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your product mockup vision..."
          className="min-h-[80px] text-sm resize-none"
        />
      </div>

      {/* Logo Upload */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Logo Upload (Optional)</span>
        </div>
        
        <div className="space-y-3">
          {!logoFile ? (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm">
                  <span className="font-medium text-foreground">Upload Logo (Optional)</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload your brand logo for placement in mockups (max 1 image, PNG/JPG recommended)
                  </p>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="text-xs"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Choose Logo (Optional)
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  className="w-12 h-12 object-contain rounded border"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{logoFile.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(logoFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeLogo}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">
                  How should the logo be used in the mockup? (Optional)
                </label>
                <Textarea
                  value={logoUsagePrompt}
                  onChange={(e) => setLogoUsagePrompt(e.target.value)}
                  placeholder="Describe how you want the logo to appear (e.g., 'Place logo in top-right corner with subtle transparency', 'Watermark style in bottom-left', 'Prominent placement on product packaging')"
                  className="min-h-[60px] text-xs resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Art Direction & Visual Influence */}
      <Collapsible 
        open={expandedSections.artDirection} 
        onOpenChange={() => toggleSection('artDirection')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="text-sm font-medium">Art Direction</span>
            </div>
            {expandedSections.artDirection ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          {/* Art Direction */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Art Direction</label>
            <Select value={artDirection} onValueChange={(value) => {
              console.log('Art Direction selected:', value)
              setArtDirection(value)
            }}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Select Art Direction" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {Object.keys(STYLE_MAP).map((direction) => (
                  <SelectItem key={direction} value={direction} className="text-xs">
                    {direction}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Visual Influence */}
          {artDirection && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Visual Influence</label>
              <Select value={visualInfluence} onValueChange={setVisualInfluence}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select Visual Influence" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {STYLE_MAP[artDirection]?.map((influence) => (
                    <SelectItem key={influence.label} value={influence.label} className="text-xs">
                      <div>
                        <div className="font-medium">{influence.label}</div>
                        <div className="text-muted-foreground text-xs">{influence.desc}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Lighting Preset */}
          {currentInfluence && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Lighting</label>
              <Select value={lightingPreset} onValueChange={setLightingPreset}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select Lighting" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {currentInfluence.lightingPresets.map((preset) => (
                    <SelectItem key={preset.name} value={preset.name} className="text-xs">
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-muted-foreground text-xs">{preset.mood}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Background Environment */}
          {currentInfluence && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Background</label>
              <Select value={backgroundEnvironment} onValueChange={setBackgroundEnvironment}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select Background" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {currentInfluence.backgroundEnvironments.map((env) => (
                    <SelectItem key={env.name} value={env.name} className="text-xs">
                      <div>
                        <div className="font-medium">{env.name}</div>
                        <div className="text-muted-foreground text-xs">{env.mood}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Mood Context */}
          {currentInfluence && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Mood</label>
              <Select value={moodContext} onValueChange={setMoodContext}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select Mood" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {currentInfluence.moodContexts.map((mood) => (
                    <SelectItem key={mood.name} value={mood.name} className="text-xs">
                      <div>
                        <div className="font-medium">{mood.name}</div>
                        {mood.desc && <div className="text-muted-foreground text-xs">{mood.desc}</div>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Composition & Branding */}
      <Collapsible 
        open={expandedSections.composition} 
        onOpenChange={() => toggleSection('composition')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <span className="text-sm font-medium">Composition & Branding</span>
            </div>
            {expandedSections.composition ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          {/* Aspect Ratio & Image Count */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Aspect Ratio</label>
              <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value as any)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select Aspect Ratio" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {["1:1", "4:5", "16:9", "9:16", "2:1", "3:4", "2:3", "4:3", "3:2"].map((ratio) => (
                    <SelectItem key={ratio} value={ratio} className="text-xs">
                      <div className="flex items-center gap-2">
                        <AspectRatioIcon ratio={ratio} />
                        {ratio}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Images ({imageCount})</label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setImageCount(Math.max(1, imageCount - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xs font-medium min-w-[20px] text-center">{imageCount}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setImageCount(Math.min(4, imageCount + 1))}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Composition Template */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Composition</label>
            <Select value={compositionTemplate} onValueChange={(value) => setCompositionTemplate(value as any)}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Select Composition" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {["Centered Hero", "Rule of Thirds", "Floating Object", "Flat Lay", "Collage"].map((template) => (
                  <SelectItem key={template} value={template} className="text-xs">
                    {template}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Object Count & Shadow */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Objects</label>
              <Select value={objectCount.toString()} onValueChange={(value) => setObjectCount(parseInt(value) as any)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select Count" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3].map((count) => (
                    <SelectItem key={count} value={count.toString()} className="text-xs">
                      {count}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Shadow</label>
              <Select value={shadowType} onValueChange={(value) => setShadowType(value as any)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select Shadow" />
                </SelectTrigger>
                <SelectContent>
                  {["Soft", "Hard", "Floating", "Mirror"].map((shadow) => (
                    <SelectItem key={shadow} value={shadow} className="text-xs">
                      {shadow}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Text & CTA Overlay */}
      <Collapsible 
        open={expandedSections.textOverlay} 
        onOpenChange={() => toggleSection('textOverlay')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span className="text-sm font-medium">Text & CTA</span>
            </div>
            {expandedSections.textOverlay ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          {/* Text Inputs */}
          <div className="space-y-2">
            <Input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Headline (optional)"
              className="text-xs h-8"
            />
            <Input
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              placeholder="Subtext (optional)"
              className="text-xs h-8"
            />
            <Input
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="CTA Text (optional)"
              className="text-xs h-8"
            />
          </div>

          {/* Typography Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Font</label>
              <Select value={fontFamily} onValueChange={(value) => setFontFamily(value as any)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select Font" />
                </SelectTrigger>
                <SelectContent>
                  {["serif", "sans", "condensed", "rounded"].map((font) => (
                    <SelectItem key={font} value={font} className="text-xs">
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Weight</label>
              <Select value={fontWeight} onValueChange={(value) => setFontWeight(value as any)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select Weight" />
                </SelectTrigger>
                <SelectContent>
                  {["light", "normal", "medium", "bold"].map((weight) => (
                    <SelectItem key={weight} value={weight} className="text-xs">
                      {weight}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Text Effects */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Text Effects</label>
            <div className="flex flex-wrap gap-2">
              {["brilliance", "frosted_glass", "drop_shadow"].map((effect) => (
                <Button
                  key={effect}
                  variant={textEffects.includes(effect) ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => toggleTextEffect(effect)}
                >
                  {effect.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Typography */}
          <div className="space-y-3 p-3 bg-muted/20 rounded-lg border">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">Advanced Typography</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Text Case</label>
                <div className="flex gap-1">
                  {["sentence", "title", "uppercase"].map((caseType) => (
                    <Button
                      key={caseType}
                      variant={textCase === caseType ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTextCase(caseType as any)}
                      className="text-xs h-7 flex-1"
                    >
                      {caseType}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Highlight Style</label>
                <Select value={highlightStyle} onValueChange={(value) => setHighlightStyle(value as any)}>
                  <SelectTrigger className="w-full h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["none", "underline", "boxed", "glow", "gradient"].map((style) => (
                      <SelectItem key={style} value={style} className="text-xs">
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Letter Spacing ({letterSpacing}px)</label>
                <Slider
                  value={[letterSpacing]}
                  onValueChange={(value) => setLetterSpacing(value[0])}
                  max={5}
                  min={-2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Line Height ({lineHeight})</label>
                <Slider
                  value={[lineHeight]}
                  onValueChange={(value) => setLineHeight(value[0])}
                  max={2}
                  min={0.8}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Brilliance ({brilliance}%)</label>
                <Slider
                  value={[brilliance]}
                  onValueChange={(value) => setBrilliance(value[0])}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Drop Shadow ({dropShadowIntensity}%)</label>
                <Slider
                  value={[dropShadowIntensity]}
                  onValueChange={(value) => setDropShadowIntensity(value[0])}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Accent Element</label>
                <Select value={accentElement} onValueChange={(value) => setAccentElement(value as any)}>
                  <SelectTrigger className="w-full h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["none", "line", "shape", "dot"].map((element) => (
                      <SelectItem key={element} value={element} className="text-xs">
                        {element}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Motion Accent</label>
                <Select value={motionAccent} onValueChange={(value) => setMotionAccent(value as any)}>
                  <SelectTrigger className="w-full h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["none", "fade", "slide", "sweep"].map((motion) => (
                      <SelectItem key={motion} value={motion} className="text-xs">
                        {motion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Frosted Glass</label>
              <Switch
                checked={frostedGlass}
                onCheckedChange={setFrostedGlass}
                className="scale-75"
              />
            </div>
          </div>

          {/* Alignment & Positioning */}
          <div className="space-y-3 p-3 bg-muted/20 rounded-lg border">
            <div className="flex items-center gap-2">
              <Layout className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">Alignment & Positioning</span>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Layout Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {["centered", "left", "right", "split"].map((mode) => (
                  <Button
                    key={mode}
                    variant={layoutMode === mode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLayoutMode(mode as any)}
                    className="text-xs h-7"
                  >
                    {mode}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Vertical Position ({verticalPosition}%)</label>
                <Slider
                  value={[verticalPosition]}
                  onValueChange={(value) => setVerticalPosition(value[0])}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Horizontal Offset ({horizontalOffset}px)</label>
                <Slider
                  value={[horizontalOffset]}
                  onValueChange={(value) => setHorizontalOffset(value[0])}
                  max={100}
                  min={-100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Smart Anchor</label>
              <Switch
                checked={smartAnchor}
                onCheckedChange={setSmartAnchor}
                className="scale-75"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Safe Zones</label>
              <Switch
                checked={safeZones}
                onCheckedChange={setSafeZones}
                className="scale-75"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Casting & Multiplicity */}
      <Collapsible 
        open={expandedSections.casting} 
        onOpenChange={() => toggleSection('casting')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Casting & Multiplicity</span>
            </div>
            {expandedSections.casting ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          {/* Use Avatars Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground">Include Avatars</label>
            <Switch
              checked={useAvatars}
              onCheckedChange={setUseAvatars}
              className="scale-75"
            />
          </div>

          {useAvatars && (
            <>
              {/* Avatar Selection */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Select Avatar</label>
                {loadingAvatars ? (
                  <div className="text-xs text-muted-foreground">Loading avatars...</div>
                ) : (
                  <Select 
                    value={useBasicAvatar ? "basic" : (selectedAvatarId || "")} 
                    onValueChange={(value) => {
                      if (value === "basic") {
                        setUseBasicAvatar(true)
                        setSelectedAvatarId("")
                      } else {
                        setUseBasicAvatar(false)
                        setSelectedAvatarId(value)
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Select Avatar" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="basic" className="text-xs">
                        <div className="flex items-center gap-2">
                          <User className="w-6 h-6 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Basic Avatar</div>
                            <div className="text-muted-foreground text-xs">Create a custom basic avatar</div>
                          </div>
                        </div>
                      </SelectItem>
                      {availableAvatars.map((avatar) => (
                        <SelectItem key={avatar.id} value={avatar.id} className="text-xs">
                          <div className="flex items-center gap-2">
                            <img 
                              src={avatar.image} 
                              alt={avatar.title}
                              className="w-6 h-6 object-cover rounded"
                            />
                            <div>
                              <div className="font-medium">{avatar.title}</div>
                              <div className="text-muted-foreground text-xs">{avatar.roleArchetype}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Basic Avatar Customization */}
              {useBasicAvatar && (
                <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Basic Avatar Settings</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">Age</label>
                      <Select value={basicAvatarAge} onValueChange={(value) => setBasicAvatarAge(value as any)}>
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["18-25", "26-35", "36-45", "46-55", "55+"].map((age) => (
                            <SelectItem key={age} value={age} className="text-xs">
                              {age}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">Gender</label>
                      <Select value={basicAvatarGender} onValueChange={(value) => setBasicAvatarGender(value as any)}>
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Male", "Female", "Non-binary"].map((gender) => (
                            <SelectItem key={gender} value={gender} className="text-xs">
                              {gender}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">Ethnicity</label>
                      <Select value={basicAvatarRace} onValueChange={(value) => setBasicAvatarRace(value as any)}>
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Caucasian", "African", "Asian", "Hispanic", "Middle Eastern", "Mixed", "Other"].map((race) => (
                            <SelectItem key={race} value={race} className="text-xs">
                              {race}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Appearance & Style Description</label>
                    <Textarea
                      value={basicAvatarDescription}
                      onChange={(e) => setBasicAvatarDescription(e.target.value)}
                      placeholder="Describe how the avatar should look, dress, and style (e.g., 'Professional business attire, confident smile, modern hairstyle')"
                      className="min-h-[60px] text-xs resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Avatar Role & Interaction */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Role</label>
                  <Select value={avatarRole} onValueChange={(value) => setAvatarRole(value as any)}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Model", "User", "Mascot", "Spokesperson"].map((role) => (
                        <SelectItem key={role} value={role} className="text-xs">
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Interaction</label>
                  <Select value={avatarInteraction} onValueChange={(value) => setAvatarInteraction(value as any)}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Select Interaction" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Holding", "Wearing", "Using", "Observing"].map((interaction) => (
                        <SelectItem key={interaction} value={interaction} className="text-xs">
                          {interaction}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {/* Product Multiplicity & Angle Variety */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Product Count</label>
              <Select value={productMultiplicity} onValueChange={(value) => setProductMultiplicity(value as any)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select Count" />
                </SelectTrigger>
                <SelectContent>
                  {["Single", "Lineup", "Bundle"].map((multiplicity) => (
                    <SelectItem key={multiplicity} value={multiplicity} className="text-xs">
                      {multiplicity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Angles ({angleVarietyCount})</label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setAngleVarietyCount(Math.max(1, angleVarietyCount - 1) as any)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xs font-medium min-w-[20px] text-center">{angleVarietyCount}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setAngleVarietyCount(Math.min(5, angleVarietyCount + 1) as any)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Platform Target */}
      <Collapsible 
        open={expandedSections.platform} 
        onOpenChange={() => toggleSection('platform')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span className="text-sm font-medium">Platform Target</span>
            </div>
            {expandedSections.platform ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Platform (Optional)</label>
            <Select value={platformTarget || "Auto"} onValueChange={(value) => setPlatformTarget(value === "Auto" ? undefined : value as any)}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Select Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Auto" className="text-xs">
                  Auto
                </SelectItem>
                {["Instagram", "Facebook", "TikTok", "YouTube", "Banner", "Print"].map((platform) => (
                  <SelectItem key={platform} value={platform} className="text-xs">
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">Generated Mockups</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => setGeneratedImages([])}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {generatedImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img 
                  src={imageUrl} 
                  alt={`Generated mockup ${index + 1}`}
                  className="w-full h-32 object-cover rounded-md"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
                  <Button variant="secondary" size="sm" className="text-xs h-6">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button variant="secondary" size="sm" className="text-xs h-6">
                    <Download className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <Button 
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm font-medium" 
        disabled={!prompt.trim() || productPhotos.length === 0 || isGenerating}
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
            Generate Product Mockups
          </>
        )}
      </Button>
    </div>
  )
}
