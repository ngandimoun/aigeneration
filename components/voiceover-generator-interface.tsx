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

export function VoiceoverGeneratorInterface({ onClose, projectTitle }: VoiceoverGeneratorInterfaceProps) {
  const { toast } = useToast()
  
  // Voiceover Configuration
  const [script, setScript] = useState("")
  const [language, setLanguage] = useState("English")
  const [selectedVoice, setSelectedVoice] = useState<DreamCutVoice | null>(null)
  const [speed, setSpeed] = useState([50])
  const [pitch, setPitch] = useState([50])
  const [volume, setVolume] = useState([50])
  const [emotion, setEmotion] = useState("")
  const [useCase, setUseCase] = useState("")
  const [backgroundMusic, setBackgroundMusic] = useState(false)
  const [soundEffects, setSoundEffects] = useState(false)
  
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
      // Call ElevenLabs API to generate voiceover
      const elevenLabsResponse = await fetch('/api/elevenlabs/text-to-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: script,
          voice_id: selectedVoice.voice_id,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          },
          model_id: "eleven_multilingual_v2"
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
        speed: speed[0],
        pitch: pitch[0],
        volume: volume[0],
        emotion,
        use_case: useCase,
        background_music: backgroundMusic,
        sound_effects: soundEffects,
        content: {
          dreamcut_voice: selectedVoice,
          elevenlabs_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        },
        metadata: {
          generated_at: new Date().toISOString(),
          model_used: "eleven_multilingual_v2",
          dreamcut_voice_name: selectedVoice?.name
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
                  <Label>Speed: {speed[0]}%</Label>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pitch: {pitch[0]}%</Label>
                  <Slider
                    value={pitch}
                    onValueChange={setPitch}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Volume: {volume[0]}%</Label>
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Quiet</span>
                    <span>Loud</span>
                  </div>
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

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="background-music"
                      checked={backgroundMusic}
                      onCheckedChange={setBackgroundMusic}
                    />
                    <Label htmlFor="background-music">Background Music</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sound-effects"
                      checked={soundEffects}
                      onCheckedChange={setSoundEffects}
                    />
                    <Label htmlFor="sound-effects">Sound Effects</Label>
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