CREATE FUNCTION public.handle_products_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.products
    SET stats = jsonb_set(stats, '{likes}', to_jsonb((stats->>'likes')::int + 1))
    WHERE product_id = NEW.product_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER products_like_trigger
AFTER INSERT ON public.product_likes
FOR EACH ROW
EXECUTE FUNCTION public.handle_products_like();

CREATE FUNCTION public.handle_products_unlike()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.products
    SET stats = jsonb_set(stats, '{likes}', to_jsonb((stats->>'likes')::int - 1))
    WHERE product_id = OLD.product_id;
    RETURN OLD;
END;
$$;

CREATE TRIGGER products_unlike_trigger
AFTER DELETE ON public.product_likes
FOR EACH ROW
EXECUTE FUNCTION public.handle_products_unlike();