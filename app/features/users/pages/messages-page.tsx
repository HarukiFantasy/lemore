import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../../common/components/ui/avatar";
import { Badge } from "../../../common/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../../../common/components/ui/popover";
import { useLoaderData, useRouteError, isRouteErrorResponse, useLocation } from "react-router";
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
  const { conversations, totalCount, hasMore, filters } = useLoaderData<typeof loader>();
  const location = useLocation();
  const productContext = location.state;

  // State for messages and input
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    timestamp: string;
    isRead: boolean;
    isFromUser: boolean;
    type?: 'text' | 'image';
    imageUrl?: string;
  }>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user came from product detail page
  const isFromProduct = productContext?.fromProduct;
  const productInfo = isFromProduct ? {
    id: productContext.productId,
    title: productContext.productTitle,
    sellerName: productContext.sellerName
  } : null;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize messages if coming from product
  useEffect(() => {
    if (isFromProduct && productInfo && messages.length === 0) {
      // Add initial message from seller
      setMessages([{
        id: "initial-1",
        content: `Hi! I'm interested in your ${productInfo.title}. Is it still available?`,
        senderId: productContext.sellerId || "seller-123",
        receiverId: "current-user-id",
        timestamp: new Date().toISOString(),
        isRead: true,
        isFromUser: false,
        type: 'text'
      }]);
    }
  }, [isFromProduct, productInfo, productContext]);

  // Load conversation messages
  const loadConversationMessages = (conversation: any) => {
    setSelectedConversation(conversation);
    
    // Mock messages for the selected conversation
    const mockMessages = [
      {
        id: "msg-1",
        content: "Hi there! How are you?",
        senderId: conversation.participantIds[1],
        receiverId: "current-user-id",
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        isRead: true,
        isFromUser: false,
        type: 'text' as const
      },
      {
        id: "msg-2",
        content: "I'm good, thanks! How about you?",
        senderId: "current-user-id",
        receiverId: conversation.participantIds[1],
        timestamp: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
        isRead: true,
        isFromUser: true,
        type: 'text' as const
      },
      {
        id: "msg-3",
        content: "Great! I was wondering about the item you listed.",
        senderId: conversation.participantIds[1],
        receiverId: "current-user-id",
        timestamp: new Date(Date.now() - 2400000).toISOString(), // 40 minutes ago
        isRead: true,
        isFromUser: false,
        type: 'text' as const
      },
      {
        id: "msg-4",
        content: "Yes, it's still available! Would you like to see it?",
        senderId: "current-user-id",
        receiverId: conversation.participantIds[1],
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        isRead: true,
        isFromUser: true,
        type: 'text' as const
      }
    ];

    // Add some recent messages if there are unread messages
    if (conversation.unreadCount > 0) {
      mockMessages.push({
        id: "msg-5",
        content: "Perfect! When can we meet?",
        senderId: conversation.participantIds[1],
        receiverId: "current-user-id",
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        isRead: false,
        isFromUser: false,
        type: 'text' as const
      });
    }

    setMessages(mockMessages);
  };

  // Handle conversation click
  const handleConversationClick = (conversation: any) => {
    loadConversationMessages(conversation);
  };

  // Handle message input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setInputMessage(prev => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedConversation) {
      // Create a mock image URL (in real app, you'd upload to server)
      const imageUrl = URL.createObjectURL(file);
      
      const imageMessage = {
        id: `img-${Date.now()}`,
        content: "Image",
        senderId: "current-user-id",
        receiverId: selectedConversation.participantIds[1],
        timestamp: new Date().toISOString(),
        isRead: false,
        isFromUser: true,
        type: 'image' as const,
        imageUrl: imageUrl
      };

      setMessages(prev => [...prev, imageMessage]);
      setIsImageUploadOpen(false);
      
      // Reset file input and camera mode
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsCameraMode(false);
    }
  };

  // Handle message submission
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedConversation) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      content: inputMessage.trim(),
      senderId: "current-user-id",
      receiverId: selectedConversation.participantIds[1],
      timestamp: new Date().toISOString(),
      isRead: false,
      isFromUser: true,
      type: 'text' as const
    };

    // Add user message
    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");

    // Simulate seller response after 1-3 seconds
    setTimeout(() => {
      const sellerResponses = [
        "Thanks for your message! Yes, it's still available.",
        "Great question! Let me check the details for you.",
        "I'm glad you're interested! When would you like to see it?",
        "Perfect timing! I just updated the listing.",
        "Thanks for reaching out! What would you like to know?",
        "Hi there! Yes, it's still available. Would you like to meet up?",
        "Thanks for your interest! The item is in great condition.",
        "Hello! Yes, it's still available. Are you local to the area?"
      ];

      const randomResponse = sellerResponses[Math.floor(Math.random() * sellerResponses.length)];
      
      const sellerMessage = {
        id: `seller-${Date.now()}`,
        content: randomResponse,
        senderId: selectedConversation.participantIds[1],
        receiverId: "current-user-id",
        timestamp: new Date().toISOString(),
        isRead: false,
        isFromUser: false,
        type: 'text' as const
      };

      setMessages(prev => [...prev, sellerMessage]);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get current chat participant info
  const getCurrentChatInfo = () => {
    if (isFromProduct && productInfo) {
      return {
        name: productContext.sellerName,
        avatar: "/sample.png",
        status: "Online",
        about: productInfo.title
      };
    }
    
    if (selectedConversation) {
      return {
        name: `User ${selectedConversation.participantIds[1]?.slice(-2) || "Unknown"}`,
        avatar: "/sample.png",
        status: "Online",
        about: null
      };
    }
    
    return {
      name: "Sarah Miller",
      avatar: "/sample.png", 
      status: "Online",
      about: null
    };
  };

  const currentChatInfo = getCurrentChatInfo();

  // Common emojis
  const commonEmojis = [
    "😊", "😂", "❤️", "👍", "🎉", "🔥", "😍", "🤔", "😭", "😎",
    "👋", "🙏", "💪", "✨", "🌟", "💯", "👏", "🙌", "🤝", "💖"
  ];

  // Add mobile detection hook
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle image click to open modal
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

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
                    {isFromProduct && (
                      <Button 
                        className="mt-2"
                        onClick={() => {
                          // Create new conversation with seller
                          console.log("Creating new conversation with seller for product:", productInfo?.id);
                        }}
                      >
                        Start Conversation
                      </Button>
                    )}
                  </div>
                ) : (
                  conversations.map((conversation: any) => (
                    <div 
                      key={conversation.id} 
                      className={`flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
                        selectedConversation?.id === conversation.id 
                          ? 'bg-blue-50 border-blue-500' 
                          : 'border-transparent hover:border-blue-500'
                      }`}
                      onClick={() => handleConversationClick(conversation)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/sample.png" alt={`User ${conversation.participantIds[1]?.slice(-2) || "Unknown"}`} />
                        <AvatarFallback>
                          {conversation.participantIds[1]?.slice(-2) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {isFromProduct && conversation.participantIds[1] === productContext.sellerId 
                              ? productContext.sellerName 
                              : `User ${conversation.participantIds[1]?.slice(-2) || "Unknown"}`
                            }
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
                  <AvatarImage src={currentChatInfo.avatar} alt={currentChatInfo.name} />
                  <AvatarFallback>
                    {currentChatInfo.name?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {currentChatInfo.name}
                  </h3>
                  <p className="text-sm text-gray-500">{currentChatInfo.status}</p>
                  {currentChatInfo.about && (
                    <p className="text-xs text-blue-600">About: {currentChatInfo.about}</p>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden">
              {/* Messages */}
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation || isFromProduct ? (
                    <>
                      {/* Dynamic Messages */}
                      {messages.map((message) => (
                        <div key={message.id} className={`flex items-start space-x-3 ${message.isFromUser ? 'justify-end' : ''}`}>
                          {!message.isFromUser && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={currentChatInfo.avatar} alt={currentChatInfo.name} />
                              <AvatarFallback>
                                {currentChatInfo.name?.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`flex-1 ${message.isFromUser ? 'text-right' : ''}`}>
                            <div className={`rounded-lg p-3 max-w-xs ${message.isFromUser ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-100'}`}>
                              {message.type === 'image' ? (
                                <img 
                                  src={message.imageUrl} 
                                  alt="Shared image" 
                                  className="max-w-full h-auto rounded cursor-pointer hover:opacity-90 transition-opacity"
                                  style={{ maxHeight: '200px' }}
                                  onClick={() => handleImageClick(message.imageUrl!)}
                                />
                              ) : (
                                <p className="text-sm">{message.content}</p>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                          {message.isFromUser && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/sample.png" alt="You" />
                              <AvatarFallback>Y</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}

                      {/* Typing Indicator */}
                      {isTyping && (
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={currentChatInfo.avatar} alt={currentChatInfo.name} />
                            <AvatarFallback>
                              {currentChatInfo.name?.slice(0, 2)}
                            </AvatarFallback>
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
                      )}

                      {/* Auto-scroll anchor */}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <p className="text-lg mb-2">Select a conversation</p>
                        <p className="text-sm">Choose a conversation from the list to start chatting</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                {(selectedConversation || isFromProduct) && (
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input 
                        placeholder={isFromProduct ? "Ask about the product..." : "Type your message..."} 
                        className="flex-1"
                        value={inputMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                      >
                        Send
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>Press Enter to send</span>
                      <div className="flex space-x-2">
                        {/* Emoji Picker */}
                        <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <FaceSmileIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-2">
                            <div className="grid grid-cols-8 gap-1">
                              {commonEmojis.map((emoji, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  className="p-2 h-auto text-lg"
                                  onClick={() => handleEmojiSelect(emoji)}
                                >
                                  {emoji}
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>

                        {/* Image Upload */}
                        <Popover open={isImageUploadOpen} onOpenChange={setIsImageUploadOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <PhotoIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2">
                            <div className="space-y-2">
                              {isMobile && (
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start text-sm"
                                  onClick={() => {
                                    setIsCameraMode(true);
                                    fileInputRef.current?.click();
                                    setIsImageUploadOpen(false);
                                  }}
                                >
                                  📷 Take Photo
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-sm"
                                onClick={() => {
                                  setIsCameraMode(false);
                                  fileInputRef.current?.click();
                                  setIsImageUploadOpen(false);
                                }}
                              >
                                📁 Choose from Library
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>

                        {/* Hidden file input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          capture={isCameraMode ? "environment" : undefined}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-auto"
          onClick={handleCloseModal}
        >
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative">
              <button
                onClick={handleCloseModal}
                className="fixed top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img 
                src={selectedImage} 
                alt="Enlarged image" 
                className="max-w-none rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 