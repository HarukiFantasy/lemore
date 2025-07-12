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