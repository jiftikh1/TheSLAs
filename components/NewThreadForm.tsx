"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  slug: string;
  softwareName: string;
};

export function NewThreadForm({ slug, softwareName }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleLen = title.trim().length;
  const contentLen = content.trim().length;
  const isValid = titleLen >= 5 && contentLen >= 20;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push(`/software/${slug}/threads/${data.thread.id}`);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Thread title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`e.g. "What's the real story with ${softwareName}'s support SLA?"`}
          maxLength={200}
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
        <p className="mt-1 text-xs text-zinc-400">
          {titleLen < 5 && titleLen > 0
            ? `${5 - titleLen} more characters needed`
            : `${titleLen}/200`}
        </p>
      </div>

      {/* Body */}
      <div>
        <label
          htmlFor="content"
          className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          What do you want to discuss?
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share context, ask a question, or describe a situation you're dealing with. Be specific — the best discussions start with real details."
          rows={8}
          maxLength={5000}
          className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
        <p className="mt-1 text-xs text-zinc-400">
          {contentLen < 20 && contentLen > 0
            ? `${20 - contentLen} more characters needed`
            : `${contentLen}/5000`}
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Posted anonymously — only your role and seniority are visible.
        </p>
        <button
          type="submit"
          disabled={!isValid || submitting}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {submitting ? "Posting..." : "Post thread"}
        </button>
      </div>
    </form>
  );
}
