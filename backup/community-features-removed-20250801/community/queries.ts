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
  const { data, error } = await client.from("local_businesses_list_view").select(`*`).order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export const getLocalReviews = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.from("local_reviews_list_view").select(`*`).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getUserStats(client: any, username: string) {
  const { data, error } = await client
    .from('user_stats_view')
    .select('*')
    .eq('username', username)
    .maybeSingle();
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
  const { data, error } = await query.maybeSingle();
  if (error || !data) throw error || new Error('User stats not found');
  return data;
}

/**
 * Get user's available products for Give and Glow page
 * @param client Supabase client
 * @param userId User's profile ID
 */
export const getUserProductsForGiveAndGlow = async (
  client: SupabaseClient<Database>,
  userId: string
) => {
  const { data, error } = await client
    .from("products_listings_view")
    .select("*")
    .eq("seller_id", userId)
    .eq("is_sold", false) // Only show available products
    .order("created_at", { ascending: false });
    
  if (error) throw new Error("Error fetching user products");
  return data || [];
};

/**
 * Get user stats map for Give and Glow page
 * @param client Supabase client
 * @param reviews Array of reviews to extract profile IDs from
 */
export const getUserStatsMapForGiveAndGlow = async (
  client: SupabaseClient<Database>,
  reviews: any[]
) => {
  const uniqueProfileIds = Array.from(
    new Set(reviews.flatMap(r => [r.giver_profile_id, r.receiver_profile_id]).filter(Boolean))
  );
  
  const userStatsMap: Record<string, any> = {};
  
  for (const profileId of uniqueProfileIds) {
    try {
      const stats = await getUserStatsGiveAndGlow(client, { profileId });
      userStatsMap[profileId] = {
        totalListings: stats.total_listings,
        totalLikes: stats.total_likes,
        totalSold: stats.total_sold,
        level: stats.level, // level 정보 포함
        sellerJoinedAt: stats.joined_at
          ? new Date(stats.joined_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : undefined,
      };
    } catch {
      userStatsMap[profileId] = null;
    }
  }
  
  return userStatsMap;
};
