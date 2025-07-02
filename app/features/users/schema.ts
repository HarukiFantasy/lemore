import { z } from "zod";

// 사용자 관련 스키마
// 현재 사용자 기능에 대한 Zod 스키마가 정의되지 않았습니다.
// 필요에 따라 스키마를 추가하세요.

// 예시 스키마 (필요시 사용):
// export const userSchema = z.object({
//   id: z.string().min(1, "User ID is required"),
//   name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
//   email: z.string().email("Invalid email address"),
//   // 기타 사용자 필드들
// });

// export type User = z.infer<typeof userSchema>;

// 사용자 기본 정보 스키마
export const userSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  avatar: z.string().url("Avatar URL must be valid").optional(),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
  location: z.string().optional(),
  memberSince: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  totalSales: z.number().min(0).optional(),
  responseTime: z.string().optional(),
});

// 사용자 통계 정보 스키마
export const userStatsSchema = z.object({
  itemsSold: z.number().min(0, "Items sold must be non-negative"),
  averageRating: z.number().min(0).max(5, "Average rating must be between 0 and 5"),
  responseRate: z.string().regex(/^\d+%$/, "Response rate must be in percentage format (e.g., '89%')"),
});

// 사용자 생성 스키마
export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  avatar: z.instanceof(File).optional(),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
  location: z.string().optional(),
});

// 사용자 업데이트 스키마
export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
  location: z.string().optional(),
  avatar: z.instanceof(File).optional(),
});

// 로그인 스키마
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// 비밀번호 재설정 스키마
export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// 새 비밀번호 설정 스키마
export const newPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// 메시지 스키마
export const messageSchema = z.object({
  id: z.string().min(1, "Message ID is required"),
  content: z.string().min(1, "Message content is required").max(1000, "Message content must be less than 1000 characters"),
  senderId: z.string().min(1, "Sender ID is required"),
  receiverId: z.string().min(1, "Receiver ID is required"),
  timestamp: z.string().datetime("Invalid timestamp"),
  isRead: z.boolean(),
  attachments: z.array(z.string().url("Attachment URL must be valid")).optional(),
});

// 대화 스키마
export const conversationSchema = z.object({
  id: z.string().min(1, "Conversation ID is required"),
  participantIds: z.array(z.string().min(1, "Participant ID is required")).length(2, "Conversation must have exactly 2 participants"),
  lastMessage: messageSchema.optional(),
  unreadCount: z.number().min(0, "Unread count must be non-negative"),
  updatedAt: z.string().datetime("Invalid timestamp"),
});

// 메시지 필터 스키마
export const messageFiltersSchema = z.object({
  search: z.string().optional(),
  unreadOnly: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(20),
});

// 메시지 목록 스키마
export const messageListSchema = z.object({
  conversations: z.array(conversationSchema),
  totalCount: z.number().min(0),
  hasMore: z.boolean(),
});

// 알림 스키마
export const notificationSchema = z.object({
  id: z.string().min(1, "Notification ID is required"),
  type: z.enum(["message", "sale", "review", "system", "price_drop"]),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  timestamp: z.string().datetime("Invalid timestamp"),
  isRead: z.boolean(),
  avatar: z.string().url("Avatar URL must be valid").optional(),
  avatarFallback: z.string().optional(),
  actions: z.array(z.object({
    label: z.string(),
    action: z.string(),
    variant: z.enum(["default", "outline"]),
  })).optional(),
  metadata: z.record(z.any()).optional(),
});

// 알림 필터 스키마
export const notificationFiltersSchema = z.object({
  type: z.enum(["all", "message", "sale", "review", "system", "price_drop"]).default("all"),
  unreadOnly: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(20),
  page: z.number().min(1).default(1),
});

// 알림 목록 스키마
export const notificationListSchema = z.object({
  notifications: z.array(notificationSchema),
  totalCount: z.number().min(0),
  unreadCount: z.number().min(0),
  hasMore: z.boolean(),
  filters: notificationFiltersSchema,
});

// 타입 추론
export type User = z.infer<typeof userSchema>;
export type UserStats = z.infer<typeof userStatsSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type NewPasswordData = z.infer<typeof newPasswordSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type MessageFilters = z.infer<typeof messageFiltersSchema>;
export type MessageList = z.infer<typeof messageListSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type NotificationFilters = z.infer<typeof notificationFiltersSchema>;
export type NotificationList = z.infer<typeof notificationListSchema>;
