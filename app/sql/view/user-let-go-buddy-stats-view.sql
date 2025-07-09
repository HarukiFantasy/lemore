CREATE OR REPLACE VIEW user_let_go_buddy_stats_view AS
SELECT sessions.user_id, user_profiles.username, user_profiles.avatar_url,

-- Session statistics
COUNT(DISTINCT sessions.session_id) as total_sessions,
COUNT(
    DISTINCT CASE
        WHEN sessions.is_completed THEN sessions.session_id
    END
) as completed_sessions,

-- Item statistics
COUNT(items.analysis_id) as total_items_analyzed,
COUNT(
    CASE
        WHEN items.recommendation IN (
            'Sell',
            'Donate',
            'Recycle',
            'Repurpose',
            'Discard'
        ) THEN items.analysis_id
    END
) as total_items_completed,

-- Environmental impact
SUM(items.co2_impact) as total_co2_saved,
AVG(
    CASE
        WHEN items.environmental_impact = 'Low' THEN 1
        WHEN items.environmental_impact = 'Medium' THEN 2
        WHEN items.environmental_impact = 'High' THEN 3
        WHEN items.environmental_impact = 'Critical' THEN 4
        ELSE 0
    END
) as avg_environmental_impact_score,

-- Value statistics
SUM(
    COALESCE(
        items.ai_listing_price,
        items.current_value,
        0
    )
) as total_value_created,
AVG(
    COALESCE(
        items.ai_listing_price,
        items.current_value,
        0
    )
) as avg_item_value,

-- Emotional statistics
AVG(items.emotional_score) as avg_emotional_score,

-- Most common patterns
MODE () WITHIN GROUP (
    ORDER BY sessions.situation
) as most_common_situation,
MODE () WITHIN GROUP (
    ORDER BY items.recommendation
) as most_common_recommendation,

-- Recent activity
MAX(sessions.created_at) as last_session_date,
MAX(items.created_at) as last_item_analysis_date
FROM
    let_go_buddy_sessions sessions
    INNER JOIN user_profiles ON sessions.user_id = user_profiles.profile_id
    LEFT JOIN item_analyses items ON sessions.session_id = items.session_id
GROUP BY
    sessions.user_id,
    user_profiles.username,
    user_profiles.avatar_url;