import React, { useState } from "react";
import { Button } from "~/common/components/ui/button";
import { Card } from "~/common/components/ui/card";
import { Separator } from "~/common/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { paramsSchema } from "~/lib/schemas";
import { useParams } from "react-router";
import { HeartIcon } from "lucide-react";

export const meta = () => {
  return [
    { title: "Product Details | Lemore" },
    { name: "description", content: "View product details on Lemore" },
  ];
};

export default function ProductDetailPage() {
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // URL 파라미터 검증
  const validationResult = paramsSchema.productId.safeParse(params);
  
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              <img 
                src={product.images[selectedImage]} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-purple-500' : 'border-gray-200'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
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
              <Button size="lg" className="flex-1">
                Contact Seller
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? "text-rose-500 border-primary" : ""}
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

            {/* Specifications */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{key}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
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