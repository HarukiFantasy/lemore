import { Avatar, AvatarFallback, AvatarImage } from '~/common/components/ui/avatar';
import { Button } from '~/common/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/common/components/ui/hover-card';
import { MoreHorizontal, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/common/components/ui/dropdown-menu';
import { UserStatsHoverCard } from '~/common/components/user-stats-hover-card';

interface MessageHeaderProps {
  user: {
    username: string;
    avatar_url?: string;
    isOnline?: boolean;
    profile_id?: number;
  };
  productInfo?: {
    title?: string;
    productId?: number;
  };
  onLeaveChatRoom: () => void;
}

export function MessageHeader({ user, productInfo, onLeaveChatRoom }: MessageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 py-3 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.avatar_url} alt={user.username} />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <Button variant="ghost" className="p-0 h-auto">
            <div className="flex flex-col items-start">
              <UserStatsHoverCard profileId={user.profile_id ? String(user.profile_id) : undefined} userName={user.username}>
                <h2 onClick={(e) => e.stopPropagation()} className="text-base font-semibold text-gray-900 cursor-pointer">{user.username}</h2>
              </UserStatsHoverCard>
              <p className="text-xs text-gray-500">
                {user.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {productInfo?.title && (
            <div className="text-right">
              <p className="text-xs text-gray-500">About product</p>
              <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                {productInfo.title}
              </p>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onLeaveChatRoom}>
                Leave chat room
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
} 