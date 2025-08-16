-- Add AI plan tracking to lgb_sessions table
ALTER TABLE lgb_sessions 
ADD COLUMN IF NOT EXISTS ai_plan_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_plan_generated_at TIMESTAMP NULL;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS lgb_sessions_ai_plan_idx ON lgb_sessions(user_id, ai_plan_generated);

-- Update existing Moving Assistant sessions to mark them as having AI plans if they exist
-- This is a one-time data migration for existing sessions
UPDATE lgb_sessions 
SET ai_plan_generated = TRUE, 
    ai_plan_generated_at = updated_at
WHERE scenario = 'B' 
AND title IS NOT NULL 
AND title != '';