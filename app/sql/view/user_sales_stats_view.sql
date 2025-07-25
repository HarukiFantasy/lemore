-- User Sales Statistics View
CREATE OR REPLACE VIEW user_sales_stats_view AS
SELECT
    up.profile_id,
    up.username,
    up.email,
    up.level,
    -- 판매 통계
    COUNT(p.product_id) as total_listings,
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
    COALESCE(
        SUM(
            CASE
                WHEN p.is_sold = true THEN p.price
                ELSE 0
            END
        ),
        0
    ) as total_sales,
    COALESCE(
        AVG(
            CASE
                WHEN p.is_sold = true THEN p.price
            END
        ),
        0
    ) as avg_sale_price,
    -- 유저가 올린 상품에서 받은 총 좋아요
    COALESCE(
        (
            SELECT COUNT(*)
            FROM product_likes pl
            WHERE
                pl.product_id IN (
                    SELECT product_id
                    FROM products
                    WHERE
                        seller_id = up.profile_id
                )
        ),
        0
    ) as total_likes,
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
    ) as last_month_sales,
    -- 판매 변화율 계산
    CASE
        WHEN COALESCE(
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
        ) > 0 THEN ROUND(
            (
                (
                    COALESCE(
                        SUM(
                            CASE
                                WHEN p.is_sold = true
                                AND p.updated_at >= DATE_TRUNC ('month', CURRENT_DATE) THEN p.price
                                ELSE 0
                            END
                        ),
                        0
                    ) - COALESCE(
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
                    )
                ) / COALESCE(
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
                )
            ) * 100,
            1
        )
        ELSE 0
    END as sales_change_percentage,
    -- 최근 판매 활동
    MAX(
        CASE
            WHEN p.is_sold = true THEN p.updated_at
        END
    ) as last_sale_date,
    COUNT(
        CASE
            WHEN p.is_sold = true
            AND p.updated_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1
        END
    ) as sales_last_7_days
FROM user_profiles up
    LEFT JOIN products p ON up.profile_id = p.seller_id
GROUP BY
    up.profile_id,
    up.username,
    up.email,
    up.level;