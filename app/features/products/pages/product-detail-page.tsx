import React, { useState } from "react";
import { Button } from "~/common/components/ui/button";
import { Card } from "~/common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { useNavigate, useSearchParams } from "react-router";
import { HeartIcon } from "lucide-react";
import { PackageIcon, EyeIcon, MessageCircleReplyIcon, ThumbsUpIcon, StarIcon, CalendarIcon } from "lucide-react";
import { getProductById, getProductByUsername } from "../queries";
import { Route } from './+types/product-detail-page';
import {DateTime} from "luxon";
import { makeSSRClient } from "~/supa-client";
import { getUserSalesStatsByProfileId } from "~/features/users/queries";

export const meta = () => {
  return [
    { title: "Product Details | Lemore" },
    { name: "description", content: "View product details on Lemore" },
  ];
};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { productId } = params;
  const { client, headers } = makeSSRClient(request);
  const product = await getProductById(client, Number(productId));
  if (isNaN(Number(productId))) {
    throw new Error("Invalid product ID");
  }
  // Fetch up to 4 other products by the same seller (excluding current product)
  let sellerProducts: any[] = [];
  let userStats = null;
  if (product?.seller_name) {
    sellerProducts = await getProductByUsername(client, product.seller_name);
    sellerProducts = sellerProducts.filter((p: any) => p.product_id !== product.product_id).slice(0, 4);
  }
  if (product?.seller_id) {
    try {
      userStats = await getUserSalesStatsByProfileId(client, product.seller_id);
    } catch (e) {
      userStats = null;
    }
  }
  return { product, sellerProducts, userStats };
}


  export default function ProductDetailPage({ loaderData }: Route.ComponentProps) {
  const { product, sellerProducts, userStats } = loaderData;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);


  const isFree = product.price_type === "Free";

  // Helper function to add location to URLs
  const addLocationToUrl = (url: string) => {
    if (location && location !== "Bangkok") {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}location=${location}`;
    }
    return url;
  };

  // Handle contact seller button click
  const handleContactSeller = () => {
    // Navigate to messages page with product context
    navigate(addLocationToUrl("/my/messages"), {
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
            {/* 구분선 위 */}
            <div className="flex flex-row items-center justify-between -mb-1">
              <div className="w-4/6 flex flex-row text-2xl font-semibold text-gray-700">Seller Information</div>
              <div className="w-2/6 flex flex-row items-center gap-3 justify-start">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={product.seller_avatar || undefined} alt={product.seller_name || 'Seller'} />
                  <AvatarFallback>
                    {product.seller_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 text-sm">{product.seller_name}</span>
                  {product.seller_bio && (
                    <span className="italic text-gray-500 text-sm mt-0.5">{product.seller_bio}</span>
                  )}
                </div>
              </div>
            </div>
            <hr className="my-3 border-gray-200" />
            {/* 구분선 아래 */}
            <div className="flex flex-row items-center gap-8">
              {/* 왼쪽 80%: 상품 이미지 */}
              <div className="w-4/6 flex flex-row gap-2">
                {sellerProducts && sellerProducts.length > 0 ? (
                  sellerProducts
                    .slice()
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((p: any) => (
                      <a
                        key={p.product_id}
                        href={`/secondhand/product/${p.product_id}`}
                        title={p.title}
                        className="block flex-1 aspect-square rounded overflow-hidden border border-gray-200 hover:border-purple-400 transition"
                        style={{ minWidth: 0 }}
                      >
                        <img
                          src={p.primary_image?.startsWith('/') ? p.primary_image : '/toy1.png'}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))
                ) : (
                  <div className="flex-1 text-xs text-gray-400 italic flex items-center justify-center h-14">No other items</div>
                )}
              </div>
              {/* 오른쪽 20%: user stats */}
              <div className="w-2/6 min-w-[120px] flex flex-col gap-2 text-sm text-gray-700 pl-8 items-start justify-end">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Member since:</span> {product.seller_joined_at ? product.seller_joined_at.slice(0, 10) : 'N/A'}
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircleReplyIcon className="w-4 h-4 text-red-500" />
                  <span className="font-medium">Response Rate:</span> {product.seller_response_rate || 'N/A'}
                </div>
                <div className="flex items-center gap-2">
                  <EyeIcon className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Response Time:</span> {product.seller_response_time || 'N/A'}
                </div>
                <div className="flex items-center gap-2">
                  <PackageIcon className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Listings:</span> {userStats?.total_listings ?? 'N/A'}
                </div>
                <div className="flex items-center gap-2">
                  <PackageIcon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Sold Items:</span> {userStats?.sold_items ?? 'N/A'}
                </div>
                <div className="flex items-center gap-2">
                  <PackageIcon className="w-4 h-4 text-green-700" />
                  <span className="font-medium">Active Listings:</span> {userStats?.active_listings ?? 'N/A'}
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUpIcon className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">Total Sales:</span> {userStats?.total_sales ?? 'N/A'}
                </div>
                <div className="flex items-center gap-2">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">Avg Sale Price:</span> {userStats?.avg_sale_price ?? 'N/A'}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 