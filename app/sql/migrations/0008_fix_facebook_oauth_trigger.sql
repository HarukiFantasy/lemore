-- Fix Facebook OAuth trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY definer
SET search_path = ''
AS $$
BEGIN
    -- 이메일 로그인 또는 소셜 로그인인 경우 프로필 생성
    IF new.raw_app_meta_data is not null THEN
        -- 이메일 로그인인 경우
        IF new.raw_app_meta_data ? 'provider' AND new.raw_app_meta_data ->> 'provider' = 'email' THEN
            IF new.raw_user_meta_data ? 'username' THEN
                INSERT INTO public.user_profiles (profile_id, username, email, avatar_url, created_at, updated_at)
                values (
                    new.id,
                    new.raw_user_meta_data ->> 'username',
                    new.email,
                    new.raw_user_meta_data ->> 'avatar_url',
                    now(),
                    now()
                );
            ELSE 
                INSERT INTO public.user_profiles (profile_id, username, email, avatar_url, created_at, updated_at)
                values (
                    new.id,
                    'username' || substr(md5(random()::text), 1, 8),
                    new.email,
                    new.raw_user_meta_data ->> 'avatar_url',
                    now(),
                    now()
                );
            END IF;
        -- 폰번호 로그인인 경우
        ELSIF new.raw_app_meta_data ? 'provider' AND new.raw_app_meta_data ->> 'provider' = 'phone' THEN
            IF new.raw_user_meta_data ? 'username' THEN
                INSERT INTO public.user_profiles (profile_id, username, phone, created_at, updated_at)
                values (
                    new.id,
                    new.raw_user_meta_data ->> 'username',
                    new.phone,
                    now(),
                    now()
                );
            ELSE 
                INSERT INTO public.user_profiles (profile_id, username, phone, created_at, updated_at)
                values (
                    new.id,
                    'username' || substr(md5(random()::text), 1, 8),
                    new.phone,
                    now(),
                    now()
                );
            END IF;
        -- 소셜 로그인인 경우 (google, facebook 등)
        ELSIF new.raw_app_meta_data ? 'provider' AND new.raw_app_meta_data ->> 'provider' IN ('google', 'facebook') THEN
            -- 소셜 로그인의 경우 이메일을 기반으로 username 생성
            INSERT INTO public.user_profiles (profile_id, username, email, avatar_url, created_at, updated_at)
            values (
                new.id,
                COALESCE(
                    split_part(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 5), -- 이메일 @앞부분 + 랜덤 6자리
                    new.raw_user_meta_data ->> 'user'  -- 이메일이 없는 경우 user 항목 생성
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