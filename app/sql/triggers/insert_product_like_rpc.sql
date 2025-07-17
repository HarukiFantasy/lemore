-- RLS 문제를 해결하기 위한 RPC 함수
CREATE OR REPLACE FUNCTION public.insert_product_like_safe(
  product_id_param bigint,
  user_id_param uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 이미 좋아요를 눌렀는지 확인
    IF EXISTS (
        SELECT 1 FROM public.product_likes 
        WHERE product_id = product_id_param 
        AND user_id = user_id_param
    ) THEN
        RAISE EXCEPTION 'Already liked this product';
    END IF;
    
    -- 좋아요 추가
    INSERT INTO public.product_likes (product_id, user_id)
    VALUES (product_id_param, user_id_param);
    
    -- 상품의 좋아요 수 업데이트 (트리거가 있지만 수동으로도 업데이트)
    UPDATE public.products
    SET stats = jsonb_set(stats, '{likes}', to_jsonb((stats->>'likes')::int + 1))
    WHERE product_id = product_id_param;
END;
$$;

-- 좋아요 삭제를 위한 RPC 함수
CREATE OR REPLACE FUNCTION public.delete_product_like_safe(
  product_id_param bigint,
  user_id_param uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 좋아요 삭제
    DELETE FROM public.product_likes 
    WHERE product_id = product_id_param 
    AND user_id = user_id_param;
    
    -- 상품의 좋아요 수 업데이트
    UPDATE public.products
    SET stats = jsonb_set(stats, '{likes}', to_jsonb(GREATEST((stats->>'likes')::int - 1, 0)))
    WHERE product_id = product_id_param;
END;
$$; 