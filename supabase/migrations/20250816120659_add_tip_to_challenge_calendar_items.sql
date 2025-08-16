-- Add tip column to challenge_calendar_items table
ALTER TABLE "challenge_calendar_items" 
ADD COLUMN IF NOT EXISTS "tip" text;

-- Add comment to describe the column
COMMENT ON COLUMN "challenge_calendar_items"."tip" IS 'Optional tip or advice related to the task';