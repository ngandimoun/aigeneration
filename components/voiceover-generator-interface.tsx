"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { 
  Mic, 
  Play, 
  Pause, 
  Volume2, 
  Download,
  Sparkles,
  X,
  Check,
  Info,
  Save,
  Settings,
  Globe,
  Heart,
  Zap,
  Droplets,
  Flame,
  Smile,
  Shield,
  Moon,
  Sun,
  User,
  Clock,
  FileAudio,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface VoiceoverGeneratorInterfaceProps {
  onClose: () => void
  projectTitle?: string
}

interface DreamCutVoice {
  voice_id: string
  name: string
  description: string
  category: string
  language: string
  gender: string
  age: string
  accent: string
  tone: string
  mood: string
  style: string
  preview_url?: string
  created_at: string
}

interface VoiceoverPreview {
  id: string
  audio_base_64: string
  media_type: string
  duration_secs: number
  language: string
  variation: string
}

const VOICEOVER_USE_CASES = [
  "Narration",
  "Commercial", 
  "Educational",
  "Podcast",
  "Audiobook",
  "Documentary",
  "E-learning",
  "News",
  "Radio",
  "Storytelling",
  "Meditation",
  "ASMR",
  "Character Voice",
  "Brand Voice",
  "Customer Service",
  "Virtual Assistant",
  "Game NPC",
  "Trailer",
  "Promo",
  "Announcement"
]

const LANGUAGES = [
  "English",
  "French", 
  "Spanish",
  "Japanese",
  "Chinese (Mandarin)",
  "Chinese (Cantonese)",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Korean",
  "Arabic",
  "Hindi",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Polish",
  "Czech",
  "Hungarian",
  "Turkish",
  "Greek",
  "Hebrew",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Malay",
  "Filipino",
  "Multilingual"
]

const EMOTION_OPTIONS = [
  { value: "calm", label: "Calm", icon: "🌿" },
  { value: "energetic", label: "Energetic", icon: "⚡" },
  { value: "sad", label: "Sad", icon: "💧" },
  { value: "dramatic", label: "Dramatic", icon: "🔥" },
  { value: "playful", label: "Playful", icon: "🎈" },
  { value: "confident", label: "Confident", icon: "💪" },
  { value: "mysterious", label: "Mysterious", icon: "🌑" },
  { value: "hopeful", label: "Hopeful", icon: "🌅" },
  { value: "relaxed", label: "Relaxed", icon: "🧘" },
  { value: "sleepy", label: "Sleepy", icon: "😴" },
  { value: "soothing", label: "Soothing", icon: "🕊️" },
  { value: "meditative", label: "Meditative", icon: "🧘‍♀️" },
  { value: "whisper", label: "Whisper", icon: "🤫" },
  { value: "intimate", label: "Intimate", icon: "💕" },
  { value: "professional", label: "Professional", icon: "👔" },
  { value: "friendly", label: "Friendly", icon: "😊" },
  { value: "authoritative", label: "Authoritative", icon: "👑" },
  { value: "gentle", label: "Gentle", icon: "🕊️" }
]

// ElevenLabs API Output Format Options
const OUTPUT_FORMAT_OPTIONS = [
  { value: "mp3_22050_32", label: "MP3 22.05kHz 32kbps" },
  { value: "mp3_44100_32", label: "MP3 44.1kHz 32kbps" },
  { value: "mp3_44100_64", label: "MP3 44.1kHz 64kbps" },
  { value: "mp3_44100_96", label: "MP3 44.1kHz 96kbps" },
  { value: "mp3_44100_128", label: "MP3 44.1kHz 128kbps (Recommended)" },
  { value: "mp3_44100_192", label: "MP3 44.1kHz 192kbps (Creator+)" },
  { value: "pcm_8000", label: "PCM 8kHz" },
  { value: "pcm_16000", label: "PCM 16kHz" },
  { value: "pcm_22050", label: "PCM 22.05kHz" },
  { value: "pcm_24000", label: "PCM 24kHz" },
  { value: "pcm_44100", label: "PCM 44.1kHz (Pro+)" },
  { value: "pcm_48000", label: "PCM 48kHz (Pro+)" },
  { value: "ulaw_8000", label: "μ-law 8kHz (Twilio)" },
  { value: "alaw_8000", label: "A-law 8kHz" },
  { value: "opus_48000_32", label: "Opus 48kHz 32kbps" },
  { value: "opus_48000_64", label: "Opus 48kHz 64kbps" },
  { value: "opus_48000_96", label: "Opus 48kHz 96kbps" },
  { value: "opus_48000_128", label: "Opus 48kHz 128kbps" },
  { value: "opus_48000_192", label: "Opus 48kHz 192kbps" }
]


// Streaming Latency Optimization Options
const LATENCY_OPTIONS = [
  { value: 0, label: "Default (No optimization)" },
  { value: 1, label: "Normal optimization (~50% improvement)" },
  { value: 2, label: "Strong optimization (~75% improvement)" },
  { value: 3, label: "Max optimization" },
  { value: 4, label: "Max optimization + No text normalizer" }
]

export function VoiceoverGeneratorInterface({ onClose, projectTitle }: VoiceoverGeneratorInterfaceProps) {
  const { toast } = useToast()
  
  // Voiceover Configuration
  const [script, setScript] = useState("")
  const [language, setLanguage] = useState("English")
  const [selectedVoice, setSelectedVoice] = useState<DreamCutVoice | null>(null)
  
  // ElevenLabs Voice Settings (mapped to actual API parameters)
  const [stability, setStability] = useState([50]) // 0-100 mapped to 0-1
  const [similarityBoost, setSimilarityBoost] = useState([75]) // 0-100 mapped to 0-1
  const [style, setStyle] = useState([0]) // 0-100 mapped to 0-1
  const [useSpeakerBoost, setUseSpeakerBoost] = useState(true)
  
  // Additional ElevenLabs API parameters
  const [outputFormat, setOutputFormat] = useState("mp3_44100_128")
  const [optimizeStreamingLatency, setOptimizeStreamingLatency] = useState(0)
  const [enableLogging, setEnableLogging] = useState(true)
  const [modelId] = useState("eleven_v3") // Hardcoded to eleven_v3
  
  const [emotion, setEmotion] = useState("")
  const [useCase, setUseCase] = useState("")
  
  // DreamCut Voice Library
  const [dreamCutVoices, setDreamCutVoices] = useState<DreamCutVoice[]>([])
  const [loadingVoices, setLoadingVoices] = useState(true)
  
  // Preview & Fine-tuning
  const [isGenerating, setIsGenerating] = useState(false)
  const [voiceoverPreviews, setVoiceoverPreviews] = useState<VoiceoverPreview[]>([])
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})
  
  // Export & Save
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedArtifact, setSelectedArtifact] = useState("")

  // Load DreamCut voices on component mount
  useEffect(() => {
    const loadDreamCutVoices = async () => {
      try {
        const response = await fetch('/api/voice-creation')
        if (response.ok) {
          const data = await response.json()
          setDreamCutVoices(data.voiceCreations || [])
        }
      } catch (error) {
        console.error('Failed to load DreamCut voices:', error)
        toast({
          title: "Failed to load voices",
          description: "Could not load your DreamCut voice library.",
          variant: "destructive"
        })
      } finally {
        setLoadingVoices(false)
      }
    }

    loadDreamCutVoices()
  }, [toast])

  const handleGenerateVoiceover = async () => {
    if (!script.trim()) {
      toast({
        title: "Script required",
        description: "Please enter a script for the voiceover.",
        variant: "destructive"
      })
      return
    }

    if (!selectedVoice) {
      toast({
        title: "Voice selection required",
        description: "Please select a voice from your DreamCut voice library.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      // Call ElevenLabs API to generate voiceover with proper parameter mapping
      const elevenLabsResponse = await fetch('/api/elevenlabs/text-to-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: script,
          voice_id: selectedVoice.voice_id,
          model_id: modelId,
          language_code: language === "English" ? "en" : language.toLowerCase(),
          voice_settings: {
            stability: stability[0] / 100, // Convert 0-100 to 0-1
            similarity_boost: similarityBoost[0] / 100, // Convert 0-100 to 0-1
            style: style[0] / 100, // Convert 0-100 to 0-1
            use_speaker_boost: useSpeakerBoost
          },
          output_format: outputFormat,
          optimize_streaming_latency: optimizeStreamingLatency,
          enable_logging: enableLogging
        })
      })

      if (!elevenLabsResponse.ok) {
        throw new Error('ElevenLabs API call failed')
      }

      const audioBlob = await elevenLabsResponse.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      // Create preview object
      const preview: VoiceoverPreview = {
        id: `voiceover_${Date.now()}`,
        audio_base_64: audioUrl,
        media_type: "audio/mpeg",
        duration_secs: 5.2, // This would be calculated from actual audio
        language: language,
        variation: "Generated"
      }
      
      setVoiceoverPreviews([preview])
      setSelectedPreview(preview.id)
      
      toast({
        title: "Voiceover generated!",
        description: "Your voiceover is ready for review."
      })
    } catch (error) {
      console.error('Voiceover generation failed:', error)
      toast({
        title: "Generation failed",
        description: "Please try again or check your ElevenLabs API configuration.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlayPreview = (previewId: string) => {
    if (isPlaying === previewId) {
      setIsPlaying(null)
      audioRefs.current[previewId]?.pause()
    } else {
      setIsPlaying(previewId)
      const audio = audioRefs.current[previewId]
      if (audio) {
        audio.play()
      }
    }
  }

  const handleSaveVoiceover = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your voiceover.",
        variant: "destructive"
      })
      return
    }

    if (!selectedPreview) {
      toast({
        title: "Select a preview",
        description: "Please select a voiceover preview to save.",
        variant: "destructive"
      })
      return
    }

    try {
      const voiceoverData = {
        title,
        description,
        selected_artifact: selectedPreview,
        script,
        language,
        voice_id: selectedVoice?.voice_id,
        emotion,
        use_case: useCase,
        content: {
          dreamcut_voice: selectedVoice,
          elevenlabs_settings: {
            stability: stability[0] / 100,
            similarity_boost: similarityBoost[0] / 100,
            style: style[0] / 100,
            use_speaker_boost: useSpeakerBoost,
            model_id: modelId,
            output_format: outputFormat,
            optimize_streaming_latency: optimizeStreamingLatency,
            enable_logging: enableLogging
          }
        },
        metadata: {
          generated_at: new Date().toISOString(),
          model_used: modelId,
          dreamcut_voice_name: selectedVoice?.name,
          output_format: outputFormat,
          api_version: "v1"
        }
      }

      // API call to save voiceover
      const response = await fetch('/api/voiceovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voiceoverData)
      })

      if (response.ok) {
        toast({
          title: "Voiceover saved successfully!",
          description: `Voiceover '${title}' has been saved to your library.`
        })
        onClose()
      } else {
        throw new Error('Failed to save voiceover')
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Voiceover Studio</h2>
            <p className="text-muted-foreground">Generate high-quality voiceovers using your DreamCut voice library and ElevenLabs AI.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-8">
          
          {/* Script Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                1️⃣ Script & Voice Selection
              </CardTitle>
              <CardDescription>
                Enter your script and select a voice from your DreamCut voice library.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Script</Label>
                  <Textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Enter your voiceover script here..."
                    className="min-h-[120px]"
                  />
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-blue-800 font-medium mb-2">💡 Pro Tip: Use Audio Tags for Better Expression</p>
                        <p className="text-blue-700 mb-3">
                          Eleven v3 supports audio tags to control voice delivery and emotion. Here are all available tags:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-2">
                            <div>
                              <p className="text-blue-800 font-semibold mb-1">🎭 Voice & Emotions:</p>
                              <div className="text-blue-600 space-y-1">
                                <p><code>[laughs]</code>, <code>[laughs harder]</code>, <code>[starts laughing]</code>, <code>[wheezing]</code></p>
                                <p><code>[whispers]</code>, <code>[sighs]</code>, <code>[exhales]</code></p>
                                <p><code>[sarcastic]</code>, <code>[curious]</code>, <code>[excited]</code>, <code>[crying]</code></p>
                                <p><code>[snorts]</code>, <code>[mischievously]</code>, <code>[happy]</code>, <code>[sad]</code></p>
                                <p><code>[angry]</code>, <code>[annoyed]</code>, <code>[appalled]</code>, <code>[thoughtful]</code></p>
                                <p><code>[surprised]</code>, <code>[professional]</code>, <code>[sympathetic]</code></p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-blue-800 font-semibold mb-1">🔊 Sound Effects:</p>
                              <div className="text-blue-600 space-y-1">
                                <p><code>[gunshot]</code>, <code>[applause]</code>, <code>[clapping]</code>, <code>[explosion]</code></p>
                                <p><code>[swallows]</code>, <code>[gulps]</code>, <code>[clears throat]</code></p>
                                <p><code>[short pause]</code>, <code>[long pause]</code>, <code>[exhales sharply]</code></p>
                                <p><code>[inhales deeply]</code>, <code>[chuckles]</code>, <code>[giggles]</code></p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <p className="text-blue-800 font-semibold mb-1">🌍 Accents & Special:</p>
                              <div className="text-blue-600 space-y-1">
                                <p><code>[strong French accent]</code>, <code>[strong Russian accent]</code></p>
                                <p><code>[strong British accent]</code>, <code>[strong German accent]</code></p>
                                <p><code>[strong Spanish accent]</code>, <code>[strong Italian accent]</code></p>
                                <p><code>[sings]</code>, <code>[woo]</code>, <code>[fart]</code></p>
                                <p><code>[robotic voice]</code>, <code>[binary beeping]</code></p>
                                <p><code>[dramatically]</code>, <code>[warmly]</code>, <code>[delightedly]</code></p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-blue-800 font-semibold mb-1">🎬 Dialogue & Timing:</p>
                              <div className="text-blue-600 space-y-1">
                                <p><code>[starting to speak]</code>, <code>[jumping in]</code></p>
                                <p><code>[overlapping]</code>, <code>[interrupting]</code></p>
                                <p><code>[stopping abruptly]</code>, <code>[cautiously]</code></p>
                                <p><code>[questioning]</code>, <code>[reassuring]</code></p>
                                <p><code>[impressed]</code>, <code>[alarmed]</code>, <code>[sheepishly]</code></p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 p-2 bg-blue-100 rounded border-l-4 border-blue-400">
                          <p className="text-blue-800 font-semibold text-xs mb-1">📝 Example Usage:</p>
                          <div className="text-blue-700 text-xs space-y-2">
                            <div>
                              <p className="font-medium mb-1">English Script:</p>
                              <p>"In the ancient land of Eldoria, where skies shimmered and forests whispered secrets to the wind, lived a dragon named Zephyros. [sarcastically] Not the 'burn it all down' kind... [giggles] but he was gentle, wise, with eyes like old stars. [whispers] Even the birds fell silent when he passed."</p>
                            </div>
                            <div>
                              <p className="font-medium mb-1">French Script (with English tags):</p>
                              <p>"Tu es une ordure, soldat ! Tu crois avoir ce qu'il faut pour être le MEILLEUR ?! [chuckles] tu es une honte pour la troupe - DÉGAGE DE MA VUE !! [voix aiguë] ooohh, mais c'est trop 'DIFFICILE'..,[voix aiguë] je n'ai pas assez de force ni de volonté, j'ai trop peur ! [rire] ASSEZ ! tu me fais rire, soldat, ET TU ME DONNES LA NAUSÉE !"</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-blue-600">
                          <p><strong>💡 Tips:</strong> Combine multiple tags, match tags to your voice's character, and experiment with different combinations for best results!</p>
                        </div>
                        
                        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded border-l-4 border-l-amber-400">
                          <div className="flex items-start gap-2">
                            <span className="text-amber-600 text-sm">⚠️</span>
                            <div className="text-xs">
                              <p className="text-amber-800 font-semibold mb-1">Important: Audio Tags Language</p>
                              <p className="text-amber-700">
                                <strong>Always write audio tags in English</strong>, even if your script is in another language. 
                                The tags are processed by the AI model and must be in English to work correctly.
                              </p>
                              <p className="text-amber-700 mt-1">
                                <strong>Example:</strong> "Bonjour, comment allez-vous? [whispers] Je suis très heureux de vous voir." 
                                ✅ Correct - script in French, tags in English
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>DreamCut Voice Library</Label>
                    {loadingVoices ? (
                      <div className="flex items-center justify-center p-4">
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Loading voices...
                      </div>
                    ) : (
                      <Select 
                        value={selectedVoice?.voice_id || undefined} 
                        onValueChange={(value) => {
                          if (value === "no-voices") return
                          const voice = dreamCutVoices.find(v => v.voice_id === value)
                          setSelectedVoice(voice || null)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a voice from your library" />
                        </SelectTrigger>
                        <SelectContent>
                          {dreamCutVoices.length === 0 ? (
                            <SelectItem value="no-voices" disabled>
                              No voices found. Create voices first in Voice Creation.
                            </SelectItem>
                          ) : (
                            dreamCutVoices.map((voice) => (
                              <SelectItem key={voice.voice_id} value={voice.voice_id}>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">{voice.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {voice.gender} • {voice.language} • {voice.mood}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {/* Selected Voice Preview */}
                {selectedVoice && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{selectedVoice.name}</h4>
                          <p className="text-sm text-muted-foreground">{selectedVoice.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {selectedVoice.gender}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {selectedVoice.language}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {selectedVoice.mood}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {selectedVoice.style}
                            </Badge>
                          </div>
                        </div>
                        {selectedVoice.preview_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const audio = new Audio(selectedVoice.preview_url)
                              audio.play()
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Voice Settings Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                2️⃣ Voice Settings
              </CardTitle>
              <CardDescription>
                Fine-tune the voice characteristics for your voiceover using ElevenLabs parameters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Stability: {stability[0]}%</Label>
                  <Slider
                    value={stability}
                    onValueChange={setStability}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Variable</span>
                    <span>Stable</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Controls voice consistency and variation</p>
                </div>

                <div className="space-y-2">
                  <Label>Similarity Boost: {similarityBoost[0]}%</Label>
                  <Slider
                    value={similarityBoost}
                    onValueChange={setSimilarityBoost}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Less Similar</span>
                    <span>More Similar</span>
                  </div>
                  <p className="text-xs text-muted-foreground">How closely the voice matches the original</p>
                </div>

                <div className="space-y-2">
                  <Label>Style: {style[0]}%</Label>
                  <Slider
                    value={style}
                    onValueChange={setStyle}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Neutral</span>
                    <span>Exaggerated</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Exaggeration of the speaking style</p>
                </div>

                <div className="space-y-2">
                  <Label>Speaker Boost</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="speaker-boost"
                      checked={useSpeakerBoost}
                      onCheckedChange={setUseSpeakerBoost}
                    />
                    <Label htmlFor="speaker-boost">
                      {useSpeakerBoost ? "Enabled" : "Disabled"}
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Enhances the similarity to the original speaker</p>
                </div>

                <div className="space-y-2">
                  <Label>Emotion</Label>
                  <Select value={emotion} onValueChange={setEmotion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select emotion" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMOTION_OPTIONS.map((emotionOption) => (
                        <SelectItem key={emotionOption.value} value={emotionOption.value}>
                          <div className="flex items-center gap-2">
                            <span>{emotionOption.icon}</span>
                            {emotionOption.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Use Case</Label>
                  <Select value={useCase} onValueChange={setUseCase}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select use case" />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICEOVER_USE_CASES.map((useCaseOption) => (
                        <SelectItem key={useCaseOption} value={useCaseOption.toLowerCase()}>
                          {useCaseOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>

              {/* Advanced ElevenLabs API Settings */}
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Advanced ElevenLabs Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                      <span className="text-sm font-medium">Eleven v3</span>
                      <Badge variant="secondary" className="text-xs">Fixed</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Using the latest Eleven v3 model for optimal quality</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Output Format</Label>
                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OUTPUT_FORMAT_OPTIONS.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Streaming Latency Optimization</Label>
                    <Select 
                      value={optimizeStreamingLatency.toString()} 
                      onValueChange={(value) => setOptimizeStreamingLatency(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LATENCY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Request Logging</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enable-logging"
                        checked={enableLogging}
                        onCheckedChange={setEnableLogging}
                      />
                      <Label htmlFor="enable-logging">
                        {enableLogging ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {enableLogging ? "Request history will be saved" : "Zero retention mode (Enterprise only)"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview & Fine-tuning Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                3️⃣ Preview & Fine-tuning
              </CardTitle>
              <CardDescription>
                Generate voiceover using ElevenLabs AI and fine-tune the output.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={handleGenerateVoiceover}
                disabled={isGenerating || !script.trim() || !selectedVoice}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    🎙️ Generating with ElevenLabs AI...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Generate Voiceover with ElevenLabs
                  </>
                )}
              </Button>

              {voiceoverPreviews.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {voiceoverPreviews.map((preview) => (
                      <Card key={preview.id} className={cn(
                        "cursor-pointer transition-all",
                        selectedPreview === preview.id && "ring-2 ring-primary"
                      )} onClick={() => setSelectedPreview(preview.id)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{preview.variation}</Badge>
                              <Badge variant="outline" className="text-xs">
                                <FileAudio className="h-3 w-3 mr-1" />
                                {preview.duration_secs}s
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePlayPreview(preview.id)
                              }}
                            >
                              {isPlaying === preview.id ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {preview.language} • Generated with ElevenLabs AI
                          </div>
                          {/* Audio element for playback */}
                          <audio
                            ref={(el) => {
                              if (el) audioRefs.current[preview.id] = el
                            }}
                            src={preview.audio_base_64}
                            onEnded={() => setIsPlaying(null)}
                            className="w-full"
                            controls
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export & Save Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5" />
                4️⃣ Export & Save
              </CardTitle>
              <CardDescription>
                Name and save your voiceover to your library.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Product Demo Voiceover"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the voiceover"
                  />
                </div>
              </div>

              <Button onClick={handleSaveVoiceover} className="w-full" size="lg">
                <Save className="h-4 w-4 mr-2" />
                Save Voiceover
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveVoiceover} disabled={!title.trim() || !selectedPreview}>
            <Save className="h-4 w-4 mr-2" />
            Save Voiceover
          </Button>
        </div>
      </div>
    </div>
  )
}