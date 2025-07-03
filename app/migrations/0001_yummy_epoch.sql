CREATE TYPE "public"."declutter_situation" AS ENUM('moving', 'need-space', 'tidying', 'downsizing', 'minimalist');
--> statement-breakpoint
CREATE TYPE "public"."environmental_impact_level" AS ENUM('low', 'medium', 'high');
--> statement-breakpoint
CREATE TYPE "public"."item_category" AS ENUM('electronics', 'clothing', 'books', 'furniture', 'kitchen', 'home-decor', 'sports', 'toys', 'jewelry', 'other');
--> statement-breakpoint
CREATE TYPE "public"."item_condition" AS ENUM('new', 'like-new', 'excellent', 'good', 'fair', 'poor');
--> statement-breakpoint
CREATE TYPE "public"."recommendation_action" AS ENUM('donate', 'sell', 'recycle', 'repair', 'keep', 'give-away');
--> statement-breakpoint
CREATE TYPE "public"."price_type" AS ENUM('fixed', 'negotiable', 'free');
--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('vehicles', 'classifieds', 'clothing', 'electronics', 'entertainment', 'family', 'free_stuff', 'outdoors', 'hobbies', 'home_goods', 'home_improvement', 'musical_instruments', 'office_supplies', 'pet_supplies', 'property', 'sporting_goods', 'toys_games', 'buy_sell_groups');
--> statement-breakpoint
CREATE TYPE "public"."product_condition" AS ENUM('new', 'like_new', 'good', 'fair', 'poor');
--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('active', 'sold', 'expired', 'draft', 'pending', 'rejected', 'suspended');
--> statement-breakpoint
CREATE TABLE "give_and_glow_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_name" text NOT NULL,
	"item_category" text NOT NULL,
	"giver_name" text NOT NULL,
	"giver_avatar" text,
	"receiver_name" text NOT NULL,
	"receiver_avatar" text,
	"rating" integer NOT NULL,
	"review" text NOT NULL,
	"timestamp" text NOT NULL,
	"location" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"appreciation_badge" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "local_business_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"business_name" text NOT NULL,
	"business_type" text NOT NULL,
	"location" text NOT NULL,
	"rating" integer NOT NULL,
	"review" text NOT NULL,
	"author" uuid NOT NULL,
	"author_avatar" text,
	"timestamp" text NOT NULL,
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"price_range" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "local_businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"location" text NOT NULL,
	"average_rating" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"price_range" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"image" text,
	"address" text,
	"phone" text,
	"website" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "local_tip_comments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "post_id" uuid NOT NULL,
    "author" uuid NOT NULL,
    "content" text NOT NULL,
    "likes" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "local_tip_posts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
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
CREATE TABLE "ai_listing_suggestions" (
	"suggestion_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_analysis_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" text NOT NULL,
	"location" text NOT NULL,
	"category" "item_category" NOT NULL,
	"condition" "item_condition" NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_selected" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cost_benefit_analyses" (
    "analysis_id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "item_analysis_id" uuid NOT NULL,
    "original_price" numeric(10, 2) NOT NULL,
    "current_value" numeric(10, 2) NOT NULL,
    "maintenance_cost" numeric(10, 2) DEFAULT '0' NOT NULL,
    "space_value" numeric(10, 2) DEFAULT '0' NOT NULL,
    "depreciation_rate" numeric(5, 2) NOT NULL,
    "roi_if_sold" numeric(5, 2) NOT NULL,
    "monthly_storage_cost" numeric(10, 2) DEFAULT '0' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emotional_assessments" (
    "assessment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "analysis_id" uuid NOT NULL,
    "question_1_answer" integer NOT NULL,
    "question_2_answer" integer NOT NULL,
    "question_3_answer" integer NOT NULL,
    "question_4_answer" integer NOT NULL,
    "question_5_answer" integer NOT NULL,
    "overall_score" integer NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "environmental_impact_data" (
	"impact_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" "item_category" NOT NULL,
	"co2_emissions" numeric(10, 2) NOT NULL,
	"landfill_impact" text NOT NULL,
	"is_recyclable" boolean NOT NULL,
	"recycling_instructions" text,
	"donation_centers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_analyses" (
	"analysis_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"item_name" text NOT NULL,
	"item_category" "item_category" NOT NULL,
	"item_condition" "item_condition" NOT NULL,
	"recommendation" "recommendation_action" NOT NULL,
	"ai_suggestion" text NOT NULL,
	"emotional_score" integer NOT NULL,
	"environmental_impact" "environmental_impact_level" NOT NULL,
	"co2_impact" numeric(10, 2) NOT NULL,
	"landfill_impact" text NOT NULL,
	"is_recyclable" boolean NOT NULL,
	"original_price" numeric(10, 2),
	"current_value" numeric(10, 2),
	"maintenance_cost" numeric(10, 2) DEFAULT '0',
	"space_value" numeric(10, 2) DEFAULT '0',
	"ai_listing_title" text,
	"ai_listing_description" text,
	"ai_listing_price" text,
	"ai_listing_location" text,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "let_go_buddy_sessions" (
    "session_id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "user_id" uuid NOT NULL,
    "situation" "declutter_situation" NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "is_completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
    "image_id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "product_id" uuid NOT NULL,
    "image_url" text NOT NULL,
    "image_order" integer DEFAULT 0 NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "alt_text" text,
    "file_size" integer,
    "mime_type" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_likes" (
    "like_id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "product_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_views" (
    "view_id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "product_id" uuid NOT NULL,
    "user_id" uuid,
    "viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"product_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'THB' NOT NULL,
	"original_price" numeric(10, 2),
	"original_currency" text DEFAULT 'THB',
	"price_type" "price_type" DEFAULT 'fixed' NOT NULL,
	"condition" "product_condition" NOT NULL,
	"category" "product_category" NOT NULL,
	"location" text NOT NULL,
	"status" "product_status" DEFAULT 'active' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"specifications" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"contact_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "local_business_reviews" ADD CONSTRAINT "local_business_reviews_business_id_local_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."local_businesses"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "local_business_reviews" ADD CONSTRAINT "local_business_reviews_author_user_profiles_profile_id_fk" FOREIGN KEY ("author") REFERENCES "public"."user_profiles"("profile_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "local_tip_comments" ADD CONSTRAINT "local_tip_comments_post_id_local_tip_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."local_tip_posts"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "local_tip_comments" ADD CONSTRAINT "local_tip_comments_author_user_profiles_profile_id_fk" FOREIGN KEY ("author") REFERENCES "public"."user_profiles"("profile_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "local_tip_posts" ADD CONSTRAINT "local_tip_posts_author_users_id_fk" FOREIGN KEY ("author") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "ai_listing_suggestions" ADD CONSTRAINT "ai_listing_suggestions_item_analysis_id_item_analyses_analysis_id_fk" FOREIGN KEY ("item_analysis_id") REFERENCES "public"."item_analyses"("analysis_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "cost_benefit_analyses" ADD CONSTRAINT "cost_benefit_analyses_item_analysis_id_item_analyses_analysis_id_fk" FOREIGN KEY ("item_analysis_id") REFERENCES "public"."item_analyses"("analysis_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "emotional_assessments" ADD CONSTRAINT "emotional_assessments_analysis_id_item_analyses_analysis_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."item_analyses"("analysis_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "item_analyses" ADD CONSTRAINT "item_analyses_session_id_let_go_buddy_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."let_go_buddy_sessions"("session_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "let_go_buddy_sessions" ADD CONSTRAINT "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "product_likes" ADD CONSTRAINT "product_likes_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "product_likes" ADD CONSTRAINT "product_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "product_views" ADD CONSTRAINT "product_views_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "product_views" ADD CONSTRAINT "product_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_conversations" ADD CONSTRAINT "user_conversations_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_messages" ADD CONSTRAINT "user_messages_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "give_and_glow_reviews_category_idx" ON "give_and_glow_reviews" USING btree ("item_category");
--> statement-breakpoint
CREATE INDEX "give_and_glow_reviews_location_idx" ON "give_and_glow_reviews" USING btree ("location");
--> statement-breakpoint
CREATE INDEX "give_and_glow_reviews_created_at_idx" ON "give_and_glow_reviews" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "local_business_reviews_business_id_idx" ON "local_business_reviews" USING btree ("business_id");
--> statement-breakpoint
CREATE INDEX "local_business_reviews_business_type_idx" ON "local_business_reviews" USING btree ("business_type");
--> statement-breakpoint
CREATE INDEX "local_business_reviews_location_idx" ON "local_business_reviews" USING btree ("location");
--> statement-breakpoint
CREATE INDEX "local_business_reviews_rating_idx" ON "local_business_reviews" USING btree ("rating");
--> statement-breakpoint
CREATE INDEX "local_business_reviews_created_at_idx" ON "local_business_reviews" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "local_businesses_type_idx" ON "local_businesses" USING btree ("type");
--> statement-breakpoint
CREATE INDEX "local_businesses_location_idx" ON "local_businesses" USING btree ("location");
--> statement-breakpoint
CREATE INDEX "local_businesses_price_range_idx" ON "local_businesses" USING btree ("price_range");
--> statement-breakpoint
CREATE INDEX "local_businesses_created_at_idx" ON "local_businesses" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "local_tip_comments_post_id_idx" ON "local_tip_comments" USING btree ("post_id");
--> statement-breakpoint
CREATE INDEX "local_tip_comments_author_idx" ON "local_tip_comments" USING btree ("author");
--> statement-breakpoint
CREATE INDEX "local_tip_comments_created_at_idx" ON "local_tip_comments" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "local_tip_posts_category_idx" ON "local_tip_posts" USING btree ("category");
--> statement-breakpoint
CREATE INDEX "local_tip_posts_location_idx" ON "local_tip_posts" USING btree ("location");
--> statement-breakpoint
CREATE INDEX "local_tip_posts_author_idx" ON "local_tip_posts" USING btree ("author");
--> statement-breakpoint
CREATE INDEX "local_tip_posts_created_at_idx" ON "local_tip_posts" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "product_images_product_id_idx" ON "product_images" USING btree ("product_id");
--> statement-breakpoint
CREATE INDEX "product_images_order_idx" ON "product_images" USING btree ("image_order");
--> statement-breakpoint
CREATE INDEX "product_images_primary_idx" ON "product_images" USING btree ("is_primary");
--> statement-breakpoint
CREATE INDEX "product_likes_product_id_idx" ON "product_likes" USING btree ("product_id");
--> statement-breakpoint
CREATE INDEX "product_likes_user_id_idx" ON "product_likes" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "product_likes_unique_user_product_idx" ON "product_likes" USING btree ("user_id", "product_id");
--> statement-breakpoint
CREATE INDEX "product_likes_created_at_idx" ON "product_likes" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "product_views_product_id_idx" ON "product_views" USING btree ("product_id");
--> statement-breakpoint
CREATE INDEX "product_views_user_id_idx" ON "product_views" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "product_views_viewed_at_idx" ON "product_views" USING btree ("viewed_at");
--> statement-breakpoint
CREATE INDEX "products_seller_id_idx" ON "products" USING btree ("seller_id");
--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category");
--> statement-breakpoint
CREATE INDEX "products_condition_idx" ON "products" USING btree ("condition");
--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "products_location_idx" ON "products" USING btree ("location");
--> statement-breakpoint
CREATE INDEX "products_price_idx" ON "products" USING btree ("price");
--> statement-breakpoint
CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");