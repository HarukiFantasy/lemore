import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../../common/components/ui/avatar";
import { Badge } from "../../../common/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../../../common/components/ui/popover";
import { useRouteError, isRouteErrorResponse, useLocation } from "react-router";
import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import type { Route } from './+types/messages-page';
import { 
  FaceSmileIcon, 
  PhotoIcon,
  PhoneIcon,
  VideoCameraIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";

// Mock messages function (임시)
async function fetchMockMessages(userId: string, filters: any) {
  return {
    success: true,
    data: {
      conversations: [
        {
          id: '1',
          participantIds: [userId, 'user-2'],
          lastMessage: {
            id: 'msg-1',
            content: 'Is this still available?',
            senderId: 'user-2',
            receiverId: userId,
            timestamp: '2024-01-15T10:30:00Z',
            isRead: false,
            type: 'text' as const,
          },
          unreadCount: 1,
          updatedAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          participantIds: [userId, 'user-3'],
          lastMessage: {
            id: 'msg-2',
            content: 'Can you send me more photos?',
            senderId: userId,
            receiverId: 'user-3',
            timestamp: '2024-01-14T15:45:00Z',
            isRead: true,
            type: 'text' as const,
          },
          unreadCount: 0,
          updatedAt: '2024-01-14T15:45:00Z',
        }
      ],
      totalCount: 2,
      hasMore: false,
    }
  };
}

// Message schemas for data validation
export const messageFiltersSchema = z.object({
  search: z.string().optional(),
  unreadOnly: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(20),
});

export const messageSchema = z.object({
  id: z.string(),
  content: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
  timestamp: z.string(),
  isRead: z.boolean(),
  type: z.enum(['text', 'image']).optional(),
  imageUrl: z.string().optional(),
});

export const conversationSchema = z.object({
  id: z.string(),
  participantIds: z.array(z.string()),
  lastMessage: messageSchema.optional(),
  unreadCount: z.number(),
  updatedAt: z.string(),
});

export const messageListSchema = z.object({
  conversations: z.array(conversationSchema),
  totalCount: z.number(),
  hasMore: z.boolean(),
});

// TypeScript types
export type MessageFilters = z.infer<typeof messageFiltersSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type MessageList = z.infer<typeof messageListSchema>;


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
      throw new Response("Failed to load messages", { 
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
  const location = useLocation();
  const productContext = location.state;

  // Mock data for messages
  const userId = "current-user-id";
  
  const conversations = [
    {
      id: '1',
      participantIds: [userId, 'user-2'],
      lastMessage: {
        id: 'msg-1',
        content: 'Is this still available?',
        senderId: 'user-2',
        receiverId: userId,
        timestamp: '2024-01-15T10:30:00Z',
        isRead: false,
        type: 'text' as const,
      },
      unreadCount: 1,
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      participantIds: [userId, 'user-3'],
      lastMessage: {
        id: 'msg-2',
        content: 'Can you send me more photos?',
        senderId: userId,
        receiverId: 'user-3',
        timestamp: '2024-01-14T15:45:00Z',
        isRead: true,
        type: 'text' as const,
      },
      unreadCount: 0,
      updatedAt: '2024-01-14T15:45:00Z',
    }
  ];

  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if user came from product detail page
  const isFromProduct = productContext?.fromProduct;
  const productInfo = isFromProduct ? {
    id: productContext.productId,
    title: productContext.productTitle,
    sellerName: productContext.sellerName
  } : null;

  const filteredConversations = conversations.filter(conversation => {
    if (searchTerm) {
      return conversation.lastMessage?.content.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const handleConversationClick = (conversation: any) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  // Mock messages for selected conversation
  const getConversationMessages = (conversationId: string) => {
    if (conversationId === '1') {
      return [
        {
          id: 'msg-1-1',
          content: 'Hi! I saw your iPhone listing. Is it still available?',
          senderId: 'user-2',
          receiverId: userId,
          timestamp: '2024-01-15T10:25:00Z',
          isRead: true,
          type: 'text' as const,
        },
        {
          id: 'msg-1-2',
          content: 'Yes, it is! Are you interested?',
          senderId: userId,
          receiverId: 'user-2',
          timestamp: '2024-01-15T10:28:00Z',
          isRead: true,
          type: 'text' as const,
        },
        {
          id: 'msg-1-3',
          content: 'Is this still available?',
          senderId: 'user-2',
          receiverId: userId,
          timestamp: '2024-01-15T10:30:00Z',
          isRead: false,
          type: 'text' as const,
        }
      ];
    }
    return [];
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    
    // Mock sending message
    console.log('Sending message:', messageInput);
    setMessageInput("");
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="container mx-auto px-0 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">Connect with buyers and sellers in your community.</p>
        
        {/* Product Context Banner */}
        {isFromProduct && productInfo && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">About: {productInfo.title}</h3>
                <p className="text-sm text-blue-700">Seller: {productInfo.sellerName}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.history.back()}
              >
                Back to Product
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
        {/* Conversations List */}
        <div className={`lg:col-span-1 ${!showConversationList && isMobile ? 'hidden' : 'block'}`}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>Your recent conversations</CardDescription>
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/sample.png" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">User {conversation.participantIds.find((id: string) => id !== userId)?.slice(-1)}</p>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage?.timestamp || '')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.lastMessage?.content}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className={`lg:col-span-2 ${!showConversationList && isMobile ? 'block' : 'hidden lg:block'}`}>
          <Card className="h-full flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/sample.png" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">User {selectedConversation.participantIds.find((id: string) => id !== userId)?.slice(-1)}</h3>
                        <p className="text-sm text-gray-500">Online</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <PhoneIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <VideoCameraIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Cog6ToothIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {getConversationMessages(selectedConversation.id).map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === userId
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === userId ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button variant="ghost" size="icon">
                      <PhotoIcon className="h-4 w-4" />
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <FaceSmileIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="grid grid-cols-8 gap-1">
                          {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣'].map((emoji) => (
                            <button
                              key={emoji}
                              className="p-2 hover:bg-gray-100 rounded"
                              onClick={() => setMessageInput(prev => prev + emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button onClick={handleSendMessage}>Send</Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No conversation selected</h3>
                  <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 