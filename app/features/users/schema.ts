import { sql } from 'drizzle-orm';
import { 
  pgEnum, 
  pgTable, 
  text, 
  timestamp, 
  integer, 
  boolean, 
  jsonb,
  decimal,
  uuid,
  pgSchema,
  bigint,
  primaryKey,
  check,
} from "drizzle-orm/pg-core";
import { giveAndGlowReviews } from '../community/schema';
import { products } from '../products/schema';
import { NOTIFICATION_TYPES } from './constants';

// ===== ENUMS =====

// User related enums

export const notificationTypes = pgEnum("notification_type", NOTIFICATION_TYPES.map(type => type.value) as [string, ...string[]]);


// ===== TABLES =====

// Auth schema - users table (Supabase Auth integration)
export const users = pgSchema("auth").table("users", {
  id: uuid().primaryKey()
});

// User profiles table
export const userProfiles = pgTable("user_profiles", {
  profile_id: uuid().primaryKey().unique().references(() => users.id, {onDelete: "cascade"}),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  avatar_url: text("avatar_url"),
  bio: text("bio"),
  location: text("location").notNull(),
  total_likes: integer().notNull().default(0),
  total_views: integer().notNull().default(0),
  total_listings: integer().notNull().default(0),
  response_rate: decimal({ precision: 10, scale: 2 }).notNull().default("0.00"),
  response_time: text("response_time").notNull().default("< 1 hour"),
  rating: decimal({ precision: 10, scale: 2 }).notNull().default("0.00"),
  appreciation_badge: boolean("appreciation_badge").default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [check('rating_check', sql`rating >= 0 AND rating <= 5`)
]);

// User reviews table
export const userReviews = pgTable("user_reviews", {
  review_id: bigint("review_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  reviewer_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  reviewee_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  rating: integer().notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// User notifications table
export const userNotifications = pgTable("user_notifications", {
  notification_id: bigint("notification_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  type: notificationTypes().notNull(),
  sender_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  receiver_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  product_id: uuid().references(() => products.product_id, {onDelete: "cascade"}),
  message_id: uuid().references(() => userMessages.message_id, {onDelete: "cascade"}),
  review_id: uuid().references(() => giveAndGlowReviews.id, {onDelete: "cascade"}),  
  is_read: boolean().notNull().default(false),
  read_at: timestamp("read_at"),
  data: jsonb().notNull().default({}),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// User conversations table
export const userConversations = pgTable("user_conversations", {
  conversation_id: bigint("conversation_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Message participants table
export const messageParticipants = pgTable("message_participants", {
  conversation_id: bigint("conversation_id", {mode: "number"}).notNull().references(() => userConversations.conversation_id, {onDelete: "cascade"}),
  profile_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.conversation_id, table.profile_id] }),
]);

// User messages table
export const userMessages = pgTable("user_messages", {
  message_id: bigint("message_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  conversation_id: bigint("conversation_id", {mode: "number"}).notNull().references(() => userConversations.conversation_id, {onDelete: "cascade"}),
  sender_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  receiver_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  content: text("content").notNull(),
  media_url: text("media_url"),
  seen: boolean().notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
});