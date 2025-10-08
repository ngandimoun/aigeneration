import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech'

// Request validation schema - matches ElevenLabs API specification
const textToVoiceSchema = z.object({
  text: z.string().min(1).max(5000),
  voice_id: z.string().min(1),
  model_id: z.string().optional().default('eleven_v3'),
  language_code: z.string().optional(),
  voice_settings: z.object({
    stability: z.number().min(0).max(1).optional().default(0.5),
    similarity_boost: z.number().min(0).max(1).optional().default(0.75),
    style: z.number().min(0).max(1).optional().default(0.0),
    use_speaker_boost: z.boolean().optional().default(true)
  }).optional(),
  output_format: z.string().optional().default('mp3_44100_128'),
  optimize_streaming_latency: z.number().min(0).max(4).optional().default(0),
  enable_logging: z.boolean().optional().default(true),
  seed: z.number().optional(),
  previous_text: z.string().optional(),
  next_text: z.string().optional(),
  previous_request_ids: z.array(z.string()).optional(),
  next_request_ids: z.array(z.string()).optional(),
  use_pvc_as_ivc: z.boolean().optional().default(false),
  apply_text_normalization: z.enum(['auto', 'on', 'off']).optional().default('auto'),
  apply_language_text_normalization: z.boolean().optional().default(true),
  hcaptcha_token: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json()
    const validatedData = textToVoiceSchema.parse(body)

    if (!ELEVENLABS_API_KEY) {
      console.error('❌ ElevenLabs API key not configured')
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' }, 
        { status: 500 }
      )
    }

    // Prepare ElevenLabs API request with all supported parameters
    const elevenLabsRequest: any = {
      text: validatedData.text,
      model_id: validatedData.model_id
    }

    // Add optional parameters if provided
    if (validatedData.language_code) {
      elevenLabsRequest.language_code = validatedData.language_code
    }

    if (validatedData.voice_settings) {
      elevenLabsRequest.voice_settings = validatedData.voice_settings
    }

    if (validatedData.seed !== undefined) {
      elevenLabsRequest.seed = validatedData.seed
    }

    if (validatedData.previous_text) {
      elevenLabsRequest.previous_text = validatedData.previous_text
    }

    if (validatedData.next_text) {
      elevenLabsRequest.next_text = validatedData.next_text
    }

    if (validatedData.previous_request_ids) {
      elevenLabsRequest.previous_request_ids = validatedData.previous_request_ids
    }

    if (validatedData.next_request_ids) {
      elevenLabsRequest.next_request_ids = validatedData.next_request_ids
    }

    if (validatedData.use_pvc_as_ivc !== undefined) {
      elevenLabsRequest.use_pvc_as_ivc = validatedData.use_pvc_as_ivc
    }

    if (validatedData.apply_text_normalization) {
      elevenLabsRequest.apply_text_normalization = validatedData.apply_text_normalization
    }

    if (validatedData.apply_language_text_normalization !== undefined) {
      elevenLabsRequest.apply_language_text_normalization = validatedData.apply_language_text_normalization
    }

    if (validatedData.hcaptcha_token) {
      elevenLabsRequest.hcaptcha_token = validatedData.hcaptcha_token
    }

    // Build query parameters
    const queryParams = new URLSearchParams()
    if (validatedData.output_format) {
      queryParams.append('output_format', validatedData.output_format)
    }
    if (validatedData.optimize_streaming_latency !== undefined) {
      queryParams.append('optimize_streaming_latency', validatedData.optimize_streaming_latency.toString())
    }
    if (validatedData.enable_logging !== undefined) {
      queryParams.append('enable_logging', validatedData.enable_logging.toString())
    }

    const apiUrl = `${ELEVENLABS_API_URL}/${validatedData.voice_id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    console.log('🎙️ Calling ElevenLabs API with:', {
      voice_id: validatedData.voice_id,
      text_length: validatedData.text.length,
      model_id: validatedData.model_id,
      output_format: validatedData.output_format,
      optimize_streaming_latency: validatedData.optimize_streaming_latency,
      enable_logging: validatedData.enable_logging
    })

    // Call ElevenLabs API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify(elevenLabsRequest)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ ElevenLabs API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      
      return NextResponse.json(
        { 
          error: 'ElevenLabs API call failed', 
          details: errorText,
          status: response.status 
        }, 
        { status: response.status }
      )
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer()
    
    console.log('✅ ElevenLabs API success:', {
      audio_size: audioBuffer.byteLength,
      content_type: response.headers.get('content-type')
    })

    // Return the audio data
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors }, 
        { status: 400 }
      )
    }

    console.error('❌ Unexpected error in ElevenLabs text-to-voice:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

