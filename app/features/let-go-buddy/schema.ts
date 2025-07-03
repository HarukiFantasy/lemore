import { 
  pgEnum, 
  pgTable, 
  text, 
  timestamp, 
  integer, 
  boolean, 
  jsonb,
  decimal,
  uuid
} from "drizzle-orm/pg-core";
import { 
  SITUATIONS, 
  ITEM_CATEGORIES, 
  RECOMMENDATION_ACTIONS, 
  ITEM_CONDITIONS,
  ENVIRONMENTAL_IMPACT_LEVELS
} from "./constants";
import { userProfiles } from '../users/schema';

// Enums
export const declutterSituations = pgEnum(
  "declutter_situation",
  SITUATIONS.map((situation) => situation.value) as [string, ...string[]]
);

export const itemCategories = pgEnum(
  "item_category",
  ITEM_CATEGORIES.map((category) => category.value) as [string, ...string[]]
);

export const recommendationActions = pgEnum(
  "recommendation_action",
  RECOMMENDATION_ACTIONS.map((action) => action.value) as [string, ...string[]]
);

export const itemConditions = pgEnum(
  "item_condition",
  ITEM_CONDITIONS.map((condition) => condition.value) as [string, ...string[]]
);

export const environmentalImpactLevels = pgEnum(
  "environmental_impact_level",
  ENVIRONMENTAL_IMPACT_LEVELS.map((level) => level.value) as [string, ...string[]]
);

// Main tables
export const letGoBuddySessions = pgTable("let_go_buddy_sessions", {
  session_id: uuid().primaryKey().defaultRandom(),
  user_id: uuid().notNull().references(() => userProfiles.profile_id),
  situation: declutterSituations().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
  is_completed: boolean().notNull().default(false),
});

export const itemAnalyses = pgTable("item_analyses", {
  analysis_id: uuid().primaryKey().defaultRandom(),
  session_id: uuid().notNull().references(() => letGoBuddySessions.session_id),
  item_name: text().notNull(),
  item_category: itemCategories().notNull(),
  item_condition: itemConditions().notNull(),
  recommendation: recommendationActions().notNull(),
  ai_suggestion: text().notNull(),
  emotional_score: integer().notNull(), // 1-5 scale
  environmental_impact: environmentalImpactLevels().notNull(),
  co2_impact: decimal({ precision: 10, scale: 2 }).notNull(), // CO2 emissions in kg
  landfill_impact: text().notNull(), // "Low", "Medium", "High"
  is_recyclable: boolean().notNull(),
  original_price: decimal({ precision: 10, scale: 2 }),
  current_value: decimal({ precision: 10, scale: 2 }),
  maintenance_cost: decimal({ precision: 10, scale: 2 }).default("0"),
  space_value: decimal({ precision: 10, scale: 2 }).default("0"),
  ai_listing_title: text(),
  ai_listing_description: text(),
  ai_listing_price: text(),
  ai_listing_location: text(),
  images: jsonb().notNull().default([]), // Array of image URLs
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const emotionalAssessments = pgTable("emotional_assessments", {
  assessment_id: uuid().primaryKey().defaultRandom(),
  analysis_id: uuid().notNull().references(() => itemAnalyses.analysis_id),
  question_1_answer: integer().notNull(), // 1-5 scale
  question_2_answer: integer().notNull(),
  question_3_answer: integer().notNull(),
  question_4_answer: integer().notNull(),
  question_5_answer: integer().notNull(),
  overall_score: integer().notNull(), // Calculated percentage
  created_at: timestamp().notNull().defaultNow(),
});

export const environmentalImpactData = pgTable("environmental_impact_data", {
  impact_id: uuid().primaryKey().defaultRandom(),
  category: itemCategories().notNull(),
  co2_emissions: decimal({ precision: 10, scale: 2 }).notNull(), // CO2 in kg
  landfill_impact: text().notNull(),
  is_recyclable: boolean().notNull(),
  recycling_instructions: text(),
  donation_centers: jsonb().notNull().default([]), // Array of donation center info
  created_at: timestamp().notNull().defaultNow(),
});

export const costBenefitAnalyses = pgTable("cost_benefit_analyses", {
  analysis_id: uuid().primaryKey().defaultRandom(),
  item_analysis_id: uuid().notNull().references(() => itemAnalyses.analysis_id),
  original_price: decimal({ precision: 10, scale: 2 }).notNull(),
  current_value: decimal({ precision: 10, scale: 2 }).notNull(),
  maintenance_cost: decimal({ precision: 10, scale: 2 }).notNull().default("0"),
  space_value: decimal({ precision: 10, scale: 2 }).notNull().default("0"),
  depreciation_rate: decimal({ precision: 5, scale: 2 }).notNull(), // Percentage
  roi_if_sold: decimal({ precision: 5, scale: 2 }).notNull(), // Return on investment percentage
  monthly_storage_cost: decimal({ precision: 10, scale: 2 }).notNull().default("0"),
  created_at: timestamp().notNull().defaultNow(),
});

export const aiListingSuggestions = pgTable("ai_listing_suggestions", {
  suggestion_id: uuid().primaryKey().defaultRandom(),
  item_analysis_id: uuid().notNull().references(() => itemAnalyses.analysis_id),
  title: text().notNull(),
  description: text().notNull(),
  price: text().notNull(),
  location: text().notNull(),
  category: itemCategories().notNull(),
  condition: itemConditions().notNull(),
  tags: jsonb().notNull().default([]), // Array of tags
  is_selected: boolean().notNull().default(false),
  created_at: timestamp().notNull().defaultNow(),
});
