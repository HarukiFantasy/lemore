-- Performance Indexes for Lemore Database
-- Run these in Supabase SQL Editor for better performance

-- ===== PRODUCTS TABLE INDEXES (Most Critical) =====

-- 1. Main browsing - location, country, availability
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_location_country_sold 
ON products (location, country, is_sold, created_at DESC);

-- 2. Seller's products lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_seller_id 
ON products (seller_id, is_sold, created_at DESC);

-- 3. Category filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_location 
ON products (category_id, location, is_sold, created_at DESC);

-- 4. Price range searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price_location 
ON products (location, price, is_sold, created_at DESC);

-- 5. Search by currency (for multi-currency support)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_currency_location 
ON products (currency, location, is_sold, created_at DESC);

-- 6. Updated products (for recently updated listings)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_updated_at 
ON products (updated_at DESC, is_sold);

-- ===== PRODUCT IMAGES INDEXES =====

-- 7. Primary image lookup (critical for product cards)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_images_primary 
ON product_images (product_id, is_primary, image_order);

-- 8. All images for a product
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_images_product_order 
ON product_images (product_id, image_order);

-- ===== PRODUCT LIKES INDEXES =====

-- 9. User's liked products
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_likes_user_created 
ON product_likes (user_id, created_at DESC);

-- 10. Product like count
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_likes_product_created 
ON product_likes (product_id, created_at DESC);

-- ===== PRODUCT VIEWS INDEXES =====

-- 11. Product view tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_views_product_viewed 
ON product_views (product_id, viewed_at DESC);

-- 12. User view history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_views_user_viewed 
ON product_views (user_id, viewed_at DESC) WHERE user_id IS NOT NULL;

-- ===== USER PROFILES INDEXES =====

-- 13. Username lookup (for profile pages)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_username 
ON user_profiles (username) WHERE username IS NOT NULL;

-- 14. Location-based user search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_location 
ON user_profiles (location) WHERE location IS NOT NULL;

-- ===== MESSAGING INDEXES =====

-- 15. User conversations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_participants_profile 
ON message_participants (profile_id, conversation_id);

-- 16. Unread messages
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_messages_receiver_seen 
ON user_messages (receiver_id, seen, created_at DESC);

-- 17. Conversation messages
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_messages_conversation 
ON user_messages (conversation_id, created_at ASC);

-- ===== LET GO BUDDY INDEXES =====

-- 18. User's Let Go Buddy sessions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_letgo_sessions_user_created 
ON let_go_buddy_sessions (user_id, created_at DESC);

-- 19. Session items lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_item_analyses_session 
ON item_analyses (session_id, created_at ASC);

-- ===== NOTIFICATIONS INDEXES =====

-- 20. User notifications (unread first)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_notifications_receiver_read 
ON user_notifications (receiver_id, is_read, created_at DESC);

-- ===== LOCATIONS TABLE INDEX =====

-- 21. Active locations by country
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_country_active 
ON locations (country, is_active, name);

-- ===== COMPOSITE INDEXES FOR COMPLEX QUERIES =====

-- 22. Advanced product search (location + category + price range)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search_composite 
ON products (location, category_id, currency, is_sold, price, created_at DESC);

-- 23. Seller performance tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_seller_performance 
ON products (seller_id, is_sold, currency, created_at DESC);

-- ===== PARTIAL INDEXES FOR COMMON FILTERS =====

-- 24. Only available products (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_available_only 
ON products (location, created_at DESC) 
WHERE is_sold = false;

-- 25. Only sold products (for sales analytics)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_sold_only 
ON products (seller_id, updated_at DESC) 
WHERE is_sold = true;

-- ===== GIN INDEXES FOR JSONB COLUMNS =====

-- 26. Product tags search (for full-text search on tags)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_tags_gin 
ON products USING gin (tags);

-- 27. Product stats (for analytics)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_stats_gin 
ON products USING gin (stats);

-- ===== FULL-TEXT SEARCH INDEXES =====

-- 28. Product title and description search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_text_search 
ON products USING gin (to_tsvector('english', title || ' ' || description));

-- ===== VERIFY INDEXES =====
-- Run this query to see all your indexes:
-- SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;