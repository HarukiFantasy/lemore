import { userSchema, createUserSchema, updateUserSchema, loginSchema, type User, type CreateUserData, type UpdateUserData, type LoginData } from "./schema";
import { messageListSchema, messageFiltersSchema, type MessageList, type MessageFilters } from "./schema";
import { notificationListSchema, notificationFiltersSchema, type NotificationList, type NotificationFilters } from "./schema";
import { validateWithZod } from "~/lib/utils";

// 사용자 생성 쿼리
export async function createUser(userData: CreateUserData): Promise<{ success: boolean; user?: User; errors?: string[] }> {
  const validation = validateWithZod(createUserSchema, userData);
  
  if (!validation.success) {
    return { success: false, errors: validation.errors };
  }

  try {
    // 실제 API 호출 로직
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    const user = await response.json();
    const userValidation = validateWithZod(userSchema, user);
    
    if (!userValidation.success) {
      return { success: false, errors: userValidation.errors };
    }

    return { success: true, user: userValidation.data };
  } catch (error) {
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

// 사용자 업데이트 쿼리
export async function updateUser(userId: string, updateData: UpdateUserData): Promise<{ success: boolean; user?: User; errors?: string[] }> {
  const validation = validateWithZod(updateUserSchema, updateData);
  
  if (!validation.success) {
    return { success: false, errors: validation.errors };
  }

  try {
    // 실제 API 호출 로직
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    const user = await response.json();
    const userValidation = validateWithZod(userSchema, user);
    
    if (!userValidation.success) {
      return { success: false, errors: userValidation.errors };
    }

    return { success: true, user: userValidation.data };
  } catch (error) {
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

// 사용자 조회 쿼리
export async function getUser(userId: string): Promise<{ success: boolean; user?: User; errors?: string[] }> {
  if (!userId) {
    return { success: false, errors: ['User ID is required'] };
  }

  try {
    // 실제 API 호출 로직
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const user = await response.json();
    const userValidation = validateWithZod(userSchema, user);
    
    if (!userValidation.success) {
      return { success: false, errors: userValidation.errors };
    }

    return { success: true, user: userValidation.data };
  } catch (error) {
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

// 로그인 쿼리
export async function loginUser(loginData: LoginData): Promise<{ success: boolean; user?: User; errors?: string[] }> {
  const validation = validateWithZod(loginSchema, loginData);
  
  if (!validation.success) {
    return { success: false, errors: validation.errors };
  }

  try {
    // 실제 API 호출 로직
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const user = await response.json();
    const userValidation = validateWithZod(userSchema, user);
    
    if (!userValidation.success) {
      return { success: false, errors: userValidation.errors };
    }

    return { success: true, user: userValidation.data };
  } catch (error) {
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

// 사용자 삭제 쿼리
export async function deleteUser(userId: string): Promise<{ success: boolean; errors?: string[] }> {
  if (!userId) {
    return { success: false, errors: ['User ID is required'] };
  }

  try {
    // 실제 API 호출 로직
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }

    return { success: true };
  } catch (error) {
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

// Dashboard Stats 쿼리
export async function fetchDashboardStats(userId: string): Promise<{ success: boolean; stats?: DashboardStats; errors?: string[] }> {
  if (!userId) {
    return { success: false, errors: ['User ID is required'] };
  }

  try {
    // 실제 API 호출 로직
    const response = await fetch(`/api/users/${userId}/dashboard/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    const stats = await response.json();
    
    // 데이터 검증 (실제로는 스키마를 정의해야 함)
    if (!stats || typeof stats !== 'object') {
      return { success: false, errors: ['Invalid stats data'] };
    }

    return { success: true, stats };
  } catch (error) {
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

// Recent Activity 쿼리
export async function fetchRecentActivity(userId: string): Promise<{ success: boolean; activities?: Activity[]; errors?: string[] }> {
  if (!userId) {
    return { success: false, errors: ['User ID is required'] };
  }

  try {
    // 실제 API 호출 로직
    const response = await fetch(`/api/users/${userId}/dashboard/activity`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch recent activity');
    }

    const activities = await response.json();
    
    // 데이터 검증
    if (!Array.isArray(activities)) {
      return { success: false, errors: ['Invalid activity data'] };
    }

    return { success: true, activities };
  } catch (error) {
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

// Mock 데이터 (개발용)
export async function fetchMockDashboardData(): Promise<{ success: boolean; data?: DashboardData; errors?: string[] }> {
  try {
    // 실제 환경에서는 API 호출을 하지만, 여기서는 mock 데이터를 반환
    const mockData: DashboardData = {
      stats: {
        activeListings: 12,
        totalSales: 847,
        unreadMessages: 5,
        activeListingsChange: '+2 from last week',
        totalSalesChange: '+15% from last month',
        unreadMessagesChange: '3 new today'
      },
      recentActivity: [
        {
          id: '1',
          type: 'message',
          title: 'John Doe messaged you about "Vintage Camera"',
          timestamp: '2 hours ago',
          avatar: '/sample.png',
          avatarFallback: 'JD',
          icon: 'message'
        },
        {
          id: '2',
          type: 'sale',
          title: '"Wireless Headphones" sold for $45',
          timestamp: '1 day ago',
          icon: 'sale'
        },
        {
          id: '3',
          type: 'listing',
          title: 'New listing "Gaming Console" created',
          timestamp: '3 days ago',
          icon: 'listing'
        }
      ]
    };

    return { success: true, data: mockData };
  } catch (error) {
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

// 타입 정의
export interface DashboardStats {
  activeListings: number;
  totalSales: number;
  unreadMessages: number;
  activeListingsChange: string;
  totalSalesChange: string;
  unreadMessagesChange: string;
}

export interface Activity {
  id: string;
  type: 'message' | 'sale' | 'listing' | 'review';
  title: string;
  timestamp: string;
  avatar?: string;
  avatarFallback?: string;
  icon: 'message' | 'sale' | 'listing' | 'review';
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: Activity[];
}

// 메시지 목록 조회 쿼리
export async function fetchMessages(userId: string, filters: Partial<MessageFilters> = {}): Promise<{ success: boolean; data?: MessageList; errors?: string[] }> {
  if (!userId) {
    return { success: false, errors: ['User ID is required'] };
  }

  try {
    // 기본값 설정
    const defaultFilters: MessageFilters = {
      search: undefined,
      unreadOnly: undefined,
      limit: 20,
      ...filters
    };

    // 필터 검증
    const filtersValidation = validateWithZod(messageFiltersSchema, defaultFilters);
    if (!filtersValidation.success) {
      return { success: false, errors: filtersValidation.errors };
    }

    // 실제 API 호출 로직
    const queryParams = new URLSearchParams();
    if (filtersValidation.data.search) {
      queryParams.append('search', filtersValidation.data.search);
    }
    if (filtersValidation.data.unreadOnly) {
      queryParams.append('unreadOnly', 'true');
    }
    queryParams.append('limit', filtersValidation.data.limit.toString());

    const response = await fetch(`/api/users/${userId}/messages?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    const data = await response.json();
    const dataValidation = validateWithZod(messageListSchema, data);
    
    if (!dataValidation.success) {
      return { success: false, errors: dataValidation.errors };
    }

    return { success: true, data: dataValidation.data };
  } catch (error) {
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

// Mock 메시지 데이터 (개발용)
export async function fetchMockMessages(userId: string, filters: Partial<MessageFilters> = {}): Promise<{ success: boolean; data?: MessageList; errors?: string[] }> {
  if (!userId) {
    return { success: false, errors: ['User ID is required'] };
  }

  try {
    // 기본값 설정
    const defaultFilters: MessageFilters = {
      search: undefined,
      unreadOnly: undefined,
      limit: 20,
      ...filters
    };

    // 필터 검증
    const filtersValidation = validateWithZod(messageFiltersSchema, defaultFilters);
    if (!filtersValidation.success) {
      return { success: false, errors: filtersValidation.errors };
    }

    // Mock 데이터 생성
    const mockConversations = [
      {
        id: "conv-1",
        participantIds: [userId, "user-2"],
        lastMessage: {
          id: "msg-1",
          content: "Hi! I'm interested in your vintage camera. Is it still available?",
          senderId: "user-2",
          receiverId: userId,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          isRead: false,
        },
        unreadCount: 2,
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "conv-2",
        participantIds: [userId, "user-3"],
        lastMessage: {
          id: "msg-2",
          content: "Thanks for the quick shipping!",
          senderId: "user-3",
          receiverId: userId,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          isRead: true,
        },
        unreadCount: 0,
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "conv-3",
        participantIds: [userId, "user-4"],
        lastMessage: {
          id: "msg-3",
          content: "Is the gaming console still available?",
          senderId: "user-4",
          receiverId: userId,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          isRead: true,
        },
        unreadCount: 0,
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "conv-4",
        participantIds: [userId, "user-5"],
        lastMessage: {
          id: "msg-4",
          content: "Can you hold the headphones until Friday?",
          senderId: "user-5",
          receiverId: userId,
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
          isRead: true,
        },
        unreadCount: 0,
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // 검색 필터 적용
    let filteredConversations = mockConversations;
    if (filtersValidation.data.search) {
      const searchTerm = filtersValidation.data.search.toLowerCase();
      filteredConversations = mockConversations.filter(conv => 
        conv.lastMessage?.content.toLowerCase().includes(searchTerm)
      );
    }

    // 읽지 않은 메시지만 필터
    if (filtersValidation.data.unreadOnly) {
      filteredConversations = filteredConversations.filter(conv => conv.unreadCount > 0);
    }

    // 제한 적용
    const limitedConversations = filteredConversations.slice(0, filtersValidation.data.limit || 20);

    const mockData: MessageList = {
      conversations: limitedConversations,
      totalCount: filteredConversations.length,
      hasMore: filteredConversations.length > (filtersValidation.data.limit || 20),
    };

    return { success: true, data: mockData };
  } catch (error) {
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

// 알림 가져오기 쿼리
export async function fetchNotifications(userId: string, filters: Partial<NotificationFilters> = {}): Promise<{ success: boolean; data?: NotificationList; errors?: string[] }> {
  if (!userId) {
    return { success: false, errors: ['User ID is required'] };
  }

  try {
    const url = new URL('/api/notifications', window.location.origin);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const data = await response.json();
    const validation = validateWithZod(notificationListSchema, data);
    
    if (!validation.success) {
      return { success: false, errors: validation.errors };
    }

    return { success: true, data: validation.data };
  } catch (error) {
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

// Mock 알림 데이터 가져오기
export async function fetchMockNotifications(userId: string, filters: Partial<NotificationFilters> = {}): Promise<{ success: boolean; data?: NotificationList; errors?: string[] }> {
  if (!userId) {
    return { success: false, errors: ['User ID is required'] };
  }

  try {
    // Mock 데이터 생성
    const mockNotifications = [
      {
        id: "1",
        type: "message" as const,
        title: "Sarah Miller sent you a message",
        content: "Hi! I'm interested in your vintage camera. Is it still available?",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        isRead: false,
        avatar: "/sample.png",
        avatarFallback: "SM",
        actions: [
          { label: "Reply", action: "reply", variant: "default" },
          { label: "View Listing", action: "view_listing", variant: "outline" }
        ]
      },
      {
        id: "2",
        type: "sale" as const,
        title: "Item Sold Successfully!",
        content: "Your \"Wireless Headphones\" has been sold for $45. Payment has been processed.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        isRead: true,
        avatar: undefined,
        avatarFallback: undefined,
        actions: [
          { label: "View Details", action: "view_details", variant: "default" },
          { label: "Print Label", action: "print_label", variant: "outline" }
        ]
      },
      {
        id: "3",
        type: "review" as const,
        title: "Mike Johnson left you a review",
        content: "Great seller, fast shipping!",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        isRead: true,
        avatar: "/sample.png",
        avatarFallback: "MJ",
        metadata: { rating: 4 },
        actions: [
          { label: "View Review", action: "view_review", variant: "default" },
          { label: "Thank Buyer", action: "thank_buyer", variant: "outline" }
        ]
      },
      {
        id: "4",
        type: "system" as const,
        title: "New Feature Available",
        content: "We've added bulk listing tools! Create multiple listings at once to save time.",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        isRead: true,
        avatar: undefined,
        avatarFallback: undefined,
        actions: [
          { label: "Try It Now", action: "try_feature", variant: "default" },
          { label: "Learn More", action: "learn_more", variant: "outline" }
        ]
      },
      {
        id: "5",
        type: "price_drop" as const,
        title: "Price Drop Alert",
        content: "An item on your wishlist \"Gaming Console\" has dropped in price by 15%.",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        isRead: true,
        avatar: undefined,
        avatarFallback: undefined,
        actions: [
          { label: "View Item", action: "view_item", variant: "default" },
          { label: "Remove Alert", action: "remove_alert", variant: "outline" }
        ]
      }
    ];

    // 필터 적용
    let filteredNotifications = mockNotifications;
    
    if (filters.type && filters.type !== "all") {
      filteredNotifications = filteredNotifications.filter(n => n.type === filters.type);
    }
    
    if (filters.unreadOnly) {
      filteredNotifications = filteredNotifications.filter(n => !n.isRead);
    }

    // 페이지네이션 적용
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

    const result: NotificationList = {
      notifications: paginatedNotifications,
      totalCount: filteredNotifications.length,
      unreadCount: mockNotifications.filter(n => !n.isRead).length,
      hasMore: endIndex < filteredNotifications.length,
      filters: {
        type: (filters.type as "all" | "message" | "sale" | "review" | "system" | "price_drop") || "all",
        unreadOnly: filters.unreadOnly || false,
        limit: limit,
        page: page
      }
    };

    return { success: true, data: result };
  } catch (error) {
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

// 알림 읽음 처리
export async function markNotificationAsRead(notificationId: string): Promise<{ success: boolean; errors?: string[] }> {
  if (!notificationId) {
    return { success: false, errors: ['Notification ID is required'] };
  }

  try {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    return { success: true };
  } catch (error) {
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

// 모든 알림 읽음 처리
export async function markAllNotificationsAsRead(userId: string): Promise<{ success: boolean; errors?: string[] }> {
  if (!userId) {
    return { success: false, errors: ['User ID is required'] };
  }

  try {
    const response = await fetch(`/api/notifications/${userId}/read-all`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }

    return { success: true };
  } catch (error) {
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

// Mock 사용자 프로필 데이터 가져오기 (개발 환경용)
export async function fetchMockUserProfile(userId: string): Promise<{ success: boolean; user?: User; errors?: string[] }> {
  if (!userId) {
    return { success: false, errors: ['User ID is required'] };
  }

  try {
    // Mock 사용자 데이터
    const mockUser: User = {
      id: userId,
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "/sample.png",
      bio: "Passionate about sustainable living and finding new homes for pre-loved items. Always looking for quality secondhand treasures!",
      location: "San Francisco, CA",
      memberSince: "January 2024",
      rating: 4.8,
      totalSales: 127,
      responseRate: "89%",
      responseTime: "2 hours"
    };

    // 실제 환경에서는 네트워크 지연을 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 100));

    return { success: true, user: mockUser };
  } catch (error) {
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

// 사용자 설정 타입 정의
export interface UserSettings {
  notifications: {
    email: "all" | "important" | "none";
    push: "all" | "important" | "none";
    marketing: boolean;
    updates: boolean;
  };
  privacy: {
    profileVisibility: "public" | "friends" | "private";
    contactInfo: "everyone" | "buyers" | "verified";
    locationSharing: "city" | "region" | "none";
    showOnlineStatus: boolean;
  };
  preferences: {
    language: "en" | "es" | "fr" | "de";
    timezone: "pst" | "est" | "cst" | "mst" | "gmt";
    currency: "USD" | "EUR" | "GBP" | "JPY";
    dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  };
  security: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    sessionTimeout: number;
  };
}

// Mock 사용자 설정 데이터 가져오기 (개발 환경용)
export async function fetchMockUserSettings(userId: string): Promise<{ success: boolean; settings?: UserSettings; errors?: string[] }> {
  if (!userId) {
    return { success: false, errors: ['User ID is required'] };
  }

  try {
    // Mock 사용자 설정 데이터
    const mockSettings: UserSettings = {
      notifications: {
        email: "all",
        push: "important",
        marketing: false,
        updates: true
      },
      privacy: {
        profileVisibility: "public",
        contactInfo: "buyers",
        locationSharing: "city",
        showOnlineStatus: true
      },
      preferences: {
        language: "en",
        timezone: "pst",
        currency: "USD",
        dateFormat: "MM/DD/YYYY"
      },
      security: {
        twoFactorEnabled: false,
        loginNotifications: true,
        sessionTimeout: 30
      }
    };

    // 실제 환경에서는 네트워크 지연을 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 100));

    return { success: true, settings: mockSettings };
  } catch (error) {
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}
