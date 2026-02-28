"use client";

import { useState } from "react";
import { PostCommentForm } from "@/components/PostCommentForm";

type Author = {
  id: string;
  role: string | null;
  seniority: string | null;
  industry: string | null;
  companySize: string | null;
};

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  author: Author;
};

type Props = {
  postId: string;
  initialComments: Comment[];
  isLoggedIn: boolean;
};

function formatCompanySize(size: string | null): string {
  const map: Record<string, string> = {
    small: "Small company",
    medium: "Mid-size company",
    large: "Large company",
    enterprise: "Enterprise",
  };
  return size ? (map[size] ?? size) : "";
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function authorLabel(author: Author): string {
  const parts = [
    author.seniority,
    author.role,
    author.industry,
    formatCompanySize(author.companySize),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Anonymous practitioner";
}

export function PostCommentSection({ postId, initialComments, isLoggedIn }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);

  function handleCommentAdded(comment: Comment) {
    setComments((prev) => [...prev, comment]);
  }

  return (
    <div>
      {/* Comments */}
      <div className="mb-8 space-y-4">
        {comments.length === 0 && (
          <p className="py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
            No comments yet. Be the first to respond.
          </p>
        )}
        {comments.map((comment, idx) => (
          <div key={comment.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {idx + 1}
              </div>
              {idx < comments.length - 1 && (
                <div className="mt-1 w-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {authorLabel(comment.author)}
                </span>
                <span className="text-xs text-zinc-300 dark:text-zinc-600">·</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {formatTimeAgo(comment.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment box */}
      {isLoggedIn ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Add your perspective
          </h3>
          <PostCommentForm postId={postId} onCommentAdded={handleCommentAdded} />
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to comment.
          </p>
        </div>
      )}
    </div>
  );
}
