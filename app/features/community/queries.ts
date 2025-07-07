import supaClient from "../../supa-client";


export const getLocalTipPosts = async () => {
  const { data, error } = await supaClient.from("local_tip_posts").select(`
    id,
    title,
    content,
    category,
    location,
    likes,
    comments,
    reviews,
    created_at,
    updated_at,
    author:user_profiles!local_tip_posts_author_user_profiles_profile_id_fk(profile_id, username, avatar_url)
  `);
  
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

