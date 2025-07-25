import React, { useState, useEffect, useRef } from "react";
import type { Route } from './+types/browse-listings-page';
import { ProductCard } from '../components/product-card';
import { useSearchParams, useSubmit, useNavigate } from 'react-router';
import { Input } from '~/common/components/ui/input';
import { Button } from '~/common/components/ui/button';
import { PRODUCT_CATEGORIES, CATEGORY_ICONS } from "../constants";
import { BlurFade } from 'components/magicui/blur-fade';
import { getProductsWithSellerStats, getUserLikedProducts } from '../queries';
import { makeSSRClient } from '~/supa-client';
import { getUserStats } from '~/features/users/queries';
import { Tabs, TabsList, TabsTrigger } from '~/common/components/ui/tabs';

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Browse Listings | Lemore" },
    { name: "description", content: "Browse listings on Lemore" },
  ];
};


export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const url = new URL(request.url);
  const location = url.searchParams.get("location");
  
  const products = await getProductsWithSellerStats(client);
  
  // 사용자 인증 정보 가져오기
  const { data: { user } } = await client.auth.getUser();
  let userLikedProducts: number[] = [];
  
  // 로그인한 사용자의 좋아요 목록 가져오기
  if (user) {
    try {
      userLikedProducts = await getUserLikedProducts(client, user.id);
    } catch (error) {
      console.error('Error fetching user liked products:', error);
    }
  }
  
  // Location filtering
  let filteredProducts = products;
  if (location && location !== "All Locations" && location !== "Other Cities") {
    filteredProducts = products.filter((product: any) => product.location === location);
  }
  
  
  return { 
    products: filteredProducts, 
    location,
    userLikedProducts,
    user
  };
}

export default function BrowseListingsPage({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { products, userLikedProducts, user } = loaderData;
  const [displayedProducts, setDisplayedProducts] = useState<any[]>(products || []);
  const [hasMore, setHasMore] = useState(true);
  const [tabValue, setTabValue] = useState<'all' | 'onSale' | 'sold'>('all');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const submit = useSubmit();
  const navigate = useNavigate();

  // Get search query from URL params
  const searchQuery = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";
  const urlLocation = searchParams.get("location");
  const currentLocation = urlLocation || "Bangkok";

  // Filter products based on search query, category, 판매중 여부
  useEffect(() => {
    if (!products) return;
    let filtered = products;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((product: any) =>
        product.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter((product: any) =>
        product.category_name?.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }
    
    // Apply on sale filter
    if (tabValue === 'onSale') {
      filtered = filtered.filter((product: any) => product.is_sold === false);
    } else if (tabValue === 'sold') {
      filtered = filtered.filter((product: any) => product.is_sold === true);
    }
    
    setDisplayedProducts(filtered as any);
  }, [searchQuery, categoryFilter, products, tabValue]);

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
    <div className="mx-auto sm:max-w-[100vw] md:max-w-[100vw] lg:max-w-[100vw] xl:max-w-[100vw] px-5">

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
            {PRODUCT_CATEGORIES.slice(0, 10).map((category, index) => {
              const isActive = categoryFilter.toLowerCase() === category.toLowerCase();
              const isHiddenOnMobile = index >= 6; // 7번째부터 모바일에서 숨김
              return (
                <div 
                  key={category} 
                  className={`flex flex-col items-center min-w-[50px] md:min-w-[65px] cursor-pointer hover:scale-105 transition-transform ${
                    isHiddenOnMobile ? 'hidden md:flex' : ''
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className={`w-9 h-9 md:w-14 md:h-14 flex items-center justify-center rounded-full text-base md:text-xl mb-1 md:mb-2 transition-colors ${
                    isActive 
                      ? 'bg-purple-200 text-purple-700' 
                      : 'bg-purple-100 hover:bg-purple-200'
                  }`}>
                    {CATEGORY_ICONS[category] || "📦"}
                  </div>
                  <span className={`text-xs md:text-sm text-center leading-tight ${
                    isActive ? 'font-semibold text-purple-600' : ''
                  }`}>
                    {category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        {/* 검색 결과 타이틀 */}
        <h2 className="text-3xl font-bold mb-2">
          All Listings{!urlLocation ? "" : ` in ${currentLocation}`}
        </h2>
        {/* Tabs + 결과수 */}
        <div className="flex items-center gap-4 mb-6">
          <Tabs value={tabValue} onValueChange={(val) => setTabValue(val as 'all' | 'onSale' | 'sold')}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="onSale">On Sale</TabsTrigger>
              <TabsTrigger value="sold">Sold</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="text-sm text-gray-600 ml-2">
            Showing {displayedProducts.length} of {products?.length || 0} items
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
              <div className="flex items-center gap-1 bg-gray-200/70 text-gray-700 px-3 py-1 rounded-full text-sm">
                <span>Category: {categoryFilter}</span>
                <button
                  onClick={() => handleClearFilter('category')}
                  className="ml-1 text-gray-700 hover:text-gray-800"
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
        {/* 표시된 상품 수 정보 */}
        {/* 상품 카드 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-2 gap-y-10 items-start mx-auto sm:max-w-[100vw] md:max-w-[100vw]">
          {displayedProducts && displayedProducts.length > 0 ? (
            displayedProducts.map((product: any) => (
              <BlurFade key={product.product_id}>
                <ProductCard
                  productId={product.product_id}
                  image={product.primary_image || `/no_image.png`}
                  title={product.title || "No title"}
                  price={product.price}
                  currency={product.currency || "THB"}
                  priceType={product.price_type || "fixed"}
                  sellerId={product.seller_id}
                  sellerName={product.seller_name}
                  is_sold={product.is_sold}
                  showSoldBadge={true}
                  category={product.category_name || "electronics"}
                  likes={product.likes_count || 0}
                  sellerStats={{
                    totalListings: product.total_listings,
                    totalLikes: product.total_likes,
                    totalSold: product.total_sold,
                    level: product.seller_level, // 수정: level로 전달
                    sellerJoinedAt: new Date(product.seller_joined_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                  }}
                  isLikedByUser={userLikedProducts?.includes(product.product_id) || false}
                  currentUserId={user?.id}
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