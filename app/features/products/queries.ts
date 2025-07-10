import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/supa-client';

export const getProductsListings = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.from("products_listings_view").select("*");
  if (error) throw new Error(error.message);
  return data;
};

export const getProductById = async (client: SupabaseClient<Database>, productId: number) => {
  const { data, error } = await client.from("product_detail_view").select("*").eq("product_id", productId).single();
  if (error) throw new Error(error.message);
  return data;
};