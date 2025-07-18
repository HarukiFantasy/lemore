ALTER TABLE "let_go_buddy_sessions" ALTER COLUMN "situation" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."declutter_situation";--> statement-breakpoint
CREATE TYPE "public"."declutter_situation" AS ENUM('Moving', 'Minimalism', 'Spring Cleaning', 'Other');--> statement-breakpoint
ALTER TABLE "let_go_buddy_sessions" ALTER COLUMN "situation" SET DATA TYPE "public"."declutter_situation" USING "situation"::"public"."declutter_situation";