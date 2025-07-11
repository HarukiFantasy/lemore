-- 10. Local Tip Comments View
CREATE OR REPLACE VIEW local_tip_comments_view AS
SELECT
    c.comment_id,
    c.post_id,
    c.content,
    c.likes,
    c.created_at,
    c.author,
    u.username AS author_username,
    u.avatar_url AS author_avatar,
    u.location AS author_location,
    p.title AS post_title,
    p.category AS post_category
FROM
    local_tip_comments c
    JOIN user_profiles u ON c.author = u.profile_id
    JOIN local_tip_posts p ON c.post_id = p.id;