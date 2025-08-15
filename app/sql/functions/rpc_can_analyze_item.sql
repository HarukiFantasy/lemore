-- Function to check if user can perform AI analysis (2 free analyses per user)
CREATE OR REPLACE FUNCTION public.rpc_can_analyze_item(user_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    analysis_count INTEGER;
    max_free_analyses INTEGER := 2;
BEGIN
    -- Count total AI analyses performed by this user
    SELECT COUNT(*)
    INTO analysis_count
    FROM lgb_items
    WHERE session_id IN (
        SELECT session_id 
        FROM lgb_sessions 
        WHERE user_id = user_id_param
    )
    AND ai_recommendation IS NOT NULL 
    AND ai_recommendation != 'keep'; -- Don't count placeholder values
    
    -- Return result
    RETURN jsonb_build_object(
        'allowed', analysis_count < max_free_analyses,
        'used', analysis_count,
        'limit', max_free_analyses,
        'remaining', GREATEST(0, max_free_analyses - analysis_count)
    );
END;
$$;