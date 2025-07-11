-- 1. User Dashboard View
CREATE OR REPLACE VIEW user_dashboard_view AS
WITH
    user_stats AS (
        SELECT
            up.profile_id,
            up.username,
            up.email,
            up.avatar_url,
            up.bio,
            up.location,
            up.total_likes,
            up.total_views,
            up.total_listings,
            up.response_rate,
            up.response_time,
            up.rating,
            up.appreciation_badge,
            up.created_at,
            up.updated_at,
            -- 판매 통계
            COALESCE(
                SUM(
                    CASE
                        WHEN p.is_sold = true THEN p.price
                        ELSE 0
                    END
                ),
                0
            ) as total_sales,
            COUNT(
                CASE
                    WHEN p.is_sold = true THEN 1
                END
            ) as sold_items,
            COUNT(
                CASE
                    WHEN p.is_sold = false THEN 1
                END
            ) as active_listings,
            -- 메시지 통계
            COUNT(
                CASE
                    WHEN um.seen = false
                    AND um.receiver_id = up.profile_id THEN 1
                END
            ) as unread_messages,
            COUNT(
                CASE
                    WHEN um.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
                    AND um.receiver_id = up.profile_id THEN 1
                END
            ) as messages_last_7_days,
            -- 최근 활동 통계
            COUNT(
                CASE
                    WHEN pl.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1
                END
            ) as likes_last_7_days,
            COUNT(
                CASE
                    WHEN pv.viewed_at >= CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1
                END
            ) as views_last_7_days
        FROM
            user_profiles up
            LEFT JOIN products p ON up.profile_id = p.seller_id
            LEFT JOIN user_messages um ON up.profile_id = um.receiver_id
            LEFT JOIN product_likes pl ON p.product_id = pl.product_id
            LEFT JOIN product_views pv ON p.product_id = pv.product_id
        GROUP BY
            up.profile_id,
            up.username,
            up.email,
            up.avatar_url,
            up.bio,
            up.location,
            up.total_likes,
            up.total_views,
            up.total_listings,
            up.response_rate,
            up.response_time,
            up.rating,
            up.appreciation_badge,
            up.created_at,
            up.updated_at
    ),
    sales_comparison AS (
        SELECT
            profile_id,
            total_sales,
            -- 이번 달 vs 지난 달 판매 비교
            COALESCE(
                SUM(
                    CASE
                        WHEN p.is_sold = true
                        AND p.updated_at >= DATE_TRUNC ('month', CURRENT_DATE) THEN p.price
                        ELSE 0
                    END
                ),
                0
            ) as current_month_sales,
            COALESCE(
                SUM(
                    CASE
                        WHEN p.is_sold = true
                        AND p.updated_at >= DATE_TRUNC (
                            'month',
                            CURRENT_DATE - INTERVAL '1 month'
                        )
                        AND p.updated_at < DATE_TRUNC ('month', CURRENT_DATE) THEN p.price
                        ELSE 0
                    END
                ),
                0
            ) as last_month_sales
        FROM user_stats us
            LEFT JOIN products p ON us.profile_id = p.seller_id
        GROUP BY
            profile_id,
            total_sales
    )
SELECT
    us.*,
    sc.current_month_sales,
    sc.last_month_sales,
    -- 판매 변화율
    CASE
        WHEN sc.last_month_sales > 0 THEN ROUND(
            (
                (
                    sc.current_month_sales - sc.last_month_sales
                ) / sc.last_month_sales
            ) * 100,
            1
        )
        ELSE 0
    END as sales_change_percentage,
    -- 메시지 변화 텍스트
    CASE
        WHEN us.messages_last_7_days > 0 THEN '+' || us.messages_last_7_days || ' new this week'
        ELSE 'No new messages'
    END as messages_change_text,
    -- 판매 변화 텍스트
    CASE
        WHEN sc.last_month_sales > 0
        AND sc.current_month_sales > sc.last_month_sales THEN '+' || ROUND(
            (
                (
                    sc.current_month_sales - sc.last_month_sales
                ) / sc.last_month_sales
            ) * 100,
            1
        ) || '% from last month'
        WHEN sc.last_month_sales > 0
        AND sc.current_month_sales < sc.last_month_sales THEN ROUND(
            (
                (
                    sc.current_month_sales - sc.last_month_sales
                ) / sc.last_month_sales
            ) * 100,
            1
        ) || '% from last month'
        WHEN sc.last_month_sales = 0
        AND sc.current_month_sales > 0 THEN '+100% from last month'
        WHEN sc.last_month_sales = 0
        AND sc.current_month_sales = 0 THEN 'No change from last month'
        ELSE 'No change from last month'
    END as sales_change_text
FROM
    user_stats us
    LEFT JOIN sales_comparison sc ON us.profile_id = sc.profile_id;