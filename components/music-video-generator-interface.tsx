"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Film, 
  Music, 
  Play, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  User,
  Globe,
  AlertCircle
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface MusicTrack {
  id: string
  title: string
  prompt: string
  audio_url: string
  suno_task_id: string
  suno_audio_id: string
  status: string
  created_at: string
}

interface MusicVideo {
  id: string
  suno_task_id: string
  status: string
  video_url?: string
  author?: string
  domain_name?: string
  source_task_id: string
  source_audio_id: string
  created_at: string
  updated_at: string
  music_jingle?: MusicTrack
}

export function MusicVideoGeneratorInterface() {
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([])
  const [musicVideos, setMusicVideos] = useState<MusicVideo[]>([])
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null)
  const [author, setAuthor] = useState("")
  const [domainName, setDomainName] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  // Load music tracks and videos on component mount
  useEffect(() => {
    loadMusicTracks()
    loadMusicVideos()
  }, [])

  const loadMusicTracks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('music_jingles')
        .select('id, title, prompt, audio_url, suno_task_id, suno_audio_id, status, created_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .not('suno_audio_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error loading music tracks:', error)
        return
      }

      setMusicTracks(data || [])
    } catch (error) {
      console.error('Error loading music tracks:', error)
    }
  }

  const loadMusicVideos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('music_videos')
        .select(`
          *,
          music_jingles (
            id,
            title,
            prompt,
            audio_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error loading music videos:', error)
        return
      }

      setMusicVideos(data || [])
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading music videos:', error)
      setIsLoading(false)
    }
  }

  const handleGenerateVideo = async () => {
    if (!selectedTrack) {
      toast({
        title: "No track selected",
        description: "Please select a music track to create a video for",
        variant: "destructive"
      })
      return
    }

    if (!selectedTrack.suno_audio_id) {
      toast({
        title: "Invalid track",
        description: "This track doesn't have a valid Suno audio ID for video generation",
        variant: "destructive"
      })
      return
    }

    if (author.length > 50) {
      toast({
        title: "Author name too long",
        description: "Author name must be 50 characters or less",
        variant: "destructive"
      })
      return
    }

    if (domainName.length > 50) {
      toast({
        title: "Domain name too long",
        description: "Domain name must be 50 characters or less",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/music-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: selectedTrack.suno_task_id,
          audioId: selectedTrack.suno_audio_id, // Using Suno audio ID
          author: author || undefined,
          domainName: domainName || undefined,
          musicJingleId: selectedTrack.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create music video')
      }

      const result = await response.json()
      
      toast({
        title: "Video generation started!",
        description: `Your music video is being generated. Task ID: ${result.musicVideo.suno_task_id}`,
        duration: 5000
      })

      // Refresh videos list
      await loadMusicVideos()
      
      // Reset form
      setSelectedTrack(null)
      setAuthor("")
      setDomainName("")

    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'generating':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'generating':
        return <Badge variant="secondary" className="bg-blue-500">Generating</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading music videos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Film className="h-8 w-8 text-purple-500" />
        <div>
          <h2 className="text-2xl font-bold">Music Video Generator</h2>
          <p className="text-muted-foreground">
            Create MP4 videos with visualizations for your music tracks
          </p>
        </div>
      </div>

      {/* Generate New Video Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            Create New Music Video
          </CardTitle>
          <CardDescription>
            Select a completed music track to generate a video with visualizations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Track Selection */}
          <div className="space-y-2">
            <Label>Select Music Track</Label>
            {musicTracks.length === 0 ? (
              <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/30">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">
                  No completed music tracks found. Create some music first!
                </span>
              </div>
            ) : (
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {musicTracks.map((track) => (
                  <div
                    key={track.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTrack?.id === track.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedTrack(track)}
                  >
                    <div className="flex items-center gap-3">
                      <Music className="h-4 w-4 text-purple-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title || 'Untitled'}</p>
                        <p className="text-sm text-muted-foreground truncate">{track.prompt}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {new Date(track.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Artist Name (Optional)
              </Label>
              <Input
                id="author"
                placeholder="Your artist name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                {author.length}/50 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Domain/Watermark (Optional)
              </Label>
              <Input
                id="domain"
                placeholder="yourwebsite.com"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                {domainName.length}/50 characters
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateVideo}
            disabled={!selectedTrack || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Film className="h-4 w-4 mr-2" />
                Generate Music Video
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Videos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            Your Music Videos
          </CardTitle>
          <CardDescription>
            Track the status of your music video generations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {musicVideos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No music videos created yet</p>
              <p className="text-sm">Generate your first music video above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {musicVideos.map((video) => (
                <div key={video.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(video.status)}
                      <div>
                        <p className="font-medium">
                          {video.music_jingle?.title || 'Untitled Music Video'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(video.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(video.status)}
                  </div>

                  {video.music_jingle && (
                    <div className="mb-3 p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium">Source Track:</p>
                      <p className="text-sm text-muted-foreground">{video.music_jingle.prompt}</p>
                    </div>
                  )}

                  {video.author && (
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">Artist:</span> {video.author}
                    </p>
                  )}

                  {video.domain_name && (
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">Domain:</span> {video.domain_name}
                    </p>
                  )}

                  {video.status === 'completed' && video.video_url && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(video.video_url, '_blank')}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = video.video_url!
                          link.download = `music-video-${video.id}.mp4`
                          link.click()
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}

                  {video.status === 'failed' && (
                    <p className="text-sm text-red-500 mt-2">
                      Video generation failed. Please try again.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

