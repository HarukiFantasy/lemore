import { localTipCategories } from "~/schema";

// UI 전용 상수 (필터링, 표시용)
export const LOCAL_TIP_CATEGORIES_WITH_ALL = [
  "All",
  ...localTipCategories.enumValues
] as const;

// UI 전용 타입
export type LocalTipCategoryWithAll = typeof LOCAL_TIP_CATEGORIES_WITH_ALL[number];

// 데이터베이스 enum 타입 (schema에서 가져온 것)
export type LocalTipCategory = typeof localTipCategories.enumValues[number];

// 기존 코드와의 호환성을 위한 별칭
export const LOCAL_TIP_CATEGORIES = LOCAL_TIP_CATEGORIES_WITH_ALL; 

export const BUSINESS_TYPES = [
  "All",
  "Restaurant",
  "Cafe",
  "Bar",
  "Shop",
  "Service",
  "Other"
] as const;