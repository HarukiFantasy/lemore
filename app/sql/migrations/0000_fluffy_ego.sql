CREATE TYPE "public"."country" AS ENUM('Thailand', 'Korea');--> statement-breakpoint
CREATE TYPE "public"."declutter_situation" AS ENUM('Moving', 'Minimalism', 'Spring Cleaning', 'Other');--> statement-breakpoint
CREATE TYPE "public"."environmental_impact_level" AS ENUM('Low', 'Medium', 'High', 'Critical');--> statement-breakpoint
CREATE TYPE "public"."location" AS ENUM('Bangkok', 'ChiangMai', 'Phuket', 'HuaHin', 'Pattaya', 'Krabi', 'Koh Samui', 'Other Thai Cities', 'Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan', 'Other Korean Cities');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('Text', 'Image', 'File', 'Audio', 'Video', 'Location');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('Message', 'Like', 'Reply', 'Mention');--> statement-breakpoint
CREATE TYPE "public"."price_type" AS ENUM('Fixed', 'Negotiable', 'Free', 'Auction');--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys', 'Automotive', 'Health', 'Other');--> statement-breakpoint
CREATE TYPE "public"."product_condition" AS ENUM('New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor');--> statement-breakpoint
CREATE TYPE "public"."recommendation_action" AS ENUM('Keep', 'Sell', 'Donate', 'Recycle', 'Repair', 'Repurpose', 'Discard');--> statement-breakpoint
CREATE TYPE "public"."user_level" AS ENUM('Explorer', 'Connector', 'Sharer', 'Glowmaker', 'Legend');--> statement-breakpoint
CREATE TABLE "categories" (
	"category_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" "product_category" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "item_analyses" (
	"analysis_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" bigint NOT NULL,
	"item_name" text NOT NULL,
	"item_category" "product_category" NOT NULL,
	"item_condition" "product_condition" NOT NULL,
	"recommendation" "recommendation_action" NOT NULL,
	"recommendation_reason" text,
	"ai_suggestion" text NOT NULL,
	"emotional_score" integer NOT NULL,
	"environmental_impact" "environmental_impact_level" NOT NULL,
	"co2_impact" numeric(10, 2) NOT NULL,
	"landfill_impact" text NOT NULL,
	"is_recyclable" boolean NOT NULL,
	"original_price" numeric(10, 2),
	"current_value" numeric(10, 2),
	"ai_listing_price" numeric(10, 2),
	"maintenance_cost" numeric(10, 2) DEFAULT '0',
	"space_value" numeric(10, 2) DEFAULT '0',
	"ai_listing_title" text,
	"ai_listing_description" text,
	"ai_listing_location" "location",
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "item_analyses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "let_go_buddy_sessions" (
	"session_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "let_go_buddy_sessions_session_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"situation" "declutter_situation" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "let_go_buddy_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "locations" (
	"location_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "locations_location_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" "location" NOT NULL,
	"country" "country" NOT NULL,
	"display_name" text NOT NULL,
	"currency" text NOT NULL,
	"timezone" text NOT NULL,
	"population" integer,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "locations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "message_participants" (
	"conversation_id" bigint NOT NULL,
	"profile_id" uuid NOT NULL,
	"is_hidden" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "message_participants_conversation_id_profile_id_pk" PRIMARY KEY("conversation_id","profile_id")
);
--> statement-breakpoint
ALTER TABLE "message_participants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "product_images" (
	"product_id" bigint NOT NULL,
	"image_url" text NOT NULL,
	"image_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "product_images_product_id_image_order_pk" PRIMARY KEY("product_id","image_order")
);
--> statement-breakpoint
ALTER TABLE "product_images" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "product_likes" (
	"product_id" bigint NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_likes_product_id_user_id_pk" PRIMARY KEY("product_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "product_likes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "product_views" (
	"view_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_views_view_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"product_id" bigint NOT NULL,
	"user_id" uuid,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_views" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products" (
	"product_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_product_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"seller_id" uuid NOT NULL,
	"title" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'THB' NOT NULL,
	"category_id" bigint,
	"condition" "product_condition" NOT NULL,
	"location" "location" NOT NULL,
	"country" "country" DEFAULT 'Thailand' NOT NULL,
	"description" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_sold" boolean DEFAULT false NOT NULL,
	"price_type" "price_type" DEFAULT 'Fixed' NOT NULL,
	"stats" jsonb DEFAULT '{"likes":0}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "trust_scores" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"completed_trades" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_conversations" (
	"conversation_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_conversations_conversation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"product_id" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_conversations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_levels" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"level" "user_level" DEFAULT 'Explorer' NOT NULL,
	"free_let_go_buddy_uses" integer DEFAULT 2 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_messages" (
	"message_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_messages_message_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"conversation_id" bigint NOT NULL,
	"sender_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"content" text NOT NULL,
	"message_type" "message_type" DEFAULT 'Text' NOT NULL,
	"media_url" text,
	"seen" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_notifications" (
	"notification_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_notifications_notification_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"type" "notification_type" NOT NULL,
	"sender_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"product_id" bigint,
	"message_id" bigint,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"profile_id" uuid PRIMARY KEY NOT NULL,
	"username" text,
	"email" text,
	"phone" text,
	"avatar_url" text,
	"bio" text,
	"location" "location",
	"level" "user_level" DEFAULT 'Explorer' NOT NULL,
	"total_likes" integer DEFAULT 0,
	"rating" numeric(10, 2) DEFAULT '0.00',
	"appreciation_badge" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_profile_id_unique" UNIQUE("profile_id"),
	CONSTRAINT "user_profiles_username_unique" UNIQUE("username"),
	CONSTRAINT "user_profiles_phone_unique" UNIQUE("phone"),
	CONSTRAINT "rating_check" CHECK (rating >= 0 AND rating <= 5)
);
--> statement-breakpoint
ALTER TABLE "user_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_reviews" (
	"review_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_reviews_review_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"reviewer_id" uuid NOT NULL,
	"reviewee_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "item_analyses" ADD CONSTRAINT "item_analyses_session_id_let_go_buddy_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."let_go_buddy_sessions"("session_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "let_go_buddy_sessions" ADD CONSTRAINT "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_participants" ADD CONSTRAINT "message_participants_conversation_id_user_conversations_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."user_conversations"("conversation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_participants" ADD CONSTRAINT "message_participants_profile_id_user_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_likes" ADD CONSTRAINT "product_likes_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_likes" ADD CONSTRAINT "product_likes_user_id_user_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_views" ADD CONSTRAINT "product_views_user_id_user_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_seller_id_user_profiles_profile_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_scores" ADD CONSTRAINT "trust_scores_user_id_user_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_conversations" ADD CONSTRAINT "user_conversations_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_levels" ADD CONSTRAINT "user_levels_user_id_user_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_messages" ADD CONSTRAINT "user_messages_conversation_id_user_conversations_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."user_conversations"("conversation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_messages" ADD CONSTRAINT "user_messages_sender_id_user_profiles_profile_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_messages" ADD CONSTRAINT "user_messages_receiver_id_user_profiles_profile_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_sender_id_user_profiles_profile_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_receiver_id_user_profiles_profile_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_message_id_user_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."user_messages"("message_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_profile_id_users_id_fk" FOREIGN KEY ("profile_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reviews" ADD CONSTRAINT "user_reviews_reviewer_id_user_profiles_profile_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reviews" ADD CONSTRAINT "user_reviews_reviewee_id_user_profiles_profile_id_fk" FOREIGN KEY ("reviewee_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "categories_select_policy" ON "categories" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
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
CREATE POLICY "locations_select_policy" ON "locations" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "message_participants_select_policy" ON "message_participants" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("message_participants"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "message_participants_insert_policy" ON "message_participants" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("message_participants"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "message_participants_delete_policy" ON "message_participants" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("message_participants"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "product_images_select_policy" ON "product_images" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "product_images_insert_policy" ON "product_images" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (EXISTS (
      SELECT 1 FROM products 
      WHERE products.product_id = "product_images"."product_id" 
      AND products.seller_id = (select auth.uid())
    ));--> statement-breakpoint
CREATE POLICY "product_images_update_policy" ON "product_images" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (EXISTS (
      SELECT 1 FROM products 
      WHERE products.product_id = "product_images"."product_id" 
      AND products.seller_id = (select auth.uid())
    )) WITH CHECK (EXISTS (
      SELECT 1 FROM products 
      WHERE products.product_id = "product_images"."product_id" 
      AND products.seller_id = (select auth.uid())
    ));--> statement-breakpoint
CREATE POLICY "product_images_delete_policy" ON "product_images" AS PERMISSIVE FOR DELETE TO "authenticated" USING (EXISTS (
      SELECT 1 FROM products 
      WHERE products.product_id = "product_images"."product_id" 
      AND products.seller_id = (select auth.uid())
    ));--> statement-breakpoint
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