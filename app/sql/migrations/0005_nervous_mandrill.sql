ALTER TABLE "local_tip_posts" ADD COLUMN "stats" jsonb DEFAULT '{"likes":0,"comments":0,"reviews":0}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "local_tip_posts" DROP COLUMN "likes";--> statement-breakpoint
ALTER TABLE "local_tip_posts" DROP COLUMN "comments";--> statement-breakpoint
ALTER TABLE "local_tip_posts" DROP COLUMN "reviews";