CREATE OR REPLACE VIEW local_reviews_list_view AS
SELECT
    r.business_id,
    b.name AS business_name,
    b.type AS business_type,
    r.rating,
    r.author,
    u.username AS author_username,
    u.avatar_url AS author_avatar,
    r.tags,
    r.created_at,
    r.content
FROM
    local_business_reviews r
    JOIN local_businesses b ON r.business_id = b.id
    JOIN user_profiles u ON r.author = u.profile_id;