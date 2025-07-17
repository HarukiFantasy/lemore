import { Route } from './+types/messages-page';
import { getLoggedInUserId, getUserByProfileId, getConversations, sendMessage, getConversationMessages } from '../queries';
import { browserClient, makeSSRClient } from '~/supa-client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/common/components/ui/card';
import { ScrollArea } from '~/common/components/ui/scroll-area';
import { MessageBubble } from '../components/message/MessageBubble';
import { MessageRoomCard } from '../components/message/MessageRoomCard';
import { MessageInput } from '../components/message/MessageInput';
import { MessageHeader } from '../components/message/MessageHeader';
import { MessageCircle, User } from 'lucide-react';

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
      const selectedConv = conversations.find(conv => conv.conversation_id?.toString() === selectedConversation);
      if (!selectedConv) {
        console.error('Selected conversation not found');
        return;
      }

      const receiverId = selectedConv.sender_username === user?.username 
        ? selectedConv.receiver_id 
        : selectedConv.sender_id;

      const sentMessage = await sendMessage(client, {
        conversationId: parseInt(selectedConversation),
        senderId: user?.id,
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
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = conversations.find(conv => conv.conversation_id?.toString() === selectedConversation);

  // Transform conversations data to match MessageRoomCard interface
  const transformedConversations = conversations.map(conv => {
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
    };
    return transformed;
  });
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <Card className="border-0 rounded-none">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              메시지
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="space-y-1">
                {transformedConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No conversation</p>
                  </div>
                ) : (
                  transformedConversations.map((conversation) => (
                    <MessageRoomCard
                      key={conversation.id}
                      conversation={conversation}
                      isSelected={selectedConversation === conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
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
            />
            
            <ScrollArea className="flex-1 p-4">
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
                        isOwnMessage={message.sender_id === user?.id}
                      />
                    ))
                  )}
              </div>
            </ScrollArea>
            
            <MessageInput onSendMessage={handleSendMessage} disabled={loading} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Choose a conversation</h3>
              <p>To send and receive messages, select a conversation from the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}