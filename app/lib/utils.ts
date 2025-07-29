import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { DateTime } from "luxon";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Zod 검증 유틸리티 함수들
export function validateWithZod<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(error => error.message);
  return { success: false, errors };
}

export function getFieldErrors(schema: z.ZodSchema, data: unknown): Record<string, string> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {};
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach(error => {
    const field = error.path.join('.');
    errors[field] = error.message;
  });
  
  return errors;
}

export function validateUrlParams<T>(schema: z.ZodSchema<T>, params: Record<string, string | undefined>): T | null {
  const result = schema.safeParse(params);
  return result.success ? result.data : null;
}

export function validateSearchParams<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): T | null {
  const params = Object.fromEntries(searchParams);
  return validateUrlParams(schema, params);
}

export function formatTimeAgo(dateString: string | Date): string {
  if (!dateString) return "";
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const dt = DateTime.fromJSDate(date).toUTC();
  const now = DateTime.now().toUTC();
  const diff = now.diff(dt, ['years', 'months', 'days', 'hours', 'minutes', 'seconds']);

  if (diff.years > 0) return `${Math.floor(diff.years)} year${Math.floor(diff.years) > 1 ? 's' : ''} ago`;
  if (diff.months > 0) return `${Math.floor(diff.months)} month${Math.floor(diff.months) > 1 ? 's' : ''} ago`;
  if (diff.days > 0) return `${Math.floor(diff.days)} day${Math.floor(diff.days) > 1 ? 's' : ''} ago`;
  if (diff.hours > 0) return `${Math.floor(diff.hours)} hour${Math.floor(diff.hours) > 1 ? 's' : ''} ago`;
  if (diff.minutes > 0) return `${Math.floor(diff.minutes)} minute${Math.floor(diff.minutes) > 1 ? 's' : ''} ago`;
  if (diff.seconds > 5) return `${Math.floor(diff.seconds)} seconds ago`;

  return "Just now";
}

// 카테고리별 색상 매핑
export const categoryColors = {
  // Local Tips 카테고리
  "Visa/Immigration": {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
    hover: "hover:bg-blue-200"
  },
  "Healthcare/Insurance": {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
    hover: "hover:bg-green-200"
  },
  "Transportation": {
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-200",
    hover: "hover:bg-purple-200"
  },
  "Banking/Finance": {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
    hover: "hover:bg-yellow-200"
  },
  "Housing": {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-200",
    hover: "hover:bg-orange-200"
  },
  "Education": {
    bg: "bg-indigo-100",
    text: "text-indigo-800",
    border: "border-indigo-200",
    hover: "hover:bg-indigo-200"
  },
  "Other": {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200",
    hover: "hover:bg-gray-200"
  },
  
  // Give and Glow 카테고리
  "Furniture": {
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-200",
    hover: "hover:bg-amber-200"
  },
  "Electronics": {
    bg: "bg-cyan-100",
    text: "text-cyan-800",
    border: "border-cyan-200",
    hover: "hover:bg-cyan-200"
  },
  "Clothing": {
    bg: "bg-pink-100",
    text: "text-pink-800",
    border: "border-pink-200",
    hover: "hover:bg-pink-200"
  },
  "Books": {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-200",
    hover: "hover:bg-emerald-200"
  },
  "Kitchen": {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
    hover: "hover:bg-red-200"
  },
  "Toys": {
    bg: "bg-lime-100",
    text: "text-lime-800",
    border: "border-lime-200",
    hover: "hover:bg-lime-200"
  },
  "Garden": {
    bg: "bg-teal-100",
    text: "text-teal-800",
    border: "border-teal-200",
    hover: "hover:bg-teal-200"
  },
  "Sports": {
    bg: "bg-violet-100",
    text: "text-violet-800",
    border: "border-violet-200",
    hover: "hover:bg-violet-200"
  }
} as const;

// 카테고리 색상 가져오기 함수
export function getCategoryColors(category: string) {
  return categoryColors[category as keyof typeof categoryColors] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200",
    hover: "hover:bg-gray-200"
  };
}

/**
 * 사용자 인증 상태를 확인하는 함수
 * 실제 환경에서는 세션이나 토큰을 확인해야 함
 */
export function getCurrentUserId(request?: Request): string | null {
  try {
    // TODO: 실제 인증 로직 구현
    // 1. 세션 쿠키 확인
    // 2. JWT 토큰 확인
    // 3. API 키 확인 등
    
    if (request) {
      // 쿠키에서 세션 확인
      const cookies = request.headers.get("cookie");
      if (cookies) {
        const sessionMatch = cookies.match(/session=([^;]+)/);
        if (sessionMatch) {
          // TODO: 세션 검증 로직
          // return validateSession(sessionMatch[1]);
        }
      }
      
      // Authorization 헤더 확인
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        // TODO: JWT 토큰 검증 로직
        // return validateJWT(token);
      }
    }
    
    // 개발 환경에서는 null 반환 (비로그인 상태)
    return null;
    
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}

/**
 * 비로그인 사용자 여부 확인
 */
export function isAnonymousUser(userId: string | null): boolean {
  return userId === null;
}

/**
 * IP 주소 추출 함수
 * 비활성화: 사이드 프로젝트에서는 불필요
 */
// export function getClientIP(request: Request): string {
//   const forwarded = request.headers.get("x-forwarded-for");
//   const realIp = request.headers.get("x-real-ip");
//   const cfConnectingIp = request.headers.get("cf-connecting-ip");
//   
//   return forwarded?.split(",")[0] || 
//          realIp || 
//          cfConnectingIp || 
//          "unknown";
// }

/**
 * User Agent 추출 함수
 * 비활성화: 사이드 프로젝트에서는 불필요
 */
// export function getClientUserAgent(request: Request): string {
//   return request.headers.get("user-agent") || "unknown";
// }

// Check if user has appreciation badge based on give-and-glow reviews
export const checkAppreciationBadge = async (client: any, sellerId: string): Promise<boolean> => {
  try {
    // First, check if the user already has the appreciation_badge set in their profile
    const { data: userProfile, error: profileError } = await client
      .from('user_profiles')
      .select('appreciation_badge')
      .eq('profile_id', sellerId)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return false;
    }
    
    if (userProfile?.appreciation_badge) {
      return true;
    }
    
    // If not found in profile or badge is false, check the give-and-glow reviews
    const { data: highRatingReviews, error: reviewsError } = await client
      .from('give_and_glow_reviews')
      .select('*')
      .eq('giver_id', sellerId)
      .gt('rating', 4);
    
    if (reviewsError) {
      console.error("Error fetching give-and-glow reviews:", reviewsError);
      return false;
    }
    
    // User gets appreciation badge if they have at least one review with rating > 4
    return (highRatingReviews?.length ?? 0) > 0;
  } catch (error) {
    console.error("Error checking appreciation badge:", error);
    return false;
  }
};
