CREATE TABLE "local_tip_replies" (
	"reply_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "local_tip_replies_reply_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"post_id" bigint NOT NULL,
	"parent_id" bigint,
	"profile_id" uuid NOT NULL,
	"reply" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "local_tip_replies" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "local_tip_replies" ADD CONSTRAINT "local_tip_replies_post_id_local_tip_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."local_tip_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_tip_replies" ADD CONSTRAINT "local_tip_replies_parent_id_local_tip_replies_reply_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."local_tip_replies"("reply_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_tip_replies" ADD CONSTRAINT "local_tip_replies_profile_id_user_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "local_tip_replies_select_policy" ON "local_tip_replies" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "local_tip_replies_insert_policy" ON "local_tip_replies" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("local_tip_replies"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "local_tip_replies_update_policy" ON "local_tip_replies" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("local_tip_replies"."profile_id" = (select auth.uid())) WITH CHECK ("local_tip_replies"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "local_tip_replies_delete_policy" ON "local_tip_replies" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("local_tip_replies"."profile_id" = (select auth.uid()));