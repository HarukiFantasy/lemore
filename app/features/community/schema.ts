import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  decimal
} from "drizzle-orm/pg-core";
import { 
  GIVE_AND_GLOW_CATEGORIES, 
  LOCATIONS_WITH_ALL,
  LOCAL_TIP_CATEGORIES
} from "./constants";
import {users, userProfiles} from "~/features/users/schema"


// Give & Glow 리뷰 테이블
export const giveAndGlowReviews = pgTable("give_and_glow_reviews", {
  id: uuid().primaryKey().defaultRandom(),
  item_name: text("item_name").notNull(),
  item_category: text("item_category").notNull(), // enum 아님(유연성)
  giver_name: text("giver_name").notNull(),
  giver_avatar: text("giver_avatar"),
  receiver_name: text("receiver_name").notNull(),
  receiver_avatar: text("receiver_avatar"),
  rating: integer("rating").notNull(), // 1~5
  review: text("review").notNull(),
  timestamp: text("timestamp").notNull(), // 상대적 시간(예: "2 hours ago")
  location: text("location").notNull(),
  tags: jsonb("tags").notNull().default([]), // string[]
  photos: jsonb("photos").notNull().default([]), // string[]
  appreciation_badge: boolean("appreciation_badge").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  categoryIdx: index("give_and_glow_reviews_category_idx").on(table.item_category),
  locationIdx: index("give_and_glow_reviews_location_idx").on(table.location),
  createdAtIdx: index("give_and_glow_reviews_created_at_idx").on(table.created_at),
}));

// Local Reviews 비즈니스 테이블
export const localBusinesses = pgTable("local_businesses", {
  id: uuid().primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type").notNull(), // business type
  location: text("location").notNull(),
  average_rating: decimal("average_rating", { precision: 3, scale: 2 }).notNull().default("0.00"),
  total_reviews: integer("total_reviews").notNull().default(0),
  price_range: text("price_range").notNull(), // price range
  tags: jsonb("tags").notNull().default([]), // string[]
  image: text("image"),
  address: text("address"),
  phone: text("phone"),
  website: text("website"),
  description: text("description"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  typeIdx: index("local_businesses_type_idx").on(table.type),
  locationIdx: index("local_businesses_location_idx").on(table.location),
  priceRangeIdx: index("local_businesses_price_range_idx").on(table.price_range),
  createdAtIdx: index("local_businesses_created_at_idx").on(table.created_at),
}));

// Local Reviews 리뷰 테이블
export const localBusinessReviews = pgTable("local_business_reviews", {
  id: uuid().primaryKey().defaultRandom(),
  business_id: uuid().notNull().references(() => localBusinesses.id),
  business_name: text("business_name").notNull(),
  business_type: text("business_type").notNull(),
  location: text("location").notNull(),
  rating: integer("rating").notNull(), // 1~5
  review: text("review").notNull(),
  author: uuid().notNull().references(() => userProfiles.profile_id),
  author_avatar: text("author_avatar").references(() => userProfiles.avatar_url),
  timestamp: text("timestamp").notNull(), // 상대적 시간
  photos: jsonb("photos").notNull().default([]), // string[]
  price_range: text("price_range").notNull(),
  tags: jsonb("tags").notNull().default([]), // string[]
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  businessIdIdx: index("local_business_reviews_business_id_idx").on(table.business_id),
  businessTypeIdx: index("local_business_reviews_business_type_idx").on(table.business_type),
  locationIdx: index("local_business_reviews_location_idx").on(table.location),
  ratingIdx: index("local_business_reviews_rating_idx").on(table.rating),
  createdAtIdx: index("local_business_reviews_created_at_idx").on(table.created_at),
}));

// Local Tips 포스트 테이블
export const localTipPosts = pgTable("local_tip_posts", {
  id: uuid().primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // tip category
  location: text("location").notNull(),
  author: text("author").notNull().references(() => users.id),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  reviews: integer("reviews").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  categoryIdx: index("local_tip_posts_category_idx").on(table.category),
  locationIdx: index("local_tip_posts_location_idx").on(table.location),
  authorIdx: index("local_tip_posts_author_idx").on(table.author),
  createdAtIdx: index("local_tip_posts_created_at_idx").on(table.created_at),
}));

// Local Tips 코멘트 테이블
export const localTipComments = pgTable("local_tip_comments", {
  id: uuid().primaryKey().defaultRandom(),
  post_id: uuid().notNull().references(() => localTipPosts.id),
  author: uuid().notNull().references(() => userProfiles.profile_id),
  content: text("content").notNull(),
  likes: integer("likes").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  postIdIdx: index("local_tip_comments_post_id_idx").on(table.post_id),
  authorIdx: index("local_tip_comments_author_idx").on(table.author),
  createdAtIdx: index("local_tip_comments_created_at_idx").on(table.created_at),
}));



// 타입 추론
export type GiveAndGlowReview = typeof giveAndGlowReviews.$inferSelect;
export type NewGiveAndGlowReview = typeof giveAndGlowReviews.$inferInsert;

export type LocalBusiness = typeof localBusinesses.$inferSelect;
export type NewLocalBusiness = typeof localBusinesses.$inferInsert;

export type LocalBusinessReview = typeof localBusinessReviews.$inferSelect;
export type NewLocalBusinessReview = typeof localBusinessReviews.$inferInsert;

export type LocalTipPost = typeof localTipPosts.$inferSelect;
export type NewLocalTipPost = typeof localTipPosts.$inferInsert;

export type LocalTipComment = typeof localTipComments.$inferSelect;
export type NewLocalTipComment = typeof localTipComments.$inferInsert;

// Type definitions from constants
export type LocalTipCategory = typeof LOCAL_TIP_CATEGORIES[number];

// Constants for backward compatibility
export const VALID_GIVE_AND_GLOW_CATEGORIES = GIVE_AND_GLOW_CATEGORIES;
export const VALID_GIVE_AND_GLOW_LOCATIONS = LOCATIONS_WITH_ALL;
export const VALID_LOCAL_TIP_CATEGORIES = LOCAL_TIP_CATEGORIES;
