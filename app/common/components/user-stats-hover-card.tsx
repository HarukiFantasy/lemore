import { HoverCard, HoverCardTrigger, HoverCardContent } from "./ui/hover-card";
import { Badge } from "./ui/badge";
import { PackageIcon, HeartIcon } from "lucide-react";
import { Button } from './ui/button';
import { Link } from "react-router";
import { useMobile } from "~/hooks/use-mobile";

interface UserStats {
  totalListings: number;
  totalLikes: number;
  totalSold: number;
  sellerJoinedAt: string;
  level?: string; // 추가
}

interface UserStatsHoverCardProps {
  profileId?: string;
  userName: string;
  children: React.ReactNode;
  showAppreciationBadge?: boolean;
  className?: string;
  userStats?: UserStats;
  sellerJoinedAt?: string;
}

export function UserStatsHoverCard({
  profileId,
  userName,
  children,
  showAppreciationBadge = false,
  className = "",
  userStats,
  sellerJoinedAt
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
      <HoverCardContent className="w-80 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="font-semibold text-sm truncate">{userName}</span>
              {userStats?.level && (
                <Badge variant="secondary" className="h-5 text-xs bg-purple-100 text-purple-700 border border-purple-200 flex-shrink-0">
                  {userStats.level}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link to={`/users/${userName}`}>
                <Button variant="secondary" className="text-xs h-5 px-2">
                  ViewProfile
                </Button>
              </Link>
              {(showAppreciationBadge) && (
                <Badge variant="outline" className="text-xs bg-green-100 text-green-700">Appreciation</Badge>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
              <PackageIcon className="w-3 h-3 text-blue-500" />
              <span>Listings: {userStats?.totalListings ?? 'N/A'}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
              <HeartIcon className="w-3 h-3 text-red-500" />
              <span>Likes: {userStats?.totalLikes ?? 'N/A'}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
              <PackageIcon className="w-3 h-3 text-green-500" />
              <span>Sold: {userStats?.totalSold ?? 'N/A'}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-neutral-600">
              <span className="font-medium">Member since:</span> 
              <span className="ml-1">{userStats?.sellerJoinedAt ?? 'N/A'}</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
} 