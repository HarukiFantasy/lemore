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
    id,
    product_id,
    user_id,
    created_at,
    category,
    title,
    price,
    seller,
    likes,
    currency,
    priceType,
    primary_image
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
  
  // 사용자가 참가한 대화들의 conversation_id 가져오기
  const { data: conversations, error: convError } = await client
    .from("message_participants")
    .select("conversation_id")
    .eq("profile_id", profileId);
    
  if (convError) throw new Error(convError.message);
  
  if (conversations.length === 0) return [];
  
  const conversationIds = conversations.map(c => c.conversation_id);
  
  // 각 대화의 최신 메시지와 참가자 정보 가져오기
  const { data: messages, error: msgError } = await client
    .from("user_messages_view")
    .select("*")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });
    
  if (msgError) throw new Error(msgError.message);
  
  // 대화별로 그룹화하고 최신 메시지만 선택
  const conversationMap = new Map();
  messages.forEach((message: any) => {
    if (!conversationMap.has(message.conversation_id)) {
      conversationMap.set(message.conversation_id, message);
    }
  });
  
  return Array.from(conversationMap.values());
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
    console.error("Error fetching user listings:", listingsError);
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