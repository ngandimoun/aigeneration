// Types describing the model's inputs (plus custom UX toggles)
export type AutocaptionModelInputs = {
  // Model inputs
  video_file_input: File | string; // required
  transcript_file_input?: File | string;
  output_video: boolean;           // default: true
  output_transcript: boolean;      // default: true
  subs_position: string;           // default: "bottom75"
  color: string;                   // default: "white"
  highlight_color: string;         // default: "yellow"
  fontsize: number;                // default: 7
  MaxChars: number;                // default: 20
  opacity: number;                 // default: 0
  font: string;                    // default: "Poppins/Poppins-ExtraBold.ttf"
  stroke_color: string;            // default: "black"
  stroke_width: number;            // default: 2.6
  kerning: number;                 // default: -5
  right_to_left: boolean;          // default: false (Arial only)
  translate: boolean;              // default: false

  // Custom pipeline extras (not part of the model, handled in app)
  emoji_enrichment?: boolean;      // default: false
  emoji_strategy?: "AI" | "manualMap";
  emoji_map?: Record<string, string>;
  keyword_emphasis?: boolean;      // default: false
  keywords?: string[];
  keyword_style?: "CAPS" | "EMOJI_WRAP" | "ASTERISKS";
  save_to_supabase?: boolean;      // default: true
  supabase_bucket?: string;
  supabase_pathPrefix?: string;
};

// Sensible defaults reflecting the model version's published defaults
export const DEFAULT_AUTOCAPTION_INPUTS: Readonly<AutocaptionModelInputs> = {
  video_file_input: "" as unknown as File, // fill at runtime
  transcript_file_input: undefined,
  output_video: true,
  output_transcript: true,
  subs_position: "bottom75",
  color: "white",
  highlight_color: "yellow",
  fontsize: 7,
  MaxChars: 20,
  opacity: 0,
  font: "Poppins/Poppins-ExtraBold.ttf",
  stroke_color: "black",
  stroke_width: 2.6,
  kerning: -5,
  right_to_left: false,
  translate: false,

  // Custom UX extras
  emoji_enrichment: false,
  emoji_strategy: "AI",
  emoji_map: { fire: "🔥", wow: "🤯", money: "💰" },
  keyword_emphasis: false,
  keywords: [],
  keyword_style: "CAPS",
  save_to_supabase: true,
  supabase_bucket: "videos",
  supabase_pathPrefix: "captioned/"
} as const;

// Form sections for rendering
export const AUTOCAPTION_FORM_SECTIONS = [
  {
    title: "Upload",
    fields: ["video_file_input", "transcript_file_input"]
  },
  {
    title: "Core Options",
    fields: [
      "output_video",
      "output_transcript",
      "subs_position",
      "fontsize",
      "MaxChars",
      "color",
      "stroke_color",
      "stroke_width",
      "opacity",
      "kerning",
      "font",
      "right_to_left",
      "translate"
    ]
  },
  {
    title: "Advanced",
    fields: [
      "highlight_color",
      "emoji_enrichment",
      "emoji_strategy",
      "emoji_map",
      "keyword_emphasis",
      "keywords",
      "keyword_style",
      "save_to_supabase",
      "supabase_bucket",
      "supabase_pathPrefix"
    ]
  }
] as const;

// Emoji strategies
export const EMOJI_STRATEGIES = [
  { value: "AI", label: "✨ Smart (AI decides emojis)" },
  { value: "manualMap", label: "🗺️ Custom Map (manual keyword list)" }
] as const;

// Keyword styles
export const KEYWORD_STYLES = [
  { value: "CAPS", label: "🔠 Capitalize" },
  { value: "BOLD", label: "🖋️ Bold (via **text**)" },
  { value: "EMOJI_WRAP", label: "🔥 Add emoji before & after" },
  { value: "ASTERISKS", label: "✱ Asterisks" }
] as const;

// Preset configurations
export const PRESETS = [
  { 
    name: "YouTube Landscape", 
    config: { 
      fontsize: 7, 
      MaxChars: 20, 
      subs_position: "bottom75",
      color: "white",
      stroke_color: "black",
      stroke_width: 2.6
    } 
  },
  { 
    name: "Reels / TikTok", 
    config: { 
      fontsize: 4, 
      MaxChars: 10, 
      subs_position: "bottom50",
      color: "white",
      stroke_color: "black",
      stroke_width: 3
    } 
  },
  { 
    name: "Karaoke", 
    config: { 
      color: "white", 
      highlight_color: "yellow", 
      stroke_color: "black", 
      stroke_width: 3,
      opacity: 0.2
    } 
  },
  { 
    name: "Minimalist", 
    config: { 
      color: "#F5F5F5", 
      stroke_width: 0,
      opacity: 0
    } 
  }
] as const;
