import { z } from "zod";

// 사용자 프로필 스키마
export const userProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  avatar: z.instanceof(File).optional(),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
});

// 타입 추론
export type UserProfileData = z.infer<typeof userProfileSchema>; 