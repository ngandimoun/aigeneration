import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

// Cache for 30 seconds
export const revalidate = 30

// Validation schema for chart/infographic creation
const createChartInfographicSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
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

    // Regenerate expired signed URLs from storage_paths
    if (chartsInfographics && chartsInfographics.length > 0) {
      for (const chart of chartsInfographics) {
        if (chart.storage_paths && chart.storage_paths.length > 0) {
          // Regenerate fresh signed URLs from storage paths
          const freshUrls: string[] = []
          for (const storagePath of chart.storage_paths) {
            const { data: signedUrlData } = await supabase.storage
              .from('dreamcut')
              .createSignedUrl(storagePath, 86400) // 24 hour expiry
            if (signedUrlData?.signedUrl) {
              freshUrls.push(signedUrlData.signedUrl)
            }
          }
          // Replace expired URLs with fresh ones
          if (freshUrls.length > 0) {
            chart.generated_images = freshUrls
          }
        }
      }
    }

    return NextResponse.json({ chartsInfographics }, { 
      status: 200,
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
        'CDN-Cache-Control': 'max-age=30'
      }
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/charts-infographics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to convert null to undefined
const nullToUndefined = (value: string | null): string | undefined => {
  return value === null ? undefined : value
}

// POST /api/charts-infographics - Create new chart/infographic
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Charts/Infographics generation API called')
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data instead of JSON
    const formData = await request.formData()
    
    // Extract form fields
    const title = formData.get('title')?.toString() || ''
    const description = formData.get('description')?.toString() || ''
    const prompt = formData.get('prompt')?.toString() || ''
    const dataSource = formData.get('dataSource')?.toString() || 'text'
    const autoDetected = formData.get('autoDetected')?.toString() === 'true'
    const aggregationType = formData.get('aggregationType')?.toString() || 'sum'
    const units = formData.get('units')?.toString() || null
    const labels = formData.get('labels')?.toString() || null
    
    // Purpose & Chart Configuration
    const purpose = formData.get('purpose')?.toString() || null
    const chartType = formData.get('chartType')?.toString() || null
    const axisMapping = formData.get('axisMapping')?.toString() ? JSON.parse(formData.get('axisMapping')?.toString() || '{}') : {}
    const multiSeries = formData.get('multiSeries')?.toString() === 'true'
    const orientation = formData.get('orientation')?.toString() || 'vertical'
    
    // Visual Style
    const artDirection = formData.get('artDirection')?.toString() || null
    const visualInfluence = formData.get('visualInfluence')?.toString() || null
    const chartDepth = parseInt(formData.get('chartDepth')?.toString() || '0')
    const backgroundTexture = formData.get('backgroundTexture')?.toString() || null
    const accentShapes = formData.get('accentShapes')?.toString() === 'true'
    
    // Mood & Atmosphere
    const moodContext = formData.get('moodContext')?.toString() || null
    const toneIntensity = parseInt(formData.get('toneIntensity')?.toString() || '50')
    const lightingTemperature = parseInt(formData.get('lightingTemperature')?.toString() || '50')
    const motionAccent = formData.get('motionAccent')?.toString() || 'none'
    
    // Branding
    const brandSync = formData.get('brandSync')?.toString() === 'true'
    const paletteMode = formData.get('paletteMode')?.toString() || 'categorical'
    const backgroundType = formData.get('backgroundType')?.toString() || 'light'
    const fontFamily = formData.get('fontFamily')?.toString() || 'Inter'
    const logoPlacement = formData.get('logoPlacement')?.toString() 
      ? JSON.parse(formData.get('logoPlacement')?.toString() || '[]') 
      : []
    const logoDescription = formData.get('logoDescription')?.toString() || null
    
    // Annotations & Labels
    const dataLabels = formData.get('dataLabels')?.toString() === 'true'
    const labelPlacement = formData.get('labelPlacement')?.toString() || 'auto'
    const legends = formData.get('legends')?.toString() || 'auto'
    const callouts = formData.get('callouts')?.toString() === 'true'
    const calloutThreshold = parseInt(formData.get('calloutThreshold')?.toString() || '3')
    const tooltipStyle = formData.get('tooltipStyle')?.toString() || 'minimal'
    const axisTitles = formData.get('axisTitles')?.toString() || null
    const gridlines = formData.get('gridlines')?.toString() || 'light'
    
    // Layout
    const layoutTemplate = formData.get('layoutTemplate')?.toString() || 'auto'
    const aspectRatio = formData.get('aspectRatio')?.toString() || '16:9'
    const marginDensity = parseInt(formData.get('marginDensity')?.toString() || '50')
    const safeZoneOverlay = formData.get('safeZoneOverlay')?.toString() === 'true'
    
    // Narrative
    const headline = formData.get('headline')?.toString() || null
    const caption = formData.get('caption')?.toString() || null
    const tone = formData.get('tone')?.toString() || 'formal'
    const platform = formData.get('platform')?.toString() || 'web'
    
    // Metadata
    const metadata = formData.get('metadata')?.toString() ? JSON.parse(formData.get('metadata')?.toString() || '{}') : {}

    // Handle CSV file upload
    let csvFilePath: string | null = null
    const csvFile = formData.get('csvFile') as File | null
    if (csvFile) {
      const filePath = `renders/charts/${user.id}/csv/${uuidv4()}-${csvFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('dreamcut')
        .upload(filePath, csvFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading CSV file:', uploadError)
        return NextResponse.json({ error: `Failed to upload CSV file: ${uploadError.message}` }, { status: 500 })
      }
      csvFilePath = filePath
    }

    // Handle logo upload
    let logoImagePath: string | null = null
    const logoFile = formData.get('logoFile') as File | null
    if (logoFile) {
      const filePath = `renders/charts/${user.id}/logo/${uuidv4()}-${logoFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('dreamcut')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading logo file:', uploadError)
        return NextResponse.json({ error: `Failed to upload logo file: ${uploadError.message}` }, { status: 500 })
      }
      logoImagePath = filePath
    }

    console.log('📝 Chart generation data:', {
      title,
      prompt,
      dataSource,
      chartType,
      artDirection,
      visualInfluence,
      csvFile: csvFilePath ? 'uploaded' : 'none',
      logoFile: logoImagePath ? 'uploaded' : 'none'
    })

    // Generate unique ID for this generation
    const generationId = `ci_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const generationTimestamp = new Date().toISOString()

    // For now, we'll simulate chart generation with placeholder URLs
    // In a real implementation, you would call a chart generation service
    const imageUrls = Array.from({ length: 4 }, (_, index) => 
      `https://picsum.photos/seed/${generationId}_${index}/1024/1024`
    )
    const generatedStoragePaths = Array.from({ length: 4 }, (_, index) => 
      `renders/charts/${user.id}/generated/${uuidv4()}-generated_${index}.jpg`
    )

    console.log('📊 Generated charts:', imageUrls)

    // Save to charts_infographics table with new schema
    console.log('🔄 Attempting to save to charts_infographics table...')
    const chartData = {
        user_id: user.id,
        title: title || `Chart ${new Date().toLocaleDateString()}`,
        description: nullToUndefined(description),
        prompt: prompt || 'Chart generation',
        
        // Data Source & Content
        data_source: dataSource,
        csv_file_path: csvFilePath,
        text_data: nullToUndefined(prompt),
        auto_detected: autoDetected,
        aggregation_type: aggregationType,
        units: nullToUndefined(units),
        labels: nullToUndefined(labels),
        
        // Purpose & Chart Configuration
        purpose: nullToUndefined(purpose),
        chart_type: nullToUndefined(chartType),
        axis_mapping: axisMapping,
        multi_series: multiSeries,
        orientation: orientation,
        
        // Visual Style
        art_direction: nullToUndefined(artDirection),
        visual_influence: nullToUndefined(visualInfluence),
        chart_depth: chartDepth,
        background_texture: nullToUndefined(backgroundTexture),
        accent_shapes: accentShapes,
        
        // Mood & Atmosphere
        mood_context: nullToUndefined(moodContext),
        tone_intensity: toneIntensity,
        lighting_temperature: lightingTemperature,
        motion_accent: motionAccent,
        
        // Branding
        brand_sync: brandSync,
        palette_mode: paletteMode,
        background_type: backgroundType,
        font_family: fontFamily,
        logo_image_path: logoImagePath,
        logo_placement: logoPlacement,
        logo_description: logoDescription,
        
        // Annotations & Labels
        data_labels: dataLabels,
        label_placement: labelPlacement,
        legends: legends,
        callouts: callouts,
        callout_threshold: calloutThreshold,
        tooltip_style: tooltipStyle,
        axis_titles: nullToUndefined(axisTitles),
        gridlines: gridlines,
        
        // Layout
        layout_template: layoutTemplate,
        aspect_ratio: aspectRatio,
        margin_density: marginDensity,
        safe_zone_overlay: safeZoneOverlay,
        
        // Narrative
        headline: nullToUndefined(headline),
        caption: nullToUndefined(caption),
        tone: tone,
        platform: platform,
        
        // Generated Content
        generated_images: imageUrls,
        storage_paths: generatedStoragePaths,
        
        // Status & Metadata
        status: 'completed',
        metadata: {
          generationTimestamp,
          dataSource,
          chartType,
          artDirection,
          visualInfluence,
          projectTitle: metadata?.projectTitle,
          generated_via: 'charts-infographics-generation',
          brandSync,
          paletteMode,
          backgroundType
        },
        content: {
          images: imageUrls,
          generation_id: generationId,
          full_prompt: prompt,
          settings: {
            title,
            description,
            prompt,
            dataSource,
            autoDetected,
            aggregationType,
            units,
            labels,
            purpose,
            chartType,
            axisMapping,
            multiSeries,
            orientation,
            artDirection,
            visualInfluence,
            chartDepth,
            backgroundTexture,
            accentShapes,
            moodContext,
            toneIntensity,
            lightingTemperature,
            motionAccent,
            brandSync,
            paletteMode,
            backgroundType,
            fontFamily,
            logoPlacement,
            logoDescription,
            dataLabels,
            labelPlacement,
            legends,
            callouts,
            calloutThreshold,
            tooltipStyle,
            axisTitles,
            gridlines,
            layoutTemplate,
            aspectRatio,
            marginDensity,
            safeZoneOverlay,
            headline,
            caption,
            tone,
            platform
          }
        }
      }
    
    console.log('📝 Chart data to insert:', JSON.stringify(chartData, null, 2))
    
    const { data: chartRecord, error: chartError } = await supabase
      .from('charts_infographics')
      .insert(chartData)
      .select()
      .single()

    if (chartError) {
      console.error('❌ Error saving to charts_infographics table:', chartError)
      console.error('❌ Full error details:', JSON.stringify(chartError, null, 2))
      // Continue even if this fails
    } else {
      console.log('✅ Chart saved to charts_infographics table:', chartRecord.id)
      console.log('✅ Chart record:', JSON.stringify(chartRecord, null, 2))
      
      // Add to library_items table
      const { error: libraryError } = await supabase
        .from('library_items')
        .insert({
          user_id: user.id,
          content_type: 'charts_infographics',
          content_id: chartRecord.id,
          date_added_to_library: new Date().toISOString()
        })

      if (libraryError) {
        console.error('Failed to add chart to library:', libraryError)
      } else {
        console.log(`✅ Chart ${chartRecord.id} added to library`)
      }
    }

    // Build response
    const response = {
      success: true,
      images: imageUrls,
      metadata: {
        generationId,
        timestamp: generationTimestamp,
        settings: {
          title,
          prompt,
          dataSource,
          chartType,
          artDirection,
          visualInfluence,
          csvFile: csvFilePath ? 'uploaded' : 'none',
          logoFile: logoImagePath ? 'uploaded' : 'none'
        }
      }
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
