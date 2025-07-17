import { Form, Link, useSearchParams } from "react-router";
import { Input } from "../components/ui/input";
import type { Route } from "../../+types/root";
import { Button } from '../components/ui/button';
import { ProductCard } from "../../features/products/components/product-card";
import { CommunityPostCard } from "../../features/community/components/community-post-card";
import { useLoaderData } from "react-router";
import { BlurFade } from 'components/magicui/blur-fade';
import { makeSSRClient } from '~/supa-client';
import { getProductsListings } from '../../features/products/queries';
import { getLocalTipPosts } from "~/features/community/queries";


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
  
  // Get all products and filter by location
  let todaysPicks = await getProductsListings(client, 20); // Get more to filter
  if (location && location !== "All Locations" && location !== "Other Cities") {
    todaysPicks = todaysPicks.filter(product => product.location === location);
  }
  todaysPicks = todaysPicks.slice(0, 4); // Limit to 4 after filtering
  
  // Get all community posts and filter by location
  let communityPosts = await getLocalTipPosts(client, 20); // Get more to filter
  if (location && location !== "All Locations" && location !== "Other Cities") {
    communityPosts = communityPosts.filter(post => post.location === location);
  }
  communityPosts = communityPosts.slice(0, 10); // Limit to 10 after filtering
  
  return { todaysPicks, location, communityPosts };
};

// 시간 문자열을 밀리초로 변환하는 헬퍼 함수
function getTimeInMs(timeAgo: string): number {
  const match = timeAgo.match(/(\d+)\s+(hour|day|minute)s?\s+ago/);
  if (!match) return 0;
  
  const [, amount, unit] = match;
  const num = parseInt(amount);
  
  switch (unit) {
    case 'minute': return num * 60 * 1000;
    case 'hour': return num * 60 * 60 * 1000;
    case 'day': return num * 24 * 60 * 60 * 1000;
    default: return 0;
  }
}

// Date 객체를 시간 문자열로 변환하는 헬퍼 함수
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
}

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const { todaysPicks, location, communityPosts } = useLoaderData() as {
    todaysPicks: any[];
    location: string | null;
    communityPosts: any[];
  };
  const urlLocation = searchParams.get("location");
  const currentLocation = urlLocation || "Bangkok";

  return (
    
    <div className="sm:max-w-[100vw] md:max-w-[100vw] lg:max-w-[100vw] xl:max-w-[100vw]">
      <div className="flex flex-col px-8 py-15 items-center justify-center rounded-md bg-gradient-to-t from-background to-primary/10">
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
        Today's Picks {!urlLocation ? "" : `in ${currentLocation}`}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 items-start mx-auto sm:max-w-[100vw] md:max-w-[100vw]">
        {todaysPicks.length > 0 ? (
          todaysPicks.map((product) => (
            <BlurFade key={product.product_id}>
              <ProductCard
                key={product.product_id}
                productId={product.product_id}
                image={product.primary_image?.startsWith('/') ? product.primary_image : `/toy1.png`}
                title={product.title}
                price={product.price}
                currency={product.currency || "THB"}
                priceType={product.price_type || "Fixed"}
                seller={product.seller_name}
                is_sold={product.is_sold || false}
              />
            </BlurFade>
          ))
        ): "No products found"}

      </div>
      <div className="text-2xl font-bold mt-10 w-full lg:max-w-[70vw] mx-auto sm:max-w-[100vw] md:max-w-[100vw]">
        Community {!urlLocation ? "" : `in ${currentLocation}`}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border mt-2 overflow-hidden w-full lg:max-w-[70vw] mx-auto sm:max-w-[100vw] md:max-w-[100vw]">
        {communityPosts.length > 0 ? (
          communityPosts.map((post, index) => {
            // Transform the data to match CommunityPostCard expectations
            let timeAgo = 'Unknown time';
            try {
              if (post.created_at) {
                timeAgo = getTimeAgo(new Date(post.created_at));
              }
            } catch (error) {
              console.error('Error parsing created_at:', error);
            }
            
            const author = post.username || post.author || 'Anonymous';
            
            let stats = { likes: 0, comments: 0, reviews: 0 };
            try {
              if (post.stats && typeof post.stats === 'string') {
                stats = JSON.parse(post.stats);
              } else if (post.stats && typeof post.stats === 'object') {
                stats = post.stats;
              }
            } catch (error) {
              console.error('Error parsing stats:', error);
            }
            
            return (
              <CommunityPostCard
                key={post.id}
                id={post.id}
                title={post.title}
                timeAgo={timeAgo}
                author={author}
                type="tip"
                likes={stats.likes || 0}
                comments={stats.comments || 0}
                isLast={index === communityPosts.length - 1}
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