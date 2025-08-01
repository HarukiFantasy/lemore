-- CASCADE 옵션으로 강제 삭제
DROP TRIGGER IF EXISTS user_to_profile_trigger ON auth.users;

DROP FUNCTION IF EXISTS public.handle_new_user ();

-- 트리거 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY definer
SET search_path = public, auth
AS $$
BEGIN
    RAISE NOTICE 'raw_user_meta_data: %', NEW.raw_user_meta_data;

    -- 중복 삽입 방지
    IF EXISTS (SELECT 1 FROM public.user_profiles WHERE profile_id = NEW.id) THEN
      RETURN NEW;
    END IF;

    -- 이메일 로그인, 소셜 로그인, 폰 로그인 처리
    IF new.raw_app_meta_data IS NOT NULL THEN
        IF new.raw_app_meta_data ? 'provider' AND new.raw_app_meta_data ->> 'provider' = 'email' THEN
            INSERT INTO public.user_profiles (profile_id, username, email, avatar_url, created_at, updated_at)
            VALUES (
                new.id,
                COALESCE(
                  new.raw_user_meta_data ->> 'username',
                  'username_' || substr(md5(random()::text), 1, 8)
                ),
                new.email,
                new.raw_user_meta_data ->> 'avatar_url',
                now(),
                now()
            );

        ELSIF new.raw_app_meta_data ? 'provider' AND new.raw_app_meta_data ->> 'provider' = 'phone' THEN
            INSERT INTO public.user_profiles (profile_id, username, phone, created_at, updated_at)
            VALUES (
                new.id,
                COALESCE(
                  new.raw_user_meta_data ->> 'username',
                  'username_' || substr(md5(random()::text), 1, 8)
                ),
                new.phone,
                now(),
                now()
            );

        ELSIF new.raw_app_meta_data ? 'provider' AND new.raw_app_meta_data ->> 'provider' IN ('google', 'facebook') THEN
            INSERT INTO public.user_profiles (profile_id, username, email, avatar_url, created_at, updated_at)
            VALUES (
                new.id,
                -- Use email to create a unique username, fallback to a random string if email is null
                COALESCE(
                    split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4),
                    'user_' || substr(new.id::text, 1, 8)
                ),
                new.email,
                new.raw_user_meta_data ->> 'avatar_url',
                now(),
                now()
            );
        END IF;
    END IF;
    RETURN new;
END;
$$;

CREATE TRIGGER user_to_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();