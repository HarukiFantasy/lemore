import { Avatar, AvatarFallback, AvatarImage } from '~/common/components/ui/avatar';
import { User } from 'lucide-react';
import { DateTime } from 'luxon';

interface Conversation {
  id: string;
  other_user: {
    username: string;
    avatar_url?: string;
  };
  last_message: {
    content: string;
    created_at: string;
  };
  unread_count: number;
  productInfo?: {
    title: string;
    productId: number;
  };
}

interface MessageRoomCardProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export function MessageRoomCard({ conversation, isSelected, onClick }: MessageRoomCardProps) {
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

  return (
    <div 
      className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
        isSelected ? 'bg-accent border-l-4 border-primary' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={conversation.other_user.avatar_url} alt={conversation.other_user.username} />
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium truncate text-sm">{conversation.other_user.username}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>
              {DateTime.fromISO(conversation.last_message.created_at, { zone: 'utc' }).toLocal().toRelative()} </span>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
            {conversation.last_message.content}
          </p>
          
          {conversation.productInfo && (
            <p className="text-xs text-blue-600 truncate max-w-[200px] mt-1">
              📦 {conversation.productInfo.title}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 