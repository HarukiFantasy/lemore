-- 기존 잘못된 함수 삭제
DROP FUNCTION IF EXISTS public.create_local_tip_like_notification() CASCADE;

-- 올바른 함수 다시 생성
CREATE OR REPLACE FUNCTION public.create_local_tip_like_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    tip_author_id uuid;
    tip_title text;
    liker_username text;
BEGIN
    -- 팁 작성자 ID와 제목 가져오기 (author_id → author로 수정)
    SELECT author, title INTO tip_author_id, tip_title
    FROM public.local_tip_posts
    WHERE id = NEW.post_id;
    
    -- 좋아요 누른 사용자 username 가져오기
    SELECT username INTO liker_username
    FROM public.user_profiles 
    WHERE profile_id = NEW.user_id;
    
    -- 자신의 팁에 좋아요를 누른 경우 알림 생성하지 않음
    IF NEW.user_id = tip_author_id THEN
        RETURN NEW;
    END IF;
    
    -- 로컬 팁 좋아요 알림 생성
    INSERT INTO public.user_notifications (
        type,
        sender_id,
        receiver_id,
        data
    ) VALUES (
        'Like',
        NEW.user_id,
        tip_author_id,
        jsonb_build_object(
            'title', 'Tip Liked',
            'content', 'Someone liked your local tip',
            'tip_title', tip_title,
            'liker_username', liker_username,
            'notification_key', 'tip_liked'
        )
    );
    
    RETURN NEW;
END;
$$;

-- 트리거 다시 생성
CREATE TRIGGER local_tip_like_notification_trigger
    AFTER INSERT ON public.local_tip_post_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.create_local_tip_like_notification(); 