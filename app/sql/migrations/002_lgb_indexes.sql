-- ======================================================================
-- INDEXES for Performance
-- ======================================================================

-- Session indexes
CREATE INDEX IF NOT EXISTS idx_lgb_sessions_user_status 
  ON lgb_sessions (user_id, status);

CREATE INDEX IF NOT EXISTS lgb_sessions_ai_plan_idx 
  ON lgb_sessions(user_id, ai_plan_generated);

-- Item indexes
CREATE INDEX IF NOT EXISTS idx_lgb_items_session_created 
  ON lgb_items (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lgb_items_decision 
  ON lgb_items (decision);

CREATE INDEX IF NOT EXISTS idx_lgb_items_session_created_id 
  ON lgb_items (session_id, created_at DESC, item_id);

-- Listing indexes
CREATE INDEX IF NOT EXISTS idx_lgb_listings_item_lang 
  ON lgb_listings (item_id, lang);

-- Challenge calendar indexes
CREATE INDEX IF NOT EXISTS challenge_calendar_items_user_date_idx 
  ON challenge_calendar_items(user_id, scheduled_date);

CREATE INDEX IF NOT EXISTS challenge_calendar_items_user_completed_idx 
  ON challenge_calendar_items(user_id, completed);

-- Optimized indexes for challenge queries
CREATE INDEX IF NOT EXISTS challenge_calendar_items_user_scheduled_idx 
  ON challenge_calendar_items(user_id, scheduled_date, completed);

-- Partial index for incomplete items (better performance)
CREATE INDEX IF NOT EXISTS challenge_calendar_items_user_incomplete_idx 
  ON challenge_calendar_items(user_id, scheduled_date) 
  WHERE completed = false;