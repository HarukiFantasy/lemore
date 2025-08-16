-- ======================================================================
-- VIEWS for Let Go Buddy
-- ======================================================================

-- Items with photos view
CREATE OR REPLACE VIEW lgb_items_with_photos AS
SELECT 
  i.*,
  COALESCE(
    array_agg(
      CASE 
        WHEN p.photo_id IS NOT NULL 
        THEN p.storage_path 
        ELSE NULL 
      END
    ) FILTER (WHERE p.photo_id IS NOT NULL),
    '{}'::text[]
  ) AS photos
FROM lgb_items i
LEFT JOIN lgb_item_photos p ON i.item_id = p.item_id
GROUP BY i.item_id;

-- Session summary view
CREATE OR REPLACE VIEW lgb_session_summary AS
SELECT 
  s.*,
  COALESCE(stats.total_items, 0) as actual_item_count,
  COALESCE(stats.decided_items, 0) as actual_decided_count,
  COALESCE(stats.revenue, 0) as actual_expected_revenue,
  COALESCE(stats.keep_count, 0) as keep_count,
  COALESCE(stats.sell_count, 0) as sell_count,
  COALESCE(stats.donate_count, 0) as donate_count,
  COALESCE(stats.dispose_count, 0) as dispose_count
FROM lgb_sessions s
LEFT JOIN (
  SELECT 
    session_id,
    count(*) as total_items,
    count(*) FILTER (WHERE decision IS NOT NULL) as decided_items,
    sum(price_mid) FILTER (WHERE decision = 'sell') as revenue,
    count(*) FILTER (WHERE decision = 'keep') as keep_count,
    count(*) FILTER (WHERE decision = 'sell') as sell_count,
    count(*) FILTER (WHERE decision = 'donate') as donate_count,
    count(*) FILTER (WHERE decision = 'dispose') as dispose_count
  FROM lgb_items
  GROUP BY session_id
) stats ON s.session_id = stats.session_id;

-- Items with session info view
CREATE OR REPLACE VIEW lgb_items_with_session AS
SELECT 
  i.*,
  s.user_id,
  s.scenario,
  s.title as session_title,
  s.status as session_status,
  COALESCE(
    array_agg(
      CASE 
        WHEN p.photo_id IS NOT NULL 
        THEN p.storage_path 
        ELSE NULL 
      END
    ) FILTER (WHERE p.photo_id IS NOT NULL),
    '{}'::text[]
  ) AS photos
FROM lgb_items i
LEFT JOIN lgb_sessions s ON i.session_id = s.session_id
LEFT JOIN lgb_item_photos p ON i.item_id = p.item_id
GROUP BY i.item_id, s.user_id, s.scenario, s.title, s.status;

-- Challenge stats view
CREATE OR REPLACE VIEW challenge_stats AS
SELECT 
  user_id,
  count(*) as total_challenges,
  count(*) FILTER (WHERE completed = true) as completed_challenges,
  count(*) FILTER (WHERE completed = false AND scheduled_date < now()) as overdue_challenges,
  count(*) FILTER (WHERE completed = false AND scheduled_date::date = current_date) as today_challenges,
  max(completed_at) as last_completed_at,
  -- Streak calculation
  CASE 
    WHEN count(*) FILTER (WHERE completed = true AND completed_at::date = current_date - interval '1 day') > 0 
    THEN 1 + (
      SELECT count(*)
      FROM challenge_calendar_items c2 
      WHERE c2.user_id = challenge_calendar_items.user_id 
        AND c2.completed = true 
        AND c2.completed_at::date < current_date
        AND NOT EXISTS (
          SELECT 1 
          FROM challenge_calendar_items c3 
          WHERE c3.user_id = c2.user_id 
            AND c3.completed = false 
            AND c3.scheduled_date::date > c2.completed_at::date 
            AND c3.scheduled_date::date < current_date
        )
    )
    ELSE 0
  END as current_streak
FROM challenge_calendar_items
GROUP BY user_id;