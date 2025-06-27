import { z } from "zod";

// Props 검증 스키마
const communityPostCardSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  timeAgo: z.string().min(1, "Time is required"),
});

type CommunityPostCardProps = z.infer<typeof communityPostCardSchema>;

export function CommunityPostCard({ title, timeAgo }: CommunityPostCardProps) {
  // Props 검증
  const validationResult = communityPostCardSchema.safeParse({ title, timeAgo });
  
  if (!validationResult.success) {
    return (
      <div className="flex flex-col px-4 py-3 border-b last:border-b-0 bg-red-50">
        <span className="text-red-600 text-sm">Invalid post data: {validationResult.error.errors[0]?.message}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 py-3 border-b last:border-b-0">
      <span className="font-medium text-base">{title}</span>
      <span className="text-sm text-neutral-500">{timeAgo}</span>
    </div>
  );
} 