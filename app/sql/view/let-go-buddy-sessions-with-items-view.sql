CREATE OR REPLACE VIEW let_go_buddy_sessions_with_items_view AS
SELECT
    -- Session data
    sessions.session_id,
    sessions.user_id,
    sessions.situation,
    sessions.created_at as session_created_at,
    sessions.updated_at as session_updated_at,
    sessions.is_completed,

-- User profile data
user_profiles.username,
user_profiles.avatar_url,
user_profiles.location as user_location,

-- Item analysis data
items.analysis_id,
items.item_name,
items.item_category,
items.item_condition,
items.recommendation,
items.ai_suggestion,
items.emotional_score,
items.environmental_impact,
items.co2_impact,
items.landfill_impact,
items.is_recyclable,
items.original_price,
items.current_value,
items.ai_listing_price,
items.maintenance_cost,
items.space_value,
items.ai_listing_title,
items.ai_listing_description,
items.ai_listing_location,
items.images,
items.created_at as item_created_at,
items.updated_at as item_updated_at,

-- Calculated statistics
COUNT(*) OVER (
    PARTITION BY
        sessions.session_id
) as total_items_in_session,
COUNT(*) FILTER (
    WHERE
        items.recommendation IN (
            'sell',
            'donate',
            'recycle',
            'repurpose',
            'discard'
        )
) OVER (
    PARTITION BY
        sessions.session_id
) as completed_items_in_session,
SUM(items.co2_impact) OVER (
    PARTITION BY
        sessions.session_id
) as total_co2_impact,
SUM(
    COALESCE(
        items.ai_listing_price,
        items.current_value,
        0
    )
) OVER (
    PARTITION BY
        sessions.session_id
) as total_value_created,
AVG(items.emotional_score) OVER (
    PARTITION BY
        sessions.session_id
) as avg_emotional_score
FROM
    let_go_buddy_sessions sessions
    INNER JOIN user_profiles ON sessions.user_id = user_profiles.profile_id
    LEFT JOIN item_analyses items ON sessions.session_id = items.session_id
ORDER BY sessions.created_at DESC, items.created_at ASC;