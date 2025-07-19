-- 토큰 생성 및 웰컴 이메일 발송 함수
CREATE OR REPLACE FUNCTION send_welcome_email_immediately()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    webhook_url TEXT;
    welcome_token TEXT;
    token_payload TEXT;
    response_status INTEGER;
    response_body TEXT;
    http_response http_response_result;
    welcome_secret TEXT := 'lemore-welcome-secret-2024'; -- 환경변수 대신 하드코딩 (나중에 변경 가능)
BEGIN
    -- 이메일과 username이 있는 경우에만 처리
    IF NEW.email IS NOT NULL AND NEW.username IS NOT NULL THEN
        
        -- 1. 보안 토큰 생성 (username:created_at:secret의 base64)
        token_payload := NEW.username || ':' || NEW.created_at || ':' || welcome_secret;
        welcome_token := encode(token_payload::bytea, 'base64');
        
        -- 2. 토큰을 포함한 URL 생성
        webhook_url := 'https://lemore.life/users/' || NEW.username || '/welcome?token=' || welcome_token;
        
        -- 3. HTTP GET 요청 발송 (5초 타임아웃)
        BEGIN
            SELECT * INTO http_response
            FROM http_get(webhook_url);
            
            response_status := http_response.status;
            response_body := http_response.content;
            
        EXCEPTION
            WHEN OTHERS THEN
                response_status := 0;
                response_body := 'HTTP request failed: ' || SQLERRM;
        END;
        
        -- 4. 로그 기록
        RAISE NOTICE 'Welcome email trigger fired for user: %, Status: %, Token: %', 
                     NEW.username, response_status, LEFT(welcome_token, 20) || '...';
        
        -- 5. 성공/실패에 따른 알림 생성
        IF response_status = 200 THEN
            INSERT INTO user_notifications (
                type,
                sender_id,
                receiver_id,
                data
            ) VALUES (
                'Mention',
                NEW.profile_id,
                NEW.profile_id,
                jsonb_build_object(
                    'title', 'Welcome Email Triggered',
                    'content', 'Welcome email has been triggered successfully',
                    'notification_key', 'welcome_email_triggered',
                    'status_code', response_status,
                    'triggered_at', NOW()
                )
            );
        ELSE
            INSERT INTO user_notifications (
                type,
                sender_id,
                receiver_id,
                data
            ) VALUES (
                'Mention',
                NEW.profile_id,
                NEW.profile_id,
                jsonb_build_object(
                    'title', 'Welcome Email Failed',
                    'content', 'Welcome email trigger failed, please contact support',
                    'notification_key', 'welcome_email_failed',
                    'status_code', response_status,
                    'error_message', LEFT(response_body, 200),
                    'failed_at', NOW()
                )
            );
        END IF;
        
    ELSE
        RAISE NOTICE 'Skipping welcome email - missing email or username. Profile ID: %', NEW.profile_id;
    END IF;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Critical error in welcome email trigger: %', SQLERRM;
        
        BEGIN
            INSERT INTO user_notifications (
                type,
                sender_id,
                receiver_id,
                data
            ) VALUES (
                'Mention',
                NEW.profile_id,
                NEW.profile_id,
                jsonb_build_object(
                    'title', 'Welcome Email System Error',
                    'content', 'A system error occurred while sending welcome email',
                    'notification_key', 'welcome_email_error',
                    'error_message', SQLERRM,
                    'error_at', NOW()
                )
            );
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Failed to create error notification: %', SQLERRM;
        END;
        
        RETURN NEW;
END;
$$;

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS welcome_email_immediate_trigger ON user_profiles;
DROP TRIGGER IF EXISTS welcome_email_trigger ON user_profiles;

-- 새 트리거 생성
CREATE TRIGGER welcome_email_secure_trigger
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION send_welcome_email_immediately();