import { Link } from "react-router";
import { z } from "zod";
import { HeartIcon } from "lucide-react";
import { ShineBorder } from "components/magicui/shine-border";
import { UserStatsHoverCard } from "~/common/components/user-stats-hover-card";

// 가격 포맷팅 함수
const formatPrice = (price: number, currency: string = "THB"): string => {
  return `${currency} ${price.toLocaleString()}`;
};

// Props 검증 스키마
const productCardSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  image: z.string().min(1, "Image is required"),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  price: z.number().min(0, "Price must be non-negative"),
  currency: z.string().optional().default("THB"),
  seller: z.string().optional(),
  likes: z.number().min(0, "Likes cannot be negative").optional(),
  isSold: z.boolean().optional(),
  priceType: z.string().optional().default("fixed"),
});

type ProductCardProps = z.infer<typeof productCardSchema>;

// Mock seller statistics - 실제로는 API에서 가져올 데이터
const getSellerStats = (sellerId: string): {
  totalListings: number;
  rating: number;
  responseRate: string;
} => {
  // 실제 구현에서는 sellerId를 사용해서 API 호출
  return {
    totalListings: Math.floor(Math.random() * 50) + 5,
    rating: Math.floor(Math.random() * 5) + 1,
    responseRate: `${Math.floor(Math.random() * 100) + 1}%`,
  };
};

// sellerId를 사용자 친화적인 이름으로 변환
const getSellerName = (sellerId: string): string => {
  // 실제 구현에서는 sellerId로 사용자 정보를 조회
  const sellerNames = [
    "Sarah M.", "John D.", "Maria L.", "Alex K.", "Emma W.",
    "David R.", "Lisa T.", "Mike P.", "Anna S.", "Tom B.",
    "Jenny H.", "Chris L.", "Rachel G.", "Mark J.", "Sophie N."
  ];
  
  // sellerId에서 숫자를 추출하여 일관된 이름 생성
  const num = parseInt(sellerId.replace(/\D/g, '')) || 0;
  return sellerNames[num % sellerNames.length];
};

export function ProductCard({ 
  productId, 
  image, 
  title, 
  price, 
  currency = "THB",
  seller = "Multiple Owners", 
  likes = 0,
  isSold = false,
  priceType = "fixed"
}: ProductCardProps) {
  // Props 검증
  const validationResult = productCardSchema.safeParse({ 
    productId, 
    image, 
    title, 
    price, 
    currency,
    seller, 
    likes,
    isSold,
    priceType
  });
  
  if (!validationResult.success) {
    return (
      <div className="relative w-full h-40 sm:h-48 md:h-60 overflow-hidden bg-red-50 rounded-lg shadow border border-red-200">
        <div className="flex items-center justify-center h-full">
          <span className="text-red-600 text-sm text-center">
            Invalid product data: {validationResult.error.errors[0]?.message}
          </span>
        </div>
      </div>
    );
  }

  const sellerStats = getSellerStats(seller);
  const isFree = priceType === "free";

    return (
    <Link to={`/secondhand/product/${productId}`}>
      <div className="relative group p-1">
        <ShineBorder 
          borderWidth={2} 
          duration={8} 
          shineColor={["#fef3c7", "#fed7aa", "#fdba74"]}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
        />
        <div className="bg-white rounded-lg shadow h-full flex flex-col pb-2">
          <div className="relative w-full h-40 sm:h-48 md:h-60 overflow-hidden rounded-t-lg">
            <img src={image} className="object-cover w-full h-full group-hover:scale-110 group-hover:brightness-110 transition-all duration-300 ease-out" alt={title} />
            <button className="absolute top-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Save</button>
            {isSold && (
              <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                SOLD
              </div>
            )}
            {isFree && !isSold && (
              <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                FREE
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 p-3 pb-2 flex-grow">
            <span className="text-base font-semibold truncate">{title}</span>
            <UserStatsHoverCard
              userId={seller}
              userName={seller}
              userType="Seller"
              className="text-xs text-neutral-500 truncate"
            >
              {seller}
            </UserStatsHoverCard>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-semibold text-purple-700">{formatPrice(price, currency)}</span>
              <div className="flex items-center gap-1 text-neutral-500 text-xs">
                <HeartIcon className="w-4 h-4" />
                <span>{likes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 