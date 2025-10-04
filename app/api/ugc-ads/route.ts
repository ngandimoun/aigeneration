import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for UGC ad creation
const createUgcAdSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  selected_artifact: z.string().optional(),
  ad_type: z.string().optional(),
  platform: z.string().optional(),
  format: z.string().optional(),
  duration: z.number().optional(),
  style: z.string().optional(),
  target_demographic: z.string().optional(),
  product_category: z.string().optional(),
  call_to_action: z.string().optional(),
  brand_mentions: z.record(z.any()).optional(),
  hashtags: z.record(z.any()).optional(),
  music_style: z.string().optional(),
  content: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  is_template: z.boolean().optional().default(false),
})

// GET /api/ugc-ads - Get user's UGC ads
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query with filters
    let query = supabase
      .from('ugc_ads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination (use range instead of limit to avoid conflicts)
    query = query.range(offset, offset + limit - 1)

    const { data: ugcAds, error } = await query

    if (error) {
      console.error('Error fetching UGC ads:', error)
      return NextResponse.json({ error: 'Failed to fetch UGC ads' }, { status: 500 })
    }

    return NextResponse.json({ ugcAds }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error in GET /api/ugc-ads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/ugc-ads - Create new UGC ad
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createUgcAdSchema.parse(body)

    // Create UGC ad
    const { data: ugcAd, error } = await supabase
      .from('ugc_ads')
      .insert({
        user_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        selected_artifact: validatedData.selected_artifact,
        ad_type: validatedData.ad_type,
        platform: validatedData.platform,
        format: validatedData.format,
        duration: validatedData.duration,
        style: validatedData.style,
        target_demographic: validatedData.target_demographic,
        product_category: validatedData.product_category,
        call_to_action: validatedData.call_to_action,
        brand_mentions: validatedData.brand_mentions,
        hashtags: validatedData.hashtags,
        music_style: validatedData.music_style,
        content: validatedData.content,
        metadata: validatedData.metadata,
        is_template: validatedData.is_template,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating UGC ad:', error)
      return NextResponse.json({ error: 'Failed to create UGC ad' }, { status: 500 })
    }

    return NextResponse.json({ ugcAd }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Unexpected error in POST /api/ugc-ads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
