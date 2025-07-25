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
    up.rating,
    up.appreciation_badge,
    up.created_at,
    up.updated_at,
    up.level -- 추가: 유저 레벨
FROM auth.users u
    LEFT JOIN user_profiles up ON u.id = up.profile_id;