import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/supa-client';

export const getEnvironmentalImpactSummary = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.from("environmental_impact_summary_view").select(`*`);
  if (error) throw new Error(error.message);
  return data;
}


export const getItemAnalysesDetailed = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.from("item_analyses_detailed_view").select(`*`);
  if (error) throw new Error(error.message);
  return data;
}

export const getLetGoBuddySessionsWithItems = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.from("let_go_buddy_sessions_with_items_view").select(`*`);
  if (error) throw new Error(error.message);
  return data;
}

// Challenge Calendar queries
export const getChallengeItems = async (
  client: SupabaseClient<Database>,
  { userId }: { userId: string }
) => {
  const { data, error } = await client
    .from('challenge_calendar_items')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_date', { ascending: true });
  
  if (error) throw new Error(error.message);
  return data;
}

export const getChallengeItemsByDateRange = async (
  client: SupabaseClient<Database>,
  { userId, startDate, endDate }: { userId: string; startDate: string; endDate: string }
) => {
  const { data, error } = await client
    .from('challenge_calendar_items')
    .select('*')
    .eq('user_id', userId)
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate)
    .order('scheduled_date', { ascending: true });
  
  if (error) throw new Error(error.message);
  return data;
}

export const getChallengeItemProgress = async (
  client: SupabaseClient<Database>,
  { userId }: { userId: string }
) => {
  const { data, error } = await client
    .from('challenge_calendar_items')
    .select('completed')
    .eq('user_id', userId);
  
  if (error) throw new Error(error.message);
  
  const total = data.length;
  const completed = data.filter(item => item.completed).length;
  
  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}