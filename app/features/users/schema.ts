import { z } from "zod";

// 사용자 기본 정보 스키마
export const userSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  avatar: z.string().url("Avatar URL must be valid").optional(),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
  location: z.string().optional(),
  memberSince: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  totalSales: z.number().min(0).optional(),
  responseRate: z.string().optional(),
  responseTime: z.string().optional(),
});

// 사용자 생성 스키마
export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// 사용자 업데이트 스키마
export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
  location: z.string().optional(),
  avatar: z.instanceof(File).optional(),
});

// 로그인 스키마
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// 비밀번호 재설정 스키마
export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// 새 비밀번호 설정 스키마
export const newPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// 타입 추론
export type User = z.infer<typeof userSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type NewPasswordData = z.infer<typeof newPasswordSchema>;
