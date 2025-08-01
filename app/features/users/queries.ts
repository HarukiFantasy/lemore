import { SupabaseClient } from '@supabase/supabase-js';
import { redirect } from 'react-router';
import { Database } from '~/supa-client';

export const getUser = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.from("user_profiles").select("*");
  if (error) throw new Error(error.message);
  return data;
};

export const getUserByProfileId = async (client: SupabaseClient<Database>, { profileId }: { profileId: string|null }) => {
  if (!profileId) {
    return null;
  }
  const { data, error } = await client
    .from("user_profiles")
    .select(`*`)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching user profile by ID: ${profileId}`, error);
    return null;
  }

  return data;
};

export const getUserByUsername = async (client: SupabaseClient<Database>, { username }: { username: string }) => {
  const { data, error } = await client
    .from("user_profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();
    
  if (error) throw new Error(error.message);
  return data;
};

export const getDashboard = async (client: SupabaseClient<Database>, { profileId }: { profileId: string|null }) => {
  if (!profileId) throw new Error("Profile ID is required");
  
  const { data, error } = await client
    .from("user_dashboard_view")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
    
  if (error) throw new Error(error.message);
  return data;
};

export const getLikedProductsByUserId = async (
  client: SupabaseClient<Database>,
  { profileId }: { profileId: string | null }
) => {
  if (!profileId) throw new Error("Profile ID is required");

  const { data, error } = await client
    .from("product_likes")
    .select(`
      product_id,
      created_at,
      products:products_listings_view!product_id (
        product_id,
        primary_image,
        title,
        price,
        currency,
        price_type,
        seller_name,
        likes_count
      )
    `)
    .eq("user_id", profileId);

  if (error) throw new Error(error.message);
  return data;
};


export const getLoggedInUserId = async (client: SupabaseClient<Database>) => {
  try {
    const { data, error } = await client.auth.getUser();
    
    if (error) {
      console.warn('Authentication error in getLoggedInUserId:', error.message);
      
      // Handle specific refresh token errors
      if (error.message.includes('refresh_token_not_found') || 
          error.message.includes('Invalid Refresh Token') ||
          error.code === 'refresh_token_not_found') {
        // Clear the invalid session
        await client.auth.signOut();
      }
      
      throw redirect("/auth/login");
    }
    
    if (data.user === null) {
      throw redirect("/auth/login");
    }
    
    return data.user.id;
  } catch (error: any) {
    // If it's already a redirect, re-throw it
    if (error?.status === 302) {
      throw error;
    }
    
    console.error('Unexpected error in getLoggedInUserId:', error);
    
    // Handle token-related errors
    if (error?.message?.includes('refresh_token_not_found') || 
        error?.message?.includes('Invalid Refresh Token') ||
        error?.code === 'refresh_token_not_found') {
      try {
        await client.auth.signOut();
      } catch (signOutError) {
        console.warn('Error during forced sign out:', signOutError);
      }
    }
    
    throw redirect("/auth/login");
  }
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
    .maybeSingle();
    
  if (error) throw new Error(error.message);
  return data;
};

export const createConversation = async (
  client: SupabaseClient<Database>,
  { participantIds, productId }: { participantIds: string[]; productId?: number }
) => {
  // 대화 생성
  const { data: conversation, error: conversationError } = await client
    .from("user_conversations")
    .insert({
      product_id: productId || null
    } as any)
    .select()
    .maybeSingle();
    
  if (conversationError) throw new Error(conversationError.message);
  
  if (!conversation) throw new Error('Failed to create conversation');
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
  { userId, otherUserId, productId }: { userId: string; otherUserId: string; productId?: number }
) => {
  const { data, error } = await client.rpc('get_or_create_conversation_with_participants', {
    p_user_id: userId,
    p_other_user_id: otherUserId,
    p_product_id: productId
  });

  if (error) {
    console.error('Error in getOrCreateConversation RPC:', error);
    throw error;
  }
  
  if (!data) {
    throw new Error('Failed to get or create conversation.');
  }

  return data;
};

export const searchUsers = async (
  client: SupabaseClient<Database>,
  { searchTerm }: { searchTerm: string }
) => {
  const { data, error } = await client
    .from("user_profiles")
    .select("profile_id, username, avatar_url")
    .or(`username.ilike.%${searchTerm}%`)
    .limit(10);
    
  if (error) throw new Error(error.message);
  return data;
};

export const getUserStats = async (
  client: SupabaseClient<Database>,
  { username }: { username: string }
) => {
  const { data, error } = await client
    .from("user_activity_view")
    .select("*")
    .eq("username", username)
    .limit(1); // 첫 번째 행만 가져오기

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return null; // 데이터가 없으면 null 반환
  return data[0]; // 첫 번째 행 반환
};

export const getUserListings = async (
  client: SupabaseClient<Database>,
  { userId }: { userId: string }
) => {
  const { data, error } = await client
    .from("products_listings_view")
    .select("*")
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });
    
  if (error) throw new Error(error.message);
  return data || [];
};

export const getUserSalesStatsByProfileId = async (client: SupabaseClient<Database>, profileId: string) => {
  const { data, error } = await client
    .from("user_sales_stats_view")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
};


export const getNotifications = async (
  client: SupabaseClient<Database>,
  { userId }: { userId: string }
) => {
  // @ts-ignore: notification_view may not be in generated types but exists in DB
  const { data, error } = await client
    .from('notification_view')
    .select('*')
    .eq('receiver_id', userId)
    .eq('is_read', false) // 안 읽은 알림만 가져오기
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // 기존 매핑 로직 유지, sender_name/receiver_name 포함
  const mappedNotifications = (data ?? []).map((n) => ({
    notification_id: (n as any).notification_id ?? null,
    type: (n as any).type ?? null,
    isRead: (n as any).is_read ?? null,
    timestamp: (n as any).created_at ?? null,
    // data 필드에서 추출하거나 기본값 사용
    title: (n as any).data?.title ?? '',
    content: (n as any).data?.content ?? '',
    avatar: (n as any).data?.avatar ?? '',
    avatarFallback: (n as any).data?.avatarFallback ?? '',
    metadata: (n as any).data ?? null,
    // 기존 필드들도 유지
    sender_id: (n as any).sender_id ?? null,
    sender_name: (n as any).sender_name ?? null,
    receiver_id: (n as any).receiver_id ?? null,
    receiver_name: (n as any).receiver_name ?? null,
    product_id: (n as any).product_id ?? null,
    message_id: (n as any).message_id ?? null,
    review_id: (n as any).review_id ?? null,
    read_at: (n as any).read_at ?? null,
  }));
  
  return mappedNotifications;
};

// Add a utility function to safely get user with better error handling
export const getSafeUser = async (client: SupabaseClient<Database>) => {
  try {
    const { data, error } = await client.auth.getUser();
    
    if (error) {
      // Handle specific refresh token errors
      if (error.message.includes('refresh_token_not_found') || 
          error.message.includes('Invalid Refresh Token') ||
          error.code === 'refresh_token_not_found') {
        // Clear the invalid session
        await client.auth.signOut();
      }
      return null;
    }
    
    return data.user;
  } catch (error: any) {
    
    // Handle token-related errors
    if (error?.message?.includes('refresh_token_not_found') || 
        error?.message?.includes('Invalid Refresh Token') ||
        error?.code === 'refresh_token_not_found') {
      try {
        await client.auth.signOut();
      } catch (signOutError) {
        throw new Error('Error during forced sign out');
      }
    }
    
    return null;
  }
};

export const getUnreadNotificationsStatus = async (
  client: SupabaseClient<Database>,
  userId: string,
) => {
  const { count, error } = await client
    .from('user_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error("Error fetching unread notification status:", error);
    return false;
  }
  return count !== null && count > 0;
};

export const getUnreadMessagesStatus = async (
  client: SupabaseClient<Database>,
  userId: string,
) => {
  const { count, error } = await client
    .from('user_messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('seen', false);

  if (error) {
    console.error("Error fetching unread message status:", error);
    return false;
  }
  return count !== null && count > 0;
};