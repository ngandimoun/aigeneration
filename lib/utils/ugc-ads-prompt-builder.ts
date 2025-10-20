export interface BrandDNA {
  name?: string
  tone?: string
  colorCode?: string
}

export interface ProductEssence {
  name?: string
  heroBenefit?: string
  visualFocus?: string
  environment?: string
  materials?: string[]
  transformationType?: string
}

export interface StoryDNA {
  coreAngle?: string
  persona?: string
  emotionTone?: number
  patternInterruptType?: string
  hookFramework?: string
}

export interface CameraDNA {
  rhythm?: string
  movementStyle?: string
  cutFrequency?: string
  endingType?: string
}

export interface AudioDNA {
  soundMode?: string
  soundEmotion?: string
  keySounds?: string[]
}

export interface UGCConfig {
  brandDNA?: BrandDNA
  productEssence?: ProductEssence
  storyDNA?: StoryDNA
  cameraDNA?: CameraDNA
  audioDNA?: AudioDNA
}

export interface DialogueParams {
  script?: string
  voiceStyle?: string
  toneOfDelivery?: string
  language?: string
}

export interface AssetContext {
  product?: { title?: string; description?: string | null; imageUrl?: string | null }
  avatar?: { name?: string | null; ethnicity?: string | null; gender?: string | null }
  chart?: { palette?: string[] | null }
}

function include(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

export function buildUgcAdsEnhancedPrompt(params: {
  config?: UGCConfig
  dialogue?: DialogueParams
  aspectRatio?: '9:16' | '16:9' | '1:1'
  duration?: number
  assets?: AssetContext
  containsBoth?: boolean
  imageDescription?: string
  twoImageMode?: 'start-end' | 'comparison' | 'transformation' | 'flexible'
  images?: Array<{
    url?: string
    source?: 'library' | 'upload'
    purpose?: string
    containsBoth?: boolean
    description?: string
  }>
  sceneScripts?: { scene1?: string; scene2?: string; scene3?: string }
  sceneDescription?: string
}): string {
  const { config, dialogue, aspectRatio, duration, assets, containsBoth, imageDescription, twoImageMode, images, sceneScripts, sceneDescription } = params

  const parts: string[] = []

  // Core goal
  parts.push('Create an authentic UGC-style product advertisement video.')

  // Dialogue/script
  if (include(dialogue?.script)) {
    parts.push(`Script: ${dialogue!.script!.trim()}`)
  }
  if (include(dialogue?.voiceStyle) || include(dialogue?.toneOfDelivery) || include(dialogue?.language)) {
    const voiceBits: string[] = []
    if (include(dialogue?.voiceStyle)) voiceBits.push(`voice style ${dialogue!.voiceStyle}`)
    if (include(dialogue?.toneOfDelivery)) voiceBits.push(`tone ${dialogue!.toneOfDelivery}`)
    if (include(dialogue?.language)) voiceBits.push(`language ${dialogue!.language}`)
    if (voiceBits.length) parts.push(`Narration: ${voiceBits.join(', ')}`)
  }

  // Brand DNA
  if (config?.brandDNA && (include(config.brandDNA.name) || include(config.brandDNA.tone) || include(config.brandDNA.colorCode))) {
    const b: string[] = []
    if (include(config.brandDNA.name)) b.push(`brand ${config.brandDNA.name}`)
    if (include(config.brandDNA.tone)) b.push(`tone ${config.brandDNA.tone}`)
    if (include(config.brandDNA.colorCode)) b.push(`brand color ${config.brandDNA.colorCode}`)
    parts.push(`Brand DNA: ${b.join(', ')}`)
  }

  // Product Essence
  if (config?.productEssence) {
    const p: string[] = []
    if (include(config.productEssence.name)) p.push(`product ${config.productEssence.name}`)
    if (include(config.productEssence.heroBenefit)) p.push(`hero benefit ${config.productEssence.heroBenefit}`)
    if (include(config.productEssence.visualFocus)) p.push(`visual focus ${config.productEssence.visualFocus}`)
    if (include(config.productEssence.environment)) p.push(`environment ${config.productEssence.environment}`)
    if (include(config.productEssence.materials)) p.push(`materials ${config.productEssence.materials!.join(', ')}`)
    if (include(config.productEssence.transformationType)) p.push(`transformation ${config.productEssence.transformationType}`)
    if (p.length) parts.push(`Product Essence: ${p.join(', ')}`)
  }

  // Story DNA
  if (config?.storyDNA) {
    const s: string[] = []
    if (include(config.storyDNA.coreAngle)) s.push(`core angle ${config.storyDNA.coreAngle}`)
    if (include(config.storyDNA.persona)) s.push(`persona ${config.storyDNA.persona}`)
    if (include(config.storyDNA.patternInterruptType)) s.push(`pattern interrupt ${config.storyDNA.patternInterruptType}`)
    if (include(config.storyDNA.hookFramework)) s.push(`hook framework ${config.storyDNA.hookFramework}`)
    if (include(config.storyDNA.emotionTone)) s.push(`emotion tone ${(config.storyDNA.emotionTone || 0)}/100`)
    if (s.length) parts.push(`Story DNA: ${s.join(', ')}`)
  }

  // Camera DNA
  if (config?.cameraDNA) {
    const c: string[] = []
    if (include(config.cameraDNA.rhythm)) c.push(`rhythm ${config.cameraDNA.rhythm}`)
    if (include(config.cameraDNA.movementStyle)) c.push(`movement ${config.cameraDNA.movementStyle}`)
    if (include(config.cameraDNA.cutFrequency)) c.push(`cut frequency ${config.cameraDNA.cutFrequency}`)
    if (include(config.cameraDNA.endingType)) c.push(`ending ${config.cameraDNA.endingType}`)
    if (c.length) parts.push(`Camera DNA: ${c.join(', ')}`)
  }

  // Audio DNA
  if (config?.audioDNA) {
    const a: string[] = []
    if (include(config.audioDNA.soundMode)) a.push(`mode ${config.audioDNA.soundMode}`)
    if (include(config.audioDNA.soundEmotion)) a.push(`mood ${config.audioDNA.soundEmotion}`)
    if (include(config.audioDNA.keySounds)) a.push(`key sfx ${config.audioDNA.keySounds!.join(', ')}`)
    if (a.length) parts.push(`Audio DNA: ${a.join(', ')}`)
  }

  // Asset context
  if (assets?.product) {
    const ap: string[] = []
    if (include(assets.product.title)) ap.push(`library product ${assets.product.title}`)
    if (include(assets.product.description)) ap.push(`desc ${assets.product.description}`)
    if (include(assets.product.imageUrl)) ap.push(`ref image provided`)
    if (ap.length) parts.push(`Product Asset: ${ap.join(', ')}`)
  }
  if (assets?.avatar) {
    const av: string[] = []
    if (include(assets.avatar.name)) av.push(`avatar ${assets.avatar.name}`)
    if (include(assets.avatar.ethnicity)) av.push(`ethnicity ${assets.avatar.ethnicity}`)
    if (include(assets.avatar.gender)) av.push(`gender ${assets.avatar.gender}`)
    if (av.length) parts.push(`Character Asset: ${av.join(', ')}`)
  }
  if (assets?.chart?.palette && assets.chart.palette.length) {
    parts.push(`Palette hint: ${assets.chart.palette.join(', ')}`)
  }

  // Image guidance
  if (containsBoth) parts.push('Uploaded image contains both character and product.')
  if (include(imageDescription)) parts.push(`Image description: ${imageDescription}`)

  // Dual-mode guidance
  if (include(twoImageMode)) {
    switch (twoImageMode) {
      case 'start-end':
        parts.push('Two-image mode: start and end frame control with smooth transition.')
        break
      case 'comparison':
        parts.push('Two-image mode: product comparison across two visuals.')
        break
      case 'transformation':
        parts.push('Two-image mode: before and after transformation.')
        break
      case 'flexible':
        parts.push('Two-image mode: one product and one style reference.')
        break
    }
  }

  if (images && images.length) {
    const i1 = images[0]
    const i2 = images[1]
    if (i1) {
      const hints: string[] = []
      if (include(i1.source)) hints.push(`source ${i1.source}`)
      if (include(i1.purpose)) hints.push(`purpose ${i1.purpose}`)
      if (include(i1.containsBoth)) hints.push('contains both subject and product')
      if (include(i1.description)) hints.push(`hint ${i1.description}`)
      if (hints.length) parts.push(`Image 1: ${hints.join(', ')}`)
    }
    if (i2) {
      const hints: string[] = []
      if (include(i2.source)) hints.push(`source ${i2.source}`)
      if (include(i2.purpose)) hints.push(`purpose ${i2.purpose}`)
      if (include(i2.containsBoth)) hints.push('contains both subject and product')
      if (include(i2.description)) hints.push(`hint ${i2.description}`)
      if (hints.length) parts.push(`Image 2: ${hints.join(', ')}`)
    }
    if (images[2]) {
      const i3 = images[2]
      const hints: string[] = []
      if (include(i3.source)) hints.push(`source ${i3.source}`)
      if (include(i3.purpose)) hints.push(`purpose ${i3.purpose}`)
      if (include(i3.containsBoth)) hints.push('contains both subject and product')
      if (include(i3.description)) hints.push(`hint ${i3.description}`)
      if (hints.length) parts.push(`Image 3: ${hints.join(', ')}`)
    }
  }

  if (sceneScripts) {
    const beats: string[] = []
    if (include(sceneScripts.scene1)) beats.push(`Opening: ${sceneScripts.scene1}`)
    if (include(sceneScripts.scene2)) beats.push(`Transition: ${sceneScripts.scene2}`)
    if (include(sceneScripts.scene3)) beats.push(`Closing: ${sceneScripts.scene3}`)
    if (beats.length) parts.push(`Scene beats -> ${beats.join(' | ')}`)
  }

  if (include(sceneDescription)) {
    parts.push(`Scene description: ${sceneDescription}`)
  }

  // Constraints
  if (include(aspectRatio)) parts.push(`Aspect ratio ${aspectRatio}`)
  if (include(duration)) parts.push(`Target duration ${duration}s`)

  let result = parts.join('. ')
  if (result && !result.endsWith('.')) result += '.'
  return result
}


