import { Form, Link, useSearchParams } from "react-router";
import { Input } from "../components/ui/input";
import type { Route } from "../../+types/root";
import { Button } from '../components/ui/button';
import { ProductCard } from "../../features/products/components/product-card";
import { TipPostCard } from "../../features/community/components/tip-post-card";
import { useLoaderData } from "react-router";
import { BlurFade } from 'components/magicui/blur-fade';
import { makeSSRClient } from '~/supa-client';
import { getProductsListings, getUserLikedProducts } from '../../features/products/queries';
import { getLocalTipPosts } from "~/features/community/queries";
import { DateTime } from "luxon";


export const meta: Route.MetaFunction = () => {
  return [
    { title: "Home | Lemore" },
    { name: "description", content: "Welcome to Lemore" },
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
  
  // Get all products and filter by location
  let latestListings = await getProductsListings(client, 20); // Get more to filter
  if (location && location !== "All Locations" && location !== "Other Cities") {
    latestListings = latestListings.filter(product => product.location === location);
  }
  latestListings = latestListings.slice(0, 4); // Limit to 4 after filtering
  
  // Get all community posts and filter by location
  let communityPosts = await getLocalTipPosts(client, 20); // Get more to filter
  if (location && location !== "All Locations" && location !== "Other Cities") {
    communityPosts = communityPosts.filter(post => post.location === location);
  }
  communityPosts = communityPosts.slice(0, 10); // Limit to 10 after filtering
  
  return { latestListings, communityPosts, userLikedProducts, user };
};

// Date 객체 또는 ISO 문자열을 시간 문자열로 변환하는 헬퍼 함수 (Luxon 사용)
function getTimeAgo(date: Date | string): string {
  const dt = typeof date === "string" ? DateTime.fromISO(date) : DateTime.fromJSDate(date);
  return dt.toRelative() ?? "";
}

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const { latestListings, communityPosts, userLikedProducts, user } = useLoaderData() as {
    latestListings: any[];
    location: string | null;
    communityPosts: any[];
    userLikedProducts: number[];
    user: any;
  };
  const urlLocation = searchParams.get("location");
  const currentLocation = urlLocation || "Bangkok";

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
          latestListings.map((product) => (
            <BlurFade key={product.product_id}>
              <ProductCard
                key={product.product_id}
                productId={product.product_id}
                image={product.primary_image || `/toy1.png`}
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
              />
            </BlurFade>
          ))
        ): "No products found"}

      </div>
      <div className="text-2xl font-bold mt-10 w-full lg:max-w-[70vw] mx-auto sm:max-w-[100vw] md:max-w-[100vw]">
        Community {!urlLocation ? "" : `in ${currentLocation}`}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border mt-2 overflow-hidden w-full lg:max-w-[70vw] mx-auto sm:max-w-[100vw] md:max-w-[100vw] grid grid-cols-1 md:grid-cols-2 gap-0">
        {communityPosts.length > 0 ? (
          communityPosts.map((post, index) => {
            // Transform the data to match TipPostCard expectations
            let timeAgo = 'Unknown time';
            try {
              if (post.created_at) {
                timeAgo = getTimeAgo(new Date(post.created_at));
              }
            } catch (error) {
              throw new Error('Error parsing created_at');
            }
            
            const author = post.username || post.author || 'Anonymous';
            
            let stats = { likes: 0, comments: 0 };
            try {
              if (post.stats && typeof post.stats === 'string') {
                stats = JSON.parse(post.stats);
              } else if (post.stats && typeof post.stats === 'object') {
                stats = post.stats;
              }
            } catch (error) {
              throw new Error('Error parsing stats');
            }
            
            return (
              <TipPostCard
                key={post.id}
                id={post.id}
                title={post.title}
                content={post.content}
                author={author}
                avatar_url={post.avatar_url}
                timeAgo={timeAgo}
                location={post.location}
                category={post.category}
                likes={stats.likes || 0}
                comments={stats.comments || 0}
                variant="compact"
                gridIndex={index}
                totalItems={communityPosts.length}
                columnsDesktop={2}
                columnsMobile={1}
              />
            );
          })
        ) : (
          <div className="flex items-center justify-center py-8 text-gray-500">
            No data founds
          </div>
        )}
      </div>
    </div>
  );
}