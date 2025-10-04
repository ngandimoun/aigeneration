"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ArtifactCardSkeleton() {
  return (
    <div className="bg-background border border-border rounded-lg p-4 shadow-sm animate-pulse">
      <div className="aspect-square mb-3 overflow-hidden rounded-md relative">
        <Skeleton className="w-full h-full" />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        <div className="flex justify-start">
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        
        <div className="space-y-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  )
}


