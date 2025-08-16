-- Add index for better performance on challenge_calendar_items queries
CREATE INDEX IF NOT EXISTS "challenge_calendar_items_user_scheduled_idx" 
ON "challenge_calendar_items"("user_id", "scheduled_date", "completed");

-- Add partial index for incomplete items
CREATE INDEX IF NOT EXISTS "challenge_calendar_items_user_incomplete_idx" 
ON "challenge_calendar_items"("user_id", "scheduled_date") 
WHERE completed = false;
