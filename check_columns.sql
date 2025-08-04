-- Check if the conversation insight columns exist in item_analyses table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'item_analyses' 
AND column_name IN (
    'emotional_attachment_keywords',
    'usage_pattern_keywords', 
    'decision_factor_keywords',
    'personality_insights',
    'decision_barriers',
    'recommendation_reason'
)
ORDER BY column_name;