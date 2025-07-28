DROP FUNCTION IF EXISTS public.create_message_notification () CASCADE;

DROP FUNCTION IF EXISTS public.create_like_notification () CASCADE;

DROP FUNCTION IF EXISTS public.create_review_notification () CASCADE;

DROP FUNCTION IF EXISTS public.create_local_tip_like_notification () CASCADE;

DROP FUNCTION IF EXISTS public.create_welcome_notification () CASCADE;

-- 알림 생성 함수들
CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    sender_username text;
BEGIN
    -- 발신자 username 가져오기
    SELECT username INTO sender_username
    FROM public.user_profiles 
    WHERE profile_id = NEW.sender_id;
    
    -- 새 메시지가 추가될 때 수신자에게 알림 생성
    INSERT INTO public.user_notifications (
        type,
        sender_id,
        receiver_id,
        message_id,
        data
    ) VALUES (
        'Message',
        NEW.sender_id,
        NEW.receiver_id,
        NEW.message_id,
        jsonb_build_object(
            'title', 'Message',
            'content', sender_username || ' sent you a message',
            'message_preview', NEW.content,
            'sender_username', sender_username,
            'message_type', NEW.message_type,
            'notification_key', 'new_message'
        )
    );
    
    RETURN NEW;
END;
$$;

-- 메시지 알림 트리거
CREATE TRIGGER message_notification_trigger
AFTER INSERT ON public.user_messages
FOR EACH ROW
EXECUTE FUNCTION public.create_message_notification();

-- 좋아요 알림 생성 함수
CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    product_seller_id uuid;
    product_title text;
    liker_username text;
BEGIN
    -- 상품의 판매자 ID와 제목 가져오기
    SELECT seller_id, title INTO product_seller_id, product_title
    FROM public.products
    WHERE product_id = NEW.product_id;
    
    -- 좋아요 누른 사용자 username 가져오기
    SELECT username INTO liker_username
    FROM public.user_profiles 
    WHERE profile_id = NEW.user_id;
    
    -- 자신의 상품에 좋아요를 누른 경우 알림 생성하지 않음
    IF NEW.user_id = product_seller_id THEN
        RETURN NEW;
    END IF;
    
    -- 좋아요 알림 생성 (content에 liker_username과 product_title 포함)
    INSERT INTO public.user_notifications (
        type,
        sender_id,
        receiver_id,
        product_id,
        data
    ) VALUES (
        'Like',
        NEW.user_id,
        product_seller_id,
        NEW.product_id,
        jsonb_build_object(
            'title', 'Product Liked',
            'content', liker_username || ' liked your ' || product_title,
            'product_title', product_title,
            'liker_username', liker_username,
            'notification_key', 'product_liked'
        )
    );
    
    RETURN NEW;
END;
$$;

-- 좋아요 알림 트리거
CREATE TRIGGER like_notification_trigger
AFTER INSERT ON public.product_likes
FOR EACH ROW
EXECUTE FUNCTION public.create_like_notification();

-- 리뷰 알림 생성 함수
CREATE OR REPLACE FUNCTION public.create_review_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    giver_username text;
BEGIN
    -- 리뷰 작성자 username 가져오기
    SELECT username INTO giver_username
    FROM public.user_profiles 
    WHERE profile_id = NEW.giver_id;
    
    -- 리뷰 알림 생성 (받는 사람에게)
    INSERT INTO public.user_notifications (
        type,
        sender_id,
        receiver_id,
        review_id,
        data
    ) VALUES (
        'Reply',
        NEW.giver_id,
        NEW.receiver_id,
        NEW.id,
        jsonb_build_object(
            'title', 'New Review',
            'content', giver_username || ' left a review: ' ||
                CASE 
                    WHEN LENGTH(NEW.review) > 50 THEN LEFT(NEW.review, 50) || '...'
                    ELSE NEW.review
                END,
            'rating', NEW.rating,
            'category', NEW.category,
            'giver_username', giver_username,
            'notification_key', 'new_review'
        )
    );
    
    RETURN NEW;
END;
$$;

-- 리뷰 알림 트리거
CREATE TRIGGER review_notification_trigger
AFTER INSERT ON public.give_and_glow_reviews
FOR EACH ROW
EXECUTE FUNCTION public.create_review_notification();

-- 로컬 팁 좋아요 알림 생성 함수
CREATE OR REPLACE FUNCTION public.create_local_tip_like_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    tip_author_id uuid;
    tip_title text;
    liker_username text;
BEGIN
    -- 팁 작성자 ID와 제목 가져오기
    SELECT author_id, title INTO tip_author_id, tip_title
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
    
    -- 로컬 팁 좋아요 알림 생성 (content에 liker_username과 tip_title 포함)
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
            'content', liker_username || ' liked your tip: ' || tip_title,
            'tip_title', tip_title,
            'liker_username', liker_username,
            'notification_key', 'tip_liked'
        )
    );
    
    RETURN NEW;
END;
$$;

-- 로컬 팁 좋아요 알림 트리거
CREATE TRIGGER local_tip_like_notification_trigger
AFTER INSERT ON public.local_tip_post_likes
FOR EACH ROW
EXECUTE FUNCTION public.create_local_tip_like_notification();