import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Badge } from "../../../common/components/ui/badge";
import { Separator } from "../../../common/components/ui/separator";
import { Link, useLoaderData, useFetcher } from "react-router";
import { ProductCard } from "../../products/components/product-card";
import { makeSSRClient } from "~/supa-client";
import { markProductAsSold } from "../../products/mutations";

export const loader = async ({ request }: any) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return { listings: [] };
  }
  const { data: listings, error } = await client
    .from("products")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });
  return { listings: listings || [] };
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
            <div key={listing.product_id} className="relative">
              <ProductCard
                productId={listing.product_id}
                image={listing.primary_image || "/sample.png"}
                title={listing.title}
                price={listing.price}
                currency={listing.currency}
                priceType={listing.price_type}
                seller={listing.seller_id}
                likes={listing.likes_count || 0}
                is_sold={listing.is_sold}
                category={listing.category_name}
                showSoldBadge={true}
                sellerStats={undefined}
              />
              {!listing.is_sold && (
                <fetcher.Form method="post" action="/my/listings/mark-as-sold">
                  <input type="hidden" name="productId" value={listing.product_id} />
                  <Button type="submit" size="sm" className="absolute top-2 right-2 z-20">Mark as Sold</Button>
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