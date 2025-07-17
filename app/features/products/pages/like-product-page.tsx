import { Route } from './+types/like-product-page';
import { makeSSRClient } from '~/supa-client';
import { getLoggedInUserId } from '~/features/users/queries';

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { productId } = params; 
  const formData = await request.formData();
  const action = formData.get("action"); // 'like' or 'unlike'
  
  console.log(productId, "fetcher submits says");
  console.log("Action:", action);
  
  // 사용자 인증 확인
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  
  console.log("User ID from getLoggedInUserId:", userId);
  
  if (!userId) {
    console.log("User not authenticated");
    return { success: false, error: "User not authenticated" };
  }
  
  // 직접 auth.uid() 확인
  const { data: { user } } = await client.auth.getUser();
  console.log("Auth user:", user);
  console.log("Auth user ID:", user?.id);
  
  try {
    if (action === "like") {
      // 좋아요 추가 - RPC 함수 사용
      console.log("Attempting to insert like with RPC:", {
        product_id: Number(productId),
        user_id: userId
      });
      
      const { error } = await client.rpc('insert_product_like_safe', {
        product_id_param: Number(productId),
        user_id_param: userId
      });
        
      if (error) {
        console.error("Like insert error:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        if (error.message?.includes('Already liked')) {
          return { success: false, error: "Already liked this product" };
        }
        
        return { success: false, error: error.message };
      }
      
      console.log("Like added successfully");
      
    } else if (action === "unlike") {
      // 좋아요 취소 - RPC 함수 사용
      console.log("Attempting to delete like with RPC:", {
        product_id: Number(productId),
        user_id: userId
      });
      
      const { error } = await client.rpc('delete_product_like_safe', {
        product_id_param: Number(productId),
        user_id_param: userId
      });
        
      if (error) {
        console.error("Unlike delete error:", error);
        return { success: false, error: error.message };
      }
      
      console.log("Like removed successfully");
    }
    
    // 현재 좋아요 수 조회
    const { data: likesData, error: likesError } = await client
      .from('product_likes')
      .select('*')
      .eq('product_id', Number(productId));
      
    if (likesError) {
      console.error("Likes count error:", likesError);
      return { success: false, error: likesError.message };
    }
    
    const likesCount = likesData?.length || 0;
    const isLiked = action === "like";
    
    console.log("Final result:", { likesCount, isLiked });
    
    return { 
      success: true, 
      likes: likesCount,
      isLiked: isLiked
    };
    
  } catch (error) {
    console.error("Action error:", error);
    return { success: false, error: "Database operation failed" };
  }
};