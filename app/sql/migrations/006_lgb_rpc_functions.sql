-- ======================================================================
-- RPC Functions for Let Go Buddy
-- ======================================================================

-- Get session with items and photos
CREATE OR REPLACE FUNCTION get_session_with_items_and_photos(session_uuid uuid)
RETURNS TABLE (
  session_data jsonb,
  items_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_jsonb(s.*) as session_data,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'item_id', i.item_id,
          'title', i.title,
          'notes', i.notes,
          'category', i.category,
          'condition', i.condition,
          'decision', i.decision,
          'decision_reason', i.decision_reason,
          'price_low', i.price_low,
          'price_mid', i.price_mid,
          'price_high', i.price_high,
          'price_confidence', i.price_confidence,
          'usage_score', i.usage_score,
          'sentiment', i.sentiment,
          'ai_recommendation', i.ai_recommendation,
          'ai_rationale', i.ai_rationale,
          'created_at', i.created_at,
          'updated_at', i.updated_at,
          'photos', COALESCE(
            (
              SELECT array_agg(p.storage_path)
              FROM lgb_item_photos p
              WHERE p.item_id = i.item_id
            ),
            '{}'::text[]
          )
        )
      ) FILTER (WHERE i.item_id IS NOT NULL),
      '[]'::jsonb
    ) as items_data
  FROM lgb_sessions s
  LEFT JOIN lgb_items i ON s.session_id = i.session_id
  WHERE s.session_id = session_uuid
    AND s.user_id = auth.uid()
  GROUP BY s.session_id;
END;
$$;

-- Get user challenge stats
CREATE OR REPLACE FUNCTION get_user_challenge_stats(user_uuid uuid DEFAULT NULL)
RETURNS TABLE (
  total_challenges bigint,
  completed_challenges bigint,
  overdue_challenges bigint,
  today_challenges bigint,
  current_streak bigint,
  last_completed_at timestamp
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Use provided user_uuid or default to current auth user
  target_user_id := COALESCE(user_uuid, auth.uid());
  
  -- Check if user can access this data (either their own or they're an admin)
  IF target_user_id != auth.uid() THEN
    -- Add any admin check logic here if needed
    RAISE EXCEPTION 'Unauthorized access to user stats';
  END IF;

  RETURN QUERY
  SELECT 
    count(*) as total_challenges,
    count(*) FILTER (WHERE completed = true) as completed_challenges,
    count(*) FILTER (WHERE completed = false AND scheduled_date < now()) as overdue_challenges,
    count(*) FILTER (WHERE completed = false AND scheduled_date::date = current_date) as today_challenges,
    COALESCE(
      (
        SELECT count(*)
        FROM (
          SELECT scheduled_date::date as day
          FROM challenge_calendar_items
          WHERE user_id = target_user_id 
            AND completed = true
            AND scheduled_date::date <= current_date
          ORDER BY day DESC
        ) consecutive_days
        WHERE consecutive_days.day >= current_date - (
          SELECT count(*) FROM (
            SELECT scheduled_date::date as day
            FROM challenge_calendar_items
            WHERE user_id = target_user_id 
              AND completed = true
              AND scheduled_date::date <= current_date
            ORDER BY day DESC
          ) all_days
        )
      ),
      0::bigint
    ) as current_streak,
    max(completed_at) as last_completed_at
  FROM challenge_calendar_items
  WHERE user_id = target_user_id;
END;
$$;

-- Complete challenge with reflection
CREATE OR REPLACE FUNCTION complete_challenge_item(
  item_id_param bigint,
  reflection_param text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data jsonb;
BEGIN
  UPDATE challenge_calendar_items
  SET 
    completed = true,
    completed_at = now(),
    reflection = reflection_param,
    updated_at = now()
  WHERE item_id = item_id_param
    AND user_id = auth.uid()
    AND completed = false
  RETURNING jsonb_build_object(
    'item_id', item_id,
    'name', name,
    'completed_at', completed_at,
    'reflection', reflection
  ) INTO result_data;

  IF result_data IS NULL THEN
    RAISE EXCEPTION 'Challenge item not found or already completed';
  END IF;

  RETURN result_data;
END;
$$;

-- Get items for session with pagination
CREATE OR REPLACE FUNCTION get_session_items_paginated(
  session_uuid uuid,
  page_size integer DEFAULT 20,
  page_offset integer DEFAULT 0
)
RETURNS TABLE (
  item_data jsonb,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user owns this session
  IF NOT EXISTS (
    SELECT 1 FROM lgb_sessions 
    WHERE session_id = session_uuid AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Session not found or access denied';
  END IF;

  RETURN QUERY
  WITH paginated_items AS (
    SELECT 
      i.*,
      count(*) OVER() as total_count
    FROM lgb_items i
    WHERE i.session_id = session_uuid
    ORDER BY i.created_at DESC
    LIMIT page_size OFFSET page_offset
  )
  SELECT 
    jsonb_build_object(
      'item_id', pi.item_id,
      'title', pi.title,
      'notes', pi.notes,
      'category', pi.category,
      'condition', pi.condition,
      'decision', pi.decision,
      'decision_reason', pi.decision_reason,
      'price_low', pi.price_low,
      'price_mid', pi.price_mid,
      'price_high', pi.price_high,
      'price_confidence', pi.price_confidence,
      'usage_score', pi.usage_score,
      'sentiment', pi.sentiment,
      'ai_recommendation', pi.ai_recommendation,
      'ai_rationale', pi.ai_rationale,
      'created_at', pi.created_at,
      'updated_at', pi.updated_at,
      'photos', COALESCE(
        (
          SELECT array_agg(p.storage_path)
          FROM lgb_item_photos p
          WHERE p.item_id = pi.item_id
        ),
        '{}'::text[]
      )
    ) as item_data,
    pi.total_count
  FROM paginated_items pi;
END;
$$;