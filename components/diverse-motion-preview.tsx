"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Settings,
  Download,
  Maximize2,
  Minimize2,
  RotateCcw
} from "lucide-react"

interface PreviewAsset {
  id: string
  type: 'image' | 'video' | 'text'
  src?: string
  text?: string
  duration: number
  thumbnail?: string
}

interface TransitionConfig {
  type: 'morph' | 'cut' | 'fade' | 'slide' | 'zoom' | 'blur'
  duration: number
  easing: 'smooth' | 'linear' | 'snap' | 'bounce'
  direction?: 'forward' | 'backward' | 'up' | 'down' | 'zoom-in' | 'zoom-out'
}

interface PreviewProps {
  assets: PreviewAsset[]
  transitions: TransitionConfig[]
  totalDuration: number
  isPlaying: boolean
  currentTime: number
  onTimeChange: (time: number) => void
  onPlayPause: () => void
  onSeek: (time: number) => void
  onExport?: () => void
  onFullscreen?: () => void
  className?: string
}

export function DiverseMotionPreview({
  assets,
  transitions,
  totalDuration,
  isPlaying,
  currentTime,
  onTimeChange,
  onPlayPause,
  onSeek,
  onExport,
  onFullscreen,
  className = ""
}: PreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volume, setVolume] = useState([50])
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState([1])
  const [showSettings, setShowSettings] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  // Calculate current asset and transition
  const getCurrentAsset = useCallback((time: number) => {
    let accumulatedTime = 0
    for (let i = 0; i < assets.length; i++) {
      if (time <= accumulatedTime + assets[i].duration) {
        return { asset: assets[i], index: i, progress: (time - accumulatedTime) / assets[i].duration }
      }
      accumulatedTime += assets[i].duration
    }
    return { asset: assets[assets.length - 1], index: assets.length - 1, progress: 1 }
  }, [assets])

  const getCurrentTransition = useCallback((time: number) => {
    let accumulatedTime = 0
    for (let i = 0; i < assets.length - 1; i++) {
      accumulatedTime += assets[i].duration
      if (time >= accumulatedTime - transitions[i]?.duration / 2 && time <= accumulatedTime + transitions[i]?.duration / 2) {
        return { transition: transitions[i], index: i, progress: (time - (accumulatedTime - transitions[i].duration / 2)) / transitions[i].duration }
      }
    }
    return null
  }, [assets, transitions])

  // Render preview frame
  const renderFrame = useCallback((time: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    const currentAsset = getCurrentAsset(time)
    const currentTransition = getCurrentTransition(time)

    if (currentTransition) {
      // Render transition between assets
      const prevAsset = assets[currentTransition.index]
      const nextAsset = assets[currentTransition.index + 1]
      const progress = currentTransition.progress

      // Apply transition effect based on type
      switch (currentTransition.transition.type) {
        case 'fade':
          // Fade out previous, fade in next
          ctx.globalAlpha = 1 - progress
          renderAsset(ctx, prevAsset.asset, width, height)
          ctx.globalAlpha = progress
          renderAsset(ctx, nextAsset, width, height)
          ctx.globalAlpha = 1
          break
        case 'slide':
          // Slide transition
          const slideOffset = width * progress
          ctx.save()
          ctx.translate(-slideOffset, 0)
          renderAsset(ctx, prevAsset.asset, width, height)
          ctx.translate(slideOffset * 2, 0)
          renderAsset(ctx, nextAsset, width, height)
          ctx.restore()
          break
        case 'zoom':
          // Zoom transition
          const scale = 1 + progress * 0.2
          ctx.save()
          ctx.scale(scale, scale)
          ctx.translate(-width * (scale - 1) / 2, -height * (scale - 1) / 2)
          renderAsset(ctx, prevAsset.asset, width, height)
          ctx.restore()
          break
        default:
          // Default to cut
          renderAsset(ctx, nextAsset, width, height)
      }
    } else {
      // Render single asset
      renderAsset(ctx, currentAsset.asset, width, height)
    }

    // Render progress indicator
    if (currentAsset.progress < 1) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(0, height - 4, width * currentAsset.progress, 4)
    }
  }, [assets, transitions, getCurrentAsset, getCurrentTransition])

  // Render individual asset
  const renderAsset = (ctx: CanvasRenderingContext2D, asset: PreviewAsset, width: number, height: number) => {
    if (asset.type === 'text') {
      // Render text asset
      ctx.fillStyle = '#1f2937'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(asset.text || 'Text Asset', width / 2, height / 2)
    } else if (asset.type === 'image' && asset.src) {
      // Render image asset
      const img = new Image()
      img.onload = () => {
        const aspectRatio = img.width / img.height
        const canvasAspectRatio = width / height
        
        let drawWidth = width
        let drawHeight = height
        let offsetX = 0
        let offsetY = 0

        if (aspectRatio > canvasAspectRatio) {
          drawHeight = width / aspectRatio
          offsetY = (height - drawHeight) / 2
        } else {
          drawWidth = height * aspectRatio
          offsetX = (width - drawWidth) / 2
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
      }
      img.src = asset.src
    }
  }

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        renderFrame(currentTime)
        animationRef.current = requestAnimationFrame(animate)
      }
      animate()
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      renderFrame(currentTime)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, currentTime, renderFrame])

  // Handle seek
  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * totalDuration
    onSeek(newTime)
  }

  // Handle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    onFullscreen?.()
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Preview Canvas */}
      <div className="relative bg-black">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full h-auto max-h-96 object-contain"
        />
        
        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
          <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
            {/* Timeline */}
            <div className="mb-3">
              <Slider
                value={[(currentTime / totalDuration) * 100]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="w-full"
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSeek(Math.max(0, currentTime - 1))}
                  className="text-white hover:bg-white/20"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSeek(Math.min(totalDuration, currentTime + 1))}
                  className="text-white hover:bg-white/20"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                
                <div className="text-white text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExport}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Volume: {volume[0]}%
              </label>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Speed: {playbackSpeed[0]}x
              </label>
              <Slider
                value={playbackSpeed}
                onValueChange={setPlaybackSpeed}
                min={0.25}
                max={2}
                step={0.25}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Asset Timeline */}
      <div className="p-4 bg-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-300">Timeline</span>
          <Badge variant="secondary" className="text-xs">
            {assets.length} assets
          </Badge>
        </div>
        
        <div className="flex gap-1">
          {assets.map((asset, index) => {
            const width = (asset.duration / totalDuration) * 100
            const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
            
            return (
              <div
                key={asset.id}
                className={`${colors[index % colors.length]} rounded h-8 flex items-center justify-center text-xs font-medium text-white transition-all cursor-pointer hover:opacity-80`}
                style={{ width: `${width}%` }}
                title={`${asset.type} - ${asset.duration}s`}
                onClick={() => {
                  // Calculate time for this asset
                  let time = 0
                  for (let i = 0; i < index; i++) {
                    time += assets[i].duration
                  }
                  onSeek(time)
                }}
              >
                {asset.type === 'text' ? 'T' : asset.type === 'image' ? 'I' : 'V'}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
