import { HoverCard, HoverCardTrigger, HoverCardContent } from "./ui/hover-card";
import { Badge } from "./ui/badge";
import { PackageIcon, MessageCircleReplyIcon } from "lucide-react";
import { Button } from './ui/button';
import { Link } from "react-router";
import { useMobile } from "~/hooks/use-mobile";

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
  userStats?: UserStats;
}

export function UserStatsHoverCard({
  profileId,
  userName,
  children,
  showAppreciationBadge = false,
  className = "",
  userStats
}: UserStatsHoverCardProps) {
  const isMobile = useMobile();

  // 모바일에서는 클릭으로 프로필 페이지로 이동
  if (isMobile) {
    return (
      <Link to={`/users/${userName}`}>
        <span className={`inline-block cursor-pointer hover:text-neutral-700 transition-colors font-medium underline decoration-dotted underline-offset-2 hover:decoration-solid ${className}`}>
          {children}
        </span>
      </Link>
    );
  }

  // 데스크탑에서는 hover card 사용
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
                ViewProfile
              </Button>
            </Link>
            {(showAppreciationBadge) && (
              <Badge variant="outline" className="text-xs bg-green-100 text-green-700">Appreciation</Badge>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <PackageIcon className="w-3 h-3 text-blue-500" />
              <span>Listings: {userStats?.totalListings ?? 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MessageCircleReplyIcon className="w-3 h-3 text-red-500" />
              <span>Response Rate: {userStats?.responseRate ?? 'N/A'}</span>
            </div>
          </div>
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