import { Route } from './+types/messages-page';
import { getLoggedInUserId, getUserByProfileId, getConversations, sendMessage, getConversationMessages, createConversation, getOrCreateConversation } from '../queries';
import { browserClient, makeSSRClient } from '~/supa-client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/common/components/ui/card';
import { ScrollArea } from '~/common/components/ui/scroll-area';
import { MessageBubble } from '../components/message/MessageBubble';
import { MessageRoomCard } from '../components/message/MessageRoomCard';
import { MessageInput } from '../components/message/MessageInput';
import { MessageHeader } from '../components/message/MessageHeader';
import { MessageCircle, User } from 'lucide-react';
import { useLocation } from 'react-router';


export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const user = await getUserByProfileId(client, { profileId: userId });
  const conversations = await getConversations(client, { profileId: userId });
  return { user, conversations };
};

interface LoaderData {
  user: { id: string; [key: string]: any };
  conversations: any[];
}

export default function MessagesPage({ loaderData }: { loaderData: LoaderData }) {
  
  const { user, conversations } = loaderData;
  const location = useLocation();
  const productContext = location.state as any;
  
  // Validate data
  if (!user) {
    console.error('User data is missing');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-muted-foreground">Please log in to view messages.</p>
        </div>
      </div>
    );
  }
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    conversations.length > 0 ? conversations[0]?.conversation_id?.toString() || null : null
  );
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client] = useState(() => browserClient);
  const [conversationsList, setConversationsList] = useState(conversations);
  const [showSidebar, setShowSidebar] = useState(false); // 모바일 사이드바 토글
  const [hasHandledProductContext, setHasHandledProductContext] = useState(false);

  // Handle product context and create new conversation if needed
  useEffect(() => {
    const handleProductContext = async () => {
      if (productContext?.fromProduct && productContext?.sellerId && user?.profile_id && !hasHandledProductContext) {
        try {
          setLoading(true);
          setError(null);
          
          // Check if conversation already exists with this seller
          const existingConversation = conversations.find(conv => {
            const isSameSeller = conv.sender_id === productContext.sellerId || conv.receiver_id === productContext.sellerId;
            const isSameProduct = conv.product_id === productContext.productId;
            // 같은 셀러 + 같은 상품인 경우에만 기존 대화 사용
            return isSameSeller && isSameProduct;
          });
          
          if (existingConversation) {
            // Use existing conversation
            setSelectedConversation(existingConversation.conversation_id.toString());
            await loadMessages(existingConversation.conversation_id);
          } else {
            // Create new conversation
            console.log('Creating new conversation with seller:', productContext.sellerId);
            
            const newConversation = await getOrCreateConversation(client, {
              userId: user.profile_id,
              otherUserId: productContext.sellerId,
              productId: productContext.productId,
            });
            
            console.log('New conversation created:', newConversation);
            
            // Add initial message about the product
            const initialMessage = `Hi! I'm interested in your product "${productContext.productTitle}". Can you tell me more about it?`;
            
            const sentMessage = await sendMessage(client, {
              conversationId: newConversation.conversation_id,
              senderId: user.profile_id,
              receiverId: productContext.sellerId,
              content: initialMessage
            });
            
            // Refresh conversations list
            const updatedConversations = await getConversations(client, { profileId: user.profile_id });
            setConversationsList(updatedConversations);
            
            // Select the new conversation
            setSelectedConversation(newConversation.conversation_id.toString());
            await loadMessages(newConversation.conversation_id);
          }
          setHasHandledProductContext(true);
        } catch (error) {
          console.error('Failed to handle product context:', error);
          setError(`Failed to create conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setLoading(false);
        }
      }
    };
    
    handleProductContext();
  }, [productContext, user?.profile_id, hasHandledProductContext]);
  
  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(parseInt(selectedConversation));
    }
  }, [selectedConversation]);

  const loadMessages = async (conversationId: number) => {
    try {
      setLoading(true);
      setError(null);
      const conversationMessages = await getConversationMessages(client, { conversationId });
      // 읽음 처리
      // markMessagesAsRead 관련 import, action, 함수 호출 모두 삭제
      // 실제 코드에서는 해당 부분을 모두 제거
      setMessages(conversationMessages);
    } catch (error) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!selectedConversation || !messageContent.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      // Get receiver ID from the selected conversation
      const selectedConv = conversationsList.find(conv => conv.conversation_id?.toString() === selectedConversation);
      if (!selectedConv) {
        console.error('Selected conversation not found');
        setError('Selected conversation not found');
        return;
      }

      const receiverId = selectedConv.sender_username === user?.username 
        ? selectedConv.receiver_id 
        : selectedConv.sender_id;

      const sentMessage = await sendMessage(client, {
        conversationId: parseInt(selectedConversation),
        senderId: user?.profile_id,
        receiverId: receiverId,
        content: messageContent.trim()
      });

      // Add the new message to the messages list
      const newMessage = {
        message_id: sentMessage.message_id,
        conversation_id: sentMessage.conversation_id,
        sender_id: sentMessage.sender_id,
        receiver_id: sentMessage.receiver_id,
        content: sentMessage.content,
        message_type: sentMessage.message_type,
        media_url: sentMessage.media_url,
        seen: sentMessage.seen,
        created_at: sentMessage.created_at,
        sender_username: user?.username,
        sender_avatar_url: user?.avatar_url,
        receiver_username: selectedConv.sender_username === user?.username 
          ? selectedConv.receiver_username 
          : selectedConv.sender_username,
        receiver_avatar_url: selectedConv.sender_username === user?.username 
          ? selectedConv.receiver_avatar_url 
          : selectedConv.sender_avatar_url,
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = conversationsList.find(conv => conv.conversation_id?.toString() === selectedConversation);

  const handleLeaveChatRoom = async () => {
    if (!selectedConversation || !user?.profile_id) return;
    await client
      .from("message_participants")
      .update({ is_hidden: true })
      .eq("conversation_id", parseInt(selectedConversation))
      .eq("profile_id", user.profile_id);

    // 목록에서 제거
    setConversationsList(prev => prev.filter(c => c.conversation_id?.toString() !== selectedConversation));
    setSelectedConversation(null);
  };

  // Transform conversations data to match MessageRoomCard interface
  const transformedConversations = conversationsList.map(conv => {
    const isOwnMessage = conv.sender_username === user?.username;
    const otherUsername = isOwnMessage ? conv.receiver_username : conv.sender_username;
    const otherAvatarUrl = isOwnMessage ? conv.receiver_avatar_url : conv.sender_avatar_url;
    
    const transformed = {
      id: conv.conversation_id?.toString() || '',
      other_user: {
        username: otherUsername || 'Unknown User',
        avatar_url: otherAvatarUrl,
      },
      last_message: {
        content: conv.content || 'No message',
        created_at: conv.created_at || new Date().toISOString(),
      },
      unread_count: conv.message_status === 'unread' ? 1 : 0,
      productInfo: conv.product_title ? {
        title: conv.product_title,
        productId: conv.product_id
      } : undefined,
    };
    return transformed;
  });
  
  // 모바일에서 대화방 진입 시 사이드바 닫기
  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    setShowSidebar(false);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-50 flex-col md:flex-row">
      {/* 모바일: 대화 목록 오버레이 */}
      <div className={`fixed inset-0 z-30 bg-black/30 md:hidden ${showSidebar ? '' : 'hidden'}`}>
        <div className="absolute left-0 top-0 bottom-0 w-4/5 max-w-xs bg-white shadow-lg h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold">대화 목록</span>
            <button className="text-2xl" onClick={() => setShowSidebar(false)}>×</button>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-0.5">
              {transformedConversations.length === 0 ? (
                <div className="p-3 text-center text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <p className="text-sm">No conversation</p>
                </div>
              ) : (
                transformedConversations.map((conversation) => (
                  <MessageRoomCard
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversation === conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="w-full h-full" onClick={() => setShowSidebar(false)} />
      </div>

      {/* 데스크탑: 좌측 대화 목록 */}
      <div className="hidden md:flex w-80 bg-white border-r border-gray-200 flex-col">
        <Card className="border-0 rounded-none">
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="space-y-0.5">
                {transformedConversations.length === 0 ? (
                  <div className="p-3 text-center text-muted-foreground">
                    <MessageCircle className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <p className="text-sm">No conversation</p>
                  </div>
                ) : (
                  transformedConversations.map((conversation) => (
                    <MessageRoomCard
                      key={conversation.id}
                      conversation={conversation}
                      isSelected={selectedConversation === conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* 모바일: 상단바 - 뒤로가기/목록 버튼 */}
        {selectedConversation && (
          <div className="md:hidden flex items-center border-b px-2 py-2 bg-white">
            <button onClick={() => setSelectedConversation(null)} className="mr-2 px-2 py-1 rounded hover:bg-gray-100">
              ←
            </button>
            <span className="font-semibold text-base">
              {selectedUser?.sender_username === user?.username
                ? selectedUser?.receiver_username
                : selectedUser?.sender_username || 'Unknown'}
            </span>
          </div>
        )}
        {/* 모바일: 대화 목록 버튼 (대화방 미선택 시) */}
        {!selectedConversation && (
          <div className="md:hidden flex-1 flex items-center justify-center">
            <button
              className="px-4 py-2 bg-primary text-white rounded shadow"
              onClick={() => setShowSidebar(true)}
            >
              대화 목록 보기
            </button>
          </div>
        )}
        {/* 채팅방 내용 */}
        {(selectedConversation || window.innerWidth >= 768) && (
          <div className={`flex-1 flex flex-col min-h-0 ${!selectedConversation && window.innerWidth < 768 ? 'hidden' : ''}`}>
            {/* 데스크탑: 채팅방 헤더 */}
            <div className="hidden md:block">
              {selectedConversation && (
                <MessageHeader
                  user={{
                    username: selectedUser?.sender_username === user?.username
                      ? selectedUser?.receiver_username
                      : selectedUser?.sender_username || 'Unknown',
                    avatar_url: selectedUser?.sender_username === user?.username
                      ? selectedUser?.receiver_avatar_url
                      : selectedUser?.sender_avatar_url,
                    isOnline: true,
                  }}
                  productInfo={selectedUser?.product_title ? {
                    title: selectedUser.product_title,
                    productId: selectedUser.product_id
                  } : (productContext?.fromProduct ? {
                    title: productContext.productTitle,
                    productId: productContext.productId
                  } : undefined)}
                  onLeaveChatRoom={handleLeaveChatRoom}
                />
              )}
            </div>
            {/* 채팅 메시지 영역 */}
            {selectedConversation && (
              <ScrollArea className="flex-1 p-2 md:p-4">
                <div className="space-y-4">
                  {error && (
                    <div className="text-center text-red-500 py-4">
                      <p>{error}</p>
                    </div>
                  )}
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Start a message</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <MessageBubble
                        key={message.message_id}
                        message={message}
                        isOwnMessage={message.sender_id === user?.profile_id}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
            {/* 입력창 */}
            {selectedConversation && (
              <MessageInput onSendMessage={handleSendMessage} disabled={loading} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}