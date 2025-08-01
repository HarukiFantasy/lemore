import { Link, useSearchParams, useFetcher, useNavigate } from "react-router";
import { z } from "zod";
import { HeartIcon } from "lucide-react";
import { UserStatsHoverCard } from "~/common/components/user-stats-hover-card";
import { PRODUCT_CATEGORIES } from "../constants";
import { formatPrice as formatCurrencyPrice } from "~/lib/currency-utils";
import { Badge } from "../../../common/components/ui/badge";
import { useEffect, useState } from "react";
import { useMobile } from "app/hooks/use-mobile";

// 가격 포맷팅 함수 (legacy)
const formatPrice = (price?: number, currency: string = "THB"): string => {
  if (typeof price !== 'number' || isNaN(price)) return '';
  return formatCurrencyPrice(price, currency);
};

// Props 검증 스키마
const productCardSchema = z.object({
  productId: z.number(),
  image: z.string().min(1, "Image is required"),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  price: z.number().min(0, "Price must be non-negative"),
  currency: z.string().optional().default("THB"),
  seller: z.string().optional(),
  likes: z.number().min(0, "Likes cannot be negative").optional(),
  is_sold: z.boolean().optional(),
  priceType: z.string().optional().default("fixed"),
  category: z.enum(PRODUCT_CATEGORIES).optional(),
  sellerStats: z.any().optional(),
});

type ProductCardProps = {
  product?: any;
  showSoldBadge?: boolean;
  image?: string;
  title?: string;
  currency?: string;
  price?: number;
  productId?: number;
  priceType?: string;
  is_sold?: boolean;
  category?: string;
  likes?: number;
  sellerId?: string;
  sellerName?: string;
  sellerStats?: any;
  isLikedByUser?: boolean; // 사용자가 이미 좋아요한 제품인지
  currentUserId?: string; // 현재 로그인한 사용자 ID
  [key: string]: any;
};

export function ProductCard({
  product,
  showSoldBadge = false,
  image,
  title,
  currency,
  price,
  productId,
  priceType,
  is_sold,
  category,
  likes = 0,
  sellerId,
  sellerName,
  sellerStats,
  isLikedByUser = false,
  currentUserId,
  ...props
}: ProductCardProps) {
  // Support both product object and individual props
  const prod = product || {
    image,
    title,
    currency,
    price,
    product_id: productId,
    priceType,
    is_sold,
    category,
    likes,
    seller_id: sellerId,
    seller_name: sellerName,
    sellerStats,
  };
  
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher();
  const location = searchParams.get("location");
  const isFree = priceType === "free";

  // Optimistic likes count
  const [optimisticLikes, setOptimisticLikes] = useState(likes);
  const [isLiked, setIsLiked] = useState(isLikedByUser);

  // 본인 상품 여부 확인
  const isOwner = currentUserId && prod.seller_id && currentUserId === prod.seller_id;

  // Helper function to add location to URLs
  const addLocationToUrl = (url: string) => {
    if (location && location !== "Bangkok") {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}location=${location}`;
    }
    return url;
  };

  // Handle like button click
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    const newLikeCount = isLiked ? optimisticLikes - 1 : optimisticLikes + 1;
    setOptimisticLikes(newLikeCount);
    setIsLiked(!isLiked);
    
    fetcher.submit(
      { 
        productId: String(productId),
        action: isLiked ? 'unlike' : 'like'
      },
      { method: "post", action: `/secondhand/${productId}/like` }
    );
  };

  // Update state when props change
  useEffect(() => {
    setOptimisticLikes(likes);
    setIsLiked(isLikedByUser);
  }, [likes, isLikedByUser]);

  // Update optimistic state based on fetcher state
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      // Server response received, update with actual data
      if (fetcher.data.success) {
        setOptimisticLikes(fetcher.data.likes);
        setIsLiked(fetcher.data.isLiked);
      } else {
        // Revert on error
        setOptimisticLikes(likes);
        setIsLiked(isLikedByUser);
      }
    }
  }, [fetcher.state, fetcher.data, likes, isLikedByUser]);

  const navigate = useNavigate();
  const isMobile = useMobile();

  const handleCardClick = () => {
    navigate(addLocationToUrl(`/secondhand/product/${productId}`));
  };

  const handleSellerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/users/${prod.seller_name}`);
  };

    return (
    <div onClick={handleCardClick} className="cursor-pointer">
      <div className="relative group p-1 
        transition-all duration-200 ease-out
        active:scale-95 
        md:hover:scale-100
      ">
        <div className="bg-white rounded-lg shadow h-full flex flex-col pb-2 
          active:bg-gray-50 
          md:active:bg-white
        ">
          <div className="relative w-full h-40 sm:h-48 md:h-60 overflow-hidden rounded-t-lg">
            <img 
              src={prod.image || '/toy1.png'} 
              className="object-cover w-full h-full 
                md:group-hover:scale-110 md:group-hover:brightness-110 
                transition-all duration-300 ease-out" 
              alt={prod.title || 'Product image'} 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/toy1.png';
              }}
            />
            <button className="absolute top-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full 
              opacity-0 md:group-hover:opacity-100 transition-opacity">Save</button>
            {showSoldBadge && prod.is_sold && (
              <Badge className="absolute top-2 right-2 z-10 bg-rose-500 text-white">SOLD</Badge>
            )}
            {isFree && !is_sold && (
              <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                FREE
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 p-3 pb-2 flex-grow">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold truncate">{title}</span>
              <span className="text-sm text-neutral-500 truncate">{category}</span>
            </div>
            <div>
              {isMobile ? (
                <button
                  className="text-xs text-neutral-500 truncate font-medium underline decoration-dotted underline-offset-2 hover:decoration-solid"
                  onClick={handleSellerClick}
                  tabIndex={0}
                  type="button"
                >
                  {prod.seller_name}
                </button>
              ) : (
            <UserStatsHoverCard
                  profileId={prod.seller_id}
                  userName={prod.seller_name ?? ''}
              userStats={sellerStats}
              className="text-xs text-neutral-500 truncate"
            >
                  <span onClick={e => e.stopPropagation()}>
                    {prod.seller_name}
                  </span>
            </UserStatsHoverCard>
              )}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-semibold text-purple-700">{formatPrice(price, currency)}</span>
              <div className="flex items-center gap-1 text-neutral-500 text-xs">
                {!isOwner && (
                <button
                  onClick={handleLikeClick}
                  className={`flex items-center gap-1 transition-colors duration-200 hover:scale-110 ${
                    isLiked ? 'text-red-500 hover:text-red-400' : 'text-neutral-500 hover:text-neutral-400'
                  }`}
                    disabled={fetcher.state !== 'idle'}
                  >
                  <HeartIcon className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{optimisticLikes}</span>
                </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 