ALTER POLICY "product_images_insert_policy" ON "product_images" TO authenticated WITH CHECK (EXISTS (
      SELECT 1 FROM products 
      WHERE products.product_id = "product_images"."product_id" 
      AND products.seller_id = (select auth.uid())
    ));--> statement-breakpoint
ALTER POLICY "product_images_update_policy" ON "product_images" TO authenticated USING (EXISTS (
      SELECT 1 FROM products 
      WHERE products.product_id = "product_images"."product_id" 
      AND products.seller_id = (select auth.uid())
    )) WITH CHECK (EXISTS (
      SELECT 1 FROM products 
      WHERE products.product_id = "product_images"."product_id" 
      AND products.seller_id = (select auth.uid())
    ));--> statement-breakpoint
ALTER POLICY "product_images_delete_policy" ON "product_images" TO authenticated USING (EXISTS (
      SELECT 1 FROM products 
      WHERE products.product_id = "product_images"."product_id" 
      AND products.seller_id = (select auth.uid())
    ));