-- Performance Indexes for Lemore
-- Phase 1 Performance Optimization: Strategic indexes for common queries
-- IMPORTANT: Run each CREATE INDEX command INDIVIDUALLY (copy one line at a time)
-- CREATE INDEX CONCURRENTLY cannot run in transaction blocks

-- ===========================================
-- PRODUCT BROWSING OPTIMIZATION
-- ===========================================

-- Main product browsing index (location + sold status + date + category)
-- Optimizes: homepage, category pages, location filtering
CREATE INDEX CONCURRENTLY idx_products_browse_optimized 
ON products (location, is_sold, created_at DESC, category_id)
WHERE is_sold = false;

-- Product search optimization (GIN index for tags JSONB)
-- Optimizes: search functionality, tag-based filtering
CREATE INDEX CONCURRENTLY idx_products_tags_gin 
ON products USING GIN (tags);

-- Product stats optimization (GIN index for stats JSONB)
-- Optimizes: sorting by likes, views, trending products
CREATE INDEX CONCURRENTLY idx_products_stats_gin 
ON products USING GIN (stats);

-- ===========================================
-- PRODUCT IMAGES OPTIMIZATION
-- ===========================================

-- Product images primary lookup optimization
-- Optimizes: primary image selection in views (eliminates N+1 queries)
CREATE INDEX CONCURRENTLY idx_product_images_primary_order 
ON product_images (product_id, is_primary DESC, image_order ASC);

-- ===========================================
-- USER INTERACTIONS OPTIMIZATION
-- ===========================================

-- Product likes optimization
-- Optimizes: like counts, user's liked products, trending calculations
CREATE INDEX CONCURRENTLY idx_product_likes_product_created 
ON product_likes (product_id, created_at DESC);

-- Product views optimization  
-- Optimizes: view counts, recent views, analytics
CREATE INDEX CONCURRENTLY idx_product_views_product_time 
ON product_views (product_id, viewed_at DESC);

-- ===========================================
-- MESSAGING OPTIMIZATION
-- ===========================================

-- Message loading optimization
-- Optimizes: conversation loading, message history
CREATE INDEX CONCURRENTLY idx_user_messages_conversation_time 
ON user_messages (conversation_id, created_at DESC);

-- ===========================================
-- USER PROFILE OPTIMIZATION
-- ===========================================

-- User profile location filtering
-- Optimizes: location-based user searches, seller filtering
CREATE INDEX CONCURRENTLY idx_user_profiles_location 
ON user_profiles (location) 
WHERE location IS NOT NULL;

-- ===========================================
-- VERIFICATION QUERY
-- ===========================================

-- Check which indexes were created successfully
-- Run this after creating all indexes above
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE indexname LIKE 'idx_%'
AND schemaname = 'public'
ORDER BY tablename, indexname;