import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod"

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

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "Just now";
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
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
