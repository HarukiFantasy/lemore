CREATE TABLE "challenge_calendar_items" (
	"item_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "challenge_calendar_items_item_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"reflection" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenge_calendar_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "challenge_calendar_items" ADD CONSTRAINT "challenge_calendar_items_user_id_user_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "challenge_calendar_items_user_date_idx" ON "challenge_calendar_items" USING btree ("user_id","scheduled_date");--> statement-breakpoint
CREATE INDEX "challenge_calendar_items_user_completed_idx" ON "challenge_calendar_items" USING btree ("user_id","completed");--> statement-breakpoint
CREATE POLICY "challenge_calendar_items_select_policy" ON "challenge_calendar_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("challenge_calendar_items"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "challenge_calendar_items_insert_policy" ON "challenge_calendar_items" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("challenge_calendar_items"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "challenge_calendar_items_update_policy" ON "challenge_calendar_items" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("challenge_calendar_items"."user_id" = (select auth.uid())) WITH CHECK ("challenge_calendar_items"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "challenge_calendar_items_delete_policy" ON "challenge_calendar_items" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("challenge_calendar_items"."user_id" = (select auth.uid()));