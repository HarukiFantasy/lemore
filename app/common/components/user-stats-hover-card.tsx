import { HoverCard, HoverCardTrigger, HoverCardContent } from "./ui/hover-card";
import { Badge } from "./ui/badge";
import { PackageIcon, EyeIcon, MessageCircleReplyIcon } from "lucide-react";
import { useAppreciationBadge } from "~/hooks/use-appreciation-badge";
import { Button } from './ui/button';
import { Link } from "react-router";

interface UserStats {
  totalListings: number;
  rating: number;
  responseRate: string;
}

interface UserStatsHoverCardProps {
  profileId?: string;
  userName: string;
  children: React.ReactNode;
  showAppreciationBadge?: boolean;
  className?: string;
  userStats?: UserStats; // loader에서 받은 데이터
}

export function UserStatsHoverCard({
  profileId,
  userName,
  children,
  showAppreciationBadge = false,
  className = "",
  userStats
}: UserStatsHoverCardProps) {
  // Use the appreciation badge hook
  const { hasAppreciationBadge, isLoading } = useAppreciationBadge(profileId);
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className={`inline-block cursor-pointer hover:text-neutral-700 transition-colors font-medium underline decoration-dotted underline-offset-2 hover:decoration-solid ${className}`}>
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-64 min-w-64 max-w-64">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{userName}</span>
            <Link to={`/users/${userName}`}>
              <Button variant="secondary" className="text-xs h-5 px-2">
                Profile
              </Button>
            </Link>
            {/* Show appreciation badge for users with high-rated give-and-glow reviews */}
            {(hasAppreciationBadge || showAppreciationBadge) && (
              <Badge variant="outline" className="text-xs bg-green-100 text-green-700">Appreciation</Badge>
            )}
            {isLoading && (
              <Badge variant="outline" className="text-xs bg-gray-100 text-gray-500">Loading...</Badge>
            )}
          </div>
          
          {/* User Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-1">
              <PackageIcon className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-neutral-600">Listings</span>
              <span className="text-xs font-semibold">
                {userStats?.totalListings || 0}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <EyeIcon className="w-3 h-3 text-green-500" />
              <span className="text-xs text-neutral-600">Rating</span>
              <span className="text-xs font-semibold">
                {userStats?.rating || 0}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MessageCircleReplyIcon className="w-3 h-3 text-red-500" />
              <span className="text-xs text-neutral-600">Response</span>
              <span className="text-xs font-semibold">
                {userStats?.responseRate || "0%"}
              </span>
            </div>
          </div>
          
          {/* Additional User Info */}
          <div className="pt-1 border-t border-gray-100">
            <div className="text-xs text-neutral-600">
              <span className="font-medium">Member since:</span> 
              <span className="ml-1">2023</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
} 