import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../../common/components/ui/avatar";
import { Separator } from "../../../common/components/ui/separator";
import { Badge } from "../../../common/components/ui/badge";
import { useLoaderData, useRouteError, isRouteErrorResponse } from "react-router";
import type { Route } from './+types/messages-page';
import { fetchMockMessages } from "../queries";

// Meta function for SEO
export const meta: Route.MetaFunction = () => {
  return [
    { title: "Messages | Lemore" },
    { name: "description", content: "Connect with buyers and sellers in your community through messages" },
  ];
};

// Loader function
export const loader = async ({ request }: Route.LoaderArgs) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const unreadOnly = url.searchParams.get("unreadOnly") === "true";
    const limit = parseInt(url.searchParams.get("limit") || "20");

    // Mock user ID (실제로는 인증된 사용자 ID를 사용해야 함)
    const userId = "current-user-id";

    const result = await fetchMockMessages(userId, {
      search,
      unreadOnly,
      limit,
    });

    if (!result.success) {
      throw new Response(result.errors?.join(", ") || "Failed to load messages", { 
        status: 500,
        statusText: "Failed to load messages"
      });
    }

    return {
      conversations: result.data?.conversations || [],
      totalCount: result.data?.totalCount || 0,
      hasMore: result.data?.hasMore || false,
      filters: { search, unreadOnly, limit }
    };

  } catch (error) {
    console.error("Loader error:", error);
    
    if (error instanceof Response) {
      throw error;
    }
    
    throw new Response("Failed to load messages", { 
      status: 500,
      statusText: "Internal server error"
    });
  }
};

// Loading component
function MessagesLoading() {
  return (
    <div className="container mx-auto px-0 py-8 md:px-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
        {/* Conversations List Loading */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-3 p-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area Loading */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-0">
              <div className="h-full flex flex-col">
                <div className="flex-1 p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-16 mt-1 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-4">
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Error Boundary
export function ErrorBoundary() {
  const error = useRouteError();

  let message = "Something went wrong";
  let details = "An unexpected error occurred while loading messages.";

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

export default function MessagesPage() {
  const { conversations, totalCount, hasMore, filters } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-0 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">Connect with buyers and sellers in your community.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>Your active chats ({totalCount})</CardDescription>
              <div className="relative">
                <Input placeholder="Search conversations..." className="pl-8" />
                <span className="absolute left-2.5 top-2.5 text-gray-400">🔍</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p>No conversations found</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div key={conversation.id} className="flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer border-l-4 border-transparent hover:border-blue-500">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/sample.png" alt={`User ${conversation.participantIds[1]?.slice(-2) || "Unknown"}`} />
                        <AvatarFallback>
                          {conversation.participantIds[1]?.slice(-2) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            User {conversation.participantIds[1]?.slice(-2) || "Unknown"}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/sample.png" alt="Sarah Miller" />
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">Sarah Miller</h3>
                  <p className="text-sm text-gray-500">Online</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    📞
                  </Button>
                  <Button variant="ghost" size="icon">
                    📹
                  </Button>
                  <Button variant="ghost" size="icon">
                    ⚙️
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden">
              {/* Messages */}
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Received Message */}
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/sample.png" alt="Sarah Miller" />
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                        <p className="text-sm">Hi! I'm interested in your bicycle. Is it still available?</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">2:30 PM</p>
                    </div>
                  </div>

                  {/* Sent Message */}
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="flex-1 text-right">
                      <div className="bg-blue-500 text-white rounded-lg p-3 max-w-xs ml-auto">
                        <p className="text-sm">Yes, it's still available! Would you like to see it?</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">2:32 PM</p>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/sample.png" alt="You" />
                      <AvatarFallback>Y</AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Received Message */}
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/sample.png" alt="Sarah Miller" />
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                        <p className="text-sm">That would be great! When are you free?</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">2:35 PM</p>
                    </div>
                  </div>

                  {/* Typing Indicator */}
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/sample.png" alt="Sarah Miller" />
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Type your message..." 
                      className="flex-1"
                    />
                    <Button>Send</Button>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Press Enter to send</span>
                    <div className="flex space-x-2">
                      <button className="hover:text-gray-700">📎</button>
                      <button className="hover:text-gray-700">😊</button>
                      <button className="hover:text-gray-700">📷</button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 