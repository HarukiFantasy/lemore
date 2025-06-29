import { z } from "zod";
import { HandThumbUpIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router";

// Props 검증 스키마
const communityPostCardSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  timeAgo: z.string().min(1, "Time is required"),
  author: z.string().optional(),
  type: z.enum(["tip", "question"]).optional(),
  likes: z.number().optional(),
  comments: z.number().optional(),
  isLast: z.boolean().optional(),
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
  isLast = false
}: CommunityPostCardProps) {
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
      <div className="flex flex-col px-4 py-3 border-b last:border-b-0 bg-red-50">
        <span className="text-red-600 text-sm">Invalid post data: {validationResult.error.errors[0]?.message}</span>
      </div>
    );
  }

  // post ID에서 실제 ID 추출 (tip-123 -> 123, question-456 -> 456)
  const actualId = id.includes('-') ? id.split('-')[1] : id;
  
  // type에 따라 링크 경로 결정
  const linkPath = type === 'tip' 
    ? `/community/local-tips?post=${actualId}`
    : `/community/ask-and-answer?post=${actualId}`;

  return (
    <Link to={linkPath} className="block">
      <div className={`flex flex-col px-4 py-2 ${!isLast ? 'border-b border-gray-200' : ''} hover:bg-gray-50 transition-colors cursor-pointer`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {type && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  type === 'tip' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {type === 'tip' ? 'Tip' : 'Q&A'}
                </span>
              )}
              {author && (
                <span className="text-xs text-gray-500">by {author}</span>
              )}
            </div>
            <span className="font-medium text-base text-gray-900">{title}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
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
      </div>
    </Link>
  );
} 