import { 
  bigint, 
  pgEnum, 
  pgTable, 
  text, 
  timestamp, 
  integer, 
  boolean, 
  jsonb,
  decimal,
  uuid,
  index,
  pgSchema
} from "drizzle-orm/pg-core";

import { 
  USER_ROLES, 
  USER_STATUSES, 
  VERIFICATION_STATUSES,
  NOTIFICATION_TYPES,
  PREFERENCE_CATEGORIES,
  MESSAGE_TYPES
} from "./constants";
import { products } from '../products/schema';

// Enums
export const userRoles = pgEnum(
  "user_role",
  USER_ROLES.map((role) => role.value) as [string, ...string[]]
);

export const userStatuses = pgEnum(
  "user_status",
  USER_STATUSES.map((status) => status.value) as [string, ...string[]]
);

export const verificationStatuses = pgEnum(
  "verification_status",
  VERIFICATION_STATUSES.map((status) => status.value) as [string, ...string[]]
);

export const notificationTypes = pgEnum(
  "notification_type",
  NOTIFICATION_TYPES.map((type) => type.value) as [string, ...string[]]
);

export const preferenceCategories = pgEnum(
  "preference_category",
  PREFERENCE_CATEGORIES.map((category) => category.value) as [string, ...string[]]
);

// Main users table
export const users = pgSchema("auth").table("users", {
  id: uuid().primaryKey()
});

// User profiles table
export const userProfiles = pgTable("user_profiles", {
  profile_id: uuid().primaryKey().references(() => users.id),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  display_name: text("display_name").notNull(),
  avatar_url: text("avatar_url").notNull(),
  bio: text("bio"),
  location: text("location").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("user_profiles_user_id_idx").on(table.profile_id),
}));

// User verification table 
// User sessions table
// User preferences table 
// User security settings table
// User privacy settings table


// User notifications table
export const userNotifications = pgTable("user_notifications", {
  notification_id: uuid().primaryKey().defaultRandom(),
  user_id: uuid().notNull().references(() => users.id),
  type: notificationTypes().notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(), // content를 message로 변경하여 인터페이스와 일치
  timestamp: text("timestamp").notNull(), // 상대적 시간 표시 (예: "2분 전", "1시간 전")
  is_read: boolean().notNull().default(false),
  read_at: timestamp("read_at"),
  avatar_url: text("avatar_url"), // 발신자 아바타 URL
  username: text("username"), // 발신자 사용자명
  data: jsonb().notNull().default({}), // Additional data (예: 관련 리소스 ID, 링크 등)
  priority: integer().notNull().default(1), // 1=low, 2=medium, 3=high
  expires_at: timestamp("expires_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("user_notifications_user_id_idx").on(table.user_id),
  unreadIdx: index("user_notifications_unread_idx").on(table.is_read),
  typeIdx: index("user_notifications_type_idx").on(table.type),
  createdAtIdx: index("user_notifications_created_at_idx").on(table.created_at),
}));

// User activity log table
export const userActivityLogs = pgTable("user_activity_logs", {
  log_id: uuid().primaryKey().defaultRandom(),
  user_id: uuid().notNull().references(() => users.id),
  action: text("action").notNull(), // "login", "logout", "profile_update", etc.
  resource_type: text("resource_type"), // "profile", "listing", "message", etc.
  resource_id: text("resource_id"),
  details: jsonb().notNull().default({}), // Additional details
  // ip_address: text("ip_address"), // 비활성화: 사이드 프로젝트에서는 불필요
  // user_agent: text("user_agent"), // 비활성화: 사이드 프로젝트에서는 불필요
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("user_activity_logs_user_id_idx").on(table.user_id),
  actionIdx: index("user_activity_logs_action_idx").on(table.action),
  createdAtIdx: index("user_activity_logs_created_at_idx").on(table.created_at),
}));

// User likes table
export const userLikes = pgTable("user_likes", {
  like_id: uuid().primaryKey().defaultRandom(),
  user_id: uuid().notNull().references(() => users.id),
  product_id: uuid().notNull(), // 상품 ID (products 테이블 참조)
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("user_likes_user_id_idx").on(table.user_id),
  productIdIdx: index("user_likes_product_id_idx").on(table.product_id),
  uniqueUserProduct: index("user_likes_unique_user_product_idx").on(table.user_id, table.product_id),
  createdAtIdx: index("user_likes_created_at_idx").on(table.created_at),
}));

// User messages table (상품 문의 및 일반 메시지)
export const userMessages = pgTable("user_messages", {
  message_id: uuid().primaryKey().defaultRandom(),
  conversation_id: uuid().notNull(), // 대화방 ID
  sender_id: uuid().notNull().references(() => users.id),
  receiver_id: uuid().notNull().references(() => users.id),
  content: text("content").notNull(), // 메시지 내용
  message_type: text("message_type").notNull().default(MESSAGE_TYPES[0].value), // text, image, file
  media_url: text("media_url"), // 이미지/파일 URL
  is_read: boolean().notNull().default(false),
  read_at: timestamp("read_at"),
  product_id: uuid().references(() => products.product_id), // 관련 상품 ID (상품 문의인 경우)
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  conversationIdIdx: index("user_messages_conversation_id_idx").on(table.conversation_id),
  senderIdIdx: index("user_messages_sender_id_idx").on(table.sender_id),
  receiverIdIdx: index("user_messages_receiver_id_idx").on(table.receiver_id),
  unreadIdx: index("user_messages_unread_idx").on(table.is_read),
  productIdIdx: index("user_messages_product_id_idx").on(table.product_id),
  createdAtIdx: index("user_messages_created_at_idx").on(table.created_at),
}));

// User conversations table (대화방)
export const userConversations = pgTable("user_conversations", {
  conversation_id: uuid().primaryKey().defaultRandom(),
  participant_ids: jsonb().notNull(), // 참여자 ID 배열
  last_message_id: uuid().references(() => userMessages.message_id),
  last_message_content: text("last_message_content"),
  last_message_at: timestamp("last_message_at"),
  unread_count: integer().notNull().default(0),
  product_id: uuid().references(() => products.product_id), // 관련 상품 ID (상품 문의인 경우)
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  participantIdsIdx: index("user_conversations_participant_ids_idx").on(table.participant_ids),
  lastMessageAtIdx: index("user_conversations_last_message_at_idx").on(table.last_message_at),
  unreadCountIdx: index("user_conversations_unread_count_idx").on(table.unread_count),
  productIdIdx: index("user_conversations_product_id_idx").on(table.product_id),
  updatedAtIdx: index("user_conversations_updated_at_idx").on(table.updated_at),
}));

// User statistics table
export const userStatistics = pgTable("user_statistics", {
  stat_id: uuid().primaryKey().defaultRandom(),
  user_id: uuid().notNull().references(() => users.id),
  total_listings: integer().notNull().default(0),
  active_listings: integer().notNull().default(0),
  sold_items: integer().notNull().default(0),
  total_sales: decimal({ precision: 10, scale: 2 }).notNull().default("0"),
  total_purchases: integer().notNull().default(0),
  total_spent: decimal({ precision: 10, scale: 2 }).notNull().default("0"),
  positive_reviews: integer().notNull().default(0),
  negative_reviews: integer().notNull().default(0),
  member_since_days: integer().notNull().default(0),
  last_activity_days: integer().notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("user_statistics_user_id_idx").on(table.user_id),
}));


// Database types
export type UserNotification = typeof userNotifications.$inferSelect;
export type NewUserNotification = typeof userNotifications.$inferInsert;
export type UserLike = typeof userLikes.$inferSelect;
export type NewUserLike = typeof userLikes.$inferInsert;
export type UserMessage = typeof userMessages.$inferSelect;
export type NewUserMessage = typeof userMessages.$inferInsert;
export type UserConversation = typeof userConversations.$inferSelect;
export type NewUserConversation = typeof userConversations.$inferInsert;

// Likes page interface
export interface LikedProduct {
  id: string;
  title: string;
  price: string;
  image: string;
  seller: string;
  likes: number;
  category: string;
  condition: string;
  location: string;
  postedDate: string;
}