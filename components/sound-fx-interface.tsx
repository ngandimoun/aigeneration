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
  Zap, 
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
  Droplets,
  Flame,
  Smile,
  Shield,
  Moon,
  Sun,
  Upload
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface SoundFxInterfaceProps {
  onClose: () => void
  projectTitle?: string
}

interface SoundFxPreview {
  id: string
  audio_base_64: string
  media_type: string
  duration_secs: number
  category: string
  variation: string
}

// Sound Categories
const SOUND_CATEGORIES = [
  "Impact",
  "Ambience", 
  "Movement",
  "Interface",
  "Creature",
  "Weather",
  "Foley",
  "Transition",
  "Trailer Hit"
]

// Usage Contexts
const USAGE_CONTEXTS = [
  "Video",
  "Game", 
  "Ad",
  "UI",
  "Ambient Loop",
  "Podcast",
  "Interactive"
]

// Sound Textures
const SOUND_TEXTURES = [
  "Metallic",
  "Organic",
  "Wooden", 
  "Synthetic",
  "Watery",
  "Airy",
  "Stone",
  "Plastic"
]

// Attack Types
const ATTACK_TYPES = [
  "Soft fade",
  "Snappy hit",
  "Sharp transient",
  "Rolling onset"
]

// Audio Quality Options
const AUDIO_QUALITY_OPTIONS = [
  "Studio",
  "Field Recording",
  "Vintage",
  "Lo-fi",
  "Cinematic"
]

// Environment Types
const ENVIRONMENT_TYPES = [
  "Indoor",
  "Outdoor",
  "Large Hall",
  "Open Field",
  "Submerged",
  "Space",
  "Abstract"
]

// Reverb Characters
const REVERB_CHARACTERS = [
  "Dry",
  "Soft Room",
  "Cathedral",
  "Metallic Hall",
  "Cave",
  "Synthetic Space"
]

// Stereo Behaviors
const STEREO_BEHAVIORS = [
  "Mono",
  "Wide Stereo",
  "Circular Pan",
  "Dynamic Sweep"
]

// Ambience Layers
const AMBIENCE_LAYERS = [
  "Rain",
  "Wind",
  "Crowd",
  "Machines",
  "Nature",
  "Silence"
]

// Mood Options
const MOOD_OPTIONS = [
  { value: "tense", label: "Tense", icon: "😬" },
  { value: "peaceful", label: "Peaceful", icon: "🌿" },
  { value: "epic", label: "Epic", icon: "⚡" },
  { value: "tragic", label: "Tragic", icon: "💧" },
  { value: "mysterious", label: "Mysterious", icon: "🌑" },
  { value: "energetic", label: "Energetic", icon: "💥" },
  { value: "dreamy", label: "Dreamy", icon: "🌙" }
]

// Motion Characters
const MOTION_CHARACTERS = [
  "Rising",
  "Falling", 
  "Pulsing",
  "Sustained",
  "Randomized"
]

// Purpose in Scene
const PURPOSE_OPTIONS = [
  "Build-Up",
  "Impact",
  "Transition",
  "Background",
  "Cue",
  "Texture"
]

// Loop Types
const LOOP_TYPES = [
  "Ambient",
  "Pulse",
  "Pattern",
  "Environment"
]

// Smart Preset Map
const SOUND_PRESET_MAP = {
  Impact: {
    texture: "Metallic",
    frequency_focus: 30,
    density: 80,
    attack_type: "Sharp transient",
    tail_length: 25,
    audio_quality: "Cinematic",
    environment: "Large Hall",
    reverb: "Metallic Hall",
    stereo_behavior: "Wide Stereo",
    distance: 40,
    mood: "Epic",
    tension: 90,
    motion_character: "Punch",
    purpose: "Impact",
    duration_seconds: 1.5,
    loop: false,
  },
  Ambience: {
    texture: "Organic",
    frequency_focus: 60,
    density: 70,
    attack_type: "Soft fade",
    tail_length: 80,
    audio_quality: "Field Recording",
    environment: "Outdoor",
    reverb: "Soft Room",
    stereo_behavior: "Circular Pan",
    distance: 70,
    mood: "Peaceful",
    tension: 10,
    motion_character: "Sustained",
    purpose: "Background",
    duration_seconds: 30,
    loop: true,
  },
  Transition: {
    texture: "Synthetic",
    frequency_focus: 50,
    density: 60,
    attack_type: "Rising",
    tail_length: 40,
    audio_quality: "Studio",
    environment: "Abstract",
    reverb: "Synthetic Space",
    stereo_behavior: "Dynamic Sweep",
    distance: 30,
    mood: "Energetic",
    tension: 70,
    motion_character: "Rising",
    purpose: "Transition",
    duration_seconds: 2.5,
    loop: false,
  },
  Foley: {
    texture: "Organic",
    frequency_focus: 40,
    density: 40,
    attack_type: "Soft fade",
    tail_length: 10,
    audio_quality: "Studio",
    environment: "Indoor",
    reverb: "Dry",
    stereo_behavior: "Mono",
    distance: 15,
    mood: "Neutral",
    tension: 20,
    motion_character: "Randomized",
    purpose: "Detail",
    duration_seconds: 3,
    loop: false,
  },
  Weather: {
    texture: "Organic",
    frequency_focus: 60,
    density: 85,
    attack_type: "Gradual",
    tail_length: 70,
    audio_quality: "Field Recording",
    environment: "Outdoor",
    reverb: "Soft Room",
    stereo_behavior: "Wide Stereo",
    distance: 80,
    mood: "Peaceful",
    tension: 15,
    motion_character: "Sustained",
    purpose: "Ambience",
    duration_seconds: 30,
    loop: true,
  },
  TrailerHit: {
    texture: "Metallic",
    frequency_focus: 25,
    density: 90,
    attack_type: "Explosive",
    tail_length: 60,
    audio_quality: "Cinematic",
    environment: "Cathedral",
    reverb: "Metallic Hall",
    stereo_behavior: "Wide Stereo",
    distance: 60,
    mood: "Epic",
    tension: 100,
    motion_character: "Impact",
    purpose: "Cue",
    duration_seconds: 2.2,
    loop: false,
  },
  Creature: {
    texture: "Organic",
    frequency_focus: 45,
    density: 75,
    attack_type: "Snappy hit",
    tail_length: 35,
    audio_quality: "Field Recording",
    environment: "Cave",
    reverb: "Soft Room",
    stereo_behavior: "Wide Stereo",
    distance: 40,
    mood: "Mysterious",
    tension: 60,
    motion_character: "Randomized",
    purpose: "Character",
    duration_seconds: 2,
    loop: false,
  },
  UI: {
    texture: "Synthetic",
    frequency_focus: 70,
    density: 30,
    attack_type: "Snappy hit",
    tail_length: 5,
    audio_quality: "Studio",
    environment: "Indoor",
    reverb: "Dry",
    stereo_behavior: "Mono",
    distance: 10,
    mood: "Friendly",
    tension: 5,
    motion_character: "Pulse",
    purpose: "Interaction",
    duration_seconds: 0.4,
    loop: false,
  },
  MusicLoop: {
    texture: "Synthetic",
    frequency_focus: 55,
    density: 80,
    attack_type: "Soft fade",
    tail_length: 60,
    audio_quality: "Studio",
    environment: "Abstract",
    reverb: "Synthetic Space",
    stereo_behavior: "Circular Pan",
    distance: 50,
    mood: "Energetic",
    tension: 40,
    motion_character: "Rhythmic",
    purpose: "Loop",
    duration_seconds: 20,
    loop: true,
  },
}

export function SoundFxInterface({ onClose, projectTitle }: SoundFxInterfaceProps) {
  const { toast } = useToast()
  
  // Sound Intent & Description
  const [prompt, setPrompt] = useState("")
  const [category, setCategory] = useState("")
  const [usageContext, setUsageContext] = useState("")
  const [worldLink, setWorldLink] = useState("")
  const [seedVariability, setSeedVariability] = useState([50])
  const [referenceUpload, setReferenceUpload] = useState<File | null>(null)
  
  // Acoustic DNA
  const [soundTexture, setSoundTexture] = useState("")
  const [frequencyFocus, setFrequencyFocus] = useState([50])
  const [density, setDensity] = useState([50])
  const [attackType, setAttackType] = useState("")
  const [tailDecay, setTailDecay] = useState([50])
  const [audioQuality, setAudioQuality] = useState("")
  
  // Spatial DNA
  const [environmentType, setEnvironmentType] = useState("")
  const [distanceFromListener, setDistanceFromListener] = useState([50])
  const [reverbCharacter, setReverbCharacter] = useState("")
  const [stereoBehavior, setStereoBehavior] = useState("")
  const [ambienceLayer, setAmbienceLayer] = useState("")
  
  // Emotional DNA
  const [moodContext, setMoodContext] = useState("")
  const [tensionLevel, setTensionLevel] = useState([50])
  const [motionCharacter, setMotionCharacter] = useState("")
  const [purposeInScene, setPurposeInScene] = useState("")
  const [promptInfluence, setPromptInfluence] = useState([50])
  
  // Looping & Duration Controls
  const [duration, setDuration] = useState([2.0])
  const [loopMode, setLoopMode] = useState(false)
  const [loopType, setLoopType] = useState("")
  const [tempoBpm, setTempoBpm] = useState("")
  const [fadeIn, setFadeIn] = useState([0])
  const [fadeOut, setFadeOut] = useState([0])
  
  // Preview & Generation
  const [isGenerating, setIsGenerating] = useState(false)
  const [soundPreviews, setSoundPreviews] = useState<SoundFxPreview[]>([])
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  
  // Export & Save
  const [soundName, setSoundName] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  
  // Smart behavior states
  const [smartMessage, setSmartMessage] = useState("")
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  // Smart behavior logic
  useEffect(() => {
    let message = ""
    
    if (category && SOUND_PRESET_MAP[category as keyof typeof SOUND_PRESET_MAP]) {
      const preset = SOUND_PRESET_MAP[category as keyof typeof SOUND_PRESET_MAP]
      message = `Category '${category}' selected — applying preset: ${preset.texture} texture, ${preset.audio_quality} quality, ${preset.duration_seconds}s duration.`
    } else if (usageContext === "UI") {
      message = "UI context selected — auto-limiting duration to ≤2s for interface sounds."
    } else if (worldLink === "Underwater") {
      message = "Underwater world linked — adding 'muffled & resonant' filter automatically."
    } else if (moodContext === "epic") {
      message = "Epic mood selected — adding bass emphasis and harmonic overtones."
    } else if (moodContext === "dreamy") {
      message = "Dreamy mood selected — adding reverb and soft attack."
    } else if (purposeInScene === "Impact") {
      message = "Impact purpose selected — reducing decay to increase punch."
    } else if (loopMode) {
      message = "Loop mode enabled — forcing duration ≥10s for seamless looping."
    }
    
    setSmartMessage(message)
  }, [category, usageContext, worldLink, moodContext, purposeInScene, loopMode])

  // Apply preset when category changes
  useEffect(() => {
    if (category && SOUND_PRESET_MAP[category as keyof typeof SOUND_PRESET_MAP]) {
      const preset = SOUND_PRESET_MAP[category as keyof typeof SOUND_PRESET_MAP]
      setSoundTexture(preset.texture)
      setFrequencyFocus([preset.frequency_focus])
      setDensity([preset.density])
      setAttackType(preset.attack_type)
      setTailDecay([preset.tail_length])
      setAudioQuality(preset.audio_quality)
      setEnvironmentType(preset.environment)
      setReverbCharacter(preset.reverb)
      setStereoBehavior(preset.stereo_behavior)
      setDistanceFromListener([preset.distance])
      setMoodContext(preset.mood)
      setTensionLevel([preset.tension])
      setMotionCharacter(preset.motion_character)
      setPurposeInScene(preset.purpose)
      setDuration([preset.duration_seconds])
      setLoopMode(preset.loop)
    }
  }, [category])

  const handleGeneratePreviews = async () => {
    setIsGenerating(true)
    try {
      // Simulate API call to generate sound previews
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock sound previews
      const mockPreviews: SoundFxPreview[] = [
        {
          id: "sound_1",
          audio_base_64: "data:audio/mp3;base64,mock_audio_1",
          media_type: "audio/mp3",
          duration_secs: duration[0],
          category: category,
          variation: "Softer"
        },
        {
          id: "sound_2", 
          audio_base_64: "data:audio/mp3;base64,mock_audio_2",
          media_type: "audio/mp3",
          duration_secs: duration[0],
          category: category,
          variation: "Brighter"
        },
        {
          id: "sound_3",
          audio_base_64: "data:audio/mp3;base64,mock_audio_3", 
          media_type: "audio/mp3",
          duration_secs: duration[0],
          category: category,
          variation: "More Intense"
        }
      ]
      
      setSoundPreviews(mockPreviews)
      toast({
        title: "Sound FX previews generated!",
        description: "Three variations are ready for comparison."
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

  const handlePlayPreview = (previewId: string) => {
    if (isPlaying === previewId) {
      setIsPlaying(null)
      audioRefs.current[previewId]?.pause()
    } else {
      setIsPlaying(previewId)
      // In real implementation, would play the actual audio
      console.log(`Playing preview ${previewId}`)
    }
  }

  const handleSaveSound = async () => {
    if (!soundName.trim()) {
      toast({
        title: "Sound name required",
        description: "Please enter a name for your sound.",
        variant: "destructive"
      })
      return
    }

    if (!selectedPreview) {
      toast({
        title: "Select a preview",
        description: "Please select a sound preview to save.",
        variant: "destructive"
      })
      return
    }

    try {
      const soundData = {
        name: soundName,
        generated_sound_id: selectedPreview,
        prompt,
        category,
        usage_context: usageContext,
        world_link: worldLink,
        seed_variability: seedVariability[0],
        sound_texture: soundTexture,
        frequency_focus: frequencyFocus[0],
        density: density[0],
        attack_type: attackType,
        tail_decay: tailDecay[0],
        audio_quality: audioQuality,
        environment_type: environmentType,
        distance_from_listener: distanceFromListener[0],
        reverb_character: reverbCharacter,
        stereo_behavior: stereoBehavior,
        ambience_layer: ambienceLayer,
        mood_context: moodContext,
        tension_level: tensionLevel[0],
        motion_character: motionCharacter,
        purpose_in_scene: purposeInScene,
        prompt_influence: promptInfluence[0],
        duration: duration[0],
        loop_mode: loopMode,
        loop_type: loopType,
        tempo_bpm: tempoBpm,
        fade_in: fadeIn[0],
        fade_out: fadeOut[0],
        tags,
        created_at: new Date().toISOString()
      }

      // API call to save sound
      const response = await fetch('/api/sound-fx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(soundData)
      })

      if (response.ok) {
        toast({
          title: "Sound FX saved successfully!",
          description: `Sound '${soundName}' is now part of your DreamCut Sound Library.`
        })
        onClose()
      } else {
        throw new Error('Failed to save sound')
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Sound FX Studio</h2>
            <p className="text-muted-foreground">Craft emotionally intelligent sound design synchronized with your world's mood and story.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-8">
          
          {/* Sound Intent & Description Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                1️⃣ Sound Intent & Description
              </CardTitle>
              <CardDescription>
                Understand the purpose of the sound — what it represents and why it exists.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label>Prompt / Description</Label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A metallic door sliding open with a pneumatic hiss."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category / Use Case</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOUND_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Usage Context</Label>
                  <Select value={usageContext} onValueChange={setUsageContext}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select context" />
                    </SelectTrigger>
                    <SelectContent>
                      {USAGE_CONTEXTS.map((context) => (
                        <SelectItem key={context} value={context.toLowerCase()}>
                          {context}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>World Link (optional)</Label>
                  <Select value={worldLink} onValueChange={setWorldLink}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select world" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cyber-tokyo">Cyber Tokyo</SelectItem>
                      <SelectItem value="zen-oasis">Zen Oasis</SelectItem>
                      <SelectItem value="desert-bazaar">Desert Bazaar</SelectItem>
                      <SelectItem value="space-temple">Space Temple</SelectItem>
                      <SelectItem value="underwater">Underwater</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Seed Variability: {seedVariability[0]}</Label>
                  <Slider
                    value={seedVariability}
                    onValueChange={setSeedVariability}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Predictable</span>
                    <span>Creative Variations</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reference Upload (optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setReferenceUpload(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground italic">
                "For trailer-style impacts, consider using lower prompt variability to ensure repeatable results."
              </div>
            </CardContent>
          </Card>

          {/* Acoustic DNA Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                2️⃣ Acoustic DNA
              </CardTitle>
              <CardDescription>
                Define the physical and tonal properties of the sound — its texture, density, and tone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Sound Texture</Label>
                  <Select value={soundTexture} onValueChange={setSoundTexture}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select texture" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOUND_TEXTURES.map((texture) => (
                        <SelectItem key={texture} value={texture.toLowerCase()}>
                          {texture}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Frequency Focus: {frequencyFocus[0]}</Label>
                  <Slider
                    value={frequencyFocus}
                    onValueChange={setFrequencyFocus}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low-end (bass heavy)</span>
                    <span>High-end (crisp detail)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Density: {density[0]}</Label>
                  <Slider
                    value={density}
                    onValueChange={setDensity}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Sparse</span>
                    <span>Rich / Layered</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Attack Type</Label>
                  <Select value={attackType} onValueChange={setAttackType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select attack" />
                    </SelectTrigger>
                    <SelectContent>
                      {ATTACK_TYPES.map((attack) => (
                        <SelectItem key={attack} value={attack.toLowerCase()}>
                          {attack}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tail / Decay: {tailDecay[0]}</Label>
                  <Slider
                    value={tailDecay}
                    onValueChange={setTailDecay}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Short (dry)</span>
                    <span>Long (reverberant)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Audio Quality</Label>
                  <Select value={audioQuality} onValueChange={setAudioQuality}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      {AUDIO_QUALITY_OPTIONS.map((quality) => (
                        <SelectItem key={quality} value={quality.toLowerCase()}>
                          {quality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-sm text-muted-foreground italic">
                "A 'metallic' sound with long decay and low frequencies will feel like a deep industrial impact."
              </div>
            </CardContent>
          </Card>

          {/* Spatial DNA Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                3️⃣ Spatial DNA
              </CardTitle>
              <CardDescription>
                Define where the sound lives — its perceived environment and listener perspective.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Environment Type</Label>
                  <Select value={environmentType} onValueChange={setEnvironmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENVIRONMENT_TYPES.map((env) => (
                        <SelectItem key={env} value={env.toLowerCase()}>
                          {env}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Distance from Listener: {distanceFromListener[0]}</Label>
                  <Slider
                    value={distanceFromListener}
                    onValueChange={setDistanceFromListener}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Near-field (ASMR)</span>
                    <span>Far-field (distant echo)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reverb Character</Label>
                  <Select value={reverbCharacter} onValueChange={setReverbCharacter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reverb" />
                    </SelectTrigger>
                    <SelectContent>
                      {REVERB_CHARACTERS.map((reverb) => (
                        <SelectItem key={reverb} value={reverb.toLowerCase()}>
                          {reverb}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Stereo Behavior</Label>
                  <Select value={stereoBehavior} onValueChange={setStereoBehavior}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stereo" />
                    </SelectTrigger>
                    <SelectContent>
                      {STEREO_BEHAVIORS.map((stereo) => (
                        <SelectItem key={stereo} value={stereo.toLowerCase()}>
                          {stereo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ambience Layer (optional)</Label>
                  <Select value={ambienceLayer} onValueChange={setAmbienceLayer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ambience" />
                    </SelectTrigger>
                    <SelectContent>
                      {AMBIENCE_LAYERS.map((ambience) => (
                        <SelectItem key={ambience} value={ambience.toLowerCase()}>
                          {ambience}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-sm text-muted-foreground italic">
                "Adding a circular stereo pan makes this transition sound more cinematic."
              </div>
            </CardContent>
          </Card>

          {/* Emotional DNA Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                4️⃣ Emotional DNA
              </CardTitle>
              <CardDescription>
                Embed story-driven emotion and pacing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Mood Context</Label>
                  <RadioGroup value={moodContext} onValueChange={setMoodContext} className="grid grid-cols-2 gap-3">
                    {MOOD_OPTIONS.map((mood) => (
                      <div key={mood.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={mood.value} id={mood.value} />
                        <Label htmlFor={mood.value} className="flex items-center gap-2">
                          <span>{mood.icon}</span>
                          {mood.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Tension Level: {tensionLevel[0]}</Label>
                  <Slider
                    value={tensionLevel}
                    onValueChange={setTensionLevel}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Calm</span>
                    <span>Intense</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Motion Character</Label>
                  <Select value={motionCharacter} onValueChange={setMotionCharacter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select motion" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOTION_CHARACTERS.map((motion) => (
                        <SelectItem key={motion} value={motion.toLowerCase()}>
                          {motion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Purpose in Scene</Label>
                  <Select value={purposeInScene} onValueChange={setPurposeInScene}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {PURPOSE_OPTIONS.map((purpose) => (
                        <SelectItem key={purpose} value={purpose.toLowerCase()}>
                          {purpose}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prompt Influence: {promptInfluence[0]}</Label>
                  <Slider
                    value={promptInfluence}
                    onValueChange={setPromptInfluence}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Creative Freedom</span>
                    <span>Strict Prompt Adherence</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground italic">
                "Tense + Rising motion produces cinematic whoosh-type build-ups."
              </div>
            </CardContent>
          </Card>

          {/* Looping & Duration Controls Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                5️⃣ Looping & Duration Controls
              </CardTitle>
              <CardDescription>
                Define how the sound behaves over time and in repetition.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Duration (seconds): {duration[0]}</Label>
                  <Slider
                    value={duration}
                    onValueChange={setDuration}
                    min={0.5}
                    max={30.0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.5s</span>
                    <span>30.0s</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="loop-mode"
                    checked={loopMode}
                    onCheckedChange={setLoopMode}
                  />
                  <Label htmlFor="loop-mode">Loop Mode</Label>
                </div>

                {loopMode && (
                  <div className="space-y-2">
                    <Label>Loop Type</Label>
                    <Select value={loopType} onValueChange={setLoopType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select loop type" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOOP_TYPES.map((type) => (
                          <SelectItem key={type} value={type.toLowerCase()}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Tempo / BPM (optional)</Label>
                  <Input
                    value={tempoBpm}
                    onChange={(e) => setTempoBpm(e.target.value)}
                    placeholder="120"
                    type="number"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fade In: {fadeIn[0]}s</Label>
                  <Slider
                    value={fadeIn}
                    onValueChange={setFadeIn}
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fade Out: {fadeOut[0]}s</Label>
                  <Slider
                    value={fadeOut}
                    onValueChange={setFadeOut}
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground italic">
                "30-second ambient loop is perfect for background worlds or menu screens."
              </div>
            </CardContent>
          </Card>

          {/* Preview & Generation Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                6️⃣ Preview & Generation
              </CardTitle>
              <CardDescription>
                Generate 3 variations, compare, and fine-tune your sound.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={handleGeneratePreviews}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    🎵 Crafting your sound...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Sound FX Previews
                  </>
                )}
              </Button>

              {soundPreviews.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {soundPreviews.map((preview) => (
                      <Card key={preview.id} className={cn(
                        "cursor-pointer transition-all",
                        selectedPreview === preview.id && "ring-2 ring-primary"
                      )} onClick={() => setSelectedPreview(preview.id)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary">{preview.variation}</Badge>
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
                          <div className="text-sm text-muted-foreground">
                            {preview.duration_secs}s • {preview.category}
                          </div>
                          {/* Waveform visualization would go here */}
                          <div className="h-8 bg-muted rounded mt-2 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Waveform</span>
                          </div>
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
                7️⃣ Export & Save
              </CardTitle>
              <CardDescription>
                Name, tag, and store the selected sound as a reusable Sound Kit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Sound Name</Label>
                  <Input
                    value={soundName}
                    onChange={(e) => setSoundName(e.target.value)}
                    placeholder="e.g., Cyber Door Slide"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSound} className="w-full" size="lg">
                <Save className="h-4 w-4 mr-2" />
                Save Sound Kit
              </Button>
            </CardContent>
          </Card>

          {/* Smart Message */}
          {smartMessage && (
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">{smartMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveSound} disabled={!soundName.trim() || !selectedPreview}>
            <Save className="h-4 w-4 mr-2" />
            Save Sound
          </Button>
        </div>
      </div>
    </div>
  )
}


