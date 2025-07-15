import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Badge } from "../../../common/components/ui/badge";
import { Separator } from "../../../common/components/ui/separator";
import { Link } from "react-router";
import { ProductCard } from "../../products/components/product-card";



export default function UserListingsPage() {
  // Mock data for user listings
  const conditions = ["New", "Like New", "Good", "Fair", "Poor"] as const;
  const categories = ["Electronics", "Clothing", "Home goods", "Sports & Outdoor", "Books", "Toys and games"];
  
  const listings = Array.from({ length: 6 }, (_, index) => ({
    id: `user-listing-${index + 1}`,
    title: `My Product ${index + 1}`,
    price: Math.floor(Math.random() * 5000) + 100,
    currency: "THB",
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    location: "Bangkok, Thailand",
    image: "/sample.png",
    sellerId: "current-user",
    isSold: Math.random() > 0.7,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  }));

  return (
    <div className="container mx-auto px-0 py-8 md:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-2">
              You have {listings.length} listing{listings.length !== 1 ? 's' : ''} in total
            </p>
          </div>
          <Button asChild>
            <Link to="/secondhand/submit-a-listing">
              Create New Listing
            </Link>
          </Button>
        </div>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Listings Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't created any listings yet. Start selling your items today!
            </p>
            <Button asChild>
              <Link to="/secondhand/submit-a-listing">
                Create Your First Listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing: any) => (
            <ProductCard 
              key={listing.id}
              productId={listing.id}
              image={listing.image}
              title={listing.title}
              price={listing.price}
              currency={listing.currency}
              priceType="fixed"
              seller={listing.sellerId}
              likes={0}
              is_sold={listing.isSold}
            />
          ))}
        </div>
      )}

      {listings.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" asChild>
            <Link to="/my/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
} 