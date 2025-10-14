"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Music, 
  Play, 
  Pause, 
  Sparkles,
  X,
  Save,
  ChevronDown,
  ChevronRight,
  Plus,
  RefreshCw,
  Expand,
  Mic,
  Edit3,
  Check,
  Upload,
  Undo,
  Redo,
  Copy,
  Trash2,
  Brush,
  Users,
  User,
  UserCheck,
  Zap,
  Settings,
  Info,
  Lightbulb,
  Target,
  Volume2,
  VolumeX,
  Clock,
  FileAudio
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"
import { filterFilledFields } from "@/lib/utils/prompt-builder"
import { PreviousGenerations } from "@/components/ui/previous-generations"

interface MusicJingleGeneratorInterfaceProps {
  onClose: () => void
  projectTitle?: string
}

interface GeneratedMusic {
  id: string
  title: string
  duration: number
  currentTime: number
  isPlaying: boolean
  waveform: number[]
}

// Model configurations
const MODEL_CONFIGS = {
  V3_5: { name: "V3.5", badge: "", duration: "Up to 4 min", description: "Solid arrangements with creative diversity" },
  V4: { name: "V4", badge: "", duration: "Up to 4 min", description: "Best audio quality with refined song structure" },
  V4_5: { name: "V4.5", badge: "ENHANCED", duration: "Up to 8 min", description: "Superior genre blending with smarter prompts" },
  V4_5PLUS: { name: "V4.5+", badge: "PLUS", duration: "Up to 8 min", description: "Richer sound, new ways to create" },
  V5: { name: "V5", badge: "NEW", duration: "Up to 8 min", description: "Superior musical expression, faster generation" }
}

// Character limits by model (based on Suno API documentation)
const getCharacterLimits = (model: string) => ({
  title: ['V3_5', 'V4'].includes(model) ? 80 : 100,
  prompt: ['V3_5', 'V4'].includes(model) ? 3000 : 5000,
  style: ['V3_5', 'V4'].includes(model) ? 200 : 1000,
  // For non-custom mode, prompt is limited to 500 characters
  promptSimple: 500
})

// Style Tags organized by categories
const STYLE_CATEGORIES = {
  genres: {
    icon: "🎵",
    label: "Genres",
    tags: ["pop", "rock", "electronic", "jazz", "classical", "hip-hop", "r&b", "country", "blues", "reggae", "funk", "soul", "disco", "punk", "metal", "folk", "indie", "alternative", "k-pop", "latin", "world"]
  },
  moods: {
    icon: "🎭",
    label: "Moods",
    tags: ["upbeat", "calm", "energetic", "powerful", "mysterious", "romantic", "melancholic", "happy", "sad", "angry", "peaceful", "dramatic", "playful", "serious", "nostalgic", "hopeful", "dark", "bright", "intense", "relaxed"]
  },
  tempo: {
    icon: "⏱️",
    label: "Tempo",
    tags: ["slow tempo", "moderate tempo", "fast tempo", "very slow", "very fast", "medium tempo", "ballad tempo", "dance tempo", "march tempo", "waltz tempo"]
  },
  instruments: {
    icon: "🎹",
    label: "Instruments",
    tags: ["piano", "guitar", "orchestral", "acoustic", "synthetic", "strings", "brass", "woodwinds", "drums", "bass", "violin", "cello", "trumpet", "saxophone", "flute", "organ", "synth", "electric guitar", "acoustic guitar", "bass guitar"]
  },
  vocals: {
    icon: "🎤",
    label: "Vocals",
    tags: ["female vocals", "male vocals", "instrumental", "choir", "harmony", "solo vocals", "duet", "group vocals", "backing vocals", "lead vocals", "falsetto", "baritone", "tenor", "alto", "soprano"]
  },
  usecase: {
    icon: "🎬",
    label: "Use Case",
    tags: ["commercial", "cinematic", "ambient", "corporate", "game", "trailer", "background", "foreground", "jingle", "theme song", "background music", "elevator music", "study music", "workout music", "meditation", "party", "wedding", "funeral"]
  }
}

// Prompt templates
const PROMPT_TEMPLATES = [
  "Upbeat commercial jingle with catchy melody",
  "Cinematic orchestral piece, epic and powerful",
  "Chill lofi hip-hop beats for studying",
  "Energetic rock anthem with electric guitar",
  "Peaceful acoustic guitar for relaxation",
  "Electronic dance track with heavy bass",
  "Jazz piano trio with smooth saxophone",
  "Ambient soundscape for meditation",
  "Corporate background music, professional",
  "Game soundtrack, adventurous and heroic"
]

// Legacy style tags for backward compatibility
const STYLE_TAGS = Object.values(STYLE_CATEGORIES).flatMap(category => category.tags)

export function MusicJingleGeneratorInterface({ onClose, projectTitle }: MusicJingleGeneratorInterfaceProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  
  // Core State
  const [description, setDescription] = useState("")
  const [title, setTitle] = useState("")
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  
  // New Suno v5 State
  const [selectedModel, setSelectedModel] = useState<'V3_5' | 'V4' | 'V4_5' | 'V4_5PLUS' | 'V5'>('V5')
  const [audioAction, setAudioAction] = useState<'generate' | 'cover' | 'extend' | 'add_instrumental' | 'add_vocals'>('generate')
  const [vocalGender, setVocalGender] = useState<'m' | 'f' | 'auto'>('auto')
  const [styleWeight, setStyleWeight] = useState([0.65])
  const [weirdnessConstraint, setWeirdnessConstraint] = useState([0.65])
  const [audioWeight, setAudioWeight] = useState([0.65])
  const [negativeTags, setNegativeTags] = useState<string[]>([])
  const [isInstrumental, setIsInstrumental] = useState(false)
  const [customMode, setCustomMode] = useState(false)
  const [style, setStyle] = useState("")
  
  // Advanced Settings
  const [showStyles, setShowStyles] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isSimpleMode, setIsSimpleMode] = useState(true)
  const [showAudioMenu, setShowAudioMenu] = useState(false)
  const [audioUploaded, setAudioUploaded] = useState(false)
  const [uploadedAudioFile, setUploadedAudioFile] = useState<File | null>(null)
  const [audioFileName, setAudioFileName] = useState("")
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0)
  const [recordingDuration, setRecordingDuration] = useState<number>(0)
  const [waveformAnimation, setWaveformAnimation] = useState<number>(0)
  const [duration, setDuration] = useState([30])
  const [volume, setVolume] = useState([80])
  const [fadeIn, setFadeIn] = useState([0])
  const [fadeOut, setFadeOut] = useState([0])
  const [loopMode, setLoopMode] = useState(false)
  const [stereoMode, setStereoMode] = useState(true)
  
  // Generation & Playback
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMusic, setGeneratedMusic] = useState<GeneratedMusic | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)

  // Close audio menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAudioMenu) {
        const target = event.target as Element
        if (!target.closest('.audio-menu-container')) {
          setShowAudioMenu(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAudioMenu])

  // Cleanup audio URL and recording when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current?.src) {
        URL.revokeObjectURL(audioRef.current.src)
      }
      // Stop recording if active
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop()
      }
    }
  }, [mediaRecorder, isRecording])

  // Update recording duration while recording
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isRecording && recordingStartTime > 0) {
      interval = setInterval(() => {
        setRecordingDuration((Date.now() - recordingStartTime) / 1000)
        setWaveformAnimation(Date.now()) // Trigger waveform animation
      }, 100) // Update every 100ms
    }
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRecording, recordingStartTime])

  // Helper functions
  const getCharacterCount = (text: string, field: 'title' | 'prompt' | 'style') => {
    const limits = getCharacterLimits(selectedModel)
    
    // For prompt field, use different limits based on mode
    if (field === 'prompt') {
      const limit = isSimpleMode ? limits.promptSimple : limits.prompt
      return { current: text.length, limit }
    }
    
    return { current: text.length, limit: limits[field] }
  }

  const getCharacterCountColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100
    if (percentage >= 95) return "text-red-500"
    if (percentage >= 80) return "text-orange-500"
    return "text-muted-foreground"
  }

  const getSmartSuggestions = (text: string) => {
    const suggestions: string[] = []
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('happy') || lowerText.includes('cheerful')) {
      suggestions.push('upbeat', 'pop', 'cheerful')
    }
    if (lowerText.includes('intense') || lowerText.includes('powerful')) {
      suggestions.push('rock', 'electronic', 'fast tempo')
    }
    if (lowerText.includes('background') || lowerText.includes('ambient')) {
      suggestions.push('ambient', 'instrumental', 'subtle')
    }
    if (lowerText.includes('sad') || lowerText.includes('melancholic')) {
      suggestions.push('melancholic', 'slow tempo', 'minor key')
    }
    if (lowerText.includes('dance') || lowerText.includes('party')) {
      suggestions.push('electronic', 'fast tempo', 'dance')
    }
    
    return suggestions.filter(s => !selectedStyles.includes(s))
  }

  // Style management functions
  const addStyle = (style: string) => {
    if (!selectedStyles.includes(style)) {
      setSelectedStyles([...selectedStyles, style])
    }
  }

  const removeStyle = (style: string) => {
    setSelectedStyles(selectedStyles.filter(s => s !== style))
  }

  const addNegativeTag = (tag: string) => {
    if (!negativeTags.includes(tag)) {
      setNegativeTags([...negativeTags, tag])
    }
  }

  const removeNegativeTag = (tag: string) => {
    setNegativeTags(negativeTags.filter(t => t !== tag))
  }

  const insertTemplate = (template: string) => {
    setDescription(template)
  }

  // Validation functions
  const validateCharacterLimits = () => {
    const errors: string[] = []
    const limits = getCharacterLimits(selectedModel)
    
    // Check title limit
    if (title.length > limits.title) {
      errors.push(`Title exceeds ${limits.title} character limit (${title.length}/${limits.title})`)
    }
    
    // Check prompt/description limit based on mode
    const promptLimit = isSimpleMode ? limits.promptSimple : limits.prompt
    if (description.length > promptLimit) {
      errors.push(`Description exceeds ${promptLimit} character limit (${description.length}/${promptLimit})`)
    }
    
    // Check style limit (if style field exists)
    if (style && style.length > limits.style) {
      errors.push(`Style exceeds ${limits.style} character limit (${style.length}/${limits.style})`)
    }
    
    return errors
  }

  const truncateToLimit = (text: string, field: 'title' | 'prompt' | 'style') => {
    const limits = getCharacterLimits(selectedModel)
    let limit: number
    
    if (field === 'prompt') {
      limit = isSimpleMode ? limits.promptSimple : limits.prompt
    } else {
      limit = limits[field]
    }
    
    return text.length > limit ? text.substring(0, limit) : text
  }

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return "00:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Check if audio format is supported
  const isAudioFormatSupported = (file: File): boolean => {
    const supportedTypes = [
      'audio/mpeg',      // MP3
      'audio/mp3',       // MP3
      'audio/wav',       // WAV
      'audio/wave',      // WAV
      'audio/x-wav',     // WAV
      'audio/ogg',       // OGG
      'audio/mp4',       // M4A
      'audio/aac',       // AAC
      'audio/webm',      // WebM
      'audio/flac'       // FLAC
    ]
    
    return supportedTypes.includes(file.type.toLowerCase())
  }

  // Check if MediaRecorder supports specific MIME types
  const getSupportedMimeType = (): string => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ]
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log("Using MIME type:", type)
        return type
      }
    }
    
    console.log("No specific MIME type supported, using default")
    return ''
  }

  // Start audio recording
  const startRecording = async () => {
    try {
      console.log("Starting audio recording...")
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      // Get supported MIME type
      const mimeType = getSupportedMimeType()
      
      // Create MediaRecorder with supported MIME type
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      
      const chunks: Blob[] = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      recorder.onstop = () => {
        console.log("Recording stopped, processing audio...")
        
        // Create blob from recorded chunks with the same MIME type used for recording
        const recordedBlob = new Blob(chunks, { type: mimeType || 'audio/webm' })
        
        // Determine file extension based on MIME type
        let extension = 'webm'
        let fileName = 'Recording'
        
        if (mimeType.includes('mp4')) {
          extension = 'mp4'
          fileName = 'Recording'
        } else if (mimeType.includes('ogg')) {
          extension = 'ogg'
          fileName = 'Recording'
        } else if (mimeType.includes('wav')) {
          extension = 'wav'
          fileName = 'Recording'
        }
        
        // Create a File object from the blob
        const recordedFile = new File([recordedBlob], `${fileName}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${extension}`, {
          type: mimeType || 'audio/webm'
        })
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
        
        // Set the recorded file as uploaded audio
        setUploadedAudioFile(recordedFile)
        setAudioFileName(recordedFile.name)
        setAudioUploaded(true)
        setShowAudioMenu(false)
        setIsPlaying(false)
        setCurrentTime(0)
        setRecordedChunks([])
        
        // Load metadata for the recorded audio
        const audioUrl = URL.createObjectURL(recordedFile)
        const tempAudio = new Audio(audioUrl)
        
        tempAudio.addEventListener('loadedmetadata', () => {
          console.log("Recorded audio metadata loaded, duration:", tempAudio.duration)
          setAudioDuration(tempAudio.duration)
          URL.revokeObjectURL(audioUrl)
        })
        
        tempAudio.addEventListener('error', (e) => {
          console.error("Error loading recorded audio metadata:", e)
          console.error("Audio error details:", {
            error: e,
            networkState: tempAudio.networkState,
            readyState: tempAudio.readyState,
            src: tempAudio.src,
            mimeType: mimeType
          })
          setAudioDuration(0)
          URL.revokeObjectURL(audioUrl)
          
          toast({
            title: "Audio playback issue",
            description: "The recorded audio format may not be fully supported. Try uploading an MP3 or WAV file instead.",
            variant: "destructive"
          })
        })
        
        tempAudio.load()
        
        toast({
          title: "Recording completed",
          description: `Audio recorded successfully: ${recordedFile.name}`,
        })
      }
      
      recorder.onerror = (event) => {
        console.error("Recording error:", event)
        toast({
          title: "Recording error",
          description: "An error occurred during recording.",
          variant: "destructive"
        })
        setIsRecording(false)
        stream.getTracks().forEach(track => track.stop())
      }
      
      // Start recording
      recorder.start(100) // Collect data every 100ms
      setMediaRecorder(recorder)
      setRecordedChunks(chunks)
      setIsRecording(true)
      setRecordingStartTime(Date.now())
      setRecordingDuration(0)
      
      toast({
        title: "Recording started",
        description: "Click 'Stop Recording' when finished.",
      })
      
    } catch (error) {
      console.error("Error starting recording:", error)
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      })
    }
  }

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      console.log("Stopping recording...")
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
      setRecordingStartTime(0)
      setRecordingDuration(0)
      setWaveformAnimation(0)
    }
  }

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("File uploaded:", {
        name: file.name,
        type: file.type,
        size: file.size
      })
      
      // Vérifier que c'est un fichier audio et que le format est supporté
      if (file.type.startsWith('audio/') && isAudioFormatSupported(file)) {
        // Cleanup previous audio URL if exists
        if (audioRef.current?.src) {
          URL.revokeObjectURL(audioRef.current.src)
        }
        
        setUploadedAudioFile(file)
        setAudioFileName(file.name)
        setAudioUploaded(true)
        setShowAudioMenu(false)
        setIsPlaying(false) // Reset playing state
        setCurrentTime(0) // Reset current time
        
        // Load audio metadata to get duration
        const audioUrl = URL.createObjectURL(file)
        console.log("Created audio URL for metadata:", audioUrl)
        const tempAudio = new Audio(audioUrl)
        
        tempAudio.addEventListener('loadedmetadata', () => {
          console.log("Metadata loaded successfully, duration:", tempAudio.duration)
          setAudioDuration(tempAudio.duration)
          URL.revokeObjectURL(audioUrl) // Clean up temp URL
        })
        
        tempAudio.addEventListener('error', (e) => {
          console.error("Error loading audio metadata:", e)
          console.error("Audio error details:", {
            error: e,
            networkState: tempAudio.networkState,
            readyState: tempAudio.readyState,
            src: tempAudio.src
          })
          setAudioDuration(0)
          URL.revokeObjectURL(audioUrl) // Clean up temp URL
          
          toast({
            title: "Audio format not supported",
            description: "This audio file format is not supported by your browser.",
            variant: "destructive"
          })
        })
        
        // Load the audio to get metadata
        tempAudio.load()
        
        toast({
          title: "Audio uploaded successfully",
          description: `File: ${file.name}`,
        })
      } else if (file.type.startsWith('audio/')) {
        toast({
          title: "Audio format not supported",
          description: `The format "${file.type}" is not supported. Please use MP3, WAV, OGG, or M4A files.`,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file.",
          variant: "destructive"
        })
      }
    }
  }

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please describe the music you want to create.",
        variant: "destructive"
      })
      return
    }

    // Validate character limits before sending to API
    const validationErrors = validateCharacterLimits()
    if (validationErrors.length > 0) {
      toast({
        title: "Character limit exceeded",
        description: validationErrors.join(". "),
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      // Collect all creative fields
      const allFields = {
        title: title ? truncateToLimit(title, 'title') : undefined,
        style: style ? truncateToLimit(style, 'style') : undefined,
        customMode: !isSimpleMode,
        instrumental: isInstrumental,
        model: selectedModel,
        vocalGender: !isInstrumental ? vocalGender : undefined,
        styleWeight: styleWeight[0],
        weirdnessConstraint: weirdnessConstraint[0],
        audioWeight: audioUploaded ? audioWeight[0] : undefined,
        negativeTags: negativeTags.length > 0 ? negativeTags.join(', ') : undefined,
        audioAction: audioUploaded ? audioAction : undefined,
        uploadUrl: audioUploaded && uploadedAudioFile ? 'uploaded_audio_url' : undefined
      }

      // Filter to only filled fields
      const filledFields = filterFilledFields(allFields)

      // Prepare data for Suno API with proper character limits
      const apiData = {
        // Core parameters
        prompt: truncateToLimit(description, 'prompt'),
        title: title ? truncateToLimit(title, 'title') : undefined,
        style: style ? truncateToLimit(style, 'style') : undefined,
        
        // Mode settings
        customMode: !isSimpleMode,
        instrumental: isInstrumental,
        model: selectedModel,
        
        // Advanced parameters (V5)
        vocalGender: !isInstrumental ? vocalGender : undefined,
        styleWeight: styleWeight[0],
        weirdnessConstraint: weirdnessConstraint[0],
        audioWeight: audioUploaded ? audioWeight[0] : undefined,
        negativeTags: negativeTags.length > 0 ? negativeTags.join(', ') : undefined,
        
        // Audio action (if audio uploaded)
        audioAction: audioUploaded ? audioAction : undefined,
        uploadUrl: audioUploaded && uploadedAudioFile ? 'uploaded_audio_url' : undefined,
        
        // Callback URL for async processing
        callBackUrl: `${window.location.origin}/api/suno/callback`
      }

      console.log('Sending to Suno API:', apiData)

      // Show generation stages with realistic timing
      const stages = [
        { message: "Analyzing prompt...", duration: 1000 },
        { message: "Generating composition...", duration: 2000 },
        { message: "Rendering audio...", duration: 1500 },
        { message: "Finalizing...", duration: 500 }
      ]

      for (const stage of stages) {
        toast({
          title: stage.message,
          description: "Please wait while we create your music...",
        })
        await new Promise(resolve => setTimeout(resolve, stage.duration))
      }
      
      // Mock generated music with Suno v5 parameters
      const mockMusic: GeneratedMusic = {
        id: "generated_music_1",
        title: title || "Generated Music",
        duration: duration[0],
        currentTime: 0,
        isPlaying: false,
        waveform: Array.from({ length: 100 }, () => Math.random() * 100)
      }
      
      setGeneratedMusic(mockMusic)
      toast({
        title: "Music generated successfully!",
        description: `Your ${MODEL_CONFIGS[selectedModel].name} music is ready to play and customize.`
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Please try again or check your connection.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlayPause = async () => {
    console.log("handlePlayPause called", { uploadedAudioFile: !!uploadedAudioFile, isPlaying })
    
    if (!uploadedAudioFile) {
      console.log("No audio file uploaded")
      toast({
        title: "No audio file",
        description: "Please upload an audio file first.",
        variant: "destructive"
      })
      return
    }

    if (isPlaying) {
      console.log("Pausing audio")
      setIsPlaying(false)
      audioRef.current?.pause()
    } else {
      try {
        console.log("Attempting to play audio")
        // Create object URL for the uploaded file and play it
        if (audioRef.current) {
          // Clean up previous URL if exists
          if (audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
            console.log("Cleaning up previous URL")
            URL.revokeObjectURL(audioRef.current.src)
          }
          
          const audioUrl = URL.createObjectURL(uploadedAudioFile)
          console.log("Created audio URL:", audioUrl)
          audioRef.current.src = audioUrl
          
          // Wait for the audio to be ready and play
          console.log("Attempting to play...")
          
          // Add a small delay to ensure the audio element is ready
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // For recorded audio, try to load it first
          if (uploadedAudioFile.name.includes('Recording')) {
            console.log("Playing recorded audio, ensuring it's loaded...")
            
            // Wait for the audio to be ready
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error("Audio loading timeout"))
              }, 5000)
              
              audioRef.current!.addEventListener('canplaythrough', () => {
                clearTimeout(timeout)
                resolve(void 0)
              }, { once: true })
              
              audioRef.current!.addEventListener('error', () => {
                clearTimeout(timeout)
                reject(new Error("Audio loading failed"))
              }, { once: true })
              
              audioRef.current!.load()
            })
          }
          
          await audioRef.current.play()
          console.log("Audio started playing successfully")
          setIsPlaying(true)
        } else {
          console.error("Audio element not available")
          throw new Error("Audio element not available")
        }
      } catch (error) {
        console.error("Error playing audio:", error)
        setIsPlaying(false)
        
        // More specific error messages
        let errorMessage = "Could not play the audio file."
        if (error instanceof Error) {
          console.log("Error name:", error.name, "Error message:", error.message)
          if (error.name === 'NotAllowedError') {
            errorMessage = "Audio playback was blocked. Please interact with the page first."
          } else if (error.name === 'NotSupportedError') {
            errorMessage = "This audio format is not supported."
          } else if (error.name === 'AbortError') {
            errorMessage = "Audio playback was interrupted."
          } else {
            errorMessage = `Error: ${error.message}`
          }
        }
        
        console.log("Showing error toast:", errorMessage)
        // Only show toast if we have a meaningful error message
        if (errorMessage && errorMessage !== "Could not play the audio file.") {
          toast({
            title: "Playback error",
            description: errorMessage,
            variant: "destructive"
          })
        } else {
          console.log("Skipping toast - no meaningful error message")
        }
      }
    }
  }

  const handleSaveMusic = async () => {
    if (!generatedMusic) {
      toast({
        title: "No music to save",
        description: "Please generate music first.",
        variant: "destructive"
      })
      return
    }

    try {
      const musicData = {
        title: title || generatedMusic.title,
        description,
        styles: selectedStyles,
        duration: duration[0],
        volume: volume[0],
        fade_in: fadeIn[0],
        fade_out: fadeOut[0],
        loop_mode: loopMode,
        stereo_mode: stereoMode,
        created_at: new Date().toISOString()
      }

      // API call to save music
      const response = await fetch('/api/music-jingles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(musicData)
      })

      if (response.ok) {
        toast({
          title: "Music saved successfully!",
          description: `Music '${title || generatedMusic.title}' is now part of your DreamCut Music Library.`
        })
        onClose()
      } else {
        throw new Error('Failed to save music')
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-1">
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setAudioDuration(audioRef.current.duration)
          }
        }}
        onError={(e) => {
          console.error("Audio element error:", e)
          console.error("Audio error details:", {
            error: e,
            currentSrc: audioRef.current?.currentSrc,
            networkState: audioRef.current?.networkState,
            readyState: audioRef.current?.readyState
          })
          setIsPlaying(false)
          toast({
            title: "Audio error",
            description: "There was an error loading the audio file.",
            variant: "destructive"
          })
        }}
        preload="metadata"
        controls={false}
      />
      
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[calc(100vh-1rem)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center gap-4">
            <Music className="h-4 w-4" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSimpleMode(true)}
                className={`text-sm px-2 py-1 rounded transition-colors ${
                  isSimpleMode 
                    ? 'font-medium bg-muted text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setIsSimpleMode(false)}
                className={`text-sm px-2 py-1 rounded transition-colors ${
                  !isSimpleMode 
                    ? 'font-medium bg-muted text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Custom
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as any)}>
                <SelectTrigger className="w-auto h-8 text-sm border-0 bg-transparent focus:ring-0 cursor-pointer">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{MODEL_CONFIGS[selectedModel].name}</span>
                      {MODEL_CONFIGS[selectedModel].badge && (
                        <Badge variant="default" className="text-xs bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white">
                          {MODEL_CONFIGS[selectedModel].badge}
                        </Badge>
                      )}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MODEL_CONFIGS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{config.name}</span>
                        {config.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {config.badge}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {config.duration}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="text-xs">
                {MODEL_CONFIGS[selectedModel].duration}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(100vh-6rem)] p-4 space-y-3 scrollbar-hover">
          
          {isSimpleMode ? (
            // Simple Mode Content
            <>
              {/* Prompt Templates */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Need inspiration?</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PROMPT_TEMPLATES.slice(0, 4).map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="h-auto p-2 text-xs text-left justify-start"
                      onClick={() => insertTemplate(template)}
                    >
                      {template}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Describe your song</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${getCharacterCountColor(getCharacterCount(description, 'prompt').current, getCharacterCount(description, 'prompt').limit)}`}>
                      {getCharacterCount(description, 'prompt').current} / {getCharacterCount(description, 'prompt').limit}
                    </span>
                    <Expand className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <Textarea
                  value={description}
                  onChange={(e) => {
                    const newValue = e.target.value
                    const limits = getCharacterLimits(selectedModel)
                    const maxLength = isSimpleMode ? limits.promptSimple : limits.prompt
                    
                    if (newValue.length <= maxLength) {
                      setDescription(newValue)
                    } else {
                      // Show warning but don't prevent typing
                      toast({
                        title: "Character limit warning",
                        description: `You're approaching the ${maxLength} character limit.`,
                        variant: "destructive"
                      })
                    }
                  }}
                  placeholder="Describe the music you want to create..."
                  className="min-h-[80px] text-sm resize-none border-0 bg-muted/30 focus:bg-muted/50 transition-colors"
                />
                
                {/* Smart Suggestions */}
                {description && getSmartSuggestions(description).length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Suggested styles:</span>
                    <div className="flex flex-wrap gap-1">
                      {getSmartSuggestions(description).slice(0, 3).map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => addStyle(suggestion)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input Options */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => setAudioUploaded(false)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Audio
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`h-7 text-xs ${!isInstrumental ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => setIsInstrumental(false)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Lyrics
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`h-7 text-xs ${isInstrumental ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => setIsInstrumental(true)}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Instrumental
                </Button>
              </div>

              {/* Inspiration Section */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Inspiration</span>
                <Textarea
                  placeholder="Add inspiration or reference..."
                  className="min-h-[60px] text-sm resize-none border-0 bg-muted/30 focus:bg-muted/50 transition-colors"
                />
              </div>

              {/* Generation Preview & Button */}
              <div className="space-y-3 pt-4 border-t">
                {/* Generation Preview Card */}
                <div className="p-3 bg-muted/20 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Generation Preview</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Model:</div>
                      <div className="font-medium">{MODEL_CONFIGS[selectedModel].name} {MODEL_CONFIGS[selectedModel].badge && `(${MODEL_CONFIGS[selectedModel].badge})`}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Duration:</div>
                      <div className="font-medium">{MODEL_CONFIGS[selectedModel].duration}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Type:</div>
                      <div className="font-medium">{isInstrumental ? 'Instrumental' : 'With Vocals'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Mode:</div>
                      <div className="font-medium">Simple</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Estimated time: ~30 seconds</span>
                    <span className="text-xs text-muted-foreground">Credits: 1</span>
                  </div>
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !description.trim()}
                  className="w-full h-10 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Music
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
             // Custom Mode Content
             <>
                 {/* Navigation Tabs - Always Visible */}
                 <div className="flex gap-2">
                   {isRecording ? (
                     // Recording State - Show Stop Recording button
                     <Button 
                       variant="destructive" 
                       size="sm" 
                       className="h-7 text-xs"
                       onClick={stopRecording}
                     >
                       <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
                       Stop Recording
                     </Button>
                   ) : (
                     // Normal State - Show Audio menu
                     <div className="relative audio-menu-container">
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="h-7 text-xs"
                         onClick={() => setShowAudioMenu(!showAudioMenu)}
                       >
                         <Plus className="h-3 w-3 mr-1" />
                         Audio
                       </Button>
                     
                     {/* Hidden File Input */}
                     <input
                       type="file"
                       accept="audio/*"
                       onChange={handleAudioUpload}
                       className="hidden"
                       id="audio-upload"
                     />
                     
                     {/* Audio Menu Dropdown */}
                     {showAudioMenu && (
                       <div className="absolute top-full left-0 mt-1 w-32 bg-background border border-border rounded-md shadow-lg z-10">
                         <label 
                           htmlFor="audio-upload"
                           className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors cursor-pointer"
                           onClick={(e) => {
                             e.preventDefault()
                             setShowAudioMenu(false)
                             // Trigger the file input
                             document.getElementById('audio-upload')?.click()
                           }}
                         >
                           <Upload className="h-3 w-3" />
                           Upload
                         </label>
                         <button 
                           className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
                           onClick={() => {
                             setShowAudioMenu(false)
                             startRecording()
                           }}
                         >
                           <Mic className="h-3 w-3" />
                           Record
                         </button>
                       </div>
                     )}
                   </div>
                   )}
                   
                   <Button variant="outline" size="sm" className="h-7 text-xs">
                     <Plus className="h-3 w-3 mr-1" />
                     Persona
                   </Button>
                   <Button variant="outline" size="sm" className="h-7 text-xs">
                     <Plus className="h-3 w-3 mr-1" />
                     Inspo
                   </Button>
                 </div>

                 {audioUploaded ? (
                   // Audio Uploaded Interface
                   <>
                     {/* Audio Action Selector */}
                     <div className="space-y-2">
                       <span className="text-sm font-medium">What would you like to do?</span>
                       <div className="grid grid-cols-2 gap-2">
                         <Button
                           variant={audioAction === 'generate' ? 'default' : 'outline'}
                           size="sm"
                           className="h-8 text-xs"
                           onClick={() => setAudioAction('generate')}
                         >
                           <Sparkles className="h-3 w-3 mr-1" />
                           Generate New
                         </Button>
                         <Button
                           variant={audioAction === 'cover' ? 'default' : 'outline'}
                           size="sm"
                           className="h-8 text-xs"
                           onClick={() => setAudioAction('cover')}
                         >
                           <Brush className="h-3 w-3 mr-1" />
                           Cover Audio
                         </Button>
                         <Button
                           variant={audioAction === 'extend' ? 'default' : 'outline'}
                           size="sm"
                           className="h-8 text-xs"
                           onClick={() => setAudioAction('extend')}
                         >
                           <Expand className="h-3 w-3 mr-1" />
                           Extend Audio
                         </Button>
                         <Button
                           variant={audioAction === 'add_instrumental' ? 'default' : 'outline'}
                           size="sm"
                           className="h-8 text-xs"
                           onClick={() => setAudioAction('add_instrumental')}
                         >
                           <Music className="h-3 w-3 mr-1" />
                           Add Instrumental
                         </Button>
                         <Button
                           variant={audioAction === 'add_vocals' ? 'default' : 'outline'}
                           size="sm"
                           className="h-8 text-xs"
                           onClick={() => setAudioAction('add_vocals')}
                         >
                           <Mic className="h-3 w-3 mr-1" />
                           Add Vocals
                         </Button>
                       </div>
                     </div>

                     {/* Audio Player Section */}
                     <div className="space-y-3">
                       {/* Audio Controls */}
                       <div className="flex items-center gap-3">
                         <Button
                           size="sm"
                           variant="ghost"
                           onClick={isRecording ? stopRecording : handlePlayPause}
                           className="h-8 w-8 p-0"
                         >
                           {isRecording ? (
                             <div className="h-4 w-4 rounded-full bg-red-500 animate-pulse" />
                           ) : isPlaying ? (
                             <Pause className="h-4 w-4" />
                           ) : (
                             <Play className="h-4 w-4" />
                           )}
                         </Button>
                         
                         {/* Audio Info */}
                         <div className="flex items-center gap-3 flex-1">
                           <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                             <FileAudio className="h-6 w-6 text-muted-foreground" />
                           </div>
                           <div className="flex-1">
                             <h3 className="text-sm font-medium">
                               {isRecording 
                                 ? "Recording..." 
                                 : (audioFileName || "Uploaded Audio")
                               }
                             </h3>
                             <p className="text-xs text-muted-foreground">
                               {isRecording 
                                 ? `${formatTime(recordingDuration)} / --:--` 
                                 : `${formatTime(currentTime)} / ${formatTime(audioDuration)}`
                               }
                             </p>
                           </div>
                           <Button 
                             size="sm" 
                             variant="ghost" 
                             className="h-6 w-6 p-0"
                             onClick={() => {
                               // Cleanup audio URL
                               if (audioRef.current?.src) {
                                 URL.revokeObjectURL(audioRef.current.src)
                                 audioRef.current.src = ""
                               }
                               
                               setAudioUploaded(false)
                               setUploadedAudioFile(null)
                               setAudioFileName("")
                               setIsPlaying(false)
                               setCurrentTime(0)
                               setAudioDuration(0)
                             }}
                           >
                             <X className="h-3 w-3" />
                           </Button>
                         </div>
                       </div>

                       {/* Waveform */}
                       <div className="h-8 bg-muted/20 rounded-lg p-1">
                         <div className="flex items-center h-full gap-0.5">
                           {Array.from({ length: 50 }, (_, index) => {
                             // Calculate progress based on current time or recording duration
                             const progress = isRecording 
                               ? (recordingDuration / 30) * 50 // Assume max 30 seconds for recording
                               : audioDuration > 0 
                                 ? (currentTime / audioDuration) * 50 
                                 : 0
                             
                             const isActive = index < progress
                             const isRecordingActive = isRecording && index < (recordingDuration / 30) * 50
                             
                             return (
                               <div
                                 key={index}
                                 className={`rounded-sm transition-all duration-100 ${
                                   isRecordingActive 
                                     ? 'bg-red-500' 
                                     : isActive 
                                       ? 'bg-pink-500' 
                                       : 'bg-muted'
                                 }`}
                                 style={{ 
                                   width: '2px', 
                                   height: isRecording 
                                     ? `${(Math.sin((index + waveformAnimation / 100) * 0.5) * 30 + 50)}%` // Animated during recording
                                     : `${Math.random() * 40 + 30}%` // Static when not recording
                                 }}
                               />
                             )
                           })}
                         </div>
                       </div>
                     </div>

                     {/* Lyrics Section */}
                     <div className="space-y-2">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <button
                             onClick={() => setShowLyrics(!showLyrics)}
                             className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors"
                           >
                             <ChevronDown className="h-4 w-4" />
                             Lyrics
                           </button>
                         </div>
                         <div className="flex items-center gap-1">
                           <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                             <Undo className="h-3 w-3" />
                           </Button>
                           <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                             <Redo className="h-3 w-3" />
                           </Button>
                           <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                             <Copy className="h-3 w-3" />
                           </Button>
                           <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                             <Trash2 className="h-3 w-3" />
                           </Button>
                           <Button size="sm" className="h-6 text-xs bg-orange-500 hover:bg-orange-600">
                             <Brush className="h-3 w-3 mr-1" />
                             Edit
                           </Button>
                         </div>
                       </div>
                       
                       <div className="relative">
                         <Textarea
                           defaultValue="[Instrumental]
[Verse 1]
In the
[Chorus]
[Instrumental]
[Verse 2]"
                           className="min-h-[120px] text-sm resize-none border-0 bg-muted/30 focus:bg-muted/50 transition-colors pr-8"
                         />
                         <div className="absolute bottom-2 right-2">
                           <Expand className="h-3 w-3 text-muted-foreground" />
                         </div>
                       </div>
                     </div>

                     {/* Styles Section */}
                     <div className="space-y-2">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <button
                             onClick={() => setShowStyles(!showStyles)}
                             className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors"
                           >
                             {showStyles ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                             Styles
                             {!showStyles && selectedStyles.length > 0 && (
                               <span className="text-xs text-muted-foreground">
                                 • {selectedStyles.length} selected
                               </span>
                             )}
                           </button>
                         </div>
                         <div className="flex items-center gap-1">
                           <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                             <Undo className="h-3 w-3" />
                           </Button>
                           <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                             <Redo className="h-3 w-3" />
                           </Button>
                           <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                             <Copy className="h-3 w-3" />
                           </Button>
                           <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                             <Trash2 className="h-3 w-3" />
                           </Button>
                           <Button size="sm" className="h-6 text-xs bg-orange-500 hover:bg-orange-600">
                             <Brush className="h-3 w-3 mr-1" />
                             Edit
                           </Button>
                         </div>
                       </div>
                       
                       {showStyles && (
                         <div className="space-y-3 p-3 bg-muted/20 rounded-lg">
                           {/* Selected Styles */}
                           {selectedStyles.length > 0 && (
                             <div className="space-y-2">
                               <span className="text-xs font-medium text-muted-foreground">Selected Styles</span>
                               <div className="flex flex-wrap gap-1">
                                 {selectedStyles.map((style) => (
                                   <Badge key={style} variant="default" className="text-xs">
                                     {style}
                                     <button
                                       onClick={() => removeStyle(style)}
                                       className="ml-1 hover:text-destructive"
                                     >
                                       <X className="h-3 w-3" />
                                     </button>
                                   </Badge>
                                 ))}
                               </div>
                             </div>
                           )}

                           {/* Style Categories */}
                           {Object.entries(STYLE_CATEGORIES).map(([key, category]) => (
                             <div key={key} className="space-y-2">
                               <div className="flex items-center gap-2">
                                 <span className="text-sm">{category.icon}</span>
                                 <span className="text-sm font-medium">{category.label}</span>
                               </div>
                               <div className="flex flex-wrap gap-1">
                                 {category.tags.slice(0, 8).map((tag) => (
                                   <Button
                                     key={tag}
                                     variant={selectedStyles.includes(tag) ? "default" : "outline"}
                                     size="sm"
                                     className="h-6 text-xs"
                                     onClick={() => {
                                       if (selectedStyles.includes(tag)) {
                                         removeStyle(tag)
                                       } else {
                                         addStyle(tag)
                                       }
                                     }}
                                   >
                                     {selectedStyles.includes(tag) ? (
                                       <Check className="h-3 w-3 mr-1" />
                                     ) : (
                                       <Plus className="h-3 w-3 mr-1" />
                                     )}
                                     {tag}
                                   </Button>
                                 ))}
                                 {category.tags.length > 8 && (
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     className="h-6 text-xs text-muted-foreground"
                                   >
                                     +{category.tags.length - 8} more
                                   </Button>
                                 )}
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>

                     {/* Advanced Options */}
                     <div className="space-y-2">
                       <div className="flex items-center gap-2">
                         <button
                           onClick={() => setShowAdvanced(!showAdvanced)}
                           className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors"
                         >
                           {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                           Advanced Options
                           {!showAdvanced && (
                             <span className="text-xs text-muted-foreground">
                               • Style: {styleWeight[0]} • Weirdness: {weirdnessConstraint[0]} • Audio: {audioWeight[0]}
                             </span>
                           )}
                         </button>
                       </div>
                       
                       {showAdvanced && (
                         <div className="space-y-4 p-3 bg-muted/20 rounded-lg">
                           {/* Vocal Gender Selection */}
                           {!isInstrumental && (
                             <div className="space-y-2">
                               <div className="flex items-center gap-2">
                                 <Users className="h-4 w-4 text-muted-foreground" />
                                 <span className="text-sm font-medium">Vocal Gender</span>
                               </div>
                               <div className="flex gap-2">
                                 <Button
                                   variant={vocalGender === 'auto' ? 'default' : 'outline'}
                                   size="sm"
                                   className="h-8 text-xs"
                                   onClick={() => setVocalGender('auto')}
                                 >
                                   <UserCheck className="h-3 w-3 mr-1" />
                                   Auto
                                 </Button>
                                 <Button
                                   variant={vocalGender === 'm' ? 'default' : 'outline'}
                                   size="sm"
                                   className="h-8 text-xs"
                                   onClick={() => setVocalGender('m')}
                                 >
                                   <User className="h-3 w-3 mr-1" />
                                   Male
                                 </Button>
                                 <Button
                                   variant={vocalGender === 'f' ? 'default' : 'outline'}
                                   size="sm"
                                   className="h-8 text-xs"
                                   onClick={() => setVocalGender('f')}
                                 >
                                   <User className="h-3 w-3 mr-1" />
                                   Female
                                 </Button>
                               </div>
                             </div>
                           )}

                           {/* Style Weight */}
                           <div className="space-y-2">
                             <div className="flex items-center gap-2">
                               <Target className="h-4 w-4 text-muted-foreground" />
                               <span className="text-sm font-medium">Style Weight</span>
                               <span className="text-xs text-muted-foreground">({styleWeight[0].toFixed(2)})</span>
                             </div>
                             <div className="space-y-1">
                               <Slider
                                 value={styleWeight}
                                 onValueChange={setStyleWeight}
                                 max={1}
                                 min={0}
                                 step={0.01}
                                 className="w-full"
                               />
                               <div className="flex justify-between text-xs text-muted-foreground">
                                 <span>Loose Interpretation</span>
                                 <span>Strict Adherence</span>
                               </div>
                             </div>
                           </div>

                           {/* Weirdness Constraint */}
                           <div className="space-y-2">
                             <div className="flex items-center gap-2">
                               <Zap className="h-4 w-4 text-muted-foreground" />
                               <span className="text-sm font-medium">Weirdness Constraint</span>
                               <span className="text-xs text-muted-foreground">({weirdnessConstraint[0].toFixed(2)})</span>
                               <div className="relative group">
                                 <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                   Controls creative deviation and novelty
                                 </div>
                               </div>
                             </div>
                             <div className="space-y-1">
                               <Slider
                                 value={weirdnessConstraint}
                                 onValueChange={setWeirdnessConstraint}
                                 max={1}
                                 min={0}
                                 step={0.01}
                                 className="w-full"
                               />
                               <div className="flex justify-between text-xs text-muted-foreground">
                                 <span>Conventional</span>
                                 <span>Experimental</span>
                               </div>
                             </div>
                           </div>

                           {/* Audio Weight (only when audio uploaded) */}
                           {audioUploaded && (
                             <div className="space-y-2">
                               <div className="flex items-center gap-2">
                                 <Volume2 className="h-4 w-4 text-muted-foreground" />
                                 <span className="text-sm font-medium">Audio Weight</span>
                                 <span className="text-xs text-muted-foreground">({audioWeight[0].toFixed(2)})</span>
                                 <div className="relative group">
                                   <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                   <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                     How much the uploaded audio influences generation
                                   </div>
                                 </div>
                               </div>
                               <div className="space-y-1">
                                 <Slider
                                   value={audioWeight}
                                   onValueChange={setAudioWeight}
                                   max={1}
                                   min={0}
                                   step={0.01}
                                   className="w-full"
                                 />
                                 <div className="flex justify-between text-xs text-muted-foreground">
                                   <span>Original Focus</span>
                                   <span>Heavy Influence</span>
                                 </div>
                               </div>
                             </div>
                           )}

                           {/* Negative Tags */}
                           <div className="space-y-2">
                             <div className="flex items-center gap-2">
                               <X className="h-4 w-4 text-muted-foreground" />
                               <span className="text-sm font-medium">Negative Tags</span>
                             </div>
                             <div className="space-y-2">
                               <Input
                                 placeholder="Add styles to avoid (e.g., Heavy Metal, Aggressive Drums)"
                                 className="text-sm"
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                     addNegativeTag(e.currentTarget.value.trim())
                                     e.currentTarget.value = ''
                                   }
                                 }}
                               />
                               {negativeTags.length > 0 && (
                                 <div className="flex flex-wrap gap-1">
                                   {negativeTags.map((tag) => (
                                     <Badge key={tag} variant="secondary" className="text-xs">
                                       {tag}
                                       <button
                                         onClick={() => removeNegativeTag(tag)}
                                         className="ml-1 hover:text-destructive"
                                       >
                                         <X className="h-3 w-3" />
                                       </button>
                                     </Badge>
                                   ))}
                                 </div>
                               )}
                             </div>
                           </div>
                         </div>
                       )}
                     </div>

                     {/* Song Title */}
                     <div className="space-y-2">
                       <div className="flex items-center gap-2">
                         <Edit3 className="h-4 w-4 text-muted-foreground" />
                         <span className="text-sm font-medium">{audioFileName || "Nipsey hussle - Suno v5 Studio"} (Add Vocal)</span>
                       </div>
                     </div>

                     {/* Workspace */}
                     <div className="flex items-center justify-between pt-2">
                       <div className="flex items-center gap-2">
                         <span className="text-xs text-muted-foreground">Workspace</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="text-xs text-muted-foreground">Suno Studio Course</span>
                       </div>
                     </div>
                   </>
                 ) : (
                 // Initial Custom Mode Content (when no audio uploaded)
                 <>
                   {/* Prompt Templates */}
                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <Lightbulb className="h-4 w-4 text-muted-foreground" />
                       <span className="text-sm font-medium">Need inspiration?</span>
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       {PROMPT_TEMPLATES.slice(0, 4).map((template, index) => (
                         <Button
                           key={index}
                           variant="outline"
                           size="sm"
                           className="h-auto p-2 text-xs text-left justify-start"
                           onClick={() => insertTemplate(template)}
                         >
                           {template}
                         </Button>
                       ))}
                     </div>
                   </div>

                   {/* Description Section */}
                   <div className="space-y-2">
                     <div className="flex items-center justify-between">
                       <span className="text-sm font-medium">Describe your song</span>
                       <div className="flex items-center gap-2">
                         <span className={`text-xs ${getCharacterCountColor(getCharacterCount(description, 'prompt').current, getCharacterCount(description, 'prompt').limit)}`}>
                           {getCharacterCount(description, 'prompt').current} / {getCharacterCount(description, 'prompt').limit}
                         </span>
                         <Expand className="h-4 w-4 text-muted-foreground" />
                       </div>
                     </div>
                     <Textarea
                       value={description}
                       onChange={(e) => {
                         const newValue = e.target.value
                         const limits = getCharacterLimits(selectedModel)
                         const maxLength = isSimpleMode ? limits.promptSimple : limits.prompt
                         
                         if (newValue.length <= maxLength) {
                           setDescription(newValue)
                         } else {
                           // Show warning but don't prevent typing
                           toast({
                             title: "Character limit warning",
                             description: `You're approaching the ${maxLength} character limit.`,
                             variant: "destructive"
                           })
                         }
                       }}
                       placeholder="Describe the music you want to create..."
                       className="min-h-[80px] text-sm resize-none border-0 bg-muted/30 focus:bg-muted/50 transition-colors"
                     />
                     
                     {/* Smart Suggestions */}
                     {description && getSmartSuggestions(description).length > 0 && (
                       <div className="space-y-1">
                         <span className="text-xs text-muted-foreground">Suggested styles:</span>
                         <div className="flex flex-wrap gap-1">
                           {getSmartSuggestions(description).slice(0, 3).map((suggestion) => (
                             <Button
                               key={suggestion}
                               variant="outline"
                               size="sm"
                               className="h-6 text-xs"
                               onClick={() => addStyle(suggestion)}
                             >
                               <Plus className="h-3 w-3 mr-1" />
                               {suggestion}
                             </Button>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>

                   {/* Lyrics Section */}
                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <button
                         onClick={() => setShowLyrics(!showLyrics)}
                         className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors"
                       >
                         {showLyrics ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                         Lyrics
                         {!showLyrics && (
                           <span className="text-xs text-muted-foreground">
                             • {description.length > 0 ? 'Custom' : 'Auto-generated'}
                           </span>
                         )}
                       </button>
                       <Edit3 className="h-4 w-4 text-muted-foreground" />
                     </div>
                     
                     {showLyrics && (
                       <div className="relative">
                         <Textarea
                           value={description}
                           onChange={(e) => {
                             const newValue = e.target.value
                             const limits = getCharacterLimits(selectedModel)
                             const maxLength = limits.prompt // Custom mode uses full prompt limit for lyrics
                             
                             if (newValue.length <= maxLength) {
                               setDescription(newValue)
                             } else {
                               // Show warning but don't prevent typing
                               toast({
                                 title: "Character limit warning",
                                 description: `Lyrics exceed ${maxLength} character limit.`,
                                 variant: "destructive"
                               })
                             }
                           }}
                           placeholder="Write some lyrics (leave empty for instrumental)"
                           className="min-h-[80px] text-sm resize-none border-0 bg-muted/30 focus:bg-muted/50 transition-colors pr-8"
                         />
                         <div className="absolute bottom-2 right-2">
                           <Expand className="h-3 w-3 text-muted-foreground" />
                         </div>
                       </div>
                     )}
                   </div>

                   {/* Style Description Section */}
                   <div className="space-y-2">
                     <div className="flex items-center justify-between">
                       <span className="text-sm font-medium">Style Description</span>
                       <span className={`text-xs ${getCharacterCountColor(getCharacterCount(style, 'style').current, getCharacterCount(style, 'style').limit)}`}>
                         {getCharacterCount(style, 'style').current} / {getCharacterCount(style, 'style').limit}
                       </span>
                     </div>
                     <Textarea
                       value={style}
                       onChange={(e) => {
                         const newValue = e.target.value
                         const limits = getCharacterLimits(selectedModel)
                         
                         if (newValue.length <= limits.style) {
                           setStyle(newValue)
                         } else {
                           // Show warning but don't prevent typing
                           toast({
                             title: "Character limit warning",
                             description: `Style description exceeds ${limits.style} character limit.`,
                             variant: "destructive"
                           })
                         }
                       }}
                       placeholder="Describe the musical style (e.g., 'Jazz piano trio with smooth saxophone')"
                       className="min-h-[60px] text-sm resize-none border-0 bg-muted/30 focus:bg-muted/50 transition-colors"
                     />
                   </div>

                   {/* Styles Section */}
                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <button
                         onClick={() => setShowStyles(!showStyles)}
                         className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors"
                       >
                         {showStyles ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                         Style Tags
                         {!showStyles && selectedStyles.length > 0 && (
                           <span className="text-xs text-muted-foreground">
                             • {selectedStyles.length} selected
                           </span>
                         )}
                       </button>
                     </div>
                     
                     {showStyles && (
                       <div className="space-y-3 p-3 bg-muted/20 rounded-lg">
                         {/* Selected Styles */}
                         {selectedStyles.length > 0 && (
                           <div className="space-y-2">
                             <span className="text-xs font-medium text-muted-foreground">Selected Styles</span>
                             <div className="flex flex-wrap gap-1">
                               {selectedStyles.map((style) => (
                                 <Badge key={style} variant="default" className="text-xs">
                                   {style}
                                   <button
                                     onClick={() => removeStyle(style)}
                                     className="ml-1 hover:text-destructive"
                                   >
                                     <X className="h-3 w-3" />
                                   </button>
                                 </Badge>
                               ))}
                             </div>
                           </div>
                         )}

                         {/* Style Categories */}
                         {Object.entries(STYLE_CATEGORIES).map(([key, category]) => (
                           <div key={key} className="space-y-2">
                             <div className="flex items-center gap-2">
                               <span className="text-sm">{category.icon}</span>
                               <span className="text-sm font-medium">{category.label}</span>
                             </div>
                             <div className="flex flex-wrap gap-1">
                               {category.tags.slice(0, 8).map((tag) => (
                                 <Button
                                   key={tag}
                                   variant={selectedStyles.includes(tag) ? "default" : "outline"}
                                   size="sm"
                                   className="h-6 text-xs"
                                   onClick={() => {
                                     if (selectedStyles.includes(tag)) {
                                       removeStyle(tag)
                                     } else {
                                       addStyle(tag)
                                     }
                                   }}
                                 >
                                   {selectedStyles.includes(tag) ? (
                                     <Check className="h-3 w-3 mr-1" />
                                   ) : (
                                     <Plus className="h-3 w-3 mr-1" />
                                   )}
                                   {tag}
                                 </Button>
                               ))}
                               {category.tags.length > 8 && (
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   className="h-6 text-xs text-muted-foreground"
                                 >
                                   +{category.tags.length - 8} more
                                 </Button>
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>

                   {/* Advanced Options */}
                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <button
                         onClick={() => setShowAdvanced(!showAdvanced)}
                         className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors"
                       >
                         {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                         Advanced Options
                         {!showAdvanced && (
                           <span className="text-xs text-muted-foreground">
                             • Style: {styleWeight[0]} • Weirdness: {weirdnessConstraint[0]}
                           </span>
                         )}
                       </button>
                     </div>
                     
                     {showAdvanced && (
                       <div className="space-y-4 p-3 bg-muted/20 rounded-lg">
                         {/* Vocal Gender Selection */}
                         {!isInstrumental && (
                           <div className="space-y-2">
                             <div className="flex items-center gap-2">
                               <Users className="h-4 w-4 text-muted-foreground" />
                               <span className="text-sm font-medium">Vocal Gender</span>
                             </div>
                             <div className="flex gap-2">
                               <Button
                                 variant={vocalGender === 'auto' ? 'default' : 'outline'}
                                 size="sm"
                                 className="h-8 text-xs"
                                 onClick={() => setVocalGender('auto')}
                               >
                                 <UserCheck className="h-3 w-3 mr-1" />
                                 Auto
                               </Button>
                               <Button
                                 variant={vocalGender === 'm' ? 'default' : 'outline'}
                                 size="sm"
                                 className="h-8 text-xs"
                                 onClick={() => setVocalGender('m')}
                               >
                                 <User className="h-3 w-3 mr-1" />
                                 Male
                               </Button>
                               <Button
                                 variant={vocalGender === 'f' ? 'default' : 'outline'}
                                 size="sm"
                                 className="h-8 text-xs"
                                 onClick={() => setVocalGender('f')}
                               >
                                 <User className="h-3 w-3 mr-1" />
                                 Female
                               </Button>
                             </div>
                           </div>
                         )}

                         {/* Style Weight */}
                         <div className="space-y-2">
                           <div className="flex items-center gap-2">
                             <Target className="h-4 w-4 text-muted-foreground" />
                             <span className="text-sm font-medium">Style Weight</span>
                             <span className="text-xs text-muted-foreground">({styleWeight[0].toFixed(2)})</span>
                           </div>
                           <div className="space-y-1">
                             <Slider
                               value={styleWeight}
                               onValueChange={setStyleWeight}
                               max={1}
                               min={0}
                               step={0.01}
                               className="w-full"
                             />
                             <div className="flex justify-between text-xs text-muted-foreground">
                               <span>Loose Interpretation</span>
                               <span>Strict Adherence</span>
                             </div>
                           </div>
                         </div>

                         {/* Weirdness Constraint */}
                         <div className="space-y-2">
                           <div className="flex items-center gap-2">
                             <Zap className="h-4 w-4 text-muted-foreground" />
                             <span className="text-sm font-medium">Weirdness Constraint</span>
                             <span className="text-xs text-muted-foreground">({weirdnessConstraint[0].toFixed(2)})</span>
                             <div className="relative group">
                               <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                               <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                 Controls creative deviation and novelty
                               </div>
                             </div>
                           </div>
                           <div className="space-y-1">
                             <Slider
                               value={weirdnessConstraint}
                               onValueChange={setWeirdnessConstraint}
                               max={1}
                               min={0}
                               step={0.01}
                               className="w-full"
                             />
                             <div className="flex justify-between text-xs text-muted-foreground">
                               <span>Conventional</span>
                               <span>Experimental</span>
                             </div>
                           </div>
                         </div>

                         {/* Negative Tags */}
                         <div className="space-y-2">
                           <div className="flex items-center gap-2">
                             <X className="h-4 w-4 text-muted-foreground" />
                             <span className="text-sm font-medium">Negative Tags</span>
                           </div>
                           <div className="space-y-2">
                             <Input
                               placeholder="Add styles to avoid (e.g., Heavy Metal, Aggressive Drums)"
                               className="text-sm"
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                   addNegativeTag(e.currentTarget.value.trim())
                                   e.currentTarget.value = ''
                                 }
                               }}
                             />
                             {negativeTags.length > 0 && (
                               <div className="flex flex-wrap gap-1">
                                 {negativeTags.map((tag) => (
                                   <Badge key={tag} variant="secondary" className="text-xs">
                                     {tag}
                                     <button
                                       onClick={() => removeNegativeTag(tag)}
                                       className="ml-1 hover:text-destructive"
                                     >
                                       <X className="h-3 w-3" />
                                     </button>
                                   </Badge>
                                 ))}
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     )}
                   </div>

                   {/* Song Title */}
                   <div className="space-y-2">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Edit3 className="h-4 w-4 text-muted-foreground" />
                         <span className="text-sm font-medium">Add a song title</span>
                       </div>
                       <span className={`text-xs ${getCharacterCountColor(getCharacterCount(title, 'title').current, getCharacterCount(title, 'title').limit)}`}>
                         {getCharacterCount(title, 'title').current} / {getCharacterCount(title, 'title').limit}
                       </span>
                     </div>
                     <Input
                       value={title}
                       onChange={(e) => {
                         const newValue = e.target.value
                         const limits = getCharacterLimits(selectedModel)
                         
                         if (newValue.length <= limits.title) {
                           setTitle(newValue)
                         } else {
                           // Show warning but don't prevent typing
                           toast({
                             title: "Character limit warning",
                             description: `Title exceeds ${limits.title} character limit.`,
                             variant: "destructive"
                           })
                         }
                       }}
                       placeholder="Add a song title"
                       className="border-0 bg-muted/30 focus:bg-muted/50 transition-colors"
                     />
                   </div>

                   {/* Generation Preview & Button */}
                   <div className="space-y-3 pt-4 border-t">
                     {/* Generation Preview Card */}
                     <div className="p-3 bg-muted/20 rounded-lg space-y-2">
                       <div className="flex items-center gap-2">
                         <Settings className="h-4 w-4 text-muted-foreground" />
                         <span className="text-sm font-medium">Generation Preview</span>
                       </div>
                       <div className="grid grid-cols-2 gap-2 text-xs">
                         <div className="space-y-1">
                           <div className="text-muted-foreground">Model:</div>
                           <div className="font-medium">{MODEL_CONFIGS[selectedModel].name} {MODEL_CONFIGS[selectedModel].badge && `(${MODEL_CONFIGS[selectedModel].badge})`}</div>
                         </div>
                         <div className="space-y-1">
                           <div className="text-muted-foreground">Duration:</div>
                           <div className="font-medium">{MODEL_CONFIGS[selectedModel].duration}</div>
                         </div>
                         <div className="space-y-1">
                           <div className="text-muted-foreground">Type:</div>
                           <div className="font-medium">{isInstrumental ? 'Instrumental' : 'With Vocals'}</div>
                         </div>
                         <div className="space-y-1">
                           <div className="text-muted-foreground">Style Weight:</div>
                           <div className="font-medium">{styleWeight[0].toFixed(2)}</div>
                         </div>
                       </div>
                       <div className="flex items-center justify-between pt-2 border-t">
                         <span className="text-xs text-muted-foreground">Estimated time: ~30 seconds</span>
                         <span className="text-xs text-muted-foreground">Credits: 1</span>
                       </div>
                     </div>

                     {/* Generate Button */}
                     <Button 
                       onClick={handleGenerate}
                       disabled={isGenerating || !description.trim()}
                       className="w-full h-10 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                     >
                       {isGenerating ? (
                         <>
                           <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                           Generating...
                         </>
                       ) : (
                         <>
                           <Sparkles className="h-4 w-4 mr-2" />
                           Generate Music
                         </>
                       )}
                     </Button>
                   </div>

                   {/* Workspace */}
                   <div className="flex items-center justify-between pt-2">
                     <div className="flex items-center gap-2">
                       <span className="text-xs text-muted-foreground">Workspace</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <span className="text-xs text-muted-foreground">My Workspace</span>
                     </div>
                   </div>
                 </>
               )}
             </>
           )}
         </div>
       </div>

      {/* Previous Generations */}
      <PreviousGenerations contentType="music_jingles" userId={user?.id || ''} className="mt-8" />
     </div>
   )
 }
