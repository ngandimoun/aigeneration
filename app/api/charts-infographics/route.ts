import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for chart/infographic creation
const createChartInfographicSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  selected_artifact: z.string().optional(),
  chart_type: z.string().optional(),
  data_type: z.string().optional(),
  style: z.string().optional(),
  color_scheme: z.string().optional(),
  layout: z.string().optional(),
  data_points: z.record(z.any()).optional(),
  labels: z.record(z.any()).optional(),
  annotations: z.record(z.any()).optional(),
  source_attribution: z.string().optional(),
  target_audience: z.string().optional(),
  content: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  is_template: z.boolean().optional().default(false),
})

// GET /api/charts-infographics - Get user's charts/infographics
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
      .from('charts_infographics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination (use range instead of limit to avoid conflicts)
    query = query.range(offset, offset + limit - 1)

    const { data: chartsInfographics, error } = await query

    if (error) {
      console.error('Error fetching charts/infographics:', error)
      return NextResponse.json({ error: 'Failed to fetch charts/infographics' }, { status: 500 })
    }

    return NextResponse.json({ chartsInfographics }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error in GET /api/charts-infographics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/charts-infographics - Create new chart/infographic
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
    const validatedData = createChartInfographicSchema.parse(body)

    // Create chart/infographic
    const { data: chartInfographic, error } = await supabase
      .from('charts_infographics')
      .insert({
        user_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        selected_artifact: validatedData.selected_artifact,
        chart_type: validatedData.chart_type,
        data_type: validatedData.data_type,
        style: validatedData.style,
        color_scheme: validatedData.color_scheme,
        layout: validatedData.layout,
        data_points: validatedData.data_points,
        labels: validatedData.labels,
        annotations: validatedData.annotations,
        source_attribution: validatedData.source_attribution,
        target_audience: validatedData.target_audience,
        content: validatedData.content,
        metadata: validatedData.metadata,
        is_template: validatedData.is_template,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating chart/infographic:', error)
      return NextResponse.json({ error: 'Failed to create chart/infographic' }, { status: 500 })
    }

    return NextResponse.json({ chartInfographic }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('Unexpected error in POST /api/charts-infographics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
