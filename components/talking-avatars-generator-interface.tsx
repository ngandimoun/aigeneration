"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { 
  X, 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  User, 
  Mic,
  Play,
  Pause,
  Volume2,
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
  MessageCircle,
  FileAudio,
  FileImage
} from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface TalkingAvatarsGeneratorInterfaceProps {
  onClose: () => void
  projectTitle: string
  selectedArtifact?: {
    id: string
    title: string
    image: string
    description: string
  }
}

interface AvailableAvatar {
  id: string
  title: string
  image: string
  description: string
  roleArchetype?: string
}

export function TalkingAvatarsGeneratorInterface({ 
  onClose, 
  projectTitle, 
  selectedArtifact 
}: TalkingAvatarsGeneratorInterfaceProps) {
  const { toast } = useToast()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  
  // Basic Settings
  const [title, setTitle] = useState("")
  
  // Visuals - Image Upload or Avatar Selection
  const [useCustomImage, setUseCustomImage] = useState(false)
  const [customImage, setCustomImage] = useState<File | null>(null)
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null)
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("")
  
  // Audio Settings
  const [useCustomAudio, setUseCustomAudio] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedVoiceoverId, setSelectedVoiceoverId] = useState<string>("")
  
  // Technical Specifications
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "1:1" | "9:16" | "4:3" | "3:4">("16:9")
  const [resolution, setResolution] = useState<"720p">("720p") // Fixed to 720p
  const [fps, setFps] = useState<25>(25) // Fixed to 25fps
  const [maxDuration, setMaxDuration] = useState<number>(60) // Configurable 1-60 seconds
  
  // Advanced Settings
  const [facialExpressions, setFacialExpressions] = useState<boolean>(true)
  const [gestures, setGestures] = useState<boolean>(true)
  const [eyeContact, setEyeContact] = useState<boolean>(true)
  const [headMovement, setHeadMovement] = useState<boolean>(true)
  
  // Available Avatars
  const [availableAvatars, setAvailableAvatars] = useState<AvailableAvatar[]>([])
  const [loadingAvatars, setLoadingAvatars] = useState(false)
  
  // Available Voiceovers
  const [availableVoiceovers, setAvailableVoiceovers] = useState<any[]>([])
  const [loadingVoiceovers, setLoadingVoiceovers] = useState(false)
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  
  // UI State
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    visuals: true,
    audio: true,
    techSpecs: false,
    advanced: false
  })

  // Load available avatars and voiceovers on mount
  useEffect(() => {
    loadAvailableAvatars()
    loadAvailableVoiceovers()
  }, [])

  // Load audio duration when file is selected
  useEffect(() => {
    if (audioFile) {
      const audio = new Audio()
      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration)
        if (audio.duration > maxDuration) {
          toast({
            title: "Audio too long",
            description: `Audio file must be under ${maxDuration} seconds. Please select a shorter file or adjust the max duration.`,
            variant: "destructive"
          })
        }
      }
      audio.src = URL.createObjectURL(audioFile)
    }
  }, [audioFile, toast, maxDuration])

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

  const loadAvailableVoiceovers = async () => {
    setLoadingVoiceovers(true)
    try {
      // Fetch voiceovers from the voiceovers API
      const response = await fetch('/api/voiceovers')
      if (response.ok) {
        const data = await response.json()
        setAvailableVoiceovers(data.voiceovers || [])
      }
    } catch (error) {
      console.error('Failed to load voiceovers:', error)
    } finally {
      setLoadingVoiceovers(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPG, JPEG, PNG).",
          variant: "destructive"
        })
        return
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image file must be under 10MB.",
          variant: "destructive"
        })
        return
      }
      
      setCustomImage(file)
      const preview = URL.createObjectURL(file)
      setCustomImagePreview(preview)
      setUseCustomImage(true)
    }
  }

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/mpeg']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file (MP3, WAV, M4A, AAC).",
          variant: "destructive"
        })
        return
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Audio file must be under 10MB.",
          variant: "destructive"
        })
        return
      }
      
      setAudioFile(file)
      const preview = URL.createObjectURL(file)
      setAudioPreview(preview)
    }
  }

  const removeCustomImage = () => {
    if (customImagePreview) {
      URL.revokeObjectURL(customImagePreview)
    }
    setCustomImage(null)
    setCustomImagePreview(null)
    setUseCustomImage(false)
  }

  const removeAudio = () => {
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview)
    }
    setAudioFile(null)
    setAudioPreview(null)
    setAudioDuration(0)
  }

  const toggleAudioPlayback = () => {
    if (audioPreview) {
      const audio = new Audio(audioPreview)
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        audio.play()
        setIsPlaying(true)
        audio.onended = () => setIsPlaying(false)
      }
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleGenerate = async () => {
    // Validation for required fields
    if (!useCustomImage && !selectedAvatarId) {
      toast({
        title: "Image Source Required",
        description: "Please select an avatar or upload an image.",
        variant: "destructive"
      })
      return
    }

    if (useCustomImage && !customImage) {
      toast({
        title: "Image Required",
        description: "Please upload an image file.",
        variant: "destructive"
      })
      return
    }

    if (!useCustomAudio && !selectedVoiceoverId) {
      toast({
        title: "Audio Source Required",
        description: "Please select a voiceover or upload an audio file.",
        variant: "destructive"
      })
      return
    }

    if (useCustomAudio && !audioFile) {
      toast({
        title: "Audio Required",
        description: "Please upload an audio file.",
        variant: "destructive"
      })
      return
    }

    // Optional validations with warnings instead of errors
    if (audioFile && audioDuration > maxDuration) {
      toast({
        title: "Audio Too Long",
        description: `Audio file is over ${maxDuration} seconds. It will be trimmed.`,
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      // Prepare data for API
      const generationData = {
        title: title.trim() || "Untitled Talking Avatar",
        use_custom_image: useCustomImage,
        selected_avatar_id: selectedAvatarId || null,
        use_custom_audio: useCustomAudio,
        audio_duration: audioDuration || null,
        selected_voiceover_id: selectedVoiceoverId || null,
        aspect_ratio: aspectRatio,
        resolution: resolution,
        fps: fps,
        max_duration: maxDuration,
        facial_expressions: facialExpressions,
        gestures: gestures,
        eye_contact: eyeContact,
        head_movement: headMovement,
        metadata: {
          projectTitle,
          selectedArtifact,
          timestamp: new Date().toISOString()
        }
      }

      console.log("Generating talking avatar with:", generationData)

      // Call the API
      const response = await fetch('/api/talking-avatars/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate talking avatar')
      }

      const result = await response.json()
      console.log("Talking avatar generation result:", result)
      
      if (result.success) {
        setGeneratedVideo(result.videoUrl)
        
        toast({
          title: "Talking Avatar Generated!",
          description: "Successfully generated your talking avatar video.",
        })
      } else {
        throw new Error(result.error || 'Generation failed')
      }
      
    } catch (error) {
      console.error('Generation failed:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate talking avatar. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedAvatar = availableAvatars.find(avatar => avatar.id === selectedAvatarId)

  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-6 h-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-hover">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎭 Talking Avatar Generator
          </h3>
          <p className="text-xs text-muted-foreground">
            {projectTitle}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <X className="h-3 w-3" />
        </Button>
      </div>


      {/* Visuals Section */}
      <div className="mb-8">
        <Collapsible 
          open={expandedSections.visuals} 
          onOpenChange={() => toggleSection('visuals')}
        >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-3 h-auto">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Visuals</span>
            </div>
            {expandedSections.visuals ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4">
          {/* Title Field */}
          <div className="space-y-4">
            <label className="text-xs font-medium text-amber-600 dark:text-amber-400">🏷️ Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your talking avatar..."
              className="w-full h-8 text-xs bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800 focus:bg-gradient-to-r focus:from-amber-100 focus:to-orange-100 dark:focus:from-amber-900/30 dark:focus:to-orange-900/30 focus:border-amber-300 dark:focus:border-amber-700 transition-all duration-200"
            />
          </div>


          {/* Image Source Selection */}
          <div className="space-y-4">
            <label className="text-xs font-medium text-cyan-600 dark:text-cyan-400">📸 Image Source <span className="text-red-500">*</span></label>
            <div className="flex gap-2 p-1 bg-muted/20 rounded-lg border border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUseCustomImage(false)}
                className={cn(
                  "text-xs h-8 flex-1 transition-all duration-200 font-medium",
                  !useCustomImage 
                    ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <User className="h-3 w-3 mr-2" />
                Existing Avatar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUseCustomImage(true)}
                className={cn(
                  "text-xs h-8 flex-1 transition-all duration-200 font-medium",
                  useCustomImage 
                    ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <Upload className="h-3 w-3 mr-2" />
                Upload Image
              </Button>
            </div>
          </div>

          {/* Custom Image Upload */}
          {useCustomImage && (
            <div className="space-y-4">
              <label className="text-xs font-medium text-green-600 dark:text-green-400">📤 Upload Image</label>
              {!customImage ? (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <div className="flex flex-col items-center gap-2">
                    <FileImage className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm">
                      <span className="font-medium text-foreground">Upload Image</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, JPEG, PNG (max 10MB)
                      </p>
                    </div>
                    <Input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageUpload}
                      className="hidden"
                      ref={imageInputRef}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => imageInputRef.current?.click()}
                      className="text-xs"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Choose Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={customImagePreview || ''} 
                      alt="Custom image preview" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={removeCustomImage}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {customImage.name} ({(customImage.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Existing Avatar Selection */}
          {!useCustomImage && (
            <div className="space-y-4">
              <label className="text-xs font-medium text-purple-600 dark:text-purple-400">👤 Select Avatar</label>
              {loadingAvatars ? (
                <div className="text-xs text-muted-foreground">Loading avatars...</div>
              ) : (
                <Select value={selectedAvatarId} onValueChange={setSelectedAvatarId}>
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Select an avatar..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {availableAvatars.map((avatar) => (
                      <SelectItem key={avatar.id} value={avatar.id} className="text-xs">
                        <div className="flex items-center gap-3">
                          <img 
                            src={avatar.image} 
                            alt={avatar.title}
                            className="w-6 h-6 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium">{avatar.title}</div>
                            {avatar.roleArchetype && (
                              <div className="text-muted-foreground text-xs">{avatar.roleArchetype}</div>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {selectedAvatar && (
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedAvatar.image} 
                      alt={selectedAvatar.title}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-primary text-sm">
                        {selectedAvatar.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedAvatar.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Audio Section */}
      <div className="mb-8">
        <Collapsible 
          open={expandedSections.audio} 
          onOpenChange={() => toggleSection('audio')}
        >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-3 h-auto">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">🎵 Audio</span>
            </div>
            {expandedSections.audio ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4">
          {/* Audio Source Selection */}
          <div className="space-y-4">
            <label className="text-xs font-medium text-orange-600 dark:text-orange-400">🎤 Audio Source <span className="text-red-500">*</span></label>
            <div className="flex gap-2 p-1 bg-muted/20 rounded-lg border border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUseCustomAudio(false)}
                className={cn(
                  "text-xs h-8 flex-1 transition-all duration-200 font-medium",
                  !useCustomAudio 
                    ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <Volume2 className="h-3 w-3 mr-2" />
                Use Voiceover
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUseCustomAudio(true)}
                className={cn(
                  "text-xs h-8 flex-1 transition-all duration-200 font-medium",
                  useCustomAudio 
                    ? "bg-background shadow-sm border border-border/60 text-foreground hover:bg-background/80" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <Upload className="h-3 w-3 mr-2" />
                Upload Audio
              </Button>
            </div>
          </div>

          {/* Voiceover Selection */}
          {!useCustomAudio && (
            <div className="space-y-4">
              <label className="text-xs font-medium text-purple-600 dark:text-purple-400">🎵 Select Voiceover</label>
              {loadingVoiceovers ? (
                <div className="text-xs text-muted-foreground">Loading voiceovers...</div>
              ) : availableVoiceovers.length === 0 ? (
                <div className="p-4 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/30 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Volume2 className="h-6 w-6 text-muted-foreground" />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium">No voiceovers available</p>
                      <p>You haven't generated any voiceovers yet.</p>
                      <p>Use the "Upload Audio" option instead.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Select value={selectedVoiceoverId} onValueChange={setSelectedVoiceoverId}>
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Select a voiceover..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {availableVoiceovers.map((voiceover) => (
                      <SelectItem key={voiceover.id} value={voiceover.id} className="text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                            <Volume2 className="h-3 w-3 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{voiceover.title || voiceover.name || 'Untitled Voiceover'}</div>
                            {voiceover.description && (
                              <div className="text-muted-foreground text-xs">{voiceover.description}</div>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {selectedVoiceoverId && (
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Volume2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-primary text-sm">
                        {availableVoiceovers.find(v => v.id === selectedVoiceoverId)?.title || 'Selected Voiceover'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {availableVoiceovers.find(v => v.id === selectedVoiceoverId)?.description || 'Voiceover from library'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Audio Upload */}
          {useCustomAudio && (
            <div className="space-y-4">
              <label className="text-xs font-medium text-orange-600 dark:text-orange-400">🎤 Upload Audio</label>
            {!audioFile ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <FileAudio className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-medium text-foreground">Upload Audio</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      MP3, WAV, M4A, AAC (max 10MB, up to {maxDuration}s)
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/mpeg"
                    onChange={handleAudioUpload}
                    className="hidden"
                    ref={audioInputRef}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => audioInputRef.current?.click()}
                    className="text-xs"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Choose Audio
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Volume2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{audioFile.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(audioFile.size / 1024 / 1024).toFixed(2)} MB • {audioDuration.toFixed(1)}s
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleAudioPlayback}
                      className="text-xs h-7"
                    >
                      {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeAudio}
                      className="text-muted-foreground hover:text-foreground h-7"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {audioDuration > maxDuration && (
                  <div className="p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700">
                    ⚠️ Audio is {audioDuration.toFixed(1)}s long. Maximum duration is {maxDuration} seconds.
                  </div>
                )}
              </div>
            )}
            </div>
          )}
        </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Technical Specifications */}
      <div className="mb-8">
        <Collapsible 
          open={expandedSections.techSpecs} 
          onOpenChange={() => toggleSection('techSpecs')}
        >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-3 h-auto">
            <div className="flex items-center gap-3">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Technical Specifications</span>
            </div>
            {expandedSections.techSpecs ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <label className="text-xs font-medium text-blue-600 dark:text-blue-400">📐 Aspect Ratio</label>
              <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value as any)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { value: "16:9", label: "📺 16:9 (Widescreen)" },
                    { value: "1:1", label: "⬜ 1:1 (Square)" },
                    { value: "9:16", label: "📱 9:16 (Vertical)" },
                    { value: "4:3", label: "📺 4:3 (Classic)" },
                    { value: "3:4", label: "📱 3:4 (Portrait)" }
                  ].map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-medium text-green-600 dark:text-green-400">🖥️ Resolution</label>
              <div className="p-2 bg-muted/30 rounded text-xs text-muted-foreground">
                720p (Fixed)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <label className="text-xs font-medium text-purple-600 dark:text-purple-400">🎬 Frame Rate</label>
              <div className="p-2 bg-muted/30 rounded text-xs text-muted-foreground">
                25 FPS (Fixed)
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-medium text-orange-600 dark:text-orange-400">⏱️ Max Duration (seconds)</label>
              <div className="space-y-4">
                <Slider
                  value={[maxDuration]}
                  onValueChange={(value) => setMaxDuration(value[0])}
                  min={1}
                  max={60}
                  step={1}
                  className="w-full [&_.slider-track]:bg-gradient-to-r [&_.slider-track]:from-orange-200 [&_.slider-track]:to-orange-400 [&_.slider-thumb]:bg-orange-500 [&_.slider-thumb]:border-orange-600"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1s</span>
                  <span className="font-medium text-foreground">{maxDuration}s</span>
                  <span>60s</span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Advanced Settings */}
      <div className="mb-8">
        <Collapsible 
          open={expandedSections.advanced} 
          onOpenChange={() => toggleSection('advanced')}
        >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-3 h-auto">
            <div className="flex items-center gap-3">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Advanced Settings</span>
            </div>
            {expandedSections.advanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4">

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-yellow-600 dark:text-yellow-400">😊 Facial Expressions</label>
              <Switch
                checked={facialExpressions}
                onCheckedChange={setFacialExpressions}
                className="scale-75"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-teal-600 dark:text-teal-400">👋 Gestures</label>
              <Switch
                checked={gestures}
                onCheckedChange={setGestures}
                className="scale-75"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-blue-600 dark:text-blue-400">👁️ Eye Contact</label>
              <Switch
                checked={eyeContact}
                onCheckedChange={setEyeContact}
                className="scale-75"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-violet-600 dark:text-violet-400">🤔 Head Movement</label>
              <Switch
                checked={headMovement}
                onCheckedChange={setHeadMovement}
                className="scale-75"
              />
            </div>
          </div>
        </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Generated Video */}
      {generatedVideo && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">Generated Video</h4>
            <div className="flex gap-3">
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
          disabled={
            isGenerating || 
            (!useCustomImage && !selectedAvatarId) || 
            (useCustomImage && !customImage) ||
            (!useCustomAudio && !selectedVoiceoverId) ||
            (useCustomAudio && !audioFile)
          }
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
              Generate Talking Avatar
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
