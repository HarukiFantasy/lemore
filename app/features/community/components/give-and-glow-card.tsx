import { Card, CardContent } from "../../../common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../common/components/ui/avatar";
import { Badge } from '~/common/components/ui/badge';
import { getCategoryColors } from "~/lib/utils";
import { UserStatsHoverCard } from "~/common/components/user-stats-hover-card";

// Props interface for the component
interface GiveAndGlowCardProps {
  id: string;
  itemName: string;
  itemCategory: string;
  giverName: string;
  giverAvatar?: string;
  receiverName: string;
  receiverAvatar?: string;
  receiverId?: string; // Add receiver ID for appreciation badge checking
  rating: number;
  review: string;
  timestamp: string;
  location: string;
  tags: string[];
  appreciationBadge?: boolean;
  giverId?: string; // Add giver ID for appreciation badge checking
  giverStats?: any; // giver 통계 데이터
  receiverStats?: any; // receiver 통계 데이터
}

// Star rating component
const renderStars = (rating: number) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'fill-yellow-400' : 'fill-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

// Mock seller statistics - 실제로는 API에서 가져올 데이터
const getSellerStats = (sellerId: string): {
  totalListings: number;
  rating: number;
  responseRate: string;
} => {
  // 실제 구현에서는 sellerId를 사용해서 API 호출
  return {
    totalListings: Math.floor(Math.random() * 50) + 5,
    rating: Math.floor(Math.random() * 5) + 1,
    responseRate: `${Math.floor(Math.random() * 100) + 1}%`,
  };
};

// sellerId를 사용자 친화적인 이름으로 변환
const getSellerName = (sellerId: string): string => {
  // 실제 구현에서는 sellerId로 사용자 정보를 조회
  const sellerNames = [
    "Sarah M.", "John D.", "Maria L.", "Alex K.", "Emma W.",
    "David R.", "Lisa T.", "Mike P.", "Anna S.", "Tom B.",
    "Jenny H.", "Chris L.", "Rachel G.", "Mark J.", "Sophie N."
  ];
  
  // sellerId에서 숫자를 추출하여 일관된 이름 생성
  const num = parseInt(sellerId.replace(/\D/g, '')) || 0;
  return sellerNames[num % sellerNames.length];
};

export function GiveAndGlowCard({
  id,
  itemName,
  itemCategory,
  giverName,
  giverAvatar = "/sample.png",
  receiverName,
  receiverAvatar = "/sample.png",
  receiverId,
  rating,
  review,
  timestamp,
  location,
  tags,
  appreciationBadge = false,
  giverId,
  giverStats,
  receiverStats,
}: GiveAndGlowCardProps) {
  // Show appreciation badge if rating > 4 or if explicitly set to true
  const shouldShowAppreciationBadge = appreciationBadge || rating > 4;

  return (
    <Card className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg w-full">
      <CardContent style={{ paddingTop: '5px', paddingBottom: '5px', paddingLeft: '15px', paddingRight: '8px' }}>
        <div className="flex items-start gap-3">
          {/* Giver Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={giverAvatar} alt={giverName} />
              <AvatarFallback>{giverName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1">
            {/* Review Header */}
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{itemName}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <span>Given by </span>
                  <UserStatsHoverCard
                    profileId={giverId}
                    userName={giverName}
                    userStats={giverStats}
                    showAppreciationBadge={shouldShowAppreciationBadge}
                  >
                    {giverName}
                  </UserStatsHoverCard>
                  <span>•</span>
                  <span>Reviewed by </span>
                  <UserStatsHoverCard
                    profileId={receiverId}
                    userName={receiverName}
                    userStats={receiverStats}
                  >
                    {receiverName}
                  </UserStatsHoverCard>
                </div>
              </div>
            </div>
            
            {/* Rating and Category */}
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1">
                {renderStars(rating)}
                <span className="text-sm text-gray-600">{rating}/5</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${(() => {
                const colors = getCategoryColors(itemCategory);
                return `${colors.bg} ${colors.text} ${colors.border}`;
              })()}`}>
                {itemCategory}
              </span>
            </div>
            
            {/* Review Content */}
            <p className="text-sm text-gray-700 mb-1 leading-relaxed">{review}</p>
            
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag: string, index: number) => (
                  <Badge variant="outline"
                    key={index}
                    className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 