import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "~/common/components/ui/button";
import { Card } from "~/common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { useNavigate, useSearchParams, useFetcher } from "react-router";
import { HeartIcon } from "lucide-react";
import { PackageIcon, MessageCircleReplyIcon, ThumbsUpIcon, StarIcon, CalendarIcon } from "lucide-react";
import { getProductById, getProductByUsername } from "../queries";
import { Route } from './+types/product-detail-page';
import {DateTime} from "luxon";
import { makeSSRClient } from "~/supa-client";
import { getUserSalesStatsByProfileId } from "~/features/users/queries";
import { Badge } from "~/common/components/ui/badge";
import { LazyImage } from "~/common/components/lazy-image";

export const meta = () => {
  return [
    { title: "Product Details | Lemore" },
    { name: "description", content: "View product details on Lemore" },
  ];
};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { productId } = params;
  const { client, headers } = makeSSRClient(request);
  
  if (isNaN(Number(productId))) {
    throw new Error("Invalid product ID");
  }

  // PHASE 2 OPTIMIZATION: Execute all queries in parallel
  const [product, authResult] = await Promise.all([
    // Get product details
    getProductById(client, Number(productId)),
    // Get current user authentication
    client.auth.getUser().catch(() => ({ data: { user: null } }))
  ]);

  // Early return if product not found
  if (!product) {
    return { product: null, sellerProducts: [], userStats: null, isLiked: false, currentUserId: null };
  }

  // PHASE 2 OPTIMIZATION: Execute dependent queries in parallel
  const currentUserId = authResult.data.user?.id || null;
  
  const parallelQueries = [];
  
  // Always fetch seller products if seller exists
  if (product.seller_name) {
    parallelQueries.push(
      getProductByUsername(client, product.seller_name)
        .then(products => products.filter((p: any) => p.product_id !== product.product_id).slice(0, 4))
    );
  } else {
    parallelQueries.push(Promise.resolve([]));
  }
  
  // Always fetch user stats if seller exists
  if (product.seller_id) {
    parallelQueries.push(
      getUserSalesStatsByProfileId(client, product.seller_id).catch(() => null)
    );
  } else {
    parallelQueries.push(Promise.resolve(null));
  }
  
  // Check if user liked this product (only if authenticated)
  if (currentUserId) {
    parallelQueries.push(
      client
        .from('product_likes')
        .select('*')
        .eq('product_id', Number(productId))
        .eq('user_id', currentUserId)
        .single()
        .then(() => true)
        .catch(() => false)
    );
  } else {
    parallelQueries.push(Promise.resolve(false));
  }

  // Execute all dependent queries in parallel (3x faster!)
  const [sellerProducts, userStats, isLiked] = await Promise.all(parallelQueries);

  return { product, sellerProducts, userStats, isLiked, currentUserId };
}


  export default function ProductDetailPage({ loaderData }: Route.ComponentProps) {
  const { product, sellerProducts, userStats, isLiked: initialIsLiked } = loaderData;
  const navigate = useNavigate();

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <p className="text-gray-500 mt-2">Sorry, the product you are looking for does not exist.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const [searchParams] = useSearchParams();
  const location = searchParams.get("location");
  const [selectedImage, setSelectedImage] = useState(0);
  const fetcher = useFetcher();
  
  // Optimistic like state management
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  // Update state when initial data changes
  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  // Handle like/unlike with optimistic updates
  const handleLikeClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Immediately update UI
    setIsLiked(!isLiked);
    
    // Submit to server
    fetcher.submit(
      { 
        productId: String(product.product_id),
        action: isLiked ? 'unlike' : 'like'
      },
      { method: "post", action: `/secondhand/${product.product_id}/like` }
    );
  }, [isLiked, product.product_id, fetcher.submit]);

  // Handle server response
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      // Only handle errors - let optimistic updates stay for success
      if (!fetcher.data.success) {
        // Revert on error
        setIsLiked(initialIsLiked);
      }
    }
  }, [fetcher.state, fetcher.data, initialIsLiked]);

  // Check if current user is the seller
  const isCurrentUserSeller = useMemo(() => 
    product.seller_id === loaderData.currentUserId,
    [product.seller_id, loaderData.currentUserId]
  );

  const isFree = useMemo(() => 
    product.price_type === "Free",
    [product.price_type]
  );

  // OPTIMIZED: Memoized helper function
  const addLocationToUrl = useCallback((url: string) => {
    if (location && location !== "Bangkok") {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}location=${location}`;
    }
    return url;
  }, [location]);

  // OPTIMIZED: Memoized contact seller handler
  const handleContactSeller = useCallback(() => {
    navigate(addLocationToUrl("/my/messages"), {
      state: {
        productId: product.product_id,
        productTitle: product.title,
        sellerId: product.seller_id,
        sellerName: product.seller_name,
        fromProduct: true
      }
    });
  }, [navigate, addLocationToUrl, product.product_id, product.title, product.seller_id, product.seller_name]);

  return (
    <div className="min-h-screen bg-gray-50 px-5">
      <div className="w-full md:w-[90%] mx-auto py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          
          {/* Product Images */}
          <div className="space-y-4 px-2 md:px-0">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm relative">
              <img 
                src={(Array.isArray(product.all_images) && product.all_images[selectedImage]?.image_url) || product.primary_image || `/no_image.png`}
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
                    src={image.image_url || `/no_image.png`}
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
          <div className="space-y-6 px-2 md:px-0">
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
              {isCurrentUserSeller ? (
                // Seller's view - Edit Product button
                <Button 
                  size="lg" 
                  className="flex-1"
                  variant="default"
                  onClick={() => navigate(`/secondhand/product/${product.product_id}/edit`)}
                >
                  Edit Product
                </Button>
              ) : (
                // Buyer's view - Contact Seller button
                <Button 
                  size="lg" 
                  className="flex-1"
                  disabled={product.is_sold || false}
                  variant={product.is_sold ? "secondary" : "default"}
                  onClick={handleContactSeller}
                >
                  {product.is_sold ? "Item Sold" : "Contact Seller"}
                </Button>
              )}
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleLikeClick}
                className={`transition-all duration-150 hover:scale-105 active:scale-95 ${
                  isLiked 
                    ? "text-rose-500 border-rose-300 bg-rose-50 hover:bg-rose-100" 
                    : "hover:border-gray-300"
                } ${fetcher.state === 'loading' ? 'animate-pulse' : ''}`}
                disabled={isCurrentUserSeller || product.is_sold}
              >
                <HeartIcon 
                  className={`w-5 h-5 mr-2 transition-all duration-150 ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-gray-600'}`} 
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
        <div className="mt-8 md:mt-12 px-2 md:px-0">
          <Card className="p-6">
            {/* Seller Information Title (항상 한 줄) */}
            <div className="flex flex-row items-center justify-between -mb-1">
              <div className="w-full text-2xl font-semibold text-gray-700">Seller Information</div>
            </div>
            <div className="flex flex-row items-center gap-3 mb-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src={product.seller_avatar || undefined} alt={product.seller_name || 'Seller'} />
                <AvatarFallback>
                  {product.seller_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'S'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900 text-sm">{product.seller_name}</span>
                {/* Level Badge */}
                {userStats?.level && (
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border border-purple-200 mt-1 w-fit">
                    {userStats.level}
                  </Badge>
                )}
                {product.seller_bio && (
                  <span className="italic text-gray-500 text-sm mt-0.5">{product.seller_bio}</span>
                )}
              </div>
            </div>
            <hr className="my-3 border-gray-200" />
            {/* 구분선 아래 */}
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* 왼쪽: 상품 이미지 (모바일에서는 위) */}
              <div className="w-full lg:w-4/6 flex flex-wrap gap-2 mb-4 lg:mb-0">
                {sellerProducts && sellerProducts.length > 0 ? (
                  sellerProducts
                    .slice()
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((p: any) => (
                      <a
                        key={p.product_id}
                        href={`/secondhand/product/${p.product_id}`}
                        title={p.title}
                        className="block w-20 h-20 md:w-35 md:h-35 rounded overflow-hidden border border-gray-200 hover:border-purple-400 transition flex-shrink-0"
                      >
                        <img
                          src={p.primary_image || '/no_image.png'}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))
                ) : (
                  <div className="w-full text-xs text-gray-400 italic flex items-center justify-center h-14">No other items</div>
                )}
              </div>
              {/* 오른쪽: user stats만 */}
              <div className="w-full lg:w-2/6 min-w-[120px] flex flex-col gap-2 text-sm text-gray-700 pl-0 lg:pl-8 items-start justify-end">
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Member since:</span> {product.seller_joined_at ? product.seller_joined_at.slice(0, 10) : 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <PackageIcon className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Listings:</span> {userStats?.total_listings ?? 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <PackageIcon className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Sold Items:</span> {userStats?.sold_items ?? 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 