CREATE OR REPLACE VIEW local_tips_list_view AS
SELECT local_tip_posts.id, local_tip_posts.title, local_tip_posts.content, local_tip_posts.category, local_tip_posts.location, local_tip_posts.author, local_tip_posts.stats, local_tip_posts.created_at, local_tip_posts.updated_at
FROM
    local_tip_posts
    INNER JOIN user_profiles ON local_tip_posts.author = user_profiles.profile_id
    INNER JOIN local_tip_comments ON local_tip_posts.id = local_tip_comments.post_id
GROUP BY
    local_tip_posts.id,
    local_tip_posts.title,
    local_tip_posts.content,
    local_tip_posts.category,
    local_tip_posts.location,
    local_tip_posts.author,
    local_tip_posts.stats,
    local_tip_posts.created_at,
    local_tip_posts.updated_at;