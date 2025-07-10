import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/supa-client';

export const getEnvironmentalImpactSummary = async (client: SupabaseClient<Database, any, any, any>) => {
  const { data, error } = await client.from("environmental_impact_summary_view").select(`*`);
  if (error) throw new Error(error.message);
  return data;
}

export const getUserLetGoBuddyStats = async (client: SupabaseClient<Database, any, any, any>) => {
  const { data, error } = await client.from("user_let_go_buddy_stats_view").select(`*`);
  if (error) throw new Error(error.message);
  return data;
}

export const getItemAnalysesDetailed = async (client: SupabaseClient<Database, any, any, any>) => {
  const { data, error } = await client.from("item_analyses_detailed_view").select(`*`);
  if (error) throw new Error(error.message);
  return data;
}

export const getLetGoBuddySessionsWithItems = async (client: SupabaseClient<Database, any, any, any>) => {
  const { data, error } = await client.from("let_go_buddy_sessions_with_items_view").select(`*`);
  if (error) throw new Error(error.message);
  return data;
}