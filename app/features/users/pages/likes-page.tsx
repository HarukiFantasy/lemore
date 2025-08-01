import React, { useState } from "react";
import { Link, redirect } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { ProductCard } from "~/features/products/components/product-card";
import { HeartIcon, ArrowUpDownIcon } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "~/common/components/ui/select";
import { makeSSRClient } from "~/supa-client";
import { Route } from './+types/likes-page';
import { getLikedProductsByUserId } from '../queries';
import { DateTime } from "luxon";

interface LoaderData {
  likedProducts: any[];
}

interface LikedItem {
  id: string;
  type: "product";
  title?: string;
  createdAt?: string;
  products?: any;
  [key: string]: any;
}

export const meta = () => {
  return [
    { title: "My Likes | Lemore" },
    { name: "description", content: "View your liked items on Lemore" },
  ];
};

export const loader = async ({request}: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return redirect('/auth/login');
  }
  const likedProducts = await getLikedProductsByUserId(client, { profileId: user.id });
  return { likedProducts };
};

export default function LikesPage({ loaderData }: { loaderData: LoaderData }) {
  const [sortBy, setSortBy] = useState("date");
  const [likedProducts, setLikedProducts] = useState(loaderData.likedProducts);

  // Handle unlike product
  const handleUnlikeProduct = (productId: string) => {
    setLikedProducts(prev => prev.filter(product => product.product_id !== productId));
  };

  // Get filtered items based on type
  const getFilteredItems = (): LikedItem[] => {
    const productsWithType = likedProducts.map(product => ({
      ...product,
      type: "product" as const,
      id: product.product_id,
      title: product.products?.title,
      createdAt: product.created_at
    }));
    
    // Sort items
    return productsWithType.sort((a, b) => {
      switch (sortBy) {
        case "price":
          const priceA = a.products?.price || 0;
          const priceB = b.products?.price || 0;
          return priceA - priceB;
        case "likes":
          const likesA = a.products?.likes_count || 0;
          const likesB = b.products?.likes_count || 0;
          return likesB - likesA;
        case "date":
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
  };

  const filteredAndSortedItems = getFilteredItems();
  const totalItems = likedProducts.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full md:w-[90%] mx-auto px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <HeartIcon className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">My Likes</h1>
          </div>
          <p className="text-gray-600">
            {totalItems} item{totalItems !== 1 ? 's' : ''} you've liked
          </p>
        </div>

        {/* Sort */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 justify-end">
              <ArrowUpDownIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date Added</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="likes">Most Liked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        {filteredAndSortedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedItems.map((item) => (
              <div key={`${item.type}-${item.id}`} className="relative group">
                {item.type === "product" ? (
                  <ProductCard
                    productId={item.product_id}
                    image={item.products?.primary_image || '/toy1.png'}
                    title={item.products?.title}
                    price={item.products?.price}
                    seller={item.products?.seller_name}
                    currency={item.products?.currency}
                    priceType={item.products?.price_type}
                    likes={item.products?.likes_count || 0}
                    isLikedByUser={true}
                  />
                ) : null}
                {/* Unlike Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={() => handleUnlikeProduct(item.product_id)}
                >
                  Unlike
                </Button>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="text-center py-12">
            <CardContent>
              <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No liked items yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start exploring and like items you're interested in!
              </p>
              <Button asChild>
                <Link to="/secondhand/browse-listings">
                  Browse Listings
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        {totalItems > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link to="/secondhand/browse-listings">
                Browse More Items
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/my/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 