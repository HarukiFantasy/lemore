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
    row: z.number(),
    col: z.number(),
    isFirstRow: z.boolean(),
    isLastRow: z.boolean(),
    isFirstCol: z.boolean(),
    isLastCol: z.boolean(),
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

  // Helper function to determine corner rounding
  const getCornerRounding = () => {
    if (!position) return 'rounded-none';
    
    const { isFirstRow, isLastRow, isFirstCol, isLastCol } = position;
    
    if (isFirstRow && isFirstCol) return 'rounded-tl-lg'; // top-left
    if (isFirstRow && isLastCol) return 'rounded-tr-lg'; // top-right
    if (isLastRow && isFirstCol) return 'rounded-bl-lg'; // bottom-left
    if (isLastRow && isLastCol) return 'rounded-br-lg'; // bottom-right
    
    return 'rounded-none';
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
      <Card className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${getCornerRounding()} ${!isLast ? 'border-b border-gray-200' : ''}`}>
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2 mb-1">
            {type && (
              <span className={`text-xs px-2 py-1 rounded-full ${
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
              <span className="text-xs text-gray-500">by {author}</span>
            )}
          </div>
          <span className="font-medium text-base text-gray-900">{title}</span>
          {content && (
            <span className="block text-sm text-gray-600 truncate mt-1">
              {content.length > 50 ? content.slice(0, 50) + '…' : content}
            </span>
          )}
        </CardHeader>
        <CardFooter className="pt-0">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-gray-500">{timeAgo}</span>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              {likes !== undefined && (
                <span className="flex items-center gap-1">
                  <HandThumbUpIcon className="w-4 h-4" />
                  <span>{likes}</span>
                </span>
              )}
              {comments !== undefined && (
                <span className="flex items-center gap-1">
                  <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                  <span>{comments}</span>
                </span>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
} 