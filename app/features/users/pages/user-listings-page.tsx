import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Badge } from "../../../common/components/ui/badge";
import { Separator } from "../../../common/components/ui/separator";
import { Link, useLoaderData, useFetcher } from "react-router";
import { Loader2 } from "lucide-react";
import { ProductCard } from "../../products/components/product-card";
import { makeSSRClient } from "~/supa-client";
import { markProductAsSold } from "../../products/mutations";
import { getUserListings } from "../queries";

export const loader = async ({ request }: any) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return { listings: [] };
  }
  const listings = await getUserListings(client, { userId: user.id });
  return { listings };
};

export const action = async ({ request }: any) => {
  const formData = await request.formData();
  const productId = formData.get("productId");
  const { client } = makeSSRClient(request);
  await markProductAsSold(client, Number(productId));
  return { success: true };
};

export default function UserListingsPage() {
  const { listings } = useLoaderData() as { listings: any[] };
  const fetcher = useFetcher();

  // Debug: listings 데이터 확인
  console.log("User listings:", listings.map(listing => ({
    id: listing.product_id,
    title: listing.title,
    primary_image: listing.primary_image,
    has_image: !!listing.primary_image
  })));

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start mx-auto sm:max-w-[100vw] md:max-w-[100vw]">
          {listings.map((listing: any) => (
            <div key={listing.product_id} className="relative">
              <ProductCard
                productId={listing.product_id}
                image={listing.primary_image || "/lemore-logo.png"}
                title={listing.title}
                price={listing.price}
                currency={listing.currency}
                priceType={listing.price_type}
                seller={listing.seller_name}
                likes={listing.likes_count || 0}
                is_sold={listing.is_sold}
                category={listing.category_name}
                showSoldBadge={true}
                sellerStats={undefined}
              />
              {!listing.is_sold && (
                <fetcher.Form method="post" action="/my/listings/mark-as-sold">
                  <input type="hidden" name="productId" value={listing.product_id} />
                  <Button type="submit" size="sm" className="absolute top-2 right-2 z-20" disabled={fetcher.state === 'submitting'}>
                    {fetcher.state === 'submitting' && fetcher.formData?.get('productId') === listing.product_id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Marking...
                      </>
                    ) : (
                      "Mark as Sold"
                    )}
                  </Button>
                </fetcher.Form>
              )}
            </div>
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