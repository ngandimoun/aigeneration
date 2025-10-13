import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { signedUrlCache } from '@/lib/cache/signed-url-cache'
import { metricsCollector } from '@/lib/cache/metrics'

// Cache for 30 seconds, allow stale for 60 seconds
export const revalidate = 30

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('content_type')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')
    const offset = (page - 1) * limit

    // Build the query for library items
    let query = supabase
      .from('library_items')
      .select(`
        id,
        content_type,
        content_id,
        date_added_to_library,
        created_at
      `)
      .eq('user_id', user.id)
      .order('date_added_to_library', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by content type if specified
    if (contentType) {
      query = query.eq('content_type', contentType)
    }

    // Filter by category if specified
    if (category) {
      const categoryMappings = {
        'visuals': ['comics', 'illustrations', 'avatars', 'product_mockups', 'concept_worlds', 'charts_infographics'],
        'audios': ['voice_creations', 'voiceovers', 'music_jingles', 'sound_fx'],
        'motions': ['explainers', 'ugc_ads', 'product_motion', 'cinematic_clips', 'social_cuts', 'talking_avatars'],
        'edit': ['subtitles', 'sound_to_video', 'watermarks', 'video_translations']
      }
      
      if (categoryMappings[category as keyof typeof categoryMappings]) {
        query = query.in('content_type', categoryMappings[category as keyof typeof categoryMappings])
      }
    }

    const { data: libraryItems, error } = await query

    if (error) {
      console.error('Error fetching library items:', error)
      return NextResponse.json({ error: 'Failed to fetch library items' }, { status: 500 })
    }

    if (!libraryItems || libraryItems.length === 0) {
      return NextResponse.json({
        libraryItems: [],
        categorizedItems: {
          visuals: [],
          audios: [],
          motions: [],
          edit: []
        },
        total: 0
      })
    }

    // Group library items by content_type for efficient batch queries
    const itemsByContentType = libraryItems.reduce((acc, item) => {
      if (!acc[item.content_type]) acc[item.content_type] = []
      acc[item.content_type].push(item)
      return acc
    }, {} as Record<string, typeof libraryItems>)

    // Fetch all content in batches (one query per content type)
    const contentPromises = Object.entries(itemsByContentType).map(async ([type, items]) => {
      const contentIds = items.map(item => item.content_id)
      const { data: contentData, error: contentError } = await supabase
        .from(type)
        .select('id, title, description, content, created_at, is_public')
        .in('id', contentIds)
        .eq('user_id', user.id)
      
      if (contentError) {
        console.warn(`Failed to fetch content for type ${type}:`, contentError)
        return { type, data: [] }
      }
      
      return { type, data: contentData || [] }
    })

    const contentResults = await Promise.all(contentPromises)
    
    // Create a map for O(1) content lookups
    const contentMap = new Map()
    contentResults.forEach(({ type, data }) => {
      data.forEach((content: any) => {
        contentMap.set(`${type}:${content.id}`, content)
      })
    })

    // Batch generate signed URLs for all content types
    const signedUrls = new Map()
    
    // Define content type to storage path mappings for signed URLs
    const storagePathMappings = {
      'explainers': { path: 'renders/explainers', extension: 'mp4' },
      'comics': { path: 'renders/comics', extension: 'png' },
      'product_mockups': { path: 'renders/product-mockups', extension: 'png' },
      'watermarks': { path: 'renders/watermarks', extension: 'mp4' },
      'subtitles': { path: 'renders/subtitles', extension: 'mp4' },
      'video_translations': { path: 'renders/translations', extension: 'mp4' }
    }

    // Group items by content type for signed URL generation
    const itemsForSignedUrls = new Map<string, typeof libraryItems>()
    for (const item of libraryItems) {
      if (!itemsForSignedUrls.has(item.content_type)) {
        itemsForSignedUrls.set(item.content_type, [])
      }
      itemsForSignedUrls.get(item.content_type)!.push(item)
    }

    // Generate signed URLs for each content type (with caching)
    let cacheHits = 0
    let cacheMisses = 0
    
    for (const [contentType, items] of itemsForSignedUrls) {
      const mapping = storagePathMappings[contentType as keyof typeof storagePathMappings]
      if (!mapping) continue

      try {
        // Check cache first, only generate URLs for cache misses
        const urlsToGenerate: Array<{ item: any; filePath: string }> = []
        
        for (const item of items) {
          const filePath = `${mapping.path}/${user.id}/${item.content_id}.${mapping.extension}`
          const cachedUrl = signedUrlCache.get(filePath)
          
          if (cachedUrl) {
            // Cache hit - use cached URL
            signedUrls.set(`${contentType}:${item.content_id}`, cachedUrl)
            cacheHits++
          } else {
            // Cache miss - need to generate
            urlsToGenerate.push({ item, filePath })
            cacheMisses++
          }
        }

        // Generate signed URLs only for cache misses in batches of 10
        if (urlsToGenerate.length > 0) {
          const batchSize = 10
          const batches = []
          for (let i = 0; i < urlsToGenerate.length; i += batchSize) {
            batches.push(urlsToGenerate.slice(i, i + batchSize))
          }

          const signedUrlPromises = batches.map(async (batch) => {
            const batchPromises = batch.map(async ({ item, filePath }) => {
              const { data: signedUrlData, error: urlError } = await supabase.storage
                .from('dreamcut')
                .createSignedUrl(filePath, 3600) // 1 hour expiry
              
              if (!urlError && signedUrlData?.signedUrl) {
                // Store in cache for future requests
                signedUrlCache.set(filePath, signedUrlData.signedUrl, 3600)
                return { contentId: item.content_id, signedUrl: signedUrlData.signedUrl }
              }
              return null
            })
            
            const results = await Promise.all(batchPromises)
            return results.filter(Boolean)
          })

          const signedUrlResults = await Promise.all(signedUrlPromises)
          signedUrlResults.flat().forEach((result) => {
            if (result && result.contentId && result.signedUrl) {
              signedUrls.set(`${contentType}:${result.contentId}`, result.signedUrl)
            }
          })
        }
      } catch (storageError) {
        console.warn(`Failed to generate signed URLs for ${contentType}:`, storageError)
      }
    }
    
    // Log cache performance
    console.log(`📊 Cache performance: ${cacheHits} hits, ${cacheMisses} misses, ${((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(1)}% hit rate`)

    // Transform library items with batched content
    const transformedItems = libraryItems.map((item) => {
      const content = contentMap.get(`${item.content_type}:${item.content_id}`)
      let image = '/placeholder.jpg'
      let video_url = ''
      
      if (content) {
        // Extract image from content
        if (content.content?.image) {
          image = content.content.image
        } else if (content.content?.images?.[0]) {
          image = content.content.images[0]
        }
        
        // Extract video_url for motion-type content
        if (content.content?.video_url) {
          video_url = content.content.video_url
        } else if (content.content?.output_video_url) {
          video_url = content.content.output_video_url
        } else if (content.content?.output_url) {
          video_url = content.content.output_url
        } else if (content.content?.video_path) {
          video_url = content.content.video_path
        }

        // Special handling for all content types - use batched signed URLs
        if (!video_url && !image.includes('placeholder')) {
          const signedUrl = signedUrls.get(`${item.content_type}:${item.content_id}`)
          if (signedUrl) {
            // Determine if this is a video or image based on content type
            const videoTypes = ['explainers', 'watermarks', 'subtitles', 'translations']
            if (videoTypes.includes(item.content_type)) {
              video_url = signedUrl
            } else {
              image = signedUrl
            }
          }
        }

        // Special handling for watermarks - extract output video URL
        if (item.content_type === 'watermarks') {
          if (content.output_video_url) {
            video_url = content.output_video_url
          } else if (content.video_url) {
            video_url = content.video_url
          }
        }
      }

      return {
        id: item.id,
        content_type: item.content_type,
        content_id: item.content_id,
        date_added_to_library: item.date_added_to_library,
        title: content?.title || 'Untitled',
        description: content?.description || '',
        image: image,
        video_url: video_url,
        is_public: content?.is_public || false,
        created_at: content?.created_at || item.created_at
      }
    })

    // Define category mappings for content organization
    const categoryMappings = {
      visuals: ['comics', 'illustrations', 'avatars', 'product_mockups', 'concept_worlds', 'charts_infographics'],
      audios: ['voice_creations', 'voiceovers', 'music_jingles', 'sound_fx'],
      motions: ['explainers', 'ugc_ads', 'product_motion', 'cinematic_clips', 'social_cuts', 'talking_avatars'],
      edit: ['subtitles', 'sound_to_video', 'watermarks', 'video_translations']
    }

    // Single pass transformation with categorization and filtering
    const categorizedItems: Record<string, typeof transformedItems> = {
      visuals: [],
      audios: [],
      motions: [],
      edit: []
    }
    const validItems: typeof transformedItems = []
    const validMotionItems: typeof transformedItems = []

    for (const item of transformedItems) {
      // Filter out items without valid content
      if (item.title === 'Untitled' || item.title === '') {
        continue
      }

      validItems.push(item)

      // Categorize items
      if (categoryMappings.visuals.includes(item.content_type)) {
        categorizedItems.visuals.push(item)
      } else if (categoryMappings.audios.includes(item.content_type)) {
        categorizedItems.audios.push(item)
      } else if (categoryMappings.motions.includes(item.content_type)) {
        // For motion category, include all items (video URL will be generated via signed URLs)
        categorizedItems.motions.push(item)
        validMotionItems.push(item)
      } else if (categoryMappings.edit.includes(item.content_type)) {
        categorizedItems.edit.push(item)
      }
    }

    // Use appropriate items based on category filter
    const responseItems = category === 'motions' ? validMotionItems : validItems

    // Get total count for pagination (without limit/offset)
    const { count: totalCount } = await supabase
      .from('library_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Record metrics
    const endTime = Date.now()
    const responseTime = endTime - startTime
    metricsCollector.recordResponseTime(responseTime)
    
    console.log(`⚡ Response time: ${responseTime}ms | Cache size: ${signedUrlCache.size()} | Hit rate: ${(signedUrlCache.getHitRate() * 100).toFixed(1)}%`)

    return NextResponse.json({
      libraryItems: responseItems,
      categorizedItems,
      total: totalCount || 0,
      page,
      limit,
      totalPages: Math.ceil((totalCount || 0) / limit),
      _metadata: {
        responseTime,
        cacheSize: signedUrlCache.size(),
        cacheHitRate: signedUrlCache.getHitRate()
      }
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
        'CDN-Cache-Control': 'max-age=30',
        'X-Response-Time': `${responseTime}ms`,
        'X-Cache-Size': signedUrlCache.size().toString(),
        'X-Cache-Hit-Rate': (signedUrlCache.getHitRate() * 100).toFixed(1)
      }
    })

  } catch (error) {
    console.error('Library API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const libraryItemId = searchParams.get('id')

    if (!libraryItemId) {
      return NextResponse.json({ error: 'Library item ID is required' }, { status: 400 })
    }

    // Delete from library_items table
    const { error } = await supabase
      .from('library_items')
      .delete()
      .eq('id', libraryItemId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting library item:', error)
      return NextResponse.json({ error: 'Failed to delete library item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Library DELETE API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
