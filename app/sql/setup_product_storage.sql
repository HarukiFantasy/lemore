-- Product Storage RLS Policies
-- Run this in Supabase SQL Editor

-- Allow authenticated users to upload their own product images
CREATE POLICY "Users can upload their own product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'products' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to product images
CREATE POLICY "Public read access to product images" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

-- Allow users to update their own product images
CREATE POLICY "Users can update their own product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'products' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own product images
CREATE POLICY "Users can delete their own product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'products' AND 
  auth.uid()::text = (storage.foldername(name))[1]
); 