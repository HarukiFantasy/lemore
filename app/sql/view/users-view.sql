-- 7. Users View
CREATE OR REPLACE VIEW users_view AS
SELECT
    u.id as user_id,
    up.profile_id,
    up.username,
    up.email,
    up.avatar_url,
    up.bio,
    up.location,
    up.total_likes,
    up.total_views,
    up.total_listings,
    up.response_rate,
    up.response_time,
    up.rating,
    up.appreciation_badge,
    up.created_at,
    up.updated_at
FROM auth.users u
    LEFT JOIN user_profiles up ON u.id = up.profile_id;