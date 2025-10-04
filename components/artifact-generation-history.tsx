"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Calendar, 
  User, 
  Palette, 
  Zap, 
  Clock, 
  ChevronDown, 
  ChevronRight,
  Image as ImageIcon,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

interface GenerationData {
  id: string
  title: string
  description: string
  image: string
  type: string
  isPublic: boolean
  created_at: string
  comicTitle: string
  characterName: string
  characterDescription: string
  comicSettings: {
    inspirationStyle: string
    vibe: string
    type: string
  }
  generationTimestamp: string
  variationNumber: number
  isCharacterVariation: boolean
  autoSaved: boolean
  manualSave: boolean
}

interface ProjectGroup {
  comicTitle: string
  generations: GenerationData[]
  totalVariations: number
  latestGeneration: string
}

interface ArtifactGenerationHistoryProps {
  artifactId: string
  artifactTitle: string
  onClose?: () => void
}

export function ArtifactGenerationHistory({ 
  artifactId, 
  artifactTitle, 
  onClose 
}: ArtifactGenerationHistoryProps) {
  const [generations, setGenerations] = useState<ProjectGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchGenerations = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/artifacts/${artifactId}/generations`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch generations')
        }

        const data = await response.json()
        setGenerations(data.generations || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchGenerations()
  }, [artifactId])

  const toggleProject = (comicTitle: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(comicTitle)) {
      newExpanded.delete(comicTitle)
    } else {
      newExpanded.add(comicTitle)
    }
    setExpandedProjects(newExpanded)
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Generation History</h3>
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-destructive mb-2">Error loading generations</div>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    )
  }

  if (generations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No generations yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Character variations generated using "{artifactTitle}" will appear here.
        </p>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Generation History</h3>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        {generations.length} project{generations.length !== 1 ? 's' : ''} generated using "{artifactTitle}"
      </div>

      <div className="space-y-4">
        {generations.map((project) => {
          const isExpanded = expandedProjects.has(project.comicTitle)
          
          return (
            <Card key={project.comicTitle} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleProject(project.comicTitle)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-base">{project.comicTitle}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {project.totalVariations} variation{project.totalVariations !== 1 ? 's' : ''}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(project.latestGeneration)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {project.generations.map((generation) => (
                      <div 
                        key={generation.id}
                        className="group relative bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="aspect-square mb-2 overflow-hidden rounded-md bg-muted">
                          <img 
                            src={generation.image} 
                            alt={generation.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">
                              Variation {generation.variationNumber}
                            </span>
                            {generation.autoSaved && (
                              <Badge variant="outline" className="text-xs">
                                Auto
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {generation.characterName}
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Palette className="h-3 w-3" />
                              {generation.comicSettings.inspirationStyle}
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {generation.comicSettings.vibe}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
