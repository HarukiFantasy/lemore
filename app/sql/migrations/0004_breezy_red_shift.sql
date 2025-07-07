CREATE TABLE "local_tip_comment_likes" (
	"comment_id" bigint NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "local_tip_comment_likes_comment_id_user_id_pk" PRIMARY KEY("comment_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "local_tip_post_likes" (
	"post_id" bigint NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "local_tip_post_likes_post_id_user_id_pk" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "local_tip_comment_likes" ADD CONSTRAINT "local_tip_comment_likes_comment_id_local_tip_comments_comment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."local_tip_comments"("comment_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_tip_comment_likes" ADD CONSTRAINT "local_tip_comment_likes_user_id_user_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_tip_post_likes" ADD CONSTRAINT "local_tip_post_likes_post_id_local_tip_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."local_tip_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_tip_post_likes" ADD CONSTRAINT "local_tip_post_likes_user_id_user_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("profile_id") ON DELETE cascade ON UPDATE no action;