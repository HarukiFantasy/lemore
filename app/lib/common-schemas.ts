import { z } from "zod";

// URL 파라미터 검증 스키마
export const paramsSchema = {
  productId: z.object({
    id: z.string().min(1, "Product ID is required"),
  }),
  userId: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
  categoryId: z.object({
    id: z.string().min(1, "Category ID is required"),
  }),
};

// 페이지네이션 스키마
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default("20"),
});

// 타입 추론
export type PaginationParams = z.infer<typeof paginationSchema>; 