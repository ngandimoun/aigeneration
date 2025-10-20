import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { get1080p, extendVeo } from '@/lib/kie'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const code: number = body?.code
    const msg: string = body?.msg
    const data = body?.data || {}
    const taskId: string | undefined = data?.taskId
    const info = data?.info || {}
    const resultUrls: string[] | undefined = info?.resultUrls
    const originUrls: string[] | undefined = info?.originUrls
    const resolution: string | undefined = info?.resolution
    const fallbackFlag: boolean = !!data?.fallbackFlag

    if (!taskId) {
      return NextResponse.json({ error: 'Missing taskId' }, { status: 400 })
    }

    // Find UGC Ad by kie_task_id
    const { data: ugcAd, error: findErr } = await supabase
      .from('ugc_ads')
      .select('*')
      .eq('content->kie->>taskId', taskId)
      .maybeSingle()

    if (findErr || !ugcAd) {
      // Also try dedicated column if present
      const { data: ugcAlt } = await supabase
        .from('ugc_ads')
        .select('*')
        .eq('kie_task_id', taskId)
        .maybeSingle()
      if (!ugcAlt) {
        return NextResponse.json({ error: 'UGC ad not found for taskId' }, { status: 404 })
      }
    }

    if (code !== 200) {
      await supabase
        .from('ugc_ads')
        .update({ status: 'failed', metadata: { ...(ugcAd?.metadata || {}), kie_callback: { code, msg } } })
        .eq('id', (ugcAd as any)?.id || (ugcAd as any)?.id)
      return NextResponse.json({ code: 200, msg: 'ack' })
    }

    const userId = (ugcAd as any).user_id

    // Decide best source URL to archive
    // If not fallback, prefer 1080p endpoint; else use first resultUrls
    let archivalUrl: string | undefined
    if (!fallbackFlag) {
      try {
        const hd = await get1080p(taskId)
        if (hd.code === 200 && hd.data?.resultUrl) archivalUrl = hd.data.resultUrl
      } catch {}
    }
    if (!archivalUrl && Array.isArray(resultUrls) && resultUrls[0]) {
      archivalUrl = resultUrls[0]
    }

    let storagePath: string | null = null
    if (archivalUrl) {
      // Download and upload to Supabase storage
      const res = await fetch(archivalUrl)
      if (!res.ok) throw new Error(`Fetch video failed ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      const filePath = `renders/ugc-ads/${userId}/generated/${uuidv4()}.mp4`
      const { error: upErr } = await supabase.storage
        .from('dreamcut')
        .upload(filePath, buf, { contentType: 'video/mp4', cacheControl: '3600', upsert: false })
      if (upErr) throw upErr
      storagePath = filePath
    }

    // Create signed URL
    let signedUrl: string | null = null
    if (storagePath) {
      const { data: signed } = await supabase.storage
        .from('dreamcut')
        .createSignedUrl(storagePath, 60 * 60 * 24) // 24h
      signedUrl = signed?.signedUrl || null
    }

    // Update UGC ad row (initial completion)
    await supabase
      .from('ugc_ads')
      .update({
        status: 'completed',
        generated_video_url: signedUrl,
        storage_path: storagePath,
        metadata: {
          ...(ugcAd?.metadata || {}),
          kie_callback: { code, msg, fallbackFlag, resolution, originUrls: originUrls || null },
        }
      })
      .eq('id', (ugcAd as any).id)

    // Auto-extend if requested_duration > actual segment length
    const requestedDuration = (ugcAd as any)?.metadata?.requested_duration
    // We don't have exact length from KIE here; conservatively assume ~6s per clip and extend when requested > 6s
    if (typeof requestedDuration === 'number' && requestedDuration > 6) {
      try {
        const extendPrompt = 'Continue the story seamlessly with consistent style and pacing.'
        const ext = await extendVeo({ taskId, prompt: extendPrompt, callBackUrl: `${process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/kie/veo/callback` })
        if (ext.code === 200) {
          await supabase
            .from('ugc_ads')
            .update({ status: 'extending' })
            .eq('id', (ugcAd as any).id)
        }
      } catch {}
    }

    return NextResponse.json({ code: 200, msg: 'success' })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}


