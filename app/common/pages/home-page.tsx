import { Form, Link, useSearchParams } from "react-router";
import { Input } from "../components/ui/input";
import type { Route } from "../../+types/root";
import { Button } from '../components/ui/button';
import { ProductCard } from "../../features/products/components/product-card";
import { CommunityPostCard } from "../../features/community/components/community-post-card";
import { useLoaderData } from "react-router";
import { BlurFade } from 'components/magicui/blur-fade';

// Mock today's picks function (임시)
async function fetchTodaysPicks(criteria: any = {}) {
  const conditions = ["New", "Like New", "Good", "Fair", "Poor"] as const;
  const categories = ["Electronics", "Clothing", "Home goods", "Sports & Outdoor", "Books", "Toys and games"];
  const locations = ["Bangkok", "ChiangMai", "Phuket", "Pattaya"];
  
  return Array.from({ length: 4 }, (_, index) => ({
    id: `product-${index + 1}`,
    title: `Sample Product ${index + 1}`,
    price: Math.floor(Math.random() * 5000) + 100,
    currency: "THB",
    priceType: Math.random() > 0.85 ? "free" : "fixed",
    description: `This is a sample product description for item ${index + 1}.`,
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    image: "/sample.png",
    sellerId: `seller-${index + 1}`,
    isSold: Math.random() > 0.8,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  }));
}

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Home | Lemore" },
    { name: "description", content: "Welcome to Lemore" },
  ];
};

export const loader = async ({ request }: { request: Request }) => {
  try {
    const url = new URL(request.url);
    const location = url.searchParams.get("location") || "ChiangMai";
    
    // Today's Picks 상품들을 가져오기
    const todaysPicks = await fetchTodaysPicks({
      location,
      limit: 4,
      includePopular: true,
      includeRecent: true,
      includeQuality: true,
    });

    // 하드코딩된 Community 최신 글들
    const communityPosts = [
      // Local tips
      {
        id: 'tip-1',
        title: 'Best places to donate clothes in Chiang Mai',
        timeAgo: '2 hours ago',
        type: 'tip' as const,
        author: 'Sarah Johnson',
        likes: 15,
        comments: 8
      },
      {
        id: 'tip-2',
        title: 'How to get a Thai SIM card as a foreigner',
        timeAgo: '4 hours ago',
        type: 'tip' as const,
        author: 'Mike Chen',
        likes: 23,
        comments: 12
      },
      // Give and Glow reviews
      {
        id: 'give-and-glow-1',
        title: 'Vintage Bookshelf - Amazing quality!',
        timeAgo: '2 hours ago',
        type: 'give-and-glow' as const,
        author: 'Sarah Johnson',
        likes: 5,
        comments: 0
      },
      {
        id: 'give-and-glow-2',
        title: 'Kitchen Appliances Set - Great condition!',
        timeAgo: '1 day ago',
        type: 'give-and-glow' as const,
        author: 'Emma Wilson',
        likes: 4,
        comments: 0
      },
      // Local reviews
      {
        id: 'local-review-1',
        title: 'Sukhumvit Thai Restaurant - Amazing authentic Thai food!',
        timeAgo: '2 hours ago',
        type: 'local-review' as const,
        author: 'Sarah Johnson',
        likes: 5,
        comments: 0
      },
      {
        id: 'local-review-2',
        title: 'Chiang Mai Coffee House - Great coffee and atmosphere!',
        timeAgo: '5 hours ago',
        type: 'local-review' as const,
        author: 'Mike Chen',
        likes: 4,
        comments: 0
      }
    ];

    // 시간순으로 정렬 (최신순)
    communityPosts.sort((a, b) => {
      const timeA = getTimeInMs(a.timeAgo);
      const timeB = getTimeInMs(b.timeAgo);
      return timeA - timeB;
    });

    return {
      todaysPicks,
      location,
      communityPosts,
    };
  } catch (error) {
    console.error("Error in home page loader:", error);
    // 에러가 발생해도 기본 데이터로 페이지를 렌더링
    return {
      todaysPicks: [],
      location: "ChiangMai",
      communityPosts: [],
    };
  }
}

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
    location: string;
    communityPosts: Array<{
      id: string;
      title: string;
      timeAgo: string;
      type: 'tip' | 'give-and-glow' | 'local-review';
      author: string;
      likes: number;
      comments: number;
    }>;
  };

  return (
    <div className="sm:max-w-[100vw] md:max-w-[100vw] lg:max-w-[100vw] xl:max-w-[100vw]">
      <div className="flex flex-col px-8 py-15 items-center justify-center rounded-md bg-gradient-to-t from-background to-primary/10">
        <h1 className="text-4xl font-bold text-center">Buy Less, Share More, Live Lighter - in {location}</h1>
      </div>
      <Form className="flex items-center justify-center max-w-screen-sm mx-auto mt-1 gap-2">
        <Input name="query" type="text" placeholder="Search for items" />
        <Button type="submit" variant="outline">Search</Button>
      </Form>
      <div className="text-2xl font-bold mt-10 mx-auto sm:max-w-[100vw] md:max-w-[100vw]">Today's Picks</div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 items-start mx-auto sm:max-w-[100vw] md:max-w-[100vw]">
        {todaysPicks.length > 0 ? (
          todaysPicks.map((product) => (
            <BlurFade>
              <ProductCard
                key={product.id}
                productId={product.id}
                image={product.image}
                title={product.title}
                price={product.price}
                currency="THB"
                priceType="fixed"
                seller={product.sellerId}
                isSold={product.isSold || false}
              />
            </BlurFade>
          ))
        ) : (
          // 데이터가 없을 때 기본 상품들 표시 (예시로 일부는 판매완료로 표시)
          Array.from({ length: 4 }).map((_, index) => (
            <ProductCard
              key={index}
              productId={`${index}`}
              image="/sample.png"
              title="Bicycle for sale"
              price={1000}
              currency="THB"
              priceType="fixed"
              seller={`seller-${index + 1}`}
              isSold={index === 1} // 두 번째 상품만 판매완료로 표시
            />
          ))
        )}

      </div>
      <div className="text-2xl font-bold mt-10 w-full lg:max-w-[70vw] mx-auto sm:max-w-[100vw] md:max-w-[100vw]">Community</div>
      <div className="bg-white rounded-2xl shadow-sm border mt-2 overflow-hidden w-full lg:max-w-[70vw] mx-auto sm:max-w-[100vw] md:max-w-[100vw]">
        {communityPosts.length > 0 ? (
          communityPosts.map((post, index) => (
            <CommunityPostCard
              key={post.id}
              id={post.id}
              title={post.title}
              timeAgo={post.timeAgo}
              author={post.author}
              type={post.type}
              likes={post.likes}
              comments={post.comments}
              isLast={index === communityPosts.length - 1}
            />
          ))
        ) : (
          <div className="flex items-center justify-center py-8 text-gray-500">
            데이터가 없습니다
          </div>
        )}
      </div>
    </div>
  );
}