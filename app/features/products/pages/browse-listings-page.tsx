import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Route } from './+types/browse-listings-page';
import { ProductCard } from '../components/product-card';
import { Form, useSearchParams, useLoaderData, useRouteError, isRouteErrorResponse, useSubmit } from 'react-router';
import { Input } from '~/common/components/ui/input';
import { Button } from '~/common/components/ui/button';
import { PRODUCT_CATEGORIES } from "~/common/constants";
import { BlurFade } from 'components/magicui/blur-fade';
import { z } from "zod";

// Mock search products function (임시)
async function searchProducts(query: string, filters: any = {}) {
  const conditions = ["New", "Like New", "Good", "Fair", "Poor"] as const;
  const categories = ["Electronics", "Clothing", "Home goods", "Sports & Outdoor", "Books", "Toys and games"];
  const locations = ["Bangkok", "ChiangMai", "Phuket", "Pattaya"];
  
  return Array.from({ length: 20 }, (_, index) => ({
    id: `product-${index + 1}`,
    title: `Sample Product ${index + 1}`,
    price: Math.floor(Math.random() * 5000) + 100,
    currency: "THB",
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    images: ["/sample.png"],
    image: "/sample.png",
    priceType: Math.random() > 0.85 ? ("free" as const) : ("fixed" as const),
    sellerId: `seller-${index + 1}`,
    isSold: Math.random() > 0.8,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    seller: {
      id: `seller-${index + 1}`,
      name: `Seller ${index + 1}`,
      avatar: "/sample.png",
    },
  }));
}

// Mock fetch products by location function (임시)
async function fetchProductsByLocation(location: string, limit: number = 20) {
  const conditions = ["New", "Like New", "Good", "Fair", "Poor"] as const;
  const categories = ["Electronics", "Clothing", "Home goods", "Sports & Outdoor", "Books", "Toys and games"];
  
  return Array.from({ length: limit }, (_, index) => ({
    id: `product-${index + 1}`,
    title: `Sample Product ${index + 1}`,
    price: Math.floor(Math.random() * 5000) + 100,
    currency: "THB",
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    location: location,
    images: ["/sample.png"],
    image: "/sample.png",
    priceType: Math.random() > 0.85 ? ("free" as const) : ("fixed" as const),
    sellerId: `seller-${index + 1}`,
    isSold: Math.random() > 0.8,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    seller: {
      id: `seller-${index + 1}`,
      name: `Seller ${index + 1}`,
      avatar: "/sample.png",
    },
  }));
}

// 상품 필터 검증 스키마
const productFiltersSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  condition: z.enum(["new", "like_new", "good", "fair", "poor"]).optional(),
  priceMin: z.string().optional(),
  priceMax: z.string().optional(),
  location: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["date", "price", "title"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// 상품 목록 응답 스키마
const productListSchema = z.object({
  products: z.array(z.object({
    id: z.string(),
    title: z.string(),
    price: z.number(),
    currency: z.string(),
    condition: z.string(),
    category: z.string(),
    location: z.string(),
    images: z.array(z.string()),
    image: z.string().optional(), // 첫 번째 이미지
    priceType: z.enum(["fixed", "free", "negotiable"]).default("fixed"),
    sellerId: z.string(),
    isSold: z.boolean().default(false),
    createdAt: z.date(),
    seller: z.object({
      id: z.string(),
      name: z.string(),
      avatar: z.string().optional(),
    }),
  })),
  totalCount: z.number(),
  currentPage: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});

type ProductFilters = z.infer<typeof productFiltersSchema>;
type ProductList = z.infer<typeof productListSchema>;

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Browse Listings | Lemore" },
    { name: "description", content: "Browse listings on Lemore" },
  ];
};

// Loader 함수
export const loader = async ({ request }: { request: Request }) => {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    // URL 파라미터 검증
    const filtersValidation = productFiltersSchema.safeParse(searchParams);
    
    if (!filtersValidation.success) {
      throw new Response("Invalid search parameters", { 
        status: 400,
        statusText: filtersValidation.error.errors[0]?.message || "Invalid parameters"
      });
    }

    const filters = filtersValidation.data;

    // 실제 데이터베이스에서 상품들을 가져오기
    let products;
    if (filters.q) {
      // 검색어가 있는 경우 검색
      products = await searchProducts(filters.q, filters);
    } else if (filters.location) {
      // 위치 필터가 있는 경우
      products = await fetchProductsByLocation(filters.location, filters.limit);
    } else {
      // 기본적으로 모든 상품 (실제로는 페이지네이션 적용 필요)
      const allProducts = await searchProducts("", filters);
      products = allProducts.slice((filters.page - 1) * filters.limit, filters.page * filters.limit);
    }

    // 정렬 적용
    if (filters.sortBy === "price") {
      products.sort((a, b) => {
        const priceA = a.price;
        const priceB = b.price;
        return filters.sortOrder === "asc" ? priceA - priceB : priceB - priceA;
      });
    } else if (filters.sortBy === "date") {
      products.sort((a, b) => {
        const dateA = a.createdAt.getTime();
        const dateB = b.createdAt.getTime();
        return filters.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    const totalCount = products.length; // 실제로는 데이터베이스에서 총 개수를 가져와야 함
    const totalPages = Math.ceil(totalCount / filters.limit);
    const hasNextPage = filters.page < totalPages;
    const hasPrevPage = filters.page > 1;

    const productList: ProductList = {
      products,
      totalCount,
      currentPage: filters.page,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };

    // 응답 데이터 검증
    const responseValidation = productListSchema.safeParse(productList);
    
    if (!responseValidation.success) {
      console.error("Response validation failed:", responseValidation.error.errors);
      throw new Response("Invalid response data", { 
        status: 500,
        statusText: "Server data validation failed"
      });
    }

    return responseValidation.data;
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    
    console.error("Loader error:", error);
    throw new Response("Failed to load products", { 
      status: 500,
      statusText: "Internal server error"
    });
  }
};

// Error Boundary 컴포넌트
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">
            {error.status} {error.statusText}
          </h1>
          <p className="text-gray-600 mb-4">
            {error.data || "Something went wrong while loading the products."}
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          Unexpected Error
        </h1>
        <p className="text-gray-600 mb-4">
          An unexpected error occurred. Please try again.
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}

export default function BrowseListingsPage() {
  const [searchParams] = useSearchParams();
  const loaderData = useLoaderData() as ProductList;
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [displayedProducts, setDisplayedProducts] = useState(loaderData.products.slice(0, 20));
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(loaderData.products.length > 20);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const submit = useSubmit();

  // URL 검색 파라미터 검증
  const filtersValidation = productFiltersSchema.safeParse(Object.fromEntries(searchParams));

  // 검증된 파라미터 사용
  const filters: ProductFilters = filtersValidation.success ? filtersValidation.data : {
    page: 1,
    limit: 20,
    sortBy: "date",
    sortOrder: "desc"
  };

  // 검색어 설정
  const searchQuery = filters.q || searchInput;

  // 무한 스크롤 콜백
  const loadMoreProducts = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    
    // 시뮬레이션된 로딩 (실제로는 API 호출)
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * 20;
      const endIndex = startIndex + 20;
      const newProducts = loaderData.products.slice(startIndex, endIndex);
      
      if (newProducts.length > 0) {
        setDisplayedProducts(prev => [...prev, ...newProducts]);
        setCurrentPage(nextPage);
        setHasMore(endIndex < loaderData.products.length);
      } else {
        setHasMore(false);
      }
      
      setIsLoading(false);
    }, 500);
  }, [isLoading, hasMore, currentPage, loaderData.products]);

  // Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreProducts, hasMore, isLoading]);

  // 검색어나 필터가 변경될 때 상태 초기화
  useEffect(() => {
    setDisplayedProducts(loaderData.products.slice(0, 20));
    setCurrentPage(1);
    setHasMore(loaderData.products.length > 20);
  }, [loaderData.products]);

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (categoryName: string) => {
    setSearchInput(categoryName);
  };

  return (
    <div className="mx-auto sm:max-w-[100vw] md:max-w-[100vw] lg:max-w-[100vw] xl:max-w-[100vw]">

      {/* 메인 컨텐츠  */}
      <main className="mx-auto sm:max-w-[100vw] md:max-w-[100vw] lg:max-w-[100vw] xl:max-w-[100vw]">
        {/* 검색바 */}
          <Form className="flex items-center justify-center max-w-screen-sm mx-auto mt-1 gap-2 mb-6 focus:ring-1 focus:ring-accent">
            <Input 
              name="q" 
              type="text" 
              placeholder="Search for items" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button type="submit" variant="outline">Search</Button>
          </Form>

        {/* 검증 오류 표시 */}
        {!filtersValidation.success && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">
              Invalid search parameters: {filtersValidation.error.errors[0]?.message}
            </p>
          </div>
        )}

        {/* 카테고리 */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5 xl:space-x-6">
            {PRODUCT_CATEGORIES.slice(0, 9).map(category => (
              <div key={category} className="flex flex-col items-center min-w-[65px] cursor-pointer hover:scale-105 transition-transform">
                <div className="w-15 h-15 flex items-center justify-center rounded-full bg-purple-100 text-2xl mb-2 hover:bg-purple-200 transition-colors">
                  {category}
                </div>
                <span className="text-sm text-center">{category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 검색 결과 타이틀 */}
        <h2 className="text-3xl font-bold mb-6">
          {searchQuery ? `"${searchQuery}" Search Results` : "All Listings"}
        </h2>

        {/* 표시된 상품 수 정보 */}
        <div className="mb-4 text-sm text-gray-600 mx-auto sm:max-w-[100vw] md:max-w-[100vw]">
          Showing {displayedProducts.length} of {loaderData.totalCount} items
        </div>

        {/* 상품 카드 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-2 gap-y-10 items-start mx-auto sm:max-w-[100vw] md:max-w-[100vw]">
          {displayedProducts.map((product) => (
            <BlurFade key={product.id}>
              <ProductCard
                productId={product.id}
                image={product.image || "/sample.png"}
                title={product.title}
                price={product.price}
                currency={product.currency}
                priceType={product.priceType || "fixed"}
                seller={product.sellerId}
                isSold={product.isSold || false}
              />
            </BlurFade>
          ))}
        </div>

        {/* 로딩 인디케이터 */}
        <div ref={loadingRef} className="mt-8 text-center">
          {isLoading && (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <span className="text-gray-600">Loading more products...</span>
            </div>
          )}
          {!hasMore && displayedProducts.length > 0 && (
            <p className="text-gray-500 text-sm">No more products to load</p>
          )}
        </div>
      </main>
    </div>
  );
} 