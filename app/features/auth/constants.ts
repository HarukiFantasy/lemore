import { z } from "zod";

// Auth Methods
export const AUTH_METHODS = [
  { value: "email_password", label: "Email & Password" },
  { value: "phone_otp", label: "Phone OTP" },
  { value: "social", label: "Social Login" },
] as const;

// Social Providers
export const SOCIAL_PROVIDERS = [
  { value: "google", label: "Google" },
  { value: "facebook", label: "Facebook" },
  { value: "apple", label: "Apple" },
  { value: "kakao", label: "Kakao" },
  { value: "naver", label: "Naver" },
  { value: "line", label: "Line" },
] as const;

// OTP Types
export const OTP_TYPES = [
  { value: "phone_verification", label: "Phone Verification" },
  { value: "password_reset", label: "Password Reset" },
  { value: "two_factor", label: "Two Factor Authentication" },
] as const;

// OTP Status
export const OTP_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "expired", label: "Expired" },
  { value: "failed", label: "Failed" },
] as const;

// Session Status
export const SESSION_STATUSES = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "revoked", label: "Revoked" },
] as const;

// Auth Security Settings
export const AUTH_SECURITY_SETTINGS = {
  OTP_EXPIRY_MINUTES: 10,
  MAX_OTP_ATTEMPTS: 3,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    UPPERCASE: true,
    LOWERCASE: true,
    NUMBERS: true,
    SPECIAL_CHARS: true,
  },
  SESSION_TIMEOUT_MINUTES: 60,
  REFRESH_TOKEN_EXPIRY_DAYS: 30,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 30,
} as const;

// 사용자 프로필 스키마
export const userProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  avatar: z.instanceof(File).optional(),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
});

// 사용자 스키마
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
  location: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 사용자 생성 스키마
export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(2, "Display name must be at least 2 characters").max(50, "Display name must be less than 50 characters"),
  location: z.string().min(1, "Location is required"),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
});

// 사용자 업데이트 스키마
export const updateUserSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters").max(50, "Display name must be less than 50 characters").optional(),
  avatarUrl: z.string().optional(),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
  location: z.string().min(1, "Location is required").optional(),
});

// 로그인 스키마
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// 회원가입 스키마
export const joinSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// OTP 시작 스키마
export const otpStartSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
});

// OTP 완료 스키마
export const otpCompleteSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

// 타입 추론
export type UserProfileData = z.infer<typeof userProfileSchema>;
export type User = z.infer<typeof userSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type JoinData = z.infer<typeof joinSchema>;
export type OtpStartData = z.infer<typeof otpStartSchema>;
export type OtpCompleteData = z.infer<typeof otpCompleteSchema>;

// Auth Types
export type AuthMethod = typeof AUTH_METHODS[number]["value"];
export type SocialProvider = typeof SOCIAL_PROVIDERS[number]["value"];
export type OtpType = typeof OTP_TYPES[number]["value"];
export type OtpStatus = typeof OTP_STATUSES[number]["value"];
export type SessionStatus = typeof SESSION_STATUSES[number]["value"];
