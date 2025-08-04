-- Add the missing conversation insight columns to item_analyses table
ALTER TABLE item_analyses 
ADD COLUMN IF NOT EXISTS emotional_attachment_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS usage_pattern_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS decision_factor_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS personality_insights JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS decision_barriers JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Also fix recommendation_reason to match schema (NOT NULL with default)
ALTER TABLE item_analyses 
ALTER COLUMN recommendation_reason SET NOT NULL,
ALTER COLUMN recommendation_reason SET DEFAULT '';