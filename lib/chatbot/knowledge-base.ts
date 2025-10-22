/**
 * DreamCut AI Chatbot Knowledge Base
 * 
 * Comprehensive knowledge base containing all DreamCut features, capabilities,
 * prompt templates, and best practices for the AI assistant.
 */

export interface DreamCutFeature {
  id: string
  name: string
  description: string
  category: 'visuals' | 'audios' | 'motions' | 'utilities'
  status: 'available' | 'coming-soon'
  promptTemplates: string[]
  bestPractices: string[]
  parameters?: {
    [key: string]: {
      type: string
      description: string
      options?: string[]
      required: boolean
    }
  }
}

export const DREAMCUT_FEATURES: DreamCutFeature[] = [
  // VISUALS CATEGORY
  {
    id: 'avatars-personas',
    name: 'Avatars & Personas',
    description: 'Generate diverse, realistic human avatars and personas for various use cases including marketing, presentations, and social media.',
    category: 'visuals',
    status: 'available',
    promptTemplates: [
      'Professional {ethnicity} {gender} {age} in {profession} attire, {setting}, {mood} expression, {lighting} lighting, {style} style',
      'Diverse {ethnicity} {gender} {age} {profession}, {setting} background, {mood} facial expression, {lighting} lighting, {camera_angle} angle',
      'Realistic {ethnicity} {gender} {age} {profession} character, {setting}, {mood} expression, {lighting} lighting, {style} aesthetic'
    ],
    bestPractices: [
      'Specify ethnicity, gender, and age range for diversity',
      'Include profession or role for context',
      'Describe setting and mood for appropriate expressions',
      'Use lighting terms: natural, studio, dramatic, soft',
      'Specify camera angles: close-up, medium shot, full body',
      'Include style preferences: photorealistic, artistic, corporate'
    ],
    parameters: {
      ethnicity: { type: 'select', description: 'Ethnic background', options: ['any', 'asian', 'black', 'hispanic', 'white', 'mixed'], required: false },
      gender: { type: 'select', description: 'Gender', options: ['any', 'male', 'female', 'non-binary'], required: false },
      age: { type: 'select', description: 'Age range', options: ['any', 'child', 'teen', 'young-adult', 'adult', 'senior'], required: false },
      profession: { type: 'text', description: 'Professional role or occupation', required: false },
      setting: { type: 'text', description: 'Background or environment', required: false },
      mood: { type: 'select', description: 'Facial expression', options: ['neutral', 'happy', 'serious', 'confident', 'friendly', 'professional'], required: false },
      lighting: { type: 'select', description: 'Lighting style', options: ['natural', 'studio', 'dramatic', 'soft', 'harsh'], required: false },
      style: { type: 'select', description: 'Visual style', options: ['photorealistic', 'artistic', 'corporate', 'casual', 'elegant'], required: false }
    }
  },
  {
    id: 'product-mockups',
    name: 'Product Mockups',
    description: 'Create professional product mockups for e-commerce, marketing materials, and presentations.',
    category: 'visuals',
    status: 'available',
    promptTemplates: [
      '{product_type} mockup, {setting} environment, {lighting} lighting, {angle} angle, {style} style, {brand} aesthetic',
      'Professional {product_type} presentation, {setting} background, {lighting} lighting, {angle} perspective, {style} design',
      'High-quality {product_type} mockup, {setting} context, {lighting} illumination, {angle} view, {style} aesthetic'
    ],
    bestPractices: [
      'Specify product type clearly (phone, laptop, bottle, etc.)',
      'Choose appropriate setting (office, home, studio, outdoor)',
      'Use professional lighting terms',
      'Specify viewing angle (front, 3/4, side, top-down)',
      'Include brand aesthetic or style preferences',
      'Consider context and use case'
    ],
    parameters: {
      product_type: { type: 'text', description: 'Type of product to mockup', required: true },
      setting: { type: 'select', description: 'Environment or background', options: ['studio', 'office', 'home', 'outdoor', 'minimal'], required: false },
      lighting: { type: 'select', description: 'Lighting setup', options: ['natural', 'studio', 'dramatic', 'soft', 'harsh'], required: false },
      angle: { type: 'select', description: 'Viewing angle', options: ['front', '3/4', 'side', 'top-down', 'isometric'], required: false },
      style: { type: 'select', description: 'Design style', options: ['minimal', 'luxury', 'modern', 'vintage', 'corporate'], required: false }
    }
  },
  {
    id: 'charts-infographics',
    name: 'Charts & Infographics',
    description: 'Generate data visualizations, charts, and infographics for presentations and reports.',
    category: 'visuals',
    status: 'available',
    promptTemplates: [
      '{chart_type} chart showing {data_topic}, {color_scheme} colors, {style} design, {layout} layout',
      'Infographic about {topic}, {color_palette} color scheme, {style} aesthetic, {format} format',
      'Data visualization for {data_type}, {chart_style} style, {color_theme} theme, {layout} arrangement'
    ],
    bestPractices: [
      'Specify chart type (bar, line, pie, scatter, etc.)',
      'Describe data topic or subject matter',
      'Choose appropriate color schemes',
      'Specify design style and layout preferences',
      'Consider target audience and context',
      'Include data visualization best practices'
    ],
    parameters: {
      chart_type: { type: 'select', description: 'Type of chart', options: ['bar', 'line', 'pie', 'scatter', 'area', 'donut', 'infographic'], required: true },
      data_topic: { type: 'text', description: 'Subject matter or data topic', required: true },
      color_scheme: { type: 'select', description: 'Color palette', options: ['professional', 'vibrant', 'monochrome', 'pastel', 'corporate'], required: false },
      style: { type: 'select', description: 'Design style', options: ['minimal', 'modern', 'corporate', 'creative', 'scientific'], required: false },
      layout: { type: 'select', description: 'Layout arrangement', options: ['vertical', 'horizontal', 'grid', 'flow', 'hierarchical'], required: false }
    }
  },
  {
    id: 'comics',
    name: 'Comics',
    description: 'Create comic book style illustrations and sequential art.',
    category: 'visuals',
    status: 'coming-soon',
    promptTemplates: [
      'Comic book style {scene_description}, {art_style} art style, {panel_layout} layout, {color_scheme} colors',
      'Sequential art showing {action}, {comic_style} style, {panel_arrangement} panels, {color_palette} palette'
    ],
    bestPractices: [
      'Describe scene or action clearly',
      'Specify comic art style (Marvel, DC, manga, indie, etc.)',
      'Include panel layout preferences',
      'Choose appropriate color schemes',
      'Consider narrative flow and composition'
    ]
  },
  {
    id: 'illustration',
    name: 'Illustration',
    description: 'Generate custom illustrations for books, articles, and creative projects.',
    category: 'visuals',
    status: 'coming-soon',
    promptTemplates: [
      'Illustration of {subject}, {art_style} style, {color_palette} colors, {composition} composition',
      'Custom illustration showing {scene}, {illustration_style} aesthetic, {color_scheme} scheme, {layout} layout'
    ],
    bestPractices: [
      'Describe subject matter clearly',
      'Specify art style (realistic, cartoon, watercolor, digital, etc.)',
      'Choose appropriate color palettes',
      'Consider composition and layout',
      'Include mood and atmosphere'
    ]
  },
  {
    id: 'concept-worlds',
    name: 'Concept Worlds',
    description: 'Create fantasy, sci-fi, and conceptual world environments.',
    category: 'visuals',
    status: 'coming-soon',
    promptTemplates: [
      'Concept art of {world_type} world, {atmosphere} atmosphere, {art_style} style, {color_mood} mood',
      'Environmental concept showing {setting}, {concept_style} aesthetic, {lighting} lighting, {perspective} view'
    ],
    bestPractices: [
      'Describe world type and setting',
      'Specify atmosphere and mood',
      'Choose appropriate art style',
      'Include lighting and perspective',
      'Consider scale and scope'
    ]
  },

  // AUDIOS CATEGORY
  {
    id: 'voiceovers',
    name: 'Voiceovers',
    description: 'Generate high-quality voiceovers for videos, presentations, and audio content.',
    category: 'audios',
    status: 'available',
    promptTemplates: [
      'Professional {voice_type} voice, {tone} tone, {pace} pace, {accent} accent, {emotion} emotion',
      'Voiceover in {voice_style} style, {delivery} delivery, {accent} accent, {mood} mood, {pace} speed',
      'Narrator voice, {voice_characteristics} characteristics, {tone} tone, {accent} accent, {emotion} emotion'
    ],
    bestPractices: [
      'Specify voice type (male, female, child, elderly)',
      'Choose appropriate tone (professional, casual, dramatic)',
      'Set pace (slow, normal, fast)',
      'Select accent if needed',
      'Include emotional context',
      'Consider target audience'
    ],
    parameters: {
      voice_type: { type: 'select', description: 'Voice characteristics', options: ['male', 'female', 'child', 'elderly', 'any'], required: false },
      tone: { type: 'select', description: 'Voice tone', options: ['professional', 'casual', 'dramatic', 'friendly', 'authoritative'], required: false },
      pace: { type: 'select', description: 'Speaking pace', options: ['slow', 'normal', 'fast'], required: false },
      accent: { type: 'select', description: 'Accent or dialect', options: ['american', 'british', 'australian', 'neutral', 'any'], required: false },
      emotion: { type: 'select', description: 'Emotional tone', options: ['neutral', 'happy', 'serious', 'excited', 'calm'], required: false }
    }
  },
  {
    id: 'music-jingles',
    name: 'Music & Jingles',
    description: 'Create custom music tracks, jingles, and background music.',
    category: 'audios',
    status: 'available',
    promptTemplates: [
      '{music_genre} track, {mood} mood, {tempo} tempo, {instruments} instruments, {style} style',
      'Background music for {use_case}, {genre} genre, {mood} atmosphere, {duration} length, {style} arrangement',
      'Jingle for {brand_type}, {music_style} style, {mood} feel, {tempo} pace, {instruments} sound'
    ],
    bestPractices: [
      'Specify music genre clearly',
      'Choose appropriate mood and atmosphere',
      'Set tempo (slow, medium, fast)',
      'List key instruments',
      'Consider use case and context',
      'Specify duration if needed'
    ],
    parameters: {
      music_genre: { type: 'select', description: 'Music genre', options: ['pop', 'rock', 'electronic', 'classical', 'jazz', 'ambient', 'corporate'], required: false },
      mood: { type: 'select', description: 'Musical mood', options: ['upbeat', 'calm', 'dramatic', 'energetic', 'melancholic', 'inspiring'], required: false },
      tempo: { type: 'select', description: 'Tempo', options: ['slow', 'medium', 'fast'], required: false },
      instruments: { type: 'text', description: 'Key instruments', required: false },
      use_case: { type: 'select', description: 'Intended use', options: ['background', 'jingle', 'intro', 'outro', 'transition'], required: false }
    }
  },
  {
    id: 'music-videos',
    name: 'Music Videos',
    description: 'Generate music video content with synchronized visuals.',
    category: 'audios',
    status: 'coming-soon',
    promptTemplates: [
      'Music video for {genre} track, {visual_style} style, {mood} atmosphere, {setting} setting',
      'Synchronized visuals for {music_type}, {art_style} aesthetic, {mood} mood, {theme} theme'
    ],
    bestPractices: [
      'Match visual style to music genre',
      'Consider mood and atmosphere',
      'Plan visual transitions and effects',
      'Ensure synchronization with audio',
      'Include appropriate settings and themes'
    ]
  },
  {
    id: 'voice-creation',
    name: 'Voice Creation',
    description: 'Create custom voice models and synthetic voices.',
    category: 'audios',
    status: 'coming-soon',
    promptTemplates: [
      'Custom voice model, {voice_characteristics} characteristics, {training_data} training, {output_quality} quality',
      'Synthetic voice creation, {voice_specs} specifications, {training_approach} approach, {quality_level} level'
    ],
    bestPractices: [
      'Define voice characteristics clearly',
      'Specify training data requirements',
      'Set quality expectations',
      'Consider use case and applications',
      'Plan voice testing and validation'
    ]
  },
  {
    id: 'sound-fx',
    name: 'Sound FX',
    description: 'Generate sound effects for videos, games, and multimedia projects.',
    category: 'audios',
    status: 'coming-soon',
    promptTemplates: [
      'Sound effect for {action}, {sound_type} type, {intensity} intensity, {duration} length',
      'Audio effect, {effect_category} category, {sound_characteristics} characteristics, {quality} quality'
    ],
    bestPractices: [
      'Describe action or event clearly',
      'Specify sound type and characteristics',
      'Set appropriate intensity level',
      'Consider duration and timing',
      'Match quality to project needs'
    ]
  },

  // MOTIONS CATEGORY
  {
    id: 'talking-avatars',
    name: 'Talking Avatars',
    description: 'Create animated talking avatars with synchronized lip-sync and expressions.',
    category: 'motions',
    status: 'available',
    promptTemplates: [
      'Talking avatar, {avatar_type} character, {speech_content} dialogue, {expression} expression, {setting} background',
      'Animated character speaking, {character_style} style, {dialogue_type} content, {mood} mood, {environment} setting',
      'Lip-sync avatar, {character_description} character, {speech_script} script, {emotion} emotion, {background} context'
    ],
    bestPractices: [
      'Choose appropriate avatar type and style',
      'Write clear, natural dialogue',
      'Specify emotional expressions',
      'Include background and setting',
      'Consider lip-sync accuracy',
      'Plan for natural movements'
    ],
    parameters: {
      avatar_type: { type: 'select', description: 'Avatar character type', options: ['realistic', 'cartoon', 'professional', 'casual', 'custom'], required: false },
      speech_content: { type: 'text', description: 'Dialogue or script content', required: true },
      expression: { type: 'select', description: 'Facial expression', options: ['neutral', 'happy', 'serious', 'excited', 'concerned'], required: false },
      setting: { type: 'text', description: 'Background or environment', required: false },
      mood: { type: 'select', description: 'Overall mood', options: ['professional', 'friendly', 'dramatic', 'casual', 'energetic'], required: false }
    }
  },
  {
    id: 'diverse-motion-single',
    name: 'Diverse Motion - Single Asset',
    description: 'Create diverse motion variations for single assets with different styles and movements.',
    category: 'motions',
    status: 'available',
    promptTemplates: [
      'Diverse motion for {asset_type}, {motion_style} style, {variation_count} variations, {movement_type} movement',
      'Single asset animation, {asset_description} asset, {motion_variations} variations, {style_preferences} style',
      'Motion diversity for {content_type}, {animation_style} animation, {variation_approach} approach, {output_format} format'
    ],
    bestPractices: [
      'Clearly describe the asset to animate',
      'Specify motion style and approach',
      'Define number of variations needed',
      'Include movement characteristics',
      'Consider output format and quality',
      'Plan for consistent quality across variations'
    ],
    parameters: {
      asset_type: { type: 'text', description: 'Type of asset to animate', required: true },
      motion_style: { type: 'select', description: 'Animation style', options: ['realistic', 'stylized', 'minimal', 'dynamic', 'smooth'], required: false },
      variation_count: { type: 'select', description: 'Number of variations', options: ['3', '5', '8', '10'], required: false },
      movement_type: { type: 'select', description: 'Type of movement', options: ['subtle', 'moderate', 'dynamic', 'dramatic'], required: false }
    }
  },
  {
    id: 'diverse-motion-dual',
    name: 'Diverse Motion - Dual Asset',
    description: 'Create diverse motion variations for dual assets with coordinated movements and interactions.',
    category: 'motions',
    status: 'available',
    promptTemplates: [
      'Dual asset motion, {asset_1} and {asset_2}, {interaction_type} interaction, {motion_style} style, {coordination} coordination',
      'Two-asset animation, {primary_asset} primary, {secondary_asset} secondary, {relationship} relationship, {movement_pattern} pattern',
      'Dual motion diversity, {asset_pair} assets, {interaction_style} interaction, {animation_approach} approach, {synchronization} sync'
    ],
    bestPractices: [
      'Clearly define both assets',
      'Specify interaction type and relationship',
      'Plan coordinated movements',
      'Consider synchronization requirements',
      'Include style and aesthetic preferences',
      'Plan for balanced composition'
    ],
    parameters: {
      asset_1: { type: 'text', description: 'First asset description', required: true },
      asset_2: { type: 'text', description: 'Second asset description', required: true },
      interaction_type: { type: 'select', description: 'Type of interaction', options: ['collaborative', 'contrasting', 'complementary', 'sequential'], required: false },
      motion_style: { type: 'select', description: 'Animation style', options: ['realistic', 'stylized', 'minimal', 'dynamic'], required: false },
      coordination: { type: 'select', description: 'Movement coordination', options: ['synchronized', 'alternating', 'independent', 'responsive'], required: false }
    }
  },
  {
    id: 'explainers',
    name: 'Explainers',
    description: 'Create animated explainer videos with clear storytelling and visual communication.',
    category: 'motions',
    status: 'coming-soon',
    promptTemplates: [
      'Explainer video about {topic}, {visual_style} style, {duration} length, {target_audience} audience',
      'Animated explanation of {concept}, {art_style} aesthetic, {narrative_approach} approach, {complexity} level'
    ],
    bestPractices: [
      'Define topic and key messages clearly',
      'Choose appropriate visual style',
      'Plan narrative structure and flow',
      'Consider target audience and complexity',
      'Include clear call-to-action',
      'Ensure visual clarity and readability'
    ]
  },
  {
    id: 'social-cuts',
    name: 'Social Cuts',
    description: 'Create short-form video content optimized for social media platforms.',
    category: 'motions',
    status: 'coming-soon',
    promptTemplates: [
      'Social media video, {platform} format, {content_type} content, {duration} length, {style} aesthetic',
      'Short-form content for {platform}, {video_style} style, {engagement_approach} approach, {trending_elements} elements'
    ],
    bestPractices: [
      'Optimize for specific platform requirements',
      'Keep content concise and engaging',
      'Include trending elements and hooks',
      'Plan for mobile viewing',
      'Consider platform-specific features',
      'Focus on high engagement potential'
    ]
  }
]

export const DREAMCUT_KNOWLEDGE_BASE = {
  platform: {
    name: 'DreamCut',
    description: 'AI-powered media asset generation platform',
    categories: ['Visuals', 'Audios', 'Motions', 'Utilities'],
    keyFeatures: [
      'AI-generated avatars and personas',
      'Product mockups and presentations',
      'Charts and infographics',
      'Voiceovers and audio content',
      'Music and jingles',
      'Talking avatars with lip-sync',
      'Diverse motion animations',
      'Library management system'
    ]
  },
  promptEngineering: {
    generalTips: [
      'Be specific about visual style and aesthetic preferences',
      'Include technical parameters when relevant (lighting, angles, composition)',
      'Specify target audience and use case context',
      'Use descriptive adjectives for mood and atmosphere',
      'Consider brand guidelines and consistency requirements',
      'Test different prompt variations for optimal results'
    ],
    imageAnalysis: [
      'Analyze composition, lighting, and color schemes',
      'Identify key visual elements and style characteristics',
      'Extract mood, atmosphere, and emotional tone',
      'Recognize technical aspects (camera angle, depth of field)',
      'Suggest improvements and variations',
      'Provide multiple prompt options for different use cases'
    ],
    bestPractices: [
      'Start with clear, specific descriptions',
      'Include context and use case information',
      'Specify quality and style requirements',
      'Consider technical constraints and limitations',
      'Plan for consistency across multiple assets',
      'Iterate and refine based on results'
    ]
  },
  currentSections: {
    'library': 'Asset library and management',
    'avatars-personas': 'Avatar and persona generation',
    'product-mockups': 'Product mockup creation',
    'charts-infographics': 'Charts and infographics',
    'voiceovers': 'Voiceover generation',
    'music-jingles': 'Music and jingle creation',
    'talking-avatars': 'Talking avatar animations',
    'diverse-motion-single': 'Single asset motion variations',
    'diverse-motion-dual': 'Dual asset motion variations'
  }
}

export function getFeatureById(id: string): DreamCutFeature | undefined {
  return DREAMCUT_FEATURES.find(feature => feature.id === id)
}

export function getFeaturesByCategory(category: string): DreamCutFeature[] {
  return DREAMCUT_FEATURES.filter(feature => feature.category === category)
}

export function getAvailableFeatures(): DreamCutFeature[] {
  return DREAMCUT_FEATURES.filter(feature => feature.status === 'available')
}

export function generateSystemPrompt(currentSection?: string): string {
  const availableFeatures = getAvailableFeatures()
  const currentFeature = currentSection ? getFeatureById(currentSection) : null
  
  let prompt = `You are DreamCut AI Assistant, an expert helper for the DreamCut platform - an AI-powered media asset generation platform.

PLATFORM OVERVIEW:
DreamCut enables users to create various types of media assets including:
- Visuals: Avatars & Personas, Product Mockups, Charts & Infographics
- Audios: Voiceovers, Music & Jingles  
- Motions: Talking Avatars, Diverse Motion (Single/Dual Asset)

${currentFeature ? `
CURRENT SECTION: ${currentFeature.name}
${currentFeature.description}

AVAILABLE PARAMETERS:
${Object.entries(currentFeature.parameters || {}).map(([key, param]) => 
  `- ${key}: ${param.description} (${param.type}${param.required ? ', required' : ', optional'})`
).join('\n')}

PROMPT TEMPLATES FOR ${currentFeature.name.toUpperCase()}:
${currentFeature.promptTemplates.map(template => `- ${template}`).join('\n')}

BEST PRACTICES FOR ${currentFeature.name.toUpperCase()}:
${currentFeature.bestPractices.map(practice => `- ${practice}`).join('\n')}
` : ''}

YOUR CAPABILITIES:
1. Help users understand DreamCut features and how to use them effectively
2. Craft optimized prompts for any asset type based on user requirements
3. Analyze uploaded images and generate detailed prompts for similar content
4. Provide best practices and tips for better results
5. Suggest improvements and variations for existing prompts
6. Answer questions about DreamCut's capabilities and limitations

PROMPT ENGINEERING GUIDELINES:
- Always provide specific, detailed prompts that include relevant parameters
- Consider the user's intended use case and target audience
- Include technical details like lighting, composition, and style preferences
- Suggest multiple variations when appropriate
- Provide copyable prompts that users can directly use in DreamCut

IMAGE ANALYSIS:
When users upload images, analyze:
- Visual style and aesthetic characteristics
- Composition, lighting, and color schemes
- Mood, atmosphere, and emotional tone
- Technical aspects (camera angle, depth of field, etc.)
- Key elements that make the image effective

Generate prompts that capture these elements while adapting them for DreamCut's capabilities.

RESPONSE FORMAT:
- Be helpful, professional, and encouraging
- Provide actionable advice and specific examples
- Use clear, concise language
- Include relevant technical details when helpful
- Always offer to help with follow-up questions

Remember: Your goal is to help users create amazing content with DreamCut by providing expert guidance and optimized prompts.`

  return prompt
}
