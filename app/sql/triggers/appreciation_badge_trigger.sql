-- Function to update appreciation badge status for a user
create or replace function public.update_appreciation_badge()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    -- Update appreciation badge for the giver based on their reviews
    update public.user_profiles 
    set appreciation_badge = (
        select count(*) > 0
        from public.give_and_glow_reviews
        where giver_id = coalesce(new.giver_id, old.giver_id)
        and rating > 4
    )
    where profile_id = coalesce(new.giver_id, old.giver_id);
    
    return coalesce(new, old);
end;
$$;

-- Trigger for INSERT operations
create trigger appreciation_badge_insert_trigger
after insert on public.give_and_glow_reviews
for each row execute function public.update_appreciation_badge();

-- Trigger for UPDATE operations
create trigger appreciation_badge_update_trigger
after update on public.give_and_glow_reviews
for each row execute function public.update_appreciation_badge();

-- Trigger for DELETE operations
create trigger appreciation_badge_delete_trigger
after delete on public.give_and_glow_reviews
for each row execute function public.update_appreciation_badge();