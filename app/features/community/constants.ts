// Give & Glow 카테고리
export const GIVE_AND_GLOW_CATEGORIES = [
  "All",
  "Furniture",
  "Kitchen",
  "Toys",
  "Garden",
  "Electronics",
  "Sports",
  "Other"
] as const;

// Local Reviews 가격대
export const PRICE_RANGES = [
  "$",
  "$$",
  "$$$",
  "$$$$",
  "All"
] as const;

// Local Reviews 비즈니스 타입
export const BUSINESS_TYPES = [
  "Restaurant",
  "Cafe", 
  "Shop",
  "Service",
  "Entertainment",
  "All"
] as const;

// Local Tips 카테고리
export const LOCAL_TIP_CATEGORIES = [
  "All",
  "Transportation",
  "Food",
  "Accommodation",
  "Visa/Immigration",
  "Healthcare/Insurance",
  "Banking/Finance",
  "Housing",
  "Education",
  "Shopping",
  "Entertainment",
  "Other"
] as const;

// 공통 위치(도시) - 모든 기능에서 사용
export const LOCATIONS = [
  "Bangkok",
  "ChiangMai", 
  "Phuket",
  "HuaHin",
  "Pattaya",
  "Koh Phangan",
  "Koh Tao",
  "Koh Samui"
] as const;

// 필터용 위치 (All Cities 포함)
export const LOCATIONS_WITH_ALL = [
  "All Cities",
  ...LOCATIONS
] as const;

// TypeScript 타입 정의
export type GiveAndGlowCategory = typeof GIVE_AND_GLOW_CATEGORIES[number];
export type BusinessType = typeof BUSINESS_TYPES[number];
export type PriceRange = typeof PRICE_RANGES[number];
export type LocalTipCategory = typeof LOCAL_TIP_CATEGORIES[number];
export type Location = typeof LOCATIONS[number];
export type LocationWithAll = typeof LOCATIONS_WITH_ALL[number];
