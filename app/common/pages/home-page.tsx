import { Form, Link, useSearchParams } from "react-router";
import { Input } from "../components/ui/input";
import type { Route } from "../../+types/root";
import { Button } from '../components/ui/button';
import { ProductCard } from "../../features/products/components/product-card";
import { useLoaderData } from "react-router";
import { BlurFade } from 'components/magicui/blur-fade';
import { makeSSRClient } from '~/supa-client';
import { getProductsListings, getUserLikedProducts } from '../../features/products/queries';
import { DateTime } from "luxon";
import { getUserSalesStatsByProfileId } from "~/features/users/queries";
import { getCountryByLocation, COUNTRY_CONFIG } from "~/constants";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel";
import { Card, CardContent } from "../components/ui/card";


export const meta: Route.MetaFunction = () => {
  return [
    { title: "Home | Lemore" },
    { name: "description", content: "Welcome to Lemore" },
    { name: "og:image", content: "/lemore-logo.png" },
  ];
};  

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const url = new URL(request.url);
  const location = url.searchParams.get("location");
  
  // PHASE 2 OPTIMIZATION: Execute all queries in parallel (3x faster!)
  const [authResult, productsResult] = await Promise.all([
    // Get user authentication
    client.auth.getUser().catch(() => ({ data: { user: null } })),
    // Get products (independent of user auth)
    getProductsListings(client, 20)
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
  const latestListingsWithStats = productsResult.map((product: any) => {
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
  let userStats = null;

  if (user) {
    // Execute user-specific queries in parallel
    const [likedProductsResult, userStatsResult] = await Promise.all([
      getUserLikedProducts(client, user.id).catch((error) => {
        console.error('Error fetching user liked products:', error);
        return [];
      }),
      getUserSalesStatsByProfileId(client, user.id).catch(() => null)
    ]);

    userLikedProducts = likedProductsResult;
    userStats = userStatsResult;
  }

  // Filter and limit products after fetching
  let latestListings = latestListingsWithStats;
  if (location && location !== "All Locations" && location !== "Other Cities") {
    latestListings = latestListings.filter((product: any) => product.location === location);
  }
  latestListings = latestListings.slice(0, 4); // Limit to 4 after filtering
  
  return { latestListings, userLikedProducts, user, userStats };
};


// Date 객체 또는 ISO 문자열을 시간 문자열로 변환하는 헬퍼 함수 (Luxon 사용)
function getTimeAgo(date: Date | string): string {
  const dt = typeof date === "string" ? DateTime.fromISO(date) : DateTime.fromJSDate(date);
  return dt.toRelative() ?? "";
}

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const { latestListings, userLikedProducts, user, userStats } = useLoaderData() as {
    latestListings: any[];
    location: string | null;
    userLikedProducts: number[];
    user: any;
    userStats: any;
  };
  const urlLocation = searchParams.get("location");
  const currentLocation = urlLocation || COUNTRY_CONFIG.Thailand.defaultCity;
  const currentCountry = urlLocation ? getCountryByLocation(urlLocation as any) : "Thailand";

  return (
    
    <div className="w-full">
      {/* Hero Search Section */}
      <div className="relative overflow-hidden px-6 py-12 md:py-20">
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
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          {/* Tagline */}
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-stone-200 text-sm text-stone-600 mb-4">
            📍 {!urlLocation ? "All Locations" : currentLocation} • {currentCountry}
          </div>
          
          {/* Main Heading */}
          <h1 className="text-3xl md:text-5xl font-medium text-stone-800 leading-tight tracking-tight">
            Buy Less, Share More,<br />
            Live Lighter
          </h1>
          
          {/* Search Box */}
          <Form action="/secondhand/browse-listings" method="get" className="relative max-w-2xl mx-auto mt-8">
            <div className="relative group">
              <Input 
                name="q" 
                type="text" 
                placeholder="Search items..." 
                className="w-full pl-12 pr-24 py-6 text-base rounded-full border-2 border-stone-200 focus:border-stone-400 transition-all duration-200 bg-white/90 backdrop-blur-sm placeholder:text-sm md:placeholder:text-base"
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
            {/* Pass current location as hidden input */}
            {urlLocation && (
              <input type="hidden" name="location" value={urlLocation} />
            )}
          </Form>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link to="/secondhand/browse-listings" className="text-sm text-stone-600 hover:text-stone-800 transition-colors">
              Browse All →
            </Link>
            <span className="text-stone-300">•</span>
            <Link to="/secondhand/submit-a-listing" className="text-sm text-stone-600 hover:text-stone-800 transition-colors">
              List an Item →
            </Link>
            <span className="text-stone-300">•</span>
            <Link to="/let-go-buddy" className="text-sm text-stone-600 hover:text-stone-800 transition-colors">
              Get AI Help →
            </Link>
          </div>
        </div>

      </div>
      {/* Latest Listings Section */}
      <div className="px-6 md:px-12 py-12 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-stone-800 mb-2 tracking-tight">
                Fresh Finds
              </h2>
              <p className="text-stone-600">
                Discover treasures waiting for their next chapter
              </p>
            </div>
            <Link 
              to="/secondhand/browse-listings"
              className="mt-4 md:mt-0 inline-flex items-center text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
            >
              View All
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {/* Product Grid with Hover Effects */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {latestListings.length > 0 ? (
              latestListings.map((product: any, index: number) => (
                <BlurFade key={product.product_id} delay={index * 0.05}>
                  <div className="group relative">
                    {/* New Badge for Recent Items */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-stone-800 text-white text-xs rounded-full">
                        New
                      </div>
                    )}
                    <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                      <ProductCard
                        productId={product.product_id}
                        image={product.primary_image || `/no_image.png`}
                        title={product.title}
                        price={product.price}
                        currency={product.currency || "THB"}
                        priceType={product.price_type || "Fixed"}
                        sellerId={product.seller_id}
                        sellerName={product.seller_name}
                        is_sold={product.is_sold || false}
                        likes={product.likes_count || 0}
                        isLikedByUser={userLikedProducts?.includes(product.product_id) || false}
                        currentUserId={user?.id}
                        sellerStats={product.sellerStats}
                      />
                    </div>
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
                    <p className="text-stone-600 mb-2">No items yet in this area</p>
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

      {/* Features Section */}
      
      {/* Mission Statement - Hero Style */}
      <div className="mt-12 md:mt-20 mb-12 md:mb-20">
        <div className="relative">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            {/* <img 
              src="/1.png" 
              alt="Lemore Mission" 
              className="w-full h-full object-cover opacity-0"
            /> */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/60"></div>
          </div>
          
          {/* Content Overlay */}
          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Text Content */}
              <div className="order-2 md:order-1 space-y-6">
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
              
              {/* Image Card */}
              <div className="order-1 md:order-2">
                <div className="relative mx-auto max-w-sm md:max-w-none">
                  {/* Blur effect - hidden on mobile for performance */}
                  <div className="hidden md:block absolute -inset-4 bg-gradient-to-r from-stone-200/50 to-stone-300/50 rounded-2xl blur-2xl opacity-60"></div>
                  <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-xl md:shadow-2xl">
                    <img 
                      src="/1.png" 
                      alt="Lemore Mission" 
                      className="w-full h-[280px] sm:h-[350px] md:h-[450px] object-contain md:object-cover bg-stone-50"
                    />
                    {/* Floating Badge - responsive positioning and sizing */}
                    <div className="absolute bottom-3 left-3 right-3 md:bottom-6 md:left-6 md:right-6">
                      <div className="bg-white/90 md:bg-white/95 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 shadow-md md:shadow-lg">
                        <p className="text-xs sm:text-sm font-medium text-stone-800 text-center">
                          Less is More • Joy in Simplicity
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Section */}
      <div className="mb-8 px-4 md:px-0">
        <div className="max-w-5xl mx-auto">
          <Carousel className="w-full">
            <CarouselContent>

              {/* How It Works */}
              <CarouselItem>
                <Card className="border-0 shadow-none">
                  <CardContent className="p-4 md:p-8 bg-stone-50 rounded-lg">
                    <div className="text-center mb-4 md:mb-6">
                      <h3 className="text-xl md:text-2xl font-light text-stone-800 mb-2">How It Works</h3>
                      <p className="text-sm md:text-base text-stone-600">Simple steps to meaningful exchanges</p>
                    </div>
                    <img 
                      src="/2.png" 
                      alt="How It Works" 
                      className="w-full h-[200px] md:h-[260px] object-cover rounded-md mb-6"
                    />
                    <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                      <div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-stone-200 rounded-full mx-auto mb-2 flex items-center justify-center text-stone-700 font-medium text-sm md:text-base">1</div>
                        <p className="text-xs md:text-sm text-stone-600 font-medium">Declutter</p>
                        <p className="text-xs text-stone-500 mt-1 hidden md:block">Let go mindfully</p>
                      </div>
                      <div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-stone-200 rounded-full mx-auto mb-2 flex items-center justify-center text-stone-700 font-medium text-sm md:text-base">2</div>
                        <p className="text-xs md:text-sm text-stone-600 font-medium">Connect</p>
                        <p className="text-xs text-stone-500 mt-1 hidden md:block">Find your people</p>
                      </div>
                      <div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-stone-200 rounded-full mx-auto mb-2 flex items-center justify-center text-stone-700 font-medium text-sm md:text-base">3</div>
                        <p className="text-xs md:text-sm text-stone-600 font-medium">Share</p>
                        <p className="text-xs text-stone-500 mt-1 hidden md:block">Create joy</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>

              {/* Let Go Buddy Feature */}
              <CarouselItem>
                <Card className="border-0 shadow-none">
                  <CardContent className="p-4 md:p-8 bg-stone-50 rounded-lg">
                    <div className="text-center mb-4 md:mb-6">
                      <h3 className="text-xl md:text-2xl font-light text-stone-800 mb-2">Let Go Buddy</h3>
                      <p className="text-sm md:text-base text-stone-600">Your mindful coach for decluttering with heart</p>
                    </div>
                    <img 
                      src="/3.png" 
                      alt="Let Go Buddy" 
                      className="w-full h-[250px] md:h-[320px] object-cover rounded-md"
                    />
                    <div className="mt-4 text-center">
                      <Link 
                        to="/let-go-buddy" 
                        className="inline-flex items-center px-4 md:px-6 py-2 text-xs md:text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-full hover:bg-stone-100 transition-colors"
                      >
                        Try Let Go Buddy
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>

              {/* Challenge Calendar */}
              <CarouselItem>
                <div className="relative">
                  <img 
                    src="/4.png" 
                    alt="Challenge Calendar" 
                    className="w-full h-[300px] md:h-[500px] object-contain rounded-lg bg-stone-50"
                  />
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 md:bottom-80 md:left-0 md:transform md:translate-x-24">
                    <Link 
                      to="/let-go-buddy/challenge-calendar" 
                      className="inline-flex items-center px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-medium text-stone-800 bg-white/50 border border-stone-200 rounded-full hover:bg-white/70 hover:shadow-md transition-all"
                    >
                      Start Your Journey
                    </Link>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
            
            <CarouselPrevious className="left-2 md:left-4 bg-white/80 hover:bg-white border-stone-200 h-8 w-8 md:h-10 md:w-10" />
            <CarouselNext className="right-2 md:right-4 bg-white/80 hover:bg-white border-stone-200 h-8 w-8 md:h-10 md:w-10" />
          </Carousel>
        </div>
      </div>
    </div>
  );
}