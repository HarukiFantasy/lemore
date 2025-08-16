-- Update view_session_dashboard to remove trade_method reference
-- since the column has been removed from lgb_sessions table

DROP VIEW IF EXISTS view_session_dashboard CASCADE;

CREATE OR REPLACE VIEW view_session_dashboard AS
SELECT
    -- Session data
    s.session_id,
    s.user_id,
    s.scenario,
    s.title,
    s.status,
    s.created_at,
    s.move_date,
    s.region,
    
    -- Aggregated item counts
    COALESCE(item_stats.item_count, 0) as item_count,
    COALESCE(item_stats.decided_count, 0) as decided_count,
    COALESCE(item_stats.expected_revenue, 0) as expected_revenue,
    
    -- Completion percentage
    CASE 
        WHEN COALESCE(item_stats.item_count, 0) = 0 THEN 0
        ELSE ROUND((COALESCE(item_stats.decided_count, 0) * 100.0) / COALESCE(item_stats.item_count, 1))
    END as completion_percentage

FROM lgb_sessions s
LEFT JOIN (
    SELECT 
        i.session_id,
        COUNT(*) as item_count,
        COUNT(CASE WHEN i.ai_recommendation IS NOT NULL AND i.ai_recommendation != 'keep' THEN 1 END) as decided_count,
        0 as expected_revenue  -- TODO: Calculate based on price suggestions
    FROM lgb_items i
    GROUP BY i.session_id
) item_stats ON s.session_id = item_stats.session_id

ORDER BY s.created_at DESC;

-- Grant permissions
GRANT SELECT ON view_session_dashboard TO authenticated;
GRANT SELECT ON view_session_dashboard TO anon;