import React, { useState } from "react";
import { Link } from "react-router";
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

export const meta = () => {
  return [
    { title: "My Likes | Lemore" },
    { name: "description", content: "View your liked items on Lemore" },
  ];
};

// Mock data for liked products
const mockLikedProducts = [
  {
    id: "product-1",
    title: "Vintage Bicycle - Perfect Condition",
    price: 2500,
    currency: "THB",
    priceType: "fixed",
    image: "/sample.png",
    seller: "Sarah Johnson",
    likes: 15,
    category: "Sports & Outdoor",
    condition: "Like New",
    location: "Bangkok",
    postedDate: "2 days ago"
  },
  {
    id: "product-2",
    title: "MacBook Pro 2021 - Excellent Condition",
    price: 4500,
    currency: "THB",
    priceType: "fixed",
    image: "/sample.png",
    seller: "TechGuru",
    likes: 32,
    category: "Electronics",
    condition: "Good",
    location: "Chiang Mai",
    postedDate: "1 week ago"
  },
  {
    id: "product-3",
    title: "Designer Handbag - Authentic",
    price: 8500,
    currency: "THB",
    priceType: "fixed",
    image: "/sample.png",
    seller: "Fashionista",
    likes: 8,
    category: "Clothing",
    condition: "Like New",
    location: "Phuket",
    postedDate: "3 days ago"
  },
  {
    id: "product-4",
    title: "Gaming Console - Complete Set",
    price: 12000,
    currency: "THB",
    priceType: "fixed",
    image: "/sample.png",
    seller: "GameMaster",
    likes: 25,
    category: "Electronics",
    condition: "Good",
    location: "Bangkok",
    postedDate: "5 days ago"
  },
  {
    id: "product-5",
    title: "Vintage Camera Collection",
    price: 15000,
    currency: "THB",
    priceType: "fixed",
    image: "/sample.png",
    seller: "PhotoPro",
    likes: 12,
    category: "Electronics",
    condition: "Fair",
    location: "Pattaya",
    postedDate: "1 week ago"
  },
  {
    id: "product-6",
    title: "Mountain Bike - Professional Grade",
    price: 18500,
    currency: "THB",
    priceType: "fixed",
    image: "/sample.png",
    seller: "BikeExpert",
    likes: 19,
    category: "Sports & Outdoor",
    condition: "Good",
    location: "Chiang Mai",
    postedDate: "4 days ago"
  }
];

export default function LikesPage() {
  const [sortBy, setSortBy] = useState("date");
  const [filterBy, setFilterBy] = useState("all");
  const [likedProducts, setLikedProducts] = useState(mockLikedProducts);

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
      <div className="max-w-7xl mx-auto px-4 py-8">
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
              <div key={product.id} className="relative group">
                <ProductCard
                  productId={product.id}
                  image={product.image}
                  title={product.title}
                  price={product.price}
                  seller={product.seller}
                  likes={product.likes}
                  currency={product.currency}
                  priceType={product.priceType}
                />
                {/* Unlike Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={() => handleUnlike(product.id)}
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