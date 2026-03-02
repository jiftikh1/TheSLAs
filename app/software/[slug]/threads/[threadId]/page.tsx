import { auth } from "@/lib/auth";
import { getThreadById } from "@/lib/threads";
import { ThreadDetail } from "@/components/ThreadDetail";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string; threadId: string }>;
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

export default async function ThreadPage({ params }: Props) {
  const [session, { slug, threadId }] = await Promise.all([
    auth(),
    params,
  ]);

  const thread = await getThreadById(threadId);
  if (!thread || thread.moderationStatus === "removed") notFound();
  if (thread.software.slug !== slug) notFound();

  const authorParts = [
    thread.author.seniority,
    thread.author.role,
    thread.author.industry,
    formatCompanySize(thread.author.companySize),
  ].filter(Boolean);

  // Serialize dates for client component
  const replies = thread.replies.map((r) => ({
    ...r,
    createdAt: r.createdAt,
  }));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <Link
            href={`/software/${slug}?tab=discussions`}
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← {thread.software.name} discussions
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Thread OP */}
        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {thread.title}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              {authorParts.length > 0
                ? authorParts.join(" · ")
                : "Anonymous practitioner"}
            </span>
            <span className="text-zinc-300 dark:text-zinc-600">·</span>
            <span>{formatTimeAgo(thread.createdAt)}</span>
            <span className="text-zinc-300 dark:text-zinc-600">·</span>
            <span>{replies.length} {replies.length === 1 ? "reply" : "replies"}</span>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            {thread.content}
          </p>
        </div>

        {/* Replies + reply form */}
        <ThreadDetail
          threadId={thread.id}
          initialReplies={replies}
          isLoggedIn={!!session}
        />
      </main>
    </div>
  );
}
