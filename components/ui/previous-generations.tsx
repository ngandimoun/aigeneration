"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Trash2, 
  Eye,
  Calendar,
  Tag,
  RefreshCw,
  Grid3x3,
  ExternalLink,
  Play,
  Volume2,
  Image as ImageIcon,
  Loader2
} from "lucide-react"
import { getContentTypeInfo, getContentTypeDisplayName, getContentTypeApiRoute, isVideoContentType, isAudioContentType, isImageContentType } from "@/lib/types/content-types"
import { useToast } from "@/hooks/use-toast"

interface PreviousGenerationsProps {
  contentType: string
  userId: string
  className?: string
}

export function PreviousGenerations({ contentType, userId, className = "" }: PreviousGenerationsProps) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const { toast } = useToast()

  const contentInfo = getContentTypeInfo(contentType)
  const displayName = getContentTypeDisplayName(contentType)
  const apiRoute = getContentTypeApiRoute(contentType)

  const fetchItems = async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError("")
      console.log(`📚 PreviousGenerations: Fetching ${contentType} from ${apiRoute}`)

      // Fetch from section-specific API route
      const response = await fetch(apiRoute)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from ${apiRoute}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Extract the array from the wrapped response
      // API routes return data wrapped in objects with keys like {watermarks: [...], illustrations: [...]}
      const getResponseKey = (contentType: string): string => {
        // Map content types to their API response keys
        const keyMap: Record<string, string> = {
          'watermarks': 'watermarks',
          'video_translations': 'videoTranslations', 
          'subtitles': 'subtitles',
          'illustrations': 'illustrations',
          'explainers': 'explainers',
          'avatars_personas': 'avatars',
          'product_mockups': 'productMockups',
          'concept_worlds': 'conceptWorlds',
          'charts_infographics': 'chartsInfographics',
          'voices_creations': 'voices',
          'voiceovers': 'voiceovers',
          'music_jingles': 'musicJingles',
          'sound_fx': 'soundFx',
          'ugc_ads': 'ugcAds',
          'product_motions': 'productMotions',
          'talking_avatars': 'talkingAvatars',
          'cinematic_clips': 'cinematicClips',
          'social_cuts': 'socialCuts'
        }
        return keyMap[contentType] || contentType
      }
      
      const responseKey = getResponseKey(contentType)
      const items = data[responseKey] || data || []
      
      console.log(`📚 PreviousGenerations: Found ${items?.length || 0} items from ${apiRoute} (key: ${responseKey})`)
      if (items && items.length > 0) {
        console.log(`📊 Sample item data for ${contentType}:`, items[0])
        console.log(`🖼️ Generated images for ${contentType}:`, items[0].generated_images)
        console.log(`📁 Storage paths for ${contentType}:`, items[0].storage_paths)
      }

      setItems(items)
    } catch (error) {
      console.error(`Error fetching ${contentType} from ${apiRoute}:`, error)
      setError(error instanceof Error ? error.message : 'Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [userId, contentType, apiRoute])

  // Delete item
  const deleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`${apiRoute}/${itemId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.statusText}`)
      }

      toast({
        title: "Item deleted",
        description: "Item has been removed successfully.",
      })

      // Refresh the list
      fetchItems()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Get media icon based on content type
  const getMediaIcon = (item: any) => {
    const videoUrl = item.video_url || item.media_url || item.url
    const audioUrl = item.audio_url || item.media_url || item.url
    const imageUrl = item.image_url || item.image || item.media_url || item.url

    if (isVideoContentType(contentType) && videoUrl) {
      return <Play className="h-4 w-4" />
    } else if (isAudioContentType(contentType) && audioUrl) {
      return <Volume2 className="h-4 w-4" />
    } else if (isImageContentType(contentType) && imageUrl) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <Eye className="h-4 w-4" />
  }

  // Render media preview
  const renderMediaPreview = (item: any) => {
    // API routes return different field names, so we need to check multiple possibilities
    let videoUrl = item.video_url || item.media_url || item.url
    let audioUrl = item.audio_url || item.media_url || item.url
    let imageUrl = item.image_url || item.image || item.media_url || item.url
    
    // Handle different content types with their specific image fields
    if (contentType === 'product_mockups' || contentType === 'illustrations' || contentType === 'avatars_personas' || contentType === 'concept_worlds' || contentType === 'charts_infographics') {
      // Visual content types that use generated_images and storage_paths
      console.log(`🔍 Processing ${contentType} item:`, {
        id: item.id,
        title: item.title,
        status: item.status,
        hasGeneratedImages: !!item.generated_images,
        generatedImagesLength: item.generated_images?.length || 0,
        generatedImages: item.generated_images,
        hasStoragePaths: !!item.storage_paths,
        storagePathsLength: item.storage_paths?.length || 0,
        storagePaths: item.storage_paths
      })
      
      if (item.generated_images && item.generated_images.length > 0) {
        imageUrl = item.generated_images[0]
        console.log(`🖼️ Using generated image for ${contentType}:`, imageUrl)
      } else if (item.storage_paths && item.storage_paths.length > 0) {
        // For storage paths, we need to construct the Supabase URL
        imageUrl = `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/dreamcut/${item.storage_paths[0]}`
        console.log(`🖼️ Using storage path for ${contentType}:`, imageUrl)
      } else {
        // No images generated - this will show the placeholder with status message
        console.log(`⚠️ No images found for ${contentType} (status: ${item.status})`)
      }
    } else if (contentType === 'explainers' || contentType === 'ugc_ads' || contentType === 'product_motions' || contentType === 'talking_avatars') {
      // Motion content types that use video URLs
      if (item.output_url || item.output_video_url || item.generated_video_url) {
        videoUrl = item.output_url || item.output_video_url || item.generated_video_url
        console.log(`🎥 Using video URL for ${contentType}:`, videoUrl)
      } else {
        console.log(`⚠️ No video found for ${contentType} (status: ${item.status})`)
      }
    } else if (contentType === 'voice_creations' || contentType === 'voiceovers' || contentType === 'music_jingles' || contentType === 'sound_fx') {
      // Audio content types that use audio URLs
      if (item.generated_audio_path || item.audio_url || item.storage_path) {
        audioUrl = item.generated_audio_path || item.audio_url || item.storage_path
        console.log(`🎵 Using audio URL for ${contentType}:`, audioUrl)
      } else {
        console.log(`⚠️ No audio found for ${contentType} (status: ${item.status})`)
      }
    } else if (contentType === 'subtitles' || contentType === 'watermarks' || contentType === 'video_translations') {
      // Edit/utility content types
      if (item.output_video_url || item.translated_video_url || item.video_url) {
        videoUrl = item.output_video_url || item.translated_video_url || item.video_url
        console.log(`🎬 Using video URL for ${contentType}:`, videoUrl)
      } else {
        console.log(`⚠️ No video found for ${contentType} (status: ${item.status})`)
      }
    }
    
    // Fallback: For any content type, check generated_images if no specific URL found
    if (!imageUrl && !videoUrl && !audioUrl && item.generated_images && item.generated_images.length > 0) {
      imageUrl = item.generated_images[0]
      console.log(`🖼️ Fallback: Using generated image for ${contentType}:`, imageUrl)
    }

    if (isVideoContentType(contentType) && videoUrl) {
      return (
        <video
          src={videoUrl}
          className="w-full h-32 object-cover rounded-t-lg"
          poster="/placeholder.jpg"
          muted
        >
          Your browser does not support the video tag.
        </video>
      )
    } else if (isAudioContentType(contentType) && audioUrl) {
      return (
        <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
          <Volume2 className="h-8 w-8 text-white" />
        </div>
      )
    } else if (isImageContentType(contentType) && imageUrl) {
      console.log(`🖼️ Rendering image for ${contentType}:`, imageUrl)
      return (
        <img
          src={imageUrl}
          alt={item.title || 'Generated content'}
          className="w-full h-32 object-cover rounded-t-lg"
          onLoad={() => console.log(`✅ Image loaded successfully for ${contentType}`)}
          onError={(e) => console.error(`❌ Image failed to load for ${contentType}:`, e)}
        />
      )
    } else {
      // Show different placeholder based on status
      const isFailed = item.status === 'failed'
      const isCompleted = item.status === 'completed'
      
      return (
        <div className={`w-full h-32 rounded-t-lg flex flex-col items-center justify-center ${
          isFailed 
            ? 'bg-gradient-to-br from-red-100 to-red-200' 
            : isCompleted 
            ? 'bg-gradient-to-br from-yellow-100 to-yellow-200'
            : 'bg-gradient-to-br from-gray-200 to-gray-300'
        }`}>
          <Grid3x3 className={`h-6 w-6 mb-1 ${
            isFailed ? 'text-red-500' : isCompleted ? 'text-yellow-600' : 'text-gray-500'
          }`} />
          <span className={`text-xs font-medium ${
            isFailed ? 'text-red-600' : isCompleted ? 'text-yellow-700' : 'text-gray-600'
          }`}>
            {isFailed ? 'Generation Failed' : isCompleted ? 'No Images Generated' : 'Processing...'}
          </span>
        </div>
      )
    }
  }

  // Get title and description based on content type
  const getItemTitle = (item: any) => {
    switch (contentType) {
      case 'ugc_ads':
        return item.brand_name || 'Untitled Ad'
      case 'product_motions':
        return item.product_name || item.product_category || 'Untitled Motion'
      case 'sound_fx':
        return item.name || 'Untitled Sound'
      case 'voice_creations':
        return item.voice_name || 'Untitled Voice'
      case 'voiceovers':
        return item.script || 'Untitled Voiceover'
      case 'music_jingles':
        return item.jingle_name || 'Untitled Jingle'
      case 'talking_avatars':
        return item.avatar_name || 'Untitled Avatar'
      case 'watermarks':
        return item.watermark_text || 'Untitled Watermark'
      case 'subtitles':
        return item.subtitle_text || 'Untitled Subtitle'
      case 'video_translations':
        return item.target_language || 'Untitled Translation'
      default:
        return item.title || 'Untitled'
    }
  }

  const getItemDescription = (item: any) => {
    switch (contentType) {
      case 'ugc_ads':
        return item.brand_prompt || ''
      case 'product_motions':
        return item.prompt || ''
      case 'sound_fx':
        return item.prompt || ''
      case 'explainers':
      case 'illustrations':
      case 'product_mockups':
      case 'avatars_personas':
      case 'concept_worlds':
      case 'charts_infographics':
        return item.prompt || ''
      case 'voice_creations':
        return item.voice_description || ''
      case 'voiceovers':
        return item.script || ''
      case 'music_jingles':
        return item.jingle_description || ''
      case 'talking_avatars':
        return item.avatar_description || ''
      case 'watermarks':
        return item.watermark_text || ''
      case 'subtitles':
        return item.subtitle_text || ''
      case 'video_translations':
        return item.source_language || ''
      default:
        return item.description || ''
    }
  }

  if (!userId) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Previous {displayName}</h3>
          {items.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {items.length} items
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchItems}
          title="Refresh previous generations"
          className="h-8 w-8 p-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading previous generations...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-sm text-destructive mb-2">Failed to load previous generations</p>
            <Button onClick={fetchItems} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <Grid3x3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h4 className="text-sm font-medium mb-1">No previous generations</h4>
          <p className="text-xs text-muted-foreground">
            Start creating {displayName.toLowerCase()} to see them appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow relative">
                <div className="relative">
                  {renderMediaPreview(item)}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {displayName}
                    </Badge>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm line-clamp-1">{getItemTitle(item)}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {getItemDescription(item) || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      {getMediaIcon(item)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View in Library Link */}
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Navigate to library with this content type filter
                window.location.href = `/library?content_type=${contentType}`
              }}
              className="text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View all in Library
            </Button>
          </div>
        </>
      )}
    </div>
  )
}