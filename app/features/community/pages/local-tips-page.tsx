import { useState, useEffect } from "react";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Separator } from "../../../common/components/ui/separator";
import type { Route } from './+types/local-tips-page';
import { useSearchParams } from "react-router";
import { 
  localTipFiltersSchema, 
  localTipPostSchema, 
  localTipCreateSchema,
  VALID_LOCAL_TIP_CATEGORIES,
  type LocalTipFilters,
  type LocalTipPost,
  type LocalTipCreateData,
  type LocalTipCategory
} from "~/lib/schemas";
import { validateWithZod, getFieldErrors } from "~/lib/utils";

// 데이터베이스에서 가져올 포스트 타입 정의 (Zod 스키마에서 추론)
type LocalTipPostFromDB = LocalTipPost;

// 데이터베이스 연결 함수 (실제 구현 시 데이터베이스 클라이언트로 교체)
async function fetchLocalTipsFromDatabase(filters: LocalTipFilters): Promise<LocalTipPostFromDB[]> {
  try {
    // TODO: 실제 데이터베이스 연결 코드로 교체
    // 예시: const posts = await db.localTips.findMany({ where: filters });
    
    // 현재는 빈 배열 반환 (데이터베이스 연결 전까지)
    return [];
    
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch posts from database");
  }
}

// 새로운 포스트 생성 함수
async function createLocalTip(postData: LocalTipCreateData): Promise<LocalTipPost> {
  try {
    // TODO: 실제 데이터베이스 연결 코드로 교체
    // 예시: const newPost = await db.localTips.create({ data: postData });
    
    // Mock 데이터 반환
    const newPost: LocalTipPost = {
      id: Date.now(),
      title: postData.title,
      content: postData.content,
      category: postData.category,
      location: postData.location,
      author: "Current User", // 실제로는 로그인된 사용자 정보
      createdAt: new Date(),
      likes: 0,
      comments: 0
    };
    
    return newPost;
    
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to create post");
  }
}

// 유효한 카테고리 목록 정의 (location은 navigation에서 관리)
const VALID_CATEGORIES = ["All", "Visa/Immigration", "Healthcare/Insurance", "Transportation", "Banking/Finance", "Housing", "Education", "Other"];

// 검증 함수들
function validateCategory(category: string | undefined): string {
  if (!category || category === "All") {
    return "All";
  }
  
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`Invalid category: ${category}. Valid categories are: ${VALID_CATEGORIES.join(", ")}`);
  }
  
  return category;
}

function validateLocation(location: string | undefined): string {
  if (!location) {
    return "Bangkok"; // 기본값
  }
  
  // navigation의 cities 배열과 일치하는지 확인
  const validLocations = ["Bangkok", "ChiangMai", "HuaHin", "Phuket", "Pattaya", "Koh Phangan", "Koh Tao", "Koh Samui", "All Cities"];
  
  if (!validLocations.includes(location)) {
    throw new Error(`Invalid location: ${location}. Valid locations are: ${validLocations.join(", ")}`);
  }
  
  return location;
}

function validateSearchQuery(search: string | undefined): string {
  if (!search) {
    return "";
  }
  
  // 검색어 길이 제한
  if (search.length > 100) {
    throw new Error("Search query is too long. Maximum length is 100 characters.");
  }
  
  // 특수 문자 필터링 (XSS 방지)
  const sanitizedSearch = search.replace(/[<>]/g, "");
  
  return sanitizedSearch.trim();
}

// 데이터베이스 필터링 함수
function buildDatabaseFilters(validatedFilters: LocalTipFilters) {
  const filters: any = {};
  
  if (validatedFilters.category !== "All") {
    filters.category = validatedFilters.category;
  }
  
  // "All Cities"가 아닐 때만 location 필터 적용
  if (validatedFilters.location !== "All Cities") {
    filters.location = validatedFilters.location;
  }
  
  if (validatedFilters.search) {
    filters.search = validatedFilters.search;
  }
  
  return filters;
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  try {
    const url = new URL(request.url);
    const rawFilters = {
      category: url.searchParams.get("category") || "All",
      location: url.searchParams.get("location") || "Bangkok",
      search: url.searchParams.get("search") || "",
    };

    // Zod를 사용한 데이터 검증
    const validationResult = validateWithZod(localTipFiltersSchema, rawFilters);
    
    if (!validationResult.success) {
      throw new Response(`Validation error: ${validationResult.errors.join(", ")}`, { 
        status: 400 
      });
    }

    const validatedFilters = validationResult.data;

    // 데이터베이스에서 포스트 가져오기
    const databaseFilters = buildDatabaseFilters({
      ...validatedFilters,
      search: validatedFilters.search || ""
    });
    const posts = await fetchLocalTipsFromDatabase(databaseFilters);

    // 각 포스트 검증
    const validatedPosts = posts.map(post => {
      const postValidation = validateWithZod(localTipPostSchema, post);
      if (!postValidation.success) {
        throw new Response(`Invalid post data: ${postValidation.errors.join(", ")}`, { 
          status: 500 
        });
      }
      return postValidation.data;
    });

    // 클라이언트에서 사용할 포스트 데이터 변환
    const transformedPosts = validatedPosts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      location: post.location,
      author: post.author,
      timeAgo: formatTimeAgo(post.createdAt),
      likes: post.likes,
      comments: post.comments
    }));

    return {
      posts: transformedPosts,
      filters: validatedFilters,
      totalCount: transformedPosts.length,
      validCategories: VALID_LOCAL_TIP_CATEGORIES
    };

  } catch (error) {
    // 에러 처리
    console.error("Loader error:", error);
    
    if (error instanceof Response) {
      // 이미 Response 객체인 경우 그대로 던지기
      throw error;
    }
    
    if (error instanceof Error) {
      // 데이터베이스 에러인 경우 500 Internal Server Error 반환
      if (error.message.includes("Failed to fetch posts from database")) {
        throw new Response("Database connection failed", { status: 500 });
      }
    }
    
    // 기타 에러는 500 Internal Server Error 반환
    throw new Response("Internal server error", { status: 500 });
  }
}

// 시간 포맷팅 유틸리티 함수
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
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
  return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const errorMessage = error instanceof Error ? error.message : "Something went wrong";
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h1>
        <p className="text-gray-600">{errorMessage}</p>
      </div>
    </div>
  );
}

export default function LocalTipsPage({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlLocation = searchParams.get("location") || "Bangkok";
  const [selectedCategory, setSelectedCategory] = useState<LocalTipCategory>(loaderData.filters.category);
  const [searchQuery, setSearchQuery] = useState(loaderData.filters.search || "");
  const [posts, setPosts] = useState(loaderData.posts);
  const [showPostForm, setShowPostForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newPost, setNewPost] = useState<LocalTipCreateData>({
    title: "",
    content: "",
    category: "Visa/Immigration",
    location: urlLocation as any
  });

  // URL 파라미터와 상태 동기화
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const category = VALID_LOCAL_TIP_CATEGORIES.includes(categoryParam as any) 
      ? (categoryParam as LocalTipCategory) 
      : "All";
    const search = searchParams.get("search") || "";
    
    setSelectedCategory(category);
    setSearchQuery(search);
  }, [searchParams]);

  // Update location when URL changes
  useEffect(() => {
    setNewPost(prev => ({ ...prev, location: urlLocation as any }));
  }, [urlLocation]);

  const updateFilters = (newCategory: LocalTipCategory, newSearch: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (newCategory !== "All") {
      params.set("category", newCategory);
    } else {
      params.delete("category");
    }
    
    if (newSearch.trim()) {
      params.set("search", newSearch.trim());
    } else {
      params.delete("search");
    }
    
    setSearchParams(params);
  };

  const handleCategoryChange = (category: LocalTipCategory) => {
    setSelectedCategory(category);
    updateFilters(category, searchQuery);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    updateFilters(selectedCategory, search);
  };

  const validateForm = (): boolean => {
    const result = localTipCreateSchema.safeParse(newPost);
    
    if (!result.success) {
      const errors = getFieldErrors(localTipCreateSchema, newPost);
      setFormErrors(errors);
      return false;
    }
    
    setFormErrors({});
    return true;
  };

  const handleSubmitPost = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const createdPost = await createLocalTip(newPost);
      const transformedPost = {
        id: createdPost.id,
        title: createdPost.title,
        content: createdPost.content,
        category: createdPost.category,
        location: createdPost.location,
        author: createdPost.author,
        timeAgo: formatTimeAgo(createdPost.createdAt),
        likes: createdPost.likes,
        comments: createdPost.comments
      };
      
      setPosts([transformedPost, ...posts]);
      setShowPostForm(false);
      setNewPost({
        title: "",
        content: "",
        category: "Visa/Immigration",
        location: urlLocation as any
      });
      setFormErrors({});
    } catch (error) {
      console.error("Error creating post:", error);
      setFormErrors({ submit: error instanceof Error ? error.message : "Failed to create post" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter posts based on current state
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesLocation = urlLocation === "All Cities" || post.location === urlLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Local Tips</h1>
        <p className="text-muted-foreground">
          Share and discover helpful tips from the local community
          {urlLocation === "All Cities" ? " across all cities" : ` in ${urlLocation}`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <Input
            type="text"
            placeholder="Search tips..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {loaderData.validCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category as LocalTipCategory)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results and Action Button */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-muted-foreground">
          {filteredPosts.length} tip{filteredPosts.length !== 1 ? 's' : ''} found
          {urlLocation === "All Cities" ? " across all cities" : ` in ${urlLocation}`}
        </p>
        <Button onClick={() => setShowPostForm(true)} size="lg">
          Share a Tip
        </Button>
      </div>

      {/* Tips List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  <p className="text-muted-foreground mb-3 line-clamp-3">{post.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>By {post.author}</span>
                    <span>•</span>
                    <span>{post.timeAgo}</span>
                    <span>•</span>
                    <span>{post.location}</span>
                  </div>
                </div>
              </div>

              {/* Category and Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
                    {post.category}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M16.697 4.747c-1.962 0-3.19 1.28-3.697 2.01-.507-.73-1.735-2.01-3.697-2.01C6.01 4.747 4 6.757 4 9.354c0 3.61 6.31 8.36 6.58 8.56.26.19.62.19.88 0 .27-.2 6.58-4.95 6.58-8.56 0-2.597-2.01-4.607-4.343-4.607Z"/>
                    </svg>
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .338-.028-.675-.082-1.015M2.314 7.582A8.959 8.959 0 0 0 3 12c0 .338.028.675.082 1.015"/>
                    </svg>
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No tips found. Be the first to share a tip!</p>
            <Button 
              onClick={() => setShowPostForm(true)} 
              className="mt-4"
              size="lg"
            >
              Share a Tip
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Post Form Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Share a Local Tip</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Display */}
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {formErrors.submit}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <Input
                  placeholder="What's your tip about?"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className={formErrors.title ? "border-red-500" : ""}
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <div className="flex flex-wrap gap-2">
                  {VALID_LOCAL_TIP_CATEGORIES.filter(cat => cat !== "All").map((category) => (
                    <Button
                      key={category}
                      variant={newPost.category === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewPost({ ...newPost, category: category as any })}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                {formErrors.category && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  className={`w-full min-h-[120px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring ${formErrors.content ? "border-red-500" : ""}`}
                  placeholder="Share your helpful tip with the community..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
                {formErrors.content && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.content}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSubmitPost} 
                  className="flex-1"
                  disabled={isSubmitting || !newPost.title || !newPost.content}
                >
                  {isSubmitting ? "Posting..." : "Post Tip"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPostForm(false);
                    setNewPost({
                      title: "",
                      content: "",
                      category: "Visa/Immigration",
                      location: urlLocation as any
                    });
                    setFormErrors({});
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 