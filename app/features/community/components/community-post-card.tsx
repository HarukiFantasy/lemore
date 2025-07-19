import { z } from "zod";
import { HandThumbUpIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { Link, useSearchParams } from "react-router";
import { Card, CardHeader, CardContent, CardFooter } from "~/common/components/ui/card";

// Props 검증 스키마
const communityPostCardSchema = z.object({
  id: z.number().min(1, "ID is required"),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  timeAgo: z.string().min(1, "Time is required"),
  author: z.string().optional(),
  type: z.enum(["tip", "give-and-glow", "local-review"]).optional(),
  likes: z.number().optional(),
  comments: z.number().optional(),
  isLast: z.boolean().optional(),
  content: z.string().optional(), // 본문 미리보기 추가
  position: z.object({
    isFirst: z.boolean(),
    isLast: z.boolean(),
    index: z.number(),
    totalItems: z.number().optional(),
    isInLastRow: z.boolean().optional(),
  }).optional(),
});

type CommunityPostCardProps = z.infer<typeof communityPostCardSchema>;

export function CommunityPostCard({ 
  id,
  title, 
  timeAgo, 
  author, 
  type, 
  likes, 
  comments,
  isLast = false,
  content,
  position
}: CommunityPostCardProps) {
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location");

  // Helper function to add location to URLs
  const addLocationToUrl = (url: string) => {
    if (location && location !== "Bangkok") {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}location=${location}`;
    }
    return url;
  };

    // Helper function to determine corner rounding for responsive grid
  const getCornerRounding = () => {
    if (!position) return 'rounded-lg'; // 기본적으로 한 개 카드는 라운드
    
    const { isFirst, isLast, index, isInLastRow } = position;
    
    // Only one item
    if (isFirst && isLast) return 'rounded-lg';
    
    const isEvenIndex = index % 2 === 0; // 좌측 열 (0, 2, 4...)
    const isOddIndex = index % 2 === 1;  // 우측 열 (1, 3, 5...)
    
    // For mobile (1 column): 모바일 우선 클래스 설정
    let classes = '';
    if (isFirst) {
      classes += 'rounded-t-lg rounded-b-none md:rounded-none'; // 모바일: 상단만, 하단 명시적 제거
    } else if (isLast) {
      classes += 'rounded-b-lg rounded-t-none md:rounded-none'; // 모바일: 하단만, 상단 명시적 제거
    } else {
      classes += 'rounded-none';
    }
    
    // For desktop (2 columns): 데스크톱 전용 클래스 추가
    // 첫 번째 줄 (인덱스 0, 1)
    if (index <= 1) {
      if (isEvenIndex) classes += ' md:rounded-tl-lg'; // 좌측: 좌상단만
      if (isOddIndex) classes += ' md:rounded-tr-lg';  // 우측: 우상단만
    }
    // 마지막 줄
    else if (isInLastRow) {
      if (isEvenIndex) classes += ' md:rounded-bl-lg'; // 좌측: 좌하단만
      if (isOddIndex) classes += ' md:rounded-br-lg';  // 우측: 우하단만
    }
    
    return classes;
  };

  // Props 검증
  const validationResult = communityPostCardSchema.safeParse({ 
    id,
    title, 
    timeAgo, 
    author, 
    type, 
    likes, 
    comments,
    isLast
  });
  
  if (!validationResult.success) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-4">
          <span className="text-red-600 text-sm">Invalid post data: {validationResult.error.errors[0]?.message}</span>
        </CardContent>
      </Card>
    );
  }


  return (
    <Link to={addLocationToUrl(`/community/local-tips?search=${title}`)} className="block">
      <Card className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:scale-[1.01] md:hover:scale-[1.02] hover:shadow-md md:hover:shadow-lg ${getCornerRounding()} ${!isLast ? 'border-b border-gray-200' : ''}`}>
        <CardHeader className="pb-0 px-3 md:px-6 pt-2 md:pt-3">
          <div className="flex items-center gap-1 md:gap-2 mb-0.5 md:mb-1">
            {type && (
              <span className={`text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-full ${
                type === 'tip' 
                  ? 'bg-blue-100 text-blue-700' 
                  : type === 'give-and-glow'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {type === 'tip' ? 'Tip' : type === 'give-and-glow' ? 'Give & Glow' : 'Review'}
              </span>
            )}
            {author && (
              <span className="text-xs text-gray-500 truncate">by {author}</span>
            )}
          </div>
          <span className="font-medium text-sm md:text-base text-gray-900 leading-tight">{title}</span>
          {content && (
            <span className="block text-xs md:text-sm text-gray-600 line-clamp-2 md:line-clamp-1 mt-0.5 leading-relaxed">
              {content.length > 60 ? content.slice(0, 60) + '…' : content}
            </span>
          )}
        </CardHeader>
        <CardFooter className="-mt-1 px-3 md:px-6 pb-2 md:pb-3">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs md:text-sm text-gray-500 truncate">{timeAgo}</span>
            <div className="flex items-center gap-2 md:gap-4 text-xs text-gray-400 flex-shrink-0">
              {likes !== undefined && (
                <span className="flex items-center gap-0.5 md:gap-1">
                  <HandThumbUpIcon className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-xs">{likes}</span>
                </span>
              )}
              {comments !== undefined && (
                <span className="flex items-center gap-0.5 md:gap-1">
                  <ChatBubbleLeftEllipsisIcon className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-xs">{comments}</span>
                </span>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
} 