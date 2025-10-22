"use client"

import React from 'react'
import { ChatMessage } from '@/lib/types/chatbot'
import { Button } from '@/components/ui/button'
import { Copy, Check, Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const formatContent = (content: string) => {
    // Simple markdown-like formatting for code blocks and prompts
    const codeBlockRegex = /```([\s\S]*?)```/g
    const inlineCodeRegex = /`([^`]+)`/g
    
    let formatted = content
      .replace(codeBlockRegex, '<pre class="bg-muted p-3 rounded-md overflow-x-auto my-2"><code>$1</code></pre>')
      .replace(inlineCodeRegex, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
    
    return formatted
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message bubble */}
        <div
          className={`
            px-4 py-3 rounded-2xl shadow-sm
            ${isUser 
              ? 'bg-gradient-to-r from-[#57e6f9] via-blue-500 to-purple-700 text-white' 
              : 'bg-background border border-border'
            }
            ${isAssistant ? 'relative' : ''}
          `}
        >
          {/* Image previews */}
          {message.imageUrls && message.imageUrls.length > 0 && (
            <div className="mb-3 space-y-2">
              {message.imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Uploaded image ${index + 1}`}
                    className="max-w-full h-auto rounded-lg border border-border/50"
                    style={{ maxHeight: '200px' }}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-6 w-6 p-0"
                      onClick={() => window.open(url, '_blank')}
                    >
                      <ImageIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Message content */}
          <div 
            className={`text-sm leading-relaxed ${
              isUser ? 'text-white' : 'text-foreground'
            }`}
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          />

          {/* Copy button for assistant messages with prompts */}
          {isAssistant && (
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {new Date(message.createdAt).toLocaleTimeString()}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                onClick={() => copyToClipboard(message.content)}
                title="Copy message"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}

          {/* User message timestamp */}
          {isUser && (
            <div className="text-xs text-white/70 mt-1 text-right">
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Current section badge for assistant messages */}
        {isAssistant && message.currentSection && (
          <div className="mt-1 text-xs text-muted-foreground">
            Context: {message.currentSection.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
        )}
      </div>
    </div>
  )
}
