DROP VIEW IF EXISTS item_analyses_detailed_view CASCADE;

-- 9. Item Analyses Detailed View
CREATE OR REPLACE VIEW item_analyses_detailed_view AS
SELECT
    -- Item analysis data
    items.analysis_id,
    items.session_id,
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
    items.created_at,
    items.updated_at,

-- Session context
sessions.situation,
sessions.is_completed as session_completed,
sessions.created_at as session_created_at,

-- User context
user_profiles.username,
user_profiles.avatar_url,
user_profiles.location as user_location,

-- Calculated fields
CASE
    WHEN items.recommendation IN (
        'Sell',
        'Donate',
        'Recycle',
        'Repurpose',
        'Discard'
    ) THEN true
    ELSE false
END as is_decision_made,
CASE
    WHEN items.recommendation = 'Keep' THEN 'Keep Item'
    WHEN items.recommendation = 'Sell' THEN 'Sell Item'
    WHEN items.recommendation = 'Donate' THEN 'Donate Item'
    WHEN items.recommendation = 'Recycle' THEN 'Recycle Item'
    WHEN items.recommendation = 'Repair' THEN 'Repair Item'
    WHEN items.recommendation = 'Repurpose' THEN 'Repurpose Item'
    WHEN items.recommendation = 'Discard' THEN 'Discard Item'
    ELSE 'Unknown'
END as recommendation_display,
CASE
    WHEN items.environmental_impact = 'Low' THEN 'Low Impact'
    WHEN items.environmental_impact = 'Medium' THEN 'Medium Impact'
    WHEN items.environmental_impact = 'High' THEN 'High Impact'
    WHEN items.environmental_impact = 'Critical' THEN 'Critical Impact'
    ELSE 'Unknown'
END as environmental_impact_display,

-- Value calculations
COALESCE(
    items.ai_listing_price,
    items.current_value,
    0
) as effective_value,
CASE
    WHEN items.original_price IS NOT NULL
    AND items.original_price > 0 THEN ROUND(
        (
            (
                COALESCE(
                    items.ai_listing_price,
                    items.current_value,
                    0
                ) - items.original_price
            ) / items.original_price
        ) * 100,
        2
    )
    ELSE NULL
END as value_change_percentage,

-- Emotional assessment
CASE
    WHEN items.emotional_score >= 8 THEN 'Very High Attachment'
    WHEN items.emotional_score >= 6 THEN 'High Attachment'
    WHEN items.emotional_score >= 4 THEN 'Moderate Attachment'
    WHEN items.emotional_score >= 2 THEN 'Low Attachment'
    ELSE 'Very Low Attachment'
END as emotional_attachment_level
FROM
    item_analyses items
    INNER JOIN let_go_buddy_sessions sessions ON items.session_id = sessions.session_id
    INNER JOIN user_profiles ON sessions.user_id = user_profiles.profile_id
ORDER BY items.created_at DESC;