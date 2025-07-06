import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../common/components/ui/avatar";
import { Separator } from "../../../common/components/ui/separator";
import { Link } from "react-router";
import { NumberTicker } from 'components/magicui/number-ticker';



export default function DashboardPage({ }: any) {
  // Mock data for dashboard stats
  const stats = {
    activeListings: 12,
    totalSales: 2450,
    totalSalesChange: "+15% from last month",
    unreadMessages: 3,
    unreadMessagesChange: "+2 from yesterday"
  };

  // Mock data for recent activity
  const recentActivity = [
    {
      id: 1,
      title: "New message from Sarah about your laptop listing",
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      title: "Your iPhone listing was viewed 15 times",
      timestamp: "4 hours ago"
    },
    {
      id: 3,
      title: "Payment received for your camera sale",
      timestamp: "1 day ago"
    },
    {
      id: 4,
      title: "New follower: @tech_enthusiast",
      timestamp: "2 days ago"
    }
  ];
  
  return (
    <div className="container mx-auto px-0 py-8 md:px-8">
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
              <div className="text-3xl font-bold text-blue-600">{stats.activeListings}</div>
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
            <div className="text-3xl font-bold text-green-600">$<NumberTicker value={stats.totalSales} className="text-3xl font-bold text-green-600"/></div>
            <p className="text-sm text-gray-500 mt-1">{stats.totalSalesChange}</p>
          </CardContent>
        </Card>

        <Link to="/my/messages">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Messages</CardTitle>
              <CardDescription>Unread messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.unreadMessages}</div>
              <p className="text-sm text-gray-500 mt-1">{stats.unreadMessagesChange}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(recentActivity || []).map((activity: any, index: number) => (
                <div key={activity.id}>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/sample.png" alt="John Doe" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                  {index < (recentActivity || []).length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/my/settings">
                  <span className="mr-2">⚙️</span>
                  Account Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 