import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Route } from './+types/browse-listings-page';
import { ProductCard } from '../components/product-card';
import { Form, useSearchParams, useSubmit, useNavigate, useLoaderData } from 'react-router';
import { Input } from '~/common/components/ui/input';
import { Button } from '~/common/components/ui/button';
import { PRODUCT_CATEGORIES, CATEGORY_ICONS } from "../constants";
import { BlurFade } from 'components/magicui/blur-fade';
import { getProductsListings } from '../queries';
import { makeSSRClient } from '~/supa-client';

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Browse Listings | Lemore" },
    { name: "description", content: "Browse listings on Lemore" },
  ];
};


export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const products = await getProductsListings(client);
  return { products };
}

export default function BrowseListingsPage({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { products } = loaderData;
  const [displayedProducts, setDisplayedProducts] = useState<any[]>(products || []);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const submit = useSubmit();
  const navigate = useNavigate();

  // Get search query from URL params
  const searchQuery = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";

  // Filter products based on search query and category
  useEffect(() => {
    if (!products) return;
    
    let filtered = products;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(product =>
        product.category_name?.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }
    
    setDisplayedProducts(filtered as any);
  }, [searchQuery, categoryFilter, products]);

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (categoryName: string) => {
    setSearchInput("");
    
    // Update URL parameters - only set category, clear search query
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("q");
    newSearchParams.set("category", categoryName);
    setSearchParams(newSearchParams);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("q", searchInput);
    // Clear category filter when manually searching
    newSearchParams.delete("category");
    setSearchParams(newSearchParams);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchInput("");
    const newSearchParams = new URLSearchParams();
    setSearchParams(newSearchParams);
  };

  // Clear specific filter
  const handleClearFilter = (filterType: 'search' | 'category') => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (filterType === 'search') {
      newSearchParams.delete("q");
      setSearchInput("");
    } else if (filterType === 'category') {
      newSearchParams.delete("category");
    }
    setSearchParams(newSearchParams);
  };

  return (
    <div className="mx-auto sm:max-w-[100vw] md:max-w-[100vw] lg:max-w-[100vw] xl:max-w-[100vw]">

      {/* 메인 컨텐츠  */}
      <main className="mx-auto sm:max-w-[100vw] md:max-w-[100vw] lg:max-w-[100vw] xl:max-w-[100vw]">
        {/* 검색바 */}
        <form onSubmit={handleSearchSubmit} className="flex items-center justify-center max-w-screen-sm mx-auto mt-1 gap-2 mb-6 focus:ring-1 focus:ring-accent">
          <Input 
            name="q" 
            type="text" 
            placeholder="Search for items" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="outline">Search</Button>
        </form>

        {/* 카테고리 */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5 xl:space-x-6">
            {PRODUCT_CATEGORIES.slice(0, 10).map(category => {
              const isActive = categoryFilter.toLowerCase() === category.toLowerCase();
              return (
                <div 
                  key={category} 
                  className={`flex flex-col items-center min-w-[65px] cursor-pointer hover:scale-105 transition-transform ${
                    isActive ? 'ring-2 ring-purple-500 ring-offset-2' : ''
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className={`w-15 h-15 flex items-center justify-center rounded-full text-2xl mb-2 transition-colors ${
                    isActive 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-purple-100 hover:bg-purple-200'
                  }`}>
                    {CATEGORY_ICONS[category] || "📦"}
                  </div>
                  <span className={`text-sm text-center ${
                    isActive ? 'font-semibold text-purple-600' : ''
                  }`}>
                    {category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 활성 필터 표시 및 해제 */}
        {(searchQuery || categoryFilter) && (
          <div className="mb-6 flex flex-wrap items-center gap-2 justify-center">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchQuery && (
              <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                <span>Search: "{searchQuery}"</span>
                <button
                  onClick={() => handleClearFilter('search')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </div>
            )}
            {categoryFilter && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span>Category: {categoryFilter}</span>
                <button
                  onClick={() => handleClearFilter('category')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            )}
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* 검색 결과 타이틀 */}
        <h2 className="text-3xl font-bold mb-6">
          {searchQuery ? `"${searchQuery}" Search Results` : categoryFilter ? `${categoryFilter} Category` : "All Listings"}
        </h2>

        {/* 표시된 상품 수 정보 */}
        <div className="mb-4 text-sm text-gray-600 mx-auto sm:max-w-[100vw] md:max-w-[100vw]">
          Showing {displayedProducts.length} of {products?.length || 0} items
        </div>

        {/* 상품 카드 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-2 gap-y-10 items-start mx-auto sm:max-w-[100vw] md:max-w-[100vw]">
          {displayedProducts && displayedProducts.length > 0 ? (
            displayedProducts.map((product: any) => (
              <BlurFade key={product.product_id}>
                <ProductCard
                  productId={product.product_id}
                  image={product.primary_image?.startsWith('/') ? product.primary_image : `/toy1.png`}
                  title={product.title || "No title"}
                  price={product.price}
                  currency={product.currency || "THB"}
                  priceType={product.price_type || "fixed"}
                  seller={product.seller_name}
                  is_sold={product.is_sold || false}
                  category={product.category_name || "electronics"}
                />
              </BlurFade>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p>No products found</p>
            </div>
          )}
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