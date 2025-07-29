CREATE OR REPLACE FUNCTION public.get_or_create_conversation_with_participants(
    p_user_id uuid,
    p_other_user_id uuid,
    p_product_id bigint DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_conversation_id bigint;
    v_conversation_row public.user_conversations;
BEGIN
    -- Check if a conversation already exists between these two users for this product
    SELECT
        c.conversation_id INTO v_conversation_id
    FROM
        public.message_participants p1
        JOIN public.message_participants p2 ON p1.conversation_id = p2.conversation_id
        JOIN public.user_conversations c ON p1.conversation_id = c.conversation_id
    WHERE
        p1.profile_id = p_user_id
        AND p2.profile_id = p_other_user_id
        AND (p_product_id IS NULL OR c.product_id = p_product_id);

    -- If conversation exists, return it
    IF v_conversation_id IS NOT NULL THEN
        SELECT * INTO v_conversation_row FROM public.user_conversations WHERE conversation_id = v_conversation_id;
        RETURN row_to_json(v_conversation_row);
    END IF;

    -- If not, create a new conversation
    INSERT INTO public.user_conversations (product_id)
    VALUES (p_product_id)
    RETURNING * INTO v_conversation_row;
    
    v_conversation_id := v_conversation_row.conversation_id;

    -- Add both participants to the new conversation
    INSERT INTO public.message_participants (conversation_id, profile_id)
    VALUES (v_conversation_id, p_user_id), (v_conversation_id, p_other_user_id);

    -- Return the newly created conversation
    RETURN row_to_json(v_conversation_row);
END;
$$;