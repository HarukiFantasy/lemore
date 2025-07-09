-- Product Detail View - 제품 상세 페이지에 필요한 모든 정보
CREATE OR REPLACE VIEW product_detail_view AS
SELECT
    p.product_id,
    p.title,
    p.price,
    p.currency,
    p.condition,
    p.location,
    p.description,
    p.tags,
    p.is_sold,
    p.price_type,
    p.stats,
    p.created_at,
    p.updated_at,
    -- Category information
    c.category_id,
    c.name AS category_name,
    -- Seller information
    up.profile_id AS seller_id,
    up.username AS seller_name,
    up.email AS seller_email,
    up.avatar_url AS seller_avatar,
    up.bio AS seller_bio,
    up.location AS seller_location,
    up.rating AS seller_rating,
    up.response_rate AS seller_response_rate,
    up.response_time AS seller_response_time,
    up.appreciation_badge AS seller_appreciation_badge,
    up.total_likes AS seller_total_likes,
    up.total_views AS seller_total_views,
    up.total_listings AS seller_total_listings,
    up.created_at AS seller_joined_at,
    -- Primary image
    COALESCE(
        (SELECT pi.image_url 
         FROM product_images pi 
         WHERE pi.product_id = p.product_id AND pi.is_primary = true 
         LIMIT 1),
        (SELECT pi.image_url 
         FROM product_images pi 
         WHERE pi.product_id = p.product_id 
         ORDER BY pi.image_order 
         LIMIT 1),
        '/sample.png' -- Default fallback image
    ) AS primary_image,
    -- All product images as JSON array
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'image_url', pi.image_url,
                'image_order', pi.image_order,
                'is_primary', pi.is_primary
            ) ORDER BY pi.image_order
        )
        FROM product_images pi 
        WHERE pi.product_id = p.product_id),
        '[]'::json
    ) AS all_images,
    -- Like and view counts
    COALESCE(p.stats->>'likes', '0')::integer AS likes_count,
    COALESCE(p.stats->>'views', '0')::integer AS views_count,
    -- Recent likes (last 7 days)
    COUNT(
        CASE
            WHEN pl.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1
        END
    ) as recent_likes_count,
    -- Recent views (last 7 days)
    COUNT(
        CASE
            WHEN pv.viewed_at >= CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1
        END
    ) as recent_views_count,
    -- Seller's other active listings count
    (SELECT COUNT(*) 
     FROM products p2 
     WHERE p2.seller_id = p.seller_id 
     AND p2.is_sold = false 
     AND p2.product_id != p.product_id
    ) as seller_other_listings_count,
    -- Price formatted for display
    CASE 
        WHEN p.currency = 'THB' THEN p.price::text || ' ฿'
        WHEN p.currency = 'USD' THEN '$' || p.price::text
        WHEN p.currency = 'EUR' THEN '€' || p.price::text
        ELSE p.price::text || ' ' || p.currency
    END as formatted_price,
    -- Condition display text
    CASE p.condition
        WHEN 'New' THEN '새상품'
        WHEN 'Like New' THEN '거의 새상품'
        WHEN 'Excellent' THEN '매우 좋음'
        WHEN 'Good' THEN '좋음'
        WHEN 'Fair' THEN '보통'
        WHEN 'Poor' THEN '낡음'
        ELSE p.condition::text
    END as condition_display,
    -- Days since posted
    EXTRACT(DAY FROM CURRENT_TIMESTAMP - p.created_at)::integer as days_since_posted,
    -- Is recently posted (within 7 days)
    (p.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days') as is_recently_posted
FROM
    products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN user_profiles up ON p.seller_id = up.profile_id
    LEFT JOIN product_likes pl ON p.product_id = pl.product_id
    LEFT JOIN product_views pv ON p.product_id = pv.product_id
GROUP BY
    p.product_id,
    p.title,
    p.price,
    p.currency,
    p.condition,
    p.location,
    p.description,
    p.tags,
    p.is_sold,
    p.price_type,
    p.stats,
    p.created_at,
    p.updated_at,
    c.category_id,
    c.name,
    up.profile_id,
    up.username,
    up.email,
    up.avatar_url,
    up.bio,
    up.location,
    up.rating,
    up.response_rate,
    up.response_time,
    up.appreciation_badge,
    up.total_likes,
    up.total_views,
    up.total_listings,
    up.created_at;