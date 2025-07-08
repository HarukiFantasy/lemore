CREATE OR REPLACE VIEW environmental_impact_summary_view AS
SELECT sessions.user_id, user_profiles.username, sessions.session_id, sessions.situation,

-- Environmental impact summary
COUNT(*) as total_items,
COUNT(
    CASE
        WHEN items.is_recyclable THEN 1
    END
) as recyclable_items,
COUNT(
    CASE
        WHEN items.recommendation = 'recycle' THEN 1
    END
) as items_to_recycle,
COUNT(
    CASE
        WHEN items.recommendation = 'donate' THEN 1
    END
) as items_to_donate,
COUNT(
    CASE
        WHEN items.recommendation = 'sell' THEN 1
    END
) as items_to_sell,
COUNT(
    CASE
        WHEN items.recommendation = 'keep' THEN 1
    END
) as items_to_keep,

-- CO2 impact
SUM(items.co2_impact) as total_co2_impact,
AVG(items.co2_impact) as avg_co2_impact,

-- Environmental impact levels
COUNT(
    CASE
        WHEN items.environmental_impact = 'low' THEN 1
    END
) as low_impact_items,
COUNT(
    CASE
        WHEN items.environmental_impact = 'medium' THEN 1
    END
) as medium_impact_items,
COUNT(
    CASE
        WHEN items.environmental_impact = 'high' THEN 1
    END
) as high_impact_items,
COUNT(
    CASE
        WHEN items.environmental_impact = 'critical' THEN 1
    END
) as critical_impact_items,

-- Value impact
SUM(
    COALESCE(
        items.ai_listing_price,
        items.current_value,
        0
    )
) as total_value_created,
SUM(
    COALESCE(items.original_price, 0)
) as total_original_value,

-- Session info
sessions.created_at as session_date,
sessions.is_completed
FROM
    let_go_buddy_sessions sessions
    INNER JOIN user_profiles ON sessions.user_id = user_profiles.profile_id
    LEFT JOIN item_analyses items ON sessions.session_id = items.session_id
GROUP BY
    sessions.user_id,
    user_profiles.username,
    sessions.session_id,
    sessions.situation,
    sessions.created_at,
    sessions.is_completed
ORDER BY sessions.created_at DESC;