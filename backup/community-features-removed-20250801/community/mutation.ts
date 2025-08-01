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
  itemName, itemCategory, giverId, rating, review, productId
}:{
    itemName: string;
    itemCategory: string;
    giverId: string;
    rating: number;
    review: string;
    productId?: number | null;
  }) => {
    
    const {data: {user}} = await client.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Create the review directly without creating a product first
    const {data, error} = await client
      .from("give_and_glow_reviews")
      .insert({
        category: itemCategory as any,
        giver_id: giverId,
        receiver_id: user.id,
        product_id: productId ?? null,
        location: "Bangkok", // Default location
        rating,
        review,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
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


// Helper to upload business image to Supabase Storage
export async function uploadBusinessImage(client: any, file: File): Promise<string | null> {
  console.log('Starting image upload...', { fileName: file.name, fileSize: file.size, fileType: file.type });
  
  // Get current user ID for folder structure
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    console.error('No authenticated user found');
    return null;
  }
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`; // User ID based folder structure
  
  console.log('Uploading to path:', filePath);
  
  const { error: uploadError } = await client.storage.from('biz').upload(filePath, file, { upsert: true });
  
  if (uploadError) {
    console.error('Upload failed:', uploadError);
    console.error('Upload error details:', {
      message: uploadError.message,
      statusCode: uploadError.statusCode,
      error: uploadError.error
    });
    return null;
  }
  
  console.log('Upload successful, getting public URL...');
  
  const { data: publicUrlData } = client.storage.from('biz').getPublicUrl(filePath);
  console.log('Public URL data:', publicUrlData);
  
  return publicUrlData?.publicUrl || null;
}

// Add new business with image upload
export async function addNewBusiness(client: any, businessData: any, imageFile?: File) {
  console.log('addNewBusiness started with:', { 
    businessName: businessData.name, 
    hasImage: !!imageFile,
    imageName: imageFile?.name 
  });
  
  let imageUrl = null;
  
  // Upload image if provided
  if (imageFile) {
    console.log('Starting image upload...');
    imageUrl = await uploadBusinessImage(client, imageFile);
    if (!imageUrl) {
      console.error('Image upload failed, throwing error');
      throw new Error('Failed to upload business image');
    }
    console.log('Image upload successful, URL:', imageUrl);
  } else {
    console.log('No image provided, skipping upload');
  }
  
  console.log('Starting database insert...');
  
  // Insert business data into database
  const { data: inserted, error: insertError } = await client
    .from('local_businesses')
    .insert({
      name: businessData.name,
      type: businessData.type,
      location: businessData.city, // city 값을 location에 저장
      price_range: businessData.priceRange,
      tags: businessData.tags,
      address: businessData.address,
      description: businessData.description,
      image: imageUrl, // <-- use 'image' instead of 'image_url'
    })
    .select()
    .single();
    
  if (insertError || !inserted) {
    console.error('Database insert failed:', insertError);
    throw new Error('Failed to register business');
  }
  
  console.log('Database insert successful:', inserted);
  return inserted;
}

// Update business info by id
export async function updateLocalBusiness(client: any, businessId: number, updateFields: Record<string, any>) {
  const { error } = await client
    .from('local_businesses')
    .update(updateFields)
    .eq('id', businessId);
  if (error) throw error;
}