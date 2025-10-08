"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Mic, Volume2, Settings, Globe, Heart, User, Sparkles } from "lucide-react"

interface VoiceoverFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading?: boolean
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

export function VoiceoverForm({ onSubmit, onCancel, isLoading }: VoiceoverFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    script: "",
    language: "English",
    voice_id: "",
    speed: 50,
    pitch: 50,
    volume: 50,
    emotion: "",
    use_case: "",
    background_music: false,
    sound_effects: false
  })

  // DreamCut Voice Library
  const [dreamCutVoices, setDreamCutVoices] = useState<DreamCutVoice[]>([])
  const [loadingVoices, setLoadingVoices] = useState(true)
  const [selectedVoice, setSelectedVoice] = useState<DreamCutVoice | null>(null)

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
      } finally {
        setLoadingVoices(false)
      }
    }

    loadDreamCutVoices()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      dreamcut_voice: selectedVoice
    })
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleVoiceSelection = (voiceId: string) => {
    if (voiceId === "no-voices") return
    const voice = dreamCutVoices.find(v => v.voice_id === voiceId)
    setSelectedVoice(voice || null)
    handleInputChange("voice_id", voiceId)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Provide the essential details for your voiceover.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter voiceover title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your voiceover project"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Use Case</Label>
              <Select value={formData.use_case} onValueChange={(value) => handleInputChange("use_case", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select use case" />
                </SelectTrigger>
                <SelectContent>
                  {VOICEOVER_USE_CASES.map((useCase) => (
                    <SelectItem key={useCase} value={useCase.toLowerCase()}>
                      {useCase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Script */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Script
          </CardTitle>
          <CardDescription>
            The text that will be converted to speech using ElevenLabs AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="script">Script Text *</Label>
            <Textarea
              id="script"
              value={formData.script}
              onChange={(e) => handleInputChange("script", e.target.value)}
              placeholder="Enter the text you want to convert to speech..."
              rows={6}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* DreamCut Voice Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            DreamCut Voice Selection
          </CardTitle>
          <CardDescription>
            Select a voice from your DreamCut voice library to use with ElevenLabs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>DreamCut Voice Library</Label>
            {loadingVoices ? (
              <div className="flex items-center justify-center p-4">
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Loading voices...
              </div>
            ) : (
              <Select 
                value={formData.voice_id} 
                onValueChange={handleVoiceSelection}
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

          {/* Selected Voice Preview */}
          {selectedVoice && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{selectedVoice.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedVoice.description}</p>
                    <div className="flex gap-2 mt-1">
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
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Voice Characteristics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Voice Characteristics
          </CardTitle>
          <CardDescription>
            Fine-tune the voice characteristics for your voiceover using ElevenLabs parameters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Speed: {formData.speed}%</Label>
              <Slider
                value={[formData.speed]}
                onValueChange={(value) => handleInputChange("speed", value[0])}
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
              <Label>Pitch: {formData.pitch}%</Label>
              <Slider
                value={[formData.pitch]}
                onValueChange={(value) => handleInputChange("pitch", value[0])}
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
              <Label>Volume: {formData.volume}%</Label>
              <Slider
                value={[formData.volume]}
                onValueChange={(value) => handleInputChange("volume", value[0])}
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
          </div>

          <div className="space-y-2">
            <Label>Emotion</Label>
            <Select value={formData.emotion} onValueChange={(value) => handleInputChange("emotion", value)}>
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
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Audio Options
          </CardTitle>
          <CardDescription>
            Configure additional audio options for your voiceover.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="background_music"
                checked={formData.background_music}
                onCheckedChange={(checked) => handleInputChange("background_music", checked)}
              />
              <Label htmlFor="background_music">Background Music</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="sound_effects"
                checked={formData.sound_effects}
                onCheckedChange={(checked) => handleInputChange("sound_effects", checked)}
              />
              <Label htmlFor="sound_effects">Sound Effects</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formData.title || !formData.script || !formData.voice_id}>
          {isLoading ? "Creating..." : "Create Voiceover"}
        </Button>
      </div>
    </form>
  )
}