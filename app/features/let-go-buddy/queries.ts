import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/supa-client';

// Get user's total count of Let Go Buddy sessions
export async function getLetGoSessionsCount(
  client: SupabaseClient<Database>,
  userId: string
) {
  const { count, error } = await client
    .from('let_go_buddy_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching session count:', error);
    return 0;
  }

  return count || 0;
}


// Get user's decluttering insights from all their Let Go Buddy sessions
export async function getUserDeclutteringInsights(
  client: SupabaseClient<Database>,
  userId: string
) {
  const { data: insights, error } = await client
    .from('item_analyses')
    .select(`
      item_name,
      item_category,
      recommendation,
      emotional_attachment_keywords,
      usage_pattern_keywords,
      decision_factor_keywords,
      personality_insights,
      decision_barriers,
      emotional_score,
      created_at,
      let_go_buddy_sessions!inner(user_id)
    `)
    .eq('let_go_buddy_sessions.user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Process insights to find patterns
  const processedInsights = processUserInsights(insights || []);
  
  return {
    recentItems: insights?.slice(0, 5) || [],
    patterns: processedInsights,
    totalItems: insights?.length || 0
  };
}

// Process insights to identify user patterns
function processUserInsights(insights: any[]) {
  if (insights.length === 0) return null;

  // Aggregate all keywords
  const allEmotionalKeywords: string[] = [];
  const allUsagePatterns: string[] = [];
  const allDecisionFactors: string[] = [];
  const allPersonalityTraits: string[] = [];
  const allBarriers: string[] = [];
  const recommendations: string[] = [];
  let totalEmotionalScore = 0;

  insights.forEach(item => {
    if (item.emotional_attachment_keywords) {
      allEmotionalKeywords.push(...item.emotional_attachment_keywords);
    }
    if (item.usage_pattern_keywords) {
      allUsagePatterns.push(...item.usage_pattern_keywords);
    }
    if (item.decision_factor_keywords) {
      allDecisionFactors.push(...item.decision_factor_keywords);
    }
    if (item.personality_insights) {
      allPersonalityTraits.push(...item.personality_insights);
    }
    if (item.decision_barriers) {
      allBarriers.push(...item.decision_barriers);
    }
    recommendations.push(item.recommendation);
    totalEmotionalScore += item.emotional_score || 0;
  });

  // Count frequency of keywords
  const getTopKeywords = (keywords: string[], limit: number = 5) => {
    const counts = keywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([keyword, count]) => ({ keyword, count }));
  };

  // Count recommendation patterns
  const recommendationCounts = recommendations.reduce((acc, rec) => {
    acc[rec] = (acc[rec] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    topEmotionalPatterns: getTopKeywords(allEmotionalKeywords, 3),
    topUsagePatterns: getTopKeywords(allUsagePatterns, 3),
    topDecisionFactors: getTopKeywords(allDecisionFactors, 3),
    personalityTraits: getTopKeywords(allPersonalityTraits, 3),
    commonBarriers: getTopKeywords(allBarriers, 3),
    recommendationBreakdown: recommendationCounts,
    averageEmotionalScore: Math.round(totalEmotionalScore / insights.length),
    totalSessions: insights.length
  };
}

// Get recent Let Go Buddy sessions with basic info
export async function getRecentLetGoBuddySessions(
  client: SupabaseClient<Database>,
  userId: string,
  limit: number = 10
) {
  const { data, error } = await client
    .from('let_go_buddy_sessions')
    .select(`
      session_id,
      created_at,
      is_completed,
      item_analyses(
        item_name,
        item_category,
        recommendation,
        emotional_score
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Get challenge calendar items for a user
export async function getChallengeItems(
  client: SupabaseClient<Database>,
  { userId }: { userId: string }
) {
  const { data, error } = await client
    .from('challenge_calendar_items')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_date', { ascending: true });

  if (error) throw error;
  return data || [];
}
