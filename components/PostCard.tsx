import { getSoftwarePostsByDimension } from "@/lib/software";
import { ValidationButtons } from "@/components/ValidationButtons";
import Link from "next/link";

type Post = Awaited<ReturnType<typeof getSoftwarePostsByDimension>>[number];

function getTrustBadge(score: number): { label: string; className: string } {
  if (score >= 67)
    return {
      label: "High confidence",
      className:
        "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
    };
  if (score >= 34)
    return {
      label: "Medium confidence",
      className:
        "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
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

type Props = {
  post: Post;
  currentUserId: string | null;
  softwareSlug: string;
};

export function PostCard({ post, currentUserId, softwareSlug }: Props) {
  const trust = getTrustBadge(post.trustScore);

  const authorParts = [
    post.author.seniority,
    post.author.role,
    post.author.industry,
    formatCompanySize(post.author.companySize),
  ].filter(Boolean);

  const counts = {
    HELPFUL: post.validations.filter((v) => v.type === "HELPFUL").length,
    MATCHES_EXPERIENCE: post.validations.filter(
      (v) => v.type === "MATCHES_EXPERIENCE"
    ).length,
    LEARNED_SOMETHING: post.validations.filter(
      (v) => v.type === "LEARNED_SOMETHING"
    ).length,
  };

  const userValidations = currentUserId
    ? (post.validations
        .filter((v) => v.userId === currentUserId)
        .map((v) => v.type) as ("HELPFUL" | "MATCHES_EXPERIENCE" | "LEARNED_SOMETHING")[])
    : null;

  const commentCount = post._count.comments;
  const postHref = `/software/${softwareSlug}/posts/${post.id}`;

  return (
    <article className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <Link href={postHref} className="block p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors rounded-t-lg">
        {/* Header row */}
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

        {/* Content */}
        <p className="mt-3 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          {post.content}
        </p>

        {/* Comment count */}
        <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
          {commentCount} {commentCount === 1 ? "comment" : "comments"}
        </p>
      </Link>

      {/* Validations — outside the link to avoid nested <a> */}
      <div className="px-6 pb-4">
        <ValidationButtons
          postId={post.id}
          initialCounts={counts}
          userValidations={userValidations}
        />
      </div>
    </article>
  );
}
