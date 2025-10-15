import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_CREATE_VOICE_URL = 'https://api.elevenlabs.io/v1/text-to-voice'

// Request validation schema - matches ElevenLabs Create Voice API specification
const createVoiceSchema = z.object({
  voice_name: z.string().min(1).max(255),
  voice_description: z.string().min(20).max(1000),
  generated_voice_id: z.string().min(1),
  labels: z.record(z.string(), z.string().nullable()).optional(),
  played_not_selected_voice_ids: z.array(z.string()).optional()
})

export async function POST(request: NextRequest) {
  try {
    console.log('🎤 [CREATE VOICE API] Request received')
    
    // Validate request body
    const body = await request.json()
    console.log('📝 [CREATE VOICE API] Request body:', JSON.stringify(body, null, 2))
    
    const validatedData = createVoiceSchema.parse(body)
    console.log('✅ [CREATE VOICE API] Validation passed')

    if (!ELEVENLABS_API_KEY) {
      console.error('❌ [CREATE VOICE API] API key missing')
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' }, 
        { status: 500 }
      )
    }
    
    console.log('🔑 [CREATE VOICE API] API key present:', ELEVENLABS_API_KEY ? 'YES' : 'NO')

    // Prepare ElevenLabs API request
    const elevenLabsRequest: any = {
      voice_name: validatedData.voice_name,
      voice_description: validatedData.voice_description,
      generated_voice_id: validatedData.generated_voice_id
    }

    // Add optional parameters if provided
    if (validatedData.labels) {
      elevenLabsRequest.labels = validatedData.labels
    }

    if (validatedData.played_not_selected_voice_ids) {
      elevenLabsRequest.played_not_selected_voice_ids = validatedData.played_not_selected_voice_ids
    }

    console.log('🌐 [CREATE VOICE API] Calling ElevenLabs:', ELEVENLABS_CREATE_VOICE_URL)
    console.log('📦 [CREATE VOICE API] Payload:', JSON.stringify(elevenLabsRequest, null, 2))

    // Call ElevenLabs Create Voice API
    const response = await fetch(ELEVENLABS_CREATE_VOICE_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify(elevenLabsRequest)
    })

    console.log('📡 [CREATE VOICE API] ElevenLabs response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [CREATE VOICE API] ElevenLabs error:', errorText)
      
      return NextResponse.json(
        { 
          error: 'ElevenLabs Create Voice API call failed', 
          details: errorText,
          status: response.status 
        }, 
        { status: response.status }
      )
    }

    // Parse the response
    const voiceResult = await response.json()
    
    console.log('✅ [CREATE VOICE API] Success:', { 
      voice_id: voiceResult.voice_id,
      name: voiceResult.name,
      preview_url: voiceResult.preview_url ? 'YES' : 'NO'
    })

    // Return the voice creation result
    return NextResponse.json(voiceResult, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ [CREATE VOICE API] Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors }, 
        { status: 400 }
      )
    }

    console.error('❌ [CREATE VOICE API] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
