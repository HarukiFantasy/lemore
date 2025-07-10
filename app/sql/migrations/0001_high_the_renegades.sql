ALTER TABLE "user_profiles" ALTER COLUMN "location" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "total_likes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "total_views" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "total_listings" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "response_rate" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "response_time" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "rating" DROP NOT NULL;