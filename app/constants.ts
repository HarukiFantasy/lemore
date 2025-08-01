// 공통으로 사용되는 상수들

// 국가별 위치 설정
export const COUNTRY_CONFIG = {
  Thailand: {
    name: "Thailand",
    currency: "THB",
    timezone: "Asia/Bangkok",
    defaultCity: "Bangkok",
    cities: [
      "Bangkok",
      "ChiangMai", 
      "Phuket",
      "HuaHin",
      "Pattaya",
      "Krabi",
      "Koh Samui",
      "Other Thai Cities"
    ]
  },
  Korea: {
    name: "Korea", 
    currency: "KRW",
    timezone: "Asia/Seoul",
    defaultCity: "Seoul",
    cities: [
      "Seoul",
      "Busan",
      "Incheon", 
      "Daegu",
      "Daejeon",
      "Gwangju",
      "Ulsan",
      "Other Korean Cities"
    ]
  }
} as const;

// 모든 위치 (Thailand + Korea)
export const LOCATIONS = [
  ...COUNTRY_CONFIG.Thailand.cities,
  ...COUNTRY_CONFIG.Korea.cities
] as const;

// 필터링용 위치 (All 옵션 포함)
export const ALL_LOCATIONS = [
  "All Locations",
  ...LOCATIONS
] as const;

// 국가 목록
export const COUNTRIES = Object.keys(COUNTRY_CONFIG) as (keyof typeof COUNTRY_CONFIG)[];

// Popular cities (shown at top)
export const POPULAR_CITIES = [
  { name: "Bangkok", country: "Thailand", display: "Bangkok", korean: "" },
  { name: "Seoul", country: "Korea", display: "Seoul", korean: "서울" },
  { name: "ChiangMai", country: "Thailand", display: "Chiang Mai", korean: "" },
  { name: "Busan", country: "Korea", display: "Busan", korean: "부산" }
] as const;

// Other cities by country (excluding popular ones)
export const THAILAND_OTHER_CITIES = [
  "Phuket",
  "HuaHin",
  "Pattaya", 
  "Krabi",
  "Koh Samui",
  "Other Thai Cities"
] as const;

export const KOREA_OTHER_CITIES = [
  { name: "Incheon", korean: "인천" },
  { name: "Daegu", korean: "대구" },
  { name: "Daejeon", korean: "대전" },
  { name: "Gwangju", korean: "광주" },
  { name: "Ulsan", korean: "울산" },
  { name: "Other Korean Cities", korean: "" }
] as const;

// Helper function to get Korean city name
export const getKoreanCityName = (cityName: string): string => {
  const koreanCity = KOREA_OTHER_CITIES.find(city => city.name === cityName);
  const popularCity = POPULAR_CITIES.find(city => city.name === cityName);
  
  if (koreanCity && koreanCity.korean) {
    return `${cityName} (${koreanCity.korean})`;
  }
  if (popularCity && popularCity.korean) {
    return `${cityName} (${popularCity.korean})`;
  }
  return cityName;
};

// 통화 정보
export const CURRENCIES = ["THB", "KRW", "USD", "EUR"] as const;

// 국가별 통화 매핑
export const COUNTRY_CURRENCY_MAP = {
  Thailand: "THB",
  Korea: "KRW"
} as const;

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

// user_levels 테이블
export const USER_LEVELS = [
  "Explorer",   // 입문자, 가입 즉시
  "Connector",  // 활동 시작
  "Sharer",     // 기여/나눔
  "Glowmaker",  // 신뢰/영향력
  "Legend"      // 전설, 최고 등급
] as const;

export type UserLevel = typeof USER_LEVELS[number];

// 타입 정의
export type Country = keyof typeof COUNTRY_CONFIG;
export type Location = typeof LOCATIONS[number];
export type AllLocation = typeof ALL_LOCATIONS[number];
export type Currency = typeof CURRENCIES[number];

// 유틸리티 함수들
export function getCountryByLocation(location: Location): Country {
  for (const [country, config] of Object.entries(COUNTRY_CONFIG)) {
    if ((config.cities as readonly string[]).includes(location)) {
      return country as Country;
    }
  }
  return "Thailand"; // 기본값
}

export function getCurrencyByLocation(location: Location): string {
  const country = getCountryByLocation(location);
  return COUNTRY_CONFIG[country].currency;
}

export function getDefaultLocationByCountry(country: Country): Location {
  return COUNTRY_CONFIG[country].defaultCity as Location;
}

export function getCitiesByCountry(country: Country): readonly string[] {
  return COUNTRY_CONFIG[country].cities;
}
