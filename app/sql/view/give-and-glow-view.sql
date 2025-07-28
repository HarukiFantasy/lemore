DROP VIEW IF EXISTS give_and_glow_view CASCADE;

-- 4. Give and Glow View
CREATE OR REPLACE VIEW give_and_glow_view AS
SELECT
    r.id,
    r.category,
    r.rating,
    r.review,
    r.timestamp,
    r.tags,
    r.created_at,
    r.updated_at,
    r.giver_id,
    r.receiver_id,
    r.product_id,
    r.location,
    -- Giver profile data
    giver_profile.username as giver_username,
    giver_profile.avatar_url as giver_avatar_url,
    giver_profile.profile_id as giver_profile_id,
    -- Receiver profile data
    receiver_profile.username as receiver_username,
    receiver_profile.avatar_url as receiver_avatar_url,
    receiver_profile.profile_id as receiver_profile_id,
    -- Product data (LEFT JOIN to allow reviews without products)
    COALESCE(p.title, 'Unknown Item') as product_title,
    COALESCE(p.location, r.location) as product_location,
    COALESCE(
        p.description,
        'Free item received'
    ) as product_description
FROM
    public.give_and_glow_reviews r
    INNER JOIN public.user_profiles giver_profile ON r.giver_id = giver_profile.profile_id
    INNER JOIN public.user_profiles receiver_profile ON r.receiver_id = receiver_profile.profile_id
    LEFT JOIN public.products p ON r.product_id = p.product_id;