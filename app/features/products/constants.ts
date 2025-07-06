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

// 가격 타입
export const PRICE_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "negotiable", label: "Negotiable" },
  { value: "free", label: "Free" },
] as const;


// TypeScript 타입 정의
export type ProductCategory = typeof PRODUCT_CATEGORIES[number]["value"];
export type ProductCondition = typeof PRODUCT_CONDITIONS[number]["value"];
export type PriceType = typeof PRICE_TYPES[number]["value"];