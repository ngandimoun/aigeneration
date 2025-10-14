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
import { PreviousGenerations } from "@/components/ui/previous-generations"

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
    <div className="bg-background border border-border rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Subtitle Projects</h2>
          <p className="text-muted-foreground">Manage your video subtitle generation projects</p>
        </div>
        <Button onClick={onClose} variant="ghost" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Projects Grid */}
      {subtitleProjects.length === 0 ? (
        <div className="text-center py-12">
          <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No subtitle projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first subtitle project to get started
          </p>
          <Button className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-500 hover:via-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <Plus className="h-4 w-4 mr-2" />
            Create New Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subtitleProjects.map((project) => (
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

                  {/* Features */}
                  <div className="flex flex-wrap gap-1">
                    {project.emoji_enrichment && (
                      <Badge variant="outline" className="text-xs">
                        Emoji
                      </Badge>
                    )}
                    {project.keyword_emphasis && (
                      <Badge variant="outline" className="text-xs">
                        Keywords
                      </Badge>
                    )}
                    {project.transcript_file_input && (
                      <Badge variant="outline" className="text-xs">
                        Custom Transcript
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {project.status === 'completed' && (
                      <>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
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
                      <Button size="sm" variant="outline" className="flex-1">
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
                    <Button size="sm" variant="ghost" className="px-2">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Previous Generations */}
      <PreviousGenerations contentType="subtitles" userId={user?.id || ''} className="mt-8" />
    </div>
  )
}
