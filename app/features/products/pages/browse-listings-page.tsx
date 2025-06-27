import React, { useState } from "react";
import type { Route } from './+types/browse-listings-page';
import { RadioGroup, RadioGroupItem } from "~/common/components/ui/radio-group";
import { ProductCard } from '../components/product-card';
import { Form, useSearchParams, useLoaderData, useRouteError, isRouteErrorResponse, useSubmit } from 'react-router';
import { Input } from '~/common/components/ui/input';
import { Button } from '~/common/components/ui/button';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '~/common/components/ui/pagination';
import { productFiltersSchema, productListSchema, type ProductFilters, type ProductList } from "~/lib/schemas";
import { PRODUCT_CATEGORIES } from "../categories";

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

    // 실제 API 호출 대신 목업 데이터 생성
    const conditions = ["New", "Like New", "Good", "Fair", "Poor"] as const;
    const mockProducts = Array.from({ length: filters.limit }, (_, index) => ({
      id: `${filters.page}-${index + 1}`,
      title: filters.q ? `${filters.q} item ${index + 1}` : `Product ${index + 1}`,
      price: `THB ${Math.floor(Math.random() * 5000) + 100}`,
      description: `This is a sample product description for item ${index + 1}. It's in good condition and ready for sale.`,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      category: filters.category || "Electronics",
      location: filters.location || "Bangkok",
      image: "/sample.png",
      sellerId: `seller-${index + 1}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 최근 30일 내
      updatedAt: new Date(),
    }));

    const totalCount = 100; // 목업 총 개수
    const totalPages = Math.ceil(totalCount / filters.limit);
    const hasNextPage = filters.page < totalPages;
    const hasPrevPage = filters.page > 1;

    const productList: ProductList = {
      products: mockProducts,
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

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (categoryName: string) => {
    setSearchInput(categoryName);
  };

  // 페이지네이션 핸들러
  const handlePageChange = (page: number) => {
    const formData = new FormData();
    formData.append('page', page.toString());
    
    // 기존 필터들 유지
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'page') {
        formData.append(key, value.toString());
      }
    });
    
    submit(formData);
  };

  return (
    <div className="flex flex-col md:flex-row">

      {/* 메인 컨텐츠 */}
      <main className="flex-1 p-8">
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
            {PRODUCT_CATEGORIES.slice(0, 9).map((cat, index) => (
              <div 
                key={cat.name} 
                className={`
                  flex flex-col items-center min-w-[65px] cursor-pointer hover:scale-105 transition-transform
                  ${index >= 4 ? 'hidden md:flex' : ''}
                `}
                onClick={() => handleCategoryClick(cat.name)}
              >
                <div className="w-15 h-15 flex items-center justify-center rounded-full bg-purple-100 text-2xl mb-2 hover:bg-purple-200 transition-colors">
                  {cat.icon}
                </div>
                <span className="text-sm text-center">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 검색 결과 타이틀 */}
        <h2 className="text-3xl font-bold mb-6">
          {searchQuery ? `"${searchQuery}" Search Results` : "All Listings"}
        </h2>

        {/* 페이지네이션 정보 */}
        <div className="mb-4 text-sm text-gray-600">
          Page {loaderData.currentPage} of {loaderData.totalPages} (showing {loaderData.products.length} of {loaderData.totalCount} items)
        </div>

        {/* 상품 카드 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loaderData.products.map((product) => (
            <ProductCard
              key={product.id}
              productId={product.id}
              image={product.image || "/sample.png"}
              title={product.title}
              price={product.price}
            />
          ))}
        </div>

        {/* 페이지네이션 */}
        {(loaderData.hasNextPage || loaderData.hasPrevPage) && (
          <Pagination className="mt-8">
            <PaginationContent>
              {loaderData.hasPrevPage && (
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(loaderData.currentPage - 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}
              
              {/* 페이지 번호들 */}
              {Array.from({ length: Math.min(5, loaderData.totalPages) }, (_, i) => {
                let pageNum;
                if (loaderData.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (loaderData.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (loaderData.currentPage >= loaderData.totalPages - 2) {
                  pageNum = loaderData.totalPages - 4 + i;
                } else {
                  pageNum = loaderData.currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink 
                      onClick={() => handlePageChange(pageNum)}
                      isActive={pageNum === loaderData.currentPage}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {loaderData.hasNextPage && (
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(loaderData.currentPage + 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        )}
      </main>
    </div>
  );
} 