ALTER TABLE "give_and_glow_reviews" ALTER COLUMN "location" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "item_analyses" ALTER COLUMN "ai_listing_location" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "local_businesses" ALTER COLUMN "location" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "local_tip_posts" ALTER COLUMN "location" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "locations" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "location" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "location" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."location";--> statement-breakpoint
CREATE TYPE "public"."location" AS ENUM('Bangkok', 'ChiangMai', 'Phuket', 'HuaHin', 'Pattaya', 'Krabi', 'Koh Samui', 'Other Cities');--> statement-breakpoint
ALTER TABLE "give_and_glow_reviews" ALTER COLUMN "location" SET DATA TYPE "public"."location" USING "location"::"public"."location";--> statement-breakpoint
ALTER TABLE "item_analyses" ALTER COLUMN "ai_listing_location" SET DATA TYPE "public"."location" USING "ai_listing_location"::"public"."location";--> statement-breakpoint
ALTER TABLE "local_businesses" ALTER COLUMN "location" SET DATA TYPE "public"."location" USING "location"::"public"."location";--> statement-breakpoint
ALTER TABLE "local_tip_posts" ALTER COLUMN "location" SET DATA TYPE "public"."location" USING "location"::"public"."location";--> statement-breakpoint
ALTER TABLE "locations" ALTER COLUMN "name" SET DATA TYPE "public"."location" USING "name"::"public"."location";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "location" SET DATA TYPE "public"."location" USING "location"::"public"."location";--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "location" SET DATA TYPE "public"."location" USING "location"::"public"."location";