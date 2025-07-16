import { Avatar, AvatarFallback, AvatarImage } from '~/common/components/ui/avatar';
import { Badge } from '~/common/components/ui/badge';
import { User } from 'lucide-react';

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
      className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
        isSelected ? 'bg-accent border-l-4 border-primary' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={conversation.other_user.avatar_url} alt={conversation.other_user.username} />
          <AvatarFallback>
            <User className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium truncate">{conversation.other_user.username}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{formatTime(conversation.last_message.created_at)}</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground truncate">
            {conversation.last_message.content}
          </p>
        </div>
        
        {conversation.unread_count > 0 && (
          <Badge variant="destructive" className="ml-2">
            {conversation.unread_count}
          </Badge>
        )}
      </div>
    </div>
  );
} 