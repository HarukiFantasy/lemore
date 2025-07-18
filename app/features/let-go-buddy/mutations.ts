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
export async function createLetGoBuddySession(
  client: SupabaseClient<Database>,
  { userId, situation }: { userId: string; situation: string }
): Promise<{ session_id: number }> {
  if (!ALLOWED_SITUATIONS.includes(situation as DeclutterSituation)) {
    throw new Error(`Invalid situation: ${situation}`);
  }
  const { data, error } = await client
    .from('let_go_buddy_sessions')
    .insert([{ user_id: userId, situation: situation as DeclutterSituation }])
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
    ai_suggestion: string;
    emotional_score: number;
    environmental_impact: Database["public"]["Enums"]["environmental_impact_level"];
    co2_impact: number;
    landfill_impact: string;
    is_recyclable: boolean;
    original_price?: number;
    current_value?: number;
    ai_listing_price?: number;
    maintenance_cost?: number;
    space_value?: number;
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
