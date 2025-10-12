"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  X, 
  Upload, 
  FileText, 
  Table, 
  BarChart3, 
  Palette, 
  Type, 
  Layout, 
  MessageSquare,
  Download,
  Sparkles,
  Eye,
  Settings,
  Info,
} from "lucide-react"
import { STYLE_MAP, CHART_PURPOSE_MAP, MOOD_CONTEXTS, LIGHTING_PRESETS } from "@/lib/styles/chart-style-map"
import { cn } from "@/lib/utils"

interface ChartsInfographicsGeneratorInterfaceProps {
  onClose: () => void
  projectTitle: string
}

interface ChartState {
  data: {
    title: string
    source: "csv" | "text" | "manual"
    csvFile: File | null
    textData: string
    autoDetected: boolean
    aggregationType: string
    units: string
    labels: string
  }
  purpose: {
    purpose: string
    chartType: string
    axisMapping: Record<string, string>
    multiSeries: boolean
    orientation: "horizontal" | "vertical" | "radial"
  }
  style: {
    artDirection: string
    visualInfluence: string
    chartDepth: number
    backgroundTexture: string
    accentShapes: boolean
  }
  mood: {
    moodContext: string
    toneIntensity: number
    lightingTemperature: number
    motionAccent: string
  }
  branding: {
    brandSync: boolean
    paletteMode: "categorical" | "sequential" | "diverging"
    background: "light" | "dark" | "transparent" | "gradient"
    fontFamily: string
    logoUpload: File | null
    logoPlacement: "none" | "top-right" | "bottom-left"
  }
  annotations: {
    dataLabels: boolean
    labelPlacement: string
    legends: string
    callouts: boolean
    calloutThreshold: number
    tooltipStyle: string
    axisTitles: string
    gridlines: string
  }
  layout: {
    layoutTemplate: string
    aspectRatio: string
    marginDensity: number
    safeZoneOverlay: boolean
  }
  narrative: {
    headline: string
    caption: string
    tone: string
    platform: string
  }
}

const initialChartState: ChartState = {
  data: {
    title: "",
    source: "text",
    csvFile: null,
    textData: "",
    autoDetected: false,
    aggregationType: "sum",
    units: "",
    labels: ""
  },
  purpose: {
    purpose: "",
    chartType: "",
    axisMapping: {},
    multiSeries: false,
    orientation: "vertical"
  },
  style: {
    artDirection: "",
    visualInfluence: "",
    chartDepth: 0,
    backgroundTexture: "",
    accentShapes: false
  },
  mood: {
    moodContext: "",
    toneIntensity: 50,
    lightingTemperature: 50,
    motionAccent: "none"
  },
  branding: {
    brandSync: false,
    paletteMode: "categorical",
    background: "light",
    fontFamily: "Inter",
    logoUpload: null,
    logoPlacement: "none"
  },
  annotations: {
    dataLabels: false,
    labelPlacement: "auto",
    legends: "auto",
    callouts: false,
    calloutThreshold: 3,
    tooltipStyle: "minimal",
    axisTitles: "",
    gridlines: "light"
  },
  layout: {
    layoutTemplate: "auto",
    aspectRatio: "16:9",
    marginDensity: 50,
    safeZoneOverlay: false
  },
  narrative: {
    headline: "",
    caption: "",
    tone: "formal",
    platform: "web"
  }
}

export function ChartsInfographicsGeneratorInterface({ 
  onClose, 
  projectTitle 
}: ChartsInfographicsGeneratorInterfaceProps) {
  const [chartState, setChartState] = useState<ChartState>(initialChartState)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [isPublic, setIsPublic] = useState(true)

  // Smart visibility helpers
  const is3DStyle = () => chartState.style.artDirection === "3D Data Art"
  const isPieChart = () => chartState.purpose.chartType === "Pie" || chartState.purpose.chartType === "Donut"
  const isPlayfulMood = () => chartState.mood.moodContext === "Playful"
  const isBrandSynced = () => chartState.branding.brandSync
  const isStoryAspect = () => chartState.layout.aspectRatio === "9:16"

  // Get available chart types based on purpose
  const getAvailableChartTypes = () => {
    if (!chartState.purpose.purpose) return []
    return CHART_PURPOSE_MAP[chartState.purpose.purpose as keyof typeof CHART_PURPOSE_MAP] || []
  }

  // Get available visual influences based on art direction
  const getAvailableVisualInfluences = () => {
    if (!chartState.style.artDirection) return []
    return STYLE_MAP[chartState.style.artDirection] || []
  }

  // Update chart state helper
  const updateChartState = (section: keyof ChartState, updates: Partial<ChartState[keyof ChartState]>) => {
    setChartState(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }))
  }

  // Handle CSV file upload
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      updateChartState("data", { csvFile: file, source: "csv" })
    }
  }

  // Handle CSV file removal
  const handleCSVRemove = () => {
    updateChartState("data", { csvFile: null, source: "text" })
    // Reset the file input
    const fileInput = document.getElementById('csv-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      updateChartState("branding", { logoUpload: file })
    }
  }

  // Handle logo removal
  const handleLogoRemove = () => {
    updateChartState("branding", { logoUpload: null })
    // Reset the file input
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }


  // Generate chart (placeholder for full pipeline)
  const handleGenerate = async () => {
    setIsGenerating(true)
    
    // Prepare the generation data including isPublic
    const generationData = {
      ...chartState,
      isPublic,
      projectTitle
    }
    
    // TODO: Implement full pipeline:
    // 1. Code Interpreter (data processing)
    // 2. Visual Engine (AI beautification)
    // 3. Export
    console.log('Generation data:', generationData)
    
    setTimeout(() => {
      setIsGenerating(false)
    }, 5000)
  }

  return (
    <div className="bg-background border border-border rounded-lg p-3 space-y-3 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hover">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 pb-5 p-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-xs font-semibold text-foreground">
              📊 Generator
            </h3>
            <p className="text-xs text-muted-foreground">
              Create data-driven visuals for: {projectTitle}
            </p>
          </div>
          {/* Public/Private Toggle */}
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[9px] font-medium px-2 rounded-full transition-colors",
              isPublic 
                ? "bg-green-100 text-green-700 border border-green-200" 
                : "bg-gray-100 text-gray-700 border border-gray-200"
            )}>
              {isPublic ? "Public" : "Private"}
            </span>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              className="scale-75"
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Edit Mode */}
        <Accordion type="multiple" defaultValue={["data", "purpose"]} className="space-y-3">
          
          {/* Data Section */}
          <AccordionItem value="data" className="border border-border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline py-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs">📊 Data Source & Processing</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Only the <strong>Prompt</strong> field is required. All other fields are optional.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">

              {/* Title Section */}
              <div className="space-y-2">
                <Label className="text-xs">📝 Title</Label>
                <Input
                  placeholder="Enter chart title..."
                  value={chartState.data.title || ""}
                  onChange={(e) => updateChartState("data", { title: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              {/* CSV Upload Section */}
              <div className="space-y-2">
                <Label className="text-xs">📁 CSV File Upload</Label>
                
                {!chartState.data.csvFile ? (
                  <div className="relative border-2 border-dashed border-border rounded-lg p-3 hover:border-primary/50 transition-colors">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          CSV files up to 10MB
                        </p>
                      </div>
                    </div>
                    <Input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="border border-border rounded-lg p-2 bg-muted/30">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                          <Table className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {chartState.data.csvFile.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {(chartState.data.csvFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCSVRemove}
                          className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Description Section */}
              <div className="space-y-2">
                <Label className="text-xs">📝 Prompt <span className="text-red-500">*</span></Label>
                <Textarea
                  placeholder="e.g., 'Compare revenue by region for 2024: North America $2.5M, Europe $1.8M, Asia $3.2M'"
                  value={chartState.data.textData}
                  onChange={(e) => updateChartState("data", { textData: e.target.value })}
                  className="min-h-[60px] text-xs resize-none"
                  required
                />
              </div>


              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">📊 Aggregation Type</Label>
                  <Select 
                    value={chartState.data.aggregationType} 
                    onValueChange={(value) => updateChartState("data", { aggregationType: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sum">➕ Sum</SelectItem>
                      <SelectItem value="average">📊 Average</SelectItem>
                      <SelectItem value="count">🔢 Count</SelectItem>
                      <SelectItem value="max">📈 Maximum</SelectItem>
                      <SelectItem value="min">📉 Minimum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">🏷️ Units / Labels</Label>
                  <Input
                    placeholder="e.g., $, %, users"
                    value={chartState.data.units}
                    onChange={(e) => updateChartState("data", { units: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

            </AccordionContent>
          </AccordionItem>

          {/* Chart Purpose Section */}
          <AccordionItem value="purpose" className="border border-border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline py-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs">🎯 Chart Purpose & Type</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="space-y-2">
                <Label className="text-xs">Purpose</Label>
                <Select 
                  value={chartState.purpose.purpose} 
                  onValueChange={(value) => updateChartState("purpose", { purpose: value, chartType: "" })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="What do you want to show?" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CHART_PURPOSE_MAP).map((purpose) => {
                      const emojiMap: { [key: string]: string } = {
                        "Comparison": "⚖️",
                        "Trend / Time": "📈",
                        "Distribution": "📊",
                        "Composition": "🥧",
                        "Relationship": "🔗",
                        "Process / Flow": "🔄",
                        "Ranking / Highlight": "🏆"
                      }
                      return (
                        <SelectItem key={purpose} value={purpose}>
                          {emojiMap[purpose]} {purpose}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {chartState.purpose.purpose && (
                <div className="space-y-2">
                  <Label className="text-xs">Chart Type</Label>
                  <RadioGroup 
                    value={chartState.purpose.chartType} 
                    onValueChange={(value) => updateChartState("purpose", { chartType: value })}
                    className="grid grid-cols-2 gap-3"
                  >
                    {getAvailableChartTypes().map((type) => (
                      <div key={type} className="flex items-center space-x-1">
                        <RadioGroupItem value={type} id={type} className="h-3 w-3" />
                        <Label htmlFor={type} className="text-xs">{type}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Orientation</Label>
                  <Select 
                    value={chartState.purpose.orientation} 
                    onValueChange={(value) => updateChartState("purpose", { orientation: value as any })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vertical">📊 Vertical</SelectItem>
                      <SelectItem value="horizontal">📈 Horizontal</SelectItem>
                      <SelectItem value="radial">⭕ Radial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Switch
                    id="multi-series"
                    checked={chartState.purpose.multiSeries}
                    onCheckedChange={(checked) => updateChartState("purpose", { multiSeries: checked })}
                    className="h-4 w-7"
                  />
                  <Label htmlFor="multi-series" className="text-xs">Multi-Series</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Visual Style Section */}
          <AccordionItem value="style" className="border border-border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline py-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs">🎨 Visual Style</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="space-y-2">
                <Label className="text-xs">Art Direction</Label>
                <Select 
                  value={chartState.style.artDirection} 
                  onValueChange={(value) => updateChartState("style", { artDirection: value, visualInfluence: "" })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Choose your creative direction" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(STYLE_MAP).map((direction) => {
                      const emojiMap: { [key: string]: string } = {
                        "Minimal Analytical": "📊",
                        "Editorial Infographic": "📰",
                        "Playful / UGC": "🎨",
                        "3D Data Art": "🎯",
                        "Hand-drawn Sketch": "✏️",
                        "Futuristic Tech Data": "🚀",
                        "Illustrated Concept": "🎭"
                      }
                      return (
                        <SelectItem key={direction} value={direction}>
                          {emojiMap[direction]} {direction}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {chartState.style.artDirection && (
                <div className="space-y-2">
                  <Label className="text-xs">Visual Influence</Label>
                  <Select 
                    value={chartState.style.visualInfluence} 
                    onValueChange={(value) => updateChartState("style", { visualInfluence: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select visual style" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableVisualInfluences().map((influence) => (
                        <SelectItem key={influence.label} value={influence.label}>
                          <div>
                            <div className="font-medium text-xs">{influence.label}</div>
                            <div className="text-xs text-muted-foreground">{influence.desc}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {is3DStyle() && (
                <div className="space-y-2">
                  <Label className="text-xs">Chart Depth / Lighting</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[chartState.style.chartDepth]}
                      onValueChange={([value]) => updateChartState("style", { chartDepth: value })}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Flat</span>
                      <span>Deep 3D</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Background Texture</Label>
                  <Select 
                    value={chartState.style.backgroundTexture} 
                    onValueChange={(value) => updateChartState("style", { backgroundTexture: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select texture" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">❌ None</SelectItem>
                      <SelectItem value="paper">📄 Paper</SelectItem>
                      <SelectItem value="fabric">🧵 Fabric</SelectItem>
                      <SelectItem value="metal">🔩 Metal</SelectItem>
                      <SelectItem value="glass">🪟 Glass</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Switch
                    id="accent-shapes"
                    checked={chartState.style.accentShapes}
                    onCheckedChange={(checked) => updateChartState("style", { accentShapes: checked })}
                    className="h-4 w-7"
                  />
                  <Label htmlFor="accent-shapes" className="text-xs">Accent Shapes</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Mood & Emotion Section */}
          <AccordionItem value="mood" className="border border-border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline py-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs">💭 Mood & Emotion</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="space-y-2">
                <Label className="text-xs">🎭 Mood Context</Label>
                <Select 
                  value={chartState.mood.moodContext} 
                  onValueChange={(value) => updateChartState("mood", { moodContext: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select mood context" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOOD_CONTEXTS.map((mood) => (
                      <SelectItem key={mood.name} value={mood.name}>
                        {mood.emoji} {mood.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Tone Intensity</Label>
                <div className="space-y-2">
                  <Slider
                    value={[chartState.mood.toneIntensity]}
                    onValueChange={([value]) => updateChartState("mood", { toneIntensity: value })}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subtle</span>
                    <span>Bold</span>
                  </div>
                </div>
              </div>

              {!chartState.style.artDirection.includes("Flat") && (
                <div className="space-y-2">
                  <Label className="text-xs">Lighting Temperature</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[chartState.mood.lightingTemperature]}
                      onValueChange={([value]) => updateChartState("mood", { lightingTemperature: value })}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Cool</span>
                      <span>Warm</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs">Motion Accent (for export)</Label>
                <Select 
                  value={chartState.mood.motionAccent} 
                  onValueChange={(value) => updateChartState("mood", { motionAccent: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">❌ None</SelectItem>
                    <SelectItem value="fade-in">✨ Fade In</SelectItem>
                    <SelectItem value="bar-grow">📊 Bar Grow</SelectItem>
                    <SelectItem value="glow-sweep">💫 Glow Sweep</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Branding & Typography Section */}
          <AccordionItem value="branding" className="border border-border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline py-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs">🏢 Branding & Typography</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="flex items-center space-x-1">
                <Switch
                  id="brand-sync"
                  checked={chartState.branding.brandSync}
                  onCheckedChange={(checked) => updateChartState("branding", { brandSync: checked })}
                  className="h-4 w-7"
                />
                <Label htmlFor="brand-sync" className="text-xs">Brand Sync</Label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Palette Mode</Label>
                  <Select 
                    value={chartState.branding.paletteMode} 
                    onValueChange={(value) => updateChartState("branding", { paletteMode: value as any })}
                    disabled={isBrandSynced()}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="categorical">🎨 Categorical</SelectItem>
                      <SelectItem value="sequential">📊 Sequential</SelectItem>
                      <SelectItem value="diverging">🔄 Diverging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Background</Label>
                  <Select 
                    value={chartState.branding.background} 
                    onValueChange={(value) => updateChartState("branding", { background: value as any })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">☀️ Light</SelectItem>
                      <SelectItem value="dark">🌙 Dark</SelectItem>
                      <SelectItem value="transparent">👻 Transparent</SelectItem>
                      <SelectItem value="gradient">🌈 Gradient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Font Family</Label>
                <Select 
                  value={chartState.branding.fontFamily} 
                  onValueChange={(value) => updateChartState("branding", { fontFamily: value })}
                  disabled={isBrandSynced()}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">🔤 Inter</SelectItem>
                    <SelectItem value="Roboto">🤖 Roboto</SelectItem>
                    <SelectItem value="Helvetica">📝 Helvetica</SelectItem>
                    <SelectItem value="Georgia">📰 Georgia</SelectItem>
                    <SelectItem value="Monaco">💻 Monaco</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">🏷️ Logo Placement</Label>
                <Select 
                  value={chartState.branding.logoPlacement} 
                  onValueChange={(value: "none" | "top-right" | "bottom-left") => 
                    updateChartState("branding", { logoPlacement: value })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select logo placement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">❌ None</SelectItem>
                    <SelectItem value="top-right">↗️ Top-Right</SelectItem>
                    <SelectItem value="bottom-left">↙️ Bottom-Left</SelectItem>
                  </SelectContent>
                </Select>
                
                {(chartState.branding.logoPlacement === "top-right" || chartState.branding.logoPlacement === "bottom-left") && (
                  <div className="space-y-2">
                    <Label className="text-xs">📁 Upload Logo</Label>
                    
                    {!chartState.branding.logoUpload ? (
                      <div className="relative border-2 border-dashed border-border rounded-lg p-3 hover:border-primary/50 transition-colors">
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              PNG, JPG, SVG up to 2MB
                            </p>
                          </div>
                        </div>
                        <Input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div className="border border-border rounded-lg p-2 bg-muted/30">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">
                                {chartState.branding.logoUpload.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {(chartState.branding.logoUpload.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleLogoRemove}
                              className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Annotations & Labels Section */}
          <AccordionItem value="annotations" className="border border-border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline py-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs">🏷️ Annotations & Labels</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-1">
                  <Switch
                    id="data-labels"
                    checked={chartState.annotations.dataLabels}
                    onCheckedChange={(checked) => updateChartState("annotations", { dataLabels: checked })}
                    className="h-4 w-7"
                  />
                  <Label htmlFor="data-labels" className="text-xs">Data Labels</Label>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Switch
                    id="callouts"
                    checked={chartState.annotations.callouts}
                    onCheckedChange={(checked) => updateChartState("annotations", { callouts: checked })}
                    className="h-4 w-7"
                  />
                  <Label htmlFor="callouts" className="text-xs">Callouts</Label>
                </div>
              </div>

              {!isPieChart() && (
                <div className="space-y-2">
                  <Label className="text-xs">Label Placement</Label>
                  <Select 
                    value={chartState.annotations.labelPlacement} 
                    onValueChange={(value) => updateChartState("annotations", { labelPlacement: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">🤖 Auto</SelectItem>
                      <SelectItem value="top">⬆️ Top</SelectItem>
                      <SelectItem value="bottom">⬇️ Bottom</SelectItem>
                      <SelectItem value="left">⬅️ Left</SelectItem>
                      <SelectItem value="right">➡️ Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Legends</Label>
                  <Select 
                    value={chartState.annotations.legends} 
                    onValueChange={(value) => updateChartState("annotations", { legends: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">🤖 Auto</SelectItem>
                      <SelectItem value="inline">📝 Inline</SelectItem>
                      <SelectItem value="side">↔️ Side</SelectItem>
                      <SelectItem value="bottom">⬇️ Bottom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Gridlines</Label>
                  <Select 
                    value={chartState.annotations.gridlines} 
                    onValueChange={(value) => updateChartState("annotations", { gridlines: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">❌ None</SelectItem>
                      <SelectItem value="light">💡 Light</SelectItem>
                      <SelectItem value="strong">💪 Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {chartState.annotations.callouts && (
                <div className="space-y-2">
                  <Label className="text-xs">Callout Threshold (top N values)</Label>
                  <Slider
                    value={[chartState.annotations.calloutThreshold]}
                    onValueChange={([value]) => updateChartState("annotations", { calloutThreshold: value })}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Layout & Composition Section */}
          <AccordionItem value="layout" className="border border-border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline py-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs">📐 Layout & Composition</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="space-y-2">
                <Label className="text-xs">Layout Template</Label>
                <Select 
                  value={chartState.layout.layoutTemplate} 
                  onValueChange={(value) => updateChartState("layout", { layoutTemplate: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">🤖 Auto</SelectItem>
                    <SelectItem value="hero">🦸 Hero</SelectItem>
                    <SelectItem value="dashboard">📊 Dashboard</SelectItem>
                    <SelectItem value="story">📖 Story</SelectItem>
                    <SelectItem value="metric-cards">📈 Metric Cards</SelectItem>
                    <SelectItem value="timeline">⏰ Timeline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Aspect Ratio</Label>
                <Select 
                  value={chartState.layout.aspectRatio} 
                  onValueChange={(value) => updateChartState("layout", { aspectRatio: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">⬜ 1:1 (Square)</SelectItem>
                    <SelectItem value="4:5">📱 4:5 (Portrait)</SelectItem>
                    <SelectItem value="16:9">📺 16:9 (Widescreen)</SelectItem>
                    <SelectItem value="9:16">📱 9:16 (Story)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Margin Density</Label>
                <div className="space-y-2">
                  <Slider
                    value={[chartState.layout.marginDensity]}
                    onValueChange={([value]) => updateChartState("layout", { marginDensity: value })}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Tight</span>
                    <span>Spacious</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Switch
                  id="safe-zone"
                  checked={chartState.layout.safeZoneOverlay}
                  onCheckedChange={(checked) => updateChartState("layout", { safeZoneOverlay: checked })}
                  className="h-4 w-7"
                />
                <Label htmlFor="safe-zone" className="text-xs">Safe Zone Overlay</Label>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Narrative & Export Section */}
          <AccordionItem value="narrative" className="border border-border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline py-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs">📝 Narrative & Export</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="space-y-2">
                <Label className="text-xs">Headline</Label>
                <Input
                  placeholder="e.g., '2024 Smartphone Market Share'"
                  value={chartState.narrative.headline}
                  onChange={(e) => updateChartState("narrative", { headline: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Caption</Label>
                <Textarea
                  placeholder="e.g., 'Apple leads global growth, Xiaomi surges in APAC.'"
                  value={chartState.narrative.caption}
                  onChange={(e) => updateChartState("narrative", { caption: e.target.value })}
                  className="min-h-[60px] text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Tone</Label>
                  <Select 
                    value={chartState.narrative.tone} 
                    onValueChange={(value) => updateChartState("narrative", { tone: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">🎩 Formal</SelectItem>
                      <SelectItem value="friendly">😊 Friendly</SelectItem>
                      <SelectItem value="fun">🎉 Fun</SelectItem>
                      <SelectItem value="analytical">📊 Analytical</SelectItem>
                      <SelectItem value="urgent">⚡ Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Platform</Label>
                  <Select 
                    value={chartState.narrative.platform} 
                    onValueChange={(value) => updateChartState("narrative", { platform: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">📸 Instagram</SelectItem>
                      <SelectItem value="story">📱 Story</SelectItem>
                      <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                      <SelectItem value="web">🌐 Web</SelectItem>
                      <SelectItem value="pdf">📄 PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground">
          {chartState.data.source === "csv" && chartState.data.csvFile && "CSV uploaded • "}
          {chartState.purpose.purpose && `${chartState.purpose.purpose} • `}
          {chartState.style.artDirection && `${chartState.style.artDirection} • `}
          {chartState.mood.moodContext && `${chartState.mood.moodContext}`}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose} className="h-8 text-xs">
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !chartState.data.textData.trim()}
            className="flex items-center gap-1 h-8 text-xs"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                Generate Chart
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}


