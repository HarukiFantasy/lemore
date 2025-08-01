-- Create challenge_calendar_items table
CREATE TABLE IF NOT EXISTS "challenge_calendar_items" (
  "item_id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user_id" uuid NOT NULL REFERENCES "user_profiles"("profile_id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "scheduled_date" timestamp NOT NULL,
  "completed" boolean NOT NULL DEFAULT false,
  "completed_at" timestamp,
  "reflection" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "challenge_calendar_items_user_date_idx" ON "challenge_calendar_items"("user_id", "scheduled_date");
CREATE INDEX IF NOT EXISTS "challenge_calendar_items_user_completed_idx" ON "challenge_calendar_items"("user_id", "completed");

-- Enable RLS
ALTER TABLE "challenge_calendar_items" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "challenge_calendar_items_select_policy" ON "challenge_calendar_items";
CREATE POLICY "challenge_calendar_items_select_policy" ON "challenge_calendar_items"
  FOR SELECT
  TO authenticated
  USING ("user_id" = auth.uid());

DROP POLICY IF EXISTS "challenge_calendar_items_insert_policy" ON "challenge_calendar_items";
CREATE POLICY "challenge_calendar_items_insert_policy" ON "challenge_calendar_items"
  FOR INSERT
  TO authenticated
  WITH CHECK ("user_id" = auth.uid());

DROP POLICY IF EXISTS "challenge_calendar_items_update_policy" ON "challenge_calendar_items";
CREATE POLICY "challenge_calendar_items_update_policy" ON "challenge_calendar_items"
  FOR UPDATE
  TO authenticated
  USING ("user_id" = auth.uid())
  WITH CHECK ("user_id" = auth.uid());

DROP POLICY IF EXISTS "challenge_calendar_items_delete_policy" ON "challenge_calendar_items";
CREATE POLICY "challenge_calendar_items_delete_policy" ON "challenge_calendar_items"
  FOR DELETE
  TO authenticated
  USING ("user_id" = auth.uid());