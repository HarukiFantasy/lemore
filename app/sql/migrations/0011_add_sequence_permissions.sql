-- Add permissions for sequences
-- This migration grants permissions for sequences used by tables

-- Product sequences
GRANT USAGE, SELECT ON SEQUENCE products_product_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE products_product_id_seq TO anon;

GRANT USAGE, SELECT ON SEQUENCE product_views_view_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE product_views_view_id_seq TO anon;

-- User sequences
GRANT USAGE, SELECT ON SEQUENCE user_messages_message_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_messages_message_id_seq TO anon;

GRANT USAGE, SELECT ON SEQUENCE user_conversations_conversation_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_conversations_conversation_id_seq TO anon;

GRANT USAGE, SELECT ON SEQUENCE user_notifications_notification_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_notifications_notification_id_seq TO anon;

GRANT USAGE, SELECT ON SEQUENCE user_reviews_review_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_reviews_review_id_seq TO anon;

-- Community sequences
GRANT USAGE, SELECT ON SEQUENCE give_and_glow_reviews_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE give_and_glow_reviews_id_seq TO anon;

GRANT USAGE, SELECT ON SEQUENCE local_businesses_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE local_businesses_id_seq TO anon;

GRANT USAGE, SELECT ON SEQUENCE local_tip_posts_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE local_tip_posts_id_seq TO anon;

GRANT USAGE, SELECT ON SEQUENCE local_tip_comments_comment_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE local_tip_comments_comment_id_seq TO anon;

-- Let Go Buddy sequences
GRANT USAGE, SELECT ON SEQUENCE let_go_buddy_sessions_session_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE let_go_buddy_sessions_session_id_seq TO anon;

-- Reference sequences
GRANT USAGE, SELECT ON SEQUENCE categories_category_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE categories_category_id_seq TO anon;

GRANT USAGE, SELECT ON SEQUENCE locations_location_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE locations_location_id_seq TO anon; 