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
import { useAuth } from "@/components/auth/auth-provider"
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
  const { user } = useAuth()
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
    <div className="flex items-center justify-center min-h-[600px] bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 dark:from-cyan-950/20 dark:via-blue-950/20 dark:to-purple-950/20 rounded-lg p-8">
      <div className="text-center max-w-md space-y-6">
        {/* Icône attractive */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 blur-2xl opacity-30 animate-pulse"></div>
          <Droplets className="relative h-24 w-24 text-transparent bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 bg-clip-text mx-auto" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
        </div>
        
        {/* Titre accrocheur */}
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-700 bg-clip-text text-transparent">
          Add Watermark to Your Videos
        </h2>
        
        {/* Message engageant */}
        <p className="text-muted-foreground text-lg">
          Protect your content with custom watermarks. Simple, fast, and professional.
        </p>
        
      </div>
    </div>
  )
}
