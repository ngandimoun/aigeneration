"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { 
  X, 
  Upload, 
  Video, 
  FileText, 
  Settings, 
  Palette, 
  Type, 
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Eye,
  Download,
  Save,
  Sparkles,
  Wand2,
  ImageIcon,
  Link,
  AlertCircle,
  CheckCircle,
  Play,
  Database
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { 
  AutocaptionModelInputs, 
  DEFAULT_AUTOCAPTION_INPUTS, 
  EMOJI_STRATEGIES, 
  KEYWORD_STYLES, 
  PRESETS 
} from "@/lib/types/subtitles"

interface SubtitleFormProps {
  onSubmit: (data: AutocaptionModelInputs) => void
  onCancel: () => void
  isLoading?: boolean
  isOpen?: boolean
}

export function SubtitleForm({ onSubmit, onCancel, isLoading = false, isOpen = true }: SubtitleFormProps) {
  const [formData, setFormData] = useState<AutocaptionModelInputs>(DEFAULT_AUTOCAPTION_INPUTS)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [videoSource, setVideoSource] = useState<'upload' | 'supabase'>('upload')
  const [selectedVideo, setSelectedVideo] = useState<{id: string, title: string, image: string, video_url: string} | null>(null)
  const [availableVideos, setAvailableVideos] = useState<Array<{id: string, title: string, image: string, video_url: string}>>([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [emojiMapEntries, setEmojiMapEntries] = useState<Array<{ key: string; value: string }>>([
    { key: "fire", value: "🔥" },
    { key: "wow", value: "🤯" },
    { key: "money", value: "💰" }
  ])
  const [keywordsInput, setKeywordsInput] = useState("")
  const [selectedPreset, setSelectedPreset] = useState<string>("")
  const [customFont, setCustomFont] = useState("")
  
  const videoInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Load videos from Library API
  useEffect(() => {
    const loadVideosFromLibrary = async () => {
      setLoadingVideos(true)
      try {
        const response = await fetch('/api/library?category=motions')
        if (response.ok) {
          const data = await response.json()
          console.log('📊 Library API response:', data)
          
          const libraryItems = data.libraryItems || []
          const videos = libraryItems.map((item: any) => ({
            id: `${item.content_type}_${item.content_id}`,
            title: item.title || `Video from ${item.content_type}`,
            image: item.image || '/placeholder.jpg',
            video_url: item.video_url || ''
          })).filter((video: any) => video.video_url && video.video_url.trim() !== '')
          
          console.log(`🎬 Total videos loaded from library: ${videos.length}`)
          setAvailableVideos(videos)
        } else {
          console.error('❌ Failed to fetch library:', response.status, response.statusText)
          toast({
            title: "Error loading videos",
            description: "Failed to load videos from your library. Please try again.",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('❌ Error loading videos from library:', error)
        toast({
          title: "Error loading videos",
          description: "Failed to load videos from your library. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoadingVideos(false)
      }
    }

    if (videoSource === 'supabase') {
      loadVideosFromLibrary()
    }
  }, [videoSource])

  const handleInputChange = (field: keyof AutocaptionModelInputs, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleVideoSourceChange = (source: 'upload' | 'supabase') => {
    setVideoSource(source)
    if (source === 'upload') {
      setSelectedVideo(null)
      setVideoPreview(null)
      handleInputChange("video_file_input", "")
    } else {
      setVideoPreview(null)
      handleInputChange("video_file_input", "")
    }
  }

  const handleVideoSelect = (video: {id: string, title: string, image: string, video_url: string}) => {
    setSelectedVideo(video)
    setVideoPreview(video.video_url)
    handleInputChange("video_file_input", video.video_url)
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setVideoPreview(url)
      handleInputChange("video_file_input", file)
      
      // Auto-detect video orientation and adjust defaults
      const video = document.createElement('video')
      video.src = url
      video.onloadedmetadata = () => {
        const isPortrait = video.videoHeight > video.videoWidth
        if (isPortrait) {
          handleInputChange("fontsize", 4)
          handleInputChange("MaxChars", 10)
          handleInputChange("subs_position", "bottom50")
        }
      }
    }
  }


  const handlePresetSelect = (presetName: string) => {
    const preset = PRESETS.find(p => p.name === presetName)
    if (preset) {
      Object.entries(preset.config).forEach(([key, value]) => {
        handleInputChange(key as keyof AutocaptionModelInputs, value)
      })
      setSelectedPreset(presetName)
      toast({
        title: "Preset Applied",
        description: `${presetName} settings have been applied.`,
      })
    }
  }

  const addEmojiMapEntry = () => {
    setEmojiMapEntries(prev => [...prev, { key: "", value: "" }])
  }

  const updateEmojiMapEntry = (index: number, field: 'key' | 'value', value: string) => {
    setEmojiMapEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    ))
  }

  const removeEmojiMapEntry = (index: number) => {
    setEmojiMapEntries(prev => prev.filter((_, i) => i !== index))
  }

  const handleKeywordsChange = (value: string) => {
    setKeywordsInput(value)
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0)
    handleInputChange("keywords", keywords)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Update emoji map from entries
    const emojiMap: Record<string, string> = {}
    emojiMapEntries.forEach(entry => {
      if (entry.key && entry.value) {
        emojiMap[entry.key] = entry.value
      }
    })
    handleInputChange("emoji_map", emojiMap)

    // Use custom font value if "custom" is selected
    if (formData.font === 'custom' && customFont) {
      handleInputChange("font", customFont)
    }

    if (!formData.video_file_input) {
      toast({
        title: "Video Required",
        description: "Please upload a video file or provide a URL.",
        variant: "destructive"
      })
      return
    }

    onSubmit(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="w-[95vw] max-w-none sm:w-[90vw] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl h-[95vh] max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-bold">Add Subtitles</DialogTitle>
          <DialogDescription className="text-sm">
            Upload a video and customize your captions
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex-1 overflow-y-auto scrollbar-hover">

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Step 1: Upload */}
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Upload className="h-4 w-4" />
              Step 1: Upload
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Upload your video and optionally provide a transcript
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {/* Video Source */}
            <div className="space-y-3 max-w-2xl">
              <Label className="text-sm font-medium">🎬 Video Source *</Label>
              
              {/* Source Selection */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={videoSource === 'upload' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVideoSourceChange('upload')}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={videoSource === 'supabase' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVideoSourceChange('supabase')}
                  className="flex-1"
                >
                  <Database className="h-4 w-4 mr-2" />
                  From Library
                </Button>
              </div>

              {/* Upload Section */}
              {videoSource === 'upload' && (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-3 sm:p-4 text-center hover:border-muted-foreground/50 transition-colors">
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    {videoPreview ? (
                      <div className="space-y-2">
                        <video 
                          src={videoPreview} 
                          className="w-full h-20 sm:h-24 object-cover rounded-md mx-auto"
                          controls
                        />
                        <p className="text-xs text-muted-foreground">Click to change video</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Video className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground mx-auto" />
                        <p className="text-xs sm:text-sm text-muted-foreground">Click to upload video</p>
                      </div>
                    )}
                  </label>
                </div>
              )}

              {/* Supabase Videos Section */}
              {videoSource === 'supabase' && (
                <div className="space-y-3">
                  {loadingVideos ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-sm">Loading videos from your library...</p>
                    </div>
                  ) : availableVideos.length > 0 ? (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        {availableVideos.length} video{availableVideos.length > 1 ? 's' : ''} available from Motions category
                      </Label>
                      <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-2">
                        {availableVideos.map((video) => (
                          <div
                            key={video.id}
                            className={`group border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                              selectedVideo?.id === video.id 
                                ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200' 
                                : 'border-muted-foreground/25 hover:border-blue-300 hover:shadow-sm'
                            }`}
                            onClick={() => handleVideoSelect(video)}
                          >
                            <div className="flex gap-3 p-3">
                              {/* Video Thumbnail */}
                              <div className="flex-shrink-0 relative">
                                {video.video_url ? (
                                  <div className="relative w-24 h-16 bg-black rounded overflow-hidden">
                                    <video 
                                      src={video.video_url}
                                      className="w-full h-full object-cover"
                                      muted
                                      playsInline
                                      onMouseEnter={(e) => e.currentTarget.play()}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.pause()
                                        e.currentTarget.currentTime = 0
                                      }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                      <Play className="h-6 w-6 text-white opacity-80" />
                                    </div>
                                  </div>
                                ) : (
                                  <img 
                                    src={video.image} 
                                    alt={video.title}
                                    className="w-24 h-16 object-cover rounded"
                                  />
                                )}
                                {selectedVideo?.id === video.id && (
                                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                                    <CheckCircle className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Video Info */}
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <p className="text-sm font-semibold text-foreground truncate mb-0.5">
                                  {video.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Video className="h-3 w-3" />
                                  <span>Motion video</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Database className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">No videos found in your library</p>
                      <p className="text-xs mt-1">Create videos in your Motions library first:</p>
                      <p className="text-xs text-muted-foreground/80">UGC Ads, Talking Avatars, Product Motion, Explainers</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </CardContent>
        </Card>

        {/* Step 2: Core Options */}
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Settings className="h-4 w-4" />
              Step 2: Core Options
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Configure basic subtitle settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {/* Presets */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Presets</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 sm:gap-2">
                {PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    type="button"
                    variant={selectedPreset === preset.name ? "default" : "outline"}
                    size="sm"
                    className="h-7 sm:h-8 text-xs px-2 sm:px-3"
                    onClick={() => handlePresetSelect(preset.name)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Output Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Output Type</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="output-video"
                  checked={formData.output_video}
                  onCheckedChange={(checked) => handleInputChange("output_video", checked)}
                />
                <Label htmlFor="output-video" className="text-sm">Render captioned video</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="output-transcript"
                  checked={formData.output_transcript}
                  onCheckedChange={(checked) => handleInputChange("output_transcript", checked)}
                />
                <Label htmlFor="output-transcript" className="text-sm">Also return transcript JSON</Label>
              </div>
            </div>

            {/* Font & Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="space-y-1 max-w-xs">
                <Label htmlFor="font" className="text-sm">🎨 Font Family</Label>
                <Select value={formData.font} onValueChange={(value) => handleInputChange("font", value)}>
                  <SelectTrigger className="h-8 text-xs sm:text-sm">
                    <SelectValue placeholder="Select a font..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Poppins/Poppins-ExtraBold.ttf">🎯 Poppins ExtraBold</SelectItem>
                    <SelectItem value="Poppins/Poppins-Bold.ttf">💪 Poppins Bold</SelectItem>
                    <SelectItem value="Poppins/Poppins-BoldItalic.ttf">✨ Poppins Bold Italic</SelectItem>
                    <SelectItem value="Poppins/Poppins-ExtraBoldItalic.ttf">🚀 Poppins ExtraBold Italic</SelectItem>
                    <SelectItem value="Poppins/Poppins-Black.ttf">⚡ Poppins Black</SelectItem>
                    <SelectItem value="Poppins/Poppins-BlackItalic.ttf">🔥 Poppins Black Italic</SelectItem>
                    <SelectItem value="Atkinson_Hyperlegible/AtkinsonHyperlegible-Bold.ttf">👁️ Atkinson Hyperlegible Bold</SelectItem>
                    <SelectItem value="Atkinson_Hyperlegible/AtkinsonHyperlegible-BoldItalic.ttf">📖 Atkinson Hyperlegible Bold Italic</SelectItem>
                    <SelectItem value="M_PLUS_Rounded_1c/MPLUSRounded1c-ExtraBold.ttf">🎪 M+ Rounded ExtraBold</SelectItem>
                    <SelectItem value="Arial/Arial_Bold.ttf">📝 Arial Bold</SelectItem>
                    <SelectItem value="Arial/Arial_BoldItalic.ttf">📄 Arial Bold Italic</SelectItem>
                    <SelectItem value="Tajawal/Tajawal-Bold.ttf">🌍 Tajawal Bold</SelectItem>
                    <SelectItem value="Tajawal/Tajawal-ExtraBold.ttf">🌎 Tajawal ExtraBold</SelectItem>
                    <SelectItem value="Tajawal/Tajawal-Black.ttf">🌏 Tajawal Black</SelectItem>
                    <SelectItem value="custom">
                      <div className="flex items-center gap-2">
                        <span>✏️</span>
                        <span>Custom</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {formData.font === 'custom' && (
                  <Input
                    value={customFont}
                    onChange={(e) => setCustomFont(e.target.value)}
                    placeholder="Enter custom font path..."
                    className="h-8 text-xs mt-2"
                  />
                )}
              </div>
              <div className="space-y-1 max-w-xs">
                <Label htmlFor="fontsize" className="text-sm">📏 Font Size</Label>
                <Input
                  id="fontsize"
                  type="number"
                  step="0.1"
                  value={formData.fontsize}
                  onChange={(e) => handleInputChange("fontsize", parseFloat(e.target.value))}
                  className="h-8 text-xs sm:text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  7.0 for landscape, 4.0 for reels
                </p>
              </div>
            </div>

            {/* Position & Characters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="space-y-1 max-w-xs">
                <Label htmlFor="subs-position" className="text-sm">📍 Subtitles Position</Label>
                <Select value={formData.subs_position} onValueChange={(value) => handleInputChange("subs_position", value)}>
                  <SelectTrigger id="subs-position" className="h-8 text-xs sm:text-sm">
                    <SelectValue placeholder="Select position..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom75">⬇️ Bottom 75%</SelectItem>
                    <SelectItem value="center">↔️ Center</SelectItem>
                    <SelectItem value="top">⬆️ Top</SelectItem>
                    <SelectItem value="bottom">🔽 Bottom</SelectItem>
                    <SelectItem value="left">⬅️ Left</SelectItem>
                    <SelectItem value="right">➡️ Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 max-w-xs">
                <Label htmlFor="max-chars" className="text-sm">📝 Max Characters Per Line</Label>
                <Input
                  id="max-chars"
                  type="number"
                  value={formData.MaxChars}
                  onChange={(e) => handleInputChange("MaxChars", parseInt(e.target.value))}
                  className="h-8 text-xs sm:text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Keep lines readable
                </p>
              </div>
            </div>

            {/* Style */}
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm font-medium">🎨 Style</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="space-y-1 max-w-xs">
                  <Label htmlFor="color" className="text-sm">🎨 Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                      placeholder="white"
                      className="h-8 text-xs sm:text-sm flex-1"
                    />
                    <input
                      type="color"
                      value={formData.color === "white" ? "#ffffff" : formData.color}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                      className="w-8 h-8 rounded border flex-shrink-0"
                    />
                  </div>
                </div>
                <div className="space-y-1 max-w-xs">
                  <Label htmlFor="stroke-color" className="text-sm">🖌️ Stroke Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="stroke-color"
                      value={formData.stroke_color}
                      onChange={(e) => handleInputChange("stroke_color", e.target.value)}
                      placeholder="black"
                      className="h-8 text-xs sm:text-sm flex-1"
                    />
                    <input
                      type="color"
                      value={formData.stroke_color === "black" ? "#000000" : formData.stroke_color}
                      onChange={(e) => handleInputChange("stroke_color", e.target.value)}
                      className="w-8 h-8 rounded border flex-shrink-0"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                <div className="space-y-1 max-w-xs">
                  <Label htmlFor="stroke-width" className="text-sm">📐 Stroke Width</Label>
                  <Input
                    id="stroke-width"
                    type="number"
                    step="0.1"
                    value={formData.stroke_width}
                    onChange={(e) => handleInputChange("stroke_width", parseFloat(e.target.value))}
                    className="h-8 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1 max-w-xs">
                  <Label htmlFor="opacity" className="text-sm">👻 Background Opacity</Label>
                  <div className="space-y-1">
                    <Slider
                      value={[formData.opacity]}
                      onValueChange={([value]) => handleInputChange("opacity", value)}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      {formData.opacity}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 sm:col-span-2 lg:col-span-1 max-w-xs">
                  <Label htmlFor="kerning" className="text-sm">📏 Character Spacing</Label>
                  <Input
                    id="kerning"
                    type="number"
                    step="0.1"
                    value={formData.kerning}
                    onChange={(e) => handleInputChange("kerning", parseFloat(e.target.value))}
                    className="h-8 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Language & Direction */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="right-to-left"
                  checked={formData.right_to_left}
                  onCheckedChange={(checked) => handleInputChange("right_to_left", checked)}
                />
                <Label htmlFor="right-to-left" className="text-sm">Right-to-left</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="translate"
                  checked={formData.translate}
                  onCheckedChange={(checked) => handleInputChange("translate", checked)}
                />
                <Label htmlFor="translate" className="text-sm">Translate to English</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Only Arial fonts supported when RTL is on
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Advanced Options */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-2 sm:pb-3">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    Step 3: Advanced Options
                  </div>
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Power user settings and AI enhancements
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 sm:space-y-4">
                {/* Highlight Color */}
                <div className="space-y-1 max-w-xs">
                  <Label htmlFor="highlight-color" className="text-sm">✨ Highlight Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="highlight-color"
                      value={formData.highlight_color}
                      onChange={(e) => handleInputChange("highlight_color", e.target.value)}
                      placeholder="yellow"
                      className="h-8"
                    />
                    <input
                      type="color"
                      value={formData.highlight_color === "yellow" ? "#ffff00" : formData.highlight_color}
                      onChange={(e) => handleInputChange("highlight_color", e.target.value)}
                      className="w-8 h-8 rounded border"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used for the model's highlight style
                  </p>
                </div>

                {/* Emoji Enrichment */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emoji-enrichment"
                      checked={formData.emoji_enrichment}
                      onCheckedChange={(checked) => handleInputChange("emoji_enrichment", checked)}
                    />
                    <Label htmlFor="emoji-enrichment" className="text-sm">🎯 Add Emojis to Captions (AI-powered)</Label>
                  </div>
                  
                  {formData.emoji_enrichment && (
                    <div className="space-y-2 pl-4">
                      <div className="space-y-1">
                        <Label className="text-sm">Emoji Strategy</Label>
                        <Select
                          value={formData.emoji_strategy}
                          onValueChange={(value) => handleInputChange("emoji_strategy", value as "AI" | "manualMap")}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EMOJI_STRATEGIES.map((strategy) => (
                              <SelectItem key={strategy.value} value={strategy.value}>
                                {strategy.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.emoji_strategy === "manualMap" && (
                        <div className="space-y-2">
                          <Label className="text-sm">Custom Emoji Map</Label>
                          {emojiMapEntries.map((entry, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                placeholder="keyword"
                                value={entry.key}
                                onChange={(e) => updateEmojiMapEntry(index, 'key', e.target.value)}
                                className="h-8"
                              />
                              <Input
                                placeholder="emoji"
                                value={entry.value}
                                onChange={(e) => updateEmojiMapEntry(index, 'value', e.target.value)}
                                className="h-8"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => removeEmojiMapEntry(index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={addEmojiMapEntry}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Entry
                          </Button>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        Adds relevant emojis next to words. Slightly increases processing time
                      </p>
                    </div>
                  )}
                </div>

                {/* Keyword Emphasis */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="keyword-emphasis"
                      checked={formData.keyword_emphasis}
                      onCheckedChange={(checked) => handleInputChange("keyword_emphasis", checked)}
                    />
                    <Label htmlFor="keyword-emphasis" className="text-sm">💡 Emphasize Important Words</Label>
                  </div>
                  
                  {formData.keyword_emphasis && (
                    <div className="space-y-2 pl-4">
                      <div className="space-y-1">
                        <Label htmlFor="keywords" className="text-sm">Keywords (comma-separated)</Label>
                        <Input
                          id="keywords"
                          value={keywordsInput}
                          onChange={(e) => handleKeywordsChange(e.target.value)}
                          placeholder="AI, powerful, fast"
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Emphasis Style</Label>
                        <Select
                          value={formData.keyword_style}
                          onValueChange={(value) => handleInputChange("keyword_style", value as "CAPS" | "EMOJI_WRAP" | "ASTERISKS")}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {KEYWORD_STYLES.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        </form>
        </div>

        <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 border-t bg-muted/30 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 justify-end w-full">
            <Button type="button" variant="outline" onClick={onCancel} className="h-9 w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.video_file_input} 
              className="h-9 w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={handleSubmit}
            >
              {isLoading ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Captions
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
