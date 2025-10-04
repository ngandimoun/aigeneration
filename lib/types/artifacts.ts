export interface Artifact {
  id: string
  user_id: string
  title: string
  description?: string
  content?: Record<string, any>
  metadata?: Record<string, any>
  status: 'draft' | 'processing' | 'completed' | 'failed'
  is_public: boolean
  is_default: boolean
  is_pinned: boolean
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export type ArtifactType = 
  | 'comic'
  | 'illustration' 
  | 'avatar'
  | 'product_mockup'
  | 'concept_world'
  | 'chart_infographic'
  | 'cinematic_clip'
  | 'explainer'
  | 'product_motion'
  | 'social_cut'
  | 'talking_avatar'
  | 'ugc_ad'
  | 'template'

export interface CreateArtifactRequest {
  title: string
  description?: string
  content?: Record<string, any>
  metadata?: Record<string, any>
  is_public?: boolean
  is_default?: boolean
}

export interface UpdateArtifactRequest {
  title?: string
  description?: string
  content?: Record<string, any>
  metadata?: Record<string, any>
  status?: 'draft' | 'processing' | 'completed' | 'failed'
  is_public?: boolean
  is_pinned?: boolean
  is_favorite?: boolean
}

export interface ArtifactFilters {
  status?: 'draft' | 'processing' | 'completed' | 'failed'
  is_pinned?: boolean
  is_favorite?: boolean
  limit?: number
  offset?: number
}

export interface ArtifactResponse {
  artifacts: Artifact[]
}

export interface SingleArtifactResponse {
  artifact: Artifact
}

export interface ToggleResponse {
  is_pinned?: boolean
  is_favorite?: boolean
}


