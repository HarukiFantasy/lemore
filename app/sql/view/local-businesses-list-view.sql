-- 5. Local Businesses List View
CREATE OR REPLACE VIEW local_businesses_list_view AS
SELECT
    b.id,
    b.name,
    b.type,
    b.location,
    b.image,
    b.tags,
    b.price_range,
    b.address,
    b.website,
    b.description,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    COUNT(r.rating) AS total_reviews
FROM
    local_businesses b
    LEFT JOIN local_business_reviews r ON b.id = r.business_id
GROUP BY
    b.id;