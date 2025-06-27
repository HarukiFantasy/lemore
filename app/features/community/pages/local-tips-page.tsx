import { useState, useEffect } from "react";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Separator } from "../../../common/components/ui/separator";
import type { Route } from './+types/local-tips-page';
import { useSearchParams } from "react-router";

// 데이터베이스에서 가져올 포스트 타입 정의
interface LocalTipPost {
  id: number;
  title: string;
  content: string;
  category: string;
  location: string;
  author: string;
  createdAt: Date;
  likes: number;
  comments: number;
}

// 데이터베이스 연결 함수 (실제 구현 시 데이터베이스 클라이언트로 교체)
async function fetchLocalTipsFromDatabase(filters: {
  category: string;
  location: string;
  search: string;
}): Promise<LocalTipPost[]> {
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
function buildDatabaseFilters(validatedCategory: string, validatedLocation: string, validatedSearch: string) {
  const filters: any = {};
  
  if (validatedCategory !== "All") {
    filters.category = validatedCategory;
  }
  
  // "All Cities"가 아닐 때만 location 필터 적용
  if (validatedLocation !== "All Cities") {
    filters.location = validatedLocation;
  }
  
  if (validatedSearch) {
    filters.search = validatedSearch;
  }
  
  return filters;
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category") || undefined;
    const location = url.searchParams.get("location") || undefined;
    const search = url.searchParams.get("search") || undefined;

    // 데이터 검증
    const validatedCategory = validateCategory(category);
    const validatedLocation = validateLocation(location);
    const validatedSearch = validateSearchQuery(search);

    // 데이터베이스에서 포스트 가져오기
    const databaseFilters = buildDatabaseFilters(validatedCategory, validatedLocation, validatedSearch);
    const posts = await fetchLocalTipsFromDatabase(databaseFilters);

    // 클라이언트에서 사용할 포스트 데이터 변환
    const transformedPosts = posts.map(post => ({
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
      filters: {
        category: validatedCategory,
        location: validatedLocation,
        search: validatedSearch
      },
      totalCount: transformedPosts.length,
      validCategories: VALID_CATEGORIES
    };

  } catch (error) {
    // 에러 처리
    console.error("Loader error:", error);
    
    if (error instanceof Error) {
      // 검증 에러인 경우 400 Bad Request 반환
      if (error.message.includes("Invalid category") || 
          error.message.includes("Invalid location") || 
          error.message.includes("Search query is too long")) {
        throw new Response(error.message, { status: 400 });
      }
      
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
  let message = "Something went wrong";
  let details = "An unexpected error occurred while loading local tips.";

  if (error instanceof Response) {
    if (error.status === 400) {
      message = "Invalid Request";
      details = error.statusText || "The request contains invalid parameters.";
    } else if (error.status === 500) {
      message = "Server Error";
      details = "An internal server error occurred. Please try again later.";
    }
  } else if (error instanceof Error) {
    details = error.message;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">{message}</h1>
            <p className="text-gray-600 mb-6">{details}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LocalTipsPage({ loaderData }: Route.ComponentProps) {
  const { posts, filters, totalCount, validCategories } = loaderData;
  
  // URL의 location 파라미터를 우선적으로 사용
  const [searchParams, setSearchParams] = useSearchParams();
  const urlLocation = searchParams.get("location");
  
  const [selectedCategory, setSelectedCategory] = useState(filters.category);
  const [searchQuery, setSearchQuery] = useState(filters.search);

  // 필터 변경 시 URL 업데이트를 위한 함수
  const updateFilters = (newCategory: string, newSearch: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (newCategory && newCategory !== "All") {
      newSearchParams.set("category", newCategory);
    } else {
      newSearchParams.delete("category");
    }
    
    if (newSearch) {
      newSearchParams.set("search", newSearch);
    } else {
      newSearchParams.delete("search");
    }
    
    setSearchParams(newSearchParams);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateFilters(category, searchQuery);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    updateFilters(selectedCategory, search);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Local Tips for Expats</h1>
          <p className="text-gray-600">
            Share and discover useful information for living in {urlLocation === "All Cities" ? "Thailand" : urlLocation || "Thailand"}
          </p>
        </div>

        {/* Filter and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                placeholder="Search by title or content..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="max-w-md"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {validCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Statistics */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Total <span className="font-semibold text-blue-600">{totalCount}</span> posts
            {urlLocation && urlLocation !== "All Cities" && (
              <span className="ml-2 text-gray-500">in {urlLocation}</span>
            )}
            {urlLocation === "All Cities" && (
              <span className="ml-2 text-gray-500">across all cities</span>
            )}
          </p>
        </div>

        {/* Post List */}
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{post.content}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {post.location}
                      </span>
                      <span>By: {post.author}</span>
                      <span>{post.timeAgo}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span>👍 {post.likes}</span>
                      <span>💬 {post.comments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">
                  No posts found matching your search criteria.
                  {urlLocation && (
                    <span className="block mt-2 text-sm">Try changing the location in the navigation bar above.</span>
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Create New Post Button */}
        <div className="mt-8 text-center">
          <Button size="lg" className="px-8">
            Create New Post
          </Button>
        </div>
      </div>
    </div>
  );
} 