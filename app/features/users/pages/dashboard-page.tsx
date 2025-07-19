import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../common/components/ui/avatar";
import { Separator } from "../../../common/components/ui/separator";
import { Link, redirect } from "react-router";
import { NumberTicker } from 'components/magicui/number-ticker';
import { getDashboard, getUserSalesStatsByProfileId } from "../queries";
import type { Route } from "./+types/dashboard-page";
import { makeSSRClient } from "~/supa-client";

interface LoaderData {
  dashboard: any;
}

export const loader = async ({request}: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return redirect('/auth/login');
  }
  const dashboard = await getDashboard(client, { profileId: user.id });
  let userStats = null;
  try {
    userStats = await getUserSalesStatsByProfileId(client, user.id);
  } catch (e) {
    userStats = null;
  }
  return { dashboard, userStats };
};

export default function DashboardPage({ loaderData }: { loaderData: LoaderData & { userStats: any } }) {
  const { dashboard, userStats } = loaderData;
  return (
    <div className="container mx-auto px-5 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your account.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Stats */}
        <Link to="/my/listings">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">My Listings</CardTitle>
              <CardDescription>Items you've uploaded</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{userStats?.total_listings ?? 0}</div>
              <p className="text-sm text-gray-500 mt-1">Click to view all</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Sales</CardTitle>
            <CardDescription>Your earnings this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">THB <NumberTicker value={userStats?.total_sales ?? 0} className="text-3xl font-bold text-green-600"/></div>
            <p className="text-sm text-gray-500 mt-1">{dashboard.total_sales_change}</p>
          </CardContent>
        </Card>

        <Link to="/my/messages">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Messages</CardTitle>
              <CardDescription>Unread messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{dashboard.unread_messages}</div>
              <p className="text-sm text-gray-500 mt-1">{dashboard.unread_messages_change}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/secondhand/submit-a-listing">
                  <span className="mr-2">📝</span>
                  Create New Listing
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/my/messages">
                  <span className="mr-2">💬</span>
                  View Messages
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/my/listings">
                  <span className="mr-2">📊</span>
                  View My Listings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 