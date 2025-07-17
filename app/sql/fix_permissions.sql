-- Enable RLS on product_images table
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "product_images_select_policy" ON product_images;
DROP POLICY IF EXISTS "product_images_insert_policy" ON product_images;
DROP POLICY IF EXISTS "product_images_update_policy" ON product_images;
DROP POLICY IF EXISTS "product_images_delete_policy" ON product_images;
DROP POLICY IF EXISTS "product_images_update_policy" ON "public"."product_images";

-- Create new policies
CREATE POLICY "product_images_select_policy" ON product_images
FOR SELECT TO public
USING (true);

CREATE POLICY "product_images_insert_policy" ON product_images
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products 
    WHERE products.product_id = product_images.product_id 
    AND products.seller_id = auth.uid()
  )
);

CREATE POLICY "product_images_update_policy" ON product_images
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM products 
    WHERE products.product_id = product_images.product_id 
    AND products.seller_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products 
    WHERE products.product_id = product_images.product_id 
    AND products.seller_id = auth.uid()
  )
);

CREATE POLICY "product_images_delete_policy" ON product_images
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM products 
    WHERE products.product_id = product_images.product_id 
    AND products.seller_id = auth.uid()
  )
); 