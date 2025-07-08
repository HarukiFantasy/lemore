-- 뷰 업데이트
CREATE OR REPLACE VIEW local_tips_list_view AS
SELECT local_tip_posts.id, local_tip_posts.title, local_tip_posts.content, local_tip_posts.category, local_tip_posts.location, local_tip_posts.author, local_tip_posts.stats, local_tip_posts.created_at, local_tip_posts.updated_at, user_profiles.username, user_profiles.avatar_url
FROM
    local_tip_posts
    LEFT JOIN user_profiles ON local_tip_posts.author = user_profiles.profile_id;

-- 권한 부여
GRANT SELECT ON local_tips_list_view TO anon;

GRANT SELECT ON local_tips_list_view TO authenticated;