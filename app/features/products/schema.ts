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
import { users } from "~/features/users/schema";
import { 
  PRODUCT_CATEGORIES, 
  PRODUCT_CONDITIONS, 
  PRODUCT_STATUSES,
  PRICE_TYPES
} from "./constants";

// Enums
export const productCategories = pgEnum(
  "product_category",
  PRODUCT_CATEGORIES.map((category) => category.value) as [string, ...string[]]
);

export const productConditions = pgEnum(
  "product_condition",
  PRODUCT_CONDITIONS.map((condition) => condition.value) as [string, ...string[]]
);

export const productStatuses = pgEnum(
  "product_status",
  PRODUCT_STATUSES.map((status) => status.value) as [string, ...string[]]
);

export const priceTypes = pgEnum(
  "price_type",
  PRICE_TYPES.map((type) => type.value) as [string, ...string[]]
);

// Main products table
export const products = pgTable("products", {
  product_id: uuid().primaryKey().defaultRandom(),
  seller_id: uuid().notNull().references(() => users.id), // users 테이블 참조
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
  currency: text().notNull().default("THB"),
  original_price: decimal({ precision: 10, scale: 2 }),
  original_currency: text().default("THB"),
  price_type: priceTypes().notNull().default("fixed"),
  condition: productConditions().notNull(),
  category: productCategories().notNull(),
  location: text("location").notNull(),
  status: productStatuses().notNull().default("active"),
  tags: jsonb().notNull().default([]), // JSON array of tags
  specifications: jsonb().notNull().default({}), // JSON object for product specs
  view_count: integer().notNull().default(0),
  like_count: integer().notNull().default(0),
  contact_count: integer().notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  sellerIdIdx: index("products_seller_id_idx").on(table.seller_id),
  categoryIdx: index("products_category_idx").on(table.category),
  conditionIdx: index("products_condition_idx").on(table.condition),
  statusIdx: index("products_status_idx").on(table.status),
  locationIdx: index("products_location_idx").on(table.location),
  priceIdx: index("products_price_idx").on(table.price),
  createdAtIdx: index("products_created_at_idx").on(table.created_at),
}));

// Product images table
export const productImages = pgTable("product_images", {
  image_id: uuid().primaryKey().defaultRandom(),
  product_id: uuid().notNull().references(() => products.product_id),
  image_url: text("image_url").notNull(),
  image_order: integer().notNull().default(0), // 이미지 순서
  is_primary: boolean().notNull().default(false), // 대표 이미지 여부
  alt_text: text("alt_text"),
  file_size: integer(), // 파일 크기 (bytes)
  mime_type: text("mime_type"),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  productIdIdx: index("product_images_product_id_idx").on(table.product_id),
  imageOrderIdx: index("product_images_order_idx").on(table.image_order),
  isPrimaryIdx: index("product_images_primary_idx").on(table.is_primary),
}));

// Product likes table
export const productLikes = pgTable("product_likes", {
  like_id: uuid().primaryKey().defaultRandom(),
  product_id: uuid().notNull().references(() => products.product_id),
  user_id: uuid().notNull().references(() => users.id), 
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  productIdIdx: index("product_likes_product_id_idx").on(table.product_id),
  userIdIdx: index("product_likes_user_id_idx").on(table.user_id),
  uniqueUserProduct: index("product_likes_unique_user_product_idx").on(table.user_id, table.product_id),
  createdAtIdx: index("product_likes_created_at_idx").on(table.created_at),
}));

// Product views table (상품 조회 기록)
export const productViews = pgTable("product_views", {
  view_id: uuid().primaryKey().defaultRandom(),
  product_id: uuid().notNull().references(() => products.product_id),
  user_id: uuid().references(() => users.id), 
  // ip_address: text("ip_address"), // 비활성화: 사이드 프로젝트에서는 불필요
  // user_agent: text("user_agent"), // 비활성화: 사이드 프로젝트에서는 불필요
  viewed_at: timestamp("viewed_at").notNull().defaultNow(),
}, (table) => ({
  productIdIdx: index("product_views_product_id_idx").on(table.product_id),
  userIdIdx: index("product_views_user_id_idx").on(table.user_id),
  viewedAtIdx: index("product_views_viewed_at_idx").on(table.viewed_at),
}));

{/* To do : Product reports table (상품 신고) 
export const productReports = pgTable("product_reports", {
  report_id: uuid().primaryKey().defaultRandom(),
  product_id: uuid().notNull().references(() => products.product_id),
  reporter_id: uuid().notNull(), // users 테이블 참조
  reason: text("reason").notNull(), // 신고 사유
  description: text("description"), // 상세 설명
  status: text("status").notNull().default("pending"), // "pending", "reviewed", "resolved", "dismissed"
  admin_notes: text("admin_notes"),
  resolved_at: timestamp("resolved_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  productIdIdx: index("product_reports_product_id_idx").on(table.product_id),
  reporterIdIdx: index("product_reports_reporter_id_idx").on(table.reporter_id),
  statusIdx: index("product_reports_status_idx").on(table.status),
  createdAtIdx: index("product_reports_created_at_idx").on(table.created_at),
}));
*/}

{/* To do : Product search history table (검색 기록)
export const productSearchHistory = pgTable("product_search_history", {
  search_id: uuid().primaryKey().defaultRandom(),
  user_id: uuid().notNull(), // users 테이블 참조
  search_query: text("search_query").notNull(),
  filters: jsonb().notNull().default({}), // 검색 필터 (JSON)
  result_count: integer().notNull().default(0),
  searched_at: timestamp("searched_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("product_search_history_user_id_idx").on(table.user_id),
  searchQueryIdx: index("product_search_history_query_idx").on(table.search_query),
  searchedAtIdx: index("product_search_history_searched_at_idx").on(table.searched_at),
}));
*/}

// TypeScript types
export interface Product {
  id: string;
  title: string;
  price: string;
  description: string;
  condition: string;
  category: string;
  location: string;
  image: string;
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Database types
export type ProductRecord = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
export type ProductLike = typeof productLikes.$inferSelect;
export type NewProductLike = typeof productLikes.$inferInsert;
export type ProductView = typeof productViews.$inferSelect;
export type NewProductView = typeof productViews.$inferInsert;
