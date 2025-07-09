import supaClient from "~/supa-client";

export const getUser = async () => {
  const { data, error } = await supaClient.from("users_view").select("*");
  if (error) throw new Error(error.message);
  return data;
};

export const getCurrentUser = async () => {
  // 개발 환경에서 테스트용 사용자 데이터 반환
  const mockUser = {
    user_id: "test-user-id",
    profile_id: "test-profile-id",
    username: "TestUser",
    email: "test@example.com",
    avatar_url: null,
    bio: "This is a test user for development",
    location: "Bangkok, Thailand",
    total_likes: 42,
    total_views: 156,
    total_listings: 8,
    response_rate: 95.5,
    response_time: "< 1 hour",
    rating: 4.8,
    appreciation_badge: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    total_sales: 1000,
    total_sales_change: "+15% from last month",
    unread_messages: 3,
    unread_messages_change: "+2 from yesterday",
    recent_activity: [
      {
        id: 1,
        title: "New message from Sarah about your laptop listing",
        timestamp: "2 hours ago"
      }
    ]
  };
  
  return mockUser;
  
  // 실제 인증 코드 (나중에 주석 해제)
  /*
  const { data: { user }, error: authError } = await supaClient.auth.getUser();
  if (authError || !user) throw new Error("User not authenticated");
  
  const { data, error } = await supaClient
    .from("users_view")
    .select("*")
    .eq("user_id", user.id)
    .single();
    
  if (error) throw new Error(error.message);
  return data;
  */
};