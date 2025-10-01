"use client"

import {
  Home,
  Sparkles,
  Search,
  Users,
  Grid3x3,
  FolderOpen,
  Settings,
  Sun,
  Moon,
  MoreHorizontal,
  PanelLeft,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useTheme } from "next-themes"

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  isMobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const getThemeIcon = () => {
    return theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
  }

  return (
    <aside
      className={`${isCollapsed ? "w-16" : "w-60"} border-r border-sidebar-border bg-sidebar flex flex-col transition-all duration-300
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative z-50 h-full`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-3 border-b border-sidebar-border justify-between">
        {!isCollapsed && <span className="text-2xl font-bold text-primary">DREAMCUT</span>}
        <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 shrink-0 hidden md:flex">
          <PanelLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <Button
          variant="ghost"
          className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start"} gap-3 text-sidebar-foreground hover:bg-accent`}
          onClick={onMobileClose}
        >
          <Home className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Home</span>}
        </Button>
        <Button
          variant="ghost"
          className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start"} gap-3 text-sidebar-foreground hover:bg-accent`}
          onClick={onMobileClose}
        >
          <Sparkles className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>AI Suite</span>}
        </Button>
        <Button
          variant="ghost"
          className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start"} gap-3 text-sidebar-foreground hover:bg-accent`}
          onClick={onMobileClose}
        >
          <Search className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Stock</span>}
        </Button>
        <Button
          variant="ghost"
          className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start"} gap-3 text-sidebar-foreground hover:bg-accent`}
          onClick={onMobileClose}
        >
          <Users className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Community</span>}
        </Button>

        {/* Pinned Section */}
        <div className="pt-6">
          {!isCollapsed && <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground">Pinned</div>}
          <Button
            variant="ghost"
            className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start"} gap-3 text-sidebar-foreground hover:bg-accent`}
            onClick={onMobileClose}
          >
            <Grid3x3 className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>All tools</span>}
          </Button>
        </div>

        {/* My Creations */}
        <Button
          variant="ghost"
          className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start"} gap-3 text-sidebar-foreground hover:bg-accent`}
          onClick={onMobileClose}
        >
          <FolderOpen className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>My creations</span>}
        </Button>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {/* Mobile Header Buttons */}
        <div className="md:hidden space-y-2">
          <Button
            variant="ghost"
            className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start"} gap-3 text-sidebar-foreground hover:bg-accent`}
            onClick={onMobileClose}
          >
            <Avatar className="h-5 w-5 shrink-0">
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback>
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && <span>Profile</span>}
          </Button>
        </div>

        {!isCollapsed && (
          <>
            <Button className="w-full bg-gradient-to-r from-[#57e6f9] via-blue-500 to-purple-700 text-white cursor-pointer">
              Get a plan
            </Button>
            <p className="text-xs text-center text-muted-foreground">Unlock more features</p>
          </>
        )}

        <div className={`flex items-center ${isCollapsed ? "flex-col" : "justify-center"} gap-2 pt-2`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-accent"
            onClick={toggleTheme}
          >
            {getThemeIcon()}
          </Button>
          {!isCollapsed && (
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  )
}
