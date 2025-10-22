-- Create diverse_motions table for Diverse Motion Studio
CREATE TABLE IF NOT EXISTS diverse_motions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Mode and Template
  mode TEXT CHECK (mode IN ('single', 'dual', 'multi')),
  template TEXT,
  custom_template TEXT,
  
  -- Product Description & Intent Capture
  product_category TEXT NOT NULL CHECK (product_category IN ('Data Visualizations', 'Infographic', 'Logo Animation', 'UI/UX Element', 'Cinematic Videos', 'Ads and UGC')),
  product_name TEXT,
  prompt TEXT NOT NULL,
  core_moment TEXT,
  emotional_tone TEXT,
  visual_style TEXT,
  duration INTEGER DEFAULT 8 CHECK (duration >= 5 AND duration <= 120),
  aspect_ratio TEXT CHECK (aspect_ratio IN ('9:16', '16:9', '1:1')) DEFAULT '16:9',
  
  -- Visual Context
  environment TEXT,
  custom_environment TEXT,
  lighting_mood TEXT,
  material_focus TEXT[],
  camera_type TEXT,
  frame_rate TEXT,
  
  -- Motion & Energy
  reveal_type TEXT,
  camera_energy INTEGER CHECK (camera_energy >= 0 AND camera_energy <= 100),
  loop_mode BOOLEAN DEFAULT FALSE,
  hook_intensity INTEGER CHECK (hook_intensity >= 0 AND hook_intensity <= 100),
  end_emotion INTEGER CHECK (end_emotion >= 0 AND end_emotion <= 100),
  
  -- Audio DNA
  sound_mode TEXT,
  sound_mood TEXT,
  key_effects TEXT[],
  mix_curve INTEGER CHECK (mix_curve >= 0 AND mix_curve <= 100),
  
  -- Brand Touch
  accent_color_sync BOOLEAN DEFAULT FALSE,
  accent_color TEXT,
  logo_moment TEXT CHECK (logo_moment IN ('Morph From Form', 'Fade-In', 'Hover', 'None')),
  text_constraint BOOLEAN DEFAULT FALSE,
  
  -- Category-specific fields
  chart_type TEXT,
  data_points TEXT,
  animation_style TEXT,
  color_scheme TEXT,
  
  -- Generation State
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'rejected')),
  fal_request_id TEXT,
  storage_path TEXT,
  generated_video_url TEXT,
  input_image_path TEXT,
  resolution TEXT DEFAULT '1080p' CHECK (resolution IN ('720p', '1080p')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  content JSONB DEFAULT '{}',
  
  -- Error handling
  error_message TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_diverse_motions_user_id ON diverse_motions(user_id);
CREATE INDEX IF NOT EXISTS idx_diverse_motions_status ON diverse_motions(status);
CREATE INDEX IF NOT EXISTS idx_diverse_motions_created_at ON diverse_motions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diverse_motions_product_category ON diverse_motions(product_category);

-- Enable Row Level Security
ALTER TABLE diverse_motions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own diverse motions" ON diverse_motions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diverse motions" ON diverse_motions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diverse motions" ON diverse_motions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diverse motions" ON diverse_motions
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_diverse_motions_updated_at
  BEFORE UPDATE ON diverse_motions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE diverse_motions IS 'Stores diverse motion video generation requests and results';
COMMENT ON COLUMN diverse_motions.mode IS 'Generation mode: single, dual, or multi';
COMMENT ON COLUMN diverse_motions.product_category IS 'Type of content being animated';
COMMENT ON COLUMN diverse_motions.prompt IS 'User-provided prompt for animation';
COMMENT ON COLUMN diverse_motions.fal_request_id IS 'fal.ai request ID for tracking';
COMMENT ON COLUMN diverse_motions.storage_path IS 'Path to generated video in Supabase storage';
COMMENT ON COLUMN diverse_motions.generated_video_url IS 'Signed URL to generated video';
COMMENT ON COLUMN diverse_motions.input_image_path IS 'Path to input image in Supabase storage';
COMMENT ON COLUMN diverse_motions.metadata IS 'Additional metadata about the generation';
COMMENT ON COLUMN diverse_motions.content IS 'Structured content data for the motion';
