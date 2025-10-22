"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useChatbot } from './chatbot-context'
import { MessageBubble } from './message-bubble'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Image as ImageIcon, 
  X, 
  Upload, 
  Loader2,
  MessageCircle,
  Library
} from 'lucide-react'
import { toast } from 'sonner'
// import { ChatbotService } from '@/lib/openai/chatbot-service'

interface ChatInterfaceProps {
  onClose: () => void
}

export function ChatInterface({ onClose }: ChatInterfaceProps) {
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    currentSection 
  } = useChatbot()
  
  const [inputMessage, setInputMessage] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>([])
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [showLibraryPicker, setShowLibraryPicker] = useState(false)
  const [libraryImages, setLibraryImages] = useState<any[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && selectedImages.length === 0 && selectedImageUrls.length === 0) {
      return
    }

    const message = inputMessage.trim()
    setInputMessage('')
    setSelectedImages([])
    setSelectedImageUrls([])
    setShowImagePicker(false)
    setShowLibraryPicker(false)

    await sendMessage(message, selectedImages, selectedImageUrls)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 10MB' }
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF images are supported' }
    }

    return { valid: true }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles: File[] = []

    for (const file of files) {
      const validation = validateImageFile(file)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        toast.error(validation.error)
      }
    }

    const totalImages = selectedImages.length + validFiles.length
    if (totalImages > 2) {
      toast.error('Maximum 2 images allowed')
      return
    }

    setSelectedImages(prev => [...prev, ...validFiles])
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeImageUrl = (index: number) => {
    setSelectedImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const loadLibraryImages = async () => {
    try {
      const response = await fetch('/api/library?limit=50&category=visuals')
      const data = await response.json()
      
      if (data.success && data.libraryItems) {
        setLibraryImages(data.libraryItems.filter((item: any) => 
          item.content_type === 'visuals' && 
          (item.url?.includes('.jpg') || item.url?.includes('.png') || item.url?.includes('.webp'))
        ))
      }
    } catch (error) {
      console.error('Error loading library images:', error)
      toast.error('Failed to load library images')
    }
  }

  const selectLibraryImage = (imageUrl: string) => {
    const totalImages = selectedImages.length + selectedImageUrls.length
    if (totalImages >= 2) {
      toast.error('Maximum 2 images allowed')
      return
    }

    setSelectedImageUrls(prev => [...prev, imageUrl])
    setShowLibraryPicker(false)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">DreamCut AI Assistant</h3>
          {currentSection && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {currentSection.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Welcome to DreamCut AI Assistant!</p>
              <p className="text-sm">
                I can help you with:
              </p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Understanding DreamCut features</li>
                <li>• Crafting optimized prompts</li>
                <li>• Analyzing images for prompt generation</li>
                <li>• Providing best practices and tips</li>
              </ul>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Image previews */}
      {(selectedImages.length > 0 || selectedImageUrls.length > 0) && (
        <div className="p-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {selectedImages.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Selected ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-border"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {selectedImageUrls.map((url, index) => (
              <div key={`url-${index}`} className="relative group">
                <img
                  src={url}
                  alt={`Library image ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-border"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                  onClick={() => removeImageUrl(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about DreamCut or upload images for prompt generation..."
              className="pr-20"
              disabled={isLoading}
            />
            
            {/* Image upload buttons */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => {
                  setShowLibraryPicker(!showLibraryPicker)
                  if (!showLibraryPicker) {
                    loadLibraryImages()
                  }
                }}
                title="Select from library"
              >
                <Library className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => fileInputRef.current?.click()}
                title="Upload image"
              >
                <ImageIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || (!inputMessage.trim() && selectedImages.length === 0 && selectedImageUrls.length === 0)}
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Library image picker */}
        {showLibraryPicker && (
          <div className="mt-2 p-3 border border-border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Select from Library</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowLibraryPicker(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              {libraryImages.map((item, index) => (
                <button
                  key={index}
                  onClick={() => selectLibraryImage(item.url)}
                  className="relative group"
                >
                  <img
                    src={item.url}
                    alt="Library image"
                    className="w-full h-16 object-cover rounded border border-border hover:border-primary transition-colors"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  )
}
