CREATE OR REPLACE VIEW message_notifications_view AS
SELECT
    m.message_id,
    m.conversation_id,
    m.sender_id,
    m.receiver_id,
    m.content,
    m.message_type,
    m.media_url,
    m.seen,
    m.created_at,
    -- 발신자 정보
    sender.username as sender_username,
    sender.avatar_url as sender_avatar_url,
    -- 수신자 정보
    receiver.username as receiver_username,
    receiver.avatar_url as receiver_avatar_url,
    -- 알림 정보
    CASE 
        WHEN m.seen = false THEN 'unread_message'
        ELSE 'read_message'
    END as notification_type,
    CASE 
        WHEN m.created_at > NOW() - INTERVAL '1 hour' THEN 'recent'
        WHEN m.created_at > NOW() - INTERVAL '24 hours' THEN 'today'
        WHEN m.created_at > NOW() - INTERVAL '7 days' THEN 'this_week'
        ELSE 'older'
    END as message_age,
    -- 메시지 미리보기 (긴 메시지의 경우)
    CASE 
        WHEN LENGTH(m.content) > 50 THEN LEFT(m.content, 50) || '...'
        ELSE m.content
    END as message_preview,
    -- 메시지 타입별 아이콘/표시 정보
    CASE 
        WHEN m.message_type = 'Text' THEN 'text'
        WHEN m.message_type = 'Image' THEN 'image'
        WHEN m.message_type = 'File' THEN 'file'
        WHEN m.message_type = 'Audio' THEN 'audio'
        WHEN m.message_type = 'Video' THEN 'video'
        WHEN m.message_type = 'Location' THEN 'location'
        ELSE 'unknown'
    END as message_type_icon
FROM userMessages m
LEFT JOIN userProfiles sender ON m.sender_id = sender.profile_id
LEFT JOIN userProfiles receiver ON m.receiver_id = receiver.profile_id
WHERE m.seen = false  -- 읽지 않은 메시지만 포함
ORDER BY m.created_at DESC; 