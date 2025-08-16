-- Remove trade_method column from lgb_sessions table
-- since no current scenarios use this field

-- Drop the column if it exists
ALTER TABLE lgb_sessions DROP COLUMN IF EXISTS trade_method;