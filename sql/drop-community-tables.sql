-- Drop community feature tables that are no longer needed
-- Execute these statements in Supabase SQL Editor

-- Drop tables in dependency order (child tables first, then parent tables)

-- Drop like/comment tables first (they reference posts/replies)
DROP TABLE IF EXISTS local_tip_comment_likes CASCADE;
DROP TABLE IF EXISTS local_tip_post_likes CASCADE;

-- Drop replies table (references posts)
DROP TABLE IF EXISTS local_tip_replies CASCADE;

-- Drop posts table (references businesses and users)
DROP TABLE IF EXISTS local_tip_posts CASCADE;

-- Drop review tables
DROP TABLE IF EXISTS give_and_glow_reviews CASCADE;
DROP TABLE IF EXISTS local_business_reviews CASCADE;

-- Drop businesses table last
DROP TABLE IF EXISTS local_businesses CASCADE;

-- Note: The CASCADE option will automatically drop any dependent objects
-- like foreign key constraints, indexes, triggers, etc.