type KieModel = 'veo3' | 'veo3_fast'

interface GenerateVeoParams {
  prompt: string
  imageUrls?: string[]
  model?: KieModel
  generationType?: 'TEXT_2_VIDEO' | 'FIRST_AND_LAST_FRAMES_2_VIDEO' | 'REFERENCE_2_VIDEO'
  aspectRatio?: '16:9' | '9:16' | 'Auto'
  seeds?: number
  callBackUrl?: string
  enableTranslation?: boolean
  watermark?: string
}

export interface KieGenerateResponse {
  code: number
  msg: string
  data?: { taskId: string }
}

export interface KieRecordInfoResponse {
  code: number
  msg: string
  data?: {
    taskId: string
    paramJson?: string
    completeTime?: string
    response?: {
      taskId: string
      resultUrls?: string[]
      originUrls?: string[]
      resolution?: string
    }
    successFlag?: 0 | 1 | 2
    errorCode?: number | null
    errorMessage?: string | null
    createTime?: string
    fallbackFlag?: boolean
  }
}

export interface Kie1080pResponse {
  code: number
  msg: string
  data?: { resultUrl?: string }
}

interface ExtendVeoParams {
  taskId: string
  prompt: string
  seeds?: number
  watermark?: string
  callBackUrl?: string
}

const KIE_API_BASE = process.env.KIE_API_BASE || 'https://api.kie.ai'
const KIE_API_KEY = process.env.KIE_API_KEY

function authHeaders() {
  if (!KIE_API_KEY) throw new Error('Missing KIE_API_KEY')
  return {
    Authorization: `Bearer ${KIE_API_KEY}`,
  }
}

export async function generateVeo(params: GenerateVeoParams): Promise<KieGenerateResponse> {
  const payload = {
    prompt: params.prompt,
    imageUrls: params.imageUrls,
    model: params.model || 'veo3_fast',
    generationType: params.generationType,
    aspectRatio: params.aspectRatio || '16:9',
    seeds: params.seeds,
    callBackUrl: params.callBackUrl,
    enableTranslation: params.enableTranslation ?? true,
    watermark: params.watermark,
  }
  const res = await fetch(`${KIE_API_BASE}/api/v1/veo/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error('[KIE] generate non-OK', { status: res.status, payload, text })
    throw new Error(`KIE generate failed: HTTP ${res.status}`)
  }
  return (await res.json()) as KieGenerateResponse
}

export async function getRecordInfo(taskId: string): Promise<KieRecordInfoResponse> {
  const url = new URL(`${KIE_API_BASE}/api/v1/veo/record-info`)
  url.searchParams.set('taskId', taskId)
  const res = await fetch(url.toString(), { headers: { ...authHeaders() } })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error('[KIE] record-info non-OK', { status: res.status, url: url.toString(), text })
    throw new Error(`KIE record-info failed: HTTP ${res.status}`)
  }
  return (await res.json()) as KieRecordInfoResponse
}

export async function get1080p(taskId: string, index?: number): Promise<Kie1080pResponse> {
  const url = new URL(`${KIE_API_BASE}/api/v1/veo/get-1080p-video`)
  url.searchParams.set('taskId', taskId)
  if (typeof index === 'number') url.searchParams.set('index', String(index))
  const res = await fetch(url.toString(), { headers: { ...authHeaders() } })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error('[KIE] get-1080p non-OK', { status: res.status, url: url.toString(), text })
    throw new Error(`KIE get-1080p failed: HTTP ${res.status}`)
  }
  return (await res.json()) as Kie1080pResponse
}

export async function extendVeo(params: ExtendVeoParams): Promise<KieGenerateResponse> {
  const res = await fetch(`${KIE_API_BASE}/api/v1/veo/extend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({
      taskId: params.taskId,
      prompt: params.prompt,
      seeds: params.seeds,
      watermark: params.watermark,
      callBackUrl: params.callBackUrl,
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error('[KIE] extend non-OK', { status: res.status, payload: { taskId: params.taskId }, text })
    throw new Error(`KIE extend failed: HTTP ${res.status}`)
  }
  return (await res.json()) as KieGenerateResponse
}


