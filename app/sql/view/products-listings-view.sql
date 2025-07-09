CREATE OR REPLACE VIEW products_listings_view AS
SELECT
    p.product_id,
    p.title,
    p.price,
    p.currency,
    p.condition,
    p.location,
    p.description,
    p.tags,
    p.isSold,
    p.price_type,
    p.stats,
    p.created_at,
    p.updated_at,
    c.name AS category_name,
    up.profile_id AS seller_id,
    up.username AS seller_name,
    up.avatar_url AS seller_avatar,
    up.location AS seller_location,
    up.rating AS seller_rating,
    up.response_rate AS seller_response_rate,
    up.response_time AS seller_response_time,
    up.appreciation_badge AS seller_appreciation_badge,
    -- Get primary image or first image
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
    -- Count of likes
    COALESCE(p.stats->>'likes', '0')::integer AS likes_count,
    -- Count of views
    COALESCE(p.stats->>'views', '0')::integer AS views_count
FROM
    products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN user_profiles up ON p.seller_id = up.profile_id
WHERE
    p.is_sold = false -- Only show available products by default
ORDER BY
    p.created_at DESC;