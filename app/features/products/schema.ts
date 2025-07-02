import { z } from "zod";

// 상품 관련 스키마
export const productSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  price: z.string().min(1, "Price is required").regex(/^THB\s\d+/, "Price must be in format 'THB [number]'"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  condition: z.enum(["New", "Like New", "Good", "Fair", "Poor"], {
    errorMap: () => ({ message: "Please select a valid condition" }),
  }),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  image: z.string().optional(),
  sellerId: z.string().min(1, "Seller ID is required"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const productListSchema = z.object({
  products: z.array(productSchema),
  totalCount: z.number().min(0, "Total count cannot be negative"),
  currentPage: z.number().min(1, "Current page must be at least 1"),
  totalPages: z.number().min(1, "Total pages must be at least 1"),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});

export const productFiltersSchema = z.object({
  q: z.string().max(100, "Search query is too long").optional(),
  category: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  condition: z.enum(["New", "Like New", "Good", "Fair", "Poor"]).optional(),
  location: z.string().optional(),
  sortBy: z.enum(["price", "date", "relevance"]).optional().default("date"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default("20"),
});

// 폼 데이터 검증 스키마
export const productFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  price: z.string().min(1, "Price is required").regex(/^THB\s\d+/, "Price must be in format 'THB [number]'"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  condition: z.enum(["New", "Like New", "Good", "Fair", "Poor"], {
    errorMap: () => ({ message: "Please select a valid condition" }),
  }),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  images: z.array(z.instanceof(File)).max(5, "Maximum 5 images allowed"),
});

// 검색 및 필터링 스키마
export const searchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  sortBy: z.enum(["price", "date", "relevance"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// 타입 추론
export type Product = z.infer<typeof productSchema>;
export type ProductList = z.infer<typeof productListSchema>;
export type ProductFilters = z.infer<typeof productFiltersSchema>;
export type ProductFormData = z.infer<typeof productFormSchema>;
export type SearchParams = z.infer<typeof searchParamsSchema>; 