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
  const { data, error } = await client.from("product_detail_view").select("*").eq("product_id", productId).maybeSingle();
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

// 사용자가 좋아요한 제품 목록 조회
export const getUserLikedProducts = async (client: SupabaseClient<Database>, userId?: string) => {
  if (!userId) return [];
  
  const { data, error } = await client
    .from("product_likes")
    .select("product_id")
    .eq("user_id", userId);
    
  if (error) throw new Error(error.message);
  return data?.map(like => like.product_id) || [];
};

export async function getProductsWithSellerStats(client: any, limit = 20) {
  const { data, error } = await client
    .from("products_with_seller_stats_view")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}