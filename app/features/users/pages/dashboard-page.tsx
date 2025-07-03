import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../common/components/ui/avatar";
import { Separator } from "../../../common/components/ui/separator";
import { Link } from "react-router";
// Mock user listings count function (임시)
async function fetchUserListingsCount(userId: string) {
  // 실제로는 데이터베이스에서 사용자의 활성 리스팅 개수를 가져옴
  return Math.floor(Math.random() * 10) + 1; // 1-10 사이의 랜덤 값
}

// Mock dashboard data function (임시)
async function fetchMockDashboardData() {
  return {
    success: true,
    data: {
      stats: {
        activeListings: 0,
        totalSales: 0,
        unreadMessages: 0,
        activeListingsChange: '+12%',
        totalSalesChange: '+8%',
        unreadMessagesChange: '-5%'
      },
      recentActivity: [
        {
          id: '1',
          type: 'listing_created',
          title: 'New listing created',
          description: 'You created a new listing: Vintage Bicycle',
          timestamp: '2 hours ago',
          icon: '📦'
        },
        {
          id: '2',
          type: 'message_received',
          title: 'New message received',
          description: 'Sarah Johnson sent you a message about your listing',
          timestamp: '4 hours ago',
          icon: '💬'
        },
        {
          id: '3',
          type: 'listing_viewed',
          title: 'Listing viewed',
          description: 'Your Vintage Bicycle listing was viewed 15 times today',
          timestamp: '1 day ago',
          icon: '👁️'
        }
      ]
    }
  };
}
import { NumberTicker } from 'components/magicui/number-ticker';

// Meta function for SEO
export const meta = () => {
  return [
    { title: "Dashboard | Lemore" },
    { name: "description", content: "Manage your account, view stats, and track your activity on Lemore" },
  ];
};

// Loading component
function DashboardLoading() {
  return (
    <div className="container mx-auto px-0 py-8 md:px-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-64 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Loader function
export const loader = async ({ request }: any) => {
  try {
    // 실제 환경에서는 사용자 ID를 세션이나 토큰에서 가져와야 함
    const userId = "current-user"; // 임시 사용자 ID
    
    // 대시보드 데이터 가져오기
    const dashboardResult = await fetchMockDashboardData();
    
    if (!dashboardResult.success || !dashboardResult.data) {
      throw new Response("Failed to load dashboard data", { 
        status: 500,
        statusText: "Unknown error"
      });
    }

    // 사용자의 리스팅 개수 가져오기
    const userListingsCount = await fetchUserListingsCount(userId);

    return {
      ...dashboardResult.data,
      stats: {
        ...dashboardResult.data.stats,
        activeListings: userListingsCount
      }
    };
  } catch (error) {
    console.error("Dashboard loader error:", error);
    
    if (error instanceof Response) {
      // 이미 Response 객체인 경우 그대로 던지기
      throw error;
    }
    
    if (error instanceof Error) {
      // 데이터베이스 에러인 경우 500 Internal Server Error 반환
      if (error.message.includes("Failed to fetch")) {
        throw new Response("Database connection failed", { status: 500 });
      }
    }
    
    // 기타 에러는 500 Internal Server Error 반환
    throw new Response("Internal server error", { status: 500 });
  }
};

// Error Boundary
export function ErrorBoundary({ error }: any) {
  let message = "Something went wrong";
  let details = "An unexpected error occurred while loading your dashboard.";

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

export default function DashboardPage({ loaderData }: any) {
  // loaderData가 undefined일 수 있으므로 기본값 제공
  const { stats, recentActivity } = loaderData || {
    stats: {
      activeListings: 0,
      totalSales: 0,
      unreadMessages: 0,
      activeListingsChange: '',
      totalSalesChange: '',
      unreadMessagesChange: ''
    },
    recentActivity: []
  };

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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Messages</CardTitle>
            <CardDescription>Unread messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.unreadMessages}</div>
            <p className="text-sm text-gray-500 mt-1">{stats.unreadMessagesChange}</p>
          </CardContent>
        </Card>
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