-- Give and Glow User Stats View
CREATE OR REPLACE VIEW give_and_glow_user_stats_view AS
SELECT
    up.profile_id,
    up.username,
    up.avatar_url,
    up.created_at AS joined_at,
    -- 총 기브앤글로우 리뷰를 준 횟수
    COALESCE(giver_stats.total_given, 0) AS total_give_and_glow_given,
    -- 총 기브앤글로우 리뷰를 받은 횟수
    COALESCE(
        receiver_stats.total_received,
        0
    ) AS total_give_and_glow_received,
    -- 총 기브앤글로우 리뷰 참여(준+받은) 횟수
    COALESCE(giver_stats.total_given, 0) + COALESCE(
        receiver_stats.total_received,
        0
    ) AS total_give_and_glow_reviews,
    -- 전체 등록 상품 수
    COALESCE(prod_stats.total_listings, 0) AS total_listings,
    -- 전체 상품 좋아요 수
    COALESCE(prod_stats.total_likes, 0) AS total_likes,
    -- 전체 판매 완료 상품 수
    COALESCE(prod_stats.total_sold, 0) AS total_sold
FROM
    user_profiles up
    LEFT JOIN (
        SELECT giver_profile_id, COUNT(*) AS total_given
        FROM give_and_glow_view
        GROUP BY
            giver_profile_id
    ) AS giver_stats ON up.profile_id = giver_stats.giver_profile_id
    LEFT JOIN (
        SELECT
            receiver_profile_id,
            COUNT(*) AS total_received
        FROM give_and_glow_view
        GROUP BY
            receiver_profile_id
    ) AS receiver_stats ON up.profile_id = receiver_stats.receiver_profile_id
    LEFT JOIN (
        SELECT
            seller_id,
            COUNT(*) AS total_listings,
            COALESCE(SUM(likes_count), 0) AS total_likes,
            COUNT(
                CASE
                    WHEN is_sold = true THEN 1
                END
            ) AS total_sold
        FROM products_listings_view
        GROUP BY
            seller_id
    ) AS prod_stats ON up.profile_id = prod_stats.seller_id;