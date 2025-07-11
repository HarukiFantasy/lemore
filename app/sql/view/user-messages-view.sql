
CREATE OR REPLACE VIEW user_messages_view AS
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
    sender.location as sender_location,
    -- 수신자 정보
    receiver.username as receiver_username,
    receiver.avatar_url as receiver_avatar_url,
    receiver.location as receiver_location,
    -- 대화 정보
    c.created_at as conversation_created_at,
    -- 메시지 상태 정보
    CASE 
        WHEN m.seen = true THEN 'read'
        ELSE 'unread'
    END as message_status,
    -- 메시지 타입별 정보
    CASE 
        WHEN m.message_type = 'Text' THEN 'text'
        WHEN m.message_type = 'Image' THEN 'image'
        WHEN m.message_type = 'File' THEN 'file'
        WHEN m.message_type = 'Audio' THEN 'audio'
        WHEN m.message_type = 'Video' THEN 'video'
        WHEN m.message_type = 'Location' THEN 'location'
        ELSE 'unknown'
    END as message_type_category
FROM user_messages m
LEFT JOIN user_profiles sender ON m.sender_id = sender.profile_id
LEFT JOIN user_profiles receiver ON m.receiver_id = receiver.profile_id
LEFT JOIN user_conversations c ON m.conversation_id = c.conversation_id
ORDER BY m.conversation_id, m.created_at;
