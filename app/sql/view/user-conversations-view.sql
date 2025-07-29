DROP VIEW IF EXISTS user_conversations_view CASCADE;

CREATE OR REPLACE VIEW public.user_conversations_view
WITH (security_invoker = true) -- RLS 정책을 뷰를 호출한 사용자의 권한으로 실행
    AS
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
    sender.username AS sender_username,
    sender.avatar_url AS sender_avatar_url,
    sender.location AS sender_location,
    -- 수신자 정보
    receiver.username AS receiver_username,
    receiver.avatar_url AS receiver_avatar_url,
    receiver.location AS receiver_location,
    -- 대화 정보
    c.created_at AS conversation_created_at,
    -- 상품 정보
    p.product_id,
    p.title AS product_title
FROM
    -- 각 대화의 마지막 메시지를 찾는 서브쿼리
    (
        SELECT
            conversation_id,
            MAX(created_at) AS max_created_at
        FROM public.user_messages
        GROUP BY
            conversation_id
    ) AS latest_message
    -- 위에서 찾은 마지막 메시지 정보와 user_messages 테이블을 조인
    JOIN public.user_messages m ON latest_message.conversation_id = m.conversation_id
    AND latest_message.max_created_at = m.created_at
    -- 나머지 필요한 정보들을 조인
    LEFT JOIN public.user_profiles sender ON m.sender_id = sender.profile_id
    LEFT JOIN public.user_profiles receiver ON m.receiver_id = receiver.profile_id
    LEFT JOIN public.user_conversations c ON m.conversation_id = c.conversation_id
    LEFT JOIN public.products p ON c.product_id = p.product_id
ORDER BY m.created_at DESC;