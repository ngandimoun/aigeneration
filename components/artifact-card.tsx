"use client"

import { Globe } from "lucide-react"

interface ArtifactCardProps {
  title: string
  image: string
  description: string
  isPublic?: boolean
}

export function ArtifactCard({ title, image, description, isPublic = false }: ArtifactCardProps) {
  return (
    <div className="bg-background border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square mb-3 overflow-hidden rounded-md relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
        {isPublic && (
          <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground rounded-full p-1">
            <Globe className="h-3 w-3" />
          </div>
        )}
      </div>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2 flex-1">
          {title}
        </h3>
        {isPublic && (
          <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
        )}
      </div>
      <p className="text-xs text-muted-foreground line-clamp-3">
        {description}
      </p>
    </div>
  )
}
