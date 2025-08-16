-- ======================================================================
-- Extend lgb_items table to support calendar functionality
-- Unify Moving Assistant tasks and regular items in single table
-- ======================================================================

-- Add calendar-specific fields to lgb_items table
ALTER TABLE lgb_items ADD COLUMN IF NOT EXISTS scheduled_date timestamp;
ALTER TABLE lgb_items ADD COLUMN IF NOT EXISTS completed boolean DEFAULT false;
ALTER TABLE lgb_items ADD COLUMN IF NOT EXISTS completed_at timestamp;
ALTER TABLE lgb_items ADD COLUMN IF NOT EXISTS reflection text;
ALTER TABLE lgb_items ADD COLUMN IF NOT EXISTS tip text;

-- Add index for calendar queries
CREATE INDEX IF NOT EXISTS lgb_items_scheduled_date_idx 
  ON lgb_items(session_id, scheduled_date) 
  WHERE scheduled_date IS NOT NULL;

-- Add index for completed tasks
CREATE INDEX IF NOT EXISTS lgb_items_completed_idx 
  ON lgb_items(session_id, completed) 
  WHERE scheduled_date IS NOT NULL;

-- ======================================================================
-- Update the session counter trigger to handle Moving Assistant completion
-- ======================================================================

CREATE OR REPLACE FUNCTION update_session_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    -- Determine which session to update
    DECLARE
      target_session_id uuid;
      session_scenario text;
    BEGIN
      IF TG_OP = 'DELETE' THEN
        target_session_id := OLD.session_id;
      ELSE
        target_session_id := NEW.session_id;
      END IF;

      -- Get session scenario to determine counting logic
      SELECT scenario INTO session_scenario 
      FROM lgb_sessions 
      WHERE session_id = target_session_id;

      -- Update counters based on scenario type
      IF session_scenario = 'B' THEN
        -- Moving Assistant: count tasks and completed tasks
        UPDATE lgb_sessions SET
          item_count = (
            SELECT count(*) FROM lgb_items
            WHERE session_id = target_session_id 
              AND scheduled_date IS NOT NULL
          ),
          decided_count = (
            SELECT count(*) FROM lgb_items
            WHERE session_id = target_session_id 
              AND scheduled_date IS NOT NULL 
              AND completed = true
          ),
          expected_revenue = 0, -- Moving Assistant doesn't track revenue
          updated_at = now()
        WHERE session_id = target_session_id;
      ELSE
        -- Other scenarios: count items and decisions
        UPDATE lgb_sessions SET
          item_count = (
            SELECT count(*) FROM lgb_items
            WHERE session_id = target_session_id 
              AND scheduled_date IS NULL
          ),
          decided_count = (
            SELECT count(*) FROM lgb_items
            WHERE session_id = target_session_id 
              AND scheduled_date IS NULL 
              AND decision IS NOT NULL
          ),
          expected_revenue = (
            SELECT coalesce(sum(price_mid), 0) FROM lgb_items
            WHERE session_id = target_session_id 
              AND scheduled_date IS NULL 
              AND decision = 'sell'
          ),
          updated_at = now()
        WHERE session_id = target_session_id;
      END IF;
    END;
  END IF;

  RETURN coalesce(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================================================
-- Create views for easier querying
-- ======================================================================

-- View for Moving Assistant calendar items
CREATE OR REPLACE VIEW moving_calendar_items AS
SELECT 
  item_id,
  session_id,
  title as name,
  scheduled_date,
  completed,
  completed_at,
  reflection,
  tip,
  created_at,
  updated_at
FROM lgb_items 
WHERE scheduled_date IS NOT NULL
ORDER BY scheduled_date;

-- View for regular decluttering items
CREATE OR REPLACE VIEW declutter_items AS
SELECT 
  item_id,
  session_id,
  title,
  notes,
  category,
  condition,
  decision,
  decision_reason,
  price_low,
  price_mid,
  price_high,
  price_confidence,
  usage_score,
  sentiment,
  ai_recommendation,
  ai_rationale,
  created_at,
  updated_at
FROM lgb_items 
WHERE scheduled_date IS NULL
ORDER BY created_at DESC;