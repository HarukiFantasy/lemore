import { SupabaseClient } from '@supabase/supabase-js';
import { redirect } from 'react-router';
import { Database } from '~/supa-client';

export const getUser = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.from("users_view").select("*");
  if (error) throw new Error(error.message);
  return data;
};

export const getUserByProfileId = async (client: SupabaseClient<Database>, { profileId }: { profileId: string|null }) => {
  if (!profileId) throw new Error("Profile ID is required");
  
  const { data, error } = await client
    .from("users_view")
    .select("*")
    .eq("profile_id", profileId)
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};

export const getUserByUsername = async (client: SupabaseClient<Database>, { username }: { username: string }) => {
  const { data, error } = await client
    .from("users_view")
    .select("*")
    .eq("username", username)
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};

export const getDashboard = async (client: SupabaseClient<Database>, { profileId }: { profileId: string|null }) => {
  if (!profileId) throw new Error("Profile ID is required");
  
  const { data, error } = await client
    .from("user_dashboard_view")
    .select("*")
    .eq("profile_id", profileId)
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};

export const getLikedProductsByUserId = async (client: SupabaseClient<Database>, { profileId }: { profileId: string|null }) => {
  if (!profileId) throw new Error("Profile ID is required");
  
  const { data, error } = await client
  .from("product_likes")
  .select(`
    product_id,
    user_id,
    created_at
  `)
  .eq("user_id", profileId)
    
  if (error) throw new Error(error.message);
  return data;
};

export const getLoggedInUserId = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.auth.getUser();
  if (error || data.user === null) {
    throw redirect("/auth/login");
  }
  return data.user.id;
};

export const getMessages = async (client: SupabaseClient<Database>, { profileId }: { profileId: string|null }) => {
  const { data, error } = await client
    .from("user_messages_view")
    .select("*")
    .or(`sender_id.eq.${profileId},receiver_id.eq.${profileId}`)
    .order("created_at", { ascending: false });
    
  if (error) throw new Error(error.message);
  return data;
};

export const getConversations = async (client: SupabaseClient<Database>, { profileId }: { profileId: string|null }) => {
  if (!profileId) throw new Error("Profile ID is required");
  
  // 사용자가 참여한 대화 ID들 가져오기
  const { data: conversations, error: convError } = await client
    .from("message_participants")
    .select("conversation_id")
    .eq("profile_id", profileId);
  if (convError) throw new Error(convError.message);
  if (!conversations || conversations.length === 0) return [];
  
  const conversationIds = conversations.map(c => c.conversation_id);
  if (conversationIds.length === 0) return [];
  
  // 새로운 뷰를 사용해서 각 대화의 가장 최근 메시지만 가져오기
  const { data: messages, error: msgError } = await client
    .from("user_conversations_view")
    .select("*")
    .in("conversation_id", conversationIds);
  if (msgError) throw new Error(msgError.message);
  
  const result = messages || [];
  return result;
};

export const getConversationMessages = async (
  client: SupabaseClient<Database>, 
  { conversationId }: { conversationId: number }
) => {
  
  const { data, error } = await client
    .from("user_messages_view")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
    
  
  if (error) throw new Error(error.message);
  return data;
};

export const sendMessage = async (
  client: SupabaseClient<Database>, 
  { 
    conversationId, 
    senderId, 
    receiverId, 
    content 
  }: { 
    conversationId: number; 
    senderId: string; 
    receiverId: string; 
    content: string; 
  }
) => {
  const { data, error } = await client
    .from("user_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      content: content,
      message_type: "Text",
      seen: false
    })
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};

export const createConversation = async (
  client: SupabaseClient<Database>,
  { participantIds }: { participantIds: string[] }
) => {
  // 대화 생성
  const { data: conversation, error: conversationError } = await client
    .from("user_conversations")
    .insert({})
    .select()
    .single();
    
  if (conversationError) throw new Error(conversationError.message);
  
  // 참가자 추가
  const participants = participantIds.map(profileId => ({
    conversation_id: conversation.conversation_id,
    profile_id: profileId
  }));
  
  const { error: participantsError } = await client
    .from("message_participants")
    .insert(participants);
    
  if (participantsError) throw new Error(participantsError.message);
  
  return conversation;
};

export const getOrCreateConversation = async (
  client: SupabaseClient<Database>,
  { userId, otherUserId }: { userId: string; otherUserId: string }
) => {
  // 기존 대화가 있는지 확인
  const { data: conversations, error: findError } = await client
    .from("message_participants")
    .select("conversation_id")
    .eq("profile_id", userId);
    
  if (findError) throw new Error(findError.message);
  
  if (conversations.length > 0) {
    // 사용자의 대화들 중에서 상대방도 참가한 대화 찾기
    const conversationIds = conversations.map(c => c.conversation_id);
    const { data: sharedConversations, error: sharedError } = await client
      .from("message_participants")
      .select("conversation_id")
      .eq("profile_id", otherUserId)
      .in("conversation_id", conversationIds);
      
    if (sharedError) throw new Error(sharedError.message);
    
    if (sharedConversations.length > 0) {
      // 기존 대화 반환
      return { conversation_id: sharedConversations[0].conversation_id };
    }
  }
  
  // 새 대화 생성
  return await createConversation(client, { participantIds: [userId, otherUserId] });
};

export const searchUsers = async (
  client: SupabaseClient<Database>,
  { searchTerm }: { searchTerm: string }
) => {
  const { data, error } = await client
    .from("users_view")
    .select("profile_id, username, display_name, avatar_url")
    .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
    .limit(10);
    
  if (error) throw new Error(error.message);
  return data;
};

export const getUserStats = async (
  client: SupabaseClient<Database>,
  { username }: { username: string }
) => {
  // 사용자의 리스팅 수 가져오기
  const { data: listings, error: listingsError } = await client
    .from("products_listings_view")
    .select("product_id")
    .eq("seller_name", username);
    
  if (listingsError) {
  }
  
  // 사용자의 리뷰 평점 가져오기
  const { data: reviews, error: reviewsError } = await client
    .from("local_reviews_list_view")
    .select("rating")
    .eq("author_username", username);
    
  if (reviewsError) {
    console.error("Error fetching user reviews:", reviewsError);
  }
  
  // 평균 평점 계산
  const averageRating = reviews && reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length 
    : 0;

  return {
    totalListings: listings?.length || 0,
    rating: Math.round(averageRating * 10) / 10,
    responseRate: "95%", // 기본값, 나중에 실제 응답률 계산 로직 추가 가능
  };
};

export const getUserSalesStatsByProfileId = async (client: SupabaseClient<Database>, profileId: string) => {
  const { data, error } = await client
    .from("user_sales_stats_view")
    .select("*")
    .eq("profile_id", profileId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getNotifications = async (
  client: SupabaseClient<Database>,
  { userId }: { userId: string }
) => {
  
  // 최근 일주일 전 날짜 계산
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const { data, error } = await client
    .from('user_notifications')
    .select(`
      notification_id,
      type,
      sender_id,
      receiver_id,
      product_id,
      message_id,
      review_id,
      is_read,
      read_at,
      data,
      created_at
    `)
    .eq('receiver_id', userId)
    .gte('created_at', oneWeekAgo.toISOString()) // 최근 일주일치만
    .order('created_at', { ascending: false }); // 최신순 정렬
    
  
  if (error) throw error;
  
  // 매핑: DB 필드 → 프론트엔드 타입 (프론트엔드 네이밍 일관성 & 기존 코드와의 호환성위해 notificationSchema를 수정하지 않고 매핑처리)
  const mappedNotifications = (data ?? []).map((n) => ({
    notification_id: n.notification_id,
    type: n.type,
    isRead: n.is_read,
    timestamp: n.created_at,
    // data 필드에서 추출하거나 기본값 사용
    title: (n.data as any)?.title ?? '',
    content: (n.data as any)?.content ?? '',
    avatar: (n.data as any)?.avatar ?? '',
    avatarFallback: (n.data as any)?.avatarFallback ?? '',
    metadata: n.data,
    // 기존 필드들도 유지
    sender_id: n.sender_id,
    product_id: n.product_id,
    message_id: n.message_id,
    review_id: n.review_id,
    read_at: n.read_at,
  }));
  
  
  return mappedNotifications;
};