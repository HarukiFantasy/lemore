-- Add product_id to user_conversations table
ALTER TABLE "user_conversations" ADD COLUMN "product_id" bigint REFERENCES "products"("product_id") ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX "user_conversations_product_id_idx" ON "user_conversations"("product_id"); 