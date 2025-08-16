ALTER TABLE "trust_scores" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_levels" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "trust_scores_select_policy" ON "trust_scores" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "trust_scores_insert_policy" ON "trust_scores" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("trust_scores"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "trust_scores_update_policy" ON "trust_scores" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("trust_scores"."user_id" = (select auth.uid())) WITH CHECK ("trust_scores"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "trust_scores_delete_policy" ON "trust_scores" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("trust_scores"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_levels_select_policy" ON "user_levels" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("user_levels"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_levels_insert_policy" ON "user_levels" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("user_levels"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_levels_update_policy" ON "user_levels" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("user_levels"."user_id" = (select auth.uid())) WITH CHECK ("user_levels"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_levels_delete_policy" ON "user_levels" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("user_levels"."user_id" = (select auth.uid()));