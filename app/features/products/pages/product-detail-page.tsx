import React, { useState } from "react";
import { Button } from "~/common/components/ui/button";
import { Card } from "~/common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { useNavigate } from "react-router";
import { HeartIcon } from "lucide-react";
import { getProductById } from "../queries";
import { Route } from './+types/product-detail-page';
import {DateTime} from "luxon";
import { makeSSRClient } from "~/supa-client";

export const meta = () => {
  return [
    { title: "Product Details | Lemore" },
    { name: "description", content: "View product details on Lemore" },
  ];
};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { id } = params;
  const { client, headers } = makeSSRClient(request);
  const product = await getProductById(client, Number(id));
  if (isNaN(Number(id))) {
    throw new Error("Invalid product ID");
  }
  return { product };
}


  export default function ProductDetailPage({ loaderData }: Route.ComponentProps) {
  const { product } = loaderData;
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);


  const isFree = product.price_type === "Free";

  // Handle contact seller button click
  const handleContactSeller = () => {
    // Navigate to messages page with product context
    navigate("/my/messages", {
      state: {
        productId: product.product_id,
        productTitle: product.title,
        sellerId: product.seller_id,
        sellerName: product.seller_name,
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
                src={product.primary_image?.startsWith('/') ? product.primary_image : `/toy1.png`}
                alt={product.title || 'Product image'}
                className="w-full h-full object-cover"
              />
              {product.is_sold && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium shadow-lg">
                  SOLD
                </div>
              )}
              {isFree && !product.is_sold && (
              <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                FREE
              </div>
            )}
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {Array.isArray(product.all_images) && product.all_images.map((image: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors relative ${
                    selectedImage === index ? 'border-purple-500' : 'border-gray-200'
                  }`}
                >
                  <img 
                    src={image.image_url?.startsWith('/') ? image.image_url : `/toy1.png`}
                    alt={`${product.title || 'Product'} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {product.is_sold && (
                    <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                      SOLD
                    </div>
                  )}
                  {isFree && !product.is_sold && (
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
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                size="lg" 
                className="flex-1"
                disabled={product.is_sold || false}
                variant={product.is_sold ? "secondary" : "default"}
                onClick={handleContactSeller}
              >
                {product.is_sold ? "Item Sold" : "Contact Seller"}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? "text-rose-500 border-primary" : ""}
                disabled={product.is_sold || false}
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
                  <span className="font-medium">{product.category_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{product.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span className="font-medium">{DateTime.fromISO(product.created_at || '').toLocaleString(DateTime.DATE_MED)}</span>
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
              {Array.isArray(product.tags) && product.tags.map((tag: any, index: number) => (
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
                <AvatarImage src={product.seller_avatar || undefined} alt={product.seller_name || 'Seller'} />
                <AvatarFallback>
                  {product.seller_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'S'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{product.seller_name}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i}
                        width="16" 
                        height="16" 
                        fill={i < Math.floor(product.seller_rating || 0) ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        className={i < Math.floor(product.seller_rating || 0) ? "text-yellow-400" : "text-gray-300"}
                      >
                        <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{product.seller_rating || 0} ({product.seller_total_likes || 0} likes)</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Member since:</span> {product.seller_joined_at || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Response rate:</span> {product.seller_response_rate}
                  </div>
                  <div>
                    <span className="font-medium">Response time:</span> {product.seller_response_time}
                  </div>
                </div>
              </div>
              <Button variant="outline">View Profile</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 