import { z } from "zod";
import { 
  ChatBubbleLeftEllipsisIcon, 
  EyeIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  HeartIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { Link, useSearchParams } from "react-router";
import { Card, CardContent, CardFooter } from "~/common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { UserStatsHoverCard } from "~/common/components/user-stats-hover-card";
import { DateTime } from "luxon";

// Props 검증 스키마
const tipPostCardSchema = z.object({
  id: z.number().min(1, "ID is required"),  
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  avatar_url: z.string().optional(),
  timeAgo: z.string().min(1, "Time is required"),
  location: z.string().optional(),
  category: z.string().optional(),
  likes: z.number().min(0).default(0),
  comments: z.number().min(0).default(0),
  reviews: z.number().min(0).default(0),
  variant: z.enum(["compact", "full"]).default("compact"),
  
  // Grid positioning for rounded corners
  gridIndex: z.number().optional(),
  totalItems: z.number().optional(),
  columnsDesktop: z.number().optional(),
  columnsMobile: z.number().optional(),
  
  // Full 모드에서만 사용
  isLiked: z.boolean().optional(),
  isExpanded: z.boolean().optional(),
  onLikeToggle: z.function().optional(),
  onToggleExpansion: z.function().optional(),
  commentsData: z.array(z.any()).optional(),
  repliesData: z.array(z.any()).optional(),
});

type TipPostCardProps = z.infer<typeof tipPostCardSchema>;

// 카테고리 색상 함수
const getCategoryColors = (category: string) => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    "Food & Dining": { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
    "Transportation": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
    "Shopping": { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
    "Entertainment": { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
    "Healthcare": { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
    "Education": { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
    "Housing": { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
    "Work & Career": { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
    "Finance": { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" },
  };
  return colorMap[category] || { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };
};

// 컨텐츠가 긴지 확인하는 함수
const isContentLong = (content: string) => {
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.length > 150;
};

export function TipPostCard({
  id,
  title,
  content,
  author,
  avatar_url,
  timeAgo,
  location,
  category,
  likes = 0,
  comments = 0,
  reviews = 0,
  variant = "compact",
  gridIndex,
  totalItems,
  columnsDesktop = 2,
  columnsMobile = 1,
  isLiked = false,
  isExpanded = false,
  onLikeToggle,
  onToggleExpansion,
  commentsData,
  repliesData,
}: TipPostCardProps) {
  const [searchParams] = useSearchParams();
  const urlLocation = searchParams.get("location");

  // Helper function to add location to URLs
  const addLocationToUrl = (url: string) => {
    if (urlLocation && urlLocation !== "Bangkok") {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}location=${urlLocation}`;
    }
    return url;
  };

  // Calculate rounded corners based on grid position
  const getGridRoundingClasses = () => {
    if (gridIndex === undefined || totalItems === undefined) {
      return "rounded-lg"; // Default rounding if no grid info
    }

    // Mobile (1 column) positioning
    const isFirstMobile = gridIndex === 0;
    const isLastMobile = gridIndex === totalItems - 1;
    
    // Desktop (2 columns) positioning  
    const isFirstRowDesktop = gridIndex < columnsDesktop;
    const lastRowStartIndexDesktop = Math.floor((totalItems - 1) / columnsDesktop) * columnsDesktop;
    const isLastRowDesktop = gridIndex >= lastRowStartIndexDesktop;
    const isLeftColumnDesktop = gridIndex % columnsDesktop === 0;
    const isRightColumnDesktop = gridIndex % columnsDesktop === columnsDesktop - 1 || gridIndex === totalItems - 1;

    // Determine exact position for precise rounding
    let mobileClasses = "";
    let desktopClasses = "";

    // Mobile classes - container has rounded-2xl
    if (totalItems === 1) {
      mobileClasses = "rounded-2xl";
    } else if (isFirstMobile) {
      mobileClasses = "rounded-none rounded-tl-2xl rounded-tr-2xl"; // Reset all, then apply top corners only
    } else if (isLastMobile) {
      mobileClasses = "rounded-none rounded-bl-2xl rounded-br-2xl"; // Reset all, then apply bottom corners only  
    } else {
      mobileClasses = "rounded-none"; // No rounding for middle items
    }

    // Desktop classes - need to override mobile AND apply specific corners
    if (totalItems === 1) {
      desktopClasses = "md:rounded-2xl";
    } else {
      // Start with removing all mobile rounding
      let corners = [];
      
      // Add only the corners this card should have
      if (isFirstRowDesktop && isLeftColumnDesktop) {
        corners.push("rounded-tl-2xl"); // Top-left
      }
      if (isFirstRowDesktop && isRightColumnDesktop) {
        corners.push("rounded-tr-2xl"); // Top-right
      }
      if (isLastRowDesktop && isLeftColumnDesktop) {
        corners.push("rounded-bl-2xl"); // Bottom-left  
      }
      if (isLastRowDesktop && isRightColumnDesktop) {
        corners.push("rounded-br-2xl"); // Bottom-right
      }
      
      if (corners.length > 0) {
        // First reset all rounding, then apply specific corners
        desktopClasses = "md:rounded-none " + corners.map(c => `md:${c}`).join(" ");
      } else {
        // Middle cards - just remove all rounding
        desktopClasses = "md:rounded-none";
      }
    }

    return `${mobileClasses} ${desktopClasses}`.trim();
  };

  // Compact 모드 (홈페이지용)
  if (variant === "compact") {
    const roundingClasses = getGridRoundingClasses();
    
    return (
      <Link to={addLocationToUrl(`/community/local-tips?search=${encodeURIComponent(title)}`)} className="block">
        <Card className={`
          transition-all duration-200 ease-out
          active:scale-95 active:bg-gray-50 
          md:hover:bg-gradient-to-r md:hover:from-blue-50 md:hover:to-purple-50 
          md:hover:scale-[1.01] md:hover:shadow-md 
          ${roundingClasses}
        `}>
          <CardContent className="p-3 -mt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                Tip
              </span>
              <span className="text-xs text-gray-500 truncate">by {author}</span>
            </div>
            <h3 className="font-medium text-sm md:text-base text-gray-900 leading-tight mt-2 mb-1">
              {title}
            </h3>
            <p className="text-xs md:text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {content.replace(/<[^>]*>/g, '').slice(0, 100)}
              {content.length > 100 ? '...' : ''}
            </p>
          </CardContent>
          <CardFooter className="px-3 -mt-3">
            <div className="flex items-center justify-between w-full text-xs text-gray-500">
              <span>{timeAgo}</span>
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
                  {isLiked ? (
                    <HeartSolidIcon className="h-3 w-3" />
                  ) : (
                    <HeartIcon className="h-3 w-3" />
                  )}
                  {likes}
                </span>
                <span className="flex items-center gap-1">
                  <ChatBubbleLeftEllipsisIcon className="h-3 w-3" />
                  {comments}
                </span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>
    );
  }

  // Full 모드 (Local Tips 페이지용)
  return (
    <Card className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
      <CardContent className="py-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <div className="mb-3">
              <div
                className={`text-sm text-gray-700 ${
                  !isExpanded && isContentLong(content) 
                    ? 'line-clamp-2' 
                    : ''
                }`}
                dangerouslySetInnerHTML={{ __html: content }}
              />
              {isContentLong(content) && onToggleExpansion && (
                <button
                  onClick={() => onToggleExpansion(id)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-1"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUpIcon className="h-4 w-4" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-4 w-4" />
                      Show more
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs sm:text-sm">By</span>
                <Avatar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0">
                  <AvatarImage src={avatar_url} alt={author} />
                  <AvatarFallback className="text-xs">
                    {author.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <UserStatsHoverCard userName={author}>
                  <span className="text-xs sm:text-sm font-medium truncate">{author}</span>
                </UserStatsHoverCard>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="truncate">{timeAgo}</span>
                {location && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="truncate">{location}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {category && (() => {
              const colors = getCategoryColors(category);
              return (
                <span className={`px-2 py-1 text-xs rounded-md ${colors.bg} ${colors.text} ${colors.border}`}>
                  {category}
                </span>
              );
            })()}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <EyeIcon className="h-4 w-4 text-muted-foreground" />
              <span>{reviews}</span>
            </div>
            {onLikeToggle ? (
              <button
                onClick={() => onLikeToggle(id)}
                className={`flex items-center gap-1 transition-colors cursor-pointer ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isLiked ? (
                  <HeartSolidIcon className="h-4 w-4" />
                ) : (
                  <HeartIcon className="h-4 w-4" />
                )}
                <span>{likes}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground">
                <HeartIcon className="h-4 w-4" />
                <span>{likes}</span>
              </div>
            )}
            <button
              onClick={() => onToggleExpansion && onToggleExpansion(id)}
              className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            >
              <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
              <span>{comments}</span>
            </button>
          </div>
        </div>

        {/* Comments Section - Full 모드에서만 표시 */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            {commentsData && commentsData.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Comments ({commentsData.length})</h4>
                {commentsData.map((comment: any) => (
                  <div key={comment.comment_id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                      <span className="font-medium text-sm truncate">{comment.author?.username}</span>
                      <span className="text-xs text-muted-foreground self-start sm:self-auto">
                        {DateTime.fromISO(comment.created_at).toRelative()}
                      </span>
                    </div>
                    <div
                      className="text-sm text-gray-700"
                      dangerouslySetInnerHTML={{ __html: comment.content }}
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <HeartIcon className="h-3 w-3" />
                        <span>{comment.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No comments yet</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 