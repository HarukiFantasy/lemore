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

export async function getUserStats(client: any, username: string) {
  const { data, error } = await client
    .from('user_stats_view')
    .select('*')
    .eq('username', username)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Fetch user stats for Give and Glow by username or profileId from the view.
 * @param client Supabase client
 * @param params { username?: string, profileId?: string }
 */
export async function getUserStatsGiveAndGlow(client: any, params: { username?: string; profileId?: string }) {
  if (!params.username && !params.profileId) {
    throw new Error('Must provide username or profileId');
  }
  let query = client.from('give_and_glow_user_stats_view').select('*');
  if (params.username) {
    query = query.eq('username', params.username);
  } else if (params.profileId) {
    query = query.eq('profile_id', params.profileId);
  }
  const { data, error } = await query.single();
  if (error || !data) throw error || new Error('User stats not found');
  return data;
}
