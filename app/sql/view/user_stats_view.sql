DROP VIEW IF EXISTS user_stats_view CASCADE;

-- User Stats View
CREATE OR REPLACE VIEW user_stats_view AS
SELECT
    up.profile_id,
    up.username,
    up.avatar_url,
    up.created_at AS joined_at,
    up.level,
    COUNT(DISTINCT p.product_id) AS total_listings,
    COALESCE(SUM(pl.likes_count), 0) AS total_likes,
    COUNT(
        CASE
            WHEN p.is_sold = true THEN 1
        END
    ) AS total_sold,
    MAX(p.created_at) AS last_listing_created_at
FROM
    user_profiles up
    LEFT JOIN products p ON up.profile_id = p.seller_id
    LEFT JOIN (
        SELECT product_id, COUNT(*) AS likes_count
        FROM product_likes
        GROUP BY
            product_id
    ) pl ON p.product_id = pl.product_id
GROUP BY
    up.profile_id,
    up.username,
    up.avatar_url,
    up.created_at,
    up.level;