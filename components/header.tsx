"use client"

import { ChevronRight, Clock, Sparkles, Bell, User, Menu, Slash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { useAuth } from "@/components/auth/auth-provider"

interface HeaderProps {
  onMobileMenuClick: () => void
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  const { user } = useAuth()

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMobileMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="h-4 w-4" />
          <span className="font-medium">AI Suite</span>
          <Slash className="h-3 w-3 text-muted-foreground sm:block" />
          <span className="text-muted-foreground sm:block">Image Generator</span>
        </div>
      </div>

      {/* Right Section - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-4">
        <Button variant="ghost" className="bg-gradient-to-r from-[#42e2f7] via-blue-500 to-purple-700 bg-clip-text text-transparent text-base">
          Pricing
        </Button>
        
        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} alt="User" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <SignOutButton />
          </div>
        )}
      </div>
    </header>
  )
}
