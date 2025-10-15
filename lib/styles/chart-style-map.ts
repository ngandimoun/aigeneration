export interface MoodContext {
  name: string
  effect: {
    contrast?: string
    sat?: string
    temp?: "warm" | "cool" | "neutral"
  }
}

export interface VisualInfluence {
  label: string
  desc: string
  colorSystems: string[]
  annotationStyle: string
  moodContexts: MoodContext[]
}

export interface ChartStyleMap {
  [key: string]: VisualInfluence[]
}

export const STYLE_MAP: ChartStyleMap = {
  "Magazine Editorial": [
    {
      label: "New York Times Style",
      desc: "Clean typography, sophisticated layout",
      colorSystems: ["Editorial Blue", "Monochrome Accent"],
      annotationStyle: "Serif headlines, sans-serif data labels",
      moodContexts: [
        { name: "Professional", effect: { contrast: "+5%", sat: "-10%" } },
        { name: "Authoritative", effect: { contrast: "+10%", sat: "-5%" } }
      ]
    },
    {
      label: "Economist Infographic",
      desc: "Data-driven storytelling with elegant framing",
      colorSystems: ["Brand Red", "Neutral Grey"],
      annotationStyle: "Bold headlines, minimal legends",
      moodContexts: [
        { name: "Scholarly", effect: { contrast: "+8%", sat: "-15%" } }
      ]
    }
  ],

  "Social Media Ready": [
    {
      label: "Instagram Optimized",
      desc: "Vibrant colors, mobile-first design",
      colorSystems: ["Bright Gradient", "High Contrast"],
      annotationStyle: "Bold, readable fonts for small screens",
      moodContexts: [
        { name: "Energetic", effect: { sat: "+25%", temp: "warm" } },
        { name: "Engaging", effect: { contrast: "+15%", sat: "+20%" } }
      ]
    },
    {
      label: "LinkedIn Professional",
      desc: "Clean, corporate-friendly aesthetics",
      colorSystems: ["Corporate Blue", "Professional Grey"],
      annotationStyle: "Clean sans-serif, subtle highlights",
      moodContexts: [
        { name: "Professional", effect: { contrast: "+5%", sat: "-10%" } }
      ]
    }
  ],

  "Presentation Pro": [
    {
      label: "PowerPoint Ready",
      desc: "High contrast, presentation-optimized",
      colorSystems: ["Presentation Palette", "High Visibility"],
      annotationStyle: "Large, clear fonts for projection",
      moodContexts: [
        { name: "Clear", effect: { contrast: "+20%", sat: "+10%" } },
        { name: "Confident", effect: { contrast: "+15%", sat: "+5%" } }
      ]
    },
    {
      label: "Keynote Elegant",
      desc: "Apple-inspired minimalism with impact",
      colorSystems: ["Minimal Palette", "Subtle Gradients"],
      annotationStyle: "Clean typography, generous white space",
      moodContexts: [
        { name: "Elegant", effect: { contrast: "-5%", sat: "-15%" } }
      ]
    }
  ],

  "Infographic Pop": [
    {
      label: "Colorful Engagement",
      desc: "Bold colors, engaging visual elements",
      colorSystems: ["Rainbow Palette", "Vibrant Mix"],
      annotationStyle: "Playful fonts, dynamic layouts",
      moodContexts: [
        { name: "Playful", effect: { sat: "+30%", temp: "warm" } },
        { name: "Energetic", effect: { sat: "+25%", temp: "neutral" } }
      ]
    },
    {
      label: "Interactive Style",
      desc: "Modern web-inspired design",
      colorSystems: ["Digital Palette", "Hover Effects"],
      annotationStyle: "Modern sans-serif, interactive elements",
      moodContexts: [
        { name: "Modern", effect: { contrast: "+10%", sat: "+15%" } }
      ]
    }
  ],

  "Minimalist Modern": [
    {
      label: "Scandinavian Clean",
      desc: "Minimal design, maximum impact",
      colorSystems: ["Monochrome", "Single Accent"],
      annotationStyle: "Ultra-clean typography, lots of white space",
      moodContexts: [
        { name: "Calm", effect: { contrast: "-10%", sat: "-20%", temp: "cool" } },
        { name: "Focused", effect: { contrast: "+5%", sat: "-25%" } }
      ]
    },
    {
      label: "Swiss Grid",
      desc: "Precise typography, geometric layout",
      colorSystems: ["Black & White", "Primary Accent"],
      annotationStyle: "Grid-based layout, precise measurements",
      moodContexts: [
        { name: "Precise", effect: { contrast: "+15%", sat: "-30%" } }
      ]
    }
  ],

  "Retro Vintage": [
    {
      label: "70s Groovy",
      desc: "Warm colors, organic shapes",
      colorSystems: ["Earth Tones", "Warm Gradients"],
      annotationStyle: "Groovy fonts, psychedelic elements",
      moodContexts: [
        { name: "Nostalgic", effect: { sat: "+20%", temp: "warm" } },
        { name: "Vibrant", effect: { sat: "+25%", temp: "warm" } }
      ]
    },
    {
      label: "80s Neon",
      desc: "Bright neon colors, geometric patterns",
      colorSystems: ["Neon Palette", "High Contrast"],
      annotationStyle: "Bold, geometric fonts",
      moodContexts: [
        { name: "Bold", effect: { contrast: "+25%", sat: "+30%" } }
      ]
    }
  ],

  "Neon Cyberpunk": [
    {
      label: "Futuristic Glow",
      desc: "Neon effects, dark backgrounds",
      colorSystems: ["Cyber Neon", "Dark Base"],
      annotationStyle: "Glowing typography, sci-fi elements",
      moodContexts: [
        { name: "Futuristic", effect: { contrast: "+30%", temp: "cool" } },
        { name: "Cyber", effect: { sat: "+20%", temp: "cool" } }
      ]
    },
    {
      label: "Holographic",
      desc: "Iridescent effects, 3D depth",
      colorSystems: ["Holographic", "Rainbow Shift"],
      annotationStyle: "3D typography, depth effects",
      moodContexts: [
        { name: "Cutting-Edge", effect: { contrast: "+25%", sat: "+15%" } }
      ]
    }
  ],

  "Hand-Drawn Sketch": [
    {
      label: "Organic Sketch",
      desc: "Hand-drawn lines, natural imperfections",
      colorSystems: ["Paper Texture", "Sketch Colors"],
      annotationStyle: "Handwritten fonts, sketchy elements",
      moodContexts: [
        { name: "Friendly", effect: { sat: "+10%", temp: "warm" } },
        { name: "Casual", effect: { contrast: "-10%", sat: "-10%" } }
      ]
    },
    {
      label: "Notebook Style",
      desc: "Paper texture, margin lines",
      colorSystems: ["Paper Colors", "Ink Accents"],
      annotationStyle: "Handwritten style, paper texture",
      moodContexts: [
        { name: "Personal", effect: { contrast: "-5%", sat: "-15%" } }
      ]
    }
  ]
}

export const CHART_PURPOSE_MAP = {
  "Comparison": ["Bar", "Column", "Stacked", "Grouped"],
  "Trend / Time": ["Line", "Area", "Sparkline", "Timeline"],
  "Distribution": ["Histogram", "Box", "Violin"],
  "Composition": ["Pie", "Donut", "Treemap"],
  "Relationship": ["Scatter", "Bubble", "Network"],
  "Process / Flow": ["Sankey", "Funnel", "Step Diagram"],
  "Ranking / Highlight": ["Lollipop", "Leaderboard", "Card Grid"]
}

export const MOOD_CONTEXTS = [
  { name: "Corporate Professional", emoji: "💼", effect: { contrast: "+5%", sat: "-10%", temp: "cool" } },
  { name: "Startup Energy", emoji: "🚀", effect: { sat: "+25%", temp: "warm", contrast: "+15%" } },
  { name: "Academic Scholarly", emoji: "🎓", effect: { contrast: "+8%", sat: "-15%", temp: "neutral" } },
  { name: "Creative Agency", emoji: "🎨", effect: { sat: "+20%", temp: "warm", contrast: "+10%" } },
  { name: "Luxury Brand", emoji: "✨", effect: { contrast: "+12%", sat: "+5%", temp: "warm" } }
]

export const LIGHTING_PRESETS = [
  { name: "Soft Top Light", desc: "Gentle daylight simulation" },
  { name: "Studio Glow", desc: "Center vignette for emphasis" },
  { name: "Grid Beam", desc: "Holographic effect (Tech style)" },
  { name: "Sketch Paper Light", desc: "Low contrast with vignette" },
  { name: "Dual Rim Cool/Warm", desc: "Cinematic 3D lighting" }
]

export const COLOR_PALETTES = {
  "Sunset Gradient": {
    colors: ["#FF6B6B", "#FFA07A", "#FFD700", "#FF8C00"],
    description: "Warm sunset tones for engaging visuals"
  },
  "Ocean Breeze": {
    colors: ["#0077BE", "#00B4D8", "#90E0EF", "#CAF0F8"],
    description: "Cool ocean blues for professional charts"
  },
  "Forest Earth": {
    colors: ["#2D6A4F", "#52B788", "#95D5B2", "#D8F3DC"],
    description: "Natural greens for eco-friendly content"
  },
  "Neon Night": {
    colors: ["#FF006E", "#FB5607", "#FFBE0B", "#8338EC"],
    description: "Vibrant neons for high-energy visuals"
  },
  "Pastel Dream": {
    colors: ["#FFC8DD", "#FFAFCC", "#BDE0FE", "#A2D2FF"],
    description: "Soft pastels for gentle, friendly charts"
  },
  "Monochrome Elegance": {
    colors: ["#000000", "#404040", "#808080", "#C0C0C0"],
    description: "Sophisticated grays for minimalist design"
  }
}

export const EXPORT_PRESETS = {
  "Instagram Post": { 
    width: 1080, 
    height: 1080, 
    aspectRatio: "1:1", 
    optimize: "vibrant",
    description: "Square format optimized for Instagram feed"
  },
  "LinkedIn Post": { 
    width: 1200, 
    height: 627, 
    aspectRatio: "16:9", 
    optimize: "professional",
    description: "Professional format for LinkedIn sharing"
  },
  "Twitter Card": { 
    width: 1200, 
    height: 675, 
    aspectRatio: "16:9", 
    optimize: "eye-catching",
    description: "Eye-catching format for Twitter/X posts"
  },
  "Blog Featured": { 
    width: 1920, 
    height: 1080, 
    aspectRatio: "16:9", 
    optimize: "editorial",
    description: "High-res format for blog headers"
  },
  "Pinterest Pin": { 
    width: 1000, 
    height: 1500, 
    aspectRatio: "2:3", 
    optimize: "vertical",
    description: "Vertical format for Pinterest pins"
  },
  "PowerPoint Slide": { 
    width: 1920, 
    height: 1080, 
    aspectRatio: "16:9", 
    optimize: "high-res",
    description: "Presentation-ready high resolution"
  }
}


