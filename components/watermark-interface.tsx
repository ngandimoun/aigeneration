"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Video, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Trash2,
  Edit,
  Droplets
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { WatermarkProject } from "@/lib/types/watermark"
import { convertToSignedUrls } from "@/lib/storage/signed-urls"

interface WatermarkInterfaceProps {
  onClose: () => void
  projectTitle: string
}

export function WatermarkInterface({ onClose, projectTitle }: WatermarkInterfaceProps) {
  const [watermarkProjects, setWatermarkProjects] = useState<WatermarkProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [signedUrls, setSignedUrls] = useState<Map<string, string>>(new Map())
  const { toast } = useToast()

  useEffect(() => {
    fetchWatermarkProjects()
  }, [])

  const fetchWatermarkProjects = async () => {
    try {
      const response = await fetch('/api/watermarks')
      if (response.ok) {
        const data = await response.json()
        const projects = data.watermarks || []
        setWatermarkProjects(projects)
        
        // Generate signed URLs for all video URLs
        const videoUrls: string[] = projects
          .map((p: WatermarkProject) => [p.video_url, p.output_video_url])
          .flat()
          .filter(Boolean) as string[]
        
        if (videoUrls.length > 0) {
          const signedVideoUrls = await convertToSignedUrls(videoUrls)
          const urlMap = new Map<string, string>()
          videoUrls.forEach((originalUrl, index) => {
            if (signedVideoUrls[index]) {
              urlMap.set(originalUrl, signedVideoUrls[index])
            }
          })
          setSignedUrls(urlMap)
        }
      }
    } catch (error) {
      console.error('Error fetching watermark projects:', error)
      toast({
        title: "Error",
        description: "Failed to fetch watermark projects",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      processing: 'secondary',
      failed: 'destructive',
      draft: 'outline'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDelete = async (projectId: string) => {
    try {
      const response = await fetch(`/api/watermarks/${projectId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setWatermarkProjects(prev => prev.filter(p => p.id !== projectId))
        toast({
          title: "Success",
          description: "Watermark project deleted successfully"
        })
      } else {
        throw new Error('Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting watermark project:', error)
      toast({
        title: "Error",
        description: "Failed to delete watermark project",
        variant: "destructive"
      })
    }
  }

  const handleDownload = (project: WatermarkProject) => {
    if (project.output_video_url) {
      const videoUrl = signedUrls.get(project.output_video_url) || project.output_video_url
      const link = document.createElement('a')
      link.href = videoUrl
      link.download = `${project.title}_watermarked.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleView = (project: WatermarkProject) => {
    if (project.output_video_url) {
      const videoUrl = signedUrls.get(project.output_video_url) || project.output_video_url
      window.open(videoUrl, '_blank')
    }
  }

  const handleRetry = async (project: WatermarkProject) => {
    try {
      const response = await fetch('/api/watermarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: project.title,
          description: project.description,
          video: project.video_url,
          watermark: project.watermark_text,
          size: project.font_size,
          save_to_supabase: true
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Watermark generation restarted"
        })
        fetchWatermarkProjects() // Refresh the list
      } else {
        throw new Error('Failed to restart generation')
      }
    } catch (error) {
      console.error('Error retrying watermark generation:', error)
      toast({
        title: "Error",
        description: "Failed to restart watermark generation",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="bg-background border border-border rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background border border-border rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Watermark Projects</h2>
          <p className="text-muted-foreground">Manage your video watermark generation projects</p>
        </div>
        <Button onClick={onClose} variant="ghost" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Projects Grid */}
      {watermarkProjects.length === 0 ? (
        <div className="text-center py-12">
          <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No watermark projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first watermark project to get started
          </p>
          <Button 
            onClick={onClose}
            className="bg-gradient-to-r from-[#57e6f9] via-blue-500 to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watermarkProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium line-clamp-2">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1 line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {getStatusIcon(project.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    {getStatusBadge(project.status)}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(project.created_at)}
                    </span>
                  </div>

                  {/* Watermark Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Watermark:</span>
                      <span className="font-medium truncate max-w-[120px]" title={project.watermark_text}>
                        {project.watermark_text}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Font Size:</span>
                      <span className="font-medium">{project.font_size}px</span>
                    </div>
                  </div>

                  {/* Video Preview */}
                  {project.video_url && (
                    <div className="relative w-full h-20 bg-muted rounded-lg overflow-hidden">
                      <video
                        src={signedUrls.get(project.video_url) || project.video_url}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {project.status === 'completed' && project.output_video_url && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleView(project)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleDownload(project)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </>
                    )}
                    {project.status === 'processing' && (
                      <Button size="sm" variant="outline" className="flex-1" disabled>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Processing...
                      </Button>
                    )}
                    {project.status === 'failed' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleRetry(project)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    )}
                    {project.status === 'draft' && (
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="px-2"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
