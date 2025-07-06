import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Route } from './+types/browse-listings-page';
import { ProductCard } from '../components/product-card';
import { Form, useSearchParams, useSubmit } from 'react-router';
import { Input } from '~/common/components/ui/input';
import { Button } from '~/common/components/ui/button';
import { PRODUCT_CATEGORIES, CATEGORY_ICONS } from "../constants";
import { BlurFade } from 'components/magicui/blur-fade';

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Browse Listings | Lemore" },
    { name: "description", content: "Browse listings on Lemore" },
  ];
};

// Mock data for products
const mockProducts = [
  {
    id: "1",
    title: "Vintage Denim Jacket",
    price: 45,
    currency: "USD",
    priceType: "fixed" as const,
    image: "/sample.png",
    sellerId: "seller1",
    isSold: false,
  },
  {
    id: "2",
    title: "iPhone 12 Pro",
    price: 650,
    currency: "USD",
    priceType: "negotiable" as const,
    image: "/sample.png",
    sellerId: "seller2",
    isSold: false,
  },
  {
    id: "3",
    title: "Nike Air Max 270",
    price: 120,
    currency: "USD",
    priceType: "fixed" as const,
    image: "/sample.png",
    sellerId: "seller3",
    isSold: true,
  },
  {
    id: "4",
    title: "MacBook Air M1",
    price: 800,
    currency: "USD",
    priceType: "negotiable" as const,
    image: "/sample.png",
    sellerId: "seller4",
    isSold: false,
  },
  {
    id: "5",
    title: "Sony WH-1000XM4 Headphones",
    price: 250,
    currency: "USD",
    priceType: "fixed" as const,
    image: "/sample.png",
    sellerId: "seller5",
    isSold: false,
  },
  {
    id: "6",
    title: "Levi's 501 Jeans",
    price: 35,
    currency: "USD",
    priceType: "fixed" as const,
    image: "/sample.png",
    sellerId: "seller6",
    isSold: false,
  },
  {
    id: "7",
    title: "iPad Air 4th Gen",
    price: 450,
    currency: "USD",
    priceType: "negotiable" as const,
    image: "/sample.png",
    sellerId: "seller7",
    isSold: false,
  },
  {
    id: "8",
    title: "Adidas Ultraboost 21",
    price: 180,
    currency: "USD",
    priceType: "fixed" as const,
    image: "/sample.png",
    sellerId: "seller8",
    isSold: false,
  },
];

export default function BrowseListingsPage() {
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [displayedProducts, setDisplayedProducts] = useState(mockProducts);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const submit = useSubmit();

  // Get search query from URL params
  const searchQuery = searchParams.get("q") || "";

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = mockProducts.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDisplayedProducts(filtered);
    } else {
      setDisplayedProducts(mockProducts);
    }
  }, [searchQuery]);

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (categoryName: string) => {
    setSearchInput(categoryName);
    // Filter products by category
    const filtered = mockProducts.filter(product =>
      product.title.toLowerCase().includes(categoryName.toLowerCase())
    );
    setDisplayedProducts(filtered);
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

        {/* 카테고리 */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5 xl:space-x-6">
            {PRODUCT_CATEGORIES.slice(0, 9).map(category => (
              <div key={category} className="flex flex-col items-center min-w-[65px] cursor-pointer hover:scale-105 transition-transform">
                <div className="w-15 h-15 flex items-center justify-center rounded-full bg-purple-100 text-2xl mb-2 hover:bg-purple-200 transition-colors">
                  {CATEGORY_ICONS[category] || "📦"}
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
          Showing {displayedProducts.length} of {mockProducts.length} items
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