"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { useChatbot } from './chatbot-context'
import { ChatInterface } from './chat-interface'
import { Button } from '@/components/ui/button'
import { MessageCircle, X, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FloatingChatbot() {
  const { user } = useAuth()
  const { isOpen, setIsOpen, messages } = useChatbot()
  const [isMinimized, setIsMinimized] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Track unread messages when chat is closed
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant') {
        setUnreadCount(prev => prev + 1)
      }
    } else if (isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen, messages])

  // Don't render if user is not authenticated
  if (!user) {
    return null
  }

  const toggleChat = () => {
    if (isOpen) {
      setIsMinimized(!isMinimized)
    } else {
      setIsOpen(true)
      setIsMinimized(false)
    }
  }

  const closeChat = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={toggleChat}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-[#57e6f9] via-blue-500 to-purple-700 hover:from-[#4dd4e8] hover:via-blue-600 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 group"
            size="icon"
          >
            <MessageCircle className="h-6 w-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Chat interface */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out",
            isMinimized 
              ? "w-80 h-16" 
              : "w-96 h-[600px] md:w-[420px] md:h-[700px]"
          )}
        >
          <div className="bg-background border border-border rounded-2xl shadow-2xl h-full flex flex-col overflow-hidden">
            {/* Minimized header */}
            {isMinimized ? (
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">DreamCut AI Assistant</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMinimized(false)}
                    className="h-6 w-6 p-0"
                  >
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={closeChat}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Expanded chat interface */}
                <ChatInterface onClose={closeChat} />
                
                {/* Minimize button */}
                <div className="absolute top-4 right-12">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMinimized(true)}
                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                  >
                    <Minimize2 className="h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {isOpen && !isMinimized && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={closeChat} />
      )}
    </>
  )
}
