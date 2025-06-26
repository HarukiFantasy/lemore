interface CommunityPostCardProps {
  title: string;
  timeAgo: string;
}

export function CommunityPostCard({ title, timeAgo }: CommunityPostCardProps) {
  return (
    <div className="flex flex-col px-4 py-3 border-b last:border-b-0">
      <span className="font-medium text-base">{title}</span>
      <span className="text-sm text-neutral-500">{timeAgo}</span>
    </div>
  );
} 