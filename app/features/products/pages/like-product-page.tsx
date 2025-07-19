import { Route } from './+types/like-product-page';
import { makeSSRClient } from '~/supa-client';
import { getLoggedInUserId } from '~/features/users/queries';

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { productId } = params; 
  const formData = await request.formData();
  const action = formData.get("action"); // 'like' or 'unlike'
  
  // 사용자 인증 확인
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  
  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  // 직접 auth.uid() 확인
  const { data: { user } } = await client.auth.getUser();
  try {
    if (action === "like") {
      const { error } = await client
        .from("product_likes")
        .insert({
          product_id: Number(productId),
          user_id: userId
        });
        
      if (error) {
        // 중복 좋아요 체크 (primary key violation)
        if (error.code === '23505') {
          return { success: false, error: "Already liked this product" };
        }
        
        return { success: false, error: error.message };
      }
      
    } else if (action === "unlike") {
      const { error } = await client
        .from("product_likes")
        .delete()
        .eq("product_id", Number(productId))
        .eq("user_id", userId);
        
      if (error) {
        return { success: false, error: error.message };
      }
      
    }
    
    // 현재 좋아요 수 조회
    const { data: likesData, error: likesError } = await client
      .from('product_likes')
      .select('*')
      .eq('product_id', Number(productId));
      
    if (likesError) {
      return { success: false, error: likesError.message };
    }
    
    const likesCount = likesData?.length || 0;
    const isLiked = action === "like";
    
    return { 
      success: true, 
      likes: likesCount,
      isLiked: isLiked
    };
    
  } catch (error) {
    return { success: false, error: "Database operation failed" };
  }
};