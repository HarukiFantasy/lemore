import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/supa-client';

// Create a new Let Go Buddy session
export async function createLetGoBuddySession(
  client: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await client
    .from('let_go_buddy_sessions')
    .insert({
      user_id: userId,
      is_completed: false
    })
    .select('session_id')
    .single();

  if (error) {
    console.error('Error creating Let Go Buddy session:', error);
    throw error;
  }

  return data.session_id;
}

// Update session completion status
export async function updateSessionCompletion(
  client: SupabaseClient<Database>,
  sessionId: number,
  isCompleted: boolean = true
) {
  const { error } = await client
    .from('let_go_buddy_sessions')
    .update({ 
      is_completed: isCompleted,
      updated_at: new Date().toISOString()
    })
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error updating session completion:', error);
    throw error;
  }
}

// Create an item analysis record
export async function createItemAnalysis(
  client: SupabaseClient<Database>,
  analysisData: {
    session_id: number;
    item_name: string;
    item_category: Database['public']['Enums']['product_category'];
    item_condition: Database['public']['Enums']['product_condition'];
    recommendation: Database['public']['Enums']['recommendation_action'];
    recommendation_reason: string;
    emotional_score: number;
    images?: any;
    ai_listing_title?: string;
    ai_listing_description?: string;
    ai_listing_location?: Database['public']['Enums']['location'];
    emotional_attachment_keywords?: any;
    usage_pattern_keywords?: any;
    decision_factor_keywords?: any;
    personality_insights?: any;
    decision_barriers?: any;
  }
) {
  const { data, error } = await client
    .from('item_analyses')
    .insert({
      analysis_id: crypto.randomUUID(),
      session_id: analysisData.session_id,
      item_name: analysisData.item_name,
      item_category: analysisData.item_category,
      item_condition: analysisData.item_condition,
      recommendation: analysisData.recommendation,
      recommendation_reason: analysisData.recommendation_reason,
      emotional_score: analysisData.emotional_score,
      images: analysisData.images,
      ai_listing_title: analysisData.ai_listing_title,
      ai_listing_description: analysisData.ai_listing_description,
      ai_listing_location: analysisData.ai_listing_location,
      emotional_attachment_keywords: analysisData.emotional_attachment_keywords,
      usage_pattern_keywords: analysisData.usage_pattern_keywords,
      decision_factor_keywords: analysisData.decision_factor_keywords,
      personality_insights: analysisData.personality_insights,
      decision_barriers: analysisData.decision_barriers,
    })
    .select('analysis_id')
    .single();

  if (error) {
    console.error('Error creating item analysis:', error);
    throw error;
  }

  return data.analysis_id;
}

// Add item to challenge calendar
export async function addToChallengeCalendar(
  client: SupabaseClient<Database>,
  {
    userId,
    itemName,
    scheduledDate,
  }: {
    userId: string;
    itemName: string;
    scheduledDate: string;
  }
) {
  const { data, error } = await client
    .from('challenge_calendar_items')
    .insert({
      user_id: userId,
      name: itemName,
      scheduled_date: scheduledDate,
      completed: false,
    })
    .select('item_id')
    .single();

  if (error) {
    console.error('Error adding item to challenge calendar:', error);
    throw error;
  }

  return data.item_id;
}

// Get Let Go Buddy session with analysis data for listing creation
export async function getLetGoSession(
  client: SupabaseClient<Database>,
  sessionId: string
) {
  const { data, error } = await client
    .from('let_go_buddy_sessions')
    .select(`
      *,
      item_analyses (
        ai_listing_title,
        ai_listing_description,
        images
      )
    `)
    .eq('session_id', parseInt(sessionId))
    .single();

  if (error) {
    console.error('Error fetching Let Go Buddy session:', error);
    throw error;
  }

  // Flatten the analysis data for easier access
  const analysis = data.item_analyses?.[0];
  return {
    ...data,
    ai_listing_title: analysis?.ai_listing_title || null,
    ai_listing_description: analysis?.ai_listing_description || null,
    image_url: analysis?.images?.[0] || null,
  };
}