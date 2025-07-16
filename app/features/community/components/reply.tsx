import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../../../common/components/ui/avatar";
import { formatTimeAgo } from "~/lib/utils";

interface User {
  username: string;
  avatar_url?: string | null;
}

export interface LocalTipReply {
  reply_id: number;
  reply: string;
  created_at: string;
  user?: User;
  local_tip_replies?: LocalTipReply[];
}

interface ReplyProps {
  reply: LocalTipReply;
  isChild?: boolean;
  postId: number;
  parentId?: number | null;
  onSubmitReply: (postId: number, parentId: number | null, reply: string) => void;
}

export function Reply({ reply, isChild = false, postId, parentId, onSubmitReply }: ReplyProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const toggleReplyForm = () => setShowReplyForm((prev) => !prev);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyInput.trim()) {
      onSubmitReply(postId, reply.reply_id, replyInput.trim());
      setReplyInput("");
      setShowReplyForm(false);
    }
  };

  return (
    <div style={{ marginLeft: isChild ? 24 : 0 }} className={isChild ? 'pl-6 border-l' : ''}>
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={reply.user?.avatar_url || undefined} alt={reply.user?.username || 'U'} />
            <AvatarFallback className="text-xs">
              {reply.user?.username ? reply.user.username.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{reply.user?.username || 'Unknown'}</span>
        </div>
        <span className="text-xs text-muted-foreground">{formatTimeAgo(new Date(reply.created_at))}</span>
      </div>
      <div className="text-sm text-gray-700 mb-1">{reply.reply}</div>
      <div className="flex gap-2 mb-2">
        <button onClick={toggleReplyForm} className="text-xs text-blue-600 hover:underline">Reply</button>
      </div>
      {showReplyForm && (
        <form className="mb-2" onSubmit={handleSubmit}>
          <input
            type="text"
            className="border rounded px-2 py-1 w-full text-sm"
            placeholder="Reply..."
            value={replyInput}
            onChange={e => setReplyInput(e.target.value)}
          />
        </form>
      )}
      {/* 대댓글(Reply) 재귀 렌더링 */}
      {reply.local_tip_replies && reply.local_tip_replies.length > 0 && (
        <div className="space-y-2 mt-1">
          {reply.local_tip_replies.map((child) => (
            <Reply
              key={child.reply_id}
              reply={child}
              isChild={true}
              postId={postId}
              parentId={reply.reply_id}
              onSubmitReply={onSubmitReply}
            />
          ))}
        </div>
      )}
    </div>
  );
} 