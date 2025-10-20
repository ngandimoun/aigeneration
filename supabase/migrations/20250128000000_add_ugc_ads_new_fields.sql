-- Add aspect ratio field
ALTER TABLE ugc_ads 
ADD COLUMN IF NOT EXISTS aspect_ratio text CHECK (aspect_ratio IN ('9:16', '16:9', '1:1')) DEFAULT '16:9';

-- Add duration field
ALTER TABLE ugc_ads 
ADD COLUMN IF NOT EXISTS duration integer DEFAULT 30;

-- Add mode and template fields
ALTER TABLE ugc_ads 
ADD COLUMN IF NOT EXISTS mode text CHECK (mode IN ('single', 'dual', 'multi'));
ALTER TABLE ugc_ads 
ADD COLUMN IF NOT EXISTS template text;

-- Add single mode specific fields
ALTER TABLE ugc_ads 
ADD COLUMN IF NOT EXISTS contains_both boolean DEFAULT false;
ALTER TABLE ugc_ads 
ADD COLUMN IF NOT EXISTS image_description text;

-- Add character fields
ALTER TABLE ugc_ads 
ADD COLUMN IF NOT EXISTS character_presence text CHECK (character_presence IN ('voiceover', 'show', 'partial'));
ALTER TABLE ugc_ads 
ADD COLUMN IF NOT EXISTS character_source text CHECK (character_source IN ('library', 'upload', 'describe'));
ALTER TABLE ugc_ads 
ADD COLUMN IF NOT EXISTS selected_avatar_id uuid REFERENCES avatars_personas(id);
ALTER TABLE ugc_ads 
ADD COLUMN IF NOT EXISTS partial_type text;

-- Add JSON fields for structured data
ALTER TABLE ugc_ads 
ADD COLUMN IF NOT EXISTS character_descriptions jsonb;
ALTER TABLE ugc_ads 
ADD COLUMN IF NOT EXISTS partial_character jsonb;
ALTER TABLE ugc_ads 
ADD COLUMN IF NOT EXISTS dialog_lines jsonb;

-- Add dual mode fields
ALTER TABLE ugc_ads 
ADD COLUMN IF NOT EXISTS two_image_mode text;
ALTER TABLE ugc_ads 
ADD COLUMN IF NOT EXISTS scene_scripts jsonb;

-- Add multi mode fields
ALTER TABLE ugc_ads 
ADD COLUMN IF NOT EXISTS scene_description text;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ugc_ads_mode ON ugc_ads(mode);
CREATE INDEX IF NOT EXISTS idx_ugc_ads_aspect_ratio ON ugc_ads(aspect_ratio);
CREATE INDEX IF NOT EXISTS idx_ugc_ads_character_presence ON ugc_ads(character_presence);

-- Add comment for documentation
COMMENT ON COLUMN ugc_ads.aspect_ratio IS 'Video aspect ratio: 9:16 (vertical), 16:9 (horizontal), 1:1 (square with outpainting)';
COMMENT ON COLUMN ugc_ads.character_descriptions IS 'Structured character design data for single mode (array of character objects)';
COMMENT ON COLUMN ugc_ads.partial_character IS 'Structured partial character data for single mode';
COMMENT ON COLUMN ugc_ads.dialog_lines IS 'Turn-by-turn conversation data for multi-character scenarios';

