import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../../common/components/ui/avatar";
import { Badge } from "../../../common/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../../../common/components/ui/popover";
import { useLocation } from "react-router";
import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import type { Route } from './+types/messages-page';
import { 
  FaceSmileIcon, 
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { makeSSRClient, browserClient } from "~/supa-client";
import { getLoggedInUserId, getMessages, sendMessage, getOrCreateConversation, getConversations, getConversationMessages } from "../queries";

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
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const messages = await getMessages(client, { profileId: userId });
  return { messages, userId };
};

export default function MessagesPage({ loaderData }: Route.ComponentProps) {
  const { messages, userId } = loaderData;
  const location = useLocation();
  const productContext = location.state;

  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Check if user came from product detail page
  const isFromProduct = productContext?.fromProduct;
  const productInfo = isFromProduct ? {
    id: productContext.productId,
    title: productContext.productTitle,
    sellerName: productContext.sellerName
  } : null;

  const filteredConversations = conversations.filter((conversation: any) => {
    if (searchTerm) {
      return conversation.content?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const handleConversationClick = async (conversation: any) => {
    setSelectedConversation(conversation);
    setIsLoadingMessages(true);
    
    try {
      // 선택된 대화의 메시지들 로드
      const messages = await getConversationMessages(browserClient, {
        conversationId: conversation.conversation_id
      });
      setConversationMessages(messages);
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
    
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    
    try {
      let conversationId = selectedConversation.conversation_id;
      
      // 대화가 없으면 새로 생성
      if (!conversationId) {
        const otherUserId = selectedConversation.sender_id === userId ? selectedConversation.receiver_id : selectedConversation.sender_id;
        const conversation = await getOrCreateConversation(browserClient, {
          userId,
          otherUserId
        });
        conversationId = conversation.conversation_id;
        
        // selectedConversation 업데이트
        setSelectedConversation((prev: any) => ({
          ...prev,
          conversation_id: conversationId
        }));
      }
      
      // 메시지 전송
      const newMessage = await sendMessage(browserClient, {
        conversationId,
        senderId: userId,
        receiverId: selectedConversation.sender_id === userId ? selectedConversation.receiver_id : selectedConversation.sender_id,
        content: messageInput.trim()
      });

      // 새 메시지를 대화 메시지 목록에 추가
      const messageWithDetails = {
        ...newMessage,
        sender_username: "You", // 현재 사용자
        receiver_username: selectedConversation.sender_id === userId ? selectedConversation.receiver_username : selectedConversation.sender_username,
        message_type_category: "text",
        message_status: "read"
      };

      setConversationMessages(prev => [...prev, messageWithDetails]);
      setMessageInput("");
      
      // 메시지 목록 맨 아래로 스크롤
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      // 에러 처리 (사용자에게 알림 등)
    } finally {
      setIsSending(false);
    }
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

  // 초기 대화 목록 로드
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const convs = await getConversations(browserClient, { profileId: userId });
        setConversations(convs);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    };
    loadConversations();
  }, [userId]);

  // 메시지 목록이 업데이트될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

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
                {filteredConversations.map((conversation: any) => (
                  <div
                    key={conversation.message_id}
                    className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedConversation?.message_id === conversation.message_id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/sample.png" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {conversation.sender_id === userId ? conversation.receiver_username : conversation.sender_username}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.created_at || '')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.content}
                      </p>
                    </div>
                    {conversation.message_status === 'unread' && (
                      <Badge variant="destructive" className="ml-2 rounded-sm bg-rose-500 text-gray-200">
                        {conversation.message_status}
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
                        <AvatarImage src={selectedConversation.sender_avatar_url} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {selectedConversation.sender_id === userId ? selectedConversation.receiver_username : selectedConversation.sender_username}
                        </h3>
                        <p className="text-sm text-gray-500">Online</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading messages...</p>
                      </div>
                    </div>
                  ) : (
                    conversationMessages.map((message: any) => (
                      <div
                        key={message.message_id}
                        className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === userId
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === userId ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={isSending}
                    />
                    <Button variant="ghost" size="icon" disabled={isSending}>
                      <PhotoIcon className="h-4 w-4" />
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isSending}>
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
                    <Button onClick={handleSendMessage} disabled={isSending}>
                      {isSending ? 'Sending...' : 'Send'}
                    </Button>
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
  )
}