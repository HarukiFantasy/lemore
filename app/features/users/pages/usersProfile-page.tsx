import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../common/components/ui/avatar";
import { Separator } from "../../../common/components/ui/separator";
import type { Route } from "./+types/usersProfile-page";
import { makeSSRClient } from "~/supa-client";
import {  getUserByUsername, getUserSalesStatsByProfileId } from "../queries";
import { redirect } from 'react-router';
import { getProductByUsername } from '~/features/products/queries';
import { ProductCard } from '~/features/products/components/product-card';
import { type Location } from "~/constants";
import { Badge } from "../../../common/components/ui/badge";


export const loader = async ({request, params}: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const { data: {user} } = await client.auth.getUser();
  
  if (!user) {
    return redirect('/auth/login');
  }

  // URL 파라미터에서 대상 유저의 username을 가져옴
  const targetUsername = params.username;
  if (!targetUsername) {
    return redirect('/'); 
  }
  const targetUserProfile = await getUserByUsername(client, { username: targetUsername });
  const userProducts = await getProductByUsername(client, targetUsername);

  // 사용자 통계 가져오기
  const { data: listings, error: listingsError } = await client
    .from("products_listings_view")
    .select("product_id")
    .eq("seller_name", targetUsername);
    
  if (listingsError) {
    console.error("Error fetching user listings:", listingsError);
  }
  
  // 사용자의 리뷰 평점 가져오기
  const { data: reviews, error: reviewsError } = await client
    .from("local_reviews_list_view")
    .select("rating")
    .eq("author_username", targetUsername);
    
  if (reviewsError) {
    console.error("Error fetching user reviews:", reviewsError);
  }
  
  // 평균 평점 계산
  const averageRating = reviews && reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length 
    : 0;

  const userStats = targetUserProfile.profile_id
    ? await getUserSalesStatsByProfileId(client, targetUserProfile.profile_id)
    : null;

  return { 
    targetUserProfile,
    userProducts,
    userStats,
  };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) {
    return redirect('/auth/login');
  }

  const formData = await request.formData();
  const bio = formData.get('bio') as string;
  const location = formData.get('location') as string;
  const avatar_url = formData.get('avatar_url') as string;

  try {
    // 사용자 프로필 업데이트
    const { error } = await client
      .from('user_profiles')
      .update({
        bio: bio || null,
        location: location as Location || null,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString()
      })
      .eq('profile_id', user.id);

    if (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile' };
    }

    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Action error:', error);
    return { success: false, error: 'An error occurred while updating profile' };
  }
};

export default function UsersProfilePage({ loaderData }: Route.ComponentProps) { 
  const targetUserProfile = (loaderData as any)?.targetUserProfile;
  const userProducts = (loaderData as any)?.userProducts || [];
  const userStats = (loaderData as any)?.userStats;
  if (!targetUserProfile) {
    return (
      <div className="container mx-auto px-0 py-8 md:px-8">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-900">User Not Found</h1>
          <p className="text-gray-600 mt-2">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-0 py-8 md:px-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{targetUserProfile.username}'s Profile</h1>
            <p className="text-gray-600 mt-2">View user profile and their listings.</p>
          </div>
          {targetUserProfile?.bio && (
            <div className="sm:text-right">
              <p className="text-sm text-gray-500 italic leading-relaxed max-w-xs">
                "{targetUserProfile.bio}" in {targetUserProfile.location}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column - Profile Overview and Details */}
        <div className="space-y-8 lg:col-span-1">
          {/* Profile Overview */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={targetUserProfile?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {targetUserProfile?.username?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{targetUserProfile?.username}</CardTitle>
              {/* Level Badge */}
              {targetUserProfile?.level && (
                <div className="flex justify-center mt-2">
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border border-purple-200">
                    {targetUserProfile.level}
                  </Badge>
                </div>
              )}
              <CardDescription>
                Member since {targetUserProfile?.created_at ? 
                  new Date(targetUserProfile.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  }) : 'Unknown'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userStats?.total_listings || 0}</div>
                  <div className="text-sm text-gray-500">Total Listings</div>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userStats?.total_likes || 0}</div>
                  <div className="text-sm text-gray-500">Total Likes</div>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{userStats?.sold_items || 0}</div>
                  <div className="text-sm text-gray-500">Total Sold</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - User's Products */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>{targetUserProfile?.username}'s Listings</CardTitle>
              <CardDescription>Products and items listed by this user</CardDescription>
            </CardHeader>
            <CardContent>
              {userProducts && userProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 [&_.group]:h-auto [&_.group>div]:h-auto [&_.group>div>div:first-child]:h-32 [&_.group>div>div:first-child]:sm:h-36 [&_.group>div>div:first-child]:md:h-40">
                  {userProducts.map((product: any, index: number) => (
                    <ProductCard
                      key={product.product_id || index}
                      productId={product.product_id}
                      image={product.primary_image || '/lemore-logo.png'}
                      title={product.title || "Product Title"}
                      price={product.price || 0}
                      currency="THB"
                      seller={targetUserProfile?.username || "Unknown"}
                      likes={product.likes_count || 0}
                      is_sold={product.is_sold || false}
                      priceType={product.price_type || "fixed"}
                      category={product.category_name || "Electronics"}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg">No listings found</div>
                  <p className="text-sm text-gray-400 mt-2">
                    This user hasn't listed any products yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
