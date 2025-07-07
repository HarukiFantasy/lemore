-- Add review column with default value first
ALTER TABLE "give_and_glow_reviews"
ADD COLUMN "review" text DEFAULT 'Thank you for the generous gift!';

-- Update existing records with proper review text based on category
UPDATE "give_and_glow_reviews"
SET
    "review" = 'Amazing laptop! Works perfectly and the giver was so kind. Everything is in excellent condition.'
WHERE
    "category" = 'electronics'
    AND "review" = 'Thank you for the generous gift!';

UPDATE "give_and_glow_reviews"
SET
    "review" = 'Great yoga mat! Very comfortable and durable. Perfect for my daily practice.'
WHERE
    "category" = 'sports'
    AND "review" = 'Thank you for the generous gift!';

UPDATE "give_and_glow_reviews"
SET
    "review" = 'Beautiful vintage dress! Authentic and in perfect condition. The giver was very thoughtful.'
WHERE
    "category" = 'clothing'
    AND "review" = 'Thank you for the generous gift!';

UPDATE "give_and_glow_reviews"
SET
    "review" = 'Complete Harry Potter collection! All books are in great condition. My kids are thrilled!'
WHERE
    "category" = 'books'
    AND "review" = 'Thank you for the generous gift!';

UPDATE "give_and_glow_reviews"
SET
    "review" = 'Solid coffee table. Minor scratches but very functional. Good for my apartment.'
WHERE
    "category" = 'home'
    AND "review" = 'Thank you for the generous gift!';

UPDATE "give_and_glow_reviews"
SET
    "review" = 'Luxury skincare set! All products are unopened and high quality. So grateful!'
WHERE
    "category" = 'beauty'
    AND "review" = 'Thank you for the generous gift!';

UPDATE "give_and_glow_reviews"
SET
    "review" = 'Fun LEGO set! Complete with instructions. My children love building with it.'
WHERE
    "category" = 'toys'
    AND "review" = 'Thank you for the generous gift!';

UPDATE "give_and_glow_reviews"
SET
    "review" = 'Quality car seat covers! Easy to install and fit perfectly. Great protection.'
WHERE
    "category" = 'automotive'
    AND "review" = 'Thank you for the generous gift!';

UPDATE "give_and_glow_reviews"
SET
    "review" = 'Comfortable ergonomic chair! Perfect for my home office. Very durable construction.'
WHERE
    "category" = 'health'
    AND "review" = 'Thank you for the generous gift!';

UPDATE "give_and_glow_reviews"
SET
    "review" = 'Vintage camera collection! All cameras are in working condition. Great for photography enthusiasts.'
WHERE
    "category" = 'other'
    AND "review" = 'Thank you for the generous gift!';

-- Now make the column NOT NULL
ALTER TABLE "give_and_glow_reviews"
ALTER COLUMN "review"
SET
    NOT NULL;

ALTER TABLE "give_and_glow_reviews"
ALTER COLUMN "review"
DROP DEFAULT;