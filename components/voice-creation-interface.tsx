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
  Sun
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface VoiceCreationInterfaceProps {
  onClose: () => void
  projectTitle?: string
}

interface VoicePreview {
  id: string
  audio_base_64: string
  media_type: string
  duration_secs: number
  language: string
  variation: string
}

const VOICE_PURPOSES = [
  "Narrator",
  "Character", 
  "Brand Voice",
  "Educator",
  "AI Persona",
  "Game NPC",
  "Customer Service",
  "Virtual Assistant",
  "Podcast Host",
  "Documentary Voice",
  "Commercial Voice",
  "Audiobook Reader",
  "E-learning Instructor",
  "News Anchor",
  "Radio DJ",
  "Storyteller",
  "Meditation Guide",
  "ASMR Content Creator"
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

const GENDER_OPTIONS = [
  "Male",
  "Female", 
  "Androgynous",
  "Non-binary",
  "Robotic",
  "Creature",
  "Child-like",
  "Elderly",
  "ASMR Whisper"
]

const AGE_OPTIONS = [
  "Child",
  "Teen",
  "Young Adult", 
  "Mid-aged",
  "Senior"
]

const ACCENT_OPTIONS = [
  "Neutral American",
  "British (RP)",
  "British (Cockney)",
  "Scottish",
  "Irish",
  "Australian",
  "Canadian",
  "Southern US",
  "New York",
  "California",
  "Texas",
  "Indian",
  "South African",
  "New Zealand",
  "French",
  "German",
  "Italian",
  "Spanish",
  "Russian",
  "Japanese",
  "Chinese",
  "Korean",
  "Arabic",
  "Brazilian Portuguese",
  "Mexican Spanish",
  "Argentine Spanish",
  "No Accent (Neutral)"
]

const TONE_OPTIONS = [
  "Warm",
  "Deep", 
  "Smooth",
  "Raspy",
  "Light",
  "Breathy",
  "Metallic",
  "Resonant",
  "Crisp",
  "Mellow",
  "Sharp",
  "Soft",
  "Rich",
  "Clear",
  "Husky",
  "Velvety",
  "Gravelly",
  "Silky",
  "Brittle",
  "ASMR Whisper",
  "Meditation Tone",
  "Sleepy Voice"
]

const PACING_OPTIONS = [
  "Slow",
  "Conversational",
  "Fast", 
  "Measured",
  "Erratic"
]

const FIDELITY_OPTIONS = [
  "Studio",
  "Broadcast",
  "Vintage",
  "Phone",
  "Robotic",
  "High Definition",
  "Professional",
  "Consumer",
  "Podcast Quality",
  "Radio Quality",
  "TV Quality",
  "Streaming Quality",
  "ASMR Quality",
  "Meditation Quality",
  "Lo-fi",
  "Hi-fi"
]

const MOOD_OPTIONS = [
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

const ROLE_OPTIONS = [
  "Hero",
  "Villain",
  "Mentor",
  "Narrator",
  "Teacher",
  "Announcer",
  "AI Guide",
  "Sidekick",
  "Protagonist",
  "Antagonist",
  "Supporting Character",
  "Background Character",
  "Customer Service Rep",
  "Virtual Assistant",
  "Podcast Host",
  "News Reporter",
  "Documentary Narrator",
  "Commercial Voice",
  "Audiobook Reader",
  "E-learning Instructor",
  "Radio DJ",
  "Storyteller",
  "Meditation Guide",
  "ASMR Artist",
  "Sleep Storyteller",
  "Relaxation Coach"
]

const STYLE_OPTIONS = [
  "Natural",
  "Cinematic",
  "Theatrical",
  "Sarcastic",
  "Dreamy",
  "Whispered",
  "Commanding",
  "Conversational",
  "Formal",
  "Casual",
  "Dramatic",
  "Monotone",
  "Expressive",
  "Subtle",
  "Over-the-top",
  "Intimate",
  "Professional",
  "Friendly",
  "Authoritative",
  "Gentle",
  "ASMR Style",
  "Meditation Style",
  "Sleep Story Style",
  "Relaxation Style"
]

const AUDIO_QUALITY_OPTIONS = [
  "Studio-grade",
  "Cinematic Mix",
  "Lo-fi",
  "Phone",
  "Vintage Tape",
  "High Definition",
  "Professional",
  "Broadcast Quality",
  "Podcast Quality",
  "Radio Quality",
  "TV Quality",
  "Streaming Quality",
  "ASMR Quality",
  "Meditation Quality",
  "Sleep Quality",
  "Relaxation Quality",
  "Consumer Grade",
  "Hi-fi",
  "Lossless"
]

const BRAND_PERSONA_OPTIONS = [
  "Inspiring",
  "Friendly",
  "Expert",
  "Mysterious",
  "Energetic",
  "Neutral",
  "Professional",
  "Casual",
  "Authoritative",
  "Approachable",
  "Trustworthy",
  "Innovative",
  "Traditional",
  "Modern",
  "Luxury",
  "Affordable",
  "Premium",
  "Reliable",
  "Creative",
  "Technical",
  "Warm",
  "Cool",
  "Calm",
  "Exciting",
  "Soothing",
  "ASMR-friendly"
]

const SCRIPT_TONE_OPTIONS = [
  "Informative",
  "Emotional",
  "Conversational",
  "Corporate",
  "Dramatic",
  "Professional",
  "Casual",
  "Formal",
  "Friendly",
  "Authoritative",
  "Gentle",
  "Energetic",
  "Calm",
  "Soothing",
  "Meditative",
  "ASMR",
  "Sleep-inducing",
  "Relaxing",
  "Motivational",
  "Educational",
  "Entertaining",
  "Persuasive",
  "Neutral",
  "Warm",
  "Cool"
]

const ASMR_TRIGGERS = [
  "Whispering",
  "Soft Speaking",
  "Breathing Sounds",
  "Mouth Sounds",
  "Tapping",
  "Scratching",
  "Brushing",
  "Paper Sounds",
  "Water Sounds",
  "Nature Sounds",
  "White Noise",
  "Pink Noise",
  "Brown Noise",
  "Rain Sounds",
  "Ocean Waves",
  "Wind Sounds",
  "Fire Crackling",
  "Birds Chirping"
]

const ASMR_BACKGROUND_OPTIONS = [
  "None",
  "Soft Rain",
  "Ocean Waves",
  "Forest Sounds",
  "White Noise",
  "Pink Noise",
  "Brown Noise",
  "Fire Crackling",
  "Wind Through Trees",
  "Birds Chirping",
  "Gentle Music",
  "Ambient Sounds",
  "Meditation Bells",
  "Singing Bowl"
]

// Sound FX Integration Options
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

const USAGE_CONTEXTS = [
  "Video",
  "Game", 
  "Ad",
  "UI",
  "Ambient Loop",
  "Podcast",
  "Interactive"
]

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

const ATTACK_TYPES = [
  "Soft fade",
  "Snappy hit",
  "Sharp transient",
  "Rolling onset"
]

const ENVIRONMENT_STYLES = [
  "Indoor",
  "Outdoor",
  "Large Hall",
  "Open Field",
  "Submerged",
  "Space",
  "Abstract"
]

const REVERB_CHARACTERS = [
  "Dry",
  "Soft Room",
  "Cathedral",
  "Metallic Hall",
  "Cave",
  "Synthetic Space"
]

const STEREO_BEHAVIORS = [
  "Mono",
  "Wide Stereo",
  "Circular Pan",
  "Dynamic Sweep"
]

const AMBIENCE_LAYERS = [
  "Rain",
  "Wind",
  "Crowd",
  "Machines",
  "Nature",
  "Silence"
]

const MOTION_CHARACTERS = [
  "Rising",
  "Falling", 
  "Pulsing",
  "Sustained",
  "Randomized"
]

const PURPOSE_IN_SCENE_OPTIONS = [
  "Build-Up",
  "Impact",
  "Transition",
  "Background",
  "Cue",
  "Texture"
]

export function VoiceCreationInterface({ onClose, projectTitle }: VoiceCreationInterfaceProps) {
  const { toast } = useToast()
  
  // Voice Identity
  const [voicePurpose, setVoicePurpose] = useState("")
  const [language, setLanguage] = useState("English")
  const [gender, setGender] = useState("")
  const [perceivedAge, setPerceivedAge] = useState("")
  const [accent, setAccent] = useState("")
  const [tone, setTone] = useState("")
  const [pitchLevel, setPitchLevel] = useState([50])
  const [pacing, setPacing] = useState("")
  const [fidelity, setFidelity] = useState("")
  
  // Emotional DNA
  const [moodContext, setMoodContext] = useState("")
  const [emotionalWeight, setEmotionalWeight] = useState([50])
  const [characterRole, setCharacterRole] = useState("")
  const [performanceStyle, setPerformanceStyle] = useState("")
  const [audioQualityIntent, setAudioQualityIntent] = useState("")
  const [guidanceScale, setGuidanceScale] = useState([50])
  const [previewText, setPreviewText] = useState("Welcome to DreamCut — where stories find their voice.")
  const [autoGeneratePreview, setAutoGeneratePreview] = useState(false)
  
  // Brand / World Sync
  const [brandSync, setBrandSync] = useState(false)
  const [worldLink, setWorldLink] = useState("")
  const [toneMatchLevel, setToneMatchLevel] = useState([50])
  const [brandPersonaMatching, setBrandPersonaMatching] = useState("")
  const [defaultScriptTone, setDefaultScriptTone] = useState("")
  
  // ASMR Voice Options
  const [isASMRVoice, setIsASMRVoice] = useState(false)
  const [asmrIntensity, setAsmrIntensity] = useState([50])
  const [asmrTriggers, setAsmrTriggers] = useState<string[]>([])
  const [asmrBackground, setAsmrBackground] = useState("")
  
  // Sound FX Integration Options
  const [soundCategory, setSoundCategory] = useState("")
  const [usageContext, setUsageContext] = useState("")
  const [soundTexture, setSoundTexture] = useState("")
  const [attackType, setAttackType] = useState("")
  const [environmentStyle, setEnvironmentStyle] = useState("")
  const [reverbCharacter, setReverbCharacter] = useState("")
  const [stereoBehavior, setStereoBehavior] = useState("")
  const [ambienceLayer, setAmbienceLayer] = useState("")
  const [motionCharacter, setMotionCharacter] = useState("")
  const [purposeInScene, setPurposeInScene] = useState("")
  
  // Preview & Fine-tuning
  const [isGenerating, setIsGenerating] = useState(false)
  const [voicePreviews, setVoicePreviews] = useState<VoicePreview[]>([])
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null)
  const [fineTuningPitch, setFineTuningPitch] = useState([50])
  const [fineTuningSpeed, setFineTuningSpeed] = useState([50])
  const [fineTuningVolume, setFineTuningVolume] = useState([50])
  const [fineTuningWarmth, setFineTuningWarmth] = useState([50])
  const [fineTuningBreathiness, setFineTuningBreathiness] = useState([50])
  
  // Export & Save
  const [voiceName, setVoiceName] = useState("")
  const [voiceId, setVoiceId] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  
  // Smart behavior states
  const [smartMessage, setSmartMessage] = useState("")
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  // Smart behavior logic
  useEffect(() => {
    let message = ""
    
    if (isASMRVoice) {
      message = "ASMR voice enabled — whisper mode activated, background sounds available, enhanced binaural processing."
    } else if (gender === "Robotic" || gender === "Creature") {
      message = "Robotic/Creature voice selected — accent options disabled, modulation depth available."
    } else if (gender === "ASMR Whisper" || tone === "ASMR Whisper") {
      message = "ASMR whisper detected — soft speaking mode, enhanced audio processing for relaxation."
    } else if (fidelity === "Broadcast") {
      message = "Broadcast quality selected — room reverb toggle available."
    } else if (moodContext === "playful") {
      message = "Playful mood selected — pitch and pacing automatically raised."
    } else if (performanceStyle === "theatrical") {
      message = "Theatrical style selected — natural dynamic range applied."
    } else if (audioQualityIntent === "lo-fi") {
      message = "Lo-fi quality selected — gentle distortion filter applied."
    } else if (audioQualityIntent === "ASMR Quality" || audioQualityIntent === "Meditation Quality") {
      message = "ASMR/Meditation quality selected — enhanced binaural audio, whisper-friendly processing."
    } else if (brandSync) {
      message = "Brand sync enabled — tone locked to brand guidelines."
    } else if (worldLink) {
      message = `World '${worldLink}' linked — environmental reverb simulation enabled.`
    } else if (voicePurpose === "ASMR Content Creator" || characterRole === "ASMR Artist") {
      message = "ASMR content detected — whisper mode recommended, background sounds available."
    } else if (soundCategory) {
      message = `Sound category '${soundCategory}' selected — applying acoustic DNA and spatial characteristics.`
    } else if (usageContext === "UI") {
      message = "UI context selected — optimizing for short, crisp interface sounds."
    } else if (environmentStyle === "Space") {
      message = "Space environment selected — adding cosmic reverb and air filter effects."
    } else if (reverbCharacter === "Cathedral") {
      message = "Cathedral reverb selected — adding majestic, spacious audio processing."
    } else if (stereoBehavior === "Dynamic Sweep") {
      message = "Dynamic stereo sweep enabled — creating cinematic movement effects."
    } else if (motionCharacter === "Rising") {
      message = "Rising motion selected — building tension and crescendo effects."
    } else if (purposeInScene === "Impact") {
      message = "Impact purpose selected — emphasizing attack and punch characteristics."
    }
    
    setSmartMessage(message)
  }, [isASMRVoice, gender, fidelity, moodContext, performanceStyle, audioQualityIntent, brandSync, worldLink, voicePurpose, characterRole, tone, soundCategory, usageContext, environmentStyle, reverbCharacter, stereoBehavior, motionCharacter, purposeInScene])

  const handleGeneratePreviews = async () => {
    setIsGenerating(true)
    try {
      // Simulate API call to generate voice previews
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock voice previews
      const mockPreviews: VoicePreview[] = [
        {
          id: "voice_1",
          audio_base_64: "data:audio/mp3;base64,mock_audio_1",
          media_type: "audio/mp3",
          duration_secs: 3.2,
          language: language,
          variation: "Softer"
        },
        {
          id: "voice_2", 
          audio_base_64: "data:audio/mp3;base64,mock_audio_2",
          media_type: "audio/mp3",
          duration_secs: 3.1,
          language: language,
          variation: "Brighter"
        },
        {
          id: "voice_3",
          audio_base_64: "data:audio/mp3;base64,mock_audio_3", 
          media_type: "audio/mp3",
          duration_secs: 3.3,
          language: language,
          variation: "More Confident"
        }
      ]
      
      setVoicePreviews(mockPreviews)
      toast({
        title: "Voice previews generated!",
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

  const handleSaveVoice = async () => {
    if (!voiceName.trim()) {
      toast({
        title: "Voice name required",
        description: "Please enter a name for your voice.",
        variant: "destructive"
      })
      return
    }

    if (!selectedPreview) {
      toast({
        title: "Select a preview",
        description: "Please select a voice preview to save.",
        variant: "destructive"
      })
      return
    }

    try {
      const voiceData = {
        name: voiceName,
        generated_voice_id: selectedPreview,
        purpose: voicePurpose,
        language,
        gender,
        age: perceivedAge,
        accent,
        tone,
        pitch: pitchLevel[0],
        pacing,
        fidelity,
        mood: moodContext,
        emotional_weight: emotionalWeight[0],
        role: characterRole,
        style: performanceStyle,
        audio_quality: audioQualityIntent,
        guidance_scale: guidanceScale[0],
        preview_text: previewText,
        brand_sync: brandSync,
        world_link: worldLink,
        tone_match: toneMatchLevel[0],
        is_asmr_voice: isASMRVoice,
        asmr_intensity: asmrIntensity[0],
        asmr_triggers: asmrTriggers,
        asmr_background: asmrBackground,
        // Sound FX Integration
        sound_category: soundCategory,
        usage_context: usageContext,
        sound_texture: soundTexture,
        attack_type: attackType,
        environment_style: environmentStyle,
        reverb_character: reverbCharacter,
        stereo_behavior: stereoBehavior,
        ambience_layer: ambienceLayer,
        motion_character: motionCharacter,
        purpose_in_scene: purposeInScene,
        tags,
        created_at: new Date().toISOString()
      }

      // API call to save voice
      const response = await fetch('/api/voice-creation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voiceData)
      })

      if (response.ok) {
        toast({
          title: "Voice saved successfully!",
          description: `Voice '${voiceName}' is now part of your DreamCut Voice Library.`
        })
        onClose()
      } else {
        throw new Error('Failed to save voice')
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
            <h2 className="text-2xl font-bold">Voice Creation</h2>
            <p className="text-muted-foreground">Craft unique, emotionally intelligent voices that match your world's DNA.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-8">
          
          {/* Voice Identity Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                1️⃣ Voice Identity
              </CardTitle>
              <CardDescription>
                Define the vocal core — who is speaking, from where, and with what sound.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Voice Purpose</Label>
                  <Select value={voicePurpose} onValueChange={setVoicePurpose}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICE_PURPOSES.map((purpose) => (
                        <SelectItem key={purpose} value={purpose.toLowerCase()}>
                          {purpose}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                  <Label>Gender / Timbre Base</Label>
                  <RadioGroup value={gender} onValueChange={setGender} className="flex flex-wrap gap-4">
                    {GENDER_OPTIONS.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.toLowerCase()} id={option} />
                        <Label htmlFor={option}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Perceived Age</Label>
                  <Select value={perceivedAge} onValueChange={setPerceivedAge}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_OPTIONS.map((age) => (
                        <SelectItem key={age} value={age.toLowerCase()}>
                          {age}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Accent / Region</Label>
                  <Select 
                    value={accent} 
                    onValueChange={setAccent}
                    disabled={gender === "robotic" || gender === "creature"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select accent" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCENT_OPTIONS.map((accentOption) => (
                        <SelectItem key={accentOption} value={accentOption.toLowerCase()}>
                          {accentOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tone / Timbre</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map((toneOption) => (
                        <SelectItem key={toneOption} value={toneOption.toLowerCase()}>
                          {toneOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Pitch Level: {pitchLevel[0]}</Label>
                  <Slider
                    value={pitchLevel}
                    onValueChange={setPitchLevel}
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
                  <Label>Pacing / Rhythm</Label>
                  <Select value={pacing} onValueChange={setPacing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pacing" />
                    </SelectTrigger>
                    <SelectContent>
                      {PACING_OPTIONS.map((pacingOption) => (
                        <SelectItem key={pacingOption} value={pacingOption.toLowerCase()}>
                          {pacingOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Clarity / Fidelity</Label>
                  <Select value={fidelity} onValueChange={setFidelity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fidelity" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIDELITY_OPTIONS.map((fidelityOption) => (
                        <SelectItem key={fidelityOption} value={fidelityOption.toLowerCase()}>
                          {fidelityOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-sm text-muted-foreground italic">
                "Describe the physical quality of this voice — its texture, pace, and tone."
              </div>
            </CardContent>
          </Card>

          {/* Emotional DNA Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                2️⃣ Emotional DNA
              </CardTitle>
              <CardDescription>
                Shape the emotional and performance context.
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
                  <Label>Emotional Weight: {emotionalWeight[0]}</Label>
                  <Slider
                    value={emotionalWeight}
                    onValueChange={setEmotionalWeight}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subtle</span>
                    <span>Expressive</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Character Role</Label>
                  <Select value={characterRole} onValueChange={setCharacterRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role} value={role.toLowerCase()}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Performance Style</Label>
                  <Select value={performanceStyle} onValueChange={setPerformanceStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLE_OPTIONS.map((style) => (
                        <SelectItem key={style} value={style.toLowerCase()}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Audio Quality Intent</Label>
                  <Select value={audioQualityIntent} onValueChange={setAudioQualityIntent}>
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

                <div className="space-y-2">
                  <Label>Guidance Scale: {guidanceScale[0]}</Label>
                  <Slider
                    value={guidanceScale}
                    onValueChange={setGuidanceScale}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Creative Variation</span>
                    <span>Prompt Adherence</span>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Text to Preview</Label>
                  <Textarea
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    placeholder="Enter text to preview the voice..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-generate"
                    checked={autoGeneratePreview}
                    onCheckedChange={setAutoGeneratePreview}
                  />
                  <Label htmlFor="auto-generate">Auto-generate Preview Text</Label>
                </div>
              </div>

              <div className="text-sm text-muted-foreground italic">
                "Cinematic + Dramatic will apply reverb and deeper EQ tone."
              </div>
            </CardContent>
          </Card>

          {/* Brand / World Sync Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                3️⃣ Brand / World Sync
              </CardTitle>
              <CardDescription>
                Connect the voice tone with the brand or story world it belongs to.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="brand-sync"
                    checked={brandSync}
                    onCheckedChange={setBrandSync}
                  />
                  <Label htmlFor="brand-sync">Brand Sync</Label>
                </div>

                <div className="space-y-2">
                  <Label>World Link</Label>
                  <Select value={worldLink} onValueChange={setWorldLink}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select world" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cyber-tokyo">Cyber Tokyo</SelectItem>
                      <SelectItem value="zen-oasis">Zen Oasis</SelectItem>
                      <SelectItem value="steampunk-london">Steampunk London</SelectItem>
                      <SelectItem value="space-station">Space Station</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tone Match Level: {toneMatchLevel[0]}</Label>
                  <Slider
                    value={toneMatchLevel}
                    onValueChange={setToneMatchLevel}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                    disabled={brandSync}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Independent</span>
                    <span>Full Match</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Brand Persona Matching</Label>
                  <Select value={brandPersonaMatching} onValueChange={setBrandPersonaMatching}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select persona" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAND_PERSONA_OPTIONS.map((persona) => (
                        <SelectItem key={persona} value={persona.toLowerCase()}>
                          {persona}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Script Tone</Label>
                  <Select value={defaultScriptTone} onValueChange={setDefaultScriptTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCRIPT_TONE_OPTIONS.map((tone) => (
                        <SelectItem key={tone} value={tone.toLowerCase()}>
                          {tone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-sm text-muted-foreground italic">
                "Your world's tone is Mysterious — softening consonants and lowering treble to match."
              </div>
            </CardContent>
          </Card>

          {/* ASMR Voice Options Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                🎧 ASMR Voice Options
              </CardTitle>
              <CardDescription>
                Specialized settings for ASMR content creation and relaxation-focused voices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="asmr-voice"
                  checked={isASMRVoice}
                  onCheckedChange={setIsASMRVoice}
                />
                <Label htmlFor="asmr-voice">Enable ASMR Voice Mode</Label>
              </div>

              {isASMRVoice && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>ASMR Intensity: {asmrIntensity[0]}</Label>
                      <Slider
                        value={asmrIntensity}
                        onValueChange={setAsmrIntensity}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Subtle</span>
                        <span>Intense</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Background Sound</Label>
                      <Select value={asmrBackground} onValueChange={setAsmrBackground}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select background" />
                        </SelectTrigger>
                        <SelectContent>
                          {ASMR_BACKGROUND_OPTIONS.map((background) => (
                            <SelectItem key={background} value={background.toLowerCase()}>
                              {background}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>ASMR Triggers</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {ASMR_TRIGGERS.map((trigger) => (
                        <div key={trigger} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={trigger}
                            checked={asmrTriggers.includes(trigger)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAsmrTriggers([...asmrTriggers, trigger])
                              } else {
                                setAsmrTriggers(asmrTriggers.filter(t => t !== trigger))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={trigger} className="text-sm">{trigger}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground italic">
                    "ASMR mode enables whisper processing, binaural audio, and relaxation-optimized sound quality."
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sound FX Integration Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                🎵 Sound FX Integration
              </CardTitle>
              <CardDescription>
                Enhance your voice with cinematic sound design and spatial audio characteristics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Category / Use Case</Label>
                  <Select value={soundCategory} onValueChange={setSoundCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOUND_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
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
                  <Label>Environment Style</Label>
                  <Select value={environmentStyle} onValueChange={setEnvironmentStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENVIRONMENT_STYLES.map((env) => (
                        <SelectItem key={env} value={env.toLowerCase()}>
                          {env}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      {PURPOSE_IN_SCENE_OPTIONS.map((purpose) => (
                        <SelectItem key={purpose} value={purpose.toLowerCase()}>
                          {purpose}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-sm text-muted-foreground italic">
                "Sound FX integration adds cinematic depth and spatial characteristics to your voice, creating immersive audio experiences."
              </div>
            </CardContent>
          </Card>

          {/* Preview & Fine-tuning Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                5️⃣ Preview & Fine-Tuning
              </CardTitle>
              <CardDescription>
                Generate 3 variations, compare, and fine-tune your voice.
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
                    🎙️ Crafting your audition...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Generate Voice Previews
                  </>
                )}
              </Button>

              {voicePreviews.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {voicePreviews.map((preview) => (
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
                            {preview.duration_secs}s • {preview.language}
                          </div>
                          {/* Waveform visualization would go here */}
                          <div className="h-8 bg-muted rounded mt-2 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Waveform</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Fine-tuning Controls</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Pitch: {fineTuningPitch[0]}</Label>
                        <Slider
                          value={fineTuningPitch}
                          onValueChange={setFineTuningPitch}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Speed: {fineTuningSpeed[0]}</Label>
                        <Slider
                          value={fineTuningSpeed}
                          onValueChange={setFineTuningSpeed}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Volume: {fineTuningVolume[0]}</Label>
                        <Slider
                          value={fineTuningVolume}
                          onValueChange={setFineTuningVolume}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Warmth: {fineTuningWarmth[0]}</Label>
                        <Slider
                          value={fineTuningWarmth}
                          onValueChange={setFineTuningWarmth}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Breathiness: {fineTuningBreathiness[0]}</Label>
                        <Slider
                          value={fineTuningBreathiness}
                          onValueChange={setFineTuningBreathiness}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                    </div>
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
                6️⃣ Export & Save
              </CardTitle>
              <CardDescription>
                Name, tag, and store the selected voice as a reusable Voice Kit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Voice Name</Label>
                  <Input
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    placeholder="e.g., Ava – Calm Narrator"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Voice ID</Label>
                  <Input
                    value={voiceId}
                    onChange={(e) => setVoiceId(e.target.value)}
                    placeholder="Auto-generated from selection"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default Script Tone</Label>
                  <Select value={defaultScriptTone} onValueChange={setDefaultScriptTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
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

              <Button onClick={handleSaveVoice} className="w-full" size="lg">
                <Save className="h-4 w-4 mr-2" />
                Save Voice Kit
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
          <Button onClick={handleSaveVoice} disabled={!voiceName.trim() || !selectedPreview}>
            <Save className="h-4 w-4 mr-2" />
            Save Voice
          </Button>
        </div>
      </div>
    </div>
  )
}
