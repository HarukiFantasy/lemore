DROP TYPE IF EXISTS "public"."declutter_situation" CASCADE;

DROP TYPE IF EXISTS "public"."item_category" CASCADE;

DROP TYPE IF EXISTS "public"."recommendation_action" CASCADE;

DROP TYPE IF EXISTS "public"."item_condition" CASCADE;

DROP TYPE IF EXISTS "public"."environmental_impact_level" CASCADE;

DROP TYPE IF EXISTS "public"."price_type" CASCADE;

DROP TYPE IF EXISTS "public"."product_category" CASCADE;

DROP TYPE IF EXISTS "public"."product_condition" CASCADE;

DROP TYPE IF EXISTS "public"."product_status" CASCADE;

DROP TYPE IF EXISTS "public"."notification_type" CASCADE;

DROP TYPE IF EXISTS "public"."preference_category" CASCADE;

DROP TYPE IF EXISTS "public"."user_role" CASCADE;

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
CREATE TABLE "user_activity_logs" (
	"log_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"resource_type" text,
	"resource_id" text,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_conversations" (
    "conversation_id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "participant_ids" jsonb NOT NULL,
    "last_message_id" uuid,
    "last_message_content" text,
    "last_message_at" timestamp,
    "unread_count" integer DEFAULT 0 NOT NULL,
    "product_id" uuid,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_likes" (
    "like_id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "user_id" uuid NOT NULL,
    "product_id" uuid NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_messages" (
    "message_id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "conversation_id" uuid NOT NULL,
    "sender_id" uuid NOT NULL,
    "receiver_id" uuid NOT NULL,
    "content" text NOT NULL,
    "message_type" text DEFAULT 'text' NOT NULL,
    "media_url" text,
    "is_read" boolean DEFAULT false NOT NULL,
    "read_at" timestamp,
    "product_id" uuid,
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
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_conversations" ADD CONSTRAINT "user_conversations_last_message_id_user_messages_message_id_fk" FOREIGN KEY ("last_message_id") REFERENCES "public"."user_messages"("message_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_likes" ADD CONSTRAINT "user_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_messages" ADD CONSTRAINT "user_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_messages" ADD CONSTRAINT "user_messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
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
CREATE INDEX "user_conversations_participant_ids_idx" ON "user_conversations" USING btree ("participant_ids");
--> statement-breakpoint
CREATE INDEX "user_conversations_last_message_at_idx" ON "user_conversations" USING btree ("last_message_at");
--> statement-breakpoint
CREATE INDEX "user_conversations_unread_count_idx" ON "user_conversations" USING btree ("unread_count");
--> statement-breakpoint
CREATE INDEX "user_conversations_product_id_idx" ON "user_conversations" USING btree ("product_id");
--> statement-breakpoint
CREATE INDEX "user_conversations_updated_at_idx" ON "user_conversations" USING btree ("updated_at");
--> statement-breakpoint
CREATE INDEX "user_likes_user_id_idx" ON "user_likes" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "user_likes_product_id_idx" ON "user_likes" USING btree ("product_id");
--> statement-breakpoint
CREATE INDEX "user_likes_unique_user_product_idx" ON "user_likes" USING btree ("user_id", "product_id");
--> statement-breakpoint
CREATE INDEX "user_likes_created_at_idx" ON "user_likes" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "user_messages_conversation_id_idx" ON "user_messages" USING btree ("conversation_id");
--> statement-breakpoint
CREATE INDEX "user_messages_sender_id_idx" ON "user_messages" USING btree ("sender_id");
--> statement-breakpoint
CREATE INDEX "user_messages_receiver_id_idx" ON "user_messages" USING btree ("receiver_id");
--> statement-breakpoint
CREATE INDEX "user_messages_unread_idx" ON "user_messages" USING btree ("is_read");
--> statement-breakpoint
CREATE INDEX "user_messages_product_id_idx" ON "user_messages" USING btree ("product_id");
--> statement-breakpoint
CREATE INDEX "user_messages_created_at_idx" ON "user_messages" USING btree ("created_at");
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