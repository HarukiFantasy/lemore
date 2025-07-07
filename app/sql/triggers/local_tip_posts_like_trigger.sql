CREATE FUNCTION public.handle_local_tip_post_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.local_tip_posts
    SET stats = jsonb_set(stats, '{likes}', to_jsonb((stats->>'likes')::int + 1))
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER local_tip_posts_like_trigger
AFTER INSERT ON public.local_tip_post_likes
FOR EACH ROW
EXECUTE FUNCTION public.handle_local_tip_post_like();

CREATE FUNCTION public.handle_local_tip_post_unlike()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.local_tip_posts
    SET stats = jsonb_set(stats, '{likes}', to_jsonb((stats->>'likes')::int - 1))
    WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$;

CREATE TRIGGER local_tip_posts_unlike_trigger
AFTER DELETE ON public.local_tip_post_likes
FOR EACH ROW
EXECUTE FUNCTION public.handle_local_tip_post_unlike();