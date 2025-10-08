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
  
  // Visuals - Image Upload or Avatar Selection
  const [useCustomImage, setUseCustomImage] = useState(false)
  const [customImage, setCustomImage] = useState<File | null>(null)
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null)
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("")
  
  // Audio Settings
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Technical Specifications
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "1:1" | "9:16" | "4:3" | "3:4">("16:9")
  const [resolution, setResolution] = useState<"720p">("720p") // Fixed to 720p
  const [fps, setFps] = useState<25>(25) // Fixed to 25fps
  const [maxDuration, setMaxDuration] = useState<number>(60) // Configurable 1-60 seconds
  
  // Advanced Settings
  const [lipSyncQuality, setLipSyncQuality] = useState<"standard" | "premium" | "ultra">("premium")
  const [facialExpressions, setFacialExpressions] = useState<boolean>(true)
  const [gestures, setGestures] = useState<boolean>(true)
  const [eyeContact, setEyeContact] = useState<boolean>(true)
  const [headMovement, setHeadMovement] = useState<boolean>(true)
  
  // Available Avatars
  const [availableAvatars, setAvailableAvatars] = useState<AvailableAvatar[]>([])
  const [loadingAvatars, setLoadingAvatars] = useState(false)
  
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

  // Load available avatars on mount
  useEffect(() => {
    loadAvailableAvatars()
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
    // Validation
    if (!audioFile) {
      toast({
        title: "Audio Required",
        description: "Please upload an audio file.",
        variant: "destructive"
      })
      return
    }

    if (!useCustomImage && !selectedAvatarId) {
      toast({
        title: "Visual Required",
        description: "Please upload an image or select an existing avatar.",
        variant: "destructive"
      })
      return
    }

    if (audioDuration > maxDuration) {
      toast({
        title: "Audio too long",
        description: `Audio file must be under ${maxDuration} seconds.`,
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      // Convert files to base64
      const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            const base64 = result.split(',')[1]
            resolve(base64)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }

      const audioBase64 = await convertFileToBase64(audioFile)
      const imageBase64 = customImage ? await convertFileToBase64(customImage) : undefined

      const generationData = {
        prompt: "Generate talking avatar video",
        script: "Generated from audio file",
        audioFile: audioBase64,
        audioFileName: audioFile.name,
        audioDuration: audioDuration,
        customImage: imageBase64,
        selectedAvatarId: selectedAvatarId || undefined,
        aspectRatio,
        resolution,
        fps,
        maxDuration,
        lipSyncQuality,
        facialExpressions,
        gestures,
        eyeContact,
        headMovement,
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
    <div className="bg-background border border-border rounded-lg p-4 space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Talking Avatar Generator
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
      <Collapsible 
        open={expandedSections.visuals} 
        onOpenChange={() => toggleSection('visuals')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Visuals</span>
            </div>
            {expandedSections.visuals ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          {/* Image Source Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Image Source</label>
            <div className="flex gap-2">
              <Button
                variant={!useCustomImage ? "default" : "outline"}
                size="sm"
                onClick={() => setUseCustomImage(false)}
                className="text-xs h-7 flex-1"
              >
                <User className="h-3 w-3 mr-1" />
                Use Existing Avatar
              </Button>
              <Button
                variant={useCustomImage ? "default" : "outline"}
                size="sm"
                onClick={() => setUseCustomImage(true)}
                className="text-xs h-7 flex-1"
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload Image
              </Button>
            </div>
          </div>

          {/* Custom Image Upload */}
          {useCustomImage && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Upload Image <span className="text-red-500">*</span></label>
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
                <div className="space-y-2">
                  <div className="relative">
                    <img 
                      src={customImagePreview} 
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
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Select Avatar <span className="text-red-500">*</span></label>
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
                        <div className="flex items-center gap-2">
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

      {/* Audio Section */}
      <Collapsible 
        open={expandedSections.audio} 
        onOpenChange={() => toggleSection('audio')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span className="text-sm font-medium">Audio</span>
            </div>
            {expandedSections.audio ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Upload Audio <span className="text-red-500">*</span></label>
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
              <div className="space-y-3">
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
                  <div className="flex gap-2">
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
        </CollapsibleContent>
      </Collapsible>

      {/* Technical Specifications */}
      <Collapsible 
        open={expandedSections.techSpecs} 
        onOpenChange={() => toggleSection('techSpecs')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Technical Specifications</span>
            </div>
            {expandedSections.techSpecs ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Aspect Ratio</label>
              <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value as any)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["16:9", "1:1", "9:16", "4:3", "3:4"].map((ratio) => (
                    <SelectItem key={ratio} value={ratio} className="text-xs">
                      {ratio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Resolution</label>
              <div className="p-2 bg-muted/30 rounded text-xs text-muted-foreground">
                720p (Fixed)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Frame Rate</label>
              <div className="p-2 bg-muted/30 rounded text-xs text-muted-foreground">
                25 FPS (Fixed)
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Max Duration (seconds)</label>
              <div className="space-y-2">
                <Slider
                  value={[maxDuration]}
                  onValueChange={(value) => setMaxDuration(value[0])}
                  min={1}
                  max={60}
                  step={1}
                  className="w-full"
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

      {/* Advanced Settings */}
      <Collapsible 
        open={expandedSections.advanced} 
        onOpenChange={() => toggleSection('advanced')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Advanced Settings</span>
            </div>
            {expandedSections.advanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Lip Sync Quality</label>
            <Select value={lipSyncQuality} onValueChange={(value) => setLipSyncQuality(value as any)}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: "standard", label: "Standard" },
                  { value: "premium", label: "Premium" },
                  { value: "ultra", label: "Ultra" }
                ].map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Facial Expressions</label>
              <Switch
                checked={facialExpressions}
                onCheckedChange={setFacialExpressions}
                className="scale-75"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Gestures</label>
              <Switch
                checked={gestures}
                onCheckedChange={setGestures}
                className="scale-75"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Eye Contact</label>
              <Switch
                checked={eyeContact}
                onCheckedChange={setEyeContact}
                className="scale-75"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Head Movement</label>
              <Switch
                checked={headMovement}
                onCheckedChange={setHeadMovement}
                className="scale-75"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Generated Video */}
      {generatedVideo && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">Generated Video</h4>
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
        disabled={!audioFile || (!useCustomImage && !selectedAvatarId) || audioDuration > maxDuration || isGenerating}
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
  )
}
