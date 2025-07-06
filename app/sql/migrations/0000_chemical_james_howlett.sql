CREATE TYPE "public"."declutter_situation" AS ENUM('moving', 'downsizing', 'spring_cleaning', 'digital_declutter', 'minimalism', 'inheritance', 'relationship_change', 'other');
--> statement-breakpoint
CREATE TYPE "public"."environmental_impact_level" AS ENUM('low', 'medium', 'high', 'critical');
--> statement-breakpoint
CREATE TYPE "public"."local_tip_categories" AS ENUM('Visa', 'Bank', 'Tax', 'Health', 'Education', 'Transportation', 'Other');
--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'image', 'file', 'audio', 'video', 'location');
--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('message', 'like', 'reply', 'mention');
--> statement-breakpoint
CREATE TYPE "public"."price_type" AS ENUM('fixed', 'negotiable', 'free', 'auction');
--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'automotive', 'health', 'other');
--> statement-breakpoint
CREATE TYPE "public"."product_condition" AS ENUM('new', 'like_new', 'excellent', 'good', 'fair', 'poor');
--> statement-breakpoint
CREATE TYPE "public"."recommendation_action" AS ENUM('keep', 'sell', 'donate', 'recycle', 'repair', 'repurpose', 'discard');
--> statement-breakpoint
CREATE TABLE "categories" (
    "category_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "categories_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START
        WITH
            1 CACHE 1
    ),
    "name" "product_category" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "give_and_glow_reviews" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "give_and_glow_reviews_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"product_id" bigint,
	"giver_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"category" "product_category" NOT NULL,
	"rating" integer NOT NULL,
	"timestamp" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_analyses" (
	"analysis_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" bigint NOT NULL,
	"item_name" text NOT NULL,
	"item_category" "product_category" NOT NULL,
	"item_condition" "product_condition" NOT NULL,
	"recommendation" "recommendation_action" NOT NULL,
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
	"ai_listing_location" text,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "let_go_buddy_sessions" (
    "session_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "let_go_buddy_sessions_session_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START
        WITH
            1 CACHE 1
    ),
    "user_id" uuid NOT NULL,
    "situation" "declutter_situation" NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "is_completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "local_business_reviews" (
	"business_id" bigint NOT NULL,
	"rating" integer NOT NULL,
	"author" uuid NOT NULL,
	"author_avatar" text,
	"timestamp" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "local_business_reviews_business_id_author_pk" PRIMARY KEY("business_id","author")
);
--> statement-breakpoint
CREATE TABLE "local_businesses" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "local_businesses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"type" text,
	"location" text NOT NULL,
	"average_rating" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"price_range" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"image" text,
	"address" text,
	"website" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "local_tip_comments" (
    "comment_id" bigint GENERATED ALWAYS AS IDENTITY (
        sequence name "local_tip_comments_comment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START
        WITH
            1 CACHE 1
    ),
    "post_id" bigint NOT NULL,
    "author" uuid NOT NULL,
    "content" text NOT NULL,
    "likes" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "local_tip_comments_comment_id_post_id_author_pk" PRIMARY KEY (
        "comment_id",
        "post_id",
        "author"
    )
);
--> statement-breakpoint
CREATE TABLE "local_tip_posts" (
    "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "local_tip_posts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START
        WITH
            1 CACHE 1
    ),
    "title" text NOT NULL,
    "content" text NOT NULL,
    "category" text NOT NULL,
    "location" text NOT NULL,
    "author" uuid NOT NULL,
    "likes" integer DEFAULT 0 NOT NULL,
    "comments" integer DEFAULT 0 NOT NULL,
    "reviews" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_participants" (
    "conversation_id" bigint NOT NULL,
    "profile_id" uuid NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "message_participants_conversation_id_profile_id_pk" PRIMARY KEY (
        "conversation_id",
        "profile_id"
    )
);
--> statement-breakpoint
CREATE TABLE "product_images" (
    "product_id" bigint NOT NULL,
    "image_url" text NOT NULL,
    "image_order" integer DEFAULT 0 NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    CONSTRAINT "product_images_product_id_image_order_pk" PRIMARY KEY ("product_id", "image_order")
);
--> statement-breakpoint
CREATE TABLE "product_likes" (
    "product_id" bigint NOT NULL,
    "user_id" uuid NOT NULL,
    CONSTRAINT "product_likes_product_id_user_id_pk" PRIMARY KEY ("product_id", "user_id")
);
--> statement-breakpoint
CREATE TABLE "product_views" (
    "view_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "product_views_view_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START
        WITH
            1 CACHE 1
    ),
    "product_id" bigint NOT NULL,
    "user_id" uuid,
    "viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"product_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_product_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"seller_id" uuid NOT NULL,
	"title" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'THB' NOT NULL,
	"category_id" bigint,
	"condition" "product_condition" NOT NULL,
	"location" text NOT NULL,
	"description" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"isSold" boolean DEFAULT false NOT NULL,
	"price_type" "price_type" DEFAULT 'fixed' NOT NULL,
	"stats" jsonb DEFAULT '{"views":0,"likes":0}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_conversations" (
    "conversation_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "user_conversations_conversation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START
        WITH
            1 CACHE 1
    ),
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_messages" (
    "message_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "user_messages_message_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START
        WITH
            1 CACHE 1
    ),
    "conversation_id" bigint NOT NULL,
    "sender_id" uuid NOT NULL,
    "receiver_id" uuid NOT NULL,
    "content" text NOT NULL,
    "message_type" "message_type" DEFAULT 'text' NOT NULL,
    "media_url" text,
    "seen" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_notifications" (
	"notification_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_notifications_notification_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"type" "notification_type" NOT NULL,
	"sender_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"product_id" bigint,
	"message_id" bigint,
	"review_id" bigint,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
    "profile_id" uuid PRIMARY KEY NOT NULL,
    "first_name" text NOT NULL,
    "last_name" text NOT NULL,
    "username" text NOT NULL,
    "email" text NOT NULL,
    "avatar_url" text,
    "bio" text,
    "location" text NOT NULL,
    "total_likes" integer DEFAULT 0 NOT NULL,
    "total_views" integer DEFAULT 0 NOT NULL,
    "total_listings" integer DEFAULT 0 NOT NULL,
    "response_rate" numeric(10, 2) DEFAULT '0.00' NOT NULL,
    "response_time" text DEFAULT '< 1 hour' NOT NULL,
    "rating" numeric(10, 2) DEFAULT '0.00' NOT NULL,
    "appreciation_badge" boolean DEFAULT false,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "user_profiles_profile_id_unique" UNIQUE ("profile_id"),
    CONSTRAINT "rating_check" CHECK (
        rating >= 0
        AND rating <= 5
    )
);
--> statement-breakpoint
CREATE TABLE "user_reviews" (
    "review_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
        sequence name "user_reviews_review_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START
        WITH
            1 CACHE 1
    ),
    "reviewer_id" uuid NOT NULL,
    "reviewee_id" uuid NOT NULL,
    "rating" integer NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

--> statement-breakpoint
ALTER TABLE "give_and_glow_reviews" ADD CONSTRAINT "give_and_glow_reviews_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "give_and_glow_reviews" ADD CONSTRAINT "give_and_glow_reviews_giver_id_user_profiles_profile_id_fk" FOREIGN KEY ("giver_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "give_and_glow_reviews" ADD CONSTRAINT "give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "item_analyses" ADD CONSTRAINT "item_analyses_session_id_let_go_buddy_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."let_go_buddy_sessions"("session_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "let_go_buddy_sessions" ADD CONSTRAINT "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "local_business_reviews" ADD CONSTRAINT "local_business_reviews_business_id_local_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."local_businesses"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "local_business_reviews" ADD CONSTRAINT "local_business_reviews_author_user_profiles_profile_id_fk" FOREIGN KEY ("author") REFERENCES "public"."user_profiles"("profile_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "local_tip_comments" ADD CONSTRAINT "local_tip_comments_post_id_local_tip_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."local_tip_posts"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "local_tip_comments" ADD CONSTRAINT "local_tip_comments_author_user_profiles_profile_id_fk" FOREIGN KEY ("author") REFERENCES "public"."user_profiles"("profile_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "local_tip_posts" ADD CONSTRAINT "local_tip_posts_author_user_profiles_profile_id_fk" FOREIGN KEY ("author") REFERENCES "public"."user_profiles"("profile_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "message_participants" ADD CONSTRAINT "message_participants_conversation_id_user_conversations_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."user_conversations"("conversation_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "message_participants" ADD CONSTRAINT "message_participants_profile_id_user_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "product_likes" ADD CONSTRAINT "product_likes_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "product_likes" ADD CONSTRAINT "product_likes_user_id_user_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "product_views" ADD CONSTRAINT "product_views_user_id_user_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_seller_id_user_profiles_profile_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_messages" ADD CONSTRAINT "user_messages_conversation_id_user_conversations_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."user_conversations"("conversation_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_messages" ADD CONSTRAINT "user_messages_sender_id_user_profiles_profile_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_messages" ADD CONSTRAINT "user_messages_receiver_id_user_profiles_profile_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_sender_id_user_profiles_profile_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_receiver_id_user_profiles_profile_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_message_id_user_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."user_messages"("message_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_review_id_give_and_glow_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."give_and_glow_reviews"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_profile_id_users_id_fk" FOREIGN KEY ("profile_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_reviews" ADD CONSTRAINT "user_reviews_reviewer_id_user_profiles_profile_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_reviews" ADD CONSTRAINT "user_reviews_reviewee_id_user_profiles_profile_id_fk" FOREIGN KEY ("reviewee_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;