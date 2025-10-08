"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  Upload, 
  Video, 
  FileText, 
  Settings, 
  Palette, 
  Type, 
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Eye,
  Download,
  Save,
  Sparkles,
  Wand2,
  ImageIcon,
  Link,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { 
  AutocaptionModelInputs, 
  DEFAULT_AUTOCAPTION_INPUTS, 
  EMOJI_STRATEGIES, 
  KEYWORD_STYLES, 
  PRESETS 
} from "@/lib/types/subtitles"

interface SubtitleFormProps {
  onSubmit: (data: AutocaptionModelInputs) => void
  onCancel: () => void
  isLoading?: boolean
}

export function SubtitleForm({ onSubmit, onCancel, isLoading = false }: SubtitleFormProps) {
  const [formData, setFormData] = useState<AutocaptionModelInputs>(DEFAULT_AUTOCAPTION_INPUTS)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [transcriptPreview, setTranscriptPreview] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [emojiMapEntries, setEmojiMapEntries] = useState<Array<{ key: string; value: string }>>([
    { key: "fire", value: "🔥" },
    { key: "wow", value: "🤯" },
    { key: "money", value: "💰" }
  ])
  const [keywordsInput, setKeywordsInput] = useState("")
  const [selectedPreset, setSelectedPreset] = useState<string>("")
  
  const videoInputRef = useRef<HTMLInputElement>(null)
  const transcriptInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleInputChange = (field: keyof AutocaptionModelInputs, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setVideoPreview(url)
      handleInputChange("video_file_input", file)
      
      // Auto-detect video orientation and adjust defaults
      const video = document.createElement('video')
      video.src = url
      video.onloadedmetadata = () => {
        const isPortrait = video.videoHeight > video.videoWidth
        if (isPortrait) {
          handleInputChange("fontsize", 4)
          handleInputChange("MaxChars", 10)
          handleInputChange("subs_position", "bottom50")
        }
      }
    }
  }

  const handleTranscriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setTranscriptPreview(file.name)
      handleInputChange("transcript_file_input", file)
    }
  }

  const handlePresetSelect = (presetName: string) => {
    const preset = PRESETS.find(p => p.name === presetName)
    if (preset) {
      Object.entries(preset.config).forEach(([key, value]) => {
        handleInputChange(key as keyof AutocaptionModelInputs, value)
      })
      setSelectedPreset(presetName)
      toast({
        title: "Preset Applied",
        description: `${presetName} settings have been applied.`,
      })
    }
  }

  const addEmojiMapEntry = () => {
    setEmojiMapEntries(prev => [...prev, { key: "", value: "" }])
  }

  const updateEmojiMapEntry = (index: number, field: 'key' | 'value', value: string) => {
    setEmojiMapEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    ))
  }

  const removeEmojiMapEntry = (index: number) => {
    setEmojiMapEntries(prev => prev.filter((_, i) => i !== index))
  }

  const handleKeywordsChange = (value: string) => {
    setKeywordsInput(value)
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0)
    handleInputChange("keywords", keywords)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Update emoji map from entries
    const emojiMap: Record<string, string> = {}
    emojiMapEntries.forEach(entry => {
      if (entry.key && entry.value) {
        emojiMap[entry.key] = entry.value
      }
    })
    handleInputChange("emoji_map", emojiMap)

    if (!formData.video_file_input) {
      toast({
        title: "Video Required",
        description: "Please upload a video file or provide a URL.",
        variant: "destructive"
      })
      return
    }

    onSubmit(formData)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Add Subtitles</h2>
          <p className="text-muted-foreground">Upload a video and customize your captions</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Step 1: Upload
            </CardTitle>
            <CardDescription>
              Upload your video and optionally provide a transcript
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Upload */}
            <div className="space-y-2">
              <Label htmlFor="video-upload">Video File *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  {videoPreview ? (
                    <div className="space-y-2">
                      <video 
                        src={videoPreview} 
                        className="w-full h-32 object-cover rounded-md mx-auto"
                        controls
                      />
                      <p className="text-sm text-muted-foreground">Click to change video</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Video className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Click to upload video</p>
                    </div>
                  )}
                </label>
              </div>
              <div className="text-xs text-muted-foreground">
                Or paste a public URL: <Input 
                  placeholder="https://example.com/video.mp4" 
                  className="mt-1"
                  onChange={(e) => handleInputChange("video_file_input", e.target.value)}
                />
              </div>
            </div>

            {/* Transcript Upload */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="has-transcript"
                  checked={!!formData.transcript_file_input}
                  onCheckedChange={(checked) => {
                    if (!checked) {
                      handleInputChange("transcript_file_input", undefined)
                      setTranscriptPreview(null)
                    }
                  }}
                />
                <Label htmlFor="has-transcript">I already have a transcript JSON</Label>
              </div>
              
              {formData.transcript_file_input && (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  <input
                    ref={transcriptInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleTranscriptUpload}
                    className="hidden"
                    id="transcript-upload"
                  />
                  <label htmlFor="transcript-upload" className="cursor-pointer">
                    {transcriptPreview ? (
                      <div className="space-y-2">
                        <FileText className="h-6 w-6 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">{transcriptPreview}</p>
                        <p className="text-xs text-muted-foreground">Click to change transcript</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileText className="h-6 w-6 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">Click to upload transcript JSON</p>
                      </div>
                    )}
                  </label>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                If provided, model uses your words/timestamps instead of transcribing.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Core Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Step 2: Core Options
            </CardTitle>
            <CardDescription>
              Configure basic subtitle settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Presets */}
            <div className="space-y-2">
              <Label>Quick Presets</Label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    type="button"
                    variant={selectedPreset === preset.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePresetSelect(preset.name)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Output Type */}
            <div className="space-y-3">
              <Label>Output Type</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="output-video"
                  checked={formData.output_video}
                  onCheckedChange={(checked) => handleInputChange("output_video", checked)}
                />
                <Label htmlFor="output-video">Render captioned video</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="output-transcript"
                  checked={formData.output_transcript}
                  onCheckedChange={(checked) => handleInputChange("output_transcript", checked)}
                />
                <Label htmlFor="output-transcript">Also return transcript JSON</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Enable both to iterate quickly.
              </p>
            </div>

            {/* Font & Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="font">Font Family</Label>
                <Input
                  id="font"
                  value={formData.font}
                  onChange={(e) => handleInputChange("font", e.target.value)}
                  placeholder="Poppins/Poppins-ExtraBold.ttf"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fontsize">Font Size</Label>
                <Input
                  id="fontsize"
                  type="number"
                  step="0.1"
                  value={formData.fontsize}
                  onChange={(e) => handleInputChange("fontsize", parseFloat(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  7.0 is good for landscape videos, 4.0 for reels.
                </p>
              </div>
            </div>

            {/* Position & Characters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subs-position">Subtitles Position</Label>
                <Input
                  id="subs-position"
                  value={formData.subs_position}
                  onChange={(e) => handleInputChange("subs_position", e.target.value)}
                  placeholder="bottom75"
                />
                <p className="text-xs text-muted-foreground">
                  Larger number = lower on screen.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-chars">Max Characters Per Line</Label>
                <Input
                  id="max-chars"
                  type="number"
                  value={formData.MaxChars}
                  onChange={(e) => handleInputChange("MaxChars", parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Keep lines readable.
                </p>
              </div>
            </div>

            {/* Style */}
            <div className="space-y-4">
              <Label>Style</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                      placeholder="white"
                    />
                    <input
                      type="color"
                      value={formData.color === "white" ? "#ffffff" : formData.color}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                      className="w-10 h-10 rounded border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stroke-color">Stroke Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="stroke-color"
                      value={formData.stroke_color}
                      onChange={(e) => handleInputChange("stroke_color", e.target.value)}
                      placeholder="black"
                    />
                    <input
                      type="color"
                      value={formData.stroke_color === "black" ? "#000000" : formData.stroke_color}
                      onChange={(e) => handleInputChange("stroke_color", e.target.value)}
                      className="w-10 h-10 rounded border"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stroke-width">Stroke Width</Label>
                  <Input
                    id="stroke-width"
                    type="number"
                    step="0.1"
                    value={formData.stroke_width}
                    onChange={(e) => handleInputChange("stroke_width", parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opacity">Background Opacity</Label>
                  <div className="space-y-1">
                    <Slider
                      value={[formData.opacity]}
                      onValueChange={([value]) => handleInputChange("opacity", value)}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      {formData.opacity}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kerning">Character Spacing</Label>
                  <Input
                    id="kerning"
                    type="number"
                    step="0.1"
                    value={formData.kerning}
                    onChange={(e) => handleInputChange("kerning", parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Language & Direction */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="right-to-left"
                  checked={formData.right_to_left}
                  onCheckedChange={(checked) => handleInputChange("right_to_left", checked)}
                />
                <Label htmlFor="right-to-left">Right-to-left</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="translate"
                  checked={formData.translate}
                  onCheckedChange={(checked) => handleInputChange("translate", checked)}
                />
                <Label htmlFor="translate">Translate to English</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Only Arial fonts supported when RTL is on.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Advanced Options */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    Step 3: Advanced Options
                  </div>
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
                <CardDescription>
                  Power user settings and AI enhancements
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Highlight Color */}
                <div className="space-y-2">
                  <Label htmlFor="highlight-color">Highlight Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="highlight-color"
                      value={formData.highlight_color}
                      onChange={(e) => handleInputChange("highlight_color", e.target.value)}
                      placeholder="yellow"
                    />
                    <input
                      type="color"
                      value={formData.highlight_color === "yellow" ? "#ffff00" : formData.highlight_color}
                      onChange={(e) => handleInputChange("highlight_color", e.target.value)}
                      className="w-10 h-10 rounded border"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used for the model's highlight style.
                  </p>
                </div>

                {/* Emoji Enrichment */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emoji-enrichment"
                      checked={formData.emoji_enrichment}
                      onCheckedChange={(checked) => handleInputChange("emoji_enrichment", checked)}
                    />
                    <Label htmlFor="emoji-enrichment">🎯 Add Emojis to Captions (AI-powered)</Label>
                  </div>
                  
                  {formData.emoji_enrichment && (
                    <div className="space-y-3 pl-6">
                      <div className="space-y-2">
                        <Label>Emoji Strategy</Label>
                        <Select
                          value={formData.emoji_strategy}
                          onValueChange={(value) => handleInputChange("emoji_strategy", value as "AI" | "manualMap")}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EMOJI_STRATEGIES.map((strategy) => (
                              <SelectItem key={strategy.value} value={strategy.value}>
                                {strategy.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.emoji_strategy === "manualMap" && (
                        <div className="space-y-2">
                          <Label>Custom Emoji Map</Label>
                          {emojiMapEntries.map((entry, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                placeholder="keyword"
                                value={entry.key}
                                onChange={(e) => updateEmojiMapEntry(index, 'key', e.target.value)}
                              />
                              <Input
                                placeholder="emoji"
                                value={entry.value}
                                onChange={(e) => updateEmojiMapEntry(index, 'value', e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeEmojiMapEntry(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addEmojiMapEntry}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Entry
                          </Button>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        Adds relevant emojis next to words. Slightly increases processing time.
                      </p>
                    </div>
                  )}
                </div>

                {/* Keyword Emphasis */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="keyword-emphasis"
                      checked={formData.keyword_emphasis}
                      onCheckedChange={(checked) => handleInputChange("keyword_emphasis", checked)}
                    />
                    <Label htmlFor="keyword-emphasis">💡 Emphasize Important Words</Label>
                  </div>
                  
                  {formData.keyword_emphasis && (
                    <div className="space-y-3 pl-6">
                      <div className="space-y-2">
                        <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                        <Input
                          id="keywords"
                          value={keywordsInput}
                          onChange={(e) => handleKeywordsChange(e.target.value)}
                          placeholder="AI, powerful, fast"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Emphasis Style</Label>
                        <Select
                          value={formData.keyword_style}
                          onValueChange={(value) => handleInputChange("keyword_style", value as "CAPS" | "EMOJI_WRAP" | "ASTERISKS")}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {KEYWORD_STYLES.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Output Management */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="save-to-supabase"
                      checked={formData.save_to_supabase}
                      onCheckedChange={(checked) => handleInputChange("save_to_supabase", checked)}
                    />
                    <Label htmlFor="save-to-supabase">Save Outputs to Supabase</Label>
                  </div>
                  
                  {formData.save_to_supabase && (
                    <div className="space-y-3 pl-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="supabase-bucket">Bucket</Label>
                          <Input
                            id="supabase-bucket"
                            value={formData.supabase_bucket}
                            onChange={(e) => handleInputChange("supabase_bucket", e.target.value)}
                            placeholder="videos"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supabase-path">Path Prefix</Label>
                          <Input
                            id="supabase-path"
                            value={formData.supabase_pathPrefix}
                            onChange={(e) => handleInputChange("supabase_pathPrefix", e.target.value)}
                            placeholder="captioned/"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Submit Buttons */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !formData.video_file_input}>
            {isLoading ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Captions
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
