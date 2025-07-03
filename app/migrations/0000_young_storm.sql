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
CREATE TYPE "public"."notification_type" AS ENUM('message', 'like', 'follow', 'system', 'sale', 'review', 'price_drop', 'security', 'verification', 'marketing');
--> statement-breakpoint
CREATE TYPE "public"."preference_category" AS ENUM('notifications', 'privacy', 'display', 'language', 'currency', 'timezone', 'security', 'marketing');
--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'moderator', 'admin', 'super_admin');
--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'suspended', 'banned', 'pending');
--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('unverified', 'pending', 'verified', 'rejected');
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
    "user_id" bigint NOT NULL,
    "situation" "declutter_situation" NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "is_completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_activity_logs" (
	"log_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"resource_type" text,
	"resource_id" text,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_likes" (
    "like_id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "user_id" uuid NOT NULL,
    "product_id" uuid NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_notifications" (
	"notification_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"timestamp" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"avatar_url" text,
	"username" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
    "profile_id" uuid PRIMARY KEY NOT NULL,
    "first_name" text NOT NULL,
    "last_name" text NOT NULL,
    "display_name" text NOT NULL,
    "avatar_url" text NOT NULL,
    "bio" text,
    "location" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_statistics" (
    "stat_id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "user_id" uuid NOT NULL,
    "total_listings" integer DEFAULT 0 NOT NULL,
    "active_listings" integer DEFAULT 0 NOT NULL,
    "sold_items" integer DEFAULT 0 NOT NULL,
    "total_sales" numeric(10, 2) DEFAULT '0' NOT NULL,
    "total_purchases" integer DEFAULT 0 NOT NULL,
    "total_spent" numeric(10, 2) DEFAULT '0' NOT NULL,
    "positive_reviews" integer DEFAULT 0 NOT NULL,
    "negative_reviews" integer DEFAULT 0 NOT NULL,
    "member_since_days" integer DEFAULT 0 NOT NULL,
    "last_activity_days" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

--> statement-breakpoint
ALTER TABLE "ai_listing_suggestions" ADD CONSTRAINT "ai_listing_suggestions_item_analysis_id_item_analyses_analysis_id_fk" FOREIGN KEY ("item_analysis_id") REFERENCES "public"."item_analyses"("analysis_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "cost_benefit_analyses" ADD CONSTRAINT "cost_benefit_analyses_item_analysis_id_item_analyses_analysis_id_fk" FOREIGN KEY ("item_analysis_id") REFERENCES "public"."item_analyses"("analysis_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "emotional_assessments" ADD CONSTRAINT "emotional_assessments_analysis_id_item_analyses_analysis_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."item_analyses"("analysis_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "item_analyses" ADD CONSTRAINT "item_analyses_session_id_let_go_buddy_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."let_go_buddy_sessions"("session_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_likes" ADD CONSTRAINT "user_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_profile_id_users_id_fk" FOREIGN KEY ("profile_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_statistics" ADD CONSTRAINT "user_statistics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "user_activity_logs_user_id_idx" ON "user_activity_logs" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "user_activity_logs_action_idx" ON "user_activity_logs" USING btree ("action");
--> statement-breakpoint
CREATE INDEX "user_activity_logs_created_at_idx" ON "user_activity_logs" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "user_likes_user_id_idx" ON "user_likes" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "user_likes_product_id_idx" ON "user_likes" USING btree ("product_id");
--> statement-breakpoint
CREATE INDEX "user_likes_unique_user_product_idx" ON "user_likes" USING btree ("user_id", "product_id");
--> statement-breakpoint
CREATE INDEX "user_likes_created_at_idx" ON "user_likes" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "user_notifications_user_id_idx" ON "user_notifications" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "user_notifications_unread_idx" ON "user_notifications" USING btree ("is_read");
--> statement-breakpoint
CREATE INDEX "user_notifications_type_idx" ON "user_notifications" USING btree ("type");
--> statement-breakpoint
CREATE INDEX "user_notifications_created_at_idx" ON "user_notifications" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "user_profiles_user_id_idx" ON "user_profiles" USING btree ("profile_id");
--> statement-breakpoint
CREATE INDEX "user_statistics_user_id_idx" ON "user_statistics" USING btree ("user_id");