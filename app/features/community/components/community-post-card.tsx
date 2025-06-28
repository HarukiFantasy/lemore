import { z } from "zod";

// Props 검증 스키마
const communityPostCardSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  timeAgo: z.string().min(1, "Time is required"),
  author: z.string().optional(),
  type: z.enum(["tip", "question"]).optional(),
  likes: z.number().optional(),
  comments: z.number().optional(),
});

type CommunityPostCardProps = z.infer<typeof communityPostCardSchema>;

export function CommunityPostCard({ 
  title, 
  timeAgo, 
  author, 
  type, 
  likes, 
  comments 
}: CommunityPostCardProps) {
  // Props 검증
  const validationResult = communityPostCardSchema.safeParse({ 
    title, 
    timeAgo, 
    author, 
    type, 
    likes, 
    comments 
  });
  
  if (!validationResult.success) {
    return (
      <div className="flex flex-col px-4 py-3 border-b last:border-b-0 bg-red-50">
        <span className="text-red-600 text-sm">Invalid post data: {validationResult.error.errors[0]?.message}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer">
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
              <span>👍</span>
              <span>{likes}</span>
            </span>
          )}
          {comments !== undefined && (
            <span className="flex items-center gap-1">
              <span>💬</span>
              <span>{comments}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 