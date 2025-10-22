import {
  ProductCategory,
  EmotionalTone,
  VisualStyle,
  Environment,
  LightingMood,
  MaterialFocus,
  CameraType,
  FrameRate,
  RevealType,
  SoundMode,
  SoundMood,
  LogoMoment,
  ChartType,
  DataPoints,
  AnimationStyle,
  ColorScheme,
  LayoutType,
  IconStyle,
  TextEmphasis,
  FlowDirection,
  LogoType,
  AnimationComplexity,
  BrandColors,
  RevealStyle,
  ElementType,
  InteractionType,
  StateTransitions,
  MicroInteractionLevel,
  SceneType,
  MoodGenre,
  Pacing,
  NarrativeStructure,
  ContentFormat,
  PlatformOptimization,
  ToneStyle,
  CtaType,
  CreatorPersona,
  PacingAds,
  HookStyle
} from '@/components/diverse-motion-generator-interface';

interface DiverseMotionDualPromptBuilderProps {
  productCategory: ProductCategory;
  prompt: string;
  productName?: string;
  emotionalTone?: EmotionalTone;
  visualStyle?: VisualStyle;
  environment?: Environment;
  customEnvironment?: string;
  lightingMood?: LightingMood;
  materialFocus?: MaterialFocus[];
  cameraType?: CameraType;
  frameRate?: FrameRate;
  revealType?: RevealType;
  cameraEnergy?: number;
  loopMode?: boolean;
  hookIntensity?: number;
  endEmotion?: number;
  soundMode?: SoundMode;
  soundMood?: SoundMood;
  keyEffects?: string[];
  mixCurve?: number;
  accentColorSync?: boolean;
  accentColor?: string;
  logoMoment?: LogoMoment;
  textConstraint?: boolean;
  // Category-specific fields
  chartType?: ChartType;
  dataPoints?: DataPoints;
  animationStyle?: AnimationStyle;
  colorScheme?: ColorScheme;
  layoutType?: LayoutType;
  iconStyle?: IconStyle;
  textEmphasis?: TextEmphasis;
  flowDirection?: FlowDirection;
  logoType?: LogoType;
  animationComplexity?: AnimationComplexity;
  brandColors?: BrandColors;
  revealStyle?: RevealStyle;
  elementType?: ElementType;
  interactionType?: InteractionType;
  stateTransitions?: StateTransitions;
  microInteractionLevel?: MicroInteractionLevel;
  sceneType?: SceneType;
  moodGenre?: MoodGenre;
  pacing?: Pacing;
  narrativeStructure?: NarrativeStructure;
  contentFormat?: ContentFormat;
  platformOptimization?: PlatformOptimization;
  toneStyle?: ToneStyle;
  ctaType?: CtaType;
  creatorPersona?: CreatorPersona;
  pacingAds?: PacingAds;
  hookStyle?: HookStyle;
}

export function buildDiverseMotionDualPrompt(props: DiverseMotionDualPromptBuilderProps): string {
  const {
    productCategory,
    prompt,
    productName,
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
    soundMode,
    soundMood,
    keyEffects,
    mixCurve,
    accentColorSync,
    accentColor,
    logoMoment,
    textConstraint,
    chartType,
    dataPoints,
    animationStyle,
    colorScheme,
    layoutType,
    iconStyle,
    textEmphasis,
    flowDirection,
    logoType,
    animationComplexity,
    brandColors,
    revealStyle,
    elementType,
    interactionType,
    stateTransitions,
    microInteractionLevel,
    sceneType,
    moodGenre,
    pacing,
    narrativeStructure,
    contentFormat,
    platformOptimization,
    toneStyle,
    ctaType,
    creatorPersona,
    pacingAds,
    hookStyle,
  } = props;

  // Start with transition-focused prompt for dual mode
  let enhancedPrompt = `Animate from the first frame to the last frame for a "${productCategory}" category.`;

  if (productName) {
    enhancedPrompt += ` The product is "${productName}".`;
  }

  enhancedPrompt += ` The core transition concept is: "${prompt}".`;

  // Transition and Motion Context
  if (emotionalTone && emotionalTone !== "Custom") {
    enhancedPrompt += ` The transition should have a ${emotionalTone.toLowerCase()} emotional tone.`;
  }
  
  if (visualStyle && visualStyle !== "Custom") {
    enhancedPrompt += ` Use ${visualStyle.toLowerCase()} visual style for the animation.`;
  }
  
  if (environment === "Custom" && customEnvironment) {
    enhancedPrompt += ` Set the transition in a custom environment: ${customEnvironment}.`;
  } else if (environment && environment !== "Custom") {
    enhancedPrompt += ` Set the transition in a ${environment.toLowerCase()} environment.`;
  }
  
  if (lightingMood && lightingMood !== "Custom") {
    enhancedPrompt += ` Apply ${lightingMood.toLowerCase()} lighting throughout the transition.`;
  }
  
  if (materialFocus && materialFocus.length > 0 && !(materialFocus.length === 1 && materialFocus[0] === "All")) {
    enhancedPrompt += ` Focus the transition on these materials: ${materialFocus.join(', ')}.`;
  }

  // Camera and Movement
  if (cameraType && cameraType !== "Custom") {
    enhancedPrompt += ` Use ${cameraType.toLowerCase()} camera movement during the transition.`;
  }
  
  if (frameRate && frameRate !== "Custom") {
    enhancedPrompt += ` Render at ${frameRate.toLowerCase()} for smooth motion.`;
  }

  // Transition Type and Energy
  if (revealType && revealType !== "Custom") {
    enhancedPrompt += ` The transition should use a ${revealType.toLowerCase()} reveal pattern.`;
  }
  
  if (cameraEnergy !== undefined) {
    enhancedPrompt += ` Camera energy level: ${cameraEnergy}% (0=static, 100=dynamic).`;
  }
  
  if (loopMode) {
    enhancedPrompt += ` The animation should loop seamlessly back to the first frame.`;
  }
  
  if (hookIntensity !== undefined) {
    enhancedPrompt += ` Hook intensity: ${hookIntensity}% for engaging transition.`;
  }
  
  if (endEmotion !== undefined) {
    enhancedPrompt += ` End emotion level: ${endEmotion} (0=Clean, 100=Awe-inspiring).`;
  }

  // Audio DNA (for transition sound design)
  if (soundMode && soundMode !== "Custom") {
    enhancedPrompt += ` Sound mode for transition: ${soundMode.toLowerCase()}.`;
  }
  
  if (soundMood && soundMood !== "Custom") {
    enhancedPrompt += ` Sound mood: ${soundMood.toLowerCase()}.`;
  }
  
  if (keyEffects && keyEffects.length > 0) {
    enhancedPrompt += ` Key sound effects during transition: ${keyEffects.join(', ')}.`;
  }
  
  if (mixCurve !== undefined) {
    enhancedPrompt += ` Audio mix curve: ${mixCurve}% for transition audio.`;
  }

  // Brand Touch
  if (accentColorSync) {
    enhancedPrompt += ` Accent colors should sync with brand throughout the transition.`;
  }
  
  if (accentColor) {
    enhancedPrompt += ` Use ${accentColor} as the primary accent color in the transition.`;
  }
  
  if (logoMoment && logoMoment !== "None") {
    enhancedPrompt += ` Logo moment during transition: ${logoMoment.toLowerCase()}.`;
  }
  
  if (textConstraint) {
    enhancedPrompt += ` Keep text elements constrained and readable during the transition.`;
  }

  // Category-specific transition details
  switch (productCategory) {
    case "Data Visualizations":
      if (chartType) enhancedPrompt += ` Chart type transition: ${chartType.toLowerCase()}.`;
      if (dataPoints) enhancedPrompt += ` Data points animation: ${dataPoints.toLowerCase()}.`;
      if (animationStyle) enhancedPrompt += ` Animation style: ${animationStyle.toLowerCase()}.`;
      if (colorScheme) enhancedPrompt += ` Color scheme transition: ${colorScheme.toLowerCase()}.`;
      break;
      
    case "Infographic":
      if (layoutType) enhancedPrompt += ` Layout transition: ${layoutType.toLowerCase()}.`;
      if (iconStyle) enhancedPrompt += ` Icon animation style: ${iconStyle.toLowerCase()}.`;
      if (textEmphasis) enhancedPrompt += ` Text emphasis during transition: ${textEmphasis.toLowerCase()}.`;
      if (flowDirection) enhancedPrompt += ` Flow direction: ${flowDirection.toLowerCase()}.`;
      break;
      
    case "Logo Animation":
      if (logoType) enhancedPrompt += ` Logo type transition: ${logoType.toLowerCase()}.`;
      if (animationComplexity) enhancedPrompt += ` Animation complexity: ${animationComplexity.toLowerCase()}.`;
      if (brandColors) enhancedPrompt += ` Brand colors transition: ${brandColors.toLowerCase()}.`;
      if (revealStyle) enhancedPrompt += ` Reveal style: ${revealStyle.toLowerCase()}.`;
      break;
      
    case "UI/UX Element":
      if (elementType) enhancedPrompt += ` Element type transition: ${elementType.toLowerCase()}.`;
      if (interactionType) enhancedPrompt += ` Interaction type: ${interactionType.toLowerCase()}.`;
      if (stateTransitions) enhancedPrompt += ` State transitions: ${stateTransitions.toLowerCase()}.`;
      if (microInteractionLevel) enhancedPrompt += ` Micro-interaction level: ${microInteractionLevel.toLowerCase()}.`;
      break;
      
    case "Cinematic Videos":
      if (sceneType) enhancedPrompt += ` Scene type transition: ${sceneType.toLowerCase()}.`;
      if (moodGenre) enhancedPrompt += ` Mood/Genre: ${moodGenre.toLowerCase()}.`;
      if (pacing) enhancedPrompt += ` Transition pacing: ${pacing.toLowerCase()}.`;
      if (narrativeStructure) enhancedPrompt += ` Narrative structure: ${narrativeStructure.toLowerCase()}.`;
      break;
      
    case "Ads and UGC":
      if (contentFormat) enhancedPrompt += ` Content format transition: ${contentFormat.toLowerCase()}.`;
      if (platformOptimization) enhancedPrompt += ` Platform optimization: ${platformOptimization.toLowerCase()}.`;
      if (toneStyle) enhancedPrompt += ` Tone style: ${toneStyle.toLowerCase()}.`;
      if (ctaType) enhancedPrompt += ` CTA transition: ${ctaType.toLowerCase()}.`;
      if (creatorPersona) enhancedPrompt += ` Creator persona: ${creatorPersona.toLowerCase()}.`;
      if (pacingAds) enhancedPrompt += ` Ad pacing: ${pacingAds.toLowerCase()}.`;
      if (hookStyle) enhancedPrompt += ` Hook style: ${hookStyle.toLowerCase()}.`;
      break;
  }

  // Add transition-specific instructions
  enhancedPrompt += ` Create a smooth, natural transition between the first and last frame that tells a cohesive story.`;

  return enhancedPrompt.trim();
}
