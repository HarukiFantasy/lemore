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
  index,
  pgSchema,
  bigint,
  primaryKey,
  check,
} from "drizzle-orm/pg-core";

// ===== ENUMS =====

// User related enums

export const localTipCategories = pgEnum("local_tip_categories", [
  "Visa", "Bank", "Tax", "Health", "Education", "Transportation", "Other"
]);

export const notificationTypes = pgEnum("notification_type", [
  "message", "like", "reply", "mention"
]);

export const messageTypes = pgEnum("message_type", [
  "text", "image", "file", "audio", "video", "location"
]);

// Product related enums
export const productCategories = pgEnum("product_category", [
  "electronics", "clothing", "books", "home", "sports", 
  "beauty", "toys", "automotive", "health", "other"
]);

export const productConditions = pgEnum("product_condition", [
  "new", "like_new", "excellent", "good", "fair", "poor"
]);

export const priceTypes = pgEnum("price_type", [
  "fixed", "negotiable", "free", "auction"
]);

// Let Go Buddy related enums
export const declutterSituations = pgEnum("declutter_situation", [
  "moving", "downsizing", "spring_cleaning", "digital_declutter", 
  "minimalism", "inheritance", "relationship_change", "other"
]);

export const recommendationActions = pgEnum("recommendation_action", [
  "keep", "sell", "donate", "recycle", "repair", "repurpose", "discard"
]);

export const environmentalImpactLevels = pgEnum("environmental_impact_level", [
  "low", "medium", "high", "critical"
]);

// ===== TABLES =====

// Category table
export const categories = pgTable("categories", {
  category_id: bigint("category_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  name: productCategories().notNull(),
});

// Products table
export const products = pgTable("products", {
  product_id: bigint("product_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  seller_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  title: text("title").notNull(),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
  currency: text().notNull().default("THB"),
  category_id: bigint("category_id", {mode: "number"}).references(() => categories.category_id, {onDelete: "set null"}),
  condition: productConditions().notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  tags: jsonb().notNull().default([]),
  is_sold: boolean().notNull().default(false),
  price_type: priceTypes().notNull().default("fixed"),
  stats: jsonb().notNull().default({views: 0, likes: 0}),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Product images table
export const productImages = pgTable("product_images", {
  product_id: bigint("product_id", {mode: "number"}).notNull().references(() => products.product_id),
  image_url: text("image_url").notNull(),
  image_order: integer().notNull().default(0),
  is_primary: boolean().notNull().default(false),
}, (table) => [
  primaryKey({ columns: [table.product_id, table.image_order] }),
]);

// Product likes table
export const productLikes = pgTable("product_likes", {
  product_id: bigint("product_id", {mode: "number"}).notNull().references(() => products.product_id),
  user_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}), 
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.product_id, table.user_id] }),
]);

// Product views table
export const productViews = pgTable("product_views", {
  view_id: bigint("view_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  product_id: bigint("product_id", {mode: "number"}).notNull(),
  user_id: uuid().references(() => userProfiles.profile_id), 
  viewed_at: timestamp("viewed_at").notNull().defaultNow(),
});


// Auth schema - users table (Supabase Auth integration)
export const users = pgSchema("auth").table("users", {
  id: uuid().primaryKey()
});

// User profiles table
export const userProfiles = pgTable("user_profiles", {
  profile_id: uuid().primaryKey().unique().references(() => users.id, {onDelete: "cascade"}),
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
  product_id: bigint("product_id", {mode: "number"}).references(() => products.product_id, {onDelete: "cascade"}),
  message_id: bigint("message_id", {mode: "number"}).references(() => userMessages.message_id, {onDelete: "cascade"}),
  review_id: bigint("review_id", {mode: "number"}).references(() => giveAndGlowReviews.id, {onDelete: "cascade"}),  
  
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
  message_type: messageTypes().notNull().default("text"),
  media_url: text("media_url"),
  seen: boolean().notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Give & Glow reviews table
export const giveAndGlowReviews = pgTable("give_and_glow_reviews", {
  id: bigint("id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  product_id: bigint("product_id", {mode: "number"}).references(() => products.product_id, {onDelete: "cascade"}),
  giver_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  receiver_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  category: productCategories().notNull(),
  rating: integer("rating").notNull(),
  review: text("review").notNull(),
  timestamp: text("timestamp").notNull(),
  tags: jsonb("tags").notNull().default([]),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Local businesses table
export const localBusinesses = pgTable("local_businesses", {
  id: bigint("id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  type: text("type"),
  location: text("location").notNull(),
  average_rating: decimal("average_rating", { precision: 3, scale: 2 }).notNull().default("0.00"),
  total_reviews: integer("total_reviews").notNull().default(0),
  price_range: text("price_range").notNull(),
  tags: jsonb("tags").notNull().default([]),
  image: text("image"),
  address: text("address"),
  website: text("website"),
  description: text("description"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Local business reviews table
export const localBusinessReviews = pgTable("local_business_reviews", {
  business_id: bigint("business_id", {mode: "number"}).notNull().references(() => localBusinesses.id),
  rating: integer("rating").notNull(),
  author: uuid().notNull().references(() => userProfiles.profile_id),
  author_avatar: text("author_avatar"),
  timestamp: text("timestamp").notNull(),
  tags: jsonb("tags").notNull().default([]),
  content: text("content"),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.business_id, table.author] })] 
);

// Local tip posts table
export const localTipPosts = pgTable("local_tip_posts", {
  id: bigint("id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: localTipCategories("category").notNull(),
  location: text("location").notNull(),
  author: uuid().notNull().references(() => userProfiles.profile_id),
  stats: jsonb("stats").notNull().default({likes: 0, comments: 0, reviews: 0}),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Local tip comments table
export const localTipComments = pgTable("local_tip_comments", {
  comment_id: bigint("comment_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  post_id: bigint("post_id", {mode: "number"}).notNull().references(() => localTipPosts.id),
  author: uuid().notNull().references(() => userProfiles.profile_id),
  content: text("content").notNull(),
  likes: integer("likes").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Local tip post likes table
export const localTipPostLikes = pgTable("local_tip_post_likes", {
  post_id: bigint("post_id", {mode: "number"}).notNull().references(() => localTipPosts.id, {onDelete: "cascade"}),
  user_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.post_id, table.user_id] }),
]);

// Local tip comment likes table
export const localTipCommentLikes = pgTable("local_tip_comment_likes", {
  comment_id: bigint("comment_id", {mode: "number"}).notNull().references(() => localTipComments.comment_id, {onDelete: "cascade"}),
  user_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.comment_id, table.user_id] }),
]);

// Let Go Buddy sessions table
export const letGoBuddySessions = pgTable("let_go_buddy_sessions", {
  session_id: bigint("session_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  user_id: uuid().notNull().references(() => userProfiles.profile_id),
  situation: declutterSituations().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
  is_completed: boolean().notNull().default(false),
});

// Item analyses table
export const itemAnalyses = pgTable("item_analyses", {
  analysis_id: uuid().primaryKey().defaultRandom(),
  session_id: bigint("session_id", {mode: "number"}).notNull().references(() => letGoBuddySessions.session_id),
  item_name: text().notNull(),
  item_category: productCategories().notNull(),
  item_condition: productConditions().notNull(),
  recommendation: recommendationActions().notNull(),
  ai_suggestion: text().notNull(),
  emotional_score: integer().notNull(),
  environmental_impact: environmentalImpactLevels().notNull(),
  co2_impact: decimal({ precision: 10, scale: 2 }).notNull(),
  landfill_impact: text().notNull(),
  is_recyclable: boolean().notNull(),
  original_price: decimal({ precision: 10, scale: 2 }),
  current_value: decimal({ precision: 10, scale: 2 }),
  ai_listing_price: decimal({ precision: 10, scale: 2 }),
  maintenance_cost: decimal({ precision: 10, scale: 2 }).default("0"),
  space_value: decimal({ precision: 10, scale: 2 }).default("0"),
  ai_listing_title: text(),
  ai_listing_description: text(),
  ai_listing_location: text(),
  images: jsonb().notNull().default([]),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});
