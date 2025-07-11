CREATE OR REPLACE VIEW user_message_stats_view AS
WITH user_message_counts AS (
    SELECT 
        sender_id as user_id,
        COUNT(*) as messages_sent,
        COUNT(CASE WHEN seen = true THEN 1 END) as messages_read_by_others,
        COUNT(CASE WHEN seen = false THEN 1 END) as messages_unread_by_others
    FROM userMessages
    GROUP BY sender_id
),
user_received_counts AS (
    SELECT 
        receiver_id as user_id,
        COUNT(*) as messages_received,
        COUNT(CASE WHEN seen = true THEN 1 END) as messages_read,
        COUNT(CASE WHEN seen = false THEN 1 END) as messages_unread
    FROM userMessages
    GROUP BY receiver_id
),
user_conversation_counts AS (
    SELECT 
        profile_id as user_id,
        COUNT(DISTINCT conversation_id) as total_conversations
    FROM messageParticipants
    GROUP BY profile_id
),
user_recent_activity AS (
    SELECT 
        sender_id as user_id,
        MAX(created_at) as last_message_sent,
        MIN(created_at) as first_message_sent
    FROM userMessages
    GROUP BY sender_id
)
SELECT
    up.profile_id,
    up.username,
    up.avatar_url,
    up.location,
    -- 메시지 통계
    COALESCE(sent.messages_sent, 0) as messages_sent,
    COALESCE(received.messages_received, 0) as messages_received,
    COALESCE(sent.messages_read_by_others, 0) as messages_read_by_others,
    COALESCE(received.messages_unread, 0) as messages_unread,
    COALESCE(conv.total_conversations, 0) as total_conversations,
    -- 활동 통계
    activity.last_message_sent,
    activity.first_message_sent,
    -- 응답률 계산
    CASE 
        WHEN COALESCE(received.messages_received, 0) > 0 
        THEN ROUND(
            (COALESCE(sent.messages_sent, 0)::decimal / COALESCE(received.messages_received, 0)) * 100, 2
        )
        ELSE 0 
    END as response_rate_percentage,
    -- 메시지 활동 수준
    CASE 
        WHEN activity.last_message_sent > NOW() - INTERVAL '1 hour' THEN 'very_active'
        WHEN activity.last_message_sent > NOW() - INTERVAL '24 hours' THEN 'active'
        WHEN activity.last_message_sent > NOW() - INTERVAL '7 days' THEN 'recent'
        WHEN activity.last_message_sent IS NOT NULL THEN 'inactive'
        ELSE 'no_activity'
    END as message_activity_level
FROM userProfiles up
LEFT JOIN user_message_counts sent ON up.profile_id = sent.user_id
LEFT JOIN user_received_counts received ON up.profile_id = received.user_id
LEFT JOIN user_conversation_counts conv ON up.profile_id = conv.user_id
LEFT JOIN user_recent_activity activity ON up.profile_id = activity.user_id
ORDER BY up.created_at DESC; 