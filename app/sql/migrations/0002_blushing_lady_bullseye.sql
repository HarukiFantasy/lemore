ALTER TABLE "local_tip_comments" DROP CONSTRAINT "local_tip_comments_comment_id_post_id_author_pk";--> statement-breakpoint
ALTER TABLE "local_tip_comments" ADD PRIMARY KEY ("comment_id");