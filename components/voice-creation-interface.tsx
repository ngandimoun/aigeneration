"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
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
  "📖 Narrator",
  "🎭 Character", 
  "🏢 Brand Voice",
  "🎓 Educator",
  "🤖 AI Persona",
  "🎮 Game NPC",
  "📞 Customer Service",
  "💬 Virtual Assistant",
  "🎙️ Podcast Host",
  "🎬 Documentary Voice",
  "📢 Commercial Voice",
  "📚 Audiobook Reader",
  "💻 E-learning Instructor",
  "📺 News Anchor",
  "📻 Radio DJ",
  "📚 Storyteller",
  "🧘 Meditation Guide",
  "🎧 ASMR Content Creator"
]

const LANGUAGES = [
  "🇺🇸 English",
  "🇫🇷 French", 
  "🇪🇸 Spanish",
  "🇯🇵 Japanese",
  "🇨🇳 Chinese (Mandarin)",
  "🇭🇰 Chinese (Cantonese)",
  "🇩🇪 German",
  "🇮🇹 Italian",
  "🇵🇹 Portuguese",
  "🇷🇺 Russian",
  "🇰🇷 Korean",
  "🇸🇦 Arabic",
  "🇮🇳 Hindi",
  "🇳🇱 Dutch",
  "🇸🇪 Swedish",
  "🇳🇴 Norwegian",
  "🇩🇰 Danish",
  "🇫🇮 Finnish",
  "🇵🇱 Polish",
  "🇨🇿 Czech",
  "🇭🇺 Hungarian",
  "🇹🇷 Turkish",
  "🇬🇷 Greek",
  "🇮🇱 Hebrew",
  "🇹🇭 Thai",
  "🇻🇳 Vietnamese",
  "🇮🇩 Indonesian",
  "🇲🇾 Malay",
  "🇵🇭 Filipino",
  "🌍 Multilingual"
]

const GENDER_OPTIONS = [
  "👨 Male",
  "👩 Female", 
  "⚧️ Androgynous",
  "🌈 Non-binary",
  "🤖 Robotic",
  "👹 Creature",
  "👶 Child-like",
  "👴 Elderly",
  "🎧 ASMR Whisper"
]

const AGE_OPTIONS = [
  "👶 Child",
  "🧒 Teen",
  "👨 Young Adult", 
  "👩 Mid-aged",
  "👴 Senior"
]

const ACCENT_OPTIONS = [
  "🇺🇸 Neutral American",
  "🇬🇧 British (RP)",
  "🇬🇧 British (Cockney)",
  "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scottish",
  "🇮🇪 Irish",
  "🇦🇺 Australian",
  "🇨🇦 Canadian",
  "🇺🇸 Southern US",
  "🇺🇸 New York",
  "🇺🇸 California",
  "🇺🇸 Texas",
  "🇮🇳 Indian",
  "🇿🇦 South African",
  "🇳🇿 New Zealand",
  "🇫🇷 French",
  "🇩🇪 German",
  "🇮🇹 Italian",
  "🇪🇸 Spanish",
  "🇷🇺 Russian",
  "🇯🇵 Japanese",
  "🇨🇳 Chinese",
  "🇰🇷 Korean",
  "🇸🇦 Arabic",
  "🇧🇷 Brazilian Portuguese",
  "🇲🇽 Mexican Spanish",
  "🇦🇷 Argentine Spanish",
  "🌍 No Accent (Neutral)"
]

const TONE_OPTIONS = [
  "🔥 Warm",
  "📢 Deep", 
  "🌊 Smooth",
  "🗣️ Raspy",
  "☀️ Light",
  "💨 Breathy",
  "🔧 Metallic",
  "📻 Resonant",
  "❄️ Crisp",
  "🍯 Mellow",
  "⚡ Sharp",
  "🌸 Soft",
  "💎 Rich",
  "💧 Clear",
  "🎤 Husky",
  "🦋 Velvety",
  "🏔️ Gravelly",
  "🕸️ Silky",
  "🧊 Brittle",
  "🎧 ASMR Whisper",
  "🧘 Meditation Tone",
  "😴 Sleepy Voice"
]

const PACING_OPTIONS = [
  "🐌 Slow",
  "💬 Conversational",
  "🏃 Fast", 
  "📏 Measured",
  "🎭 Erratic"
]

const FIDELITY_OPTIONS = [
  "🎙️ Studio",
  "📺 Broadcast",
  "📻 Vintage",
  "📞 Phone",
  "🤖 Robotic",
  "💎 High Definition",
  "💼 Professional",
  "🏠 Consumer",
  "🎙️ Podcast Quality",
  "📻 Radio Quality",
  "📺 TV Quality",
  "📱 Streaming Quality",
  "🎧 ASMR Quality",
  "🧘 Meditation Quality",
  "📻 Lo-fi",
  "💎 Hi-fi"
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
  "🦸 Hero",
  "😈 Villain",
  "🧙 Mentor",
  "📖 Narrator",
  "👨‍🏫 Teacher",
  "📢 Announcer",
  "🤖 AI Guide",
  "🤝 Sidekick",
  "🦸‍♂️ Protagonist",
  "🦹 Antagonist",
  "👥 Supporting Character",
  "👤 Background Character",
  "📞 Customer Service Rep",
  "💬 Virtual Assistant",
  "🎙️ Podcast Host",
  "📺 News Reporter",
  "🎬 Documentary Narrator",
  "📢 Commercial Voice",
  "📚 Audiobook Reader",
  "💻 E-learning Instructor",
  "📻 Radio DJ",
  "📚 Storyteller",
  "🧘 Meditation Guide",
  "🎧 ASMR Artist",
  "😴 Sleep Storyteller",
  "🧘 Relaxation Coach"
]

const STYLE_OPTIONS = [
  "🌿 Natural",
  "🎬 Cinematic",
  "🎭 Theatrical",
  "😏 Sarcastic",
  "💭 Dreamy",
  "🤫 Whispered",
  "👑 Commanding",
  "💬 Conversational",
  "👔 Formal",
  "😊 Casual",
  "🎭 Dramatic",
  "📏 Monotone",
  "🎪 Expressive",
  "🌸 Subtle",
  "🎪 Over-the-top",
  "💕 Intimate",
  "💼 Professional",
  "😊 Friendly",
  "👑 Authoritative",
  "🕊️ Gentle",
  "🎧 ASMR Style",
  "🧘 Meditation Style",
  "😴 Sleep Story Style",
  "🌊 Relaxation Style"
]

const AUDIO_QUALITY_OPTIONS = [
  "🎙️ Studio-grade",
  "🎬 Cinematic Mix",
  "📻 Lo-fi",
  "📞 Phone",
  "📼 Vintage Tape",
  "💎 High Definition",
  "💼 Professional",
  "📺 Broadcast Quality",
  "🎙️ Podcast Quality",
  "📻 Radio Quality",
  "📺 TV Quality",
  "📱 Streaming Quality",
  "🎧 ASMR Quality",
  "🧘 Meditation Quality",
  "😴 Sleep Quality",
  "🌊 Relaxation Quality",
  "🏠 Consumer Grade",
  "💎 Hi-fi",
  "🔊 Lossless"
]

const BRAND_PERSONA_OPTIONS = [
  "✨ Inspiring",
  "😊 Friendly",
  "🎓 Expert",
  "🕵️ Mysterious",
  "⚡ Energetic",
  "⚖️ Neutral",
  "💼 Professional",
  "😊 Casual",
  "👑 Authoritative",
  "🤝 Approachable",
  "🛡️ Trustworthy",
  "💡 Innovative",
  "🏛️ Traditional",
  "🚀 Modern",
  "💎 Luxury",
  "💰 Affordable",
  "👑 Premium",
  "🔒 Reliable",
  "🎨 Creative",
  "🔧 Technical",
  "🔥 Warm",
  "❄️ Cool",
  "🌊 Calm",
  "🎉 Exciting",
  "🌊 Soothing",
  "🎧 ASMR-friendly"
]

const SCRIPT_TONE_OPTIONS = [
  "📚 Informative",
  "💝 Emotional",
  "💬 Conversational",
  "🏢 Corporate",
  "🎭 Dramatic",
  "💼 Professional",
  "😊 Casual",
  "👔 Formal",
  "😊 Friendly",
  "👑 Authoritative",
  "🕊️ Gentle",
  "⚡ Energetic",
  "🌊 Calm",
  "🌊 Soothing",
  "🧘 Meditative",
  "🎧 ASMR",
  "😴 Sleep-inducing",
  "🌊 Relaxing",
  "💪 Motivational",
  "🎓 Educational",
  "🎪 Entertaining",
  "🎯 Persuasive",
  "⚖️ Neutral",
  "🔥 Warm",
  "❄️ Cool"
]

const ASMR_TRIGGERS = [
  "🤫 Whispering",
  "🌸 Soft Speaking",
  "💨 Breathing Sounds",
  "👄 Mouth Sounds",
  "👆 Tapping",
  "✋ Scratching",
  "🪥 Brushing",
  "📄 Paper Sounds",
  "💧 Water Sounds",
  "🌿 Nature Sounds",
  "⚪ White Noise",
  "🩷 Pink Noise",
  "🤎 Brown Noise",
  "🌧️ Rain Sounds",
  "🌊 Ocean Waves",
  "💨 Wind Sounds",
  "🔥 Fire Crackling",
  "🐦 Birds Chirping"
]

const ASMR_BACKGROUND_OPTIONS = [
  "❌ None",
  "🌧️ Soft Rain",
  "🌊 Ocean Waves",
  "🌲 Forest Sounds",
  "⚪ White Noise",
  "🩷 Pink Noise",
  "🤎 Brown Noise",
  "🔥 Fire Crackling",
  "🌳 Wind Through Trees",
  "🐦 Birds Chirping",
  "🎵 Gentle Music",
  "🌊 Ambient Sounds",
  "🔔 Meditation Bells",
  "🥣 Singing Bowl"
]

// Sound FX Integration Options
const SOUND_CATEGORIES = [
  "💥 Impact",
  "🌊 Ambience", 
  "🏃 Movement",
  "🖱️ Interface",
  "👹 Creature",
  "🌤️ Weather",
  "🎬 Foley",
  "🔄 Transition",
  "🎬 Trailer Hit"
]

const USAGE_CONTEXTS = [
  "🎬 Video",
  "🎮 Game", 
  "📢 Ad",
  "🖱️ UI",
  "🌊 Ambient Loop",
  "🎙️ Podcast",
  "🎮 Interactive"
]

const SOUND_TEXTURES = [
  "🔧 Metallic",
  "🌿 Organic",
  "🪵 Wooden", 
  "🤖 Synthetic",
  "💧 Watery",
  "💨 Airy",
  "🪨 Stone",
  "🧱 Plastic"
]

const ATTACK_TYPES = [
  "🌊 Soft fade",
  "⚡ Snappy hit",
  "🔪 Sharp transient",
  "🌊 Rolling onset"
]

const ENVIRONMENT_STYLES = [
  "🏠 Indoor",
  "🌳 Outdoor",
  "🏛️ Large Hall",
  "🌾 Open Field",
  "🌊 Submerged",
  "🚀 Space",
  "🎨 Abstract"
]

const REVERB_CHARACTERS = [
  "🔇 Dry",
  "🏠 Soft Room",
  "⛪ Cathedral",
  "🏛️ Metallic Hall",
  "🕳️ Cave",
  "🤖 Synthetic Space"
]

const STEREO_BEHAVIORS = [
  "🔊 Mono",
  "🎧 Wide Stereo",
  "🔄 Circular Pan",
  "🌊 Dynamic Sweep"
]

const AMBIENCE_LAYERS = [
  "🌧️ Rain",
  "💨 Wind",
  "👥 Crowd",
  "⚙️ Machines",
  "🌿 Nature",
  "🔇 Silence"
]

const MOTION_CHARACTERS = [
  "📈 Rising",
  "📉 Falling", 
  "💓 Pulsing",
  "📌 Sustained",
  "🎲 Randomized"
]

const PURPOSE_IN_SCENE_OPTIONS = [
  "📈 Build-Up",
  "💥 Impact",
  "🔄 Transition",
  "🌊 Background",
  "🎯 Cue",
  "🎨 Texture"
]

export function VoiceCreationInterface({ onClose, projectTitle }: VoiceCreationInterfaceProps) {
  const { toast } = useToast()
  
  // Public/Private Toggle
  const [isPublic, setIsPublic] = useState(true)
  
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
        is_public: isPublic,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-1">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[calc(100vh-1rem)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
          <div>
              <h2 className="text-xs font-bold">Voice Creation</h2>
              <p className="text-[10px] text-muted-foreground">Craft unique, emotionally intelligent voices that match your world's DNA.</p>
          </div>
            {/* Public/Private Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn(
                "text-[9px] font-medium px-2 rounded-full transition-colors whitespace-nowrap",
                isPublic 
                  ? "bg-green-100 text-green-700 border border-green-200" 
                  : "bg-gray-100 text-gray-700 border border-gray-200"
              )}>
                {isPublic ? "Public" : "Private"}
              </span>
              <Switch
                id="public-toggle"
                checked={isPublic}
                onCheckedChange={setIsPublic}
                className="scale-75"
              />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-5 w-5 shrink-0">
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(100vh-6rem)] p-1 space-y-2 scrollbar-hover">
          
          {/* Voice Identity Section */}
          <Card>
            <CardHeader className="p-2">
              <CardTitle className="flex items-center gap-2 text-xs">
                <Mic className="h-3 w-3" />
                🎤 Voice Identity
              </CardTitle>
              <CardDescription className="text-[10px]">
                Define the vocal core — who is speaking, from where, and with what sound.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">🎯 Voice Purpose</Label>
                  <Select value={voicePurpose} onValueChange={setVoicePurpose}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICE_PURPOSES.map((purpose) => (
                        <SelectItem key={purpose} value={purpose.replace(/^[^\s]+\s/, '').toLowerCase()}>
                          {purpose}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">🌍 Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang.replace(/^[^\s]+\s/, '')}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">👤 Gender / Timbre Base</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option.replace(/^[^\s]+\s/, '').toLowerCase()}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">🎂 Perceived Age</Label>
                  <Select value={perceivedAge} onValueChange={setPerceivedAge}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                  <Label className="text-xs">🗣️ Accent / Region</Label>
                  <Select 
                    value={accent} 
                    onValueChange={setAccent}
                    disabled={gender === "robotic" || gender === "creature"}
                  >
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                  <Label className="text-xs">🎵 Tone / Timbre</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                  <Label className="text-xs">📈 Pitch Level: {pitchLevel[0]}</Label>
                  <Slider
                    value={pitchLevel}
                    onValueChange={setPitchLevel}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">⏱️ Pacing / Rhythm</Label>
                  <Select value={pacing} onValueChange={setPacing}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                  <Label className="text-xs">🔍 Clarity / Fidelity</Label>
                  <Select value={fidelity} onValueChange={setFidelity}>
                    <SelectTrigger className="h-7 text-xs">
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

              <div className="text-xs text-muted-foreground italic">
                "Describe the physical quality of this voice — its texture, pace, and tone."
              </div>
            </CardContent>
          </Card>

          {/* Emotional DNA Section */}
          <Card>
            <CardHeader className="p-2">
              <CardTitle className="flex items-center gap-2 text-xs">
                <Heart className="h-3 w-3" />
                💝 Emotional DNA
              </CardTitle>
              <CardDescription className="text-[10px]">
                Shape the emotional and performance context.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">😊 Mood Context</Label>
                  <Select value={moodContext} onValueChange={setMoodContext}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOOD_OPTIONS.map((mood) => (
                        <SelectItem key={mood.value} value={mood.value}>
                          <span className="text-xs">{mood.icon}</span> {mood.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">⚖️ Emotional Weight: {emotionalWeight[0]}</Label>
                  <Slider
                    value={emotionalWeight}
                    onValueChange={setEmotionalWeight}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Subtle</span>
                    <span>Expressive</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">🎭 Character Role</Label>
                  <Select value={characterRole} onValueChange={setCharacterRole}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                  <Label className="text-xs">🎪 Performance Style</Label>
                  <Select value={performanceStyle} onValueChange={setPerformanceStyle}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                  <Label className="text-xs">🎧 Audio Quality Intent</Label>
                  <Select value={audioQualityIntent} onValueChange={setAudioQualityIntent}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                  <Label className="text-xs">🎯 Guidance Scale: {guidanceScale[0]}</Label>
                  <Slider
                    value={guidanceScale}
                    onValueChange={setGuidanceScale}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Creative Variation</span>
                    <span>Prompt Adherence</span>
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs">Text to Preview</Label>
                  <Textarea
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    placeholder="Enter text to preview the voice..."
                    className="min-h-[50px] text-xs"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-generate"
                    checked={autoGeneratePreview}
                    onCheckedChange={setAutoGeneratePreview}
                    className="scale-75"
                  />
                  <Label htmlFor="auto-generate" className="text-xs">Auto-generate Preview Text</Label>
                </div>
              </div>

              <div className="text-xs text-muted-foreground italic">
                "Cinematic + Dramatic will apply reverb and deeper EQ tone."
              </div>
            </CardContent>
          </Card>

          {/* Brand / World Sync Section */}
          <Card>
            <CardHeader className="p-2">
              <CardTitle className="flex items-center gap-2 text-xs">
                <Globe className="h-3 w-3" />
                🌍 Brand / World Sync
              </CardTitle>
              <CardDescription className="text-[10px]">
                Connect the voice tone with the brand or story world it belongs to.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="brand-sync"
                    checked={brandSync}
                    onCheckedChange={setBrandSync}
                    className="scale-75"
                  />
                  <Label htmlFor="brand-sync" className="text-xs">Brand Sync</Label>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">🌐 World Link</Label>
                  <Select value={worldLink} onValueChange={setWorldLink}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                  <Label className="text-xs">Tone Match Level: {toneMatchLevel[0]}</Label>
                  <Slider
                    value={toneMatchLevel}
                    onValueChange={setToneMatchLevel}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                    disabled={brandSync}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Independent</span>
                    <span>Full Match</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Brand Persona Matching</Label>
                  <Select value={brandPersonaMatching} onValueChange={setBrandPersonaMatching}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                  <Label className="text-xs">Default Script Tone</Label>
                  <Select value={defaultScriptTone} onValueChange={setDefaultScriptTone}>
                    <SelectTrigger className="h-7 text-xs">
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

              <div className="text-xs text-muted-foreground italic">
                "Your world's tone is Mysterious — softening consonants and lowering treble to match."
              </div>
            </CardContent>
          </Card>

          {/* ASMR Voice Options Section */}
          <Card>
            <CardHeader className="p-2">
              <CardTitle className="flex items-center gap-2 text-xs">
                <Heart className="h-3 w-3" />
                🎧 ASMR Voice Options
              </CardTitle>
              <CardDescription className="text-[10px]">
                Specialized settings for ASMR content creation and relaxation-focused voices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 p-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="asmr-voice"
                  checked={isASMRVoice}
                  onCheckedChange={setIsASMRVoice}
                  className="scale-75"
                />
                <Label htmlFor="asmr-voice" className="text-xs">Enable ASMR Voice Mode</Label>
              </div>

              {isASMRVoice && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">🔊 ASMR Intensity: {asmrIntensity[0]}</Label>
                      <Slider
                        value={asmrIntensity}
                        onValueChange={setAsmrIntensity}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Subtle</span>
                        <span>Intense</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Background Sound</Label>
                      <Select value={asmrBackground} onValueChange={setAsmrBackground}>
                        <SelectTrigger className="h-7 text-xs">
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

                  <div className="space-y-1">
                      <Label className="text-xs">🎯 ASMR Triggers</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                      {ASMR_TRIGGERS.map((trigger) => (
                        <div key={trigger} className="flex items-center space-x-1">
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
                            className="rounded border-gray-300 h-3 w-3"
                          />
                          <Label htmlFor={trigger} className="text-xs">{trigger}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground italic">
                    "ASMR mode enables whisper processing, binaural audio, and relaxation-optimized sound quality."
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sound FX Integration Section */}
          <Card>
            <CardHeader className="p-2">
              <CardTitle className="flex items-center gap-2 text-xs">
                <Zap className="h-3 w-3" />
                🎵 Sound FX Integration
              </CardTitle>
              <CardDescription className="text-[10px]">
                Enhance your voice with cinematic sound design and spatial audio characteristics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Category / Use Case</Label>
                  <Select value={soundCategory} onValueChange={setSoundCategory}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                      <Label className="text-xs">🎬 Usage Context</Label>
                  <Select value={usageContext} onValueChange={setUsageContext}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                      <Label className="text-xs">🎨 Sound Texture</Label>
                  <Select value={soundTexture} onValueChange={setSoundTexture}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                      <Label className="text-xs">⚡ Attack Type</Label>
                  <Select value={attackType} onValueChange={setAttackType}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                      <Label className="text-xs">🏞️ Environment Style</Label>
                  <Select value={environmentStyle} onValueChange={setEnvironmentStyle}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                      <Label className="text-xs">🔊 Reverb Character</Label>
                  <Select value={reverbCharacter} onValueChange={setReverbCharacter}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                      <Label className="text-xs">🎧 Stereo Behavior</Label>
                  <Select value={stereoBehavior} onValueChange={setStereoBehavior}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                  <Label className="text-xs">Ambience Layer (optional)</Label>
                  <Select value={ambienceLayer} onValueChange={setAmbienceLayer}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                      <Label className="text-xs">🎬 Motion Character</Label>
                  <Select value={motionCharacter} onValueChange={setMotionCharacter}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                      <Label className="text-xs">🎯 Purpose in Scene</Label>
                  <Select value={purposeInScene} onValueChange={setPurposeInScene}>
                    <SelectTrigger className="h-7 text-xs">
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

              <div className="text-xs text-muted-foreground italic">
                "Sound FX integration adds cinematic depth and spatial characteristics to your voice, creating immersive audio experiences."
              </div>
            </CardContent>
          </Card>

          {/* Preview & Fine-tuning Section */}
          <Card>
            <CardHeader className="p-2">
              <CardTitle className="flex items-center gap-2 text-xs">
                <Volume2 className="h-3 w-3" />
                🔊 Preview & Fine-Tuning
              </CardTitle>
              <CardDescription className="text-[10px]">
                Generate 3 variations, compare, and fine-tune your voice.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 p-2">
              <Button 
                onClick={handleGeneratePreviews}
                disabled={isGenerating}
                className="w-full h-7 text-xs"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-3 w-3 mr-2 animate-spin" />
                    🎙️ Crafting your audition...
                  </>
                ) : (
                  <>
                    <Mic className="h-3 w-3 mr-2" />
                    Generate Voice Previews
                  </>
                )}
              </Button>

              {voicePreviews.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {voicePreviews.map((preview) => (
                      <Card key={preview.id} className={cn(
                        "cursor-pointer transition-all",
                        selectedPreview === preview.id && "ring-2 ring-primary"
                      )} onClick={() => setSelectedPreview(preview.id)}>
                        <CardContent className="p-2">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="secondary" className="text-xs">{preview.variation}</Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePlayPreview(preview.id)
                              }}
                            >
                              {isPlaying === preview.id ? (
                                <Pause className="h-3 w-3" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {preview.duration_secs}s • {preview.language}
                          </div>
                          {/* Waveform visualization would go here */}
                          <div className="h-5 bg-muted rounded mt-1 flex items-center justify-center">
                            <span className="text-[9px] text-muted-foreground">Waveform</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium text-xs">Fine-tuning Controls</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Pitch: {fineTuningPitch[0]}</Label>
                        <Slider
                          value={fineTuningPitch}
                          onValueChange={setFineTuningPitch}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Speed: {fineTuningSpeed[0]}</Label>
                        <Slider
                          value={fineTuningSpeed}
                          onValueChange={setFineTuningSpeed}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Volume: {fineTuningVolume[0]}</Label>
                        <Slider
                          value={fineTuningVolume}
                          onValueChange={setFineTuningVolume}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Warmth: {fineTuningWarmth[0]}</Label>
                        <Slider
                          value={fineTuningWarmth}
                          onValueChange={setFineTuningWarmth}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Breathiness: {fineTuningBreathiness[0]}</Label>
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
            <CardHeader className="p-2">
              <CardTitle className="flex items-center gap-2 text-xs">
                <Save className="h-3 w-3" />
                💾 Export & Save
              </CardTitle>
              <CardDescription className="text-[10px]">
                Name, tag, and store the selected voice as a reusable Voice Kit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">📝 Voice Name</Label>
                  <Input
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    placeholder="e.g., Ava – Calm Narrator"
                    className="h-7 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Voice ID</Label>
                  <Input
                    value={voiceId}
                    onChange={(e) => setVoiceId(e.target.value)}
                    placeholder="Auto-generated from selection"
                    disabled
                    className="h-7 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Default Script Tone</Label>
                  <Select value={defaultScriptTone} onValueChange={setDefaultScriptTone}>
                    <SelectTrigger className="h-7 text-xs">
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

                <div className="space-y-1">
                  <Label className="text-xs">🏷️ Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="h-7 text-xs"
                    />
                    <Button onClick={addTag} size="sm" className="h-7 text-xs">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-xs">
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

              {/* <Button onClick={handleSaveVoice} className="w-full h-7 text-xs">
                <Save className="h-3 w-3 mr-2" />
                Save Voice Kit
              </Button> */}
            </CardContent>
          </Card>

          {/* Smart Message */}
          {smartMessage && (
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <CardContent className="p-2">
                <div className="flex items-start gap-2">
                  <Info className="h-3 w-3 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <p className="text-xs text-blue-800 dark:text-blue-200">{smartMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card className="border border-gray-200 bg-white dark:bg-gray-900 shadow-md">
            <CardContent className="p-3">
              <div className="flex items-center justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  className="h-10 text-sm font-semibold min-w-[100px] border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 shadow-sm"
                >
            Cancel
          </Button>
                <Button 
                  onClick={handleSaveVoice} 
                  disabled={!voiceName.trim() || !selectedPreview} 
                  className="h-10 text-sm font-semibold min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
            <Save className="h-4 w-4 mr-2" />
            Save Voice
          </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
