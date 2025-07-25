CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY definer
SET search_path = ''
AS $$
BEGIN
    -- 이메일 로그인 또는 소셜 로그인인 경우 프로필 생성
    IF NEW.raw_app_meta_data IS NOT NULL THEN
        -- 이메일 로그인인 경우
        IF NEW.raw_app_meta_data ? 'provider' AND NEW.raw_app_meta_data ->> 'provider' = 'email' THEN
            IF NEW.raw_user_meta_data ? 'username' THEN
                INSERT INTO public.user_profiles (profile_id, username, email, avatar_url, created_at, updated_at)
                VALUES (
                    NEW.id,
                    NEW.raw_user_meta_data ->> 'username',
                    NEW.email,
                    NEW.raw_user_meta_data ->> 'avatar_url',
                    now(),
                    now()
                );
            ELSE 
                INSERT INTO public.user_profiles (profile_id, username, email, avatar_url, created_at, updated_at)
                VALUES (
                    NEW.id,
                    'username_' || substr(md5(random()::text), 1, 8),
                    NEW.email,
                    NEW.raw_user_meta_data ->> 'avatar_url',
                    now(),
                    now()
                );
            END IF;

        -- 폰번호 로그인인 경우
        ELSIF NEW.raw_app_meta_data ? 'provider' AND NEW.raw_app_meta_data ->> 'provider' = 'phone' THEN
            IF NEW.raw_user_meta_data ? 'username' THEN
                INSERT INTO public.user_profiles (profile_id, username, phone, created_at, updated_at)
                VALUES (
                    NEW.id,
                    NEW.raw_user_meta_data ->> 'username',
                    NEW.phone,
                    now(),
                    now()
                );
            ELSE 
                INSERT INTO public.user_profiles (profile_id, username, phone, created_at, updated_at)
                VALUES (
                    NEW.id,
                    'username_' || substr(md5(random()::text), 1, 8),
                    NEW.phone,
                    now(),
                    now()
                );
            END IF;

        -- 소셜 로그인인 경우 (google, facebook 등)
        ELSIF NEW.raw_app_meta_data ? 'provider' AND NEW.raw_app_meta_data ->> 'provider' IN ('google', 'facebook') THEN
            INSERT INTO public.user_profiles (profile_id, username, email, avatar_url, created_at, updated_at)
            VALUES (
                NEW.id,
                COALESCE(
                    split_part(NEW.email, '@', 1) || '_' || substr(md5(random()::text), 1, 5),
                    NEW.raw_user_meta_data ->> 'user'
                ),
                NEW.email,
                NEW.raw_user_meta_data ->> 'avatar_url',
                now(),
                now()
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- 트리거도 다시 재생성
DROP TRIGGER IF EXISTS user_to_profile_trigger ON auth.users;

CREATE TRIGGER user_to_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();