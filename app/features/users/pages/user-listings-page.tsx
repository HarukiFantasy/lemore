import React from "react";
import { Card, CardContent } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Link } from "react-router";
import { ProductCard } from "../../products/components/product-card";

// Mock user listings function (임시)
async function fetchUserListings(userId: string) {
  const conditions = ["New", "Like New", "Good", "Fair", "Poor"] as const;
  const categories = ["Electronics", "Clothing", "Home goods", "Sports & Outdoor", "Books", "Toys and games"];
  
  return Array.from({ length: 6 }, (_, index) => ({
    id: `user-listing-${index + 1}`,
    title: `My Product ${index + 1}`,
    price: Math.floor(Math.random() * 5000) + 100,
    currency: "THB",
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    location: "Bangkok, Thailand",
    image: "/sample.png",
    sellerId: userId,
    isSold: Math.random() > 0.7,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  }));
}

// Meta function for SEO
export const meta = () => {
  return [
    { title: "My Listings | Lemore" },
    { name: "description", content: "View and manage all your listings on Lemore" },
  ];
};

// Loading component
function UserListingsLoading() {
  return (
    <div className="container mx-auto px-0 py-8 md:px-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <div className="h-48 bg-gray-200 rounded-t animate-pulse"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Loader function
export const loader = async ({ request }: any) => {
  try {
    // 실제 환경에서는 사용자 ID를 세션이나 토큰에서 가져와야 함
    const userId = "current-user"; // 임시 사용자 ID
    
    // 사용자의 모든 리스팅 가져오기
    const userListings = await fetchUserListings(userId);
    
    return { listings: userListings };
  } catch (error) {
    console.error("User listings loader error:", error);
    
    if (error instanceof Response) {
      throw error;
    }
    
    throw new Response("Failed to load user listings", { status: 500 });
  }
};

// Error Boundary
export function ErrorBoundary({ error }: any) {
  let message = "Something went wrong";
  let details = "An unexpected error occurred while loading your listings.";

  if (error instanceof Response) {
    if (error.status === 400) {
      message = "Invalid Request";
      details = error.statusText || "The request contains invalid parameters.";
    } else if (error.status === 500) {
      message = "Server Error";
      details = "An internal server error occurred. Please try again later.";
    }
  } else if (error instanceof Error) {
    details = error.message;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">{message}</h1>
            <p className="text-gray-600 mb-6">{details}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function UserListingsPage({ loaderData }: any) {
  const { listings } = loaderData || { listings: [] };

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
              isSold={listing.isSold}
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