-- ======================================================================
-- TRIGGERS for Denormalized Counters
-- ======================================================================

-- Function to update session counters
CREATE OR REPLACE FUNCTION update_session_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    -- Determine which session to update
    DECLARE
      target_session_id uuid;
    BEGIN
      IF TG_OP = 'DELETE' THEN
        target_session_id := OLD.session_id;
      ELSE
        target_session_id := NEW.session_id;
      END IF;

      -- Update counters
      UPDATE lgb_sessions SET
        item_count = (
          SELECT count(*) FROM lgb_items
          WHERE session_id = target_session_id
        ),
        decided_count = (
          SELECT count(*) FROM lgb_items
          WHERE session_id = target_session_id AND decision IS NOT NULL
        ),
        expected_revenue = (
          SELECT coalesce(sum(price_mid), 0) FROM lgb_items
          WHERE session_id = target_session_id AND decision = 'sell'
        ),
        updated_at = now()
      WHERE session_id = target_session_id;
    END;
  END IF;

  RETURN coalesce(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for session counter updates
DROP TRIGGER IF EXISTS trigger_update_session_counters ON lgb_items;
CREATE TRIGGER trigger_update_session_counters
  AFTER INSERT OR UPDATE OR DELETE ON lgb_items
  FOR EACH ROW EXECUTE FUNCTION update_session_counters();

-- ======================================================================
-- Helper Functions
-- ======================================================================

-- Create item with photos function
CREATE OR REPLACE FUNCTION create_lgb_item_with_photos(
  p_session_id uuid,
  p_photos text[],
  p_title text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_item_id uuid;
  photo_url text;
BEGIN
  -- Insert the item
  INSERT INTO lgb_items (session_id, title, notes)
  VALUES (p_session_id, p_title, p_notes)
  RETURNING item_id INTO new_item_id;

  -- Insert photos (using storage_path field from your schema)
  FOREACH photo_url IN ARRAY p_photos LOOP
    INSERT INTO lgb_item_photos (item_id, storage_path)
    VALUES (new_item_id, photo_url);
  END LOOP;

  RETURN new_item_id;
END;
$$;