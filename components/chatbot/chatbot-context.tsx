"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
// import { useNavigation } from '@/hooks/use-navigation'
import { ChatbotContextType, ChatMessage, ChatConversation } from '@/lib/types/chatbot'

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

interface ChatbotProviderProps {
  children: ReactNode
  currentSection?: string
}

export function ChatbotProvider({ children, currentSection = '' }: ChatbotProviderProps) {
  const { user } = useAuth()
  
  const [isOpen, setIsOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load conversation history when conversationId changes
  useEffect(() => {
    if (conversationId && user) {
      loadConversationHistory(conversationId)
    } else {
      setMessages([])
    }
  }, [conversationId, user])

  // Create new conversation when user first opens chatbot
  useEffect(() => {
    if (isOpen && !conversationId && user) {
      createNewConversation()
    }
  }, [isOpen, conversationId, user])

  const loadConversationHistory = async (convId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/chatbot/history?conversationId=${convId}`)
      const data = await response.json()

      if (data.success && data.messages) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error loading conversation history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createNewConversation = async () => {
    try {
      const response = await fetch('/api/chatbot/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Chat',
          initialMessage: null
        })
      })

      const data = await response.json()
      if (data.success && data.conversationId) {
        setConversationId(data.conversationId)
        setMessages([])
      }
    } catch (error) {
      console.error('Error creating new conversation:', error)
    }
  }

  const sendMessage = async (message: string, imageFiles?: File[], imageUrls?: string[]) => {
    if (!user || !conversationId) return

    try {
      setIsLoading(true)

      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        imageUrls: imageUrls || [],
        currentSection: currentSection,
        metadata: {},
        createdAt: new Date().toISOString()
      }

      setMessages(prev => [...prev, userMessage])

      // Prepare form data
      const formData = new FormData()
      formData.append('message', message)
      formData.append('currentSection', currentSection || '')
      formData.append('conversationId', conversationId)
      
      if (imageFiles) {
        imageFiles.forEach(file => formData.append('images', file))
      }
      
      if (imageUrls) {
        imageUrls.forEach(url => formData.append('imageUrls', url))
      }

      // Send message to API
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success && data.message) {
        // Add assistant response to UI
        setMessages(prev => [...prev, data.message])
      } else {
        // Handle error
        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${data.error || 'Unknown error'}`,
          imageUrls: [],
          currentSection: currentSection,
          metadata: {},
          createdAt: new Date().toISOString()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        imageUrls: [],
        currentSection: currentSection,
        metadata: {},
        createdAt: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearConversation = () => {
    setMessages([])
    setConversationId(null)
  }

  const loadConversation = (convId: string) => {
    setConversationId(convId)
  }

  const value: ChatbotContextType = {
    isOpen,
    setIsOpen,
    conversationId,
    setConversationId,
    messages,
    setMessages,
    currentSection: currentSection,
    isLoading,
    setIsLoading,
    // Additional methods
    sendMessage,
    clearConversation,
    loadConversation
  }

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  )
}

export function useChatbot() {
  const context = useContext(ChatbotContext)
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider')
  }
  return context
}
