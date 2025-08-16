-- Fix calendar insertion and AI tracking issues

-- 1. Add AI plan tracking fields to lgb_sessions (if not already done)
ALTER TABLE lgb_sessions 
ADD COLUMN IF NOT EXISTS ai_plan_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_plan_generated_at TIMESTAMP NULL;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS lgb_sessions_ai_plan_idx ON lgb_sessions(user_id, ai_plan_generated);

-- 2. Check and fix challenge_calendar_items RLS policies
-- First, ensure the table exists with correct structure
CREATE TABLE IF NOT EXISTS challenge_calendar_items (
  item_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
  name text NOT NULL,
  scheduled_date timestamp NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp,
  reflection text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE challenge_calendar_items ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS policies to ensure they work correctly
DROP POLICY IF EXISTS "challenge_calendar_items_select_policy" ON challenge_calendar_items;
DROP POLICY IF EXISTS "challenge_calendar_items_insert_policy" ON challenge_calendar_items;
DROP POLICY IF EXISTS "challenge_calendar_items_update_policy" ON challenge_calendar_items;
DROP POLICY IF EXISTS "challenge_calendar_items_delete_policy" ON challenge_calendar_items;

-- Create comprehensive RLS policies
CREATE POLICY "challenge_calendar_items_select_policy" ON challenge_calendar_items
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "challenge_calendar_items_insert_policy" ON challenge_calendar_items
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "challenge_calendar_items_update_policy" ON challenge_calendar_items
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "challenge_calendar_items_delete_policy" ON challenge_calendar_items
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS challenge_calendar_items_user_date_idx ON challenge_calendar_items(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS challenge_calendar_items_user_completed_idx ON challenge_calendar_items(user_id, completed);

-- 3. Update existing Moving Assistant sessions to mark them as having AI plans if they exist
-- This is a one-time data migration for existing sessions
UPDATE lgb_sessions 
SET ai_plan_generated = TRUE, 
    ai_plan_generated_at = COALESCE(updated_at, created_at)
WHERE scenario = 'B' 
AND title IS NOT NULL 
AND title != ''
AND ai_plan_generated IS NOT TRUE;