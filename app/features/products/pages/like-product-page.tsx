import { Route } from './+types/like-product-page';
import { makeSSRClient } from '~/supa-client';
import { getLoggedInUserId } from '~/features/users/queries';

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { productId } = params; 
  const formData = await request.formData();
  const action = formData.get("action"); // 'like' or 'unlike'
  
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  
  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    if (action === "like") {
      const { error } = await client
        .from("product_likes")
        .insert({
          product_id: Number(productId),
          user_id: userId
        });
        
      if (error) {
        if (error.code === '23505') {
          return { success: false, error: "Already liked this product" };
        }
        return { success: false, error: error.message };
      }
      
      return { success: true, isLiked: true };
      
    } else if (action === "unlike") {
      const { error } = await client
        .from("product_likes")
        .delete()
        .eq("product_id", Number(productId))
        .eq("user_id", userId);
        
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, isLiked: false };
    }
    
    return { success: false, error: "Invalid action" };
    
  } catch (error) {
    return { success: false, error: "Database operation failed" };
  }
};