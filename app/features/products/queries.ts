import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from '~/supa-client';


export const getProductsListings = async (
  client: SupabaseClient<Database, any, any, any>, 
  limit?: number
) => {
  let query = client.from("products_listings_view").select("*");
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const getProductById = async (client: SupabaseClient<Database, any, any, any>, productId: string | number) => {
  const { data, error } = await client.from("product_detail_view").select("*").eq("product_id", productId).single();
  if (error) throw new Error(error.message);
  return data;
};

export const getProductByUsername = async (client: SupabaseClient<Database, any, any, any>, username: string) => {
  const { data, error } = await client.from("product_detail_view").select("*").eq("seller_name", username);
  if (error) throw new Error(error.message);
  return data;
};