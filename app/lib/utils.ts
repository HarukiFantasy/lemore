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
