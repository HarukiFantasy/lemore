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
} from "drizzle-orm/pg-core";
import { userProfiles } from '../users/schema';
import { productCategories, productConditions } from '../products/schema';

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
  session_id: uuid().notNull().references(() => letGoBuddySessions.session_id),
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
