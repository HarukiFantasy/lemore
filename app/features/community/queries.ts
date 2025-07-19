import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/supa-client';


export const getlocations = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.from("locations").select("*");
  if (error) throw new Error(error.message);
  return data;
};

export const getLocalTipPosts = async (client: SupabaseClient<Database>, limit?: number) => {
  let query = client.from("local_tips_list_view").select(`
    id,
    title,
    content,
    category,
    location,
    author,
    username,
    avatar_url,
    stats,
    created_at,
    updated_at
  `);
  if (limit) {
    query = query.limit(limit);
  }
  const { data, error } = await query;
  
  if (error) throw new Error(error.message);
  return data;
}


export const getLocalTipComments = async (client: SupabaseClient<Database>, postId?: string) => {
  let query = client.from("local_tip_comments_view").select(`*`);
  
  if (postId) {
    query = query.eq("post_id", parseInt(postId));
  }
  
  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data;
}

export const getLocalTipReplies = async (client: SupabaseClient<Database>, postId: string) => {
  const replyQuery = `
    reply_id,
    reply,
    created_at,
    profile_id,
    user:user_profiles (username, avatar_url)
  `;
  const { data, error } = await client
    .from("local_tip_replies")
    .select(`
      ${replyQuery},
      local_tip_replies ( ${replyQuery} )
    `)
    .eq("post_id", parseInt(postId))
    .is("parent_id", null); // 최상위 댓글만
  if (error) throw new Error(error.message);
  return data;
};

// Get user's like status for local tip posts
export const getLocalTipPostLikes = async (
  client: SupabaseClient<Database>,
  userId: string
) => {
  const { data, error } = await client
    .from("local_tip_post_likes")
    .select("post_id")
    .eq("user_id", userId);
  
  if (error) throw new Error(error.message);
  return data?.map(like => like.post_id) || [];
};

export const getGiveAndGlowReviews = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.from("give_and_glow_view").select(`*`);
  
  if (error) throw new Error(error.message);
  return data;
}

export const getLocalBusinesses = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.from("local_businesses_list_view").select(`*`);
  if (error) throw new Error(error.message);
  return data;
}

export const getLocalReviews = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.from("local_reviews_list_view").select(`*`);
  if (error) throw new Error(error.message);
  return data;
}
