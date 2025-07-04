// app/common/constants.ts

// ===== DATABASE ENUMS =====
// Product related enums
export const PRODUCT_CATEGORIES = [
  "electronics", "clothing", "books", "home", "sports", 
  "beauty", "toys", "automotive", "health", "other"
] as const;

export const PRODUCT_CONDITIONS = [
  "new", "like_new", "excellent", "good", "fair", "poor"
] as const;

export const PRICE_TYPES = [
  "fixed", "negotiable", "free", "auction"
] as const;

// Let Go Buddy enums
export const DECLUTTER_SITUATIONS = [
  "moving", "downsizing", "spring_cleaning", "digital_declutter", 
  "minimalism", "inheritance", "relationship_change", "other"
] as const;

export const RECOMMENDATION_ACTIONS = [
  "keep", "sell", "donate", "recycle", "repair", "repurpose", "discard"
] as const;

export const ENVIRONMENTAL_IMPACT_LEVELS = [
  "low", "medium", "high", "critical"
] as const;

// User related enums
export const NOTIFICATION_TYPES = [
  "message", "like", "reply", "mention"
] as const;

export const MESSAGE_TYPES = [
  "text", "image", "file", "audio", "video", "location"
] as const;

// Community related enums
export const BUSINESS_TYPES = [
  "restaurant", "cafe", "shop", "service", "entertainment", "health", "education", "other"
] as const;

export const PRICE_RANGES = [
  "$", "$$", "$$$", "$$$$"
] as const;

export const TIP_CATEGORIES = [
  "food", "shopping", "entertainment", "transport", "health", "education", "other"
] as const;


// Local Tips Categories
export const VALID_LOCAL_TIP_CATEGORIES = [
  "All", "Visa/Immigration", "Healthcare/Insurance", "Transportation", 
  "Banking/Finance", "Housing", "Education", "Other"
] as const;

// Give & Glow Categories
export const VALID_GIVE_AND_GLOW_CATEGORIES = [
  "All", "Furniture", "Electronics", "Clothing", "Books", "Kitchen", 
  "Toys", "Sports", "Beauty", "Other"
] as const;

// Give & Glow Locations (same as general locations)
export const VALID_GIVE_AND_GLOW_LOCATIONS = [
  "Bangkok", "ChiangMai", "HuaHin", "Phuket", "Pattaya", 
  "Koh Phangan", "Koh Tao", "Koh Samui", "All Cities"
] as const;

// ===== LOCATIONS =====
export const LOCATIONS = [
  "Bangkok", "ChiangMai", "HuaHin", "Phuket", "Pattaya", 
  "Koh Phangan", "Koh Tao", "Koh Samui", "All Cities"
] as const;

// ===== CURRENCIES =====
export const CURRENCIES = [
  "THB", "USD", "EUR", "GBP", "JPY", "KRW", "CNY"
] as const;

// ===== LIMITS & CONSTRAINTS =====
export const PRODUCT_LIMITS = {
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_IMAGES: 5,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const,
  MIN_PRICE: 0,
  MAX_PRICE: 999999999.99,
} as const;

export const ANALYSIS_LIMITS = {
  MAX_IMAGES: 5,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const,
} as const;

// ===== RATING RANGES =====
export const RATING_RANGE = {
  MIN: 1,
  MAX: 5,
} as const;

// ===== EMOTIONAL ASSESSMENT =====
export const EMOTIONAL_QUESTIONS = [
  "How attached are you to this item?",
  "How often do you use this item?",
  "How much joy does this item bring you?",
  "How difficult would it be to replace this item?",
  "How much space does this item take up?"
] as const;

// ===== ENVIRONMENTAL IMPACT =====
export const ENVIRONMENTAL_IMPACT = {
  LOW: "low",
  MEDIUM: "medium", 
  HIGH: "high",
  CRITICAL: "critical"
} as const;

// ===== TYPE EXPORTS =====
export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
export type ProductCondition = typeof PRODUCT_CONDITIONS[number];
export type PriceType = typeof PRICE_TYPES[number];
export type DeclutterSituation = typeof DECLUTTER_SITUATIONS[number];
export type RecommendationAction = typeof RECOMMENDATION_ACTIONS[number];
export type EnvironmentalImpactLevel = typeof ENVIRONMENTAL_IMPACT_LEVELS[number];
export type NotificationType = typeof NOTIFICATION_TYPES[number];
export type MessageType = typeof MESSAGE_TYPES[number];
export type BusinessType = typeof BUSINESS_TYPES[number];
export type PriceRange = typeof PRICE_RANGES[number];
export type TipCategory = typeof TIP_CATEGORIES[number];
export type Location = typeof LOCATIONS[number];
export type Currency = typeof CURRENCIES[number];
export type LocalTipCategory = typeof VALID_LOCAL_TIP_CATEGORIES[number];
export type GiveAndGlowCategory = typeof VALID_GIVE_AND_GLOW_CATEGORIES[number];
export type GiveAndGlowLocation = typeof VALID_GIVE_AND_GLOW_LOCATIONS[number];
