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
  pgPolicy,
  AnyPgColumn, // 추가
} from "drizzle-orm/pg-core";
import { authenticatedRole, authUid, authUsers } from "drizzle-orm/supabase";

// ===== ENUMS =====

// Location enum
export const locationList = pgEnum("location", [
  "Bangkok",
  "ChiangMai", 
  "Phuket",
  "HuaHin",
  "Pattaya",
  "Krabi",
  "Koh Samui",
  "Other Cities"
]);

// User related enums

export const localTipCategories = pgEnum("local_tip_categories", [
  "Visa", "Bank", "Tax", "Health", "Education", "Transportation", "Other"
]);

export const notificationTypes = pgEnum("notification_type", [
  "Message", "Like", "Reply", "Mention"
]);

export const messageTypes = pgEnum("message_type", [
  "Text", "Image", "File", "Audio", "Video", "Location"
]);

// Product related enums
export const productCategories = pgEnum("product_category", [
  "Electronics", "Clothing", "Books", "Home", "Sports", 
  "Beauty", "Toys", "Automotive", "Health", "Other"
]);

export const productConditions = pgEnum("product_condition", [
  "New", "Like New", "Excellent", "Good", "Fair", "Poor"
]);

export const priceTypes = pgEnum("price_type", [
  "Fixed", "Negotiable", "Free", "Auction"
]);

// Let Go Buddy related enums
export const declutterSituations = pgEnum("declutter_situation", [
  "Moving", "Minimalism", "Spring Cleaning", "Other"
]);

export const recommendationActions = pgEnum("recommendation_action", [
  "Keep", "Sell", "Donate", "Recycle", "Repair", "Repurpose", "Discard"
]);

export const environmentalImpactLevels = pgEnum("environmental_impact_level", [
  "Low", "Medium", "High", "Critical"
]);

// ===== TABLES =====

// Category table
export const categories = pgTable("categories", {
  category_id: bigint("category_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  name: productCategories().notNull(),
}, (table) => [
  pgPolicy("categories_select_policy", {
    for: "select",
    to: "public",
    as: "permissive",
    using: sql`true`
  })
]);

export const locations = pgTable("locations", {
  location_id: bigint("location_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  name: locationList().notNull(),
  display_name: text("display_name").notNull(),
  population: integer("population"),
  description: text("description"),
  is_active: boolean().notNull().default(true),
}, (table) => [
  pgPolicy("locations_select_policy", {
    for: "select",
    to: "public",
    as: "permissive",
    using: sql`true`
  })
]);


// Products table
export const products = pgTable("products", {
  product_id: bigint("product_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  seller_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  title: text("title").notNull(),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
  currency: text().notNull().default("THB"),
  category_id: bigint("category_id", {mode: "number"}).references(() => categories.category_id, {onDelete: "set null"}),
  condition: productConditions().notNull(),
  location: locationList().notNull(),
  description: text("description").notNull(),
  tags: jsonb().notNull().default([]),
  is_sold: boolean().notNull().default(false),
  price_type: priceTypes().notNull().default("Fixed"),
  stats: jsonb().notNull().default({likes: 0}),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  pgPolicy("products_select_policy", {
    for: "select",
    to: "public",
    as: "permissive",
    using: sql`true`
  }),
  pgPolicy("products_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`${table.seller_id} = ${authUid}`
  }),
  pgPolicy("products_update_policy", {
    for: "update",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.seller_id} = ${authUid}`,
    withCheck: sql`${table.seller_id} = ${authUid}`
  }),
]);

// Product images table
export const productImages = pgTable("product_images", {
  product_id: bigint("product_id", {mode: "number"}).notNull().references(() => products.product_id, {onDelete: "cascade"}),
  image_url: text("image_url").notNull(),
  image_order: integer().notNull().default(0),
  is_primary: boolean().notNull().default(false),
}, (table) => [
  primaryKey({ columns: [table.product_id, table.image_order] }),
  pgPolicy("product_images_select_policy", {
    for: "select",
    to: "public",
    as: "permissive",
    using: sql`true`
  }),
  pgPolicy("product_images_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`EXISTS (
      SELECT 1 FROM products 
      WHERE products.product_id = ${table.product_id} 
      AND products.seller_id = ${authUid}
    )`
  }),
  pgPolicy("product_images_update_policy", {
    for: "update",
    to: authenticatedRole,
    as: "permissive",
    using: sql`EXISTS (
      SELECT 1 FROM products 
      WHERE products.product_id = ${table.product_id} 
      AND products.seller_id = ${authUid}
    )`,
    withCheck: sql`EXISTS (
      SELECT 1 FROM products 
      WHERE products.product_id = ${table.product_id} 
      AND products.seller_id = ${authUid}
    )`
  }),
  pgPolicy("product_images_delete_policy", {
    for: "delete",
    to: authenticatedRole,
    as: "permissive",
    using: sql`EXISTS (
      SELECT 1 FROM products 
      WHERE products.product_id = ${table.product_id} 
      AND products.seller_id = ${authUid}
    )`
  })
]);

// Product likes table
export const productLikes = pgTable("product_likes", {
  product_id: bigint("product_id", {mode: "number"}).notNull().references(() => products.product_id, {onDelete: "cascade"}),
  user_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}), 
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.product_id, table.user_id] }),
  pgPolicy("product_likes_select_policy", {
    for: "select",
    to: "public",
    as: "permissive",
    using: sql`true`
  }),
  pgPolicy("product_likes_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`${table.user_id} = ${authUid}`
  }),
  pgPolicy("product_likes_delete_policy", {
    for: "delete",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.user_id} = ${authUid}`
  })
]);

// Product views table
export const productViews = pgTable("product_views", {
  view_id: bigint("view_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  product_id: bigint("product_id", {mode: "number"}).notNull(),
  user_id: uuid().references(() => userProfiles.profile_id), 
  viewed_at: timestamp("viewed_at").notNull().defaultNow(),
}, (table) => [
  pgPolicy("product_views_select_policy", {
    for: "select",
    to: "public",
    as: "permissive",
    using: sql`true`
  }),
  pgPolicy("product_views_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`true`
  }), 
  pgPolicy("product_views_delete_policy", {
    for: "delete",
    to: authenticatedRole,
    as: "permissive",
    using: sql`true`
  })
]);


// Auth schema - users table (Supabase Auth integration)
// export const users = pgSchema("auth").table("users", {
//   id: uuid().primaryKey()
// });

// User profiles table
export const userProfiles = pgTable("user_profiles", {
  profile_id: uuid().primaryKey().unique().references(() => authUsers.id, {onDelete: "cascade"}),
  username: text("username").unique(),
  email: text("email"),
  phone: text("phone").unique(),
  avatar_url: text("avatar_url"),
  bio: text("bio"),
  location: locationList(),
  total_likes: integer().default(0),
  total_listings: integer().default(0),
  response_rate: decimal({ precision: 10, scale: 2 }).default("0.00"),
  response_time: text("response_time").default("< 1 hour"),
  rating: decimal({ precision: 10, scale: 2 }).default("0.00"),
  appreciation_badge: boolean("appreciation_badge").default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [check('rating_check', sql`rating >= 0 AND rating <= 5`), 
  // SELECT 정책 - 모든 사용자가 프로필을 조회할 수 있음
  pgPolicy("user_profiles_select_policy", {
    for: "select",
    to: "public",
    as: "permissive",
    using: sql`true`
  }),
  
  // INSERT 정책 - 사용자는 자신의 프로필만 생성 가능 (트리거 고려)
  pgPolicy("user_profiles_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`${authUid} = ${table.profile_id}`
  }),
  
  // UPDATE 정책 - 사용자는 자신의 프로필만 수정 가능
  pgPolicy("user_profiles_update_policy", {
    for: "update",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${authUid} = ${table.profile_id}`,
    withCheck: sql`${authUid} = ${table.profile_id}`
  }),
  
  // DELETE 정책 - 사용자는 자신의 프로필만 삭제 가능
  pgPolicy("user_profiles_delete_policy", {
    for: "delete",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${authUid} = ${table.profile_id}`
  })
]);

// User reviews table
export const userReviews = pgTable("user_reviews", {
  review_id: bigint("review_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  reviewer_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  reviewee_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  rating: integer().notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  pgPolicy("user_reviews_select_policy", {
    for: "select",
    to: "public",
    as: "permissive",
    using: sql`true`
  }),
  pgPolicy("user_reviews_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`${table.reviewer_id} = ${authUid}`
  }),
  pgPolicy("user_reviews_delete_policy", {
    for: "delete",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.reviewer_id} = ${authUid}`
  })
]);

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
}, (table) => [
  pgPolicy("user_notifications_select_policy", {
    for: "select",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.receiver_id} = ${authUid}`
  }),
  pgPolicy("user_notifications_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`${table.sender_id} = ${authUid}`
  }),
  pgPolicy("user_notifications_update_policy", {
    for: "update",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.receiver_id} = ${authUid}`,
    withCheck: sql`${table.receiver_id} = ${authUid}`
  })
]);

// User conversations table
export const userConversations = pgTable("user_conversations", {
  conversation_id: bigint("conversation_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  product_id: bigint("product_id", {mode: "number"}).references(() => products.product_id, {onDelete: "set null"}),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  pgPolicy("user_conversations_select_policy", {
    for: "select",
    to: authenticatedRole,
    as: "permissive",
    using: sql`EXISTS (
      SELECT 1 FROM message_participants mp 
      WHERE mp.conversation_id = ${table.conversation_id} 
      AND mp.profile_id = ${authUid}
    )`
  }),
  pgPolicy("user_conversations_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`true`
  })
]);

// Message participants table
export const messageParticipants = pgTable("message_participants", {
  conversation_id: bigint("conversation_id", {mode: "number"}).notNull().references(() => userConversations.conversation_id, {onDelete: "cascade"}),
  profile_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  is_hidden: boolean().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.conversation_id, table.profile_id] }),
  pgPolicy("message_participants_select_policy", {
    for: "select",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.profile_id} = ${authUid}`
  }),
  pgPolicy("message_participants_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`${table.profile_id} = ${authUid}`
  }),
  pgPolicy("message_participants_delete_policy", {
    for: "delete",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.profile_id} = ${authUid}`
  })
]);

// User messages table
export const userMessages = pgTable("user_messages", {
  message_id: bigint("message_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  conversation_id: bigint("conversation_id", {mode: "number"}).notNull().references(() => userConversations.conversation_id, {onDelete: "cascade"}),
  sender_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  receiver_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  content: text("content").notNull(),
  message_type: messageTypes().notNull().default("Text"),
  media_url: text("media_url"),
  seen: boolean().notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  pgPolicy("user_messages_select_policy", {
    for: "select",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.sender_id} = ${authUid} OR ${table.receiver_id} = ${authUid}`
  }),
  pgPolicy("user_messages_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`${table.sender_id} = ${authUid}`
  }),
  pgPolicy("user_messages_update_policy", {
    for: "update",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.sender_id} = ${authUid}`,
    withCheck: sql`${table.sender_id} = ${authUid}`
  }),
  pgPolicy("user_messages_delete_policy", {
    for: "delete",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.sender_id} = ${authUid}`
  })
]);

// Give & Glow reviews table
export const giveAndGlowReviews = pgTable("give_and_glow_reviews", {
  id: bigint("id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  product_id: bigint("product_id", {mode: "number"}).references(() => products.product_id, {onDelete: "cascade"}),
  giver_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  receiver_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  category: productCategories().notNull(),
  rating: integer("rating").notNull(),
  timestamp: text("timestamp").notNull(),
  location: locationList().notNull(),
  tags: jsonb("tags").notNull().default([]),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  pgPolicy("give_and_glow_reviews_select_policy", {
    for: "select",
    to: "public",
    as: "permissive",
    using: sql`true`
  }),
  pgPolicy("give_and_glow_reviews_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`${table.giver_id} = ${authUid}`
  }),
  pgPolicy("give_and_glow_reviews_delete_policy", {
    for: "delete",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.giver_id} = ${authUid}`
  }),
  pgPolicy("give_and_glow_reviews_update_policy", {
    for: "update",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.giver_id} = ${authUid}`,
    withCheck: sql`${table.giver_id} = ${authUid}`
  })
]);

// Local businesses table
export const localBusinesses = pgTable("local_businesses", {
  id: bigint("id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  type: text("type"),
  location: locationList().notNull(),
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
}, (table) => [
  pgPolicy("local_businesses_select_policy", {
    for: "select",
    to: "public",
    as: "permissive",
    using: sql`true`
  }),
  pgPolicy("local_businesses_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`true`
  })
]);

// Local business reviews table
export const localBusinessReviews = pgTable("local_business_reviews", {
  business_id: bigint("business_id", {mode: "number"}).notNull().references(() => localBusinesses.id),
  rating: integer("rating").notNull(),
  author: uuid().notNull().references(() => userProfiles.profile_id),
  author_avatar: text("author_avatar"),
  tags: jsonb("tags").notNull().default([]),
  content: text("content"),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.business_id, table.author] }),
  pgPolicy("local_business_reviews_select_policy", {
    for: "select",
    to: "public",
    as: "permissive",
    using: sql`true`
  }),
  pgPolicy("local_business_reviews_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`${table.author} = ${authUid}`
  }),
  pgPolicy("local_business_reviews_update_policy", {
    for: "update",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.author} = ${authUid}`,
    withCheck: sql`${table.author} = ${authUid}`
  })
]);

// Local tip posts table
export const localTipPosts = pgTable("local_tip_posts", {
  id: bigint("id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: localTipCategories().notNull(),
  location: locationList().notNull(),
  author: uuid().notNull().references(() => userProfiles.profile_id),
  stats: jsonb("stats").default({likes: 0, comments: 0 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  pgPolicy("local_tip_posts_select_policy", {
    for: "select",
    to: "public",
    as: "permissive",
    using: sql`true`
  }),
  pgPolicy("local_tip_posts_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`${table.author} = ${authUid}`
  }),
  pgPolicy("local_tip_posts_update_policy", {
    for: "update",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.author} = ${authUid}`,
    withCheck: sql`${table.author} = ${authUid}`
  }),
  pgPolicy("local_tip_posts_delete_policy", {
    for: "delete",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.author} = ${authUid}`
  })
]);

// Local tip comments table
export const localTipComments = pgTable("local_tip_comments", {
  comment_id: bigint("comment_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  post_id: bigint("post_id", {mode: "number"}).notNull().references(() => localTipPosts.id),
  author: uuid().notNull().references(() => userProfiles.profile_id),
  content: text("content").notNull(),
  likes: integer("likes").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  pgPolicy("local_tip_comments_select_policy", {
    for: "select",
    to: "public",
    as: "permissive",
    using: sql`true`
  }),
  pgPolicy("local_tip_comments_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`${table.author} = ${authUid}`
  }),
  pgPolicy("local_tip_comments_update_policy", {
    for: "update",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.author} = ${authUid}`,
    withCheck: sql`${table.author} = ${authUid}`
  }),
  pgPolicy("local_tip_comments_delete_policy", {
    for: "delete",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.author} = ${authUid}`
  })
]);

// Local tip replies table (for nested comments)
export const localTipReplies = pgTable("local_tip_replies", {
  reply_id: bigint("reply_id", { mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  post_id: bigint("post_id", { mode: "number" })
    .notNull()
    .references(() => localTipPosts.id, { onDelete: "cascade" }),
  parent_id: bigint("parent_id", { mode: "number" })
    .references((): AnyPgColumn => localTipReplies.reply_id, { onDelete: "cascade" }),
  profile_id: uuid("profile_id")
    .notNull()
    .references(() => userProfiles.profile_id, { onDelete: "cascade" }),
  reply: text("reply").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  pgPolicy("local_tip_replies_select_policy", {
    for: "select",
    to: "public",
    as: "permissive",
    using: sql`true`
  }),
  pgPolicy("local_tip_replies_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`true`
  }),
  pgPolicy("local_tip_replies_update_policy", {
    for: "update",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.profile_id} = ${authUid}`,
    withCheck: sql`${table.profile_id} = ${authUid}`
  }),
  pgPolicy("local_tip_replies_delete_policy", {
    for: "delete",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.profile_id} = ${authUid}`
  })
]);

// Local tip post likes table
export const localTipPostLikes = pgTable("local_tip_post_likes", {
  post_id: bigint("post_id", {mode: "number"}).notNull().references(() => localTipPosts.id, {onDelete: "cascade"}),
  user_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.post_id, table.user_id] }),
  pgPolicy("local_tip_post_likes_select_policy", {
    for: "select",
    to: "public",
    as: "permissive",
    using: sql`true`
  }),
  pgPolicy("local_tip_post_likes_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`${table.user_id} = ${authUid}`
  }),
  pgPolicy("local_tip_post_likes_delete_policy", {
    for: "delete",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.user_id} = ${authUid}`
  })
]);

// Local tip comment likes table
export const localTipCommentLikes = pgTable("local_tip_comment_likes", {
  comment_id: bigint("comment_id", {mode: "number"}).notNull().references(() => localTipComments.comment_id, {onDelete: "cascade"}),
  user_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.comment_id, table.user_id] }),
  pgPolicy("local_tip_comment_likes_select_policy", {
    for: "select",
    to: "public",
    as: "permissive",
    using: sql`true`
  }),
  pgPolicy("local_tip_comment_likes_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`${table.user_id} = ${authUid}`
  }),
  pgPolicy("local_tip_comment_likes_delete_policy", {
    for: "delete",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.user_id} = ${authUid}`
  })
]);

// Let Go Buddy sessions table
export const letGoBuddySessions = pgTable("let_go_buddy_sessions", {
  session_id: bigint("session_id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  user_id: uuid().notNull().references(() => userProfiles.profile_id),
  situation: declutterSituations().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
  is_completed: boolean().notNull().default(false),
}, (table) => [
  pgPolicy("let_go_buddy_sessions_select_policy", {
    for: "select",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.user_id} = ${authUid}`
  }),
  pgPolicy("let_go_buddy_sessions_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`${table.user_id} = ${authUid}`
  }),
  pgPolicy("let_go_buddy_sessions_update_policy", {
    for: "update",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.user_id} = ${authUid}`,
    withCheck: sql`${table.user_id} = ${authUid}`
  }),
  pgPolicy("let_go_buddy_sessions_delete_policy", {
    for: "delete",
    to: authenticatedRole,
    as: "permissive",
    using: sql`${table.user_id} = ${authUid}`
  })
]);

// Item analyses table
export const itemAnalyses = pgTable("item_analyses", {
  analysis_id: uuid().primaryKey().defaultRandom(),
  session_id: bigint("session_id", {mode: "number"}).notNull().references(() => letGoBuddySessions.session_id),
  item_name: text().notNull(),
  item_category: productCategories().notNull(),
  item_condition: productConditions().notNull(),
  recommendation: recommendationActions().notNull(),
  recommendation_reason: text(),
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
  ai_listing_location: locationList(),
  images: jsonb().notNull().default([]),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
}, (table) => [
  pgPolicy("item_analyses_select_policy", {
    for: "select",
    to: authenticatedRole,
    as: "permissive",
    using: sql`EXISTS (
      SELECT 1 FROM let_go_buddy_sessions lgbs 
      WHERE lgbs.session_id = ${table.session_id} 
      AND lgbs.user_id = ${authUid}
    )`
  }),
  pgPolicy("item_analyses_insert_policy", {
    for: "insert",
    to: authenticatedRole,
    as: "permissive",
    withCheck: sql`EXISTS (
      SELECT 1 FROM let_go_buddy_sessions lgbs 
      WHERE lgbs.session_id = ${table.session_id} 
      AND lgbs.user_id = ${authUid}
    )`
  }),
  pgPolicy("item_analyses_update_policy", {
    for: "update",
    to: authenticatedRole,
    as: "permissive",
    using: sql`EXISTS (
      SELECT 1 FROM let_go_buddy_sessions lgbs 
      WHERE lgbs.session_id = ${table.session_id} 
      AND lgbs.user_id = ${authUid}
    )`,
    withCheck: sql`EXISTS (
      SELECT 1 FROM let_go_buddy_sessions lgbs 
      WHERE lgbs.session_id = ${table.session_id} 
      AND lgbs.user_id = ${authUid}
    )`
  }),
  pgPolicy("item_analyses_delete_policy", {
    for: "delete",
    to: authenticatedRole,
    as: "permissive",
    using: sql`EXISTS (
      SELECT 1 FROM let_go_buddy_sessions lgbs 
      WHERE lgbs.session_id = ${table.session_id} 
      AND lgbs.user_id = ${authUid}
    )`
  })
]);
