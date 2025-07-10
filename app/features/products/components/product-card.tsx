import { Link } from "react-router";
import { z } from "zod";
import { HeartIcon } from "lucide-react";
import { ShineBorder } from "components/magicui/shine-border";
import { UserStatsHoverCard } from "~/common/components/user-stats-hover-card";
import { PRODUCT_CATEGORIES } from "../constants";

// 가격 포맷팅 함수
const formatPrice = (price: number, currency: string = "THB"): string => {
  return `${currency} ${price.toLocaleString()}`;
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
});

type ProductCardProps = z.infer<typeof productCardSchema>; 

export function ProductCard({ 
  productId, 
  image, 
  title, 
  price, 
  currency = "THB",
  seller = "Multiple Owners", 
  likes = 0,
  is_sold = false,
  priceType = "fixed",
  category = "Electronics"
}: ProductCardProps) {
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
            {is_sold && (
              <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                SOLD
              </div>
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