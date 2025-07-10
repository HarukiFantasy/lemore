CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY definer
SET search_path = ''
AS $$
BEGIN
    IF new.raw_app_meta_data is not null THEN
        IF new.raw_app_meta_data ? 'provider' AND new.raw_app_meta_data ->> 'provider' = 'email' THEN
            IF new.raw_user_meta_data ? 'username' THEN
                INSERT INTO public.user_profiles (profile_id, username, email, created_at, updated_at)
                values (
                    new.id,
                    new.raw_user_meta_data ->> 'username',
                    new.email,
                    now(),
                    now()
                );
            ELSE 
                INSERT INTO public.user_profiles (profile_id, username, email, created_at, updated_at)
                values (
                    new.id,
                    'username' || substr(md5(random()::text), 1, 8),
                    new.email,
                    now(),
                    now()
                );
            END IF;
        END IF;
    END IF;
    RETURN new;
END;
$$;

CREATE TRIGGER user_to_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();