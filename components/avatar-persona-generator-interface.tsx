"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { 
  X, 
  Sparkles, 
  Dice6, 
  Layers, 
  Square, 
  Star, 
  Grid3x3, 
  Image as ImageIcon, 
  User, 
  Shirt, 
  Palette,
  Minus,
  Plus,
  Cpu,
  ChevronRight,
  Info,
  Brain,
  Eye,
  Heart,
  Crown,
  BookOpen,
  Compass,
  Zap,
  GraduationCap,
  Smile,
  Upload,
  Trash2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"

interface AvatarPersonaGeneratorInterfaceProps {
  onClose: () => void
  projectTitle: string
}

// Visual Influence mapping based on Art Direction with Lighting Presets and Background Environments
const VISUAL_INFLUENCE_MAP = {
  /* -------------------------------------------------------------------------- */
  /*  ULTRA REALISTIC                                                          */
  /* -------------------------------------------------------------------------- */
  "Ultra Realistic": [
    {
      label: "Studio Portrait",
      desc: "Clean studio realism for professional avatars",
      thumb: "portrait_studio.jpg",
      lightingPresets: [
        { name: "Three-Point Light", mood: "Balanced highlights, key-fill-rim setup" },
        { name: "Softbox Glow", mood: "Even frontal light, subtle falloff" },
        { name: "Rembrandt Light", mood: "Cinematic triangle cheek light" },
        { name: "Split Lighting", mood: "Dramatic half-face shadow, artistic contrast" },
        { name: "Loop Lighting", mood: "Small nose shadow, flattering professional look" },
        { name: "Butterfly Lighting", mood: "Symmetrical shadow under nose, glamour style" }
      ],
      backgroundEnvironments: [
        { name: "Plain Gradient", mood: "Neutral tones fading to gray or white" },
        { name: "Soft Studio Backdrop", mood: "Muted pastel sweep background" },
        { name: "Editorial Wall", mood: "Subtle paper texture, fashion vibe" },
        { name: "Corporate Neutral", mood: "Professional office backdrop, clean lines" },
        { name: "Luxury Texture", mood: "Rich fabric or leather background" },
        { name: "Minimalist White", mood: "Pure white space, focus on subject" }
      ],
      moodContexts: [
        { 
          name: "Confident",
          effect: {
            expression: "smile slight",
            contrast: "+15%",
            saturation: "+5%",
            temp: "warm"
          },
          desc: "Bright lighting, warm tone, open eyes and posture."
        },
        { 
          name: "Calm",
          effect: {
            expression: "relaxed neutral",
            contrast: "-5%",
            saturation: "-10%",
            temp: "neutral"
          },
          desc: "Low-contrast lighting, balanced cool tone."
        },
        { 
          name: "Mysterious",
          effect: {
            expression: "soft gaze down",
            contrast: "+30%",
            saturation: "-20%",
            temp: "cool"
          },
          desc: "One-side lighting, shadow emphasis, cool cast."
        },
        { 
          name: "Tragic",
          effect: {
            expression: "sad subtle",
            contrast: "+10%",
            saturation: "-35%",
            temp: "cool"
          },
          desc: "Muted tones, lowered brightness, cool light wash."
        },
        { 
          name: "Hopeful",
          effect: {
            expression: "smile bright",
            contrast: "+5%",
            saturation: "+15%",
            temp: "warm"
          },
          desc: "Golden light, warm cast, forward gaze."
        }
      ]
    },
    {
      label: "Vogue Editorial",
      desc: "Fashion-grade realism and glossy composition",
      thumb: "vogue_editorial.jpg",
      lightingPresets: [
        { name: "Beauty Dish", mood: "Focused top light, soft shadows" },
        { name: "Color Gel Duo", mood: "Contrasting color rim lighting" },
        { name: "Shadow Drama", mood: "Sharp contrast for strong mood" },
        { name: "High Fashion Glow", mood: "Overexposed highlights, editorial style" },
        { name: "Rim Light Fashion", mood: "Colored edge separation, model definition" },
        { name: "Studio Bounce", mood: "Reflected fill light, even skin tone" }
      ],
      backgroundEnvironments: [
        { name: "Luxury Studio", mood: "Minimal set with high-gloss floor" },
        { name: "Editorial Wall Texture", mood: "Concrete or marble tone" },
        { name: "Runway Spotlight", mood: "Spotlight beam, gradient fade" },
        { name: "Fashion Set", mood: "Stylized backdrop, designer props" },
        { name: "Editorial Space", mood: "High-end studio, premium materials" },
        { name: "Catwalk Environment", mood: "Dramatic runway setting, stage lighting" }
      ]
    },
    {
      label: "Cinematic Film Look",
      desc: "Moody, story-driven realism inspired by film lenses",
      thumb: "cinematic_film.jpg",
      lightingPresets: [
        { name: "Low Key", mood: "Dark with strong directional shadows" },
        { name: "Backlight Glow", mood: "Warm rim lighting behind subject" },
        { name: "Fogged Beam", mood: "Volumetric haze and depth" },
        { name: "Film Noir", mood: "High contrast, dramatic shadows" },
        { name: "Golden Hour Cinematic", mood: "Warm sunset tones, movie-grade" },
        { name: "Practical Light", mood: "Natural light sources, realistic feel" }
      ],
      backgroundEnvironments: [
        { name: "Studio Smoke", mood: "Soft fog with cinematic contrast" },
        { name: "Film Set", mood: "Neutral backdrop with ambient haze" },
        { name: "Urban Alley", mood: "Soft gradient with bokeh lights" },
        { name: "Movie Studio", mood: "Professional film set, controlled environment" },
        { name: "Cinematic Void", mood: "Dark space with dramatic lighting" },
        { name: "Film Location", mood: "Real-world setting, movie atmosphere" }
      ]
    },
    {
      label: "Documentary Natural Light",
      desc: "Real-world lighting, soft shadows, neutral grading",
      thumb: "documentary_light.jpg",
      lightingPresets: [
        { name: "Window Light", mood: "Natural side light, soft shadows" },
        { name: "Overcast Soft", mood: "Even diffused outdoor light" },
        { name: "Golden Hour Natural", mood: "Warm outdoor ambient" }
      ],
      backgroundEnvironments: [
        { name: "Home Interior", mood: "Natural living space, soft textures" },
        { name: "Office Environment", mood: "Professional workspace, neutral tones" },
        { name: "Outdoor Natural", mood: "Garden or park setting, organic feel" }
      ]
    },
    {
      label: "Fashion Lighting",
      desc: "High-key highlights, glossy finish, editorial palette",
      thumb: "fashion_light.jpg",
      lightingPresets: [
        { name: "High Key Bright", mood: "Overexposed, minimal shadows" },
        { name: "Rim Light Fashion", mood: "Colored edge separation" },
        { name: "Studio Bounce", mood: "Reflected fill light" }
      ],
      backgroundEnvironments: [
        { name: "Fashion Studio", mood: "Clean white space, minimal props" },
        { name: "Editorial Set", mood: "Stylized backdrop, fashion props" },
        { name: "Runway Environment", mood: "Catwalk setting, dramatic lighting" }
      ]
    }
  ],

  /* -------------------------------------------------------------------------- */
  /*  REALISTIC                                                                */
  /* -------------------------------------------------------------------------- */
  "Realistic": [
    {
      label: "Studio Lighting",
      desc: "Softbox key light, crisp portrait detail",
      thumb: "studio_light.jpg",
      lightingPresets: [
        { name: "Softbox Key", mood: "Main frontal light, soft shadows" },
        { name: "Umbrella Fill", mood: "Broad diffused secondary light" },
        { name: "Hair Light", mood: "Back rim light for separation" }
      ],
      backgroundEnvironments: [
        { name: "Professional Studio", mood: "Clean backdrop, controlled environment" },
        { name: "Corporate Office", mood: "Business setting, neutral tones" },
        { name: "Home Studio", mood: "Casual indoor space, warm lighting" }
      ]
    },
    {
      label: "Golden Hour",
      desc: "Warm, outdoor cinematic realism",
      thumb: "golden_hour.jpg",
      lightingPresets: [
        { name: "Backlit Sunset", mood: "Amber rim glow, long shadows" },
        { name: "Diffuse Cloudlight", mood: "Soft natural light, no harsh lines" },
        { name: "Warm Ambient", mood: "Balanced golden tone" },
        { name: "Side Light Golden", mood: "Warm directional light, natural shadows" },
        { name: "Magic Hour", mood: "Blue hour transition, cinematic warmth" },
        { name: "Sun Flare", mood: "Lens flare effects, dramatic backlight" }
      ],
      backgroundEnvironments: [
        { name: "City Rooftop", mood: "Urban skyline with sunset flare" },
        { name: "Countryside Field", mood: "Golden grass under low sun" },
        { name: "Coastal View", mood: "Soft sky gradient over ocean" },
        { name: "Mountain Vista", mood: "Dramatic landscape, golden peaks" },
        { name: "Urban Street", mood: "City sidewalk, warm street lighting" },
        { name: "Garden Path", mood: "Natural setting, organic textures" }
      ]
    },
    {
      label: "Neo-Noir",
      desc: "High-contrast cinematic shadows",
      thumb: "neo_noir.jpg",
      lightingPresets: [
        { name: "Blade Light", mood: "Single hard light beam" },
        { name: "Rain Reflection", mood: "Puddled reflections and fog" },
        { name: "Spot Silhouette", mood: "Subject lit from back" },
        { name: "Venetian Blinds", mood: "Striped shadow pattern, classic noir" },
        { name: "Street Lamp", mood: "Single source, dramatic falloff" },
        { name: "Cigarette Glow", mood: "Warm ember light, intimate mood" }
      ],
      backgroundEnvironments: [
        { name: "Dark Alley", mood: "Wet streets, glowing signs" },
        { name: "Window Light", mood: "Shadow blinds pattern" },
        { name: "City Night", mood: "Deep blues with neon accents" },
        { name: "Private Office", mood: "Dim interior, desk lamp glow" },
        { name: "Rainy Street", mood: "Wet pavement, reflective surfaces" },
        { name: "Apartment Window", mood: "Urban view, night cityscape" }
      ]
    },
    {
      label: "Cyberpunk Neon",
      desc: "Futuristic glow and color bleed",
      thumb: "cyberpunk_neon.jpg",
      lightingPresets: [
        { name: "Bi-Color Neon", mood: "Magenta + teal light cross" },
        { name: "Underlight Neon", mood: "Glowing floor reflection" },
        { name: "Ambient Haze", mood: "Colored fog with flare" }
      ],
      backgroundEnvironments: [
        { name: "Neon Cityscape", mood: "Tokyo-like skyline and signs" },
        { name: "Rain Street", mood: "Reflective puddles and bokeh" },
        { name: "Holographic Market", mood: "Crowded sci-fi stalls" }
      ]
    },
    {
      label: "Street Photography",
      desc: "Natural environment, candid framing",
      thumb: "street_photo.jpg",
      lightingPresets: [
        { name: "Natural Ambient", mood: "Available light only" },
        { name: "Shadow Play", mood: "Strong directional shadows" },
        { name: "Urban Glow", mood: "City light reflections" }
      ],
      backgroundEnvironments: [
        { name: "Urban Street", mood: "City sidewalk, natural environment" },
        { name: "Market Place", mood: "Busy commercial area, candid feel" },
        { name: "Subway Station", mood: "Underground transit, industrial lighting" }
      ]
    }
  ],

  /* -------------------------------------------------------------------------- */
  /*  ANIME / MANGA                                                            */
  /* -------------------------------------------------------------------------- */
  "Anime": [
    {
      label: "Shonen Dynamic",
      desc: "High-energy anime action aesthetic",
      thumb: "shonen_dynamic.jpg",
      lightingPresets: [
        { name: "Aura Glow", mood: "Energy halo around subject" },
        { name: "Speedline Burst", mood: "Radial white light lines" },
        { name: "Hero Beam", mood: "Diagonal cinematic streaks" },
        { name: "Power Surge", mood: "Electric energy crackling" },
        { name: "Battle Flash", mood: "Explosive light burst" },
        { name: "Transformation Glow", mood: "Magical energy transformation" }
      ],
      backgroundEnvironments: [
        { name: "Action Void", mood: "Abstract lines, motion streaks" },
        { name: "Destroyed Arena", mood: "Battlefield smoke and sparks" },
        { name: "Open Sky Power-Up", mood: "Dramatic sky gradient" },
        { name: "Training Ground", mood: "Rocky terrain, battle scars" },
        { name: "City Battlefield", mood: "Urban destruction, dramatic setting" },
        { name: "Mystical Realm", mood: "Fantasy world, magical atmosphere" }
      ],
      moodContexts: [
        { 
          name: "Determined",
          effect: {
            expression: "focused eyes wide",
            contrast: "+20%",
            saturation: "+20%",
            temp: "neutral"
          },
          desc: "Harsh highlights, direct gaze, tightened pose."
        },
        { 
          name: "Raging",
          effect: {
            expression: "shouting power",
            contrast: "+35%",
            saturation: "+40%",
            temp: "warm"
          },
          desc: "Extreme shadows, glowing aura, high energy."
        },
        { 
          name: "Worried",
          effect: {
            expression: "furrowed brow",
            contrast: "-10%",
            saturation: "-15%",
            temp: "cool"
          },
          desc: "Dimmer light, soft rim, slightly desaturated palette."
        },
        { 
          name: "Joyful",
          effect: {
            expression: "laugh open",
            contrast: "+10%",
            saturation: "+25%",
            temp: "warm"
          },
          desc: "High-key bright light, energetic colors."
        }
      ]
    },
    {
      label: "Shoujo Pastel",
      desc: "Soft gradients, gentle palettes, expressive eyes",
      thumb: "shoujo_pastel.jpg",
      lightingPresets: [
        { name: "Soft Gradient", mood: "Gentle color transitions" },
        { name: "Sparkle Highlights", mood: "Shimmering eye catchlights" },
        { name: "Pastel Rim", mood: "Soft colored edge light" }
      ],
      backgroundEnvironments: [
        { name: "School Garden", mood: "Cherry blossoms, soft pink tones" },
        { name: "Café Interior", mood: "Cozy coffee shop, warm lighting" },
        { name: "Dreamy Sky", mood: "Pastel clouds, gentle gradients" }
      ]
    },
    {
      label: "Ghibli Warmth",
      desc: "Soft painterly anime style",
      thumb: "ghibli_warmth.jpg",
      lightingPresets: [
        { name: "Pastel Sunlight", mood: "Soft dappled light" },
        { name: "Twilight Glow", mood: "Pink-orange sky gradient" },
        { name: "Indoor Warm Lamp", mood: "Soft yellow bounce" },
        { name: "Window Light", mood: "Natural indoor illumination" },
        { name: "Golden Afternoon", mood: "Warm afternoon sun, nostalgic feel" },
        { name: "Candlelight Cozy", mood: "Intimate warm glow, homey atmosphere" }
      ],
      backgroundEnvironments: [
        { name: "Countryside Field", mood: "Flowers and sunlight haze" },
        { name: "Village Kitchen", mood: "Wood interior, warm lamps" },
        { name: "Forest Path", mood: "Sunlight through trees" },
        { name: "Mountain Valley", mood: "Rolling hills, peaceful landscape" },
        { name: "Cozy Cottage", mood: "Warm home interior, lived-in feel" },
        { name: "Garden Terrace", mood: "Outdoor space, natural elements" }
      ]
    },
    {
      label: "Modern Webtoon",
      desc: "Clean digital anime illustration",
      thumb: "webtoon_modern.jpg",
      lightingPresets: [
        { name: "Flat Cel Light", mood: "Even panel lighting" },
        { name: "Gradient Fill", mood: "Soft vertical fade" },
        { name: "Panel Rim", mood: "Bright edge highlight" }
      ],
      backgroundEnvironments: [
        { name: "Urban Café", mood: "Simple everyday setting" },
        { name: "School Hall", mood: "Flat clean background" },
        { name: "Apartment Window", mood: "Minimalist daylight view" }
      ]
    },
    {
      label: "Vintage 90s Anime",
      desc: "Muted tones, film-grain, nostalgic palette",
      thumb: "anime_90s.jpg",
      lightingPresets: [
        { name: "Film Grain", mood: "Textured vintage look" },
        { name: "Muted Palette", mood: "Desaturated color tones" },
        { name: "Nostalgic Glow", mood: "Warm retro atmosphere" }
      ],
      backgroundEnvironments: [
        { name: "Retro City", mood: "90s urban landscape, muted colors" },
        { name: "Old School", mood: "Classic classroom, vintage feel" },
        { name: "Nostalgic Park", mood: "Soft focus, dreamy atmosphere" }
      ]
    }
  ],

  /* -------------------------------------------------------------------------- */
  /*  CARTOON / 2D STYLIZED                                                    */
  /* -------------------------------------------------------------------------- */
  "Cartoon / 2D Stylized": [
    {
      label: "Disney Soft",
      desc: "Rounded forms, soft outlines, warm colors",
      thumb: "disney_soft.jpg",
      lightingPresets: [
        { name: "Soft Bounce", mood: "Gentle warm fill light" },
        { name: "Character Glow", mood: "Inner light from character" },
        { name: "Warm Rim", mood: "Golden edge separation" }
      ],
      backgroundEnvironments: [
        { name: "Fairy Tale Forest", mood: "Magical woodland, soft colors" },
        { name: "Castle Garden", mood: "Royal setting, elegant backdrop" },
        { name: "Cozy Cottage", mood: "Warm home interior, inviting feel" }
      ]
    },
    {
      label: "Adventure Time Minimal",
      desc: "Flat shapes, bold colors, geometric simplicity",
      thumb: "adventure_minimal.jpg",
      lightingPresets: [
        { name: "Flat Color", mood: "No shadows, pure color blocks" },
        { name: "Geometric Light", mood: "Angular light patterns" },
        { name: "Bold Contrast", mood: "High saturation, clear edges" }
      ],
      backgroundEnvironments: [
        { name: "Abstract Landscape", mood: "Geometric shapes, bold colors" },
        { name: "Candy Kingdom", mood: "Sweet-themed environment" },
        { name: "Ice Kingdom", mood: "Cool blues, crystalline forms" }
      ]
    },
    {
      label: "Simpsons Pop",
      desc: "Iconic line art, solid fill colors, humor tone",
      thumb: "simpsons_pop.jpg",
      lightingPresets: [
        { name: "Solid Fill", mood: "Flat color, no gradients" },
        { name: "Line Art", mood: "Black outlines, bright fills" },
        { name: "Pop Colors", mood: "Vibrant primary colors" }
      ],
      backgroundEnvironments: [
        { name: "Springfield Street", mood: "Suburban neighborhood, familiar setting" },
        { name: "Nuclear Plant", mood: "Industrial backdrop, yellow theme" },
        { name: "Living Room", mood: "Cozy home interior, family feel" }
      ]
    },
    {
      label: "Retro Flat",
      desc: "Vintage print look, limited palette",
      thumb: "retro_flat.jpg",
      lightingPresets: [
        { name: "Vintage Print", mood: "Limited color palette" },
        { name: "Paper Texture", mood: "Subtle paper grain" },
        { name: "Muted Tones", mood: "Desaturated vintage colors" }
      ],
      backgroundEnvironments: [
        { name: "Mid-Century Modern", mood: "50s-60s aesthetic, clean lines" },
        { name: "Vintage Poster", mood: "Retro advertising style" },
        { name: "Classic Americana", mood: "Nostalgic American setting" }
      ]
    },
    {
      label: "Paper Cut Style",
      desc: "Layered 2D paper craft aesthetic",
      thumb: "paper_cut.jpg",
      lightingPresets: [
        { name: "Paper Layers", mood: "Layered depth shadows" },
        { name: "Cutout Edges", mood: "Sharp paper cut lines" },
        { name: "Craft Texture", mood: "Handmade paper feel" }
      ],
      backgroundEnvironments: [
        { name: "Paper Forest", mood: "Layered paper trees, craft aesthetic" },
        { name: "Origami Garden", mood: "Folded paper elements" },
        { name: "Scrapbook Scene", mood: "Collage-style background" }
      ]
    }
  ],

  /* -------------------------------------------------------------------------- */
  /*  PAINTERLY                                                                */
  /* -------------------------------------------------------------------------- */
  "Painterly": [
    {
      label: "Classical Oil",
      desc: "Baroque realism with warm tone",
      thumb: "oil_classic.jpg",
      lightingPresets: [
        { name: "Golden Candlelight", mood: "Warm soft shadows" },
        { name: "Single Window", mood: "Directional light from side" },
        { name: "Vignette Focus", mood: "Dark edges, bright face center" },
        { name: "Chiaroscuro", mood: "Strong light-dark contrast, dramatic" },
        { name: "Oil Paint Glow", mood: "Rich texture, luminous quality" },
        { name: "Master's Light", mood: "Classical painting illumination" }
      ],
      backgroundEnvironments: [
        { name: "Classical Studio", mood: "Traditional artist workspace" },
        { name: "Renaissance Interior", mood: "Historical setting, rich textures" },
        { name: "Museum Gallery", mood: "Art exhibition space, formal atmosphere" },
        { name: "Palace Chamber", mood: "Royal setting, opulent details" },
        { name: "Artist's Atelier", mood: "Creative workspace, artistic tools" },
        { name: "Historical Portrait", mood: "Period setting, authentic atmosphere" }
      ]
    },
    {
      label: "Watercolor Soft",
      desc: "Dreamy transparent edges",
      thumb: "watercolor_soft.jpg",
      lightingPresets: [
        { name: "Washed Daylight", mood: "White-pink fade" },
        { name: "Pale Glow", mood: "Subtle pastel light" },
        { name: "Paper Bleed", mood: "Desaturated softness" }
      ],
      backgroundEnvironments: [
        { name: "Paper Texture", mood: "Subtle paper grain" },
        { name: "Watercolor Wash", mood: "Soft color bleeding" },
        { name: "Pastel Sky", mood: "Gentle gradient background" }
      ],
      moodContexts: [
        { 
          name: "Nostalgic",
          effect: {
            expression: "soft smile faint",
            contrast: "-15%",
            saturation: "-5%",
            temp: "warm"
          },
          desc: "Slightly faded warmth, gentle texture grain."
        },
        { 
          name: "Melancholy",
          effect: {
            expression: "eyes down soft",
            contrast: "-10%",
            saturation: "-30%",
            temp: "cool"
          },
          desc: "Bluish tint, low light diffusion."
        },
        { 
          name: "Inspired",
          effect: {
            expression: "looking upward",
            contrast: "+10%",
            saturation: "+10%",
            temp: "neutral"
          },
          desc: "Light streaks and airy brightness."
        }
      ]
    },
    {
      label: "Digital Brush",
      desc: "Modern digital paint, concept-art finish",
      thumb: "digital_brush.jpg",
      lightingPresets: [
        { name: "Brush Strokes", mood: "Visible paint texture" },
        { name: "Concept Art", mood: "Professional game art style" },
        { name: "Digital Glow", mood: "Soft digital light bloom" }
      ]
    },
    {
      label: "Impressionist Glow",
      desc: "Brushy radiance",
      thumb: "impressionist_glow.jpg",
      lightingPresets: [
        { name: "Sun-Scattered", mood: "Vibrant warm speckles" },
        { name: "Afternoon Field", mood: "Soft yellow-green wash" },
        { name: "Evening Blue", mood: "Cool highlight edges" }
      ]
    },
    {
      label: "Concept Art Wash",
      desc: "Loose painterly render, cinematic composition",
      thumb: "concept_wash.jpg",
      lightingPresets: [
        { name: "Loose Brush", mood: "Free-form paint strokes" },
        { name: "Cinematic Comp", mood: "Movie-like composition" },
        { name: "Atmospheric", mood: "Moody environmental light" }
      ]
    }
  ],

  /* -------------------------------------------------------------------------- */
  /*  STYLIZED 3D                                                              */
  /* -------------------------------------------------------------------------- */
  "Stylized 3D": [
    {
      label: "Pixar Lighting",
      desc: "Expressive, warm bounce lights",
      thumb: "pixar_light.jpg",
      lightingPresets: [
        { name: "Soft GI Warm", mood: "Soft indirect glow" },
        { name: "Dual Fill", mood: "Warm key + cool shadow" },
        { name: "Hero Spot", mood: "Focused face highlight" },
        { name: "Subsurface Scatter", mood: "Realistic skin light penetration" },
        { name: "Bounce Light", mood: "Warm reflected illumination" },
        { name: "Character Glow", mood: "Inner light from character personality" }
      ],
      backgroundEnvironments: [
        { name: "Pixar Studio", mood: "Clean 3D environment, controlled lighting" },
        { name: "Animated World", mood: "Colorful 3D setting, playful atmosphere" },
        { name: "Character Stage", mood: "3D character showcase, professional setup" },
        { name: "Toy Room", mood: "Playful environment, child-friendly setting" },
        { name: "Fantasy Landscape", mood: "Imaginative 3D world, magical elements" },
        { name: "Modern Interior", mood: "Contemporary 3D space, clean design" }
      ]
    },
    {
      label: "DreamWorks Expressive",
      desc: "Vibrant saturation and emotion contrast",
      thumb: "dreamworks_style.jpg",
      lightingPresets: [
        { name: "Rim Drama", mood: "Colored edge lights" },
        { name: "Cartoon Glow", mood: "Overexposed bounce" },
        { name: "Dynamic Warm Fill", mood: "Soft shadowless fill" }
      ]
    },
    {
      label: "Toy-like Rendering",
      desc: "Plastic materials, soft GI lighting",
      thumb: "toy_render.jpg",
      lightingPresets: [
        { name: "Plastic Material", mood: "Shiny toy surface" },
        { name: "Soft GI", mood: "Gentle global illumination" },
        { name: "Playful Bounce", mood: "Fun light reflections" }
      ]
    },
    {
      label: "Stop-Motion Plastic",
      desc: "Subtle frame stutter, handcrafted feel",
      thumb: "stopmotion_plastic.jpg",
      lightingPresets: [
        { name: "Handcrafted", mood: "Imperfect handmade feel" },
        { name: "Frame Stutter", mood: "Subtle animation grain" },
        { name: "Plasticine", mood: "Clay material lighting" }
      ]
    },
    {
      label: "Miniature Diorama",
      desc: "Depth-of-field, handcrafted vibe",
      thumb: "diorama.jpg",
      lightingPresets: [
        { name: "Top Light Focus", mood: "Mini stage beam" },
        { name: "Soft Lens Blur", mood: "Tilt-shift depth" },
        { name: "Side Spotlight", mood: "Mini-scene gradient" }
      ]
    }
  ],

  /* -------------------------------------------------------------------------- */
  /*  LINE ART / SKETCH                                                        */
  /* -------------------------------------------------------------------------- */
  "Line Art / Sketch": [
    {
      label: "Manga Ink",
      desc: "Strong line weight, halftone fills",
      thumb: "manga_ink.jpg",
      lightingPresets: [
        { name: "Ink Lines", mood: "Bold black outlines" },
        { name: "Halftone", mood: "Dot pattern shading" },
        { name: "Screen Tone", mood: "Pattern fill textures" }
      ]
    },
    {
      label: "Comic Crosshatch",
      desc: "Dense pen shading, textured volume",
      thumb: "comic_crosshatch.jpg",
      lightingPresets: [
        { name: "Crosshatch", mood: "Dense line shading" },
        { name: "Pen Texture", mood: "Hand-drawn line quality" },
        { name: "Volume Lines", mood: "3D form through lines" }
      ]
    },
    {
      label: "Pencil Draft",
      desc: "Rough sketch, soft graphite strokes",
      thumb: "pencil_draft.jpg",
      lightingPresets: [
        { name: "Graphite", mood: "Soft pencil strokes" },
        { name: "Sketch Lines", mood: "Rough draft quality" },
        { name: "Paper Grain", mood: "Textured paper surface" }
      ]
    },
    {
      label: "Blueprint Outline",
      desc: "Monochrome technical style",
      thumb: "blueprint_outline.jpg",
      lightingPresets: [
        { name: "Technical Lines", mood: "Precise engineering style" },
        { name: "Blueprint", mood: "Architectural drawing" },
        { name: "Monochrome", mood: "Single color scheme" }
      ]
    },
    {
      label: "Graphic Monochrome",
      desc: "Pure black-white balance, no color",
      thumb: "graphic_mono.jpg",
      lightingPresets: [
        { name: "High Contrast", mood: "Pure black and white" },
        { name: "Graphic Design", mood: "Clean vector style" },
        { name: "Minimal", mood: "Essential elements only" }
      ]
    }
  ],

  /* -------------------------------------------------------------------------- */
  /*  PIXEL / RETRO                                                            */
  /* -------------------------------------------------------------------------- */
  "Pixel / Retro": [
    {
      label: "NES Sprite",
      desc: "8-bit character grid aesthetic",
      thumb: "nes_sprite.jpg",
      lightingPresets: [
        { name: "8-bit Grid", mood: "Pixel-perfect squares" },
        { name: "Limited Colors", mood: "Classic NES palette" },
        { name: "Sprite Animation", mood: "Frame-by-frame style" }
      ]
    },
    {
      label: "16-bit RPG",
      desc: "SNES era pixel shading",
      thumb: "rpg_16bit.jpg",
      lightingPresets: [
        { name: "16-bit Shading", mood: "SNES-style gradients" },
        { name: "RPG Lighting", mood: "Game character style" },
        { name: "Retro Glow", mood: "Classic game atmosphere" }
      ]
    },
    {
      label: "Isometric Scene",
      desc: "Three-quarter pixel perspective",
      thumb: "isometric_pixel.jpg",
      lightingPresets: [
        { name: "Isometric View", mood: "3D perspective grid" },
        { name: "Top-Down Light", mood: "Overhead lighting" },
        { name: "Game Scene", mood: "Video game environment" }
      ]
    },
    {
      label: "CRT Glow",
      desc: "Retro monitor bloom, scanlines",
      thumb: "crt_glow.jpg",
      lightingPresets: [
        { name: "Scanlines", mood: "Horizontal line pattern" },
        { name: "Monitor Bloom", mood: "CRT screen glow" },
        { name: "Retro Fade", mood: "Vintage screen effect" }
      ]
    }
  ],

  /* -------------------------------------------------------------------------- */
  /*  CLAY / TOY STYLE                                                         */
  /* -------------------------------------------------------------------------- */
  "Clay / Toy Style": [
    {
      label: "Stop-Motion Grain",
      desc: "Textured claymation feel, tangible material",
      thumb: "stopmotion_grain.jpg",
      lightingPresets: [
        { name: "Clay Texture", mood: "Tactile clay surface" },
        { name: "Stop-Motion", mood: "Frame-by-frame animation" },
        { name: "Handmade Feel", mood: "Artisanal craft quality" }
      ],
      backgroundEnvironments: [
        { name: "Clay Workshop", mood: "Artisan studio, craft materials" },
        { name: "Miniature Set", mood: "Small-scale diorama environment" },
        { name: "Animation Stage", mood: "Professional stop-motion setup" }
      ]
    },
    {
      label: "Plasticine Smooth",
      desc: "Soft rounded edges, pastel palette",
      thumb: "plasticine_smooth.jpg",
      lightingPresets: [
        { name: "Smooth Surface", mood: "Polished plastic look" },
        { name: "Pastel Colors", mood: "Soft muted tones" },
        { name: "Rounded Forms", mood: "Organic smooth shapes" }
      ],
      backgroundEnvironments: [
        { name: "Playroom", mood: "Child-friendly space, soft colors" },
        { name: "Toy Store", mood: "Colorful retail environment" },
        { name: "Nursery", mood: "Gentle, comforting atmosphere" }
      ]
    },
    {
      label: "Mini Diorama",
      desc: "Small handcrafted world lighting",
      thumb: "mini_diorama.jpg",
      lightingPresets: [
        { name: "Miniature Scale", mood: "Small world perspective" },
        { name: "Diorama Light", mood: "Stage-like lighting" },
        { name: "Handcrafted", mood: "Artisanal detail" }
      ],
      backgroundEnvironments: [
        { name: "Miniature City", mood: "Small-scale urban landscape" },
        { name: "Dollhouse Interior", mood: "Tiny furnished rooms" },
        { name: "Model Railway", mood: "Miniature train environment" }
      ]
    },
    {
      label: "Child Storybook",
      desc: "Playful toy look, exaggerated features",
      thumb: "storybook_toy.jpg",
      lightingPresets: [
        { name: "Playful Bright", mood: "Cheerful child-friendly light" },
        { name: "Storybook", mood: "Illustration book style" },
        { name: "Toy Character", mood: "Exaggerated toy features" }
      ],
      backgroundEnvironments: [
        { name: "Storybook Page", mood: "Illustrated book background" },
        { name: "Toy Box", mood: "Playful storage environment" },
        { name: "Children's Room", mood: "Colorful, imaginative space" }
      ]
    }
  ],

  /* -------------------------------------------------------------------------- */
  /*  SURREAL / DREAMLIKE                                                      */
  /* -------------------------------------------------------------------------- */
  "Surreal / Dreamlike": [
    {
      label: "Ethereal Glow",
      desc: "Soft haze, mystical realism",
      thumb: "ethereal_glow.jpg",
      lightingPresets: [
        { name: "Heavenly Diffuse", mood: "White bloom, low contrast" },
        { name: "Backlit Mist", mood: "Soft silhouette through fog" },
        { name: "Rainbow Refraction", mood: "Prismatic lens flares" },
        { name: "Spiritual Aura", mood: "Soft inner light, transcendent feel" },
        { name: "Mystical Haze", mood: "Dreamy atmosphere, otherworldly glow" },
        { name: "Divine Light", mood: "Sacred illumination, peaceful radiance" }
      ],
      backgroundEnvironments: [
        { name: "Cloud Realm", mood: "White endless sky with bloom" },
        { name: "Dream Horizon", mood: "Pink-blue gradient fog" },
        { name: "Floating Garden", mood: "Mystical abstract flora" },
        { name: "Celestial Space", mood: "Starry void, cosmic atmosphere" },
        { name: "Temple of Light", mood: "Sacred architecture, spiritual setting" },
        { name: "Ethereal Forest", mood: "Mystical woodland, magical trees" }
      ],
      moodContexts: [
        { 
          name: "Serene",
          effect: {
            expression: "relaxed closed eyes",
            contrast: "-10%",
            saturation: "+10%",
            temp: "neutral"
          },
          desc: "Milky glow, low contrast serenity."
        },
        { 
          name: "Mystical",
          effect: {
            expression: "half-smile mysterious",
            contrast: "+15%",
            saturation: "+5%",
            temp: "cool"
          },
          desc: "Cool light diffusion and soft mist flare."
        },
        { 
          name: "Transcendent",
          effect: {
            expression: "eyes upward calm",
            contrast: "+20%",
            saturation: "+25%",
            temp: "warm"
          },
          desc: "Radiant bloom with inner glow focus."
        }
      ]
    },
    {
      label: "Astral Realm",
      desc: "Cosmic surrealism and fantasy",
      thumb: "astral_realm.jpg",
      lightingPresets: [
        { name: "Nebula Core", mood: "Colorful cosmic cloud glow" },
        { name: "Starlit Edge", mood: "Rim-lit galactic shine" },
        { name: "Cosmic Halo", mood: "Circular light gradient" }
      ],
      backgroundEnvironments: [
        { name: "Galaxy Field", mood: "Stars and light bursts" },
        { name: "Floating Rocks", mood: "Zero-gravity elements" },
        { name: "Light Portal", mood: "Energy ring environment" }
      ]
    },
    {
      label: "Collage Fantasy",
      desc: "Mixed textures and fragments",
      thumb: "collage_fantasy.jpg",
      lightingPresets: [
        { name: "Flat Studio", mood: "Neutral baseline for collage" },
        { name: "Soft Halo", mood: "Circular light ring" },
        { name: "Paper Shadow", mood: "Drop-shadow cutout look" }
      ],
      backgroundEnvironments: [
        { name: "Mixed Media", mood: "Collage elements, varied textures" },
        { name: "Art Studio", mood: "Creative workspace, materials" },
        { name: "Dream Collage", mood: "Surreal mixed elements" }
      ]
    }
  ]
}

// Role/Archetype data with mood bias suggestions
const ROLE_ARCHETYPE_MAP = {
  "Hero": {
    icon: "🦸",
    desc: "Brave protagonist, determined and inspiring",
    moodBias: ["Determined", "Confident", "Hopeful"]
  },
  "Mentor": {
    icon: "🧙",
    desc: "Wise guide, calm and knowledgeable",
    moodBias: ["Calm", "Hopeful", "Wise"]
  },
  "Creator": {
    icon: "🎨",
    desc: "Artistic innovator, inspired and expressive",
    moodBias: ["Inspired", "Confident", "Joyful"]
  },
  "Explorer": {
    icon: "🧭",
    desc: "Curious adventurer, determined and curious",
    moodBias: ["Determined", "Inspired", "Confident"]
  },
  "Rebel": {
    icon: "⚡",
    desc: "Independent challenger, mysterious and bold",
    moodBias: ["Mysterious", "Raging", "Determined"]
  },
  "Sage": {
    icon: "📚",
    desc: "Knowledgeable teacher, calm and wise",
    moodBias: ["Calm", "Wise", "Serene"]
  },
  "Mascot": {
    icon: "🎭",
    desc: "Friendly companion, joyful and expressive",
    moodBias: ["Joyful", "Confident", "Hopeful"]
  },
  "Teacher": {
    icon: "👨‍🏫",
    desc: "Educational guide, calm and inspiring",
    moodBias: ["Calm", "Inspired", "Hopeful"]
  }
}

// Age range options
const AGE_RANGES = [
  { value: "Teen", label: "Teen (13-19)", icon: "👦" },
  { value: "Adult", label: "Adult (20-65)", icon: "👨" },
  { value: "Elder", label: "Elder (65+)", icon: "👴" },
  { value: "Ageless", label: "Ageless", icon: "✨" }
]

// Gender expression options
const GENDER_EXPRESSIONS = [
  { value: "Female", label: "Female", icon: "👩" },
  { value: "Male", label: "Male", icon: "👨" },
  { value: "Non-binary", label: "Non-binary", icon: "🧑" },
  { value: "Custom", label: "Custom", icon: "🌈" }
]

// Body type options
const BODY_TYPES = [
  { value: "Slim", label: "Slim", icon: "🏃" },
  { value: "Athletic", label: "Athletic", icon: "💪" },
  { value: "Curvy", label: "Curvy", icon: "💃" },
  { value: "Stocky", label: "Stocky", icon: "🏋️" },
  { value: "Custom", label: "Custom", icon: "🎨" }
]

// Skin tone options
const SKIN_TONES = [
  { value: "Fair", label: "Fair", color: "#FDBCB4" },
  { value: "Light", label: "Light", color: "#E8A87C" },
  { value: "Medium", label: "Medium", color: "#D08B5B" },
  { value: "Olive", label: "Olive", color: "#B8860B" },
  { value: "Tan", label: "Tan", color: "#CD853F" },
  { value: "Dark", label: "Dark", color: "#8B4513" },
  { value: "Deep", label: "Deep", color: "#654321" }
]

// Hair style options (context-aware)
const HAIR_STYLES = {
  "Ultra Realistic": [
    { value: "Short Bob", label: "Short Bob", icon: "📌" },
    { value: "Long Waves", label: "Long Waves", icon: "🌊" },
    { value: "Pixie Cut", label: "Pixie Cut", icon: "✂️" },
    { value: "Ponytail", label: "Ponytail", icon: "🎀" },
    { value: "Bun", label: "Bun", icon: "🔘" },
    { value: "Braids", label: "Braids", icon: "🪢" }
  ],
  "Anime": [
    { value: "Spiky", label: "Spiky", icon: "⚡" },
    { value: "Long Straight", label: "Long Straight", icon: "💫" },
    { value: "Twin Tails", label: "Twin Tails", icon: "🎎" },
    { value: "Messy", label: "Messy", icon: "🌀" },
    { value: "Gravity Defying", label: "Gravity Defying", icon: "🚀" },
    { value: "Hime Cut", label: "Hime Cut", icon: "👸" }
  ],
  "Stylized 3D": [
    { value: "Rounded", label: "Rounded", icon: "⭕" },
    { value: "Geometric", label: "Geometric", icon: "🔷" },
    { value: "Flowing", label: "Flowing", icon: "🌊" },
    { value: "Textured", label: "Textured", icon: "🎨" }
  ]
}

// Hair color options
const HAIR_COLORS = [
  { value: "Black", label: "Black", color: "#000000" },
  { value: "Brown", label: "Brown", color: "#8B4513" },
  { value: "Blonde", label: "Blonde", color: "#FFD700" },
  { value: "Red", label: "Red", color: "#DC143C" },
  { value: "Gray", label: "Gray", color: "#808080" },
  { value: "White", label: "White", color: "#FFFFFF" },
  { value: "Blue", label: "Blue", color: "#0000FF" },
  { value: "Pink", label: "Pink", color: "#FF69B4" },
  { value: "Purple", label: "Purple", color: "#800080" },
  { value: "Green", label: "Green", color: "#008000" }
]

// Eye color options
const EYE_COLORS = [
  { value: "Brown", label: "Brown", color: "#8B4513" },
  { value: "Blue", label: "Blue", color: "#0000FF" },
  { value: "Green", label: "Green", color: "#008000" },
  { value: "Hazel", label: "Hazel", color: "#8B4513" },
  { value: "Gray", label: "Gray", color: "#808080" },
  { value: "Amber", label: "Amber", color: "#FFBF00" },
  { value: "Violet", label: "Violet", color: "#8A2BE2" },
  { value: "Heterochromia", label: "Heterochromia", color: "#FFD700" }
]

// Eye shape options
const EYE_SHAPES = [
  { value: "Almond", label: "Almond", icon: "👁️" },
  { value: "Round", label: "Round", icon: "⭕" },
  { value: "Hooded", label: "Hooded", icon: "🌙" },
  { value: "Upturned", label: "Upturned", icon: "↗️" },
  { value: "Downturned", label: "Downturned", icon: "↘️" },
  { value: "Monolid", label: "Monolid", icon: "▬" },
  { value: "Deep Set", label: "Deep Set", icon: "🕳️" }
]

// Outfit category options (context-aware)
const OUTFIT_CATEGORIES = {
  "Streetwear": { icon: "👕", desc: "Casual, trendy street fashion" },
  "Business": { icon: "👔", desc: "Professional, formal attire" },
  "Armor": { icon: "🛡️", desc: "Protective, fantasy/sci-fi gear" },
  "Fantasy": { icon: "🧙", desc: "Magical, medieval, or mystical clothing" },
  "Uniform": { icon: "👮", desc: "Official, service-oriented attire" },
  "Minimalist": { icon: "⚪", desc: "Simple, clean, understated style" }
}

// Accessories options
const ACCESSORIES = [
  { value: "Glasses", label: "Glasses", icon: "👓" },
  { value: "Earrings", label: "Earrings", icon: "💎" },
  { value: "Tattoo", label: "Tattoo", icon: "🎨" },
  { value: "Scarf", label: "Scarf", icon: "🧣" },
  { value: "Hat", label: "Hat", icon: "🎩" },
  { value: "Jewelry", label: "Jewelry", icon: "💍" },
  { value: "None", label: "None", icon: "🚫" }
]

// Logo Placement options
const LOGO_PLACEMENT_OPTIONS = [
  { value: "None", label: "None", icon: "🚫", desc: "No logo overlay" },
  { value: "Top-Right", label: "Top-Right", icon: "↗️", desc: "Logo in top-right corner" },
  { value: "Bottom-Left", label: "Bottom-Left", icon: "↙️", desc: "Logo in bottom-left corner" }
]

// Avatar/Persona specific aspect ratios
const AVATAR_ASPECT_RATIOS = [
  { 
    value: "1:1", 
    label: "Square (1:1)", 
    desc: "Perfect for profile pictures, social media avatars",
    icon: "⬜",
    use: "Profile & Social"
  },
  { 
    value: "3:4", 
    label: "Portrait (3:4)", 
    desc: "Classic portrait format, ideal for headshots",
    icon: "📱",
    use: "Portrait & Headshot"
  },
  { 
    value: "4:5", 
    label: "Instagram Portrait (4:5)", 
    desc: "Instagram feed format, great for character reveals",
    icon: "📸",
    use: "Social Media"
  },
  { 
    value: "2:3", 
    label: "Vertical (2:3)", 
    desc: "Tall format, perfect for full-body character shots",
    icon: "📏",
    use: "Full Body"
  },
  { 
    value: "16:9", 
    label: "Wide (16:9)", 
    desc: "Landscape format, great for banners and headers",
    icon: "🖥️",
    use: "Banner & Header"
  },
  { 
    value: "4:3", 
    label: "Standard (4:3)", 
    desc: "Traditional format, versatile for various uses",
    icon: "🖼️",
    use: "General Use"
  },
  { 
    value: "9:16", 
    label: "Story (9:16)", 
    desc: "Vertical story format, perfect for mobile stories",
    icon: "📱",
    use: "Stories & Mobile"
  },
  { 
    value: "21:9", 
    label: "Ultrawide (21:9)", 
    desc: "Cinematic format, great for dramatic presentations",
    icon: "🎬",
    use: "Cinematic"
  }
]

// Aspect ratio visual components
const AspectRatioIcon = ({ ratio }: { ratio: string }) => {
  const getIconStyle = () => {
    switch (ratio) {
      case "1:1":
        return "w-4 h-4 bg-primary rounded-sm"
      case "3:4":
        return "w-3 h-4 bg-primary rounded-sm"
      case "4:5":
        return "w-3.5 h-4 bg-primary rounded-sm"
      case "2:3":
        return "w-2.5 h-4 bg-primary rounded-sm"
      case "16:9":
        return "w-6 h-3.5 bg-primary rounded-sm"
      case "4:3":
        return "w-5 h-3.5 bg-primary rounded-sm"
      case "9:16":
        return "w-3.5 h-6 bg-primary rounded-sm"
      case "21:9":
        return "w-7 h-3 bg-primary rounded-sm"
      default:
        return "w-4 h-4 bg-primary rounded-sm"
    }
  }

  return <div className={getIconStyle()} />
}

export function AvatarPersonaGeneratorInterface({ onClose, projectTitle }: AvatarPersonaGeneratorInterfaceProps) {
  const [name, setName] = useState("")
  const [prompt, setPrompt] = useState("")
  const [aiPromptEnabled, setAiPromptEnabled] = useState(true)
  const [imageCount, setImageCount] = useState(4)
  const [aspectRatio, setAspectRatio] = useState("1:1")
  
  // Visual Style Stack (existing five-tier system)
  const [artDirection, setArtDirection] = useState<string>("")
  const [visualInfluence, setVisualInfluence] = useState<string>("")
  const [lightingPreset, setLightingPreset] = useState<string>("")
  const [backgroundEnvironment, setBackgroundEnvironment] = useState<string>("")
  const [moodContext, setMoodContext] = useState<string>("")
  
  // Identity & Role
  const [personaName, setPersonaName] = useState<string>("")
  const [roleArchetype, setRoleArchetype] = useState<string>("")
  const [ageRange, setAgeRange] = useState<string>("")
  const [genderExpression, setGenderExpression] = useState<string>("")
  const [emotionBias, setEmotionBias] = useState<number[]>([50]) // 0-100 slider
  
  // Physical Traits & Outfits
  const [bodyType, setBodyType] = useState<string>("")
  const [skinTone, setSkinTone] = useState<string>("")
  const [hairStyle, setHairStyle] = useState<string>("")
  const [hairColor, setHairColor] = useState<string>("")
  const [eyeColor, setEyeColor] = useState<string>("")
  const [eyeShape, setEyeShape] = useState<string>("")
  const [outfitCategory, setOutfitCategory] = useState<string>("")
  const [outfitPalette, setOutfitPalette] = useState<string>("")
  const [accessories, setAccessories] = useState<string[]>([])
  
  // Reference Images
  const [referenceImages, setReferenceImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  
  // Logo Placement
  const [logoPlacement, setLogoPlacement] = useState<string>("None")
  const [logoImage, setLogoImage] = useState<File | null>(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>("")
  
  // Available options state
  const [availableInfluences, setAvailableInfluences] = useState<Array<{label: string, desc: string, thumb: string, lightingPresets?: Array<{name: string, mood: string}>, backgroundEnvironments?: Array<{name: string, mood: string}>, moodContexts?: Array<{name: string, effect: {expression: string, contrast: string, saturation: string, temp: string}, desc: string}>}>>([])
  const [availableLightingPresets, setAvailableLightingPresets] = useState<Array<{name: string, mood: string}>>([])
  const [availableBackgroundEnvironments, setAvailableBackgroundEnvironments] = useState<Array<{name: string, mood: string}>>([])
  const [availableMoodContexts, setAvailableMoodContexts] = useState<Array<{name: string, effect: {expression: string, contrast: string, saturation: string, temp: string}, desc: string}>>([])

  // Update available influences when art direction changes
  useEffect(() => {
    if (artDirection && VISUAL_INFLUENCE_MAP[artDirection as keyof typeof VISUAL_INFLUENCE_MAP]) {
      const influences = VISUAL_INFLUENCE_MAP[artDirection as keyof typeof VISUAL_INFLUENCE_MAP]
      setAvailableInfluences(influences)
      
      // Check if current visual influence is still valid
      const currentInfluenceValid = influences.some(influence => influence.label === visualInfluence)
      if (visualInfluence && !currentInfluenceValid) {
        // Reset to first available influence and show toast
        setVisualInfluence(influences[0].label)
        setLightingPreset("") // Reset lighting preset when visual influence changes
        setBackgroundEnvironment("") // Reset background environment when visual influence changes
        setMoodContext("") // Reset mood context when visual influence changes
        toast.info(`That style doesn't fit ${artDirection} — switched to ${influences[0].label} instead.`)
      } else if (!visualInfluence) {
        // Set default to first influence if none selected
        setVisualInfluence(influences[0].label)
      }
    } else {
      setAvailableInfluences([])
      setVisualInfluence("")
      setLightingPreset("")
      setBackgroundEnvironment("")
      setMoodContext("")
    }
  }, [artDirection, visualInfluence])

  // Update available lighting presets, background environments, and mood contexts when visual influence changes
  useEffect(() => {
    if (visualInfluence && availableInfluences.length > 0) {
      const selectedInfluence = availableInfluences.find(influence => influence.label === visualInfluence)
      if (selectedInfluence) {
        // Update lighting presets
        if (selectedInfluence.lightingPresets) {
          setAvailableLightingPresets(selectedInfluence.lightingPresets)
          
          // Check if current lighting preset is still valid
          const currentPresetValid = selectedInfluence.lightingPresets.some(preset => preset.name === lightingPreset)
          if (lightingPreset && !currentPresetValid) {
            // Reset to first available preset and show toast
            setLightingPreset(selectedInfluence.lightingPresets[0].name)
            toast.info(`That lighting doesn't fit ${visualInfluence} — switched to ${selectedInfluence.lightingPresets[0].name} instead.`)
          } else if (!lightingPreset) {
            // Set default to first preset if none selected
            setLightingPreset(selectedInfluence.lightingPresets[0].name)
          }
        } else {
          setAvailableLightingPresets([])
          setLightingPreset("")
        }

        // Update background environments
        if (selectedInfluence.backgroundEnvironments) {
          setAvailableBackgroundEnvironments(selectedInfluence.backgroundEnvironments)
          
          // Check if current background environment is still valid
          const currentEnvValid = selectedInfluence.backgroundEnvironments.some(env => env.name === backgroundEnvironment)
          if (backgroundEnvironment && !currentEnvValid) {
            // Reset to first available environment and show toast
            setBackgroundEnvironment(selectedInfluence.backgroundEnvironments[0].name)
            toast.info(`That background doesn't fit ${visualInfluence} — switched to ${selectedInfluence.backgroundEnvironments[0].name} instead.`)
          } else if (!backgroundEnvironment) {
            // Set default to first environment if none selected
            setBackgroundEnvironment(selectedInfluence.backgroundEnvironments[0].name)
          }
        } else {
          setAvailableBackgroundEnvironments([])
          setBackgroundEnvironment("")
        }

        // Update mood contexts
        if (selectedInfluence.moodContexts) {
          setAvailableMoodContexts(selectedInfluence.moodContexts)
          
          // Check if current mood context is still valid
          const currentMoodValid = selectedInfluence.moodContexts.some(mood => mood.name === moodContext)
          if (moodContext && !currentMoodValid) {
            // Reset to first available mood and show toast
            setMoodContext(selectedInfluence.moodContexts[0].name)
            toast.info(`That mood doesn't fit ${visualInfluence} — switched to ${selectedInfluence.moodContexts[0].name} instead.`)
          } else if (!moodContext) {
            // Set default to first mood if none selected
            setMoodContext(selectedInfluence.moodContexts[0].name)
          }
        } else {
          setAvailableMoodContexts([])
          setMoodContext("")
        }
      }
    } else {
      setAvailableLightingPresets([])
      setAvailableBackgroundEnvironments([])
      setAvailableMoodContexts([])
      setLightingPreset("")
      setBackgroundEnvironment("")
      setMoodContext("")
    }
  }, [visualInfluence, availableInfluences, lightingPreset, backgroundEnvironment, moodContext])

  // Cleanup image URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl)
      }
    }
  }, [logoPreviewUrl])

  const handleImageCountChange = (delta: number) => {
    const newCount = imageCount + delta
    if (newCount >= 1 && newCount <= 3) {
      setImageCount(newCount)
    }
  }

  // Image reference handling
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newFiles = Array.from(files).slice(0, 3 - referenceImages.length)
    const validFiles = newFiles.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      return isValidType && isValidSize
    })

    if (validFiles.length !== newFiles.length) {
      toast.error("Some files were rejected. Please use image files under 10MB.")
    }

    const updatedFiles = [...referenceImages, ...validFiles]
    setReferenceImages(updatedFiles)

    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file))
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls])
  }

  const handleImageRemove = (index: number) => {
    const updatedFiles = referenceImages.filter((_, i) => i !== index)
    const updatedPreviews = imagePreviewUrls.filter((_, i) => i !== index)
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(imagePreviewUrls[index])
    
    setReferenceImages(updatedFiles)
    setImagePreviewUrls(updatedPreviews)
  }

  // Logo upload handling
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const isValidType = file.type.startsWith('image/')
    const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit

    if (!isValidType || !isValidSize) {
      toast.error("Please use an image file under 10MB.")
      return
    }

    // Clean up previous logo URL
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl)
    }

    setLogoImage(file)
    setLogoPreviewUrl(URL.createObjectURL(file))
  }

  const handleLogoRemove = () => {
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl)
    }
    setLogoImage(null)
    setLogoPreviewUrl("")
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files.length > 0) {
      const inputEvent = {
        target: { files }
      } as React.ChangeEvent<HTMLInputElement>
      handleImageUpload(inputEvent)
    }
  }

  const handleGenerate = async () => {
    try {
      // Prepare the generation data
      const generationData = {
        // Basic settings
        name,
        prompt,
        imageCount,
        aspectRatio,
        aiPromptEnabled,
        
        // Visual Style Stack
        artDirection,
        visualInfluence,
        lightingPreset,
        backgroundEnvironment,
        moodContext,
        
        // Identity & Role
        personaName,
        roleArchetype,
        ageRange,
        genderExpression,
        emotionBias: emotionBias[0],
        
        // Physical Traits & Outfits
        bodyType,
        skinTone,
        hairStyle,
        hairColor,
        eyeColor,
        eyeShape,
        outfitCategory,
        outfitPalette,
        accessories,
        
        // Reference Images
        referenceImages: referenceImages.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        })),
        
        // Logo Placement
        logoPlacement,
        logoImage: logoImage ? {
          name: logoImage.name,
          size: logoImage.size,
          type: logoImage.type
        } : null
      }

      console.log("Generating avatar/persona with:", generationData)

      // Call the API
      const response = await fetch('/api/avatar-persona-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate avatar/persona')
      }

      const result = await response.json()
      console.log("Avatar/persona generation created:", result.avatar)
      
      // Show success message
      toast.success(`Avatar/persona "${result.avatar.title}" created successfully!`)
      
      // Close the interface
      onClose()
      
    } catch (error) {
      console.error('Error generating avatar/persona:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate avatar/persona')
    }
  }

  return (
    <TooltipProvider>
      <div className="bg-background border border-border rounded-lg p-4 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-hover w-full max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-background z-10 pt-4 pb-2  py-10 mb-10 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground pr-2 flex-1 min-w-0">
            Generate Avatar/Persona for: {projectTitle}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 shrink-0">
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Name Input Area */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Name *</label>
          <Input
            placeholder="Enter avatar/persona name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        {/* Prompt Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Prompt *</label>
            <div className="flex items-center gap-2">
              <Switch
                checked={aiPromptEnabled}
                onCheckedChange={setAiPromptEnabled}
              />
              <span className="text-xs text-muted-foreground">AI Enhanced</span>
            </div>
          </div>
          <Textarea
            placeholder="Describe your avatar or persona in detail..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Identity & Role Section */}
        <div className="space-y-4 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">🧠 Identity & Role</h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Persona Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Ethnicity</label>
              <Input
                placeholder="e.g., Luna"
                value={personaName}
                onChange={(e) => setPersonaName(e.target.value)}
              />
            </div>

            {/* Role/Archetype */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Role / Archetype</label>
              <Select value={roleArchetype} onValueChange={setRoleArchetype}>
                <SelectTrigger className="h-8 text-sm w-full min-w-[120px]">
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_ARCHETYPE_MAP).map(([key, role]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{role.icon}</span>
                        <div>
                          <div className="text-sm font-medium">{key}</div>
                          <div className="text-xs text-muted-foreground">{role.desc}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Age Range */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Age Range</label>
              <Select value={ageRange} onValueChange={setAgeRange}>
                <SelectTrigger className="h-8 text-sm w-full min-w-[120px]">
                  <SelectValue placeholder="Select age..." />
                </SelectTrigger>
                <SelectContent>
                  {AGE_RANGES.map((age) => (
                    <SelectItem key={age.value} value={age.value}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{age.icon}</span>
                        <span className="text-sm">{age.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gender Expression */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Gender Expression</label>
              <Select value={genderExpression} onValueChange={setGenderExpression}>
                <SelectTrigger className="h-8 text-sm w-full min-w-[120px]">
                  <SelectValue placeholder="Select gender..." />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_EXPRESSIONS.map((gender) => (
                    <SelectItem key={gender.value} value={gender.value}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{gender.icon}</span>
                        <span className="text-sm">{gender.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Emotion Bias Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Emotion Bias</label>
              <span className="text-xs text-muted-foreground">
                {emotionBias[0] < 30 ? "Stoic" : emotionBias[0] > 70 ? "Expressive" : "Balanced"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Stoic</span>
              <Slider
                value={emotionBias}
                onValueChange={setEmotionBias}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">Expressive</span>
            </div>
          </div>
        </div>

        {/* Visual Style Stack Section */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">🎨 Visual Style Stack</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            DreamCut adapts lighting and mood automatically to match your chosen style.
          </p>

          {/* Art Direction Field */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-foreground">🎨 Art Direction</label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose the overall artistic style for your avatar/persona</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select value={artDirection} onValueChange={setArtDirection}>
            <SelectTrigger className="h-8 text-sm w-full min-w-[120px]">
              <SelectValue placeholder="Select art direction..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ultra Realistic">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📸</span>
                  <span className="text-sm">Ultra Realistic</span>
                </div>
              </SelectItem>
              <SelectItem value="Realistic">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🎨</span>
                  <span className="text-sm">Realistic</span>
                </div>
              </SelectItem>
              <SelectItem value="Anime">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🎌</span>
                  <span className="text-sm">Anime</span>
                </div>
              </SelectItem>
              <SelectItem value="Cartoon / 2D Stylized">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🎭</span>
                  <span className="text-sm">Cartoon / 2D Stylized</span>
                </div>
              </SelectItem>
              <SelectItem value="Painterly">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🖼️</span>
                  <span className="text-sm">Painterly</span>
                </div>
              </SelectItem>
              <SelectItem value="Stylized 3D">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🎮</span>
                  <span className="text-sm">Stylized 3D</span>
                </div>
              </SelectItem>
              <SelectItem value="Line Art / Sketch">
                <div className="flex items-center gap-2">
                  <span className="text-sm">✏️</span>
                  <span className="text-sm">Line Art / Sketch</span>
                </div>
              </SelectItem>
              <SelectItem value="Pixel / Retro">
                <div className="flex items-center gap-2">
                  <span className="text-sm">👾</span>
                  <span className="text-sm">Pixel / Retro</span>
                </div>
              </SelectItem>
              <SelectItem value="Clay / Toy Style">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🧱</span>
                  <span className="text-sm">Clay / Toy Style</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Visual Influence Field */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-foreground">🧭 Visual Influence</label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose the specific visual mood and lighting style</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select 
            value={visualInfluence} 
            onValueChange={setVisualInfluence}
            disabled={!artDirection}
          >
            <SelectTrigger className="h-8 text-sm w-full min-w-[120px]">
              <SelectValue placeholder={artDirection ? "Select visual influence..." : "Select art direction first"} />
            </SelectTrigger>
            <SelectContent>
              {availableInfluences.map((influence) => (
                <SelectItem key={influence.label} value={influence.label}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded border flex items-center justify-center text-xs">
                      {influence.label.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{influence.label}</div>
                      <div className="text-xs text-muted-foreground">{influence.desc}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lighting Presets Field */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-foreground">⚙️ Lighting Presets</label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Lighting presets adapt automatically to your chosen style</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select 
            value={lightingPreset} 
            onValueChange={setLightingPreset}
            disabled={!visualInfluence}
          >
            <SelectTrigger className="h-8 text-sm w-full min-w-[120px]">
              <SelectValue placeholder={visualInfluence ? "Select lighting preset..." : "Select visual influence first"} />
            </SelectTrigger>
            <SelectContent>
              {availableLightingPresets.map((preset) => (
                <SelectItem key={preset.name} value={preset.name}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-200 to-orange-300 rounded border flex items-center justify-center text-xs">
                      ⚡
                    </div>
                    <div>
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-muted-foreground">{preset.mood}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Background Environment Field */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-foreground">🌍 Background Environment</label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Background environments sync with your lighting and style choices</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select 
            value={backgroundEnvironment} 
            onValueChange={setBackgroundEnvironment}
            disabled={!visualInfluence}
          >
            <SelectTrigger className="h-8 text-sm w-full min-w-[120px]">
              <SelectValue placeholder={visualInfluence ? "Select background environment..." : "Select visual influence first"} />
            </SelectTrigger>
            <SelectContent>
              {availableBackgroundEnvironments.map((environment) => (
                <SelectItem key={environment.name} value={environment.name}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-200 to-blue-300 rounded border flex items-center justify-center text-xs">
                      🌍
                    </div>
                    <div>
                      <div className="font-medium">{environment.name}</div>
                      <div className="text-xs text-muted-foreground">{environment.mood}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mood Context Field */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-foreground">🎭 Mood Context</label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Controls emotional energy and facial expression dynamically</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select 
            value={moodContext} 
            onValueChange={setMoodContext}
            disabled={!visualInfluence}
          >
            <SelectTrigger className="h-8 text-sm w-full min-w-[120px]">
              <SelectValue placeholder={visualInfluence ? "Select mood context..." : "Select visual influence first"} />
            </SelectTrigger>
            <SelectContent>
              {availableMoodContexts.map((mood) => (
                <SelectItem key={mood.name} value={mood.name}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-200 to-pink-300 rounded border flex items-center justify-center text-xs">
                      🎭
                    </div>
                    <div>
                      <div className="font-medium">{mood.name}</div>
                      <div className="text-xs text-muted-foreground">{mood.desc}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        </div>

        {/* Physical Traits & Outfits Section */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">👕 Physical Traits & Outfits</h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Body Type */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Body Type</label>
              <Select value={bodyType} onValueChange={setBodyType}>
                <SelectTrigger className="h-8 text-sm w-full min-w-[120px]">
                  <SelectValue placeholder="Select body type..." />
                </SelectTrigger>
                <SelectContent>
                  {BODY_TYPES.map((body) => (
                    <SelectItem key={body.value} value={body.value}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{body.icon}</span>
                        <span className="text-sm">{body.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Skin Tone */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Skin Tone</label>
              <Select value={skinTone} onValueChange={setSkinTone}>
                <SelectTrigger className="h-8 text-sm w-full min-w-[120px]">
                  <SelectValue placeholder="Select skin tone..." />
                </SelectTrigger>
                <SelectContent>
                  {SKIN_TONES.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-border" 
                          style={{ backgroundColor: tone.color }}
                        />
                        <span className="text-sm">{tone.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hair Style */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Hair Style</label>
              <Select value={hairStyle} onValueChange={setHairStyle}>
                <SelectTrigger className="h-8 text-sm w-full min-w-[120px]">
                  <SelectValue placeholder="Select hair style..." />
                </SelectTrigger>
                <SelectContent>
                  {artDirection && HAIR_STYLES[artDirection as keyof typeof HAIR_STYLES] ? 
                    HAIR_STYLES[artDirection as keyof typeof HAIR_STYLES].map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{style.icon}</span>
                          <span className="text-sm">{style.label}</span>
                        </div>
                      </SelectItem>
                    )) :
                    Object.values(HAIR_STYLES).flat().map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{style.icon}</span>
                          <span className="text-sm">{style.label}</span>
                        </div>
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Hair Color */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Hair Color</label>
              <Select value={hairColor} onValueChange={setHairColor}>
                <SelectTrigger className="h-8 text-sm w-full min-w-[120px]">
                  <SelectValue placeholder="Select hair color..." />
                </SelectTrigger>
                <SelectContent>
                  {HAIR_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-border" 
                          style={{ backgroundColor: color.color }}
                        />
                        <span className="text-sm">{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Eye Color */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Eye Color</label>
              <Select value={eyeColor} onValueChange={setEyeColor}>
                <SelectTrigger className="h-8 text-sm w-full min-w-[120px]">
                  <SelectValue placeholder="Select eye color..." />
                </SelectTrigger>
                <SelectContent>
                  {EYE_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-border" 
                          style={{ backgroundColor: color.color }}
                        />
                        <span className="text-sm">{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Eye Shape */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Eye Shape</label>
              <Select value={eyeShape} onValueChange={setEyeShape}>
                <SelectTrigger className="h-8 text-sm w-full min-w-[120px]">
                  <SelectValue placeholder="Select eye shape..." />
                </SelectTrigger>
                <SelectContent>
                  {EYE_SHAPES.map((shape) => (
                    <SelectItem key={shape.value} value={shape.value}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{shape.icon}</span>
                        <span className="text-sm">{shape.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Outfit Category */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Outfit Category</label>
              <Select value={outfitCategory} onValueChange={setOutfitCategory}>
                <SelectTrigger className="h-8 text-sm w-full min-w-[120px]">
                  <SelectValue placeholder="Select outfit..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(OUTFIT_CATEGORIES).map(([key, outfit]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{outfit.icon}</span>
                        <span className="text-sm">{key}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Accessories */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Accessories</label>
              <Select 
                value={accessories.length > 0 ? accessories[0] : ""} 
                onValueChange={(value) => setAccessories([value])}
              >
                <SelectTrigger className="h-8 text-sm w-full min-w-[120px]">
                  <SelectValue placeholder="Select accessories..." />
                </SelectTrigger>
                <SelectContent>
                  {ACCESSORIES.map((accessory) => (
                    <SelectItem key={accessory.value} value={accessory.value}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{accessory.icon}</span>
                        <span className="text-sm">{accessory.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Reference Images Section */}
        <div className="space-y-4 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">📸 Reference Images</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Upload up to 3 reference images to guide the avatar/persona generation (max 10MB each)
          </p>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              referenceImages.length < 3
                ? "border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer"
                : "border-muted-foreground/10 cursor-not-allowed"
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => {
              if (referenceImages.length < 3) {
                document.getElementById('image-upload')?.click()
              }
            }}
          >
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={referenceImages.length >= 3}
            />
            
            {referenceImages.length === 0 ? (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <p>Drag & drop images here or click to upload</p>
                  <p className="text-xs">JPG, PNG, GIF up to 10MB each</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <p>{referenceImages.length < 3 ? `Add ${3 - referenceImages.length} more image${3 - referenceImages.length > 1 ? 's' : ''}` : 'Maximum 3 images reached'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Image Previews */}
          {imagePreviewUrls.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border border-border">
                    <img
                      src={url}
                      alt={`Reference ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleImageRemove(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                    {referenceImages[index]?.name?.slice(0, 15)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logo Placement Section */}
        <div className="space-y-4 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">🏷️ Logo Placement</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Add a logo overlay to your avatar/persona (optional)
          </p>

          {/* Logo Placement Selection */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Logo Position</label>
            <Select value={logoPlacement} onValueChange={setLogoPlacement}>
              <SelectTrigger className="h-8 text-sm w-full min-w-[60px]">
                <SelectValue placeholder="Select logo placement..." />
              </SelectTrigger>
              <SelectContent>
                {LOGO_PLACEMENT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{option.icon}</span>
                      <span className="text-sm">{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Logo Upload */}
          {(logoPlacement === "Top-Right" || logoPlacement === "Bottom-Left") && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Logo Image</label>
              
              {!logoImage ? (
                <div
                  className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 rounded-lg p-4 text-center cursor-pointer transition-colors"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <div className="text-sm text-muted-foreground">
                    <p>Click to upload logo</p>
                    <p className="text-xs">JPG, PNG, GIF up to 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <div className="aspect-square max-w-[120px] rounded-lg overflow-hidden border border-border">
                    <img
                      src={logoPreviewUrl}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleLogoRemove}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                    {logoImage.name?.slice(0, 15)}...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Generation Settings Section */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">⚙️ Generation Settings</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure the output format and number of variations for your avatar/persona
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Image Variations */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-foreground">Image Variations</label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of avatar/persona variations to generate (max 3)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleImageCountChange(-1)}
                  disabled={imageCount <= 1}
                  className="h-7 w-7 shrink-0"
                >
                  <Minus className="h-2.5 w-2.5" />
                </Button>
                <div className="flex items-center gap-1.5 px-2 py-1.5 border rounded-md bg-muted/50 justify-center min-w-[45px] flex-1 max-w-[80px]">
                  <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs font-medium">{imageCount}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleImageCountChange(1)}
                  disabled={imageCount >= 3}
                  className="h-7 w-7 shrink-0"
                >
                  <Plus className="h-2.5 w-2.5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Generate {imageCount} variation{imageCount > 1 ? 's' : ''} of your avatar/persona
              </p>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-foreground">Aspect Ratio</label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Choose the best format for your avatar/persona use case</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger className="w-full h-8 text-sm min-w-[120px]">
                  <SelectValue placeholder="Select aspect ratio..." />
                </SelectTrigger>
                <SelectContent>
                  {AVATAR_ASPECT_RATIOS.map((ratio) => (
                    <SelectItem key={ratio.value} value={ratio.value}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{ratio.icon}</span>
                        <span className="text-sm">{ratio.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Generate Button Footer */}
        <div className="sticky bottom-0 bg-background py-3 border-t border-border mt-4">
          <Button 
            onClick={handleGenerate}
            className="w-full h-10 text-sm font-medium"
            disabled={!name.trim() || !prompt.trim()}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Avatar/Persona
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
