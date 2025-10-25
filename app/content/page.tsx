"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { GeneratorPanel } from "@/components/generator-panel"
import { MainContent } from "@/components/main-content"
import { NavigationProvider } from "@/hooks/use-navigation"
import { ChatbotProvider } from "@/components/chatbot/chatbot-context"
import { FloatingChatbot } from "@/components/chatbot/floating-chatbot"
import { useNavigation } from "@/hooks/use-navigation"
import { cn } from "@/lib/utils" // Assurez-vous que ce chemin est correct
import { LayoutTemplate, FileText } from "lucide-react" // Import des icônes

function ContentPageInner() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  
  // NOUVEL ÉTAT pour gérer la vue active sur mobile
  const [activeMobileView, setActiveMobileView] = useState('generator') // 'generator' ou 'main'

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background">
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
        )}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        <div className="flex flex-1 flex-col">
          <Header onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />

          {/* Le conteneur de contenu principal */}
          <main className="flex flex-1 overflow-hidden">
            {/* VUE DESKTOP (md et plus) : Les deux panneaux côte à côte */}
            <div className="hidden md:flex flex-1 overflow-hidden">
              <GeneratorPanel />
              <MainContent />
            </div>

            {/* VUE MOBILE (en dessous de md) : Un seul panneau affiché à la fois */}
            <div className="block md:hidden flex-1 overflow-y-auto">
              {activeMobileView === 'generator' && <GeneratorPanel />}
              {activeMobileView === 'main' && <MainContent />}
            </div>
          </main>

          {/* NOUVELLE BARRE DE NAVIGATION INFÉRIEURE POUR MOBILE */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 h-10 bg-background border-t border-border z-30 flex items-center justify-around">
            <button
              onClick={() => setActiveMobileView('generator')}
              className={cn(
                "flex flex-col items-center justify-center h-full w-full gap-1 text-xs transition-colors",
                activeMobileView === 'generator'
                  ? "text-primary border-t-2 border-primary"
                  : "text-muted-foreground"
              )}
            >
              <LayoutTemplate className="h-5 w-5" />
              Generator
            </button>
            <button
              onClick={() => setActiveMobileView('main')}
              className={cn(
                "flex flex-col items-center justify-center h-full w-full gap-1 text-xs transition-colors",
                activeMobileView === 'main'
                  ? "text-primary border-t-2 border-primary"
                  : "text-muted-foreground"
              )}
            >
              <FileText className="h-5 w-5" />
              Content
            </button>
          </div>
        </div>
      </div>
      <FloatingChatbot />
    </>
  )
}

// Le reste de votre fichier reste inchangé
function ChatbotWrapper() {
  const { selectedSection } = useNavigation()
  
  return (
    <ChatbotProvider currentSection={selectedSection || ''}>
      <ContentPageInner />
    </ChatbotProvider>
  )
}

export default function ContentPage() {
  return (
    <NavigationProvider>
      <ChatbotWrapper />
    </NavigationProvider>
  )
}