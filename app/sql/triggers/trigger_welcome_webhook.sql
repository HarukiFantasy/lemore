-- 기존 잘못된 함수 삭제
DROP FUNCTION IF EXISTS public.trigger_welcome_webhook () CASCADE;

CREATE OR REPLACE FUNCTION public.trigger_welcome_webhook()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    -- user_profiles에 insert가 발생하면 웹훅 호출
    PERFORM net.http_get(
        url := 'https://lemore.life/users/' || NEW.username || '/welcome'
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER welcome_webhook_trigger
AFTER INSERT ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_welcome_webhook();