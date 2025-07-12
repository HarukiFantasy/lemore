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