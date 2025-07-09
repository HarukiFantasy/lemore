DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_business_reviews' AND column_name = 'content') THEN
        ALTER TABLE "local_business_reviews" ADD COLUMN "content" text NOT NULL;
    END IF;
END $$;