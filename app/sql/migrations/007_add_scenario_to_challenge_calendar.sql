-- ======================================================================
-- Add scenario column to challenge_calendar_items table
-- ======================================================================

-- Add scenario column with default value 'C' for regular challenges
ALTER TABLE challenge_calendar_items 
ADD COLUMN IF NOT EXISTS scenario text CHECK (scenario IN ('A','B','C','D','E')) DEFAULT 'C';

-- Update existing moving tasks (those with emoji prefixes) to scenario 'B'
UPDATE challenge_calendar_items 
SET scenario = 'B' 
WHERE (name LIKE '📦%' OR name LIKE '⚡%') AND scenario IS NULL;

-- Update existing regular challenges to scenario 'C' if not already set
UPDATE challenge_calendar_items 
SET scenario = 'C' 
WHERE scenario IS NULL;

-- Add index for better performance when querying by scenario
CREATE INDEX IF NOT EXISTS challenge_calendar_items_scenario_idx 
  ON challenge_calendar_items(user_id, scenario);