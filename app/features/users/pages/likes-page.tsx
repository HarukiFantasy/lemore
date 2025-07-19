import React, { useState } from "react";
import { Link, redirect } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { ProductCard } from "~/features/products/components/product-card";
import { HeartIcon, FilterIcon, ArrowUpDownIcon } from "lucide-react";
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

interface LoaderData {
  likedProducts: any[];
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
  const [filterBy, setFilterBy] = useState("all");
  const [likedProducts, setLikedProducts] = useState(loaderData.likedProducts);

  // Handle unlike
  const handleUnlike = (productId: string) => {
    setLikedProducts(prev => prev.filter(product => product.id !== productId));
  };

  // Filter and sort products
  const filteredAndSortedProducts = likedProducts
    .filter(product => {
      if (filterBy === "all") return true;
      return product.category === filterBy;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          const priceA = a.price;
          const priceB = b.price;
          return priceA - priceB;
        case "likes":
          return b.likes - a.likes;
        case "date":
        default:
          // Mock date sorting (in real app, use actual dates)
          return 0;
      }
    });

  const categories = ["all", "Electronics", "Clothing", "Sports & Outdoor", "Home goods", "Books", "Toys and games"];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="w-full md:w-[90%] mx-auto px-2 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <HeartIcon className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">My Likes</h1>
          </div>
          <p className="text-gray-600">
            {likedProducts.length} item{likedProducts.length !== 1 ? 's' : ''} you've liked
          </p>
        </div>

        {/* Filters and Sort */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FilterIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                  <Select value={filterBy} onValueChange={setFilterBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === "all" ? "All Categories" : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
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
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <div key={product.product_id} className="relative group">
                <ProductCard
                  productId={product.product_id}
                  image={product.products?.primary_image || '/toy1.png'}
                  title={product.products?.title}
                  price={product.products?.price}
                  seller={product.products?.seller_name}
                  currency={product.products?.currency}
                  priceType={product.products?.price_type}
                />
                {/* Unlike Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={() => handleUnlike(product.product_id)}
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
        {likedProducts.length > 0 && (
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