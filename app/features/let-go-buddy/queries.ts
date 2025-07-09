import client from "~/supa-client";

export const getEnvironmentalImpactSummary = async () => {
  const { data, error } = await client.from("environmental_impact_summary_view").select(`*`);
  if (error) throw new Error(error.message);
  return data;
}

export const getUserLetGoBuddyStats = async () => {
  const { data, error } = await client.from("user_let_go_buddy_stats_view").select(`*`);
  if (error) throw new Error(error.message);
  return data;
}

export const getItemAnalysesDetailed = async () => {
  const { data, error } = await client.from("item_analyses_detailed_view").select(`*`);
  if (error) throw new Error(error.message);
  return data;
}

export const getLetGoBuddySessionsWithItems = async () => {
  const { data, error } = await client.from("let_go_buddy_sessions_with_items_view").select(`*`);
  if (error) throw new Error(error.message);
  return data;
}