import React, { useState } from "react";
import { Button } from "~/common/components/ui/button";
import { Card } from "~/common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { useParams, useLoaderData, useNavigate } from "react-router";
import { HeartIcon } from "lucide-react";
import { getCurrentUserId } from "~/lib/utils";
import { z } from "zod";

// Mock track product view function (임시)
async function trackProductView(productId: string, userId?: string | null, request?: Request) {
  // 실제로는 데이터베이스에 조회 기록을 저장
  console.log(`Product view tracked: ${productId} by user: ${userId || 'anonymous'}`);
  return Promise.resolve();
}

// URL 파라미터 검증 스키마
const paramsSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
});

export const meta = () => {
  return [
    { title: "Product Details | Lemore" },
    { name: "description", content: "View product details on Lemore" },
  ];
};

// Loader function for tracking product views
export const loader = async ({ request, params }: { request: Request; params: any }) => {
  try {
    // URL 파라미터 검증
    const validationResult = paramsSchema.safeParse(params);
    
    if (!validationResult.success) {
      throw new Response("Invalid Product ID", { status: 400 });
    }

    const { id: productId } = validationResult.data;

    // 실제 사용자 ID 가져오기 (비로그인 사용자는 null)
    const userId = getCurrentUserId(request);

    // 상품 조회 추적 (IP 주소 추적 없음)
    await trackProductView(productId, userId, request);

    return { productId, userId };
  } catch (error) {
    console.error("Product detail loader error:", error);
    throw error;
  }
};

export default function ProductDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const loaderData = useLoaderData() as { productId: string; userId: string | null };
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // URL 파라미터 검증
  const validationResult = paramsSchema.safeParse(params);
  
  if (!validationResult.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Product ID</h1>
          <p className="text-gray-600">{validationResult.error.errors[0]?.message}</p>
        </div>
      </div>
    );
  }

  const { id: productId } = validationResult.data;

  // Mock product data - in a real app this would come from the loader
  const product = {
    id: productId,
    title: "Vintage Bicycle - Perfect Condition",
    price: "THB 2,500",
    originalPrice: "THB 3,500",
    description: "Beautiful vintage bicycle in excellent condition. Perfect for daily commuting or weekend rides. Includes basket and bell. Only used for 6 months before I moved to a smaller apartment.",
    condition: "Like New",
    category: "Sports & Outdoor",
    location: "Bangkok, Thailand",
    postedDate: "2 days ago",
    isSold: Math.random() > 0.7, // 30% 확률로 판매완료 (테스트용)
    priceType: Math.random() > 0.8 ? "free" : "fixed", // 20% 확률로 무료 (테스트용)
    images: [
      "/sample.png",
      "/sample.png",
      "/sample.png",
      "/sample.png"
    ],
    seller: {
      name: "Sarah Johnson",
      avatar: "/sample.png",
      rating: 4.8,
      totalSales: 23,
      memberSince: "2022",
      responseRate: "98%",
      responseTime: "< 1 hour"
    },
    specifications: {
      brand: "Trek",
      model: "FX 2",
      year: "2021",
      color: "Matte Black",
      size: "Medium (54cm)",
      material: "Aluminum"
    },
    tags: ["Vintage", "Well Maintained", "Includes Accessories", "Quick Sale"]
  };

  const isFree = product.priceType === "free";

  // Handle contact seller button click
  const handleContactSeller = () => {
    // Navigate to messages page with product context
    navigate("/my/messages", {
      state: {
        productId: product.id,
        productTitle: product.title,
        sellerId: "seller-123", // Mock seller ID
        sellerName: product.seller.name,
        fromProduct: true
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm relative">
              <img 
                src={product.images[selectedImage]} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {product.isSold && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium shadow-lg">
                  SOLD
                </div>
              )}
              {isFree && !product.isSold && (
              <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                FREE
              </div>
            )}
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors relative ${
                    selectedImage === index ? 'border-purple-500' : 'border-gray-200'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {product.isSold && (
                    <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                      SOLD
                    </div>
                  )}
                  {isFree && !product.isSold && (
                    <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                      FREE
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-purple-700">
                  {product.price}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  {product.originalPrice}
                </span>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-medium">
                  29% OFF
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                size="lg" 
                className="flex-1"
                disabled={product.isSold}
                variant={product.isSold ? "secondary" : "default"}
                onClick={handleContactSeller}
              >
                {product.isSold ? "Item Sold" : "Contact Seller"}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? "text-rose-500 border-primary" : ""}
                disabled={product.isSold}
              >
                <HeartIcon 
                  className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} 
                />
                {isLiked ? "Liked" : "Like"}
              </Button>
            </div>

            {/* Product Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Product Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Condition:</span>
                  <span className="font-medium">{product.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{product.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span className="font-medium">{product.postedDate}</span>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </Card>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Seller Information */}
        <div className="mt-12">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={product.seller.avatar} alt={product.seller.name} />
                <AvatarFallback>
                  {product.seller.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{product.seller.name}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i}
                        width="16" 
                        height="16" 
                        fill={i < Math.floor(product.seller.rating) ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        className={i < Math.floor(product.seller.rating) ? "text-yellow-400" : "text-gray-300"}
                      >
                        <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{product.seller.rating} ({product.seller.totalSales} sales)</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Member since:</span> {product.seller.memberSince}
                  </div>
                  <div>
                    <span className="font-medium">Response rate:</span> {product.seller.responseRate}
                  </div>
                  <div>
                    <span className="font-medium">Response time:</span> {product.seller.responseTime}
                  </div>
                </div>
              </div>
              <Button variant="outline">View Profile</Button>
            </div>
          </Card>
        </div>

        {/* Similar Items */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">Similar Items</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-square">
                  <img src="/sample.png" alt="Similar item" className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-sm mb-1">Similar Bicycle {index + 1}</h4>
                  <p className="text-purple-700 font-semibold">THB {1500 + index * 200}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 