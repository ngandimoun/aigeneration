-- Create bug_reports table for tracking Manim rendering failures
CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL DEFAULT 'manim_render_failure',
  user_prompt TEXT NOT NULL,
  generated_code TEXT NOT NULL,
  technical_error TEXT NOT NULL,
  error_category TEXT NOT NULL,
  error_severity TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bug_category ON bug_reports(error_category);
CREATE INDEX IF NOT EXISTS idx_bug_severity ON bug_reports(error_severity);
CREATE INDEX IF NOT EXISTS idx_bug_created ON bug_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_resolved ON bug_reports(resolved);
CREATE INDEX IF NOT EXISTS idx_bug_user ON bug_reports(user_id);

-- Enable Row Level Security
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bug reports
CREATE POLICY "Users can view own bug reports"
  ON bug_reports FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert bug reports (service role)
CREATE POLICY "System can insert bug reports"
  ON bug_reports FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can view all bug reports (optional - add specific admin check)
-- CREATE POLICY "Admins can view all bug reports"
--   ON bug_reports FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid()
--       AND role = 'admin'
--     )
--   );

-- Add comment for documentation
COMMENT ON TABLE bug_reports IS 'Stores Manim rendering failures for analysis and system improvement';
COMMENT ON COLUMN bug_reports.user_prompt IS 'Original user prompt that led to the error';
COMMENT ON COLUMN bug_reports.generated_code IS 'AI-generated Manim code that failed';
COMMENT ON COLUMN bug_reports.technical_error IS 'Technical error message from Manim';
COMMENT ON COLUMN bug_reports.error_category IS 'Category: math, text, animation, api, timeout, memory';
COMMENT ON COLUMN bug_reports.error_severity IS 'Severity: critical, warning, info';
COMMENT ON COLUMN bug_reports.metadata IS 'Additional context: duration, style, resolution, etc.';

