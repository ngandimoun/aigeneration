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
  ChevronUp,
  Plus,
  Minus,
  Check,
  Loader2,
  Eye,
  Download,
  RefreshCw,
  MessageCircle,
  FileAudio,
  FileImage,
  Users,
  Wand2,
  Brain,
  Palette,
  Zap,
  Music,
  Camera,
  MessageSquare,
  MapPin
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"
import { filterFilledFields } from "@/lib/utils/prompt-builder"
import { PreviousGenerations } from "@/components/ui/previous-generations"

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
  name?: string
  description: string
  persona_name?: string
  generated_images?: string[]
  image?: string
  roleArchetype?: string
  role_archetype?: string
}

interface AvailableVoiceover {
  id: string
  title: string
  description?: string
  generated_audio_path?: string
  storage_path?: string
  content?: {
    audio_url?: string
  }
}

type Mode = 'single' | 'describe' | 'multi'

export function TalkingAvatarsGeneratorInterface({ 
  onClose, 
  projectTitle, 
  selectedArtifact 
}: TalkingAvatarsGeneratorInterfaceProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const sceneImageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  
  // Mode selection
  const [mode, setMode] = useState<Mode>('single')
  
  // Basic Settings (shared across modes)
  const [title, setTitle] = useState("")
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "1:1" | "9:16" | "4:3" | "3:4">("16:9")
  
  // Mode 1: Single Character state
  const [useCustomImage, setUseCustomImage] = useState(false)
  const [customImage, setCustomImage] = useState<File | null>(null)
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null)
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("")
  const [useCustomAudio, setUseCustomAudio] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedVoiceoverId, setSelectedVoiceoverId] = useState<string>("")
  const [playingVoiceoverId, setPlayingVoiceoverId] = useState<string | null>(null)
  const [voiceoverAudioRef, setVoiceoverAudioRef] = useState<HTMLAudioElement | null>(null)
  
  // Mode 2: Describe & Create state
  const [mainPrompt, setMainPrompt] = useState("")
  const [characterCount, setCharacterCount] = useState(1)
  const [characters, setCharacters] = useState<Array<{
    id: string
    name: string
    description: string
    artStyle: string
    ageRange: string
    ethnicity: string
    gender: string
    role: string
    bodyType: string
    skinTone: string
    hairStyle: string
    hairColor: string
    eyeColor: string
    eyeShape: string
    outfitCategory: string
    outfitColors: string
    customOutfitColors: string
    accessories: string[]
    customAccessory: string
    expression: string
    voice: string
  }>>([{ 
    id: '1', 
    name: '', 
    description: '',
    artStyle: '',
    ageRange: '',
    ethnicity: '',
    gender: '',
    role: '',
    bodyType: '',
    skinTone: '',
    hairStyle: '',
    hairColor: '',
    eyeColor: '',
    eyeShape: '',
    outfitCategory: '',
    outfitColors: '',
    customOutfitColors: '',
    accessories: [],
    customAccessory: '',
    expression: '', 
    voice: '' 
  }])
  const [dialogLines, setDialogLines] = useState<Array<{
    id: string
    characterId: string
    text: string
    expression: string
  }>>([])
  const [environment, setEnvironment] = useState("")
  const [customEnvironment, setCustomEnvironment] = useState("")
  const [background, setBackground] = useState("")
  const [customBackground, setCustomBackground] = useState("")
  const [lighting, setLighting] = useState("")
  const [customLighting, setCustomLighting] = useState("")
  const [backgroundMusic, setBackgroundMusic] = useState("")
  const [customBackgroundMusic, setCustomBackgroundMusic] = useState("")
  const [soundEffects, setSoundEffects] = useState("")
  const [customSoundEffects, setCustomSoundEffects] = useState("")
  const [describeMaxDuration, setDescribeMaxDuration] = useState<number>(148) // Fixed 1-148 seconds (≈ 2 min 28 s)
  
  // Mode 3: Multi-Character Scene state
  const [useCustomSceneImage, setUseCustomSceneImage] = useState(false)
  const [sceneImage, setSceneImage] = useState<File | null>(null)
  const [sceneImagePreview, setSceneImagePreview] = useState<string | null>(null)
  const [selectedSceneAvatarId, setSelectedSceneAvatarId] = useState<string>("")
  const [sceneDescription, setSceneDescription] = useState("")
  const [sceneCharacterCount, setSceneCharacterCount] = useState(1)
  const [sceneCharacters, setSceneCharacters] = useState<Array<{
    id: string
    name: string
  }>>([])
  const [sceneDialogLines, setSceneDialogLines] = useState<Array<{
    id: string
    characterId: string
    text: string
    expression: string
  }>>([])
  const [sceneEnvironment, setSceneEnvironment] = useState("")
  const [customSceneEnvironment, setCustomSceneEnvironment] = useState("")
  const [sceneBackground, setSceneBackground] = useState("")
  const [customSceneBackground, setCustomSceneBackground] = useState("")
  const [sceneLighting, setSceneLighting] = useState("")
  const [customSceneLighting, setCustomSceneLighting] = useState("")
  const [sceneBackgroundMusic, setSceneBackgroundMusic] = useState("")
  const [customSceneBackgroundMusic, setCustomSceneBackgroundMusic] = useState("")
  const [sceneSoundEffects, setSceneSoundEffects] = useState("")
  const [customSceneSoundEffects, setCustomSceneSoundEffects] = useState("")
  const [multiMaxDuration, setMultiMaxDuration] = useState<number>(148) // Fixed 1-148 seconds (≈ 2 min 28 s)
  
  // Available data
  const [availableAvatars, setAvailableAvatars] = useState<AvailableAvatar[]>([])
  const [loadingAvatars, setLoadingAvatars] = useState(false)
  const [availableVoiceovers, setAvailableVoiceovers] = useState<AvailableVoiceover[]>([])
  const [loadingVoiceovers, setLoadingVoiceovers] = useState(false)
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  
  // UI state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    characterDetails: false,
    whatTheySay: false,
    environment: false,
    audioEffects: false,
    technical: false,
    sceneDetails: false,
    audioEnhancement: false,
    sceneDialog: false,
    sceneEnvironment: false,
    sceneAudioEffects: false
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
        if (audio.duration > 60) {
          toast({
            title: "Audio too long",
            description: `Audio file must be under 60 seconds. Please select a shorter file.`,
            variant: "destructive"
          })
        }
      }
      audio.src = URL.createObjectURL(audioFile)
    }
  }, [audioFile, toast])

  const loadAvailableAvatars = async () => {
    setLoadingAvatars(true)
    try {
      const response = await fetch('/api/avatars')
      if (response.ok) {
        const data = await response.json()
        console.log('🎭 Avatars loaded:', data.avatars?.length || 0, 'avatars')
        console.log('🎭 First avatar structure:', data.avatars?.[0])
        setAvailableAvatars(data.avatars || [])
      } else {
        console.error('Failed to load avatars:', response.status, response.statusText)
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
      const response = await fetch('/api/voiceovers')
      if (response.ok) {
        const data = await response.json()
        setAvailableVoiceovers(data.voiceovers || [])
      } else {
        console.error('Failed to load voiceovers:', response.status, response.statusText)
        toast({
          title: "Failed to load voiceovers",
          description: "Could not fetch your voiceover library. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to load voiceovers:', error)
      toast({
        title: "Failed to load voiceovers",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive"
      })
    } finally {
      setLoadingVoiceovers(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPG, JPEG, PNG).",
          variant: "destructive"
        })
        return
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image file must be under 10MB.",
          variant: "destructive"
        })
        return
      }
      
      if (mode === 'single') {
      setCustomImage(file)
      const preview = URL.createObjectURL(file)
      setCustomImagePreview(preview)
      setUseCustomImage(true)
      } else if (mode === 'multi') {
        setSceneImage(file)
        const preview = URL.createObjectURL(file)
        setSceneImagePreview(preview)
      }
    }
  }

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/mpeg']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file (MP3, WAV, M4A, AAC).",
          variant: "destructive"
        })
        return
      }
      
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

  const removeSceneImage = () => {
    if (sceneImagePreview) {
      URL.revokeObjectURL(sceneImagePreview)
    }
    setSceneImage(null)
    setSceneImagePreview(null)
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

  const toggleVoiceoverPlayback = (voiceoverId: string, audioUrl: string) => {
    if (playingVoiceoverId === voiceoverId) {
      // Stop current playback
      if (voiceoverAudioRef) {
        voiceoverAudioRef.pause()
        voiceoverAudioRef.currentTime = 0
      }
      setPlayingVoiceoverId(null)
      setVoiceoverAudioRef(null)
    } else {
      // Stop any other playing voiceover
      if (voiceoverAudioRef) {
        voiceoverAudioRef.pause()
        voiceoverAudioRef.currentTime = 0
      }
      
      // Start new playback
      const audio = new Audio(audioUrl)
      
      // Add error handling
      audio.onerror = (e) => {
        console.error('Audio playback error:', e)
        toast({
          title: "Audio playback failed",
          description: "Could not play this voiceover. The audio file may be corrupted or unavailable.",
          variant: "destructive"
        })
        setPlayingVoiceoverId(null)
        setVoiceoverAudioRef(null)
      }
      
      audio.onended = () => {
        setPlayingVoiceoverId(null)
        setVoiceoverAudioRef(null)
      }
      
      audio.play().catch((error) => {
        console.error('Audio play failed:', error)
        toast({
          title: "Audio playback failed",
          description: "Could not start audio playback. Please try again.",
          variant: "destructive"
        })
        setPlayingVoiceoverId(null)
        setVoiceoverAudioRef(null)
      })
      
      setPlayingVoiceoverId(voiceoverId)
      setVoiceoverAudioRef(audio)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const validateMode1 = () => {
    if (!useCustomImage && !selectedAvatarId) {
      toast({
        title: "Please choose a character first",
        description: "Select an avatar from your library or upload an image.",
        variant: "destructive"
      })
      return false
    }

    if (useCustomImage && !customImage) {
      toast({
        title: "Please upload an image",
        description: "Choose an image file to continue.",
        variant: "destructive"
      })
      return false
    }

    if (!useCustomAudio && !selectedVoiceoverId) {
      toast({
        title: "Add a voice to continue",
        description: "Select a voiceover from your library or upload audio.",
        variant: "destructive"
      })
      return false
    }

    if (useCustomAudio && !audioFile) {
      toast({
        title: "Please upload audio",
        description: "Choose an audio file to continue.",
        variant: "destructive"
      })
      return false
    }

    if (audioFile && audioDuration > 60) {
      toast({
        title: "Audio too long",
        description: `Audio file is ${audioDuration.toFixed(1)}s long. Please upload audio under 60 seconds.`,
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const validateMode2 = () => {
    if (!mainPrompt.trim() && dialogLines.length === 0) {
      toast({
        title: "Missing content",
        description: "Please describe what happens or add dialog lines",
        variant: "destructive"
      })
      return false
    }
    
    // Check if characters have names when dialog lines exist
    if (dialogLines.length > 0) {
      const hasNamedCharacters = characters.some(char => char.name.trim())
      if (!hasNamedCharacters) {
        toast({
          title: "Missing character names",
          description: "Please name your characters when adding dialog",
          variant: "destructive"
        })
        return false
      }
    }
    
    return true
  }

  const validateMode3 = () => {
    // Check scene image (either uploaded or selected from library)
    if (!useCustomSceneImage && !selectedSceneAvatarId) {
      toast({
        title: "Please choose your scene",
        description: "Select an avatar from your library or upload an image.",
        variant: "destructive"
      })
      return false
    }

    if (useCustomSceneImage && !sceneImage) {
      toast({
        title: "Please upload your scene",
        description: "Upload an image with multiple people to continue.",
        variant: "destructive"
      })
      return false
    }

    // Check scene description
    if (!sceneDescription.trim()) {
      toast({
        title: "Scene description required",
        description: "Please describe what happens in your scene.",
        variant: "destructive"
      })
      return false
    }

    // Check dialog content
    if (sceneDialogLines.length === 0) {
      toast({
        title: "Add dialog to your scene",
        description: "Tell us what the characters say in your scene.",
        variant: "destructive"
      })
      return false
    }
    
    // Check if characters have names when dialog lines exist
    if (sceneDialogLines.length > 0) {
      const hasNamedCharacters = sceneCharacters.some(char => char.name.trim())
      if (!hasNamedCharacters) {
        toast({
          title: "Missing character names",
          description: "Please name your characters when adding dialog",
          variant: "destructive"
        })
        return false
      }
    }
    
    return true
  }

  const handleGenerate = async () => {
    let isValid = false
    
    switch (mode) {
      case 'single':
        isValid = validateMode1()
        break
      case 'describe':
        isValid = validateMode2()
        break
      case 'multi':
        isValid = validateMode3()
        break
    }

    if (!isValid) return

    setIsGenerating(true)
    try {
      let generationData: any = {
        mode,
        title: title.trim() || "Untitled Talking Avatar",
        aspect_ratio: aspectRatio,
        metadata: {
        projectTitle,
          selectedArtifact,
          timestamp: new Date().toISOString()
        }
      }

      // Mode-specific data
      if (mode === 'single') {
        generationData = {
          ...generationData,
        use_custom_image: useCustomImage,
        selected_avatar_id: selectedAvatarId || null,
        use_custom_audio: useCustomAudio,
        audio_duration: audioDuration || null,
        selected_voiceover_id: selectedVoiceoverId || null,
          max_duration: 60 // Fixed 60-second limit for single character mode
        }
      } else if (mode === 'describe') {
        generationData = {
          ...generationData,
          main_prompt: mainPrompt,
          character_count: characterCount,
          characters: characters,
          dialog_lines: dialogLines,
          environment: environment,
          background: background,
          lighting: lighting,
          background_music: backgroundMusic,
          sound_effects: soundEffects,
          max_duration: describeMaxDuration
        }
      } else if (mode === 'multi') {
        generationData = {
          ...generationData,
          use_custom_scene_image: useCustomSceneImage,
          scene_image: sceneImage,
          selected_scene_avatar_id: selectedSceneAvatarId,
          scene_description: sceneDescription,
          scene_character_count: sceneCharacterCount,
          scene_characters: sceneCharacters,
          scene_dialog_lines: sceneDialogLines,
          scene_environment: sceneEnvironment,
          custom_scene_environment: customSceneEnvironment,
          scene_background: sceneBackground,
          custom_scene_background: customSceneBackground,
          scene_lighting: sceneLighting,
          custom_scene_lighting: customSceneLighting,
          scene_background_music: sceneBackgroundMusic,
          custom_scene_background_music: customSceneBackgroundMusic,
          scene_sound_effects: sceneSoundEffects,
          custom_scene_sound_effects: customSceneSoundEffects,
          max_duration: multiMaxDuration
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

  const getGenerateButtonText = () => {
    switch (mode) {
      case 'single':
        return "Create Talking Avatar"
      case 'describe':
        return "Generate from Description"
      case 'multi':
        return "Bring Scene to Life"
      default:
        return "Generate"
    }
  }

  const selectedAvatar = availableAvatars.find(avatar => avatar.id === selectedAvatarId)
  
  // Debug selected avatar
  useEffect(() => {
    if (selectedAvatarId) {
      console.log('🎭 Selected avatar ID:', selectedAvatarId)
      console.log('🎭 Available avatars:', availableAvatars.length)
      console.log('🎭 Found avatar:', selectedAvatar)
    }
  }, [selectedAvatarId, availableAvatars, selectedAvatar])

  const getModeDescription = () => {
    switch (mode) {
      case 'single':
        return "Use existing avatars or upload your own - Up to 60 seconds"
      case 'describe':
        return "AI creates everything from your text description - Up to 148 seconds (≈ 2 min 28 s)"
      case 'multi':
        return "Upload a scene with multiple people - Up to 148 seconds (≈ 2 min 28 s)"
      default:
        return ""
    }
  }

  const getVoiceoverAudioUrl = (voiceover: AvailableVoiceover): string | null => {
    return voiceover.generated_audio_path || 
           voiceover.content?.audio_url || 
           null
  }

  const getAvatarImageUrl = (avatar: AvailableAvatar): string | null => {
    return avatar.generated_images?.[0] || 
           avatar.image || 
           null
  }

  // Mode 2 helper functions
  const updateCharacterCount = (count: number) => {
    setCharacterCount(count)
    // Adjust characters array
    if (count > characters.length) {
      // Add new characters
      const newCharacters = [...characters]
      for (let i = characters.length; i < count; i++) {
        newCharacters.push({
          id: (i + 1).toString(),
          name: '',
          description: '',
          artStyle: '',
          ageRange: '',
          ethnicity: '',
          gender: '',
          role: '',
          bodyType: '',
          skinTone: '',
          hairStyle: '',
          hairColor: '',
          eyeColor: '',
          eyeShape: '',
          outfitCategory: '',
          outfitColors: '',
          customOutfitColors: '',
          accessories: [],
          customAccessory: '',
          expression: '',
          voice: ''
        })
      }
      setCharacters(newCharacters)
    } else if (count < characters.length) {
      // Remove excess characters
      setCharacters(characters.slice(0, count))
      // Remove dialog lines for removed characters
      setDialogLines(dialogLines.filter(line => 
        parseInt(line.characterId) <= count
      ))
    }
  }

  const updateCharacter = (index: number, field: string, value: string | string[]) => {
    const updated = [...characters]
    updated[index] = { ...updated[index], [field]: value }
    setCharacters(updated)
  }

  const toggleAccessory = (characterIndex: number, accessory: string) => {
    const character = characters[characterIndex]
    const currentAccessories = character.accessories || []
    const updatedAccessories = currentAccessories.includes(accessory)
      ? currentAccessories.filter(a => a !== accessory)
      : [...currentAccessories, accessory]
    updateCharacter(characterIndex, 'accessories', updatedAccessories)
  }

  const addDialogLine = () => {
    const newLine = {
      id: Date.now().toString(),
      characterId: '1',
      text: '',
      expression: ''
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
      [newLines[index - 1], newLines[index]] = [newLines[index], newLines[index - 1]]
    } else if (direction === 'down' && index < newLines.length - 1) {
      [newLines[index], newLines[index + 1]] = [newLines[index + 1], newLines[index]]
    }
    setDialogLines(newLines)
  }

  // Mode 3 helper functions
  const updateSceneCharacterCount = (count: number) => {
    setSceneCharacterCount(count)
    // Adjust sceneCharacters array
    if (count > sceneCharacters.length) {
      // Add new characters
      const newCharacters = [...sceneCharacters]
      for (let i = sceneCharacters.length; i < count; i++) {
        newCharacters.push({
          id: (i + 1).toString(),
          name: ''
        })
      }
      setSceneCharacters(newCharacters)
    } else if (count < sceneCharacters.length) {
      // Remove excess characters
      setSceneCharacters(sceneCharacters.slice(0, count))
      // Remove dialog lines for removed characters
      setSceneDialogLines(sceneDialogLines.filter(line => 
        parseInt(line.characterId) <= count
      ))
    }
  }

  const updateSceneCharacter = (index: number, field: string, value: string) => {
    const updated = [...sceneCharacters]
    updated[index] = { ...updated[index], [field]: value }
    setSceneCharacters(updated)
  }

  const addSceneDialogLine = () => {
    const newLine = {
      id: Date.now().toString(),
      characterId: '1',
      text: '',
      expression: ''
    }
    setSceneDialogLines([...sceneDialogLines, newLine])
  }

  const updateSceneDialogLine = (id: string, field: string, value: string) => {
    setSceneDialogLines(sceneDialogLines.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ))
  }

  const removeSceneDialogLine = (id: string) => {
    setSceneDialogLines(sceneDialogLines.filter(line => line.id !== id))
  }

  const moveSceneDialogLine = (id: string, direction: 'up' | 'down') => {
    const index = sceneDialogLines.findIndex(line => line.id === id)
    if (index === -1) return
    
    const newLines = [...sceneDialogLines]
    if (direction === 'up' && index > 0) {
      [newLines[index - 1], newLines[index]] = [newLines[index], newLines[index - 1]]
    } else if (direction === 'down' && index < newLines.length - 1) {
      [newLines[index], newLines[index + 1]] = [newLines[index + 1], newLines[index]]
    }
    setSceneDialogLines(newLines)
  }

  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-4 h-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-hover">
      {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
          <h3 className="text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎭 Talking Avatar Generator
          </h3>
          <p className="text-xs text-muted-foreground">
            {projectTitle}
          </p>
        </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 shrink-0">
          <X className="h-3 w-3" />
        </Button>
      </div>

        {/* Mode Selection Tabs */}
        <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)} className="w-full mb-4">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="single" className="text-xs py-2 px-2 data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
              Single Avatar
            </TabsTrigger>
            <TabsTrigger value="describe" className="text-xs py-2 px-2 data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
              AI Generate
            </TabsTrigger>
            <TabsTrigger value="multi" className="text-xs py-2 px-2 data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
              Group Scene
            </TabsTrigger>
          </TabsList>

          {/* Mode Description */}
          <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-xs text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              {getModeDescription()}
            </p>
            </div>

          {/* Mode 1: Single Character */}
          <TabsContent value="single" className="space-y-4 mt-4">
            {/* Info Banner */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <span className="text-sm">💡</span>
                Video length will automatically match your audio/voiceover length (max 60 seconds)
              </p>
            </div>

          {/* Title Field */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your talking avatar..."
                className="w-full h-8 text-xs"
            />
          </div>

            {/* Avatar Source */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-foreground">Choose Your Character <span className="text-red-500">*</span></label>
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
                  From Library
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

          {/* Custom Image Upload */}
          {useCustomImage && (
            <div className="space-y-4">
              {!customImage ? (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <div className="flex flex-col items-center gap-2">
                    <FileImage className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm">
                      <span className="font-medium text-foreground">Upload Image</span>
                      <p className="text-xs text-muted-foreground mt-1">
                            JPG, JPEG, PNG (max 10MB) - Single person only
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
                      type="button"
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
              {loadingAvatars ? (
                <div className="text-xs text-muted-foreground">Loading avatars...</div>
              ) : (
                <Select value={selectedAvatarId} onValueChange={setSelectedAvatarId}>
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Select an avatar..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                      {availableAvatars.map((avatar) => {
                        const imageUrl = getAvatarImageUrl(avatar)
                        return (
                      <SelectItem key={avatar.id} value={avatar.id} className="text-xs">
                        <div className="flex items-center gap-3">
                              {imageUrl && (
                          <img 
                                  src={imageUrl} 
                            alt={avatar.title}
                            className="w-6 h-6 object-cover rounded"
                          />
                              )}
                          <div>
                            <div className="font-medium">{avatar.title}</div>
                                {(avatar.roleArchetype || avatar.role_archetype) && (
                                  <div className="text-muted-foreground text-xs">{avatar.roleArchetype || avatar.role_archetype}</div>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                        )
                      })}
                  </SelectContent>
                </Select>
              )}
              
                  {selectedAvatarId && selectedAvatar && (() => {
                    const avatarImageUrl = getAvatarImageUrl(selectedAvatar)
                    return (
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-3">
                          {avatarImageUrl ? (
                    <img 
                              src={avatarImageUrl} 
                      alt={selectedAvatar.title}
                              className="w-12 h-12 object-cover rounded-lg border border-border"
                              onError={(e) => {
                                console.error('🎭 Avatar image failed to load:', avatarImageUrl)
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-lg border border-border flex items-center justify-center">
                              <User className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
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
                    )
                  })()}
            </div>
          )}
      </div>

            {/* Voice Source */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-foreground">Choose the Voice <span className="text-red-500">*</span></label>
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
                  From Library
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

          {/* Voiceover Selection */}
          {!useCustomAudio && (
            <div className="space-y-4">
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
                            <div className="font-medium">{voiceover.title || 'Untitled Voiceover'}</div>
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
              
                  {selectedVoiceoverId && (() => {
                    const selectedVoiceover = availableVoiceovers.find(v => v.id === selectedVoiceoverId)
                    const audioUrl = selectedVoiceover ? getVoiceoverAudioUrl(selectedVoiceover) : null
                    
                    return (
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Volume2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-primary text-sm">
                              {selectedVoiceover?.title || 'Selected Voiceover'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                              {selectedVoiceover?.description || 'Voiceover from library'}
                      </p>
                    </div>
                          {audioUrl ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (selectedVoiceover && audioUrl) {
                                  toggleVoiceoverPlayback(selectedVoiceover.id, audioUrl)
                                }
                              }}
                              className="text-xs h-7"
                            >
                              {playingVoiceoverId === selectedVoiceoverId ? (
                                <>
                                  <Pause className="h-3 w-3 mr-1" />
                                  Stop
                                </>
                              ) : (
                                <>
                                  <Play className="h-3 w-3 mr-1" />
                                  Play
                                </>
                              )}
                            </Button>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              No preview available
                </div>
              )}
                        </div>
                      </div>
                    )
                  })()}
            </div>
          )}

          {/* Custom Audio Upload */}
          {useCustomAudio && (
            <div className="space-y-4">
            {!audioFile ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <FileAudio className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-medium text-foreground">Upload Audio</span>
                    <p className="text-xs text-muted-foreground mt-1">
                            MP3, WAV, M4A, AAC (max 10MB, max 60s)
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
                
                      {audioDuration > 60 && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                            <span className="text-sm">⚠️</span>
                            Audio is {audioDuration.toFixed(1)}s long. Please upload audio under 60 seconds.
                          </p>
                  </div>
                )}
              </div>
            )}
            </div>
          )}
      </div>


            {/* Basic Settings */}
        <Collapsible 
              open={expandedSections.technical} 
              onOpenChange={() => toggleSection('technical')}
        >
        <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Settings className="h-3 w-3" />
                    <span className="text-xs font-medium text-muted-foreground">Advanced Settings</span>
            </div>
                  {expandedSections.technical ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Aspect Ratio</label>
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
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          {/* Mode 2: Describe & Create */}
          <TabsContent value="describe" className="space-y-4 mt-4">
            {/* Title Field */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your talking avatar..."
                className="w-full h-8 text-xs"
              />
            </div>

            {/* Scene Setup - Always Open */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-foreground">Describe what happens in your video... <span className="text-red-500">*</span></label>
              <Textarea
                value={mainPrompt}
                onChange={(e) => setMainPrompt(e.target.value)}
                placeholder="Describe the character, what they say, the setting, and any actions or emotions..."
                className="min-h-[100px] text-xs resize-none"
              />
              <div className="text-xs text-muted-foreground">
                Character count: {mainPrompt.length}/500
              </div>
            </div>

            {/* Number of Characters */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">How many people? <span className="text-red-500">*</span></label>
              <Select value={characterCount.toString()} onValueChange={(value) => updateCharacterCount(parseInt(value))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select number of characters..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 person</SelectItem>
                  <SelectItem value="2">2 people</SelectItem>
                  <SelectItem value="3">3 people</SelectItem>
                  <SelectItem value="4">4 people</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Characters - Dynamic sections */}
            {characters.map((character, index) => (
              <Collapsible 
                key={character.id}
                open={expandedSections[`character${index}`] || index === 0} 
                onOpenChange={() => toggleSection(`character${index}`)}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2 h-auto hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Character {index + 1} {character.name && `- ${character.name}`}
                      </span>
                    </div>
                    {expandedSections[`character${index}`] || index === 0 ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-2">
                  {/* Basic Info */}
                  <div className="space-y-3 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📝</span>
                      <h5 className="text-xs font-semibold bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">Basic Info</h5>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Name: Who is this person?</label>
                        <Input
                          value={character.name}
                          onChange={(e) => updateCharacter(index, 'name', e.target.value)}
                          placeholder="e.g., Sarah, The Manager, etc."
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Description: Brief character description</label>
                        <Textarea
                          value={character.description}
                          onChange={(e) => updateCharacter(index, 'description', e.target.value)}
                          placeholder="e.g., A confident business professional with years of experience..."
                          className="min-h-[60px] text-xs resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Art Style: How should this character look?</label>
                        <Select value={character.artStyle} onValueChange={(value) => updateCharacter(index, 'artStyle', value)}>
                          <SelectTrigger className="h-8 text-xs">
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
                    </div>
                  </div>

                  {/* Identity & Role */}
                  <div className="space-y-3 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🧠</span>
                      <h5 className="text-xs font-semibold bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">Identity & Role</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Age Range</label>
                        <Select value={character.ageRange} onValueChange={(value) => updateCharacter(index, 'ageRange', value)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select age..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="child">👶 Child (5-12)</SelectItem>
                            <SelectItem value="teen">🧑‍🎓 Teen (13-17)</SelectItem>
                            <SelectItem value="young-adult">👨‍💼 Young Adult (18-25)</SelectItem>
                            <SelectItem value="adult">👩‍💼 Adult (26-40)</SelectItem>
                            <SelectItem value="middle-aged">👨‍💻 Middle-Aged (41-60)</SelectItem>
                            <SelectItem value="elder">👴 Elder (60+)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Ethnicity</label>
                        <Select value={character.ethnicity} onValueChange={(value) => updateCharacter(index, 'ethnicity', value)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select ethnicity..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="white">White</SelectItem>
                            <SelectItem value="black">Black</SelectItem>
                            <SelectItem value="asian">Asian</SelectItem>
                            <SelectItem value="hispanic">Hispanic</SelectItem>
                            <SelectItem value="middle-eastern">Middle Eastern</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Gender</label>
                        <Select value={character.gender} onValueChange={(value) => updateCharacter(index, 'gender', value)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select gender..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">👨 Male</SelectItem>
                            <SelectItem value="female">👩 Female</SelectItem>
                            <SelectItem value="non-binary">⚧ Non-binary</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Role</label>
                        <Select value={character.role} onValueChange={(value) => updateCharacter(index, 'role', value)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select role..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">💼 Professional</SelectItem>
                            <SelectItem value="creative">🎨 Creative</SelectItem>
                            <SelectItem value="athletic">🏃 Athletic</SelectItem>
                            <SelectItem value="academic">🎓 Academic</SelectItem>
                            <SelectItem value="casual">😊 Casual</SelectItem>
                            <SelectItem value="executive">👔 Executive</SelectItem>
                            <SelectItem value="artist">🎭 Artist</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Physical Traits */}
                  <div className="space-y-3 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">👤</span>
                      <h5 className="text-xs font-semibold bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">Physical Traits</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Body Type</label>
                        <Select value={character.bodyType} onValueChange={(value) => updateCharacter(index, 'bodyType', value)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select body type..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="slim">Slim</SelectItem>
                            <SelectItem value="athletic">Athletic</SelectItem>
                            <SelectItem value="average">Average</SelectItem>
                            <SelectItem value="curvy">Curvy</SelectItem>
                            <SelectItem value="plus-size">Plus-size</SelectItem>
                            <SelectItem value="muscular">Muscular</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Skin Tone</label>
                        <Select value={character.skinTone} onValueChange={(value) => updateCharacter(index, 'skinTone', value)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select skin tone..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="tan">Tan</SelectItem>
                            <SelectItem value="brown">Brown</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Hair Style</label>
                        <Select value={character.hairStyle} onValueChange={(value) => updateCharacter(index, 'hairStyle', value)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select hair style..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short">Short</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="long">Long</SelectItem>
                            <SelectItem value="bald">Bald</SelectItem>
                            <SelectItem value="curly">Curly</SelectItem>
                            <SelectItem value="straight">Straight</SelectItem>
                            <SelectItem value="wavy">Wavy</SelectItem>
                            <SelectItem value="afro">Afro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Hair Color</label>
                        <Select value={character.hairColor} onValueChange={(value) => updateCharacter(index, 'hairColor', value)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select hair color..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="black">Black</SelectItem>
                            <SelectItem value="brown">Brown</SelectItem>
                            <SelectItem value="blonde">Blonde</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="gray">Gray</SelectItem>
                            <SelectItem value="white">White</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Eye Color</label>
                        <Select value={character.eyeColor} onValueChange={(value) => updateCharacter(index, 'eyeColor', value)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select eye color..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="brown">Brown</SelectItem>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="hazel">Hazel</SelectItem>
                            <SelectItem value="gray">Gray</SelectItem>
                            <SelectItem value="amber">Amber</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Eye Shape</label>
                        <Select value={character.eyeShape} onValueChange={(value) => updateCharacter(index, 'eyeShape', value)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select eye shape..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="round">Round</SelectItem>
                            <SelectItem value="almond">Almond</SelectItem>
                            <SelectItem value="hooded">Hooded</SelectItem>
                            <SelectItem value="monolid">Monolid</SelectItem>
                            <SelectItem value="upturned">Upturned</SelectItem>
                            <SelectItem value="downturned">Downturned</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Outfit & Style */}
                  <div className="space-y-3 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">👕</span>
                      <h5 className="text-xs font-semibold bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">Outfit & Style</h5>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Outfit Category</label>
                        <Select value={character.outfitCategory} onValueChange={(value) => updateCharacter(index, 'outfitCategory', value)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select outfit category..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            <SelectItem value="business">💼 Business</SelectItem>
                            <SelectItem value="casual">😊 Casual</SelectItem>
                            <SelectItem value="streetwear">👕 Streetwear</SelectItem>
                            <SelectItem value="formal">🎩 Formal</SelectItem>
                            <SelectItem value="athletic">🏃 Athletic</SelectItem>
                            <SelectItem value="creative">🎨 Creative</SelectItem>
                            <SelectItem value="traditional">🏮 Traditional</SelectItem>
                            <SelectItem value="vintage">📻 Vintage</SelectItem>
                            <SelectItem value="futuristic">🚀 Futuristic</SelectItem>
                            <SelectItem value="military">🎖️ Military</SelectItem>
                            <SelectItem value="medical">⚕️ Medical</SelectItem>
                            <SelectItem value="chef">👨‍🍳 Chef/Culinary</SelectItem>
                            <SelectItem value="construction">👷 Construction</SelectItem>
                            <SelectItem value="police">👮 Police/Security</SelectItem>
                            <SelectItem value="firefighter">🚒 Firefighter</SelectItem>
                            <SelectItem value="pilot">✈️ Pilot</SelectItem>
                            <SelectItem value="academic">🎓 Academic</SelectItem>
                            <SelectItem value="religious">⛪ Religious</SelectItem>
                            <SelectItem value="party">🎉 Party/Festival</SelectItem>
                            <SelectItem value="beach">🏖️ Beach/Swimwear</SelectItem>
                            <SelectItem value="winter">❄️ Winter/Ski</SelectItem>
                            <SelectItem value="custom">✏️ Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Outfit Colors</label>
                        <Select value={character.outfitColors} onValueChange={(value) => updateCharacter(index, 'outfitColors', value)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select color palette..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="black-white">⚫⚪ Black & White</SelectItem>
                            <SelectItem value="navy-white">🔵⚪ Navy & White</SelectItem>
                            <SelectItem value="gray-suit">⚫ Gray Suit</SelectItem>
                            <SelectItem value="brown-tan">🟤 Brown & Tan</SelectItem>
                            <SelectItem value="all-black">⚫ All Black</SelectItem>
                            <SelectItem value="all-white">⚪ All White</SelectItem>
                            <SelectItem value="colorful">🌈 Colorful/Bright</SelectItem>
                            <SelectItem value="pastel">🎀 Pastel Colors</SelectItem>
                            <SelectItem value="earth-tones">🌿 Earth Tones</SelectItem>
                            <SelectItem value="neon">💡 Neon Colors</SelectItem>
                            <SelectItem value="custom">✏️ Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {character.outfitColors === 'custom' && (
                          <Input
                            value={character.customOutfitColors}
                            onChange={(e) => updateCharacter(index, 'customOutfitColors', e.target.value)}
                            placeholder="Describe your outfit colors..."
                            className="h-8 text-xs mt-2"
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Accessories</label>
                        <Select 
                          value="select-accessories" 
                          onValueChange={(value) => {
                            if (value !== 'select-accessories') {
                              toggleAccessory(index, value)
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select accessories..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Glasses">👓 Glasses</SelectItem>
                            <SelectItem value="Sunglasses">😎 Sunglasses</SelectItem>
                            <SelectItem value="Hat">🎩 Hat</SelectItem>
                            <SelectItem value="Cap">🧢 Cap</SelectItem>
                            <SelectItem value="Beanie">🎨 Beanie</SelectItem>
                            <SelectItem value="Jewelry">💍 Jewelry</SelectItem>
                            <SelectItem value="Necklace">📿 Necklace</SelectItem>
                            <SelectItem value="Earrings">👂 Earrings</SelectItem>
                            <SelectItem value="Watch">⌚ Watch</SelectItem>
                            <SelectItem value="Bracelet">🔗 Bracelet</SelectItem>
                            <SelectItem value="Scarf">🧣 Scarf</SelectItem>
                            <SelectItem value="Tie">👔 Tie</SelectItem>
                            <SelectItem value="Bow Tie">🎀 Bow Tie</SelectItem>
                            <SelectItem value="Belt">📌 Belt</SelectItem>
                            <SelectItem value="Bag">👜 Bag</SelectItem>
                            <SelectItem value="Backpack">🎒 Backpack</SelectItem>
                            <SelectItem value="Briefcase">💼 Briefcase</SelectItem>
                            <SelectItem value="Gloves">🧤 Gloves</SelectItem>
                            <SelectItem value="Ring">💍 Ring</SelectItem>
                            <SelectItem value="Headphones">🎧 Headphones</SelectItem>
                            <SelectItem value="Custom">✏️ Custom accessory...</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {/* Display selected accessories as badges */}
                        {character.accessories && character.accessories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {character.accessories.map((accessory) => (
                              <div 
                                key={accessory} 
                                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                              >
                                <span>{accessory}</span>
                                <button
                                  type="button"
                                  onClick={() => toggleAccessory(index, accessory)}
                                  className="hover:text-primary/70"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Custom accessory input */}
                        {character.accessories?.includes('Custom') && (
                          <Input
                            value={character.customAccessory}
                            onChange={(e) => updateCharacter(index, 'customAccessory', e.target.value)}
                            placeholder="Describe your custom accessory..."
                            className="h-8 text-xs mt-2"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expression & Voice */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">😊</span>
                      <h5 className="text-xs font-semibold bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">Expression & Voice</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Expression: What's their mood?</label>
                        <Select value={character.expression} onValueChange={(value) => updateCharacter(index, 'expression', value)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select mood..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="happy">😊 Happy</SelectItem>
                            <SelectItem value="serious">😐 Serious</SelectItem>
                            <SelectItem value="excited">🤩 Excited</SelectItem>
                            <SelectItem value="calm">😌 Calm</SelectItem>
                            <SelectItem value="confident">😎 Confident</SelectItem>
                            <SelectItem value="friendly">😄 Friendly</SelectItem>
                            <SelectItem value="professional">💼 Professional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Voice Style</label>
                        <Select value={character.voice} onValueChange={(value) => updateCharacter(index, 'voice', value)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select voice style..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">💼 Professional</SelectItem>
                            <SelectItem value="friendly">😊 Friendly</SelectItem>
                            <SelectItem value="energetic">⚡ Energetic</SelectItem>
                            <SelectItem value="calm">😌 Calm</SelectItem>
                            <SelectItem value="authoritative">🎯 Authoritative</SelectItem>
                            <SelectItem value="conversational">💬 Conversational</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}

            {/* Conversation / Dialog */}
            <Collapsible 
              open={expandedSections.conversation} 
              onOpenChange={() => toggleSection('conversation')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-3 w-3" />
                    <span className="text-xs font-medium text-muted-foreground">Conversation / Dialog</span>
                  </div>
                  {expandedSections.conversation ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
            <div className="space-y-4">
                  {characterCount === 1 ? (
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
              </div>
                  ) : (
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
                              <Select value={line.characterId} onValueChange={(value) => updateDialogLine(line.id, 'characterId', value)}>
                                <SelectTrigger className="h-8 text-xs">
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
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-foreground">Expression for this line</label>
                              <Select value={line.expression} onValueChange={(value) => updateDialogLine(line.id, 'expression', value)}>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Select expression..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="happy">😊 Happy</SelectItem>
                                  <SelectItem value="serious">😐 Serious</SelectItem>
                                  <SelectItem value="excited">🤩 Excited</SelectItem>
                                  <SelectItem value="calm">😌 Calm</SelectItem>
                                  <SelectItem value="confident">😎 Confident</SelectItem>
                                  <SelectItem value="friendly">😄 Friendly</SelectItem>
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
                          </div>
                        </div>
                      ))}
                      
                      {dialogLines.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground text-xs">
                          Click "Add Line" to start building your conversation
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Environment */}
            <Collapsible 
              open={expandedSections.environment} 
              onOpenChange={() => toggleSection('environment')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Camera className="h-3 w-3" />
                    <span className="text-xs font-medium text-muted-foreground">Environment</span>
                  </div>
                  {expandedSections.environment ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
            <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Where does this happen?</label>
                    <Select value={environment} onValueChange={setEnvironment}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select setting..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="modern-office">🏢 Modern Office</SelectItem>
                        <SelectItem value="home-office">🏠 Home Office</SelectItem>
                        <SelectItem value="boardroom">👔 Corporate Boardroom</SelectItem>
                        <SelectItem value="coworking">☕ Co-working Space</SelectItem>
                        <SelectItem value="coffee-shop">☕ Coffee Shop</SelectItem>
                        <SelectItem value="restaurant">🍽️ Restaurant</SelectItem>
                        <SelectItem value="bar">🍺 Bar</SelectItem>
                        <SelectItem value="park">🌳 Park</SelectItem>
                        <SelectItem value="beach">🏖️ Beach</SelectItem>
                        <SelectItem value="forest">🌲 Forest</SelectItem>
                        <SelectItem value="mountains">⛰️ Mountains</SelectItem>
                        <SelectItem value="city-street">🏙️ City Street</SelectItem>
                        <SelectItem value="studio">🎬 Studio</SelectItem>
                        <SelectItem value="gym">💪 Gym</SelectItem>
                        <SelectItem value="school">🎓 School/Classroom</SelectItem>
                        <SelectItem value="hospital">🏥 Hospital</SelectItem>
                        <SelectItem value="store">🏪 Store/Shop</SelectItem>
                        <SelectItem value="factory">🏭 Factory</SelectItem>
                        <SelectItem value="warehouse">📦 Warehouse</SelectItem>
                        <SelectItem value="airport">✈️ Airport</SelectItem>
                        <SelectItem value="hotel">🏨 Hotel</SelectItem>
                        <SelectItem value="library">📚 Library</SelectItem>
                        <SelectItem value="museum">🏛️ Museum</SelectItem>
                        <SelectItem value="theater">🎭 Theater</SelectItem>
                        <SelectItem value="stadium">🏟️ Sports Stadium</SelectItem>
                        <SelectItem value="kitchen">👨‍🍳 Kitchen</SelectItem>
                        <SelectItem value="living-room">🛋️ Living Room</SelectItem>
                        <SelectItem value="bedroom">🛏️ Bedroom</SelectItem>
                        <SelectItem value="garage">🚗 Garage</SelectItem>
                        <SelectItem value="rooftop">🏙️ Rooftop</SelectItem>
                        <SelectItem value="basement">🔦 Basement</SelectItem>
                        <SelectItem value="subway">🚇 Subway</SelectItem>
                        <SelectItem value="train">🚂 Train</SelectItem>
                        <SelectItem value="car">🚗 Car</SelectItem>
                        <SelectItem value="abstract">🎨 Abstract/Minimal</SelectItem>
                        <SelectItem value="green-screen">💚 Green Screen</SelectItem>
                        <SelectItem value="custom">✏️ Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {environment === 'custom' && (
                      <Input
                        value={customEnvironment}
                        onChange={(e) => setCustomEnvironment(e.target.value)}
                        placeholder="Describe your setting..."
                        className="h-8 text-xs mt-2"
                      />
                    )}
              </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Background</label>
                    <Select value={background} onValueChange={setBackground}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select background..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="office">🏢 Office</SelectItem>
                        <SelectItem value="home">🏠 Home</SelectItem>
                        <SelectItem value="outdoors">🌳 Outdoors</SelectItem>
                        <SelectItem value="studio">🎬 Studio</SelectItem>
                        <SelectItem value="abstract">🎨 Abstract</SelectItem>
                        <SelectItem value="minimalist">⚪ Minimalist</SelectItem>
                        <SelectItem value="busy">📱 Busy/Crowded</SelectItem>
                        <SelectItem value="blurred">🌫️ Blurred</SelectItem>
                        <SelectItem value="bokeh">✨ Bokeh Effect</SelectItem>
                        <SelectItem value="solid-color">🎨 Solid Color</SelectItem>
                        <SelectItem value="gradient">🌈 Gradient</SelectItem>
                        <SelectItem value="nature">🌿 Nature</SelectItem>
                        <SelectItem value="urban">🏙️ Urban</SelectItem>
                        <SelectItem value="industrial">🏭 Industrial</SelectItem>
                        <SelectItem value="futuristic">🚀 Futuristic</SelectItem>
                        <SelectItem value="vintage">📻 Vintage</SelectItem>
                        <SelectItem value="custom">✏️ Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {background === 'custom' && (
                      <Input
                        value={customBackground}
                        onChange={(e) => setCustomBackground(e.target.value)}
                        placeholder="Describe your background..."
                        className="h-8 text-xs mt-2"
                      />
                    )}
            </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Lighting</label>
                    <Select value={lighting} onValueChange={setLighting}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select lighting..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="bright">☀️ Bright/Daylight</SelectItem>
                        <SelectItem value="dramatic">🎭 Dramatic</SelectItem>
                        <SelectItem value="soft">💡 Soft</SelectItem>
                        <SelectItem value="natural">🌅 Natural</SelectItem>
                        <SelectItem value="warm">🔥 Warm</SelectItem>
                        <SelectItem value="cool">❄️ Cool</SelectItem>
                        <SelectItem value="studio">🎬 Studio</SelectItem>
                        <SelectItem value="golden-hour">🌇 Golden Hour</SelectItem>
                        <SelectItem value="blue-hour">🌆 Blue Hour</SelectItem>
                        <SelectItem value="sunset">🌅 Sunset</SelectItem>
                        <SelectItem value="night">🌙 Night</SelectItem>
                        <SelectItem value="neon">💡 Neon</SelectItem>
                        <SelectItem value="backlit">💫 Backlit</SelectItem>
                        <SelectItem value="side-lit">🔦 Side Lit</SelectItem>
                        <SelectItem value="ring-light">⭕ Ring Light</SelectItem>
                        <SelectItem value="cinematic">🎬 Cinematic</SelectItem>
                        <SelectItem value="high-contrast">⚫⚪ High Contrast</SelectItem>
                        <SelectItem value="low-key">🎭 Low Key</SelectItem>
                        <SelectItem value="custom">✏️ Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {lighting === 'custom' && (
                      <Input
                        value={customLighting}
                        onChange={(e) => setCustomLighting(e.target.value)}
                        placeholder="Describe your lighting..."
                        className="h-8 text-xs mt-2"
                      />
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Audio & Effects */}
            <Collapsible 
              open={expandedSections.audioEffects} 
              onOpenChange={() => toggleSection('audioEffects')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Music className="h-3 w-3" />
                    <span className="text-xs font-medium text-muted-foreground">Audio & Effects</span>
                  </div>
                  {expandedSections.audioEffects ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
            <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Describe the mood of music</label>
                    <Select value={backgroundMusic} onValueChange={setBackgroundMusic}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select music mood..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="upbeat">⚡ Upbeat/Energetic</SelectItem>
                        <SelectItem value="corporate">💼 Corporate/Professional</SelectItem>
                        <SelectItem value="calm">😌 Calm/Ambient</SelectItem>
                        <SelectItem value="dramatic">🎭 Dramatic/Intense</SelectItem>
                        <SelectItem value="happy">😊 Happy/Cheerful</SelectItem>
                        <SelectItem value="sad">😢 Sad/Melancholic</SelectItem>
                        <SelectItem value="inspirational">🌟 Inspirational/Motivational</SelectItem>
                        <SelectItem value="suspenseful">🎬 Suspenseful</SelectItem>
                        <SelectItem value="romantic">❤️ Romantic</SelectItem>
                        <SelectItem value="epic">⚔️ Epic/Cinematic</SelectItem>
                        <SelectItem value="jazz">🎷 Jazz/Smooth</SelectItem>
                        <SelectItem value="rock">🎸 Rock/Electric</SelectItem>
                        <SelectItem value="electronic">🎹 Electronic/Techno</SelectItem>
                        <SelectItem value="classical">🎻 Classical</SelectItem>
                        <SelectItem value="lofi">🎧 Lo-fi/Chill</SelectItem>
                        <SelectItem value="acoustic">🎸 Acoustic</SelectItem>
                        <SelectItem value="piano">🎹 Piano</SelectItem>
                        <SelectItem value="guitar">🎸 Guitar</SelectItem>
                        <SelectItem value="none">🚫 No Music</SelectItem>
                        <SelectItem value="custom">✏️ Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {backgroundMusic === 'custom' && (
                      <Input
                        value={customBackgroundMusic}
                        onChange={(e) => setCustomBackgroundMusic(e.target.value)}
                        placeholder="Describe your music mood..."
                        className="h-8 text-xs mt-2"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Any sound effects?</label>
                    <Select value={soundEffects} onValueChange={setSoundEffects}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select sound effects..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="office">💼 Office Sounds (typing, phone)</SelectItem>
                        <SelectItem value="nature">🌿 Nature Sounds (birds, wind, water)</SelectItem>
                        <SelectItem value="city">🏙️ City Sounds (traffic, crowd)</SelectItem>
                        <SelectItem value="applause">👏 Applause</SelectItem>
                        <SelectItem value="laughter">😄 Laughter</SelectItem>
                        <SelectItem value="footsteps">👣 Footsteps</SelectItem>
                        <SelectItem value="door">🚪 Door Open/Close</SelectItem>
                        <SelectItem value="phone-ring">📞 Phone Ring</SelectItem>
                        <SelectItem value="notification">🔔 Notification Ping</SelectItem>
                        <SelectItem value="cash-register">💰 Cash Register</SelectItem>
                        <SelectItem value="car">🚗 Car Engine</SelectItem>
                        <SelectItem value="rain">🌧️ Rain</SelectItem>
                        <SelectItem value="thunder">⚡ Thunder</SelectItem>
                        <SelectItem value="fire">🔥 Fire Crackling</SelectItem>
                        <SelectItem value="clock">⏰ Clock Ticking</SelectItem>
                        <SelectItem value="keyboard">⌨️ Keyboard Typing</SelectItem>
                        <SelectItem value="mouse">🖱️ Mouse Clicks</SelectItem>
                        <SelectItem value="paper">📄 Paper Rustling</SelectItem>
                        <SelectItem value="glass">🥂 Glass Clinking</SelectItem>
                        <SelectItem value="none">🚫 No Sound Effects</SelectItem>
                        <SelectItem value="custom">✏️ Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {soundEffects === 'custom' && (
                      <Input
                        value={customSoundEffects}
                        onChange={(e) => setCustomSoundEffects(e.target.value)}
                        placeholder="Describe your sound effects..."
                        className="h-8 text-xs mt-2"
                      />
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Technical */}
            <Collapsible 
              open={expandedSections.technical} 
              onOpenChange={() => toggleSection('technical')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Settings className="h-3 w-3" />
                    <span className="text-xs font-medium text-muted-foreground">Advanced Settings</span>
                  </div>
                  {expandedSections.technical ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Aspect Ratio</label>
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

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Duration (1-148 seconds)</label>
                    <div className="space-y-2">
                <Slider
                        value={[describeMaxDuration]}
                        onValueChange={(value) => setDescribeMaxDuration(value[0])}
                  min={1}
                        max={148}
                  step={1}
                        className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1s</span>
                        <span className="font-medium text-foreground">{describeMaxDuration}s (≈ {Math.floor(describeMaxDuration / 60)}m {describeMaxDuration % 60}s)</span>
                  <span>148s</span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
        </Collapsible>
          </TabsContent>

          {/* Mode 3: Multi-Character Scene */}
          <TabsContent value="multi" className="space-y-4 mt-4">
            {/* Title Field */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your scene..."
                className="w-full h-8 text-xs"
              />
      </div>

            {/* Scene Description */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Scene Description <span className="text-red-500">*</span></label>
              <Textarea
                value={sceneDescription}
                onChange={(e) => setSceneDescription(e.target.value)}
                placeholder="Describe the action, mood, and what's happening in this scene..."
                className="min-h-[80px] text-xs resize-none"
              />
            </div>

            {/* Scene Image Selection */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-foreground">Choose Your Scene <span className="text-red-500">*</span></label>
              
              {/* Toggle between Library and Upload */}
              <div className="flex gap-2 mb-3">
                <Button
                  variant={!useCustomSceneImage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseCustomSceneImage(false)}
                  className="text-xs"
                >
                  From Library
                </Button>
                <Button
                  variant={useCustomSceneImage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseCustomSceneImage(true)}
                  className="text-xs"
                >
                  Upload Image
                </Button>
              </div>

              {!useCustomSceneImage ? (
                // Library Selection
                <div className="space-y-3">
                  {loadingAvatars ? (
                    <div className="text-xs text-muted-foreground">Loading avatars...</div>
                  ) : (
                    <Select value={selectedSceneAvatarId} onValueChange={setSelectedSceneAvatarId}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select an avatar..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {availableAvatars.map((avatar) => {
                          const imageUrl = getAvatarImageUrl(avatar)
                          return (
                            <SelectItem key={avatar.id} value={avatar.id} className="text-xs">
                              <div className="flex items-center gap-3">
                                {imageUrl && (
                                  <img 
                                    src={imageUrl} 
                                    alt={avatar.title}
                                    className="w-6 h-6 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <div className="font-medium">{avatar.title}</div>
                                  {(avatar.roleArchetype || avatar.role_archetype) && (
                                    <div className="text-muted-foreground text-xs">{avatar.roleArchetype || avatar.role_archetype}</div>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {selectedSceneAvatarId && (() => {
                    const selectedAvatar = availableAvatars.find(a => a.id === selectedSceneAvatarId)
                    const avatarImageUrl = selectedAvatar ? getAvatarImageUrl(selectedAvatar) : null
                    return (
                      <div className="p-3 bg-muted/30 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {avatarImageUrl ? (
                            <img 
                              src={avatarImageUrl} 
                              alt={selectedAvatar?.title || 'Selected avatar'} 
                              className="w-12 h-12 object-cover rounded border"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/placeholder-avatar.jpg'
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded border bg-muted/50 flex items-center justify-center">
                              <User className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground">
                              {selectedAvatar?.title || 'Unknown Avatar'}
                            </div>
                            {(selectedAvatar?.roleArchetype || selectedAvatar?.role_archetype) && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {selectedAvatar.roleArchetype || selectedAvatar.role_archetype}
                              </div>
                            )}
                            {selectedAvatar?.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {selectedAvatar.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              ) : (
                // Upload Image
                <div>
                  {!sceneImage ? (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <div className="text-sm">
                          <span className="font-medium text-foreground">Upload Scene Image</span>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, JPEG, PNG (max 10MB) - Can include multiple people
                          </p>
                        </div>
                        <Input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleImageUpload}
                          className="hidden"
                          ref={sceneImageInputRef}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => sceneImageInputRef.current?.click()}
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
                          src={sceneImagePreview || ''} 
                          alt="Scene image preview" 
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={removeSceneImage}
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {sceneImage.name} ({(sceneImage.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Number of Characters */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">How many people are in this scene? <span className="text-red-500">*</span></label>
              <Select value={sceneCharacterCount.toString()} onValueChange={(value) => updateSceneCharacterCount(parseInt(value))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select number of characters..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 person</SelectItem>
                  <SelectItem value="2">2 people</SelectItem>
                  <SelectItem value="3">3 people</SelectItem>
                  <SelectItem value="4">4 people</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Characters - Simplified for Mode 3 */}
            {sceneCharacters.map((character, index) => (
              <div key={character.id} className="space-y-2">
                <label className="text-xs font-medium text-foreground">
                  Character {index + 1} - Who is this person?
                </label>
                <Input
                  value={character.name}
                  onChange={(e) => updateSceneCharacter(index, 'name', e.target.value)}
                  placeholder="e.g., Person on the left, Woman in blue, The manager..."
                  className="h-8 text-xs"
                />
              </div>
            ))}

            {/* Conversation / Dialog */}
        <Collapsible 
              open={expandedSections.sceneDialog} 
              onOpenChange={() => toggleSection('sceneDialog')}
        >
        <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" />
                    <span className="text-xs font-medium text-muted-foreground">Conversation / Dialog</span>
            </div>
                  {expandedSections.sceneDialog ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
          <div className="space-y-4">
                  {sceneCharacterCount === 1 ? (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">What do they say?</label>
                      <Textarea
                        value={sceneDialogLines.length > 0 ? sceneDialogLines[0]?.text || '' : ''}
                        onChange={(e) => {
                          if (sceneDialogLines.length === 0) {
                            addSceneDialogLine()
                          }
                          updateSceneDialogLine(sceneDialogLines[0]?.id || '', 'text', e.target.value)
                        }}
                        placeholder="Enter the exact words they should speak..."
                        className="min-h-[80px] text-xs resize-none"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-foreground">Turn-by-turn conversation</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addSceneDialogLine}
                          className="text-xs h-6"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Dialog Line
                        </Button>
            </div>

                      {sceneDialogLines.map((line, index) => (
                        <div key={line.id} className="p-3 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">Line {index + 1}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveSceneDialogLine(line.id, 'up')}
                                disabled={index === 0}
                                className="h-6 w-6 p-0"
                              >
                                <ChevronUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveSceneDialogLine(line.id, 'down')}
                                disabled={index === sceneDialogLines.length - 1}
                                className="h-6 w-6 p-0"
                              >
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSceneDialogLine(line.id)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-foreground">Who's speaking?</label>
                              <Select 
                                value={line.characterId} 
                                onValueChange={(value) => updateSceneDialogLine(line.id, 'characterId', value)}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Select character..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {sceneCharacters.map((char, idx) => (
                                    <SelectItem key={char.id} value={char.id}>
                                      Character {idx + 1} {char.name && `- ${char.name}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-foreground">What do they say?</label>
                              <Textarea
                                value={line.text}
                                onChange={(e) => updateSceneDialogLine(line.id, 'text', e.target.value)}
                                placeholder="Enter the exact words they should speak..."
                                className="min-h-[60px] text-xs resize-none"
              />
            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-medium text-foreground">Expression for this line</label>
                              <Select 
                                value={line.expression} 
                                onValueChange={(value) => updateSceneDialogLine(line.id, 'expression', value)}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Select expression..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="happy">Happy</SelectItem>
                                  <SelectItem value="serious">Serious</SelectItem>
                                  <SelectItem value="excited">Excited</SelectItem>
                                  <SelectItem value="calm">Calm</SelectItem>
                                  <SelectItem value="confident">Confident</SelectItem>
                                  <SelectItem value="friendly">Friendly</SelectItem>
                                  <SelectItem value="concerned">Concerned</SelectItem>
                                  <SelectItem value="surprised">Surprised</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Environment */}
            <Collapsible 
              open={expandedSections.sceneEnvironment} 
              onOpenChange={() => toggleSection('sceneEnvironment')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs font-medium text-muted-foreground">Environment</span>
                  </div>
                  {expandedSections.sceneEnvironment ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Where does this happen?</label>
                    <Select value={sceneEnvironment} onValueChange={setSceneEnvironment}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select setting..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="outdoors">Outdoors</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="coffee-shop">Coffee Shop</SelectItem>
                        <SelectItem value="park">Park</SelectItem>
                        <SelectItem value="beach">Beach</SelectItem>
                        <SelectItem value="city-street">City Street</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="classroom">Classroom</SelectItem>
                        <SelectItem value="hospital">Hospital</SelectItem>
                        <SelectItem value="gym">Gym</SelectItem>
                        <SelectItem value="library">Library</SelectItem>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="airport">Airport</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {sceneEnvironment === 'custom' && (
                      <Input
                        value={customSceneEnvironment}
                        onChange={(e) => setCustomSceneEnvironment(e.target.value)}
                        placeholder="Describe the setting..."
                        className="h-8 text-xs"
                      />
                    )}
            </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Background</label>
                    <Select value={sceneBackground} onValueChange={setSceneBackground}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select background..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="vintage">Vintage</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="natural">Natural</SelectItem>
                        <SelectItem value="urban">Urban</SelectItem>
                        <SelectItem value="abstract">Abstract</SelectItem>
                        <SelectItem value="colorful">Colorful</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="dramatic">Dramatic</SelectItem>
                        <SelectItem value="soft">Soft</SelectItem>
                        <SelectItem value="bright">Bright</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {sceneBackground === 'custom' && (
                      <Input
                        value={customSceneBackground}
                        onChange={(e) => setCustomSceneBackground(e.target.value)}
                        placeholder="Describe the background..."
                        className="h-8 text-xs"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Lighting</label>
                    <Select value={sceneLighting} onValueChange={setSceneLighting}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select lighting..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="natural">Natural</SelectItem>
                        <SelectItem value="bright">Bright</SelectItem>
                        <SelectItem value="soft">Soft</SelectItem>
                        <SelectItem value="dramatic">Dramatic</SelectItem>
                        <SelectItem value="warm">Warm</SelectItem>
                        <SelectItem value="cool">Cool</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="golden-hour">Golden Hour</SelectItem>
                        <SelectItem value="blue-hour">Blue Hour</SelectItem>
                        <SelectItem value="moody">Moody</SelectItem>
                        <SelectItem value="harsh">Harsh</SelectItem>
                        <SelectItem value="dim">Dim</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {sceneLighting === 'custom' && (
                      <Input
                        value={customSceneLighting}
                        onChange={(e) => setCustomSceneLighting(e.target.value)}
                        placeholder="Describe the lighting..."
                        className="h-8 text-xs"
                      />
                    )}
            </div>
          </div>
        </CollapsibleContent>
        </Collapsible>

            {/* Audio & Effects */}
            <Collapsible 
              open={expandedSections.sceneAudioEffects} 
              onOpenChange={() => toggleSection('sceneAudioEffects')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Music className="h-3 w-3" />
                    <span className="text-xs font-medium text-muted-foreground">Audio & Effects</span>
                  </div>
                  {expandedSections.sceneAudioEffects ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Background Music</label>
                    <Select value={sceneBackgroundMusic} onValueChange={setSceneBackgroundMusic}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select background music..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upbeat">Upbeat</SelectItem>
                        <SelectItem value="calm">Calm</SelectItem>
                        <SelectItem value="dramatic">Dramatic</SelectItem>
                        <SelectItem value="romantic">Romantic</SelectItem>
                        <SelectItem value="energetic">Energetic</SelectItem>
                        <SelectItem value="peaceful">Peaceful</SelectItem>
                        <SelectItem value="mysterious">Mysterious</SelectItem>
                        <SelectItem value="inspiring">Inspiring</SelectItem>
                        <SelectItem value="melancholic">Melancholic</SelectItem>
                        <SelectItem value="playful">Playful</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="ambient">Ambient</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {sceneBackgroundMusic === 'custom' && (
                      <Input
                        value={customSceneBackgroundMusic}
                        onChange={(e) => setCustomSceneBackgroundMusic(e.target.value)}
                        placeholder="Describe the background music..."
                        className="h-8 text-xs"
                      />
                    )}
      </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Sound Effects</label>
                    <Select value={sceneSoundEffects} onValueChange={setSceneSoundEffects}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select sound effects..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nature">Nature Sounds</SelectItem>
                        <SelectItem value="city">City Sounds</SelectItem>
                        <SelectItem value="office">Office Sounds</SelectItem>
                        <SelectItem value="applause">Applause</SelectItem>
                        <SelectItem value="door">Door Sounds</SelectItem>
                        <SelectItem value="phone">Phone Ringing</SelectItem>
                        <SelectItem value="footsteps">Footsteps</SelectItem>
                        <SelectItem value="wind">Wind</SelectItem>
                        <SelectItem value="rain">Rain</SelectItem>
                        <SelectItem value="birds">Birds Chirping</SelectItem>
                        <SelectItem value="traffic">Traffic</SelectItem>
                        <SelectItem value="cafe">Cafe Sounds</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {sceneSoundEffects === 'custom' && (
                      <Input
                        value={customSceneSoundEffects}
                        onChange={(e) => setCustomSceneSoundEffects(e.target.value)}
                        placeholder="Describe the sound effects..."
                        className="h-8 text-xs"
                      />
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Technical */}
            <Collapsible 
              open={expandedSections.technical} 
              onOpenChange={() => toggleSection('technical')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Settings className="h-3 w-3" />
                    <span className="text-xs font-medium text-muted-foreground">Advanced Settings</span>
                  </div>
                  {expandedSections.technical ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Aspect Ratio</label>
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

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Duration (1-148 seconds)</label>
                    <div className="space-y-2">
                      <Slider
                        value={[multiMaxDuration]}
                        onValueChange={(value) => setMultiMaxDuration(value[0])}
                        min={1}
                        max={148}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1s</span>
                        <span className="font-medium text-foreground">{multiMaxDuration}s (≈ {Math.floor(multiMaxDuration / 60)}m {multiMaxDuration % 60}s)</span>
                        <span>148s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>
        </Tabs>

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
              {getGenerateButtonText()}
            </>
          )}
        </Button>
      </div>

      {/* Previous Generations */}
      <PreviousGenerations contentType="talking_avatars" userId={user?.id || ''} className="mt-8" />
    </div>
  )
}