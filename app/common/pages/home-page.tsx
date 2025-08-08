import { Form, Link, useSearchParams } from "react-router";
import { Input } from "../components/ui/input";
import type { Route } from "../../+types/root";
import { Button } from '../components/ui/button';
import { ProductCard } from "../../features/products/components/product-card";
import { useLoaderData } from "react-router";
import { BlurFade } from 'components/magicui/blur-fade';
import { makeSSRClient } from '~/supa-client';
import { getProductsWithSellerStats, getUserLikedProducts } from '../../features/products/queries';
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

  // userStats 가져오기
  let userStats = null;
  if (user) {
    userStats = await getUserSalesStatsByProfileId(client, user.id);
  }
  
  // Get all products and filter by location
  let latestListings = await getProductsWithSellerStats(client, 20); // 상품+판매자 stats 포함
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
    
    <div className="sm:max-w-[100vw] md:max-w-[100vw] lg:max-w-[100vw] xl:max-w-[100vw] px-5">
      <div className="flex flex-col px-0 py-15 items-center justify-center rounded-md bg-gradient-to-t from-background to-primary/10">
        <h1 className="text-4xl font-bold text-center">Buy Less, Share More, Live Lighter</h1>
        <p className="text-lg text-gray-600 mt-2">
          {!urlLocation ? "across all locations" : `in ${currentLocation}`}
        </p>
      </div>
      <Form className="flex items-center justify-center max-w-screen-sm mx-auto mt-1 gap-2">
        <Input name="query" type="text" placeholder="Search for items" />
        <Button type="submit" variant="outline">Search</Button>
      </Form>
      <div className="text-2xl font-bold mt-10 mx-auto sm:max-w-[100vw] md:max-w-[100vw]">
        Latest Listings {!urlLocation ? "" : `in ${currentLocation}`}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 items-start w-full max-w-none">
        {latestListings.length > 0 ? (
          latestListings.map((product: any) => (
            <BlurFade key={product.product_id}>
              <ProductCard
                key={product.product_id}
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
                sellerStats={{
                  totalListings: product.total_listings,
                  totalLikes: product.total_likes,
                  totalSold: product.total_sold,
                  level: product.seller_level, // level 정보 추가
                  sellerJoinedAt: new Date(product.seller_joined_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                }}
              />
            </BlurFade>
          ))
        ): "No products found"}

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
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-stone-800 leading-tight">
                    Let go,<br />
                    share more,<br />
                    <span className="text-stone-600">live lighter.</span>
                  </h2>
                  <p className="text-base md:text-lg text-stone-600 leading-relaxed">
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
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-stone-200/50 to-stone-300/50 rounded-2xl blur-2xl opacity-60"></div>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                      src="/1.png" 
                      alt="Lemore Mission" 
                      className="w-full h-[350px] md:h-[450px] object-cover"
                    />
                    {/* Floating Badge */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                        <p className="text-sm font-medium text-stone-800 text-center">
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