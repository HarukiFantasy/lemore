-- Product Stats Caching Triggers
-- Phase 1 Performance Optimization: Real-time stats caching
-- Run this file in Supabase SQL Editor to set up automatic stats caching

-- ===========================================
-- STATS CACHING SYSTEM
-- ===========================================

-- Function to update product stats in products.stats JSONB
CREATE OR REPLACE FUNCTION update_product_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update likes and views count in products.stats JSONB
    UPDATE products 
    SET stats = COALESCE(stats, '{}'::jsonb) || jsonb_build_object(
        'likes', (
            SELECT COUNT(*) 
            FROM product_likes 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        ),
        'views', (
            SELECT COUNT(*) 
            FROM product_views 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        ),
        'updated_at', NOW()
    )
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for product likes (INSERT/DELETE)
DROP TRIGGER IF EXISTS trigger_update_product_stats_on_like ON product_likes;
CREATE TRIGGER trigger_update_product_stats_on_like
    AFTER INSERT OR DELETE ON product_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stats();

-- Trigger for product views (INSERT only)
DROP TRIGGER IF EXISTS trigger_update_product_stats_on_view ON product_views;
CREATE TRIGGER trigger_update_product_stats_on_view
    AFTER INSERT ON product_views
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stats();

-- ===========================================
-- INITIALIZATION (Run only once)
-- ===========================================

-- Initialize existing product stats
-- This will populate stats for all existing products
-- Comment out after first run to avoid unnecessary updates
UPDATE products 
SET stats = COALESCE(stats, '{}'::jsonb) || jsonb_build_object(
    'likes', (
        SELECT COUNT(*) 
        FROM product_likes 
        WHERE product_likes.product_id = products.product_id
    ),
    'views', (
        SELECT COUNT(*) 
        FROM product_views 
        WHERE product_views.product_id = products.product_id
    ),
    'updated_at', NOW()
)
WHERE stats IS NULL OR NOT (stats ? 'likes') OR NOT (stats ? 'views');

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Check triggers were created
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_name LIKE 'trigger_update_product_stats%'
ORDER BY trigger_name;

-- Check stats were initialized
SELECT 
    'Stats initialized' as status,
    COUNT(*) as products_with_stats
FROM products 
WHERE stats ? 'likes' AND stats ? 'views';

-- Sample stats data
SELECT 
    product_id,
    title,
    stats->>'likes' as likes,
    stats->>'views' as views
FROM products 
WHERE stats IS NOT NULL
LIMIT 5;