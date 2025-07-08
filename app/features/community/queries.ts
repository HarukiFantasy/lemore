import supaClient from "../../supa-client";


export const getLocalTipPosts = async () => {
  const { data, error } = await supaClient.from("local_tips_list_view").select(`*`);
  
  console.log('Posts query result:', { data, error });
  if (error) throw new Error(error.message);
  return data;
}

export const getLocalTipComments = async (postId?: string) => {
  let query = supaClient.from("local_tip_comments").select(`
    comment_id,
    post_id,
    content,
    likes,
    created_at,
    author:user_profiles!local_tip_comments_author_user_profiles_profile_id_fk(profile_id, username, avatar_url)
  `);
  
  if (postId) {
    query = query.eq("post_id", parseInt(postId));
  }
  
  const { data, error } = await query;

  console.log('Comments query result:', { data, error, postId });
  if (error) throw new Error(error.message);
  return data;
}

export const getGiveAndGlowReviews = async () => {
  const { data, error } = await supaClient.from("give_and_glow_reviews").select(`
    id,
    category,
    rating,
    review,
    timestamp,
    tags,
    created_at,
    updated_at,
    giver:user_profiles!give_and_glow_reviews_giver_id_user_profiles_profile_id_fk(profile_id, username, avatar_url),
    receiver:user_profiles!give_and_glow_reviews_receiver_id_user_profiles_profile_id_fk(profile_id, username, avatar_url),
    product:products!give_and_glow_reviews_product_id_products_product_id_fk(product_id, title, location)
  `);
  
  console.log('Give and Glow reviews query result:', { data, error });
  if (error) throw new Error(error.message);
  return data;
}

export const getLocalBusinesses = async () => {
  const { data, error } = await supaClient.from("local_businesses_list_view").select(`*`);
  if (error) throw new Error(error.message);
  return data;
}

export const getLocalReviews = async () => {
  const { data, error } = await supaClient.from("local_reviews_list_view").select(`*`);
  if (error) throw new Error(error.message);
  return data;
}