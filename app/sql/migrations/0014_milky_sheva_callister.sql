ALTER TABLE "local_businesses" ALTER COLUMN "average_rating" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "local_businesses" ALTER COLUMN "total_reviews" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "local_businesses" ALTER COLUMN "price_range" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "local_businesses" ALTER COLUMN "tags" DROP NOT NULL;