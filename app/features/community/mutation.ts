import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "~/supa-client";

export const createLocalTip = async (client: SupabaseClient<Database>, {
  title, content, category, location, author}:{
    title: string;
    content: string;
    category: string;
    location: string;
    author: string;
  }) => {
    const {data, error} = await client
      .from("local_tip_posts")
      .insert({
        title,
        content,
        category: category as any,
        location: location as any,
        author: author
      })
      .select()
      .single();
    if (error) {throw error};
    return data;
};


export const createGiveAndGlowReview = async (client: SupabaseClient<Database>, {
  itemName, itemCategory, giverId, rating, review}:{
    itemName: string;
    itemCategory: string;
    giverId: string;
    rating: number;
    review: string;
  }) => {
    console.log("Creating review with data:", { itemName, itemCategory, giverId, rating, review });
    
    const {data: {user}} = await client.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    console.log("Current user:", user.id);
    
    // Create the review directly without creating a product first
    const {data, error} = await client
      .from("give_and_glow_reviews")
      .insert({
        category: itemCategory as any,
        giver_id: giverId,
        receiver_id: user.id,
        product_id: null, // No product_id for now
        location: "Bangkok", // Default location
        rating,
        review,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (error) {
      console.error("Database error:", error);
      throw error;
    }
    
    console.log("Review created:", data);
    return data;
};

export const createLocalReview = async (client: SupabaseClient<Database>, {
  content, rating, tags, businessId}:{
    content: string;
    rating: number;
    tags: string;
    businessId: number;
  }) => {
    const {data: {user}} = await client.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    const {data, error} = await client
      .from("local_business_reviews")
      .insert({
        author: user.id,
        business_id: businessId,
        content,
        rating,
        tags,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) {throw error};
    return data;
  };

export const createLocalTipReply = async (
  client: SupabaseClient<Database>,
  {
    postId,
    parentId,
    profileId,
    reply,
  }: {
    postId: number;
    parentId?: number | null;
    profileId: string;
    reply: string;
  }
) => {
  const { data, error } = await client
    .from("local_tip_replies")
    .insert({
      post_id: postId,
      parent_id: parentId ?? null,
      profile_id: profileId,
      reply,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Local tip post like functions
export const likeLocalTipPost = async (
  client: SupabaseClient<Database>,
  postId: number,
  userId: string
) => {
  const { data, error } = await client
    .from("local_tip_post_likes")
    .insert({
      post_id: postId,
      user_id: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const unlikeLocalTipPost = async (
  client: SupabaseClient<Database>,
  postId: number,
  userId: string
) => {
  const { data, error } = await client
    .from("local_tip_post_likes")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};