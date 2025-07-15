import type { Route } from './+types/messages-page';
import { makeSSRClient, browserClient } from '~/supa-client';
import { redirect } from 'react-router';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/common/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '~/common/components/ui/avatar';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Badge } from '~/common/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/common/components/ui/hover-card';
import { getConversations, getConversationMessages, sendMessage } from '../queries';
import { MessageCircle, Send, Clock, User, MoreHorizontal } from 'lucide-react';

interface LoaderData {
  user: { id: string; [key: string]: any };
  conversations: any[];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return redirect('/auth/login');
  }
  // 사용자의 대화 목록 가져오기
  const conversations = await getConversations(client, { profileId: user.id });
  
  return { user, conversations };
};

export default function MessagesPage({ loaderData }: { loaderData: LoaderData }) {
  const { user, conversations } = loaderData ?? { user: { id: '' }, conversations: [] };
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [client] = useState(() => browserClient);

  // 대화 선택 시 메시지 로드
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.conversation_id);
    }
  }, [selectedConversation]);

  const loadMessages = async (conversationId: number) => {
    try {
      setLoading(true);
      const conversationMessages = await getConversationMessages(client, { conversationId });
      setMessages(conversationMessages);
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setLoading(true);
      const sentMessage = await sendMessage(client, {
        conversationId: selectedConversation.conversation_id,
        senderId: user?.id,
        receiverId: selectedConversation.receiver_id || selectedConversation.sender_id,
        content: newMessage.trim()
      });

      // 새 메시지를 목록에 추가
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}분 전`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  const getOtherParticipant = (conversation: any) => {
    if (conversation.sender_id === user?.id) {
      return {
        username: conversation.receiver_username,
        avatar: conversation.receiver_avatar_url,
        id: conversation.receiver_id
      };
    } else {
      return {
        username: conversation.sender_username,
        avatar: conversation.sender_avatar_url,
        id: conversation.sender_id
      };
    }
  };

  const getUnreadCount = (conversation: any) => {
    // 읽지 않은 메시지 수 계산 (간단한 구현)
    return conversation.message_status === 'unread' ? 1 : 0;
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        {/* 대화 목록 */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                메시지
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>아직 대화가 없습니다</p>
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const otherUser = getOtherParticipant(conversation);
                    const unreadCount = getUnreadCount(conversation);
                    const isSelected = selectedConversation?.conversation_id === conversation.message_room_id;
                    
                    return (
                      <div
                        key={conversation.message_room_id}
                        className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
                          isSelected ? 'bg-accent border-l-4 border-primary' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={otherUser.avatar} alt={otherUser.username} />
                            <AvatarFallback>
                              <User className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium truncate">{otherUser.username}</h3>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {formatTime(conversation.message_created_at)}
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.message_content}
                            </p>
                          </div>
                          
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 메시지 영역 */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {selectedConversation ? (
              <>
                {/* 대화 헤더 */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage 
                          src={getOtherParticipant(selectedConversation).avatar} 
                          alt={getOtherParticipant(selectedConversation).username} 
                        />
                        <AvatarFallback>
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button variant="ghost" className="p-0 h-auto">
                            <h3 className="font-medium">
                              {getOtherParticipant(selectedConversation).username}
                            </h3>
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage 
                                src={getOtherParticipant(selectedConversation).avatar} 
                                alt={getOtherParticipant(selectedConversation).username} 
                              />
                              <AvatarFallback>
                                <User className="w-6 h-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">
                                {getOtherParticipant(selectedConversation).username}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                대화 시작: {formatTime(selectedConversation.message_created_at)}
                              </p>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                    
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                {/* 메시지 목록 */}
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {loading ? (
                        <div className="flex justify-center items-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>메시지를 시작해보세요</p>
                        </div>
                      ) : (
                        messages.map((message) => {
                          const isOwnMessage = message.sender_id === user?.id;
                          
                          return (
                            <div
                              key={message.message_id}
                              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                                <div className={`rounded-lg px-4 py-2 ${
                                  isOwnMessage 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted'
                                }`}>
                                  <p className="text-sm">{message.message_content}</p>
                                  <p className={`text-xs mt-1 ${
                                    isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                  }`}>
                                    {formatTime(message.message_created_at)}
                                  </p>
                                </div>
                              </div>
                              
                              {!isOwnMessage && (
                                <div className="order-1 ml-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage 
                                      src={message.sender_avatar_url} 
                                      alt={message.sender_username} 
                                    />
                                    <AvatarFallback>
                                      <User className="w-3 h-3" />
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* 메시지 입력 */}
                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="메시지를 입력하세요..."
                          disabled={loading}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || loading}
                          size="icon"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">대화를 선택하세요</h3>
                  <p>메시지를 보내고 받으려면 왼쪽에서 대화를 선택하세요</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}