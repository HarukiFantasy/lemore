import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "~/supa-client";

export const createProduct = async (client: SupabaseClient<Database>, {
  title, price, currency, priceType, userId, description, condition, category, location}:{
    title: string;
    price: number;
    currency: string;
    priceType: string;
    userId: string;
    description: string;
    condition: string;
    category: string;
    location: string;
  }) => {
    const {data: categoryData, error: categoryError} = await client
      .from("categories")
      .select("category_id")
      .eq("name", category as any)
      .single();
    if(categoryError){
      throw categoryError
    };
    const { data, error } = await client
      .from("products")
      .insert({
        title, 
        price, 
        currency, 
        price_type: priceType as any, 
        seller_id: userId,
        description,
        condition: condition as any,
        location: location as any,
        category_id: categoryData.category_id
    })
    .select()
    .single();
    if (error) {throw error};
    return data;
  };

export const uploadProductImages = async (
  client: SupabaseClient<Database>,
  {
    productId,
    userId,
    images,
  }: {
    productId: number;
    userId: string;
    images: File[];
  }
) => {
  const uploadedUrls: string[] = [];
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const fileName = `${userId}/${productId}/${Date.now()}_${i}`;
    
    const { data, error } = await client.storage
      .from("products")
      .upload(fileName, image, {
        contentType: image.type,
        upsert: true,
      });
    
    if (error) {
      throw error;
    }
    
    const { data: { publicUrl } } = await client.storage
      .from("products")
      .getPublicUrl(data.path);
    
    uploadedUrls.push(publicUrl);
  }
  
  return uploadedUrls;
};

export const saveProductImages = async (
  client: SupabaseClient<Database>,
  {
    productId,
    imageUrls,
  }: {
    productId: number;
    imageUrls: string[];
  }
) => {
  const imageData = imageUrls.map((url, index) => ({
    product_id: productId,
    image_url: url,
    image_order: index,
    is_primary: index === 0, // 첫 번째 이미지를 메인 이미지로 설정
  }));
  
  const { error } = await client
    .from("product_images")
    .insert(imageData);
  
  if (error) {
    throw error;
  }
  
  return imageData;
};

export const deleteProductImage = async (
  client: SupabaseClient<Database>,
  {
    productId,
    imageUrl,
  }: {
    productId: number;
    imageUrl: string;
  }
) => {
  const { error } = await client
    .from("product_images")
    .delete()
    .eq("product_id", productId)
    .eq("image_url", imageUrl);
  
  if (error) {
    throw error;
  }
};

export const updateProductImages = async (
  client: SupabaseClient<Database>,
  {
    productId,
    newImages,
    existingImages,
    userId,
  }: {
    productId: number;
    newImages: File[];
    existingImages: string[];
    userId: string;
  }
) => {
  // Upload new images
  let uploadedUrls: string[] = [];
  if (newImages.length > 0) {
    uploadedUrls = await uploadProductImages(client, {
      productId,
      userId: userId,
      images: newImages,
    });
  }
  
  // Combine existing and new images
  const allImageUrls = [...existingImages, ...uploadedUrls];
  
  // Delete all existing images for this product
  const { error: deleteError } = await client
    .from("product_images")
    .delete()
    .eq("product_id", productId);
  
  if (deleteError) {
    throw deleteError;
  }
  
  // Save all images (existing + new)
  if (allImageUrls.length > 0) {
    await saveProductImages(client, {
      productId,
      imageUrls: allImageUrls,
    });
  }
  
  return allImageUrls;
};

export const markProductAsSold = async (client: SupabaseClient<Database>, productId: number) => {
  const { data, error } = await client
    .from("products")
    .update({ is_sold: true })
    .eq("product_id", productId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// 제품 이미지 자동 삭제 함수 (판매 완료 후 일정 기간 후)
export const cleanupSoldProductImages = async (client: SupabaseClient<Database>) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // 30일 전에 판매 완료된 제품들의 이미지 삭제
  const { data: soldProducts, error: selectError } = await client
    .from("products")
    .select("product_id")
    .eq("is_sold", true)
    .lt("updated_at", thirtyDaysAgo.toISOString());
  
  if (selectError) throw selectError;
  
  for (const product of soldProducts) {
    // Storage에서 이미지 삭제
    const { data: images, error: imageError } = await client
      .from("product_images")
      .select("image_url")
      .eq("product_id", product.product_id);
    
    if (imageError) continue;
    
    for (const image of images) {
      // Storage에서 파일 삭제
      const fileName = image.image_url.split('/').pop();
      if (fileName) {
        await client.storage
          .from("products")
          .remove([fileName]);
      }
    }
    
    // 데이터베이스에서 이미지 레코드 삭제
    await client
      .from("product_images")
      .delete()
      .eq("product_id", product.product_id);
  }
};

// 사용자 계정 삭제 시 모든 이미지 삭제
export const deleteUserProductImages = async (client: SupabaseClient<Database>, userId: string) => {
  // 먼저 사용자의 모든 제품 ID 가져오기
  const { data: products, error: productError } = await client
    .from("products")
    .select("product_id")
    .eq("seller_id", userId);
  
  if (productError) throw productError;
  
  if (products.length === 0) return;
  
  const productIds = products.map(p => p.product_id);
  
  // 사용자의 모든 제품 이미지 가져오기
  const { data: images, error: selectError } = await client
    .from("product_images")
    .select("image_url")
    .in("product_id", productIds);
  
  if (selectError) throw selectError;
  
  // Storage에서 이미지 삭제
  for (const image of images) {
    const fileName = image.image_url.split('/').pop();
    if (fileName) {
      await client.storage
        .from("products")
        .remove([fileName]);
    }
  }
  
  // 데이터베이스에서 이미지 레코드 삭제
  await client
    .from("product_images")
    .delete()
    .in("product_id", productIds);
};