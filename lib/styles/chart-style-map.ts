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
  "Minimal Analytical": [
    {
      label: "Flat Grid",
      desc: "Clean grid with crisp labels",
      colorSystems: ["Brand Sync", "Semantic Auto"],
      annotationStyle: "Modern sans-serif, inline legends",
      moodContexts: [
        { name: "Professional", effect: { contrast: "+5%", sat: "-10%" } },
        { name: "Calm", effect: { contrast: "-5%", sat: "-15%", temp: "cool" } }
      ]
    },
    {
      label: "Elegant White Space",
      desc: "Large margins, typography-led layout",
      colorSystems: ["Muted Brand", "Monochrome Accent"],
      moodContexts: [
        { name: "Elegant", effect: { contrast: "-10%", sat: "-20%" } }
      ]
    }
  ],

  "Editorial Infographic": [
    {
      label: "Illustrated Frame",
      desc: "Mixed icons + data blocks",
      colorSystems: ["Brand Sync", "Accent Warm"],
      annotationStyle: "Editorial typography with icons",
      moodContexts: [
        { name: "Friendly", effect: { sat: "+15%", temp: "warm" } },
        { name: "Informative", effect: { contrast: "+10%" } }
      ]
    },
    {
      label: "Decorative Background",
      desc: "Patterned or textured context",
      colorSystems: ["Analogous Brand Palette"],
      annotationStyle: "Bold headlines with decorative elements",
      moodContexts: [
        { name: "Playful", effect: { sat: "+25%", temp: "warm" } }
      ]
    }
  ],

  "Playful / UGC": [
    {
      label: "Rounded Fun",
      desc: "Soft forms, bubble legends",
      colorSystems: ["Bright", "Brand Accent Mix"],
      annotationStyle: "Rounded corners, playful fonts",
      moodContexts: [
        { name: "Happy", effect: { sat: "+30%", temp: "warm" } },
        { name: "Youthful", effect: { sat: "+20%", temp: "neutral" } }
      ]
    }
  ],

  "3D Data Art": [
    {
      label: "Isometric Bars",
      desc: "Depth, shadows, extrusion",
      colorSystems: ["Brand Primary + Neutral Grey"],
      annotationStyle: "3D typography with depth",
      moodContexts: [
        { name: "Futuristic", effect: { contrast: "+20%", temp: "cool" } },
        { name: "Premium", effect: { contrast: "+15%", sat: "+5%", temp: "neutral" } }
      ]
    },
    {
      label: "Glass Donut",
      desc: "Semi-transparent 3D ring chart",
      colorSystems: ["Glass Gradient", "Holographic"],
      annotationStyle: "Glass effect typography",
      moodContexts: [
        { name: "Elegant", effect: { contrast: "-5%", temp: "cool" } }
      ]
    }
  ],

  "Hand-drawn Sketch": [
    {
      label: "Notebook Graph",
      desc: "Scribbled lines and arrows",
      colorSystems: ["Pastel", "Paper Texture"],
      annotationStyle: "Handwritten style fonts",
      moodContexts: [
        { name: "Friendly", effect: { sat: "+10%", temp: "warm" } },
        { name: "Casual", effect: { contrast: "-10%", sat: "-10%" } }
      ]
    }
  ],

  "Futuristic Tech Data": [
    {
      label: "Holographic Grid",
      desc: "Neon gradients and glow edges",
      colorSystems: ["Cool Neon", "Monochrome Accent"],
      annotationStyle: "Neon glow typography",
      moodContexts: [
        { name: "Cutting-Edge", effect: { contrast: "+25%", temp: "cool" } },
        { name: "Cyber", effect: { sat: "+15%", temp: "neutral" } }
      ]
    }
  ],

  "Illustrated Concept": [
    {
      label: "Hybrid Data Scene",
      desc: "Data integrated into drawings",
      colorSystems: ["Warm Analogous"],
      annotationStyle: "Illustrated typography with characters",
      moodContexts: [
        { name: "Narrative", effect: { contrast: "+10%", temp: "warm" } },
        { name: "Educational", effect: { contrast: "+5%", temp: "neutral" } }
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
  { name: "Professional", emoji: "💼", effect: { contrast: "+5%", sat: "-10%" } },
  { name: "Playful", emoji: "🎨", effect: { sat: "+25%", temp: "warm" } },
  { name: "Elegant", emoji: "✨", effect: { contrast: "-10%", sat: "-20%" } },
  { name: "Futuristic", emoji: "🚀", effect: { contrast: "+20%", temp: "cool" } },
  { name: "Eco", emoji: "🌱", effect: { sat: "+15%", temp: "cool" } },
  { name: "Urgent", emoji: "⚡", effect: { contrast: "+25%", sat: "+20%" } }
]

export const LIGHTING_PRESETS = [
  { name: "Soft Top Light", desc: "Gentle daylight simulation" },
  { name: "Studio Glow", desc: "Center vignette for emphasis" },
  { name: "Grid Beam", desc: "Holographic effect (Tech style)" },
  { name: "Sketch Paper Light", desc: "Low contrast with vignette" },
  { name: "Dual Rim Cool/Warm", desc: "Cinematic 3D lighting" }
]


