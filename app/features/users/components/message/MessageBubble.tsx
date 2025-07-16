import { Avatar, AvatarFallback, AvatarImage } from '~/common/components/ui/avatar';
import { User } from 'lucide-react';

interface Message {
  message_id: string;
  content: string;
  sender_id: string;
  sender_username: string;
  sender_avatar_url?: string;
  created_at: string;
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex items-start space-x-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      {!isOwnMessage && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={message.sender_avatar_url} alt={message.sender_username} />
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`rounded-lg px-4 py-2 shadow-sm max-w-xs ${
        isOwnMessage 
          ? 'bg-blue-500 text-white' 
          : 'bg-white border border-gray-200'
      }`}>
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${
          isOwnMessage ? 'text-blue-100' : 'text-gray-400'
        }`}>
          {formatTime(message.created_at)}
        </p>
      </div>
      
      {isOwnMessage && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={message.sender_avatar_url} alt={message.sender_username} />
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
} 