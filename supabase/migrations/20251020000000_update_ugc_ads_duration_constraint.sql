-- Enforce duration between 5 and 120 seconds
ALTER TABLE ugc_ads
  ADD CONSTRAINT ugc_ads_duration_range CHECK (duration BETWEEN 5 AND 120) NOT VALID;

-- Validate existing rows
ALTER TABLE ugc_ads VALIDATE CONSTRAINT ugc_ads_duration_range;

COMMENT ON COLUMN ugc_ads.duration IS 'Target duration in seconds (5–120).';



