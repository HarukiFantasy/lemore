ALTER TABLE "local_tip_posts" ALTER COLUMN "stats" SET DEFAULT '{"likes":0,"comments":0}'::jsonb;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "stats" SET DEFAULT '{"likes":0}'::jsonb;--> statement-breakpoint
ALTER TABLE "give_and_glow_reviews" DROP COLUMN "review";--> statement-breakpoint
ALTER TABLE "user_profiles" DROP COLUMN "total_views";