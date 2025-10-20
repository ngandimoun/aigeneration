import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { get1080p, getRecordInfo, extendVeo } from '@/lib/kie'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId') || undefined
    const ugcId = searchParams.get('ugcId') || undefined

    if (!taskId && !ugcId) {
      return NextResponse.json({ error: 'taskId or ugcId required' }, { status: 400 })
    }

    let currentTaskId = taskId
    let ugcAd: any = null

    if (ugcId) {
      const { data, error } = await supabase
        .from('ugc_ads')
        .select('*')
        .eq('id', ugcId)
        .maybeSingle()
      if (error || !data) return NextResponse.json({ error: 'UGC ad not found' }, { status: 404 })
      ugcAd = data
      currentTaskId = ugcAd.kie_task_id || ugcAd?.content?.kie?.taskId
      if (!currentTaskId) return NextResponse.json({ error: 'No KIE taskId on record' }, { status: 400 })
    }

    let info
    try {
      info = await getRecordInfo(currentTaskId!)
    } catch (err) {
      console.error('[Status] record-info error', { taskId: currentTaskId, message: (err as Error).message })
      return NextResponse.json({ status: 'retry', msg: 'record-info error' }, { status: 200 })
    }
    if (info.code !== 200 || !info.data) {
      return NextResponse.json({ status: 'unknown', msg: info.msg }, { status: 200 })
    }

    const d = info.data
    if (d.successFlag === 0) {
      return NextResponse.json({ status: 'generating' }, { status: 200 })
    }
    if (d.successFlag === 2 || d.successFlag === 3) {
      if (ugcAd) {
        await supabase.from('ugc_ads').update({ status: 'failed' }).eq('id', ugcAd.id)
      }
      return NextResponse.json({ status: 'failed', errorCode: d.errorCode, errorMessage: d.errorMessage }, { status: 200 })
    }

    // successFlag === 1 => success
    const fallbackFlag = !!d.fallbackFlag
    const resultUrls = d.response?.resultUrls || []

    // Prefer 1080p when not fallback
    let archivalUrl: string | undefined
    if (!fallbackFlag) {
      try {
        const hd = await get1080p(currentTaskId!)
        if (hd.code === 200 && hd.data?.resultUrl) archivalUrl = hd.data.resultUrl
      } catch {}
    }
    if (!archivalUrl && resultUrls[0]) archivalUrl = resultUrls[0]

    let storagePath: string | null = null
    let signedUrl: string | null = null
    if (archivalUrl) {
      const res = await fetch(archivalUrl)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.error('[Status] fetch archivalUrl non-OK', { status: res.status, archivalUrl, text })
        throw new Error(`Fetch video failed ${res.status}`)
      }
      const buf = Buffer.from(await res.arrayBuffer())
      const filePath = `renders/ugc-ads/${(ugcAd || {}).user_id || 'unknown'}/generated/${uuidv4()}.mp4`
      const { error: upErr } = await supabase.storage
        .from('dreamcut')
        .upload(filePath, buf, { contentType: 'video/mp4', cacheControl: '3600', upsert: false })
      if (upErr) {
        console.error('[Status] supabase upload error', upErr)
        throw upErr
      }
      storagePath = filePath
      const { data: signed } = await supabase.storage
        .from('dreamcut')
        .createSignedUrl(filePath, 60 * 60 * 24)
      signedUrl = signed?.signedUrl || null
    }

    if (ugcAd) {
      await supabase
        .from('ugc_ads')
        .update({
          status: 'completed',
          generated_video_url: signedUrl,
          storage_path: storagePath,
          metadata: {
            ...(ugcAd.metadata || {}),
            polled: true,
            fallbackFlag,
          }
        })
        .eq('id', ugcAd.id)

      // Auto-extend
      const requestedDuration = ugcAd?.metadata?.requested_duration
      if (typeof requestedDuration === 'number' && requestedDuration > 8) {
        try {
          const ext = await extendVeo({ taskId: currentTaskId!, prompt: 'Continue the story seamlessly with consistent style and pacing.' })
          if (ext.code === 200) {
            await supabase.from('ugc_ads').update({ status: 'extending' }).eq('id', ugcAd.id)
          }
        } catch {}
      }
    }

    return NextResponse.json({ status: 'completed', generated_video_url: signedUrl, storage_path: storagePath }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}


