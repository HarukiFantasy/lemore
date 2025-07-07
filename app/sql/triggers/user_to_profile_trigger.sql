create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if new.raw_app_meta_data is not null then
        if new.raw_app_meta_data ? 'provider' AND new.raw_app_meta_data ->> 'provider' = 'email' then
            insert into public.user_profiles (profile_id, username, email, location, total_likes, total_views, total_listings, response_rate, response_time, rating, created_at, updated_at)
            values (
                new.id,
                'username' || substr(md5(random()::text), 1, 8),
                new.email,
                (ARRAY['Bangkok', 'ChiangMai', 'Huahin'])[floor(random() * 3 + 1)],
                floor(random() * 100 + 1),
                floor(random() * 100 + 1),
                floor(random() * 100 + 1),
                round((random() * 50 + 50)::numeric, 2),
                '< 1 hour',
                round((random() * 5 + 1)::numeric, 2),
                now(),
                now()
            );
        end if;
    end if;
    return new;
end;
$$;

create trigger user_to_profile_trigger
after insert on auth.users
for each row execute function public.handle_new_user();