import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/supa-client';

export const getLocalTipPosts = async (client: SupabaseClient<Database, any, any, any>, limit?: number) => {
  let query = client.from("local_tips_list_view").select(`*`);
  if (limit) {
    query = query.limit(limit);
  }
  const { data, error } = await query;
  
  if (error) throw new Error(error.message);
  return data;
}

export const getLocalTipComments = async (client: SupabaseClient<Database, any, any, any>, postId?: string) => {
  let query = client.from("local_tip_comments_view").select(`*`);
  
  if (postId) {
    query = query.eq("post_id", parseInt(postId));
  }
  
  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data;
}

export const getGiveAndGlowReviews = async (client: SupabaseClient<Database, any, any, any>) => {
  const { data, error } = await client.from("give_and_glow_reviews").select(`*`);
  
  if (error) throw new Error(error.message);
  return data;
}

export const getLocalBusinesses = async (client: SupabaseClient<Database, any, any, any>) => {
  const { data, error } = await client.from("local_businesses_list_view").select(`*`);
  if (error) throw new Error(error.message);
  return data;
}

export const getLocalReviews = async (client: SupabaseClient<Database, any, any, any>) => {
  const { data, error } = await client.from("local_reviews_list_view").select(`*`);
  if (error) throw new Error(error.message);
  return data;
}
