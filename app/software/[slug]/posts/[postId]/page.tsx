import { auth } from "@/lib/auth";
import { getPostById } from "@/lib/posts";
import { PostCommentSection } from "@/components/PostCommentSection";
import { ValidationButtons } from "@/components/ValidationButtons";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string; postId: string }>;
};

const DIMENSION_LABELS: Record<string, string> = {
  PARTNERSHIPS: "Partnerships",
  INTEGRATIONS: "Integrations",
  WORKFLOWS: "Workflows",
  ISSUES: "Issues",
};

function getTrustBadge(score: number): { label: string; className: string } {
  if (score >= 67)
    return {
      label: "High confidence",
      className: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
    };
  if (score >= 34)
    return {
      label: "Medium confidence",
      className: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
    };
  return {
    label: "Low confidence",
    className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  };
}

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

export default async function PostDetailPage({ params }: Props) {
  const [session, { slug, postId }] = await Promise.all([auth(), params]);

  const post = await getPostById(postId);
  if (!post || post.moderationStatus === "removed") notFound();
  if (post.software.slug !== slug) notFound();

  const trust = getTrustBadge(post.trustScore);

  const authorParts = [
    post.author.seniority,
    post.author.role,
    post.author.industry,
    formatCompanySize(post.author.companySize),
  ].filter(Boolean);

  const counts = {
    HELPFUL: post.validations.filter((v) => v.type === "HELPFUL").length,
    MATCHES_EXPERIENCE: post.validations.filter((v) => v.type === "MATCHES_EXPERIENCE").length,
    LEARNED_SOMETHING: post.validations.filter((v) => v.type === "LEARNED_SOMETHING").length,
  };

  const currentUserId = session?.user?.id ?? null;
  const userValidations = currentUserId
    ? (post.validations
        .filter((v) => v.userId === currentUserId)
        .map((v) => v.type) as ("HELPFUL" | "MATCHES_EXPERIENCE" | "LEARNED_SOMETHING")[])
    : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <Link
            href={`/software/${slug}?dimension=${post.dimension}`}
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← {post.software.name} · {DIMENSION_LABELS[post.dimension] ?? post.dimension}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* OP block */}
        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {authorParts.length > 0
                ? authorParts.join(" · ")
                : "Anonymous practitioner"}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${trust.className}`}
              >
                {trust.label}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {formatTimeAgo(post.createdAt)}
              </span>
            </div>
          </div>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            {post.content}
          </p>

          <ValidationButtons
            postId={post.id}
            initialCounts={counts}
            userValidations={userValidations}
          />
        </div>

        {/* Comments */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {post.comments.length}{" "}
            {post.comments.length === 1 ? "comment" : "comments"}
          </h2>
        </div>
        <PostCommentSection
          postId={post.id}
          initialComments={post.comments}
          isLoggedIn={!!session}
        />
      </main>
    </div>
  );
}
