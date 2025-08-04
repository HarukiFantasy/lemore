import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/supa-client';
import { Json } from '../../../database.types';


const ALLOWED_SITUATIONS = ["Moving", "Minimalism", "Spring Cleaning", "Other"] as const;
type DeclutterSituation = typeof ALLOWED_SITUATIONS[number];

// 이미지 업로드: Supabase Storage 사용 (버킷명: 'letgobuddy-product')
export async function uploadLetGoBuddyImages(
  client: SupabaseClient<Database>,
  { userId, images }: { userId: string; images: File[] }
): Promise<string[]> {
  const bucket = 'letgobuddy-product';
  const uploadedUrls: string[] = [];
  for (const file of images) {
    const filePath = `${userId}/${Date.now()}_${file.name}`;
    const { error } = await client.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data } = client.storage.from(bucket).getPublicUrl(filePath);
    uploadedUrls.push(data.publicUrl);
  }
  return uploadedUrls;
}


// 세션 생성: let_go_buddy_sessions 테이블에 row 추가
export async function createLetGoBuddySession(client: any, { userId, situation }: { userId: string, situation: string }) {
  // Check session count before creating
  const { count } = await client
    .from('let_go_buddy_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (typeof count === 'number' && count >= 2) {
    throw new Error('Free usage limit reached. Upgrade your trust level to use more!');
  }
  if (!ALLOWED_SITUATIONS.includes(situation as DeclutterSituation)) {
    throw new Error(`Invalid situation: ${situation}`);
  }
  // Note: situation is validated but not stored in DB (removed in migration 0002)
  const { data, error } = await client
    .from('let_go_buddy_sessions')
    .insert([{ user_id: userId }])
    .select('session_id')
    .single();
  if (error) throw new Error(error.message);
  return { session_id: data.session_id };
}

// AI 분석 결과를 item_analyses 테이블에 저장
export const insertItemAnalysis = async (
  client: SupabaseClient<Database>,
  analysisData: {
    session_id: number;
    item_name: string;
    item_category: Database["public"]["Enums"]["product_category"];
    item_condition: Database["public"]["Enums"]["product_condition"];
    recommendation: Database["public"]["Enums"]["recommendation_action"];
    recommendation_reason: string;
    // Conversation insights from AI coaching
    emotional_attachment_keywords: Json;
    usage_pattern_keywords: Json;
    decision_factor_keywords: Json;
    personality_insights: Json;
    decision_barriers: Json;
    emotional_score: number;
    ai_listing_title?: string;
    ai_listing_description?: string;
    ai_listing_location?: Database["public"]["Enums"]["location"];
    images: Json;
  }
) => {
  const { error } = await client.from("item_analyses").insert([analysisData]);
  if (error) {
    throw error;
  }
};

// AI 분석 트리거: 서버리스 함수 호출
export async function triggerLetGoBuddyAIAnalysis({
  sessionId,
  images,
  userId,
}: {
  sessionId: number;
  images: string[];
  userId: string;
}): Promise<{ success: boolean; analysis_id: number; message: string }> {
  const response = await fetch('/functions/v1/letgo-ai-analysis', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
    },
    body: JSON.stringify({
      session_id: sessionId,
      images,
      user_id: userId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'AI 분석 실패');
  }

  return await response.json();
}

// Mark Let Go Buddy session as completed
export async function markSessionCompleted(
  client: SupabaseClient<Database>,
  sessionId: number
) {
  // Get current user to satisfy RLS policy
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to mark session completed');
  }

  const { data, error } = await client
    .from('let_go_buddy_sessions')
    .update({
      is_completed: true,
      updated_at: new Date().toISOString()
    })
    .eq('session_id', sessionId)
    .eq('user_id', user.id) // Add user_id check to satisfy RLS policy
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

// Challenge Calendar mutations
export async function createChallengeItem(
  client: SupabaseClient<Database>,
  { userId, name, scheduledDate }: { userId: string; name: string; scheduledDate: string }
) {
  const { data, error } = await client
    .from('challenge_calendar_items')
    .insert([{
      user_id: userId,
      name,
      scheduled_date: scheduledDate
    }])
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

export async function updateChallengeItemCompletion(
  client: SupabaseClient<Database>,
  { itemId, completed, reflection, userId }: { 
    itemId: number; 
    completed: boolean; 
    reflection?: string;
    userId: string;
  }
) {
  const updateData: any = {
    completed,
    updated_at: new Date().toISOString()
  };
  
  if (completed) {
    updateData.completed_at = new Date().toISOString();
  } else {
    updateData.completed_at = null;
  }
  
  if (reflection !== undefined) {
    updateData.reflection = reflection;
  }

  const { data, error } = await client
    .from('challenge_calendar_items')
    .update(updateData)
    .eq('item_id', itemId)
    .eq('user_id', userId) // Ensure user can only update their own items
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteChallengeItem(
  client: SupabaseClient<Database>,
  { itemId, userId }: { itemId: number; userId: string }
) {
  const { error } = await client
    .from('challenge_calendar_items')
    .delete()
    .eq('item_id', itemId)
    .eq('user_id', userId); // Ensure user can only delete their own items
  
  if (error) throw new Error(error.message);
}
