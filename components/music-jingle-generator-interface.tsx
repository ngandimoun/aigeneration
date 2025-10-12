"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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
  Brush
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

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

// Style Tags - Fusion de tous les genres, moods, tempos, etc.
const STYLE_TAGS = [
  "pop", "rock", "electronic", "jazz", "classical", "hip-hop", "r&b",
  "upbeat", "calm", "energetic", "powerful", "mysterious", "romantic", "melancholic",
  "slow tempo", "fast tempo", "moderate tempo",
  "piano", "guitar", "orchestral", "acoustic", "synthetic",
  "commercial", "cinematic", "ambient", "corporate", "game", "trailer",
  "female vocals", "male vocals", "instrumental", "choir", "strings", "brass"
]

export function MusicJingleGeneratorInterface({ onClose, projectTitle }: MusicJingleGeneratorInterfaceProps) {
  const { toast } = useToast()
  
  // Core State
  const [description, setDescription] = useState("")
  const [title, setTitle] = useState("")
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(true)
  
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

  // Style management functions
  const addStyle = (style: string) => {
    if (!selectedStyles.includes(style)) {
      setSelectedStyles([...selectedStyles, style])
    }
  }

  const removeStyle = (style: string) => {
    setSelectedStyles(selectedStyles.filter(s => s !== style))
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

    setIsGenerating(true)
    try {
      // Simulate API call to generate music
      await new Promise(resolve => setTimeout(resolve, 4000))
      
      // Mock generated music
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
        description: "Your music is ready to play and customize."
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Please try again.",
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
        is_public: isPublic,
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
              <span className="text-sm">v5</span>
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
              {/* Description Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Describe your song</span>
                  <Expand className="h-4 w-4 text-muted-foreground" />
                </div>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the music you want to create..."
                  className="min-h-[80px] text-sm resize-none border-0 bg-muted/30 focus:bg-muted/50 transition-colors"
                />
              </div>

              {/* Input Options */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Audio
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Lyrics
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs bg-primary text-primary-foreground">
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
                             <Music className="h-6 w-6 text-muted-foreground" />
                           </div>
                           <div className="flex-1">
                             <h3 className="text-sm font-medium">
                               {isRecording 
                                 ? "Recording..." 
                                 : (audioFileName || "Nipsey hussle - Suno v5 Studio")
                               }
                             </h3>
                             <p className="text-xs text-muted-foreground">
                               {isRecording 
                                 ? `${formatTime(recordingDuration)} / --:--` 
                                 : `${formatTime(currentTime)} / ${formatTime(audioDuration)}`
                               }
                             </p>
                           </div>
                           <Button size="sm" variant="outline" className="h-6 text-xs">
                             Add Vocals
                           </Button>
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
                             <ChevronDown className="h-4 w-4" />
                             Styles
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
                       
                       <div className="space-y-2">
                         {/* Style Description */}
                         <div className="text-xs text-muted-foreground leading-relaxed">
                           The piece is a slow tempo R&B track in a minor key, featuring a female vocalist. The instrumentation includes a prominent bassline, a drum machine providing a laid-back hip-hop beat, and a synth pad creating a dreamy, atmospheric background. The bass plays a simple, repetitive melodic line. The drum machine features a kick...
                         </div>
                         
                         {/* Style Tags Row */}
                         <div className="flex items-center gap-2 overflow-x-auto">
                           <button className="flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors whitespace-nowrap">
                             <Plus className="h-3 w-3" />
                             dubstep
                           </button>
                           <button className="flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors whitespace-nowrap">
                             <Plus className="h-3 w-3" />
                             rap
                           </button>
                           <button className="flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors whitespace-nowrap">
                             <Plus className="h-3 w-3" />
                             female tenor baritone vocalist
                           </button>
                         </div>
                       </div>
                     </div>

                     {/* Advanced Options */}
                     <div className="space-y-2">
                       <div className="flex items-center gap-2">
                         <button
                           onClick={() => setShowAdvanced(!showAdvanced)}
                           className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors"
                         >
                           <ChevronRight className="h-4 w-4" />
                           Advanced Options
                         </button>
                       </div>
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
                   {/* Lyrics Section */}
                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <button
                         onClick={() => setShowLyrics(!showLyrics)}
                         className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors"
                       >
                         <ChevronDown className="h-4 w-4" />
                         Lyrics
                       </button>
                       <Edit3 className="h-4 w-4 text-muted-foreground" />
                     </div>
                     
                     <div className="relative">
                       <Textarea
                         placeholder="Write some lyrics (leave empty for instrumental)"
                         className="min-h-[80px] text-sm resize-none border-0 bg-muted/30 focus:bg-muted/50 transition-colors pr-8"
                       />
                       <div className="absolute bottom-2 right-2">
                         <Expand className="h-3 w-3 text-muted-foreground" />
                       </div>
                     </div>
                   </div>

                   {/* Styles Section */}
                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <button
                         onClick={() => setShowStyles(!showStyles)}
                         className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors"
                       >
                         <ChevronDown className="h-4 w-4" />
                         Styles
                       </button>
                     </div>
                     
                     <div className="space-y-2">
                       {/* Current Styles Display */}
                       <div className="text-xs text-muted-foreground">
                         Hip-hop, R&B, upbeat
                       </div>
                       
                       {/* Style Tags Row */}
                       <div className="flex items-center gap-2 overflow-x-auto">
                         <button className="flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors whitespace-nowrap">
                           <span className="text-xs">|||</span>
                         </button>
                         <button className="flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors whitespace-nowrap">
                           <Plus className="h-3 w-3" />
                           allegra
                         </button>
                         <button className="flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors whitespace-nowrap">
                           <Plus className="h-3 w-3" />
                           k-pop
                         </button>
                         <button className="flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors whitespace-nowrap">
                           <Plus className="h-3 w-3" />
                           slightly melancholic tempo
                         </button>
                       </div>
                     </div>
                   </div>

                   {/* Advanced Options */}
                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <button
                         onClick={() => setShowAdvanced(!showAdvanced)}
                         className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors"
                       >
                         <ChevronRight className="h-4 w-4" />
                         Advanced Options
                       </button>
                     </div>
                   </div>

                   {/* Song Title */}
                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <Edit3 className="h-4 w-4 text-muted-foreground" />
                       <span className="text-sm font-medium">Add a song title</span>
                     </div>
                     <Input
                       value={title}
                       onChange={(e) => setTitle(e.target.value)}
                       placeholder="Add a song title"
                       className="border-0 bg-muted/30 focus:bg-muted/50 transition-colors"
                     />
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
     </div>
   )
 }
