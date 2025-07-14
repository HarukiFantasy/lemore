ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "give_and_glow_reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "item_analyses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "let_go_buddy_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "local_business_reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "local_businesses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "local_tip_comment_likes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "local_tip_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "local_tip_post_likes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "local_tip_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "locations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "message_participants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_images" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_likes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_views" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_conversations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE POLICY "categories_select_policy" ON "categories" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "give_and_glow_reviews_select_policy" ON "give_and_glow_reviews" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "give_and_glow_reviews_insert_policy" ON "give_and_glow_reviews" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("give_and_glow_reviews"."giver_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "give_and_glow_reviews_delete_policy" ON "give_and_glow_reviews" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("give_and_glow_reviews"."giver_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "give_and_glow_reviews_update_policy" ON "give_and_glow_reviews" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("give_and_glow_reviews"."giver_id" = (select auth.uid())) WITH CHECK ("give_and_glow_reviews"."giver_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "item_analyses_select_policy" ON "item_analyses" AS PERMISSIVE FOR SELECT TO "authenticated" USING (EXISTS (
      SELECT 1 FROM let_go_buddy_sessions lgbs 
      WHERE lgbs.session_id = "item_analyses"."session_id" 
      AND lgbs.user_id = (select auth.uid())
    ));--> statement-breakpoint
CREATE POLICY "item_analyses_insert_policy" ON "item_analyses" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (EXISTS (
      SELECT 1 FROM let_go_buddy_sessions lgbs 
      WHERE lgbs.session_id = "item_analyses"."session_id" 
      AND lgbs.user_id = (select auth.uid())
    ));--> statement-breakpoint
CREATE POLICY "item_analyses_update_policy" ON "item_analyses" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (EXISTS (
      SELECT 1 FROM let_go_buddy_sessions lgbs 
      WHERE lgbs.session_id = "item_analyses"."session_id" 
      AND lgbs.user_id = (select auth.uid())
    )) WITH CHECK (EXISTS (
      SELECT 1 FROM let_go_buddy_sessions lgbs 
      WHERE lgbs.session_id = "item_analyses"."session_id" 
      AND lgbs.user_id = (select auth.uid())
    ));--> statement-breakpoint
CREATE POLICY "item_analyses_delete_policy" ON "item_analyses" AS PERMISSIVE FOR DELETE TO "authenticated" USING (EXISTS (
      SELECT 1 FROM let_go_buddy_sessions lgbs 
      WHERE lgbs.session_id = "item_analyses"."session_id" 
      AND lgbs.user_id = (select auth.uid())
    ));--> statement-breakpoint
CREATE POLICY "let_go_buddy_sessions_select_policy" ON "let_go_buddy_sessions" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("let_go_buddy_sessions"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "let_go_buddy_sessions_insert_policy" ON "let_go_buddy_sessions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("let_go_buddy_sessions"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "let_go_buddy_sessions_update_policy" ON "let_go_buddy_sessions" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("let_go_buddy_sessions"."user_id" = (select auth.uid())) WITH CHECK ("let_go_buddy_sessions"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "let_go_buddy_sessions_delete_policy" ON "let_go_buddy_sessions" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("let_go_buddy_sessions"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "local_business_reviews_select_policy" ON "local_business_reviews" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "local_business_reviews_insert_policy" ON "local_business_reviews" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("local_business_reviews"."author" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "local_business_reviews_update_policy" ON "local_business_reviews" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("local_business_reviews"."author" = (select auth.uid())) WITH CHECK ("local_business_reviews"."author" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "local_businesses_select_policy" ON "local_businesses" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "local_businesses_insert_policy" ON "local_businesses" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "local_tip_comment_likes_select_policy" ON "local_tip_comment_likes" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "local_tip_comment_likes_insert_policy" ON "local_tip_comment_likes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("local_tip_comment_likes"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "local_tip_comment_likes_delete_policy" ON "local_tip_comment_likes" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("local_tip_comment_likes"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "local_tip_comments_select_policy" ON "local_tip_comments" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "local_tip_comments_insert_policy" ON "local_tip_comments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("local_tip_comments"."author" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "local_tip_comments_update_policy" ON "local_tip_comments" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("local_tip_comments"."author" = (select auth.uid())) WITH CHECK ("local_tip_comments"."author" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "local_tip_comments_delete_policy" ON "local_tip_comments" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("local_tip_comments"."author" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "local_tip_post_likes_select_policy" ON "local_tip_post_likes" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "local_tip_post_likes_insert_policy" ON "local_tip_post_likes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("local_tip_post_likes"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "local_tip_post_likes_delete_policy" ON "local_tip_post_likes" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("local_tip_post_likes"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "local_tip_posts_select_policy" ON "local_tip_posts" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "local_tip_posts_insert_policy" ON "local_tip_posts" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("local_tip_posts"."author" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "local_tip_posts_update_policy" ON "local_tip_posts" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("local_tip_posts"."author" = (select auth.uid())) WITH CHECK ("local_tip_posts"."author" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "local_tip_posts_delete_policy" ON "local_tip_posts" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("local_tip_posts"."author" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "locations_select_policy" ON "locations" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "message_participants_select_policy" ON "message_participants" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("message_participants"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "message_participants_insert_policy" ON "message_participants" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("message_participants"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "message_participants_delete_policy" ON "message_participants" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("message_participants"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "product_images_select_policy" ON "product_images" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "product_images_insert_policy" ON "product_images" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "product_images_update_policy" ON "product_images" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "product_images_delete_policy" ON "product_images" AS PERMISSIVE FOR DELETE TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "product_likes_select_policy" ON "product_likes" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "product_likes_insert_policy" ON "product_likes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("product_likes"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "product_likes_delete_policy" ON "product_likes" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("product_likes"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "product_views_select_policy" ON "product_views" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "product_views_insert_policy" ON "product_views" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "product_views_delete_policy" ON "product_views" AS PERMISSIVE FOR DELETE TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "products_select_policy" ON "products" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "products_insert_policy" ON "products" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("products"."seller_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "products_update_policy" ON "products" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("products"."seller_id" = (select auth.uid())) WITH CHECK ("products"."seller_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_conversations_select_policy" ON "user_conversations" AS PERMISSIVE FOR SELECT TO "authenticated" USING (EXISTS (
      SELECT 1 FROM message_participants mp 
      WHERE mp.conversation_id = "user_conversations"."conversation_id" 
      AND mp.profile_id = (select auth.uid())
    ));--> statement-breakpoint
CREATE POLICY "user_conversations_insert_policy" ON "user_conversations" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "user_messages_select_policy" ON "user_messages" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("user_messages"."sender_id" = (select auth.uid()) OR "user_messages"."receiver_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_messages_insert_policy" ON "user_messages" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("user_messages"."sender_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_messages_update_policy" ON "user_messages" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("user_messages"."sender_id" = (select auth.uid())) WITH CHECK ("user_messages"."sender_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_messages_delete_policy" ON "user_messages" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("user_messages"."sender_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_notifications_select_policy" ON "user_notifications" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("user_notifications"."receiver_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_notifications_insert_policy" ON "user_notifications" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("user_notifications"."sender_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_notifications_update_policy" ON "user_notifications" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("user_notifications"."receiver_id" = (select auth.uid())) WITH CHECK ("user_notifications"."receiver_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_profiles_select_policy" ON "user_profiles" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "user_profiles_insert_policy" ON "user_profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "user_profiles"."profile_id");--> statement-breakpoint
CREATE POLICY "user_profiles_update_policy" ON "user_profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "user_profiles"."profile_id") WITH CHECK ((select auth.uid()) = "user_profiles"."profile_id");--> statement-breakpoint
CREATE POLICY "user_profiles_delete_policy" ON "user_profiles" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "user_profiles"."profile_id");--> statement-breakpoint
CREATE POLICY "user_reviews_select_policy" ON "user_reviews" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "user_reviews_insert_policy" ON "user_reviews" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("user_reviews"."reviewer_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_reviews_delete_policy" ON "user_reviews" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("user_reviews"."reviewer_id" = (select auth.uid()));