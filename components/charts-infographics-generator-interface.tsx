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
  Zap
} from "lucide-react"
import { STYLE_MAP, CHART_PURPOSE_MAP, MOOD_CONTEXTS, LIGHTING_PRESETS } from "@/lib/styles/chart-style-map"

interface ChartsInfographicsGeneratorInterfaceProps {
  onClose: () => void
  projectTitle: string
}

interface ChartState {
  data: {
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
    logoUpload: null
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
    layoutTemplate: "hero",
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

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      updateChartState("branding", { logoUpload: file })
    }
  }

  // Auto-detect columns (placeholder for Code Interpreter integration)
  const handleAutoDetect = async () => {
    setIsGenerating(true)
    // TODO: Integrate with Code Interpreter for data parsing
    setTimeout(() => {
      updateChartState("data", { autoDetected: true })
      setIsGenerating(false)
    }, 2000)
  }

  // Generate chart (placeholder for full pipeline)
  const handleGenerate = async () => {
    setIsGenerating(true)
    // TODO: Implement full pipeline:
    // 1. Code Interpreter (data processing)
    // 2. Visual Engine (AI beautification)
    // 3. Export
    setTimeout(() => {
      setIsGenerating(false)
    }, 5000)
  }

  return (
    <div className="bg-background border border-border rounded-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Charts & Infographics Generator
          </h3>
          <p className="text-sm text-muted-foreground">
            Create data-driven visuals for: {projectTitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {previewMode ? (
        /* Preview Mode */
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Chart Preview</h4>
            <p className="text-sm text-muted-foreground">
              Your generated chart will appear here
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Chart
                </>
              )}
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <Accordion type="multiple" defaultValue={["data", "purpose"]} className="space-y-4">
          
          {/* Data Section */}
          <AccordionItem value="data" className="border border-border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                <span className="font-medium">Data Source & Processing</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <Tabs value={chartState.data.source} onValueChange={(value) => updateChartState("data", { source: value as any })}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="csv">Upload CSV</TabsTrigger>
                  <TabsTrigger value="text">Describe in Text</TabsTrigger>
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                </TabsList>
                
                <TabsContent value="csv" className="space-y-4">
                  <div className="space-y-2">
                    <Label>CSV File</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleAutoDetect}
                        disabled={!chartState.data.csvFile || isGenerating}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Zap className="h-4 w-4" />
                        Auto Detect
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Describe your data</Label>
                    <Textarea
                      placeholder="e.g., 'Compare revenue by region for 2024: North America $2.5M, Europe $1.8M, Asia $3.2M'"
                      value={chartState.data.textData}
                      onChange={(e) => updateChartState("data", { textData: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="manual" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Manual Data Entry</Label>
                    <Textarea
                      placeholder="Enter your data in a structured format..."
                      className="min-h-[100px]"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Aggregation Type</Label>
                  <Select 
                    value={chartState.data.aggregationType} 
                    onValueChange={(value) => updateChartState("data", { aggregationType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sum">Sum</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="count">Count</SelectItem>
                      <SelectItem value="max">Maximum</SelectItem>
                      <SelectItem value="min">Minimum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Units / Labels</Label>
                  <Input
                    placeholder="e.g., $, %, users"
                    value={chartState.data.units}
                    onChange={(e) => updateChartState("data", { units: e.target.value })}
                  />
                </div>
              </div>

              {chartState.data.autoDetected && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">Columns auto-detected successfully</span>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Chart Purpose Section */}
          <AccordionItem value="purpose" className="border border-border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Chart Purpose & Type</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Select 
                  value={chartState.purpose.purpose} 
                  onValueChange={(value) => updateChartState("purpose", { purpose: value, chartType: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="What do you want to show?" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CHART_PURPOSE_MAP).map((purpose) => (
                      <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {chartState.purpose.purpose && (
                <div className="space-y-2">
                  <Label>Chart Type</Label>
                  <RadioGroup 
                    value={chartState.purpose.chartType} 
                    onValueChange={(value) => updateChartState("purpose", { chartType: value })}
                    className="grid grid-cols-2 gap-2"
                  >
                    {getAvailableChartTypes().map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <RadioGroupItem value={type} id={type} />
                        <Label htmlFor={type} className="text-sm">{type}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Orientation</Label>
                  <Select 
                    value={chartState.purpose.orientation} 
                    onValueChange={(value) => updateChartState("purpose", { orientation: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vertical">Vertical</SelectItem>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="radial">Radial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="multi-series"
                    checked={chartState.purpose.multiSeries}
                    onCheckedChange={(checked) => updateChartState("purpose", { multiSeries: checked })}
                  />
                  <Label htmlFor="multi-series">Multi-Series</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Visual Style Section */}
          <AccordionItem value="style" className="border border-border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="font-medium">Visual Style</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Art Direction</Label>
                <Select 
                  value={chartState.style.artDirection} 
                  onValueChange={(value) => updateChartState("style", { artDirection: value, visualInfluence: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your creative direction" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(STYLE_MAP).map((direction) => (
                      <SelectItem key={direction} value={direction}>{direction}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {chartState.style.artDirection && (
                <div className="space-y-2">
                  <Label>Visual Influence</Label>
                  <Select 
                    value={chartState.style.visualInfluence} 
                    onValueChange={(value) => updateChartState("style", { visualInfluence: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visual style" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableVisualInfluences().map((influence) => (
                        <SelectItem key={influence.label} value={influence.label}>
                          <div>
                            <div className="font-medium">{influence.label}</div>
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
                  <Label>Chart Depth / Lighting</Label>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Background Texture</Label>
                  <Select 
                    value={chartState.style.backgroundTexture} 
                    onValueChange={(value) => updateChartState("style", { backgroundTexture: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select texture" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="paper">Paper</SelectItem>
                      <SelectItem value="fabric">Fabric</SelectItem>
                      <SelectItem value="metal">Metal</SelectItem>
                      <SelectItem value="glass">Glass</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="accent-shapes"
                    checked={chartState.style.accentShapes}
                    onCheckedChange={(checked) => updateChartState("style", { accentShapes: checked })}
                  />
                  <Label htmlFor="accent-shapes">Accent Shapes</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Mood & Emotion Section */}
          <AccordionItem value="mood" className="border border-border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">Mood & Emotion</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Mood Context</Label>
                <RadioGroup 
                  value={chartState.mood.moodContext} 
                  onValueChange={(value) => updateChartState("mood", { moodContext: value })}
                  className="grid grid-cols-3 gap-2"
                >
                  {MOOD_CONTEXTS.map((mood) => (
                    <div key={mood.name} className="flex items-center space-x-2">
                      <RadioGroupItem value={mood.name} id={mood.name} />
                      <Label htmlFor={mood.name} className="text-sm flex items-center gap-1">
                        <span>{mood.emoji}</span>
                        {mood.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Tone Intensity</Label>
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
                  <Label>Lighting Temperature</Label>
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
                <Label>Motion Accent (for export)</Label>
                <Select 
                  value={chartState.mood.motionAccent} 
                  onValueChange={(value) => updateChartState("mood", { motionAccent: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="fade-in">Fade In</SelectItem>
                    <SelectItem value="bar-grow">Bar Grow</SelectItem>
                    <SelectItem value="glow-sweep">Glow Sweep</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Branding & Typography Section */}
          <AccordionItem value="branding" className="border border-border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <span className="font-medium">Branding & Typography</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="brand-sync"
                  checked={chartState.branding.brandSync}
                  onCheckedChange={(checked) => updateChartState("branding", { brandSync: checked })}
                />
                <Label htmlFor="brand-sync">Brand Sync</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Palette Mode</Label>
                  <Select 
                    value={chartState.branding.paletteMode} 
                    onValueChange={(value) => updateChartState("branding", { paletteMode: value as any })}
                    disabled={isBrandSynced()}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="categorical">Categorical</SelectItem>
                      <SelectItem value="sequential">Sequential</SelectItem>
                      <SelectItem value="diverging">Diverging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Background</Label>
                  <Select 
                    value={chartState.branding.background} 
                    onValueChange={(value) => updateChartState("branding", { background: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="transparent">Transparent</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select 
                  value={chartState.branding.fontFamily} 
                  onValueChange={(value) => updateChartState("branding", { fontFamily: value })}
                  disabled={isBrandSynced()}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Monaco">Monaco</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Logo / Watermark</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1"
                  />
                  <Switch
                    id="logo-toggle"
                    checked={!!chartState.branding.logoUpload}
                    onCheckedChange={() => {}}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Annotations & Labels Section */}
          <AccordionItem value="annotations" className="border border-border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="font-medium">Annotations & Labels</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="data-labels"
                    checked={chartState.annotations.dataLabels}
                    onCheckedChange={(checked) => updateChartState("annotations", { dataLabels: checked })}
                  />
                  <Label htmlFor="data-labels">Data Labels</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="callouts"
                    checked={chartState.annotations.callouts}
                    onCheckedChange={(checked) => updateChartState("annotations", { callouts: checked })}
                  />
                  <Label htmlFor="callouts">Callouts</Label>
                </div>
              </div>

              {!isPieChart() && (
                <div className="space-y-2">
                  <Label>Label Placement</Label>
                  <Select 
                    value={chartState.annotations.labelPlacement} 
                    onValueChange={(value) => updateChartState("annotations", { labelPlacement: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Legends</Label>
                  <Select 
                    value={chartState.annotations.legends} 
                    onValueChange={(value) => updateChartState("annotations", { legends: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="inline">Inline</SelectItem>
                      <SelectItem value="side">Side</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Gridlines</Label>
                  <Select 
                    value={chartState.annotations.gridlines} 
                    onValueChange={(value) => updateChartState("annotations", { gridlines: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {chartState.annotations.callouts && (
                <div className="space-y-2">
                  <Label>Callout Threshold (top N values)</Label>
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
          <AccordionItem value="layout" className="border border-border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                <span className="font-medium">Layout & Composition</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Layout Template</Label>
                <Select 
                  value={chartState.layout.layoutTemplate} 
                  onValueChange={(value) => updateChartState("layout", { layoutTemplate: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Hero</SelectItem>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="metric-cards">Metric Cards</SelectItem>
                    <SelectItem value="timeline">Timeline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Aspect Ratio</Label>
                <Select 
                  value={chartState.layout.aspectRatio} 
                  onValueChange={(value) => updateChartState("layout", { aspectRatio: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    <SelectItem value="4:5">4:5 (Portrait)</SelectItem>
                    <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                    <SelectItem value="9:16">9:16 (Story)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Margin Density</Label>
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="safe-zone"
                  checked={chartState.layout.safeZoneOverlay}
                  onCheckedChange={(checked) => updateChartState("layout", { safeZoneOverlay: checked })}
                />
                <Label htmlFor="safe-zone">Safe Zone Overlay</Label>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Narrative & Export Section */}
          <AccordionItem value="narrative" className="border border-border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">Narrative & Export</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Headline</Label>
                <Input
                  placeholder="e.g., '2024 Smartphone Market Share'"
                  value={chartState.narrative.headline}
                  onChange={(e) => updateChartState("narrative", { headline: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Caption</Label>
                <Textarea
                  placeholder="e.g., 'Apple leads global growth, Xiaomi surges in APAC.'"
                  value={chartState.narrative.caption}
                  onChange={(e) => updateChartState("narrative", { caption: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select 
                    value={chartState.narrative.tone} 
                    onValueChange={(value) => updateChartState("narrative", { tone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="fun">Fun</SelectItem>
                      <SelectItem value="analytical">Analytical</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select 
                    value={chartState.narrative.platform} 
                    onValueChange={(value) => updateChartState("narrative", { platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          {chartState.data.source === "csv" && chartState.data.csvFile && "CSV uploaded • "}
          {chartState.purpose.purpose && `${chartState.purpose.purpose} • `}
          {chartState.style.artDirection && `${chartState.style.artDirection} • `}
          {chartState.mood.moodContext && `${chartState.mood.moodContext}`}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !chartState.data.textData && !chartState.data.csvFile}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Chart
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}


