import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/supa-client';

export const getUser = async (client: SupabaseClient<Database, any, any, any>) => {
  const { data, error } = await client.from("users_view").select("*");
  if (error) throw new Error(error.message);
  return data;
};

export const getUserByProfileId = async (client: SupabaseClient<Database, any, any, any>, { profileId }: { profileId: string|null }) => {
  const { data, error } = await client
    .from("users_view")
    .select("*")
    .eq("profile_id", profileId)
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};

export const getUserByUsername = async (client: SupabaseClient<Database, any, any, any>, { username }: { username: string }) => {
  const { data, error } = await client
    .from("users_view")
    .select("*")
    .eq("username", username)
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};