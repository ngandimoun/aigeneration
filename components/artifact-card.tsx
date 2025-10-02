"use client"

interface ArtifactCardProps {
  title: string
  image: string
  description: string
}

export function ArtifactCard({ title, image, description }: ArtifactCardProps) {
  return (
    <div className="bg-background border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square mb-3 overflow-hidden rounded-md">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground line-clamp-3">
        {description}
      </p>
    </div>
  )
}
