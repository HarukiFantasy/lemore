-- Products with Seller Stats View
CREATE OR REPLACE VIEW products_with_seller_stats_view AS
SELECT
    p.*,
    -- 카테고리명
    c.name AS category_name,
    -- 대표 이미지
    COALESCE(
        (
            SELECT pi.image_url
            FROM product_images pi
            WHERE
                pi.product_id = p.product_id
                AND pi.is_primary = true
            LIMIT 1
        ),
        (
            SELECT pi.image_url
            FROM product_images pi
            WHERE
                pi.product_id = p.product_id
            ORDER BY pi.image_order
            LIMIT 1
        ),
        '/toy1.png'
    ) AS primary_image,
    -- 판매자 정보
    up.username AS seller_name,
    up.avatar_url AS seller_avatar,
    up.created_at AS seller_joined_at,
    -- 판매자 stats
    us.total_listings,
    us.total_likes,
    us.sold_items AS total_sold
FROM
    products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN user_profiles up ON p.seller_id = up.profile_id
    LEFT JOIN user_sales_stats_view us ON p.seller_id = us.profile_id;