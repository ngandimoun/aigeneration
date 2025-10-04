import { useState, useCallback, useRef } from 'react'
import type { 
  Artifact, 
  CreateArtifactRequest, 
  UpdateArtifactRequest, 
  ArtifactFilters,
  ArtifactResponse,
  SingleArtifactResponse,
  ToggleResponse
} from '@/lib/types/artifacts'

// Simple in-memory cache
const cache = new Map<string, { data: Artifact[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useArtifactsApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Clear cache function
  const clearCache = useCallback(() => {
    cache.clear()
  }, [])

  // Fetch artifacts with filters and caching
  const fetchArtifacts = useCallback(async (filters: ArtifactFilters = {}): Promise<Artifact[]> => {
    setLoading(true)
    setError(null)
    
    try {
      // Create cache key
      const cacheKey = JSON.stringify(filters)
      const cached = cache.get(cacheKey)
      
      // Check if we have valid cached data
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setLoading(false)
        return cached.data
      }
      
      const params = new URLSearchParams()
      // Removed type filter since artifacts table no longer has type field
      if (filters.status) params.append('status', filters.status)
      if (filters.is_pinned !== undefined) params.append('is_pinned', filters.is_pinned.toString())
      if (filters.is_favorite !== undefined) params.append('is_favorite', filters.is_favorite.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.offset) params.append('offset', filters.offset.toString())

      const response = await fetch(`/api/artifacts?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch artifacts')
      }

      const data: ArtifactResponse = await response.json()
      
      // Cache the results
      cache.set(cacheKey, { data: data.artifacts, timestamp: Date.now() })
      
      return data.artifacts
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Create new artifact (optimized for background saving)
  const createArtifact = useCallback(async (artifactData: CreateArtifactRequest): Promise<Artifact | null> => {
    console.log('🌐 createArtifact API call with:', artifactData)
    // Don't set loading state for background operations
    setError(null)
    
    try {
      const response = await fetch('/api/artifacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(artifactData),
      })

      console.log('📡 API response status:', response.status)
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API error:', errorData)
        throw new Error(errorData.error || 'Failed to create artifact')
      }

      const data: SingleArtifactResponse = await response.json()
      console.log('📦 API response data:', data)
      
      // Clear cache after successful creation (but don't block UI)
      setTimeout(() => clearCache(), 100)
      
      return data.artifact
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
  }, [clearCache])

  // Update artifact
  const updateArtifact = useCallback(async (id: string, updates: UpdateArtifactRequest): Promise<Artifact | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/artifacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update artifact')
      }

      const data: SingleArtifactResponse = await response.json()
      return data.artifact
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete artifact
  const deleteArtifact = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/artifacts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete artifact')
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Toggle pin status
  const togglePin = useCallback(async (id: string): Promise<boolean | null> => {
    setError(null)
    
    try {
      const response = await fetch(`/api/artifacts/${id}/pin`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to toggle pin')
      }

      const data: ToggleResponse = await response.json()
      return data.is_pinned!
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
  }, [])

  // Toggle favorite status
  const toggleFavorite = useCallback(async (id: string): Promise<boolean | null> => {
    setError(null)
    
    try {
      const response = await fetch(`/api/artifacts/${id}/favorite`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to toggle favorite')
      }

      const data: ToggleResponse = await response.json()
      return data.is_favorite!
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
  }, [])

  // Fetch generations for a specific artifact
  const fetchArtifactGenerations = useCallback(async (artifactId: string): Promise<{
    generations: Array<{
      comicTitle: string
      generations: Array<{
        id: string
        title: string
        description: string
        image: string
        type: string
        isPublic: boolean
        created_at: string
        comicTitle: string
        characterName: string
        characterDescription: string
        comicSettings: {
          inspirationStyle: string
          vibe: string
          type: string
        }
        generationTimestamp: string
        variationNumber: number
        isCharacterVariation: boolean
        autoSaved: boolean
        manualSave: boolean
      }>
      totalVariations: number
      latestGeneration: string
    }>
    totalGenerations: number
    totalProjects: number
  } | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/artifacts/${artifactId}/generations`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch artifact generations')
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    fetchArtifacts,
    createArtifact,
    updateArtifact,
    deleteArtifact,
    togglePin,
    toggleFavorite,
    fetchArtifactGenerations,
  }
}
