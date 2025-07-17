// 공통으로 사용되는 상수들

// 위치 정보
export const LOCATIONS = [
  "All Locations",
  "Bangkok",
  "ChiangMai", 
  "Phuket",
  "HuaHin",
  "Pattaya",
  "Krabi",
  "Koh Samui",
  "Other Cities"
] as const;

// 통화
export const CURRENCIES = ["THB", "USD", "EUR"] as const;

// 페이지네이션
export const PAGINATION_LIMITS = {
  small: 10,
  medium: 20,
  large: 50
} as const;

// 파일 업로드 제한
export const FILE_UPLOAD_LIMITS = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxCount: 10
  },
  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["application/pdf", "text/plain"],
    maxCount: 5
  }
} as const;

// 타입 정의
export type Location = typeof LOCATIONS[number];
export type Currency = typeof CURRENCIES[number];
