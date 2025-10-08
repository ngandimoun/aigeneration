import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AutocaptionModelInputs } from '@/lib/types/subtitles'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's subtitles
    const { data: subtitles, error } = await supabase
      .from('subtitles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subtitles:', error)
      return NextResponse.json({ error: 'Failed to fetch subtitles' }, { status: 500 })
    }

    return NextResponse.json({ subtitles })
  } catch (error) {
    console.error('Error in GET /api/subtitles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const subtitleData: AutocaptionModelInputs = body

    // Validate required fields
    if (!subtitleData.video_file_input) {
      return NextResponse.json({ error: 'Video file is required' }, { status: 400 })
    }

    // Create subtitle record
    const { data: subtitle, error } = await supabase
      .from('subtitles')
      .insert({
        user_id: user.id,
        title: body.title || `Subtitle Project - ${new Date().toLocaleDateString()}`,
        description: body.description || 'Video subtitle generation project',
        video_file_input: subtitleData.video_file_input,
        transcript_file_input: subtitleData.transcript_file_input,
        output_video: subtitleData.output_video,
        output_transcript: subtitleData.output_transcript,
        subs_position: subtitleData.subs_position,
        color: subtitleData.color,
        highlight_color: subtitleData.highlight_color,
        fontsize: subtitleData.fontsize,
        max_chars: subtitleData.MaxChars,
        opacity: subtitleData.opacity,
        font: subtitleData.font,
        stroke_color: subtitleData.stroke_color,
        stroke_width: subtitleData.stroke_width,
        kerning: subtitleData.kerning,
        right_to_left: subtitleData.right_to_left,
        translate: subtitleData.translate,
        emoji_enrichment: subtitleData.emoji_enrichment,
        emoji_strategy: subtitleData.emoji_strategy,
        emoji_map: subtitleData.emoji_map,
        keyword_emphasis: subtitleData.keyword_emphasis,
        keywords: subtitleData.keywords,
        keyword_style: subtitleData.keyword_style,
        save_to_supabase: subtitleData.save_to_supabase,
        supabase_bucket: subtitleData.supabase_bucket,
        supabase_path_prefix: subtitleData.supabase_pathPrefix,
        status: 'processing',
        content: subtitleData,
        metadata: {
          videoFile: subtitleData.video_file_input,
          hasTranscript: !!subtitleData.transcript_file_input,
          emojiEnrichment: subtitleData.emoji_enrichment,
          keywordEmphasis: subtitleData.keyword_emphasis,
          createdAt: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating subtitle:', error)
      return NextResponse.json({ error: 'Failed to create subtitle project' }, { status: 500 })
    }

    // TODO: Here you would typically call your subtitle generation service
    // For now, we'll just return the created record
    // In a real implementation, you might:
    // 1. Upload the video to your processing service
    // 2. Call a subtitle generation API (like Replicate, etc.)
    // 3. Process the results and update the record

    return NextResponse.json({ 
      subtitle,
      message: 'Subtitle project created successfully. Processing will begin shortly.'
    })
  } catch (error) {
    console.error('Error in POST /api/subtitles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
