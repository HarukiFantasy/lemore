DROP VIEW IF EXISTS let_go_buddy_sessions_with_items_view CASCADE;

-- 8. Let Go Buddy Sessions With Items View
CREATE OR REPLACE VIEW let_go_buddy_sessions_with_items_view AS
SELECT
    -- Session data
    sessions.session_id,
    sessions.user_id,
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
items.recommendation_reason,
items.emotional_attachment_keywords,
items.usage_pattern_keywords,
items.decision_factor_keywords,
items.personality_insights,
items.decision_barriers,
items.emotional_score,
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
            'Sell',
            'Donate',
            'Recycle',
            'Repurpose',
            'Discard'
        )
) OVER (
    PARTITION BY
        sessions.session_id
) as completed_items_in_session,
AVG(items.emotional_score) OVER (
    PARTITION BY
        sessions.session_id
) as avg_emotional_score
FROM
    let_go_buddy_sessions sessions
    INNER JOIN user_profiles ON sessions.user_id = user_profiles.profile_id
    LEFT JOIN item_analyses items ON sessions.session_id = items.session_id
ORDER BY sessions.created_at DESC, items.created_at ASC;