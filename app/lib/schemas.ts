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

// 사용자 프로필 스키마
export const userProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  avatar: z.instanceof(File).optional(),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
});

// 커뮤니티 포스트 스키마
export const communityPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  content: z.string().min(10, "Content must be at least 10 characters").max(2000, "Content must be less than 2000 characters"),
  category: z.enum(["question", "review", "tip", "discussion"], {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
  tags: z.array(z.string()).max(5, "Maximum 5 tags allowed").optional(),
});

// 댓글 스키마
export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500, "Comment must be less than 500 characters"),
  parentId: z.string().optional(), // 대댓글을 위한 부모 댓글 ID
});

// 페이지네이션 스키마
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default("20"),
});

// 로컬 팁 관련 스키마
export const localTipCategorySchema = z.enum([
  "All", 
  "Visa/Immigration", 
  "Healthcare/Insurance", 
  "Transportation", 
  "Banking/Finance", 
  "Housing", 
  "Education", 
  "Other"
], {
  errorMap: () => ({ message: "Please select a valid category" }),
});

export const localTipLocationSchema = z.enum([
  "Bangkok", 
  "ChiangMai", 
  "HuaHin", 
  "Phuket", 
  "Pattaya", 
  "Koh Phangan", 
  "Koh Tao", 
  "Koh Samui", 
  "All Cities"
], {
  errorMap: () => ({ message: "Please select a valid location" }),
});

export const localTipSearchSchema = z.string()
  .max(100, "Search query is too long. Maximum length is 100 characters")
  .transform((val) => val.replace(/[<>]/g, "").trim()) // XSS 방지를 위한 특수 문자 필터링
  .optional()
  .default("");

export const localTipFiltersSchema = z.object({
  category: localTipCategorySchema,
  location: localTipLocationSchema,
  search: localTipSearchSchema,
}).transform((data) => ({
  category: data.category || "All",
  location: data.location || "Bangkok",
  search: data.search || "",
}));

export const localTipPostSchema = z.object({
  id: z.number().positive("Post ID must be positive"),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().min(1, "Content is required").max(5000, "Content must be less than 5000 characters"),
  category: localTipCategorySchema,
  location: localTipLocationSchema,
  author: z.string().min(1, "Author is required").max(100, "Author name must be less than 100 characters"),
  createdAt: z.date(),
  likes: z.number().min(0, "Likes cannot be negative"),
  comments: z.number().min(0, "Comments cannot be negative"),
});

export const localTipCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().min(10, "Content must be at least 10 characters").max(5000, "Content must be less than 5000 characters"),
  category: localTipCategorySchema.exclude(["All"]), // "All"은 생성 시 제외
  location: localTipLocationSchema.exclude(["All Cities"]), // "All Cities"는 생성 시 제외
});

// 유효한 카테고리와 위치 목록을 상수로 정의
export const VALID_LOCAL_TIP_CATEGORIES = [
  "All", 
  "Visa/Immigration", 
  "Healthcare/Insurance", 
  "Transportation", 
  "Banking/Finance", 
  "Housing", 
  "Education", 
  "Other"
] as const;

export const VALID_LOCAL_TIP_LOCATIONS = [
  "Bangkok", 
  "ChiangMai", 
  "HuaHin", 
  "Phuket", 
  "Pattaya", 
  "Koh Phangan", 
  "Koh Tao", 
  "Koh Samui", 
  "All Cities"
] as const;

// Ask & Answer 관련 스키마
export const questionCategorySchema = z.enum([
  "All",
  "Furniture",
  "Electronics", 
  "Clothing",
  "Books",
  "Sports",
  "Home & Garden",
  "Other"
], {
  errorMap: () => ({ message: "Please select a valid category" }),
});

export const questionFiltersSchema = z.object({
  category: questionCategorySchema.optional().default("All"),
  search: z.string()
    .max(100, "Search query is too long. Maximum length is 100 characters")
    .transform((val) => val.replace(/[<>]/g, "").trim()) // XSS 방지를 위한 특수 문자 필터링
    .optional()
    .default(""),
  sortBy: z.enum(["newest", "oldest", "mostAnswers", "mostLiked"]).optional().default("newest"),
});

export const questionSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().min(10, "Content must be at least 10 characters").max(5000, "Content must be less than 5000 characters"),
  author: z.string().min(1, "Author is required").max(100, "Author name must be less than 100 characters"),
  timestamp: z.string().min(1, "Timestamp is required"),
  tags: z.array(z.string().max(20, "Tag must be less than 20 characters")).max(5, "Maximum 5 tags allowed"),
  answers: z.array(z.object({
    id: z.string().min(1, "Answer ID is required"),
    content: z.string().min(1, "Answer content is required").max(2000, "Answer must be less than 2000 characters"),
    author: z.string().min(1, "Author is required").max(100, "Author name must be less than 100 characters"),
    timestamp: z.string().min(1, "Timestamp is required"),
    isAccepted: z.boolean(),
  })),
});

export const answerSchema = z.object({
  id: z.string().min(1, "Answer ID is required"),
  content: z.string().min(1, "Answer content is required").max(2000, "Answer must be less than 2000 characters"),
  author: z.string().min(1, "Author is required").max(100, "Author name must be less than 100 characters"),
  timestamp: z.string().min(1, "Timestamp is required"),
  isAccepted: z.boolean(),
});

export const createQuestionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().min(10, "Content must be at least 10 characters").max(5000, "Content must be less than 5000 characters"),
  tags: z.string().optional().default(""),
});

export const createAnswerSchema = z.object({
  content: z.string().min(1, "Answer content is required").max(2000, "Answer must be less than 2000 characters"),
});

// 유효한 질문 카테고리 목록을 상수로 정의
export const VALID_QUESTION_CATEGORIES = [
  "All",
  "Furniture",
  "Electronics", 
  "Clothing",
  "Books",
  "Sports",
  "Home & Garden",
  "Other"
] as const;

// 타입 추론
export type ProductFormData = z.infer<typeof productFormSchema>;
export type SearchParams = z.infer<typeof searchParamsSchema>;
export type UserProfileData = z.infer<typeof userProfileSchema>;
export type CommunityPostData = z.infer<typeof communityPostSchema>;
export type CommentData = z.infer<typeof commentSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type LocalTipCategory = z.infer<typeof localTipCategorySchema>;
export type LocalTipLocation = z.infer<typeof localTipLocationSchema>;
export type LocalTipFilters = z.infer<typeof localTipFiltersSchema>;
export type LocalTipPost = z.infer<typeof localTipPostSchema>;
export type LocalTipCreateData = z.infer<typeof localTipCreateSchema>;
export type QuestionCategory = z.infer<typeof questionCategorySchema>;
export type QuestionFilters = z.infer<typeof questionFiltersSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Answer = z.infer<typeof answerSchema>;
export type CreateQuestionData = z.infer<typeof createQuestionSchema>;
export type CreateAnswerData = z.infer<typeof createAnswerSchema>;

// Give and Glow 관련 스키마
export const giveAndGlowCategorySchema = z.enum([
  "All",
  "Furniture",
  "Electronics", 
  "Clothing",
  "Books",
  "Kitchen",
  "Toys",
  "Garden",
  "Sports",
  "Other"
], {
  errorMap: () => ({ message: "Please select a valid category" }),
});

export const giveAndGlowLocationSchema = z.enum([
  "Bangkok",
  "ChiangMai",
  "HuaHin",
  "Phuket",
  "Pattaya",
  "Koh Phangan",
  "Koh Tao",
  "Koh Samui",
  "All Cities"
], {
  errorMap: () => ({ message: "Please select a valid location" }),
});

export const giveAndGlowSearchSchema = z.string()
  .max(100, "Search query is too long. Maximum length is 100 characters")
  .transform((val) => val.replace(/[<>]/g, "").trim()) // XSS 방지를 위한 특수 문자 필터링
  .optional()
  .default("");

export const giveAndGlowFiltersSchema = z.object({
  category: giveAndGlowCategorySchema.optional().default("All"),
  location: giveAndGlowLocationSchema,
  search: giveAndGlowSearchSchema,
}).transform((data) => ({
  category: data.category || "All",
  location: data.location || "Bangkok",
  search: data.search || "",
}));

export const giveAndGlowReviewSchema = z.object({
  id: z.string().min(1, "Review ID is required"),
  itemName: z.string().min(1, "Item name is required").max(100, "Item name must be less than 100 characters"),
  itemCategory: giveAndGlowCategorySchema.exclude(["All"]),
  giverName: z.string().min(1, "Giver name is required").max(100, "Giver name must be less than 100 characters"),
  giverAvatar: z.string().url("Giver avatar URL must be valid").optional(),
  receiverName: z.string().min(1, "Receiver name is required").max(100, "Receiver name must be less than 100 characters"),
  receiverAvatar: z.string().url("Receiver avatar URL must be valid").optional(),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  review: z.string().min(10, "Review must be at least 10 characters").max(2000, "Review must be less than 2000 characters"),
  timestamp: z.string().min(1, "Timestamp is required"),
  location: giveAndGlowLocationSchema,
  tags: z.array(z.string().max(20, "Tag must be less than 20 characters")).max(10, "Maximum 10 tags allowed"),
  photos: z.array(z.string().url("Photo URL must be valid")).max(5, "Maximum 5 photos allowed").optional(),
  appreciationBadge: z.boolean().optional().default(false),
});

export const createGiveAndGlowReviewSchema = z.object({
  itemName: z.string().min(1, "Item name is required").max(100, "Item name must be less than 100 characters"),
  itemCategory: giveAndGlowCategorySchema.exclude(["All"]),
  giverName: z.string().min(1, "Giver name is required").max(100, "Giver name must be less than 100 characters"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  review: z.string().min(10, "Review must be at least 10 characters").max(2000, "Review must be less than 2000 characters"),
  location: giveAndGlowLocationSchema,
  tags: z.string().max(200, "Tags string must be less than 200 characters").optional().default(""),
});

// 유효한 카테고리와 위치 목록을 상수로 정의
export const VALID_GIVE_AND_GLOW_CATEGORIES = [
  "All",
  "Furniture",
  "Electronics", 
  "Clothing",
  "Books",
  "Kitchen",
  "Toys",
  "Garden",
  "Sports",
  "Other"
] as const;


export type GiveAndGlowCategory = z.infer<typeof giveAndGlowCategorySchema>;
export type GiveAndGlowLocation = z.infer<typeof giveAndGlowLocationSchema>;
export type GiveAndGlowFilters = z.infer<typeof giveAndGlowFiltersSchema>;
export type GiveAndGlowReview = z.infer<typeof giveAndGlowReviewSchema>;
export type CreateGiveAndGlowReviewData = z.infer<typeof createGiveAndGlowReviewSchema>;

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

// 상품 관련 타입
export type Product = z.infer<typeof productSchema>;
export type ProductList = z.infer<typeof productListSchema>;
export type ProductFilters = z.infer<typeof productFiltersSchema>; 