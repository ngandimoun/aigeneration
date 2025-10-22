/**
 * OpenAI Chatbot Service for DreamCut AI Assistant
 * 
 * Handles GPT-4 conversations, image analysis, and prompt generation
 * with streaming responses and conversation history management.
 */

import OpenAI from 'openai'
import { generateSystemPrompt } from '@/lib/chatbot/knowledge-base'
import { ChatMessage, PromptGenerationRequest, PromptGenerationResponse } from '@/lib/types/chatbot'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ChatbotServiceConfig {
  model?: string
  maxTokens?: number
  temperature?: number
  stream?: boolean
}

export interface SendMessageParams {
  userId: string
  conversationId: string
  message: string
  currentSection?: string
  imageFiles?: File[]
  imageUrls?: string[]
  history?: ChatMessage[]
}

export interface ChatbotResponse {
  success: boolean
  message?: string
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export class ChatbotService {
  private config: ChatbotServiceConfig

  constructor(config: ChatbotServiceConfig = {}) {
    this.config = {
      model: 'gpt-5-mini-2025-08-07',
      maxTokens: 2000,
      stream: true,
      ...config
    }
  }

  /**
   * Send a message to the chatbot with optional image analysis
   */
  async sendMessage(params: SendMessageParams): Promise<ChatbotResponse> {
    try {
      const { userId, conversationId, message, currentSection, imageFiles, imageUrls, history } = params

      // Build messages array
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []

      // Add system prompt with current section context
      messages.push({
        role: 'system',
        content: generateSystemPrompt(currentSection)
      })

      // Add conversation history (last 10 messages to stay within token limits)
      const recentHistory = history?.slice(-10) || []
      for (const msg of recentHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = []
          
          // Add text content
          if (msg.content) {
            content.push({
              type: 'text',
              text: msg.content
            })
          }

          // Add image content if present
          if (msg.imageUrls && msg.imageUrls.length > 0) {
            for (const imageUrl of msg.imageUrls) {
              content.push({
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high'
                }
              })
            }
          }

          messages.push({
            role: msg.role,
            content: content.length === 1 && !msg.imageUrls?.length ? msg.content : content
          })
        }
      }

      // Add current message
      const currentContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = []
      
      // Add text content
      currentContent.push({
        type: 'text',
        text: message
      })

      // Add image content from files
      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles.slice(0, 2)) { // Max 2 images
          const base64 = await this.fileToBase64(file)
          currentContent.push({
            type: 'image_url',
            image_url: {
              url: `data:${file.type};base64,${base64}`,
              detail: 'high'
            }
          })
        }
      }

      // Add image content from URLs
      if (imageUrls && imageUrls.length > 0) {
        for (const url of imageUrls.slice(0, 2)) { // Max 2 images
          currentContent.push({
            type: 'image_url',
            image_url: {
              url: url,
              detail: 'high'
            }
          })
        }
      }

      messages.push({
        role: 'user',
        content: currentContent.length === 1 ? message : currentContent
      })

      // Make API call
      const response = await openai.chat.completions.create({
        model: this.config.model!,
        messages,
        max_completion_tokens: this.config.maxTokens,
        stream: false // We'll handle streaming in the API route
      })

      const assistantMessage = response.choices[0]?.message?.content

      if (!assistantMessage) {
        throw new Error('No response from OpenAI')
      }

      return {
        success: true,
        message: assistantMessage,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        }
      }

    } catch (error) {
      console.error('Chatbot service error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Generate streaming response for real-time chat
   */
  async *streamMessage(params: SendMessageParams): AsyncGenerator<string, void, unknown> {
    try {
      const { userId, conversationId, message, currentSection, imageFiles, imageUrls, history } = params

      // Build messages array (same as sendMessage)
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []

      messages.push({
        role: 'system',
        content: generateSystemPrompt(currentSection)
      })

      const recentHistory = history?.slice(-10) || []
      for (const msg of recentHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = []
          
          if (msg.content) {
            content.push({
              type: 'text',
              text: msg.content
            })
          }

          if (msg.imageUrls && msg.imageUrls.length > 0) {
            for (const imageUrl of msg.imageUrls) {
              content.push({
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high'
                }
              })
            }
          }

          messages.push({
            role: msg.role,
            content: content.length === 1 && !msg.imageUrls?.length ? msg.content : content
          })
        }
      }

      const currentContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = []
      currentContent.push({
        type: 'text',
        text: message
      })

      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles.slice(0, 2)) {
          const base64 = await this.fileToBase64(file)
          currentContent.push({
            type: 'image_url',
            image_url: {
              url: `data:${file.type};base64,${base64}`,
              detail: 'high'
            }
          })
        }
      }

      if (imageUrls && imageUrls.length > 0) {
        for (const url of imageUrls.slice(0, 2)) {
          currentContent.push({
            type: 'image_url',
            image_url: {
              url: url,
              detail: 'high'
            }
          })
        }
      }

      messages.push({
        role: 'user',
        content: currentContent.length === 1 ? message : currentContent
      })

      // Stream response
      const stream = await openai.chat.completions.create({
        model: this.config.model!,
        messages,
        max_completion_tokens: this.config.maxTokens,
        stream: true
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          yield content
        }
      }

    } catch (error) {
      console.error('Streaming error:', error)
      yield `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
    }
  }

  /**
   * Generate prompt from image analysis
   */
  async generatePromptFromImage(request: PromptGenerationRequest): Promise<PromptGenerationResponse> {
    try {
      const { imageFiles, imageUrls, instructions, assetType, currentSection } = request

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []

      // System prompt for image analysis
      messages.push({
        role: 'system',
        content: `You are an expert at analyzing images and creating detailed prompts for AI media generation.

Your task is to analyze the provided image(s) and create optimized prompts for DreamCut's ${assetType || currentSection || 'media generation'} features.

ANALYSIS REQUIREMENTS:
1. Describe the visual style, composition, and aesthetic
2. Identify key visual elements, colors, and mood
3. Note technical aspects (lighting, camera angle, depth of field)
4. Extract the overall atmosphere and emotional tone
5. Suggest improvements or variations

PROMPT GENERATION:
Create detailed, specific prompts that capture the essence of the image while being optimized for DreamCut's capabilities. Include:
- Visual style and aesthetic preferences
- Technical parameters (lighting, composition, etc.)
- Mood and atmosphere
- Specific details that make the image effective
- Variations for different use cases

Provide 2-3 different prompt variations with different approaches or styles.`
      })

      const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = []

      // Add instruction text
      content.push({
        type: 'text',
        text: `Please analyze this image and create optimized prompts for ${assetType || currentSection || 'media generation'}. 

Instructions: ${instructions}

Provide detailed analysis and 2-3 different prompt variations.`
      })

      // Add images
      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles.slice(0, 2)) {
          const base64 = await this.fileToBase64(file)
          content.push({
            type: 'image_url',
            image_url: {
              url: `data:${file.type};base64,${base64}`,
              detail: 'high'
            }
          })
        }
      }

      if (imageUrls && imageUrls.length > 0) {
        for (const url of imageUrls.slice(0, 2)) {
          content.push({
            type: 'image_url',
            image_url: {
              url: url,
              detail: 'high'
            }
          })
        }
      }

      messages.push({
        role: 'user',
        content: content.length === 1 ? content[0] : content
      })

      const response = await openai.chat.completions.create({
        model: this.config.model!,
        messages,
        max_completion_tokens: this.config.maxTokens
      })

      const analysis = response.choices[0]?.message?.content

      if (!analysis) {
        throw new Error('No analysis generated')
      }

      // Extract prompts from the response
      const promptMatches = analysis.match(/```[\s\S]*?```/g)
      const suggestions = promptMatches?.map(match => 
        match.replace(/```/g, '').trim()
      ) || []

      return {
        success: true,
        prompt: analysis,
        suggestions
      }

    } catch (error) {
      console.error('Image analysis error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze image'
      }
    }
  }

  /**
   * Convert file to base64 string
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Validate image file
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
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
}

// Export singleton instance
export const chatbotService = new ChatbotService()
