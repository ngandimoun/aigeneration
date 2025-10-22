/**
 * Diverse Motion Prompt Builder
 * 
 * Enhances user prompts with all form fields to create comprehensive prompts
 * for fal.ai veo3.1/image-to-video API
 */

export interface DiverseMotionPromptProps {
  // Base prompt from user
  basePrompt: string
  
  // Visual Context
  emotionalTone?: string
  visualStyle?: string
  environment?: string
  customEnvironment?: string
  lightingMood?: string
  materialFocus?: string[]
  cameraType?: string
  frameRate?: string
  
  // Motion & Energy
  revealType?: string
  cameraEnergy?: number
  loopMode?: boolean
  hookIntensity?: number
  endEmotion?: number
  
  // Audio DNA (for context, not used in veo3.1)
  soundMode?: string
  soundMood?: string
  keyEffects?: string[]
  mixCurve?: number
  
  // Brand Touch
  accentColorSync?: boolean
  accentColor?: string
  logoMoment?: string
  textConstraint?: boolean
  
  // Category-specific fields
  productCategory?: string
  chartType?: string
  dataPoints?: string
  animationStyle?: string
  colorScheme?: string
  logoType?: string
  animationComplexity?: string
  elementType?: string
  interactionType?: string
  sceneType?: string
  moodGenre?: string
  pacing?: string
  contentFormat?: string
  platformOptimization?: string
  toneStyle?: string
  ctaType?: string
  creatorPersona?: string
  pacingAds?: string
  hookStyle?: string
}

/**
 * Builds enhanced prompt for fal.ai veo3.1/image-to-video
 */
export function buildDiverseMotionPrompt(props: DiverseMotionPromptProps): string {
  const {
    basePrompt,
    emotionalTone,
    visualStyle,
    environment,
    customEnvironment,
    lightingMood,
    materialFocus,
    cameraType,
    frameRate,
    revealType,
    cameraEnergy,
    loopMode,
    hookIntensity,
    endEmotion,
    productCategory,
    chartType,
    dataPoints,
    animationStyle,
    colorScheme,
    logoType,
    animationComplexity,
    elementType,
    interactionType,
    sceneType,
    moodGenre,
    pacing,
    contentFormat,
    platformOptimization,
    toneStyle,
    ctaType,
    creatorPersona,
    pacingAds,
    hookStyle
  } = props

  // Start with base prompt
  let enhancedPrompt = basePrompt.trim()

  // Add emotional tone and visual style
  if (emotionalTone && visualStyle) {
    enhancedPrompt += ` Animate this image with ${emotionalTone.toLowerCase()} ${visualStyle.toLowerCase()} style.`
  } else if (emotionalTone) {
    enhancedPrompt += ` Animate this image with ${emotionalTone.toLowerCase()} style.`
  } else if (visualStyle) {
    enhancedPrompt += ` Animate this image with ${visualStyle.toLowerCase()} style.`
  }

  // Add camera movement and reveal type
  const cameraMovement = buildCameraMovement(cameraType, revealType, cameraEnergy)
  if (cameraMovement) {
    enhancedPrompt += ` ${cameraMovement}`
  }

  // Add environment and lighting
  const environmentDescription = buildEnvironmentDescription(environment, customEnvironment, lightingMood)
  if (environmentDescription) {
    enhancedPrompt += ` ${environmentDescription}`
  }

  // Add material focus
  if (materialFocus && materialFocus.length > 0 && !materialFocus.includes('All')) {
    const materials = materialFocus.join(', ').toLowerCase()
    enhancedPrompt += ` Focus on ${materials} materials.`
  }

  // Add category-specific enhancements
  const categoryEnhancement = buildCategoryEnhancement(props)
  if (categoryEnhancement) {
    enhancedPrompt += ` ${categoryEnhancement}`
  }

  // Add motion energy and pacing
  const motionDescription = buildMotionDescription(cameraEnergy, hookIntensity, endEmotion, pacing)
  if (motionDescription) {
    enhancedPrompt += ` ${motionDescription}`
  }

  // Add frame rate specification
  if (frameRate) {
    const fps = frameRate.includes('120') ? '120fps' : frameRate.includes('60') ? '60fps' : '30fps'
    enhancedPrompt += ` Use ${fps} for smooth motion.`
  }

  // Add loop mode
  if (loopMode) {
    enhancedPrompt += ` Create a seamless loop.`
  }

  return enhancedPrompt.trim()
}

/**
 * Builds camera movement description
 */
function buildCameraMovement(cameraType?: string, revealType?: string, cameraEnergy?: number): string {
  if (!cameraType && !revealType) return ''

  let movement = ''
  
  if (cameraType) {
    switch (cameraType.toLowerCase()) {
      case 'macro precision':
        movement += 'Use macro precision camera work'
        break
      case 'orbit reveal':
        movement += 'Use orbital camera movement'
        break
      case 'tracking pull-back':
        movement += 'Use tracking pull-back camera movement'
        break
      default:
        movement += `Use ${cameraType.toLowerCase()} camera movement`
    }
  }

  if (revealType) {
    if (movement) movement += ' with '
    
    switch (revealType.toLowerCase()) {
      case 'assemble':
        movement += 'assembly reveal'
        break
      case 'morph':
        movement += 'morphing transformation'
        break
      case 'emerge':
        movement += 'emerging from background'
        break
      case 'disintegrate → form':
        movement += 'disintegration to formation'
        break
      case 'morph from form':
        movement += 'morphing from existing form'
        break
      case 'slide':
        movement += 'sliding motion'
        break
      default:
        movement += `${revealType.toLowerCase()} reveal`
    }
  }

  if (cameraEnergy !== undefined) {
    if (cameraEnergy > 70) {
      movement += ' with dynamic energy'
    } else if (cameraEnergy < 30) {
      movement += ' with subtle, gentle movement'
    } else {
      movement += ' with balanced motion'
    }
  }

  return movement
}

/**
 * Builds environment and lighting description
 */
function buildEnvironmentDescription(environment?: string, customEnvironment?: string, lightingMood?: string): string {
  let description = ''

  // Environment
  if (environment === 'Custom' && customEnvironment) {
    description += `Set in ${customEnvironment}`
  } else if (environment) {
    description += `Set in ${environment.toLowerCase()}`
  }

  // Lighting
  if (lightingMood) {
    if (description) description += ' with '
    
    switch (lightingMood.toLowerCase()) {
      case 'soft daylight':
        description += 'soft, natural daylight'
        break
      case 'glossy specular':
        description += 'glossy, specular lighting'
        break
      case 'backlit sunset':
        description += 'backlit sunset lighting'
        break
      case 'high-contrast spot':
        description += 'high-contrast spotlighting'
        break
      case 'natural daylight':
        description += 'natural daylight'
        break
      default:
        description += `${lightingMood.toLowerCase()} lighting`
    }
  }

  return description
}

/**
 * Builds category-specific enhancement
 */
function buildCategoryEnhancement(props: DiverseMotionPromptProps): string {
  const { productCategory, chartType, dataPoints, animationStyle, colorScheme, logoType, animationComplexity, elementType, interactionType, sceneType, moodGenre, contentFormat, platformOptimization, toneStyle, ctaType, creatorPersona, pacingAds, hookStyle } = props

  switch (productCategory) {
    case 'Data Visualizations':
      return buildDataVisualizationEnhancement(chartType, dataPoints, animationStyle, colorScheme)
    
    case 'Infographic':
      return buildInfographicEnhancement(animationStyle, colorScheme)
    
    case 'Logo Animation':
      return buildLogoAnimationEnhancement(logoType, animationComplexity)
    
    case 'UI/UX Element':
      return buildUIUXEnhancement(elementType, interactionType)
    
    case 'Cinematic Videos':
      return buildCinematicEnhancement(sceneType, moodGenre)
    
    case 'Ads and UGC':
      return buildAdsUGCEnhancement(contentFormat, platformOptimization, toneStyle, ctaType, creatorPersona, pacingAds, hookStyle)
    
    default:
      return ''
  }
}

function buildDataVisualizationEnhancement(chartType?: string, dataPoints?: string, animationStyle?: string, colorScheme?: string): string {
  let enhancement = ''

  if (chartType) {
    enhancement += `Animate ${chartType.toLowerCase()}`
  }

  if (dataPoints) {
    if (enhancement) enhancement += ' with '
    enhancement += `${dataPoints.toLowerCase()}`
  }

  if (animationStyle) {
    if (enhancement) enhancement += ' using '
    enhancement += `${animationStyle.toLowerCase()} animation`
  }

  if (colorScheme) {
    if (enhancement) enhancement += ' in '
    enhancement += `${colorScheme.toLowerCase()} color scheme`
  }

  return enhancement
}

function buildInfographicEnhancement(animationStyle?: string, colorScheme?: string): string {
  let enhancement = ''

  if (animationStyle) {
    enhancement += `Use ${animationStyle.toLowerCase()} animation style`
  }

  if (colorScheme) {
    if (enhancement) enhancement += ' with '
    enhancement += `${colorScheme.toLowerCase()} color scheme`
  }

  return enhancement
}

function buildLogoAnimationEnhancement(logoType?: string, animationComplexity?: string): string {
  let enhancement = ''

  if (logoType) {
    enhancement += `Animate ${logoType.toLowerCase()} logo`
  }

  if (animationComplexity) {
    if (enhancement) enhancement += ' with '
    enhancement += `${animationComplexity.toLowerCase()} complexity`
  }

  return enhancement
}

function buildUIUXEnhancement(elementType?: string, interactionType?: string): string {
  let enhancement = ''

  if (elementType) {
    enhancement += `Animate ${elementType.toLowerCase()}`
  }

  if (interactionType) {
    if (enhancement) enhancement += ' with '
    enhancement += `${interactionType.toLowerCase()} interaction`
  }

  return enhancement
}

function buildCinematicEnhancement(sceneType?: string, moodGenre?: string): string {
  let enhancement = ''

  if (sceneType) {
    enhancement += `Create ${sceneType.toLowerCase()}`
  }

  if (moodGenre) {
    if (enhancement) enhancement += ' with '
    enhancement += `${moodGenre.toLowerCase()} mood`
  }

  return enhancement
}

function buildAdsUGCEnhancement(contentFormat?: string, platformOptimization?: string, toneStyle?: string, ctaType?: string, creatorPersona?: string, pacingAds?: string, hookStyle?: string): string {
  let enhancement = ''

  if (contentFormat) {
    enhancement += `Create ${contentFormat.toLowerCase()}`
  }

  if (platformOptimization) {
    if (enhancement) enhancement += ' optimized for '
    enhancement += platformOptimization.toLowerCase()
  }

  if (toneStyle) {
    if (enhancement) enhancement += ' with '
    enhancement += `${toneStyle.toLowerCase()} tone`
  }

  if (pacingAds) {
    if (enhancement) enhancement += ' using '
    enhancement += `${pacingAds.toLowerCase()} pacing`
  }

  return enhancement
}

/**
 * Builds motion energy and pacing description
 */
function buildMotionDescription(cameraEnergy?: number, hookIntensity?: number, endEmotion?: number, pacing?: string): string {
  let description = ''

  if (hookIntensity !== undefined && endEmotion !== undefined) {
    if (hookIntensity > 70 && endEmotion > 70) {
      description += 'Build from high energy to powerful conclusion'
    } else if (hookIntensity < 30 && endEmotion < 30) {
      description += 'Use gentle, subtle motion throughout'
    } else if (hookIntensity > endEmotion) {
      description += 'Start with strong energy and ease to calm finish'
    } else if (endEmotion > hookIntensity) {
      description += 'Build energy gradually to powerful ending'
    }
  }

  if (pacing) {
    if (description) description += '. '
    
    switch (pacing.toLowerCase()) {
      case 'slow':
        description += 'Use slow, deliberate pacing'
        break
      case 'medium':
        description += 'Use balanced, steady pacing'
        break
      case 'fast':
        description += 'Use quick, dynamic pacing'
        break
      default:
        description += `Use ${pacing.toLowerCase()} pacing`
    }
  }

  return description
}
