-- ======================================================================
-- ROW LEVEL SECURITY
-- ======================================================================

-- Enable RLS on all tables
ALTER TABLE lgb_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgb_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgb_item_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgb_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_calendar_items ENABLE ROW LEVEL SECURITY;

-- ======================================================================
-- Sessions policies
-- ======================================================================
DROP POLICY IF EXISTS "Users can view their own sessions" ON lgb_sessions;
CREATE POLICY "Users can view their own sessions" ON lgb_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own sessions" ON lgb_sessions;
CREATE POLICY "Users can insert their own sessions" ON lgb_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own sessions" ON lgb_sessions;
CREATE POLICY "Users can update their own sessions" ON lgb_sessions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own sessions" ON lgb_sessions;
CREATE POLICY "Users can delete their own sessions" ON lgb_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- ======================================================================
-- Items policies
-- ======================================================================
DROP POLICY IF EXISTS "Users can view items from their sessions" ON lgb_items;
CREATE POLICY "Users can view items from their sessions" ON lgb_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lgb_sessions s
      WHERE s.session_id = lgb_items.session_id AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert items to their sessions" ON lgb_items;
CREATE POLICY "Users can insert items to their sessions" ON lgb_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lgb_sessions s
      WHERE s.session_id = lgb_items.session_id AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update items from their sessions" ON lgb_items;
CREATE POLICY "Users can update items from their sessions" ON lgb_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lgb_sessions s
      WHERE s.session_id = lgb_items.session_id AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete items from their sessions" ON lgb_items;
CREATE POLICY "Users can delete items from their sessions" ON lgb_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lgb_sessions s
      WHERE s.session_id = lgb_items.session_id AND s.user_id = auth.uid()
    )
  );

-- ======================================================================
-- Item photos policies
-- ======================================================================
DROP POLICY IF EXISTS "Users can view photos from their items" ON lgb_item_photos;
CREATE POLICY "Users can view photos from their items" ON lgb_item_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lgb_items i
      JOIN lgb_sessions s ON s.session_id = i.session_id
      WHERE i.item_id = lgb_item_photos.item_id AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert photos to their items" ON lgb_item_photos;
CREATE POLICY "Users can insert photos to their items" ON lgb_item_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lgb_items i
      JOIN lgb_sessions s ON s.session_id = i.session_id
      WHERE i.item_id = lgb_item_photos.item_id AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete photos from their items" ON lgb_item_photos;
CREATE POLICY "Users can delete photos from their items" ON lgb_item_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lgb_items i
      JOIN lgb_sessions s ON s.session_id = i.session_id
      WHERE i.item_id = lgb_item_photos.item_id AND s.user_id = auth.uid()
    )
  );

-- ======================================================================
-- Listings policies
-- ======================================================================
DROP POLICY IF EXISTS "Users can view listings from their items" ON lgb_listings;
CREATE POLICY "Users can view listings from their items" ON lgb_listings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lgb_items i
      JOIN lgb_sessions s ON s.session_id = i.session_id
      WHERE i.item_id = lgb_listings.item_id AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert listings to their items" ON lgb_listings;
CREATE POLICY "Users can insert listings to their items" ON lgb_listings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lgb_items i
      JOIN lgb_sessions s ON s.session_id = i.session_id
      WHERE i.item_id = lgb_listings.item_id AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update listings from their items" ON lgb_listings;
CREATE POLICY "Users can update listings from their items" ON lgb_listings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lgb_items i
      JOIN lgb_sessions s ON s.session_id = i.session_id
      WHERE i.item_id = lgb_listings.item_id AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete listings from their items" ON lgb_listings;
CREATE POLICY "Users can delete listings from their items" ON lgb_listings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lgb_items i
      JOIN lgb_sessions s ON s.session_id = i.session_id
      WHERE i.item_id = lgb_listings.item_id AND s.user_id = auth.uid()
    )
  );

-- ======================================================================
-- Challenge calendar items policies
-- ======================================================================
DROP POLICY IF EXISTS "challenge_calendar_items_select_policy" ON challenge_calendar_items;
CREATE POLICY "challenge_calendar_items_select_policy" ON challenge_calendar_items
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "challenge_calendar_items_insert_policy" ON challenge_calendar_items;
CREATE POLICY "challenge_calendar_items_insert_policy" ON challenge_calendar_items
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "challenge_calendar_items_update_policy" ON challenge_calendar_items;
CREATE POLICY "challenge_calendar_items_update_policy" ON challenge_calendar_items
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "challenge_calendar_items_delete_policy" ON challenge_calendar_items;
CREATE POLICY "challenge_calendar_items_delete_policy" ON challenge_calendar_items
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ======================================================================
-- Storage policies
-- ======================================================================
-- Policy to allow authenticated users to upload files to their own folders
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'letgobuddy-product'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'items'
  );

-- Policy to allow public read access to all files
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
CREATE POLICY "Allow public downloads" ON storage.objects
  FOR SELECT USING (bucket_id = 'letgobuddy-product');

-- Policy to allow users to delete their own files
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'letgobuddy-product'
    AND auth.role() = 'authenticated'
  );