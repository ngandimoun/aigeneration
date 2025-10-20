-- Create ugc_ads table (base schema)
-- This migration must run before 20250128000000_add_ugc_ads_new_fields.sql

CREATE TABLE IF NOT EXISTS ugc_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Brand DNA
  brand_name TEXT,
  brand_prompt TEXT,
  brand_tone TEXT,
  brand_color_code TEXT,
  brand_logo_path TEXT,

  -- Product Essence
  product_name TEXT,
  product_hero_benefit TEXT,
  product_visual_focus TEXT,
  product_environment TEXT,
  product_materials TEXT[],
  product_transformation_type TEXT,

  -- Story DNA
  story_core_angle TEXT,
  story_persona TEXT,
  story_emotion_tone INTEGER,
  story_pattern_interrupt_type TEXT,
  story_hook_framework TEXT,

  -- Dialogue DNA
  dialogue_voice_type TEXT,
  dialogue_script TEXT,
  dialogue_tone_of_voice TEXT,
  dialogue_language TEXT,
  dialogue_voice_asset_source TEXT,

  -- Camera DNA
  camera_rhythm TEXT,
  camera_movement_style TEXT,
  camera_cut_frequency TEXT,
  camera_ending_type TEXT,

  -- Audio DNA
  audio_sound_mode TEXT,
  audio_sound_emotion TEXT,
  audio_key_sounds TEXT[],

  -- Product Source & Assets
  use_custom_product BOOLEAN DEFAULT FALSE,
  selected_product_id UUID,
  custom_product_image_path TEXT,
  product_image_path TEXT,
  character_image_path TEXT,

  -- Generation State
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('queued','processing','completed','failed')),
  error_message TEXT,
  generated_video_url TEXT,
  storage_path TEXT,
  generated_json JSONB,

  -- New fields (aligned with follow-up ALTER migration)
  aspect_ratio TEXT DEFAULT '16:9' CHECK (aspect_ratio IN ('9:16','16:9','1:1')),
  duration INTEGER DEFAULT 30,
  mode TEXT CHECK (mode IN ('single','dual','multi')),
  template TEXT,

  -- Single mode
  contains_both BOOLEAN DEFAULT FALSE,
  image_description TEXT,

  -- Character fields
  character_presence TEXT CHECK (character_presence IN ('voiceover','show','partial')),
  character_source TEXT CHECK (character_source IN ('library','upload','describe')),
  selected_avatar_id UUID REFERENCES avatars_personas(id),
  partial_type TEXT,
  character_descriptions JSONB,
  partial_character JSONB,
  dialog_lines JSONB,

  -- Dual/Multi mode fields
  two_image_mode TEXT,
  scene_scripts JSONB,
  scene_description TEXT,

  -- Metadata & Content
  metadata JSONB,
  content JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_ugc_ads_user_id ON ugc_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ugc_ads_created_at ON ugc_ads(created_at);
CREATE INDEX IF NOT EXISTS idx_ugc_ads_mode ON ugc_ads(mode);
CREATE INDEX IF NOT EXISTS idx_ugc_ads_aspect_ratio ON ugc_ads(aspect_ratio);
CREATE INDEX IF NOT EXISTS idx_ugc_ads_character_presence ON ugc_ads(character_presence);


