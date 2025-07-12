import { productCategories, productConditions, priceTypes } from "~/schema";

// UI 전용 상수들
export const PRODUCT_CATEGORIES = productCategories.enumValues;

// 카테고리별 이모티콘 매핑
export const CATEGORY_ICONS: Record<string, string> = {
  Electronics: "📱",
  Clothing: "👕",
  Books: "📚",
  Home: "🏠",
  Sports: "⚽",
  Beauty: "💄",
  Toys: "🧸",
  Automotive: "🚗",
  Health: "💊",
  Other: "📦"
};

export const PRICE_TYPES = [
  { value: "Fixed", label: "Fixed Price" },
  { value: "Negotiable", label: "Negotiable" },
  { value: "Free", label: "Free" },
  { value: "Auction", label: "Auction" }
] as const;

export const PRODUCT_LIMITS = {
  title: { min: 1, max: 100 },
  description: { min: 1, max: 2000 },
  price: { min: 0, max: 1000000 },
  images: { max: 10 }
} as const;

export const PRODUCT_CONDITIONS = [
  { value: "New", label: "New" },
  { value: "Like New", label: "Like New" },
  { value: "Excellent", label: "Excellent" },
  { value: "Good", label: "Good" },
  { value: "Fair", label: "Fair" },
  { value: "Poor", label: "Poor" }
] as const;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB


// 타입 정의
export type ProductCategory = typeof productCategories.enumValues[number];
export type ProductCondition = typeof productConditions.enumValues[number];
export type PriceType = typeof priceTypes.enumValues[number]; 