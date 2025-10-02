"use client"

import { useNavigation } from "@/hooks/use-navigation"

export function MainContent() {
  const { getDisplayTitle } = useNavigation()

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          {getDisplayTitle()}
        </h1>
        {/* Content area */}
      </div>
    </div>
  )
}
