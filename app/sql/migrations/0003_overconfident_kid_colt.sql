ALTER TABLE "item_analyses" DROP CONSTRAINT "item_analyses_session_id_let_go_buddy_sessions_session_id_fk";
--> statement-breakpoint
ALTER TABLE "let_go_buddy_sessions" DROP CONSTRAINT "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "product_views" DROP CONSTRAINT "product_views_user_id_user_profiles_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "item_analyses" ALTER COLUMN "recommendation_reason" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "item_analyses" ADD COLUMN "emotional_attachment_keywords" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "item_analyses" ADD COLUMN "usage_pattern_keywords" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "item_analyses" ADD COLUMN "decision_factor_keywords" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "item_analyses" ADD COLUMN "personality_insights" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "item_analyses" ADD COLUMN "decision_barriers" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "item_analyses" ADD CONSTRAINT "item_analyses_session_id_let_go_buddy_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."let_go_buddy_sessions"("session_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "let_go_buddy_sessions" ADD CONSTRAINT "let_go_buddy_sessions_user_id_user_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_views" ADD CONSTRAINT "product_views_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_views" ADD CONSTRAINT "product_views_user_id_user_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_analyses" DROP COLUMN "ai_suggestion";--> statement-breakpoint
ALTER TABLE "item_analyses" DROP COLUMN "environmental_impact";--> statement-breakpoint
ALTER TABLE "item_analyses" DROP COLUMN "co2_impact";--> statement-breakpoint
ALTER TABLE "item_analyses" DROP COLUMN "landfill_impact";--> statement-breakpoint
ALTER TABLE "item_analyses" DROP COLUMN "is_recyclable";--> statement-breakpoint
ALTER TABLE "item_analyses" DROP COLUMN "original_price";--> statement-breakpoint
ALTER TABLE "item_analyses" DROP COLUMN "current_value";--> statement-breakpoint
ALTER TABLE "item_analyses" DROP COLUMN "ai_listing_price";--> statement-breakpoint
ALTER TABLE "item_analyses" DROP COLUMN "maintenance_cost";--> statement-breakpoint
ALTER TABLE "item_analyses" DROP COLUMN "space_value";--> statement-breakpoint
DROP TYPE "public"."environmental_impact_level";