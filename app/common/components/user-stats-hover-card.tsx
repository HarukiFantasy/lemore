import { HoverCard, HoverCardTrigger, HoverCardContent } from "./ui/hover-card";
import { Badge } from "./ui/badge";
import { PackageIcon, EyeIcon, MessageCircleReplyIcon } from "lucide-react";
import { useAppreciationBadge } from "~/hooks/use-appreciation-badge";

interface UserStatsHoverCardProps {
  userId?: string;
  userName: string;
  userType?: "Seller" | "Giver" | "Receiver" | "User";
  children: React.ReactNode;
  showAppreciationBadge?: boolean;
  className?: string;
}

// Mock seller statistics - 실제로는 API에서 가져올 데이터
const getUserStats = (userId: string): {
  totalListings: number;
  rating: number;
  responseRate: string;
} => {
  // 실제 구현에서는 userId를 사용해서 API 호출
  return {
    totalListings: Math.floor(Math.random() * 50) + 5,
    rating: Math.floor(Math.random() * 5) + 1,
    responseRate: `${Math.floor(Math.random() * 100) + 1}%`,
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

/**
 * UserStatsHoverCard - A reusable component that shows user statistics in a hover card
 * 
 * @example
 * ```tsx
 * <UserStatsHoverCard
 *   userId="user-123"
 *   userName="John Doe"
 *   userType="Seller"
 *   showAppreciationBadge={true}
 * >
 *   John Doe
 * </UserStatsHoverCard>
 * ```
 * 
 * @param userId - Optional user ID for database queries
 * @param userName - Display name of the user
 * @param userType - Type of user (Seller, Giver, User)
 * @param children - The content to display as the hover trigger
 * @param showAppreciationBadge - Whether to show appreciation badge based on rating
 * @param className - Additional CSS classes for styling
 */
export function UserStatsHoverCard({
  userId,
  userName,
  userType = "User",
  children,
  showAppreciationBadge = false,
  className = ""
}: UserStatsHoverCardProps) {
  // Use the appreciation badge hook
  const { hasAppreciationBadge, isLoading } = useAppreciationBadge(userId);
  
  // Get user stats
  const userStats = userId ? getUserStats(userId) : getUserStats(userName);

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
            <span className="font-semibold text-sm">{getDisplayName(userId || userName)}</span>
            <Badge variant="secondary" className="text-xs">{userType}</Badge>
            {/* Show appreciation badge for users with high-rated give-and-glow reviews */}
            {(hasAppreciationBadge || showAppreciationBadge) && (
              <Badge variant="outline" className="text-xs bg-green-100 text-green-700">Appreciation</Badge>
            )}
            {isLoading && (
              <Badge variant="outline" className="text-xs bg-gray-100 text-gray-500">Loading...</Badge>
            )}
          </div>
          
          <div className="text-xs text-neutral-500">
            ID: {userId || userName}
          </div>
          
          {/* User Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1">
              <PackageIcon className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-neutral-600">Total Listings</span>
              <span className="text-sm font-semibold">{userStats.totalListings}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <EyeIcon className="w-4 h-4 text-green-500" />
              <span className="text-xs text-neutral-600">Rating</span>
              <span className="text-sm font-semibold">{userStats.rating}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MessageCircleReplyIcon className="w-4 h-4 text-red-500" />
              <span className="text-xs text-neutral-600">Response Rate</span>
              <span className="text-sm font-semibold">{userStats.responseRate}</span>
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