"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { 
  X, 
  Sparkles, 
  ChevronDown,
  ChevronUp,
  Play,
  Download,
  Volume2,
  VolumeX,
  Subtitles,
  Palette,
  Clock,
  Monitor,
  Settings,
  Wand2,
  CheckCircle,
  Loader2,
  ArrowUp
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ExplainerGeneratorInterfaceProps {
  onClose: () => void
  projectTitle: string
}

// Voice styles for the voiceover
const VOICE_STYLES = [
  { value: "calm", label: "Calm" },
  { value: "educational", label: "Educational" },
  { value: "energetic", label: "Energetic" },
  { value: "professional", label: "Professional" }
]

// Languages for voiceover
const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "french", label: "French" },
  { value: "arabic", label: "Arabic" },
  { value: "spanish", label: "Spanish" },
  { value: "japanese", label: "Japanese" }
]

// Helper function to format duration
const formatDuration = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}s`
  } else {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (remainingSeconds === 0) {
      return `${minutes}min`
    } else {
      return `${minutes}min ${remainingSeconds}s`
    }
  }
}

const ASPECT_RATIOS = [
  { value: "16:9", label: "16:9 Widescreen" },
  { value: "9:16", label: "9:16 Social" },
  { value: "1:1", label: "1:1 Square" }
]

const RESOLUTIONS = [
  { value: "720p", label: "720p" },
  { value: "480p", label: "480p" },
  { value: "1080p", label: "1080p" }
]

const STYLES = [
  { value: "auto", label: "Auto" },
  { value: "clean", label: "Clean" },
  { value: "cinematic", label: "Cinematic" },
  { value: "academic", label: "Academic" }
]

export function ExplainerGeneratorInterface({ onClose, projectTitle }: ExplainerGeneratorInterfaceProps) {
  // Core state
  const [prompt, setPrompt] = useState("")
  const [hasVoiceover, setHasVoiceover] = useState(false)
  const [voiceStyle, setVoiceStyle] = useState("educational")
  const [language, setLanguage] = useState("english")
  
  // Smart options state
  const [isSmartOptionsOpen, setIsSmartOptionsOpen] = useState(false)
  const [duration, setDuration] = useState([8]) // Duration in seconds, default 8s
  const [aspectRatio, setAspectRatio] = useState("16:9")
  const [resolution, setResolution] = useState("720p")
  const [style, setStyle] = useState("auto")
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStep, setGenerationStep] = useState("")
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [hasSubtitles, setHasSubtitles] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGenerationProgress(0)
    setGenerationStep("Building Manim Scene...")

    try {
      // Simulate progress steps
      const steps = [
        { step: "Building Manim Scene...", progress: 20 },
        { step: "Rendering animation...", progress: 60 },
        { step: hasVoiceover ? "Adding AI voiceover..." : "Finalizing video...", progress: 90 },
        { step: "Complete!", progress: 100 }
      ]

      for (const { step, progress } of steps) {
        setGenerationStep(step)
        setGenerationProgress(progress)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Simulate successful generation
      setGeneratedVideo("/placeholder-video.mp4")
      setGenerationStep("")
    } catch (error) {
      console.error("Generation failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSmartAction = (action: string) => {
    console.log(`Smart action: ${action}`)
    // Handle smart actions like "Change Style", "Slow Down Motion", etc.
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }


  // Show scroll button when content is scrollable
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setShowScrollButton(scrollTop > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            🎞️ DreamCut Animation (Manim-Powered)
          </h3>
          <p className="text-xs text-muted-foreground">
            {projectTitle} - "Type it. Hear it. Watch it come alive."
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <X className="h-3 w-3" />
        </Button>
      </div>

      {!generatedVideo ? (
        <>
          {/* Step 1: Prompt */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              ✏️ Prompt:
            </Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Animate a rotating cube transforming into a pyramid on a dark background, with labels appearing as it morphs."
              className="min-h-[100px] text-sm resize-none bg-muted/30 border-muted-foreground/25 focus:bg-background transition-colors"
            />
            <p className="text-xs text-muted-foreground">
              DreamCut auto-understands: Scene type, objects, lighting, motion pacing, and duration
            </p>
          </div>

          {/* Step 2: Voiceover Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                🎙️ Add AI Voiceover?
              </Label>
              <Switch
                checked={hasVoiceover}
                onCheckedChange={setHasVoiceover}
              />
            </div>
            
            {hasVoiceover && (
              <div className="grid grid-cols-2 gap-3 pl-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Voice Style</Label>
                  <Select value={voiceStyle} onValueChange={setVoiceStyle}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Select voice style" />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICE_STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value} className="text-xs">
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value} className="text-xs">
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Smart Options */}
          <Collapsible open={isSmartOptionsOpen} onOpenChange={setIsSmartOptionsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                <Settings className="h-3 w-3" />
                Smart Options
                {isSmartOptionsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Duration ({formatDuration(duration[0])})
                  </Label>
                  <div className="px-2">
                    <Slider
                      value={duration}
                      onValueChange={setDuration}
                      max={180} // 3 minutes = 180 seconds
                      min={1}   // Minimum 1 second
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1s</span>
                      <span>30s</span>
                      <span>1min</span>
                      <span>2min</span>
                      <span>3min</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Monitor className="h-3 w-3" />
                    Aspect Ratio
                  </Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Select aspect ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIOS.map((ratio) => (
                        <SelectItem key={ratio.value} value={ratio.value} className="text-xs">
                          {ratio.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Resolution</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Select resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOLUTIONS.map((res) => (
                        <SelectItem key={res.value} value={res.value} className="text-xs">
                          {res.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Palette className="h-3 w-3" />
                    Style
                  </Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLES.map((styleOption) => (
                        <SelectItem key={styleOption.value} value={styleOption.value} className="text-xs">
                          {styleOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Step 4: Generate Button */}
          <Button 
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Animation...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Animation 🎞️
              </>
            )}
          </Button>

          {/* Generation Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{generationStep}</span>
                <span className="text-muted-foreground">{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          )}
        </>
      ) : (
        /* Step 5: Result Preview */
        <div className="space-y-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Animation Complete!
            </h3>
            <p className="text-sm text-muted-foreground">
              Your DreamCut animation is ready to watch and download.
            </p>
          </div>

          {/* Video Preview */}
          <div className="bg-muted/20 rounded-lg p-4">
            <video
              src={generatedVideo}
              controls
              className="w-full rounded-lg shadow-lg"
              poster="/placeholder.jpg"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Play
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>

          {/* Smart Action Chips */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSmartAction("change-style")}
              className="flex items-center gap-1 text-xs"
            >
              <Palette className="h-3 w-3" />
              Change Style
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSmartAction("slow-motion")}
              className="flex items-center gap-1 text-xs"
            >
              <Clock className="h-3 w-3" />
              Slow Down Motion
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHasSubtitles(!hasSubtitles)}
              className={cn(
                "flex items-center gap-1 text-xs",
                hasSubtitles && "bg-primary text-primary-foreground"
              )}
            >
              <Subtitles className="h-3 w-3" />
              {hasSubtitles ? "Remove Subtitles" : "Add Subtitles"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHasVoiceover(!hasVoiceover)}
              className={cn(
                "flex items-center gap-1 text-xs",
                hasVoiceover && "bg-primary text-primary-foreground"
              )}
            >
              {hasVoiceover ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              {hasVoiceover ? "Remove Voiceover" : "Add Voiceover"}
            </Button>
          </div>

          {/* Regenerate Button */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setGeneratedVideo(null)
                setGenerationProgress(0)
                setGenerationStep("")
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Create New Animation
            </Button>
          </div>
        </div>
      )}

      {/* Floating Scroll to Top Button */}
      {showScrollButton && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
