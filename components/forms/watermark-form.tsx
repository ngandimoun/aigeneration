"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  X,
  Video,
  Play,
  CheckCircle,
  Database
} from "lucide-react"
import { WatermarkFormData, DEFAULT_WATERMARK_VALUES, WATERMARK_CONSTRAINTS } from "@/lib/types/watermark"
import { useToast } from "@/hooks/use-toast"

interface WatermarkFormProps {
  onSubmit: (data: FormData) => void
  onCancel: () => void
  isLoading?: boolean
  isOpen?: boolean
}

export function WatermarkForm({ onSubmit, onCancel, isLoading = false, isOpen = true }: WatermarkFormProps) {
  const [formData, setFormData] = useState<WatermarkFormData>({
    video_source: 'upload',
    video_url: '',
    watermark_text: 'DREAMCUT.AI',
    font_size: 40
  })

  const [dragOver, setDragOver] = useState(false)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<{id: string, title: string, image: string, video_url: string} | null>(null)
  const [availableVideos, setAvailableVideos] = useState<Array<{id: string, title: string, image: string, video_url: string}>>([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const { toast } = useToast()

  // Load videos from Library API when library source is selected
  useEffect(() => {
    if (formData.video_source === 'library') {
      fetchAvailableVideos()
    }
  }, [formData.video_source])

  const fetchAvailableVideos = async () => {
    setLoadingVideos(true)
    try {
      const response = await fetch('/api/library?category=motions')
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Library API response:', data)
        
        const libraryItems = data.libraryItems || []
        const videos = libraryItems.map((item: any) => ({
          id: `${item.content_type}_${item.content_id}`,
          title: item.title || `Video from ${item.content_type}`,
          image: item.image || '/placeholder.jpg',
          video_url: item.video_url || ''
        })).filter((video: any) => video.video_url && video.video_url.trim() !== '')
        
        console.log(`🎬 Total videos loaded from library: ${videos.length}`)
        setAvailableVideos(videos)
      } else {
        console.error('❌ Failed to fetch library:', response.status, response.statusText)
        toast({
          title: "Error loading videos",
          description: "Failed to load videos from your library. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('❌ Error loading videos from library:', error)
      toast({
        title: "Error loading videos",
        description: "Failed to load videos from your library. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoadingVideos(false)
    }
  }

  const handleInputChange = (field: keyof WatermarkFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleVideoSourceChange = (source: 'upload' | 'library') => {
    handleInputChange("video_source", source)
    if (source === 'upload') {
      setSelectedVideo(null)
      setVideoPreview(null)
      handleInputChange("video_url", "")
    } else {
      setVideoPreview(null)
      handleInputChange("video_url", "")
    }
  }

  const handleVideoSelect = (video: {id: string, title: string, image: string, video_url: string}) => {
    setSelectedVideo(video)
    setVideoPreview(video.video_url)
    handleInputChange("video_url", video.video_url)
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setVideoPreview(url)
      handleInputChange("video_url", url)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const videoFile = files.find(file => file.type.startsWith('video/'))
    
    if (videoFile) {
      const url = URL.createObjectURL(videoFile)
      setVideoPreview(url)
      handleInputChange("video_url", url)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.video_url?.trim()) {
      toast({
        title: "Error",
        description: "Please select or upload a video file",
        variant: "destructive"
      })
      return
    }

    if (!formData.watermark_text?.trim()) {
      toast({
        title: "Error", 
        description: "Please enter watermark text",
        variant: "destructive"
      })
      return
    }

    // Create FormData for file uploads
    const submitData = new FormData()
    submitData.append('video_source', formData.video_source)
    submitData.append('video_url', formData.video_url)
    submitData.append('watermark_text', formData.watermark_text)
    submitData.append('font_size', formData.font_size.toString())
    
    // Add video file if it's an upload
    if (formData.video_source === 'upload' && formData.video_file) {
      submitData.append('video_file', formData.video_file)
    }

    onSubmit(submitData)
  }


  if (!isOpen) return null

  return (
    <div className="bg-background border border-border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">✨ Add Watermark</h2>
          <p className="text-xs sm:text-sm text-slate-600">🎬 Add a watermark to your video</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} className="self-end sm:self-auto hover:bg-slate-100 h-8 w-8">
          <X className="h-3 w-3 text-slate-500" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

        {/* Video Input */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg py-3">
            <CardTitle className="text-slate-800 text-sm">
              🎥 Video Input *
            </CardTitle>
            <CardDescription className="text-slate-600 text-xs">
              📋 Select the video you want to add a watermark to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 py-3">
            {/* Video Source Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">📹 Video Source</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={formData.video_source === 'upload' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVideoSourceChange('upload')}
                  className="w-full h-9 text-xs font-medium"
                >
                  📤 Upload File
                </Button>
                <Button
                  type="button"
                  variant={formData.video_source === 'library' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVideoSourceChange('library')}
                  className="w-full h-9 text-xs font-medium"
                >
                  📚 From Library
                </Button>
              </div>
            </div>

            {/* Video Upload */}
            {formData.video_source === 'upload' && (
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  dragOver 
                    ? "border-primary bg-primary/5" 
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <p className="text-xs font-medium mb-1">📁 Drop video file here</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Supports MP4, MOV, AVI, MKV
                </p>
                <Input
                  type="file"
                  accept=".mp4,.mov,.avi,.mkv"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('video-upload')?.click()}
                  className="h-8 text-xs"
                >
                  📤 Choose File
                </Button>
              </div>
            )}


            {/* Library Selection */}
            {formData.video_source === 'library' && (
              <div className="space-y-3">
                {loadingVideos ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm">Loading videos from your library...</p>
                  </div>
                ) : availableVideos.length > 0 ? (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      {availableVideos.length} video{availableVideos.length > 1 ? 's' : ''} available from Motions category
                    </Label>
                    <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-2">
                      {availableVideos.map((video) => (
                        <div
                          key={video.id}
                          className={`group border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                            selectedVideo?.id === video.id 
                              ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200' 
                              : 'border-muted-foreground/25 hover:border-blue-300 hover:shadow-sm'
                          }`}
                          onClick={() => handleVideoSelect(video)}
                        >
                          <div className="flex gap-3 p-3">
                            {/* Video Thumbnail */}
                            <div className="flex-shrink-0 relative">
                              {video.video_url ? (
                                <div className="relative w-24 h-16 bg-black rounded overflow-hidden">
                                  <video 
                                    src={video.video_url}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                    onMouseEnter={(e) => e.currentTarget.play()}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.pause()
                                      e.currentTarget.currentTime = 0
                                    }}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                    <Play className="h-6 w-6 text-white opacity-80" />
                                  </div>
                                </div>
                              ) : (
                                <img 
                                  src={video.image} 
                                  alt={video.title}
                                  className="w-24 h-16 object-cover rounded"
                                />
                              )}
                              {selectedVideo?.id === video.id && (
                                <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                                  <CheckCircle className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                            
                            {/* Video Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <p className="text-sm font-semibold text-foreground truncate mb-0.5">
                                {video.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Video className="h-3 w-3" />
                                <span>Motion video</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">No videos found in your library</p>
                    <p className="text-xs mt-1">Create videos in your Motions library first:</p>
                    <p className="text-xs text-muted-foreground/80">UGC Ads, Talking Avatars, Product Motion, Explainers</p>
                  </div>
                )}
              </div>
            )}

            {/* Video Preview */}
            {videoPreview && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">👀 Video Preview</Label>
                <div className="relative w-full max-w-sm mx-auto">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full rounded-lg border border-slate-200 shadow-sm"
                    style={{ maxHeight: '150px' }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Watermark Settings */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg py-3">
            <CardTitle className="text-slate-800 text-sm">
              ✨ Watermark Settings
            </CardTitle>
            <CardDescription className="text-slate-600 text-xs">
              🎨 Configure your watermark appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 py-3">
            {/* Watermark Text */}
            <div className="space-y-1">
              <Label htmlFor="watermark_text" className="text-sm font-medium text-slate-700">✍️ Watermark Text *</Label>
              <Textarea
                id="watermark_text"
                value={formData.watermark_text}
                onChange={(e) => handleInputChange("watermark_text", e.target.value)}
                placeholder="DREAMCUT.AI"
                maxLength={WATERMARK_CONSTRAINTS.WATERMARK_TEXT_MAX_LENGTH}
                rows={2}
                className="border-slate-200 focus:border-purple-300 focus:ring-purple-200 text-sm"
              />
              <p className="text-xs text-slate-500">
                💡 Shift + Return to add a new line
              </p>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <Label htmlFor="font_size" className="text-sm font-medium text-slate-700">📏 Font Size</Label>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-xs text-slate-600 font-medium">
                    📊 Size: {formData.font_size}
                  </span>
                  <Badge variant="outline" className="w-fit bg-purple-50 text-purple-700 border-purple-200 text-xs">
                    {WATERMARK_CONSTRAINTS.FONT_SIZE_MIN} - {WATERMARK_CONSTRAINTS.FONT_SIZE_MAX}
                  </Badge>
                </div>
                <Slider
                  value={[formData.font_size]}
                  onValueChange={(value) => handleInputChange("font_size", value[0])}
                  min={WATERMARK_CONSTRAINTS.FONT_SIZE_MIN}
                  max={WATERMARK_CONSTRAINTS.FONT_SIZE_MAX}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  💡 Default: {WATERMARK_CONSTRAINTS.FONT_SIZE_DEFAULT}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 h-9 text-sm"
          >
            ❌ Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !formData.video_url || !formData.watermark_text}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 h-9 text-sm"
          >
            {isLoading ? (
              <>
                ⏳ Processing...
              </>
            ) : (
              <>
                ✨ Generate Watermark
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
