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
  bigint,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { userProfiles } from '../users/schema';
import { PRICE_TYPES, PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from './constants';

// ===== ENUMS =====

// Product related enums
export const productCategories = pgEnum("product_category", PRODUCT_CATEGORIES.map(cat => cat.value) as [string, ...string[]]);

export const productConditions = pgEnum("product_condition", PRODUCT_CONDITIONS.map(cond => cond.value) as [string, ...string[]]);

export const priceTypes = pgEnum("price_type", PRICE_TYPES.map(type => type.value) as [string, ...string[]]);


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
  isSold: boolean().notNull().default(false),
  price_type: priceTypes().notNull().default("fixed"),
  stats: jsonb().notNull().default({views: 0, likes: 0}),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("products_seller_id_idx").on(table.seller_id),
  index("products_category_id_idx").on(table.category_id),
]);

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
