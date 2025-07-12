-- Add permissions for all tables
-- Add permissions for all tables to authenticated and anon users
-- This migration grants appropriate permissions for development environment

-- Core product tables
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT ON products TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON product_likes TO authenticated;
GRANT SELECT ON product_likes TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON product_views TO authenticated;
GRANT SELECT ON product_views TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON product_images TO authenticated;
GRANT SELECT ON product_images TO anon;

-- User related tables
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_messages TO authenticated;
GRANT SELECT ON user_messages TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_conversations TO authenticated;
GRANT SELECT ON user_conversations TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON message_participants TO authenticated;
GRANT SELECT ON message_participants TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_notifications TO authenticated;
GRANT SELECT ON user_notifications TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_reviews TO authenticated;
GRANT SELECT ON user_reviews TO anon;

-- Community tables
GRANT SELECT, INSERT, UPDATE, DELETE ON give_and_glow_reviews TO authenticated;
GRANT SELECT ON give_and_glow_reviews TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON local_businesses TO authenticated;
GRANT SELECT ON local_businesses TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON local_business_reviews TO authenticated;
GRANT SELECT ON local_business_reviews TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON local_tip_posts TO authenticated;
GRANT SELECT ON local_tip_posts TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON local_tip_comments TO authenticated;
GRANT SELECT ON local_tip_comments TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON local_tip_post_likes TO authenticated;
GRANT SELECT ON local_tip_post_likes TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON local_tip_comment_likes TO authenticated;
GRANT SELECT ON local_tip_comment_likes TO anon;

-- Let Go Buddy tables
GRANT SELECT, INSERT, UPDATE, DELETE ON let_go_buddy_sessions TO authenticated;
GRANT SELECT ON let_go_buddy_sessions TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON item_analyses TO authenticated;
GRANT SELECT ON item_analyses TO anon;

-- Reference tables
GRANT SELECT ON categories TO authenticated;
GRANT SELECT ON categories TO anon;

GRANT SELECT ON locations TO authenticated;
GRANT SELECT ON locations TO anon;