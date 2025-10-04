"use client"

import { Globe, Lock, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface ArtifactCardProps {
  id: string
  title: string
  image: string
  description: string
  isPublic?: boolean
  isDefault?: boolean
  onDelete?: (id: string) => Promise<void>
  onClick?: () => void
}

export function ArtifactCard({ 
  id, 
  title, 
  image, 
  description, 
  isPublic = false, 
  isDefault = false, 
  onDelete,
  onClick
}: ArtifactCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!onDelete || isDefault) return
    
    setIsDeleting(true)
    try {
      await onDelete(id)
    } catch (error) {
      console.error('Failed to delete artifact:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div 
      className="bg-background border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-square mb-3 overflow-hidden rounded-md relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Public/Private indicator in top-right corner */}
        <div className="absolute top-2 right-2">
          {isPublic ? (
            <div className="bg-green-500/90 text-white rounded-full p-1.5 shadow-sm">
              <Globe className="h-3 w-3" />
            </div>
          ) : (
            <div className="bg-gray-500/90 text-white rounded-full p-1.5 shadow-sm">
              <Lock className="h-3 w-3" />
            </div>
          )}
        </div>
        
        {/* Delete button - only show for non-default artifacts */}
        {!isDefault && onDelete && (
          <div 
            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full shadow-sm"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Artifact</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2 flex-1">
            {title}
          </h3>
        </div>
        
        {/* Public/Private badge below title */}
        <div className="flex justify-start">
          {isPublic ? (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
              <Globe className="h-3 w-3 mr-1" />
              Public
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
              <Lock className="h-3 w-3 mr-1" />
              Private
            </Badge>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-3">
          {description}
        </p>
      </div>
    </div>
  )
}
