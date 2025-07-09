DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_business_reviews' AND column_name = 'content' AND is_nullable = 'NO') THEN
        ALTER TABLE "local_business_reviews" ALTER COLUMN "content" DROP NOT NULL;
    END IF;
END $$;