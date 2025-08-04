-- Remove unused columns from item_analyses table
ALTER TABLE item_analyses 
DROP COLUMN IF EXISTS original_price,
DROP COLUMN IF EXISTS current_value,
DROP COLUMN IF EXISTS ai_listing_price,
DROP COLUMN IF EXISTS maintenance_cost,
DROP COLUMN IF EXISTS space_value,
DROP COLUMN IF EXISTS ai_suggestion,
DROP COLUMN IF EXISTS environmental_impact,
DROP COLUMN IF EXISTS co2_impact,
DROP COLUMN IF EXISTS landfill_impact,
DROP COLUMN IF EXISTS is_recyclable;

-- Remove unused enum type
DROP TYPE IF EXISTS environmental_impact_level;