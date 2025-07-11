CREATE OR REPLACE VIEW user_conversations_view AS
WITH latest_messages AS (
    SELECT 
        conversation_id,
        MAX(created_at) as latest_message_time
    FROM userMessages
    GROUP BY conversation_id
),
unread_counts AS (
    SELECT 
        conversation_id,
        COUNT(*) as unread_count
    FROM userMessages
    WHERE seen = false
    GROUP BY conversation_id
),
conversation_participants AS (
    SELECT 
        mp.conversation_id,
        array_agg(up.username) as participant_usernames,
        array_agg(up.avatar_url) as participant_avatars,
        array_agg(up.profile_id) as participant_ids
    FROM messageParticipants mp
    JOIN userProfiles up ON mp.profile_id = up.profile_id
    GROUP BY mp.conversation_id
)
SELECT
    c.conversation_id,
    c.created_at as conversation_created_at,
    lm.latest_message_time,
    uc.unread_count,
    cp.participant_usernames,
    cp.participant_avatars,
    cp.participant_ids,
    -- 최근 메시지 정보
    latest_msg.content as latest_message_content,
    latest_msg.message_type as latest_message_type,
    latest_msg.sender_id as latest_message_sender_id,
    latest_sender.username as latest_message_sender_username,
    -- 대화 활성도 (최근 메시지 시간 기준)
    CASE 
        WHEN lm.latest_message_time > NOW() - INTERVAL '1 hour' THEN 'very_active'
        WHEN lm.latest_message_time > NOW() - INTERVAL '24 hours' THEN 'active'
        WHEN lm.latest_message_time > NOW() - INTERVAL '7 days' THEN 'recent'
        ELSE 'inactive'
    END as conversation_activity
FROM userConversations c
LEFT JOIN latest_messages lm ON c.conversation_id = lm.conversation_id
LEFT JOIN unread_counts uc ON c.conversation_id = uc.conversation_id
LEFT JOIN conversation_participants cp ON c.conversation_id = cp.conversation_id
LEFT JOIN userMessages latest_msg ON (
    latest_msg.conversation_id = c.conversation_id 
    AND latest_msg.created_at = lm.latest_message_time
)
LEFT JOIN userProfiles latest_sender ON latest_msg.sender_id = latest_sender.profile_id
ORDER BY lm.latest_message_time DESC NULLS LAST; 