import { browserClient } from '~/supa-client';

export interface AIUsageCount {
  itemAnalyses: number;
  movingPlans: number;
  total: number;
  maxFree: number;
  canUse: boolean;
}

export async function getAIUsageCount(userId: string): Promise<AIUsageCount> {
  const maxFreeAnalyses = 2;
  
  try {
    // Get all user sessions
    const { data: userSessions } = await browserClient
      .from('lgb_sessions')
      .select('session_id')
      .eq('user_id', userId);
    
    const sessionIds = userSessions?.map(s => s.session_id) || [];
    
    // Count successful item analyses
    const { count: itemAnalysesCount } = await browserClient
      .from('lgb_items')
      .select('item_id', { count: 'exact' })
      .in('session_id', sessionIds.length > 0 ? sessionIds : ['dummy'])
      .not('ai_recommendation', 'is', null)
      .not('ai_rationale', 'like', '%AI analysis limit reached%')
      .not('ai_rationale', 'like', '%Analysis Failed%')
      .neq('ai_rationale', 'Analyzing...'); // Count only successfully analyzed items
    
    // Count generated moving plans
    const { count: movingPlansCount } = await browserClient
      .from('lgb_sessions')
      .select('session_id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('ai_plan_generated', true);
    
    const itemAnalyses = itemAnalysesCount || 0;
    const movingPlans = movingPlansCount || 0;
    const total = itemAnalyses + movingPlans;
    const canUse = total < maxFreeAnalyses;
    
    return {
      itemAnalyses,
      movingPlans,
      total,
      maxFree: maxFreeAnalyses,
      canUse
    };
  } catch (error) {
    console.error('Error counting AI usage:', error);
    // Return conservative values on error
    return {
      itemAnalyses: 0,
      movingPlans: 0,
      total: maxFreeAnalyses, // Assume limit reached on error
      maxFree: maxFreeAnalyses,
      canUse: false
    };
  }
}

export async function canUserUseAI(userId: string): Promise<boolean> {
  const usage = await getAIUsageCount(userId);
  return usage.canUse;
}