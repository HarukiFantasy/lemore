import { Link, useSearchParams } from "react-router";
import { Input } from "../components/ui/input";
import type { Route } from "../../+types/root";
import { Button } from '../components/ui/button';
import { ProductCard } from "../../features/products/components/product-card";
import { useLoaderData } from "react-router";
import { BlurFade } from 'components/magicui/blur-fade';
import { makeSSRClient } from '~/supa-client';
import { getProductsListings, getUserLikedProducts } from '../../features/products/queries';
import { getUserSalesStatsByProfileId } from "~/features/users/queries";
import { getCountryByLocation, COUNTRY_CONFIG } from "~/constants";
import { Tabs, TabsList, TabsTrigger } from '~/common/components/ui/tabs';
import { PRODUCT_CATEGORIES, CATEGORY_ICONS } from "../../features/products/constants";
import { useState, useEffect } from "react";
import React from "react";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Home | Lemore" },
    { name: "description", content: "Welcome to Lemore" },
    { name: "og:image", content: "/lemore-logo.png" },
  ];
};  

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const url = new URL(request.url);
  const location = url.searchParams.get("location");
  
  // Execute all queries in parallel
  const [authResult, productsResult] = await Promise.all([
    // Get user authentication
    client.auth.getUser().catch(() => ({ data: { user: null } })),
    // Get all products (not limited to 20)
    getProductsListings(client)
  ]);

  const user = authResult.data.user;
  
  // Get seller stats for all unique sellers
  const sellerIds = [...new Set(productsResult.map((p: any) => p.seller_id))];
  const sellerStatsPromises = sellerIds.map(async (sellerId: string) => {
    const stats = await getUserSalesStatsByProfileId(client, sellerId);
    return { sellerId, stats };
  });
  const sellerStatsResults = await Promise.all(sellerStatsPromises);
  const sellerStatsMap = new Map();
  sellerStatsResults.forEach(({ sellerId, stats }) => {
    if (stats) {
      sellerStatsMap.set(sellerId, {
        totalListings: stats.total_listings,
        totalLikes: stats.total_likes,
        totalSold: stats.sold_items,
        sellerJoinedAt: 'N/A' // Will be set from product.seller_joined_at
      });
    }
  });
  
  // Add seller stats to products
  const allProducts = productsResult.map((product: any) => {
    const stats = sellerStatsMap.get(product.seller_id);
    if (stats && product.seller_joined_at) {
      stats.sellerJoinedAt = new Date(product.seller_joined_at).toLocaleDateString();
    }
    return {
      ...product,
      sellerStats: stats || null
    };
  });

  // If user is authenticated, fetch user-specific data in parallel
  let userLikedProducts: number[] = [];

  if (user) {
    userLikedProducts = await getUserLikedProducts(client, user.id).catch((error) => {
      console.error('Error fetching user liked products:', error);
      return [];
    });
  }

  // Filter products by location if specified
  let filteredProducts = allProducts;
  if (location && location !== "All Locations" && location !== "Other Cities") {
    filteredProducts = allProducts.filter((product: any) => product.location === location);
  }
  
  return { 
    allProducts: filteredProducts, 
    userLikedProducts, 
    user,
    location 
  };
};

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { allProducts, userLikedProducts, user } = useLoaderData() as {
    allProducts: any[];
    userLikedProducts: number[];
    user: any;
  };
  
  // Add custom styles for animations
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
    `;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [displayedProducts, setDisplayedProducts] = useState<any[]>(allProducts || []);
  const [tabValue, setTabValue] = useState<'all' | 'onSale' | 'sold'>('all');
  
  const urlLocation = searchParams.get("location");
  const currentLocation = urlLocation || COUNTRY_CONFIG.Thailand.defaultCity;
  const currentCountry = urlLocation ? getCountryByLocation(urlLocation as any) : "Thailand";
  const searchQuery = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";

  // Filter products based on search query, category, and sale status
  useEffect(() => {
    if (!allProducts) return;
    let filtered = allProducts;
    
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
  }, [searchQuery, categoryFilter, allProducts, tabValue]);

  // Handle category click
  const handleCategoryClick = (categoryName: string) => {
    setSearchInput("");
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
    newSearchParams.delete("category");
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

  // Clear all filters
  const handleClearFilters = () => {
    setSearchInput("");
    const newSearchParams = new URLSearchParams();
    if (urlLocation) {
      newSearchParams.set("location", urlLocation);
    }
    setSearchParams(newSearchParams);
  };

  return (
    <div className="w-full">
      {/* Hero Search Section with Background Image */}
      <div className="relative overflow-hidden px-6 py-8 md:py-12">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/searchbar_bg2.png" 
            alt="Search Background" 
            className="w-full h-full object-cover opacity-70"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/30 to-white/50"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          
          {/* Main Heading */}
          <h1 className="text-3xl md:text-5xl font-medium text-stone-800 leading-tight tracking-tight">
            Buy Less, Share More,<br />
            Live Lighter
          </h1>
          
          {/* Enhanced Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto mt-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-full shadow-lg border-2 border-stone-200 group-focus-within:border-purple-400 transition-colors duration-200">
                <Input 
                  name="q" 
                  type="text" 
                  placeholder="What treasure are you looking for?" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="border-0 rounded-full pl-12 pr-24 py-6 text-base bg-transparent focus:ring-0 focus:border-0 placeholder:text-sm md:placeholder:text-base"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Button 
                  type="submit" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-6 py-2 bg-stone-800 hover:bg-stone-700 text-white transition-colors"
                >
                  Search
                </Button>
              </div>
            </div>
            {/* Pass current location as hidden input */}
            {urlLocation && (
              <input type="hidden" name="location" value={urlLocation} />
            )}
          </form>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-stone-600">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>{displayedProducts.filter(p => !p.is_sold).length} items available</span>
            </div>
            <span className="text-stone-300">•</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>{displayedProducts.length} total listings</span>
            </div>
            <span className="text-stone-300">•</span>
            <Link to="/secondhand/submit-a-listing" className="text-stone-600 hover:text-stone-800 transition-colors font-medium">
              List an Item →
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Section - Compact */}
      <div className="py-6 -mt-1">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="flex space-x-2 md:space-x-3 overflow-x-auto pb-2">
              {PRODUCT_CATEGORIES.slice(0, 10).map((category, index) => {
                const isActive = categoryFilter.toLowerCase() === category.toLowerCase();
                const isHiddenOnMobile = index >= 7; // Hide from 8th item on mobile
                return (
                  <div 
                    key={category} 
                    className={`flex flex-col items-center min-w-[60px] cursor-pointer hover:scale-105 transition-transform ${
                      isHiddenOnMobile ? 'hidden md:flex' : ''
                    }`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-lg md:text-xl mb-1 transition-colors ${
                      isActive 
                        ? 'bg-purple-200 text-purple-700' 
                        : 'bg-white hover:bg-purple-100 shadow-sm'
                    }`}>
                      {CATEGORY_ICONS[category] || "📦"}
                    </div>
                    <span className={`text-xs text-center leading-tight ${
                      isActive ? 'font-semibold text-purple-600' : 'text-stone-600'
                    }`}>
                      {category}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 md:px-12 py-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Active Filters */}
          {(searchQuery || categoryFilter) && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
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

          {/* Section Header with Tabs */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-stone-800 mb-2 tracking-tight">
                All Treasures{!urlLocation ? "" : ` in ${currentLocation}`}
              </h2>
            </div>
            
            {/* Tabs */}
            <Tabs value={tabValue} onValueChange={(val) => setTabValue(val as 'all' | 'onSale' | 'sold')}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="onSale">On Sale</TabsTrigger>
                <TabsTrigger value="sold">Sold</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayedProducts && displayedProducts.length > 0 ? (
              displayedProducts.map((product: any, index: number) => (
                <BlurFade key={product.product_id} delay={Math.min(index * 0.05, 0.3)}>
                  <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-lg">
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
                      category={product.category_name || "Other"}
                      likes={product.likes_count || 0}
                      sellerStats={product.sellerStats}
                      isLikedByUser={userLikedProducts?.includes(product.product_id) || false}
                      currentUserId={user?.id}
                    />
                  </div>
                </BlurFade>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="inline-flex flex-col items-center space-y-4">
                  <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-stone-600 mb-2">No items found</p>
                    <Link 
                      to="/secondhand/submit-a-listing"
                      className="text-sm text-stone-800 font-medium hover:underline"
                    >
                      Be the first to list →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mission Statement with Featured Products */}
      <div className="mt-12 md:mt-20 mb-12 md:mb-20 bg-gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="relative overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Text Content - Keep Original */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-stone-800 leading-tight tracking-tight">
                    Let go,<br />
                    share more,<br />
                    <span className="text-stone-600 font-medium">live lighter.</span>
                  </h2>
                  <p className="text-base md:text-lg text-stone-600 leading-relaxed font-normal">
                    Lemore helps people declutter mindfully, connect meaningfully, and create joy through conscious sharing.
                  </p>
                </div>
                
                {/* Feature Pills */}
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-stone-200">
                    <span className="text-sm text-stone-700">✨ AI-Powered Guidance</span>
                  </div>
                  <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-stone-200">
                    <span className="text-sm text-stone-700">🌱 Sustainable Living</span>
                  </div>
                  <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-stone-200">
                    <span className="text-sm text-stone-700">💚 Community First</span>
                  </div>
                </div>
                
                {/* CTA Button */}
                <div className="pt-4">
                  <Link 
                    to="/let-go-buddy"
                    className="inline-flex items-center px-6 py-3 bg-stone-800 text-white rounded-full hover:bg-stone-700 transition-colors text-sm md:text-base font-medium"
                  >
                    Start Your Journey
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
              

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}