import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from '~/supa-client';


export const getCategories = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.from("categories").select("*");
  if (error) throw new Error(error.message);
  return data;
};

export const getlocations = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.from("locations").select("*");
  if (error) throw new Error(error.message);
  return data;
};

export const getProductsListings = async (
  client: SupabaseClient<Database>, 
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

export const getProductById = async (client: SupabaseClient<Database>, productId: number) => {
  const { data, error } = await client.from("product_detail_view").select("*").eq("product_id", productId).single();
  if (error) throw new Error(error.message);
  return data;
};

export const getProductByUsername = async (client: SupabaseClient<Database>, username: string) => {
  const { data, error } = await client.from("product_detail_view").select("*").eq("seller_name", username);
  if (error) throw new Error(error.message);
  return data;
};

export const getProductImages = async (client: SupabaseClient<Database>, productId: number) => {
  const { data, error } = await client
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("image_order");
  if (error) throw new Error(error.message);
  return data;
};