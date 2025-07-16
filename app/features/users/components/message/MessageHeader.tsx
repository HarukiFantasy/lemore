import { Avatar, AvatarFallback, AvatarImage } from '~/common/components/ui/avatar';
import { Button } from '~/common/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/common/components/ui/hover-card';
import { MoreHorizontal, User } from 'lucide-react';

interface MessageHeaderProps {
  user: {
    username: string;
    avatar_url?: string;
    isOnline?: boolean;
  };
}

export function MessageHeader({ user }: MessageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar_url} alt={user.username} />
            <AvatarFallback>
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{user.username}</h2>
                  <p className="text-sm text-gray-500">
                    {user.isOnline ? '온라인' : '오프라인'}
                  </p>
                </div>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar_url} alt={user.username} />
                  <AvatarFallback>
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{user.username}</h4>
                  <p className="text-sm text-muted-foreground">
                    {user.isOnline ? '온라인' : '오프라인'}
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
    </div>
  );
} 