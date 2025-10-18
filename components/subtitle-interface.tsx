"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Video, 
  FileText, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Trash2,
  Edit
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"

interface SubtitleProject {
  id: string
  title: string
  description: string
  status: 'draft' | 'processing' | 'completed' | 'failed'
  video_file_input: string
  transcript_file_input?: string
  emoji_enrichment: boolean
  keyword_emphasis: boolean
  created_at: string
  updated_at: string
  content?: any
  metadata?: any
}

interface SubtitleInterfaceProps {
  onClose: () => void
  projectTitle: string
}

export function SubtitleInterface({ onClose, projectTitle }: SubtitleInterfaceProps) {
  const [subtitleProjects, setSubtitleProjects] = useState<SubtitleProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchSubtitleProjects()
  }, [])

  const fetchSubtitleProjects = async () => {
    try {
      const response = await fetch('/api/subtitles')
      if (response.ok) {
        const data = await response.json()
        setSubtitleProjects(data.subtitles || [])
      }
    } catch (error) {
      console.error('Error fetching subtitle projects:', error)
      toast({
        title: "Error",
        description: "Failed to fetch subtitle projects",
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
    <div className="flex items-center justify-center min-h-[600px] bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/20 dark:via-amber-950/20 dark:to-orange-950/20 rounded-lg p-8">
      <div className="text-center max-w-md space-y-6">
        {/* Icône attractive */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 blur-2xl opacity-30 animate-pulse"></div>
          <FileText className="relative h-24 w-24 text-transparent bg-gradient-to-r from-yellow-500 via-amber-600 to-orange-700 bg-clip-text mx-auto" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
        </div>
        
        {/* Titre accrocheur */}
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-700 bg-clip-text text-transparent">
          Add Subtitles to Your Videos
        </h2>
        
        {/* Message engageant */}
        <p className="text-muted-foreground text-lg">
          Make your content accessible with professional subtitles. Fast, accurate, and easy.
        </p>
      </div>
    </div>
  )
}
