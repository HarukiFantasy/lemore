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
import { productCategories, products } from '../products/schema';
import { userProfiles } from '../users/schema';
import { BUSINESS_TYPES, LOCAL_TIP_CATEGORIES, PRICE_RANGES } from './constants';

// ===== ENUMS =====

// Community related enums
export const localTipCategories = pgEnum("local_tip_categories", LOCAL_TIP_CATEGORIES.map(cat => cat ) as [string, ...string[]]);

export const businessTypes = pgEnum("business_types", BUSINESS_TYPES.map(type => type) as [string, ...string[]]); 

export const priceRanges = pgEnum("price_ranges", PRICE_RANGES.map(range => range) as [string, ...string[]]);


// ===== TABLES =====

// Give & Glow reviews table
export const giveAndGlowReviews = pgTable("give_and_glow_reviews", {
  id: bigint("id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  product_id: bigint("product_id", {mode: "number"}).references(() => products.product_id, {onDelete: "cascade"}),
  giver_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  receiver_id: uuid().notNull().references(() => userProfiles.profile_id, {onDelete: "cascade"}),
  category: productCategories().notNull(),
  rating: integer("rating").notNull(),
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
  author_avatar: text("author_avatar").references(() => userProfiles.avatar_url),
  timestamp: text("timestamp").notNull(),
  tags: jsonb("tags").notNull().default([]),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.business_id, table.author] })] 
);

// Local tip posts table
export const localTipPosts = pgTable("local_tip_posts", {
  id: bigint("id", {mode: "number"}).primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  author: uuid().notNull().references(() => userProfiles.profile_id),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  reviews: integer("reviews").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Local tip comments table
export const localTipComments = pgTable("local_tip_comments", {
  comment_id: bigint("comment_id", {mode: "number"}).generatedAlwaysAsIdentity(),
  post_id: bigint("post_id", {mode: "number"}).notNull().references(() => localTipPosts.id),
  author: uuid().notNull().references(() => userProfiles.profile_id),
  content: text("content").notNull(),
  likes: integer("likes").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.comment_id, table.post_id, table.author] })]);
