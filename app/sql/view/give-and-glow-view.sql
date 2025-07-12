-- 4. Give and Glow View
CREATE OR REPLACE VIEW give_and_glow_view AS
SELECT
    give_and_glow_reviews.id,
    give_and_glow_reviews.category,
    give_and_glow_reviews.rating,
    give_and_glow_reviews.review,
    give_and_glow_reviews.timestamp,
    give_and_glow_reviews.tags,
    give_and_glow_reviews.created_at,
    give_and_glow_reviews.updated_at,
    give_and_glow_reviews.giver_id,
    give_and_glow_reviews.receiver_id,
    give_and_glow_reviews.product_id,
    give_and_glow_reviews.location,
    -- Giver profile data
    giver_profile.username as giver_username,
    giver_profile.avatar_url as giver_avatar_url,
    giver_profile.profile_id as giver_profile_id,
    -- Receiver profile data
    receiver_profile.username as receiver_username,
    receiver_profile.avatar_url as receiver_avatar_url,
    receiver_profile.profile_id as receiver_profile_id,
    -- Product data (LEFT JOIN to allow reviews without products)
    COALESCE(products.title, 'Unknown Item') as product_title,
    COALESCE(products.location, give_and_glow_reviews.location) as product_location,
    COALESCE(products.description, 'Free item received') as product_description
FROM
    give_and_glow_reviews
    INNER JOIN user_profiles giver_profile ON give_and_glow_reviews.giver_id = giver_profile.profile_id
    INNER JOIN user_profiles receiver_profile ON give_and_glow_reviews.receiver_id = receiver_profile.profile_id
    LEFT JOIN products ON give_and_glow_reviews.product_id = products.product_id;