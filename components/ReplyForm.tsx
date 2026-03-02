"use client";

import { useState } from "react";

type Reply = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    role: string | null;
    seniority: string | null;
    industry: string | null;
    companySize: string | null;
  };
};

type Props = {
  threadId: string;
  onReplyAdded: (reply: Reply) => void;
};

export function ReplyForm({ threadId, onReplyAdded }: Props) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contentLen = content.trim().length;
  const isValid = contentLen >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/threads/${threadId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setContent("");
      onReplyAdded(data.reply as Reply);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add your perspective..."
        rows={4}
        maxLength={2000}
        className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {contentLen > 0 && !isValid
            ? `${10 - contentLen} more characters needed`
            : `${contentLen}/2000`}
        </p>
        {error && (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={!isValid || submitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {submitting ? "Posting..." : "Reply"}
        </button>
      </div>
    </form>
  );
}
