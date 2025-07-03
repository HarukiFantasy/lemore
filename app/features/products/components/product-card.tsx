import { Link } from "react-router";
import { z } from "zod";
import { HeartIcon, PackageIcon, EyeIcon } from "lucide-react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "~/common/components/ui/hover-card";
import { Badge } from "~/common/components/ui/badge";
import { ShineBorder } from "components/magicui/shine-border";

// Props 검증 스키마
const productCardSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  image: z.string().min(1, "Image is required").refine(
    (value) => {
      // 완전한 URL이거나 상대 경로인지 확인
      try {
        new URL(value);
        return true;
      } catch {
        // 상대 경로인 경우 (예: "/sample.png")
        return value.startsWith('/') || value.startsWith('./') || value.startsWith('../');
      }
    },
    "Image URL must be valid (absolute URL or relative path)"
  ),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  price: z.string().min(1, "Price is required").regex(/^THB\s\d+/, "Price must be in format 'THB [number]'"),
  seller: z.string().optional(),
  likes: z.number().min(0, "Likes cannot be negative").optional(),
  isSold: z.boolean().optional(),
});

type ProductCardProps = z.infer<typeof productCardSchema>;

// Mock seller statistics - 실제로는 API에서 가져올 데이터
const getSellerStats = (sellerId: string): {
  totalListings: number;
  totalLikes: number;
  totalViews: number;
} => {
  // 실제 구현에서는 sellerId를 사용해서 API 호출
  return {
    totalListings: Math.floor(Math.random() * 50) + 5,
    totalLikes: Math.floor(Math.random() * 200) + 20,
    totalViews: Math.floor(Math.random() * 1000) + 100,
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
  seller = "Multiple Owners", 
  likes = 0,
  isSold = false
}: ProductCardProps) {
  // Props 검증
  const validationResult = productCardSchema.safeParse({ 
    productId, 
    image, 
    title, 
    price, 
    seller, 
    likes,
    isSold
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

    return (
    <Link to={`/secondhand/product/${productId}`}>
      <div className="relative group p-1">
        <ShineBorder 
          borderWidth={2} 
          duration={8} 
          shineColor={["#fef3c7", "#fed7aa", "#fdba74"]}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
        />
        <div className="bg-white rounded-lg shadow h-full flex flex-col">
          <div className="relative w-full h-40 sm:h-48 md:h-60 overflow-hidden rounded-t-lg">
            <img src={image} className="object-cover w-full h-full group-hover:scale-110 group-hover:brightness-110 transition-all duration-300 ease-out" alt={title} />
            <button className="absolute top-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Save</button>
            {isSold && (
              <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                판매완료
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 p-3 pb-2 flex-grow">
            <span className="text-base font-semibold truncate">{title}</span>
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="text-xs text-neutral-500 truncate cursor-pointer hover:text-neutral-700 transition-colors">
                  {seller}
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{getSellerName(seller)}</span>
                    <Badge variant="secondary" className="text-xs">Seller</Badge>
                  </div>
                  
                  <div className="text-xs text-neutral-500">
                    ID: {seller}
                  </div>
                  
                  {/* Seller Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <PackageIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-neutral-600">Total Listings</span>
                      <span className="text-sm font-semibold">{sellerStats.totalListings}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <HeartIcon className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-neutral-600">Total Likes</span>
                      <span className="text-sm font-semibold">{sellerStats.totalLikes}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <EyeIcon className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-neutral-600">Total Views</span>
                      <span className="text-sm font-semibold">{sellerStats.totalViews}</span>
                    </div>
                  </div>
                  
                  {/* Additional Seller Info */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                      <div>
                        <span className="font-medium">Member since:</span> 
                        <span className="ml-1">2023</span>
                      </div>
                      <div>
                        <span className="font-medium">Response rate:</span> 
                        <span className="ml-1">98%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            <span className="text-sm font-semibold text-purple-700 mt-1">{price}</span>
            <div className="flex items-center gap-4 mt-2">
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