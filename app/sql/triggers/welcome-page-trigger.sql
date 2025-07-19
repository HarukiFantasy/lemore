-- 간단한 웰컴 이메일 트리거 함수
CREATE OR REPLACE FUNCTION simple_welcome_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    welcome_url TEXT;
BEGIN
    -- 이메일과 username이 있는 경우에만 실행
    IF NEW.email IS NOT NULL AND NEW.username IS NOT NULL THEN
        
        -- 웰컴 페이지 URL 생성
        welcome_url := 'https://lemore.life/users/' || NEW.username || '/welcome';
        
        -- HTTP GET 요청 (간단하게, 에러 무시)
        BEGIN
            PERFORM http_get(welcome_url);
        EXCEPTION
            WHEN OTHERS THEN
                -- 에러 발생해도 무시하고 계속 진행
                NULL;
        END;
        
    END IF;
    
    RETURN NEW;
END;
$$;

-- 간단한 트리거 생성
CREATE TRIGGER simple_welcome_trigger
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION simple_welcome_trigger();

-- 트리거 생성 완료
SELECT 'Simple welcome trigger created!' as status;