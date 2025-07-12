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