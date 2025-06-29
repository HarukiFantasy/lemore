import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../common/components/ui/avatar";
import { Badge } from "../../../common/components/ui/badge";
import { Separator } from "../../../common/components/ui/separator";
import { useLoaderData, useRouteError, isRouteErrorResponse } from "react-router";
import type { Route } from "./+types/notifications-page";
import { fetchMockNotifications } from "../queries";

// Loader function
export const loader = async ({ request }: Route.LoaderArgs) => {
  try {
    const url = new URL(request.url);
    
    // 간단한 파라미터 처리 (기본값과 타입 변환만)
    const filters = {
      type: (url.searchParams.get("type") || "all") as "all" | "message" | "sale" | "review" | "system" | "price_drop",
      unreadOnly: url.searchParams.get("unreadOnly") === "true",
      limit: parseInt(url.searchParams.get("limit") || "20"),
      page: parseInt(url.searchParams.get("page") || "1"),
    };

    // Mock 사용자 ID (실제로는 인증된 사용자 ID를 사용해야 함)
    const userId = "current-user-id";

    const result = await fetchMockNotifications(userId, filters);

    if (!result.success) {
      throw new Response(result.errors?.join(", ") || "Failed to load notifications", { 
        status: 500,
        statusText: "Failed to load notifications"
      });
    }

    return {
      notifications: result.data?.notifications || [],
      totalCount: result.data?.totalCount || 0,
      unreadCount: result.data?.unreadCount || 0,
      hasMore: result.data?.hasMore || false,
      filters: result.data?.filters || filters
    };

  } catch (error) {
    console.error("Loader error:", error);
    
    if (error instanceof Response) {
      throw error;
    }
    
    throw new Response("Failed to load notifications", { 
      status: 500,
      statusText: "Internal server error"
    });
  }
};

// Error Boundary
export function ErrorBoundary() {
  const error = useRouteError();

  let message = "Something went wrong";
  let details = "An unexpected error occurred while loading notifications.";

  if (isRouteErrorResponse(error)) {
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

export default function NotificationsPage() {
  const { notifications, totalCount, unreadCount, hasMore, filters } = useLoaderData<typeof loader>();

  // 알림 타입별 개수 계산
  const getNotificationCountByType = (type: string) => {
    return notifications.filter(n => type === "all" || n.type === type).length;
  };

  // 시간 포맷팅 함수
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return time.toLocaleDateString();
  };

  // 알림 타입별 아이콘과 색상
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "message":
        return { icon: "💬", bgColor: "bg-blue-50", borderColor: "border-blue-500" };
      case "sale":
        return { icon: "💰", bgColor: "bg-green-50", borderColor: "border-green-500" };
      case "review":
        return { icon: "⭐", bgColor: "bg-yellow-50", borderColor: "border-yellow-500" };
      case "system":
        return { icon: "📢", bgColor: "bg-gray-50", borderColor: "border-gray-500" };
      case "price_drop":
        return { icon: "📉", bgColor: "bg-purple-50", borderColor: "border-purple-500" };
      default:
        return { icon: "🔔", bgColor: "bg-gray-50", borderColor: "border-gray-500" };
    }
  };

  return (
    <div className="container mx-auto px-0 py-8 md:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Stay updated with your latest activities and messages.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Mark All Read</Button>
          <Button variant="outline">Settings</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter notifications by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant={filters.type === "all" ? "default" : "ghost"} 
                  className="w-full justify-start"
                >
                  <span className="mr-2">🔔</span>
                  All Notifications
                  <Badge className="ml-auto">{totalCount}</Badge>
                </Button>
                <Button 
                  variant={filters.type === "message" ? "default" : "ghost"} 
                  className="w-full justify-start"
                >
                  <span className="mr-2">💬</span>
                  Messages
                  <Badge className="ml-auto">{getNotificationCountByType("message")}</Badge>
                </Button>
                <Button 
                  variant={filters.type === "sale" ? "default" : "ghost"} 
                  className="w-full justify-start"
                >
                  <span className="mr-2">💰</span>
                  Sales
                  <Badge className="ml-auto">{getNotificationCountByType("sale")}</Badge>
                </Button>
                <Button 
                  variant={filters.type === "review" ? "default" : "ghost"} 
                  className="w-full justify-start"
                >
                  <span className="mr-2">⭐</span>
                  Reviews
                  <Badge className="ml-auto">{getNotificationCountByType("review")}</Badge>
                </Button>
                <Button 
                  variant={filters.type === "system" ? "default" : "ghost"} 
                  className="w-full justify-start"
                >
                  <span className="mr-2">📢</span>
                  System
                  <Badge className="ml-auto">{getNotificationCountByType("system")}</Badge>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Your latest updates and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No notifications found.</p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const style = getNotificationStyle(notification.type);
                    return (
                      <div 
                        key={notification.id}
                        className={`flex items-start space-x-4 p-4 ${style.bgColor} rounded-lg border-l-4 ${style.borderColor}`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/sample.png" alt="Sarah Miller" />
                          <AvatarFallback>SM</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{notification.title}</h4>
                            <span className="text-xs text-gray-500">{formatTimeAgo(notification.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                          {notification.actions && notification.actions.length > 0 && (
                            <div className="flex space-x-2 mt-3">
                              {notification.actions.map((action, index) => (
                                <Button 
                                  key={index} 
                                  size="sm" 
                                  variant={action.variant}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {hasMore && (
                  <div className="text-center py-4">
                    <Button variant="outline">Load More Notifications</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 