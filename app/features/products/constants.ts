// 상품 카테고리(공통)
export const PRODUCT_CATEGORIES = [
  { value: "vehicles", label: "Vehicles", icon: "🚗" },
  { value: "classifieds", label: "Classifieds", icon: "🏷️" },
  { value: "clothing", label: "Clothing", icon: "👕" },
  { value: "electronics", label: "Electronics", icon: "📱" },
  { value: "entertainment", label: "Entertainment", icon: "🎬" },
  { value: "family", label: "Family", icon: "❤️" },
  { value: "free_stuff", label: "Free stuff", icon: "🎁" },
  { value: "outdoors", label: "Outdoors", icon: "🪴" },
  { value: "hobbies", label: "Hobbies", icon: "🖌️" },
  { value: "home_goods", label: "Home goods", icon: "🏠" },
  { value: "home_improvement", label: "Home improvement supplies", icon: "🔧" },
  { value: "musical_instruments", label: "Musical instruments", icon: "🎸" },
  { value: "office_supplies", label: "Office supplies", icon: "🏷️" },
  { value: "pet_supplies", label: "Pet supplies", icon: "🐾" },
  { value: "property", label: "Property for sale", icon: "🏠💲" },
  { value: "sporting_goods", label: "Sporting goods", icon: "🏃" },
  { value: "toys_games", label: "Toys and games", icon: "🎮" },
  { value: "buy_sell_groups", label: "Buy-and-sell groups", icon: "👥" },
] as const;

// 상품 상태
export const PRODUCT_CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
] as const;

// 상품 상태 (판매 상태)
export const PRODUCT_STATUSES = [
  { value: "active", label: "Active" },
  { value: "sold", label: "Sold" },
  { value: "expired", label: "Expired" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending Approval" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
] as const;

// 가격 타입
export const PRICE_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "negotiable", label: "Negotiable" },
  { value: "free", label: "Free" },
] as const;

{/* To do : 상품 신고 사유
export const REPORT_REASONS = [
  { value: "inappropriate_content", label: "Inappropriate Content" },
  { value: "spam", label: "Spam" },
  { value: "fake_item", label: "Fake Item" },
  { value: "wrong_category", label: "Wrong Category" },
  { value: "duplicate_listing", label: "Duplicate Listing" },
  { value: "scam", label: "Scam" },
  { value: "copyright_violation", label: "Copyright Violation" },
  { value: "other", label: "Other" },
] as const;
*/}

{/* To do : 신고 상태
export const REPORT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
] as const;
*/}

// 정렬 옵션
export const SORT_OPTIONS = [
  { value: "date_desc", label: "Newest First" },
  { value: "date_asc", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popularity", label: "Most Popular" },
  { value: "distance", label: "Nearest First" },
] as const;

// 필터 옵션
export const FILTER_OPTIONS = {
  PRICE_RANGES: [
    { value: "0-1000", label: "Under THB 1,000" },
    { value: "1000-5000", label: "THB 1,000 - 5,000" },
    { value: "5000-10000", label: "THB 5,000 - 10,000" },
    { value: "10000-50000", label: "THB 10,000 - 50,000" },
    { value: "50000+", label: "Over THB 50,000" },
  ],
  DISTANCE_RANGES: [
    { value: "1", label: "Within 1 km" },
    { value: "5", label: "Within 5 km" },
    { value: "10", label: "Within 10 km" },
    { value: "25", label: "Within 25 km" },
    { value: "50", label: "Within 50 km" },
  ],
} as const;

// 상품 기본값
export const PRODUCT_DEFAULTS = {
  MAX_IMAGES: 5,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_TAGS: 10,
  EXPIRY_DAYS: 30,
  VIEW_COUNT_UPDATE_INTERVAL: 5 * 60 * 1000, // 5분
} as const;

// 상품 제한사항
export const PRODUCT_LIMITS = {
  MIN_PRICE: 0,
  MAX_PRICE: 999999999.99,
  MIN_TITLE_LENGTH: 5,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;

// 상품 통계 타입
export const PRODUCT_STATISTICS_TYPES = [
  "view_count",
  "like_count", 
  "contact_count",
  "favorite_count",
  "share_count",
] as const;

// 상품 이벤트 타입
export const PRODUCT_EVENTS = [
  "created",
  "updated",
  "viewed",
  "liked",
  "contacted",
  "sold",
  "expired",
  "reported",
] as const;

// TypeScript 타입 정의
export type ProductCategory = typeof PRODUCT_CATEGORIES[number]["value"];
export type ProductCondition = typeof PRODUCT_CONDITIONS[number]["value"];
export type ProductStatus = typeof PRODUCT_STATUSES[number]["value"];
export type PriceType = typeof PRICE_TYPES[number]["value"];
export type SortOption = typeof SORT_OPTIONS[number]["value"];
export type ProductStatisticsType = typeof PRODUCT_STATISTICS_TYPES[number];
export type ProductEvent = typeof PRODUCT_EVENTS[number]; 