ALTER TABLE "local_business_reviews" DROP CONSTRAINT "local_business_reviews_business_id_local_businesses_id_fk";
--> statement-breakpoint
ALTER TABLE "local_business_reviews" ADD CONSTRAINT "local_business_reviews_business_id_local_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."local_businesses"("id") ON DELETE cascade ON UPDATE no action;