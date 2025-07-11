-- User Activity View - 최근 활동 내역


CREATE OR REPLACE VIEW user_activity_view AS
WITH all_activities AS (
    -- 상품 관련 활동
    SELECT 
        up.profile_id,
        'product_liked' as activity_type,
        'Someone liked your ' || p.title || ' listing' as activity_title,
        pl.created_at as activity_timestamp,
        p.product_id as related_id,
        'product' as related_type,
        up.username as username,
        up.avatar_url as avatar_url
    FROM product_likes pl
    JOIN products p ON pl.product_id = p.product_id
    JOIN user_profiles up ON p.seller_id = up.profile_id
    
    UNION ALL

-- 상품 조회 활동
SELECT
    up.profile_id,
    'product_viewed' as activity_type,
    'Your ' || p.title || ' was viewed' as activity_title,
    pv.viewed_at as activity_timestamp,
    p.product_id as related_id,
    'product' as related_type,
    up.username as username,
    up.avatar_url as avatar_url
FROM
    product_views pv
    JOIN products p ON pv.product_id = p.product_id
    JOIN user_profiles up ON p.seller_id = up.profile_id
WHERE
    pv.user_id IS NOT NULL
UNION ALL

-- 메시지 활동
SELECT
    up.profile_id,
    'message_received' as activity_type,
    'New message from ' || sender.username as activity_title,
    um.created_at as activity_timestamp,
    um.message_id as related_id,
    'message' as related_type,
    up.username as username,
    up.avatar_url as avatar_url
FROM
    user_messages um
    JOIN user_profiles up ON um.receiver_id = up.profile_id
    JOIN user_profiles sender ON um.sender_id = sender.profile_id
WHERE
    um.seen = false
UNION ALL

-- 상품 판매 활동
SELECT
    up.profile_id,
    'product_sold' as activity_type,
    'Your ' || p.title || ' sold for ' || p.currency || ' ' || p.price as activity_title,
    p.updated_at as activity_timestamp,
    p.product_id as related_id,
    'product' as related_type,
    up.username as username,
    up.avatar_url as avatar_url
FROM products p
    JOIN user_profiles up ON p.seller_id = up.profile_id
WHERE
    p.is_sold = true
UNION ALL

-- 리뷰 활동
SELECT 
        up.profile_id,
        'review_received' as activity_type,
        'New review received for ' || p.title as activity_title,
        ur.created_at as activity_timestamp,
        ur.review_id as related_id,
        'review' as related_type,
        up.username as username,
        up.avatar_url as avatar_url
    FROM user_reviews ur
    JOIN user_profiles up ON ur.reviewee_id = up.profile_id
    LEFT JOIN products p ON ur.review_id = p.product_id
)
SELECT 
    profile_id,
    username,
    avatar_url,
    activity_type,
    activity_title,
    activity_timestamp,
    related_id,
    related_type,
    -- 시간 경과 표시
    CASE 
        WHEN activity_timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 hour' 
        THEN 'Just now'
        WHEN activity_timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours' 
        THEN EXTRACT(hour FROM CURRENT_TIMESTAMP - activity_timestamp) || ' hours ago'
        WHEN activity_timestamp >= CURRENT_TIMESTAMP - INTERVAL '7 days' 
        THEN EXTRACT(day FROM CURRENT_TIMESTAMP - activity_timestamp) || ' days ago'
        ELSE TO_CHAR(activity_timestamp, 'MMM DD')
    END as time_ago
FROM all_activities
WHERE activity_timestamp >= CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY activity_timestamp DESC;