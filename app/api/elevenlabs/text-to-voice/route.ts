import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech'

// Request validation schema
const textToVoiceSchema = z.object({
  text: z.string().min(1).max(5000),
  voice_id: z.string().min(1),
  voice_settings: z.object({
    stability: z.number().min(0).max(1).optional().default(0.5),
    similarity_boost: z.number().min(0).max(1).optional().default(0.75),
    style: z.number().min(0).max(1).optional().default(0.0),
    use_speaker_boost: z.boolean().optional().default(true)
  }).optional(),
  model_id: z.string().optional().default('eleven_multilingual_v2')
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

    // Prepare ElevenLabs API request
    const elevenLabsRequest = {
      text: validatedData.text,
      model_id: validatedData.model_id,
      voice_settings: validatedData.voice_settings || {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    }

    console.log('🎙️ Calling ElevenLabs API with:', {
      voice_id: validatedData.voice_id,
      text_length: validatedData.text.length,
      model_id: validatedData.model_id
    })

    // Call ElevenLabs API
    const response = await fetch(`${ELEVENLABS_API_URL}/${validatedData.voice_id}`, {
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
