import { HoverCard, HoverCardTrigger, HoverCardContent } from "./ui/hover-card";
import { Badge } from "./ui/badge";
import { PackageIcon, EyeIcon, MessageCircleReplyIcon } from "lucide-react";
import { useAppreciationBadge } from "~/hooks/use-appreciation-badge";
import { Button } from './ui/button';
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { makeSSRClient } from "~/supa-client";
import { getUserByUsername } from "~/features/users/queries";

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
}

// 실제 데이터베이스에서 유저 통계를 가져오는 함수
const getUserStats = async (username: string): Promise<UserStats> => {
  try {
    // 클라이언트 사이드에서는 fetch API를 사용
    const response = await fetch(`/api/users/${username}/stats`);
    if (response.ok) {
      const userData = await response.json();
      return {
        totalListings: userData?.total_listings || 0,
        rating: userData?.rating || 0,
        responseRate: userData?.response_rate || "0%",
      };
    }
  } catch (error) {
    console.error("Error fetching user stats:", error);
  }
  
  // 기본값 반환
  return {
    totalListings: 0,
    rating: 0,
    responseRate: "0%",
  };
};

// userId를 사용자 친화적인 이름으로 변환
const getDisplayName = (userId: string): string => {
  // 실제 구현에서는 userId로 사용자 정보를 조회
  const userNames = [
    "Sarah M.", "John D.", "Maria L.", "Alex K.", "Emma W.",
    "David R.", "Lisa T.", "Mike P.", "Anna S.", "Tom B.",
    "Jenny H.", "Chris L.", "Rachel G.", "Mark J.", "Sophie N."
  ];
  
  // userId에서 숫자를 추출하여 일관된 이름 생성
  const num = parseInt(userId.replace(/\D/g, '')) || 0;
  return userNames[num % userNames.length];
};

export function UserStatsHoverCard({
  profileId,
  userName,
  children,
  showAppreciationBadge = false,
  className = ""
}: UserStatsHoverCardProps) {
  const [userStats, setUserStats] = useState<UserStats>({
    totalListings: 0,
    rating: 0,
    responseRate: "0%"
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Use the appreciation badge hook
  const { hasAppreciationBadge, isLoading } = useAppreciationBadge(profileId);
  
  // Get user stats when component mounts or username changes
  useEffect(() => {
    const fetchUserStats = async () => {
      setIsLoadingStats(true);
      try {
        const stats = await getUserStats(userName);
        setUserStats(stats);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (userName) {
      fetchUserStats();
    }
  }, [userName]);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className={`cursor-pointer hover:text-neutral-700 transition-colors font-medium underline decoration-dotted underline-offset-2 hover:decoration-solid ${className}`}>
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{getDisplayName(profileId || userName)}</span>
            <Link to={`/users/${profileId}`}>
              <Button variant="secondary" className="text-xs h-6">
                See Profile..
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
          
          <div className="text-xs text-neutral-500">
            ID: {profileId || userName}
          </div>
          
          {/* User Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1">
              <PackageIcon className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-neutral-600">Total Listings</span>
              <span className="text-sm font-semibold">
                {isLoadingStats ? "..." : userStats.totalListings}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <EyeIcon className="w-4 h-4 text-green-500" />
              <span className="text-xs text-neutral-600">Rating</span>
              <span className="text-sm font-semibold">
                {isLoadingStats ? "..." : userStats.rating}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MessageCircleReplyIcon className="w-4 h-4 text-red-500" />
              <span className="text-xs text-neutral-600">Response Rate</span>
              <span className="text-sm font-semibold">
                {isLoadingStats ? "..." : userStats.responseRate}
              </span>
            </div>
          </div>
          
          {/* Additional User Info */}
          <div className="pt-2 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
              <div>
                <span className="font-medium">Member since:</span> 
                <span className="ml-1">2023</span>
              </div>
              <div>
                <span className="font-medium">Response rate:</span> 
                <span className="ml-1">98%</span>
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
} 