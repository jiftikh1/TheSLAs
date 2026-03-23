import { getRecentPosts } from "@/lib/software";
import { ValidationButtons } from "@/components/ValidationButtons";
import { TOPICS } from "@/lib/review-questions";
import Link from "next/link";
import { ThumbsUp, ThumbsDown, Star, MessageSquare } from "lucide-react";

type FeedPost = Awaited<ReturnType<typeof getRecentPosts>>[number];

const DIMENSION_LABELS: Record<string, string> = {
  PARTNERSHIPS: "Partnerships",
  INTEGRATIONS: "Integrations",
  WORKFLOWS: "Workflows",
  ISSUES: "Issues",
};

const DIMENSION_ICON: Record<string, "up" | "down"> = {
  PARTNERSHIPS: "up",
  INTEGRATIONS: "up",
  WORKFLOWS: "up",
  ISSUES: "down",
};

type SeniorityLevel = "ic" | "lead" | "director";

function getSeniorityLevel(seniority: string | null): SeniorityLevel {
  if (!seniority) return "ic";
  const s = seniority.toLowerCase();
  if (s.includes("vp") || s.includes("director") || s.includes("chief")) return "director";
  if (s.includes("lead") || s.includes("manager") || s.includes("head") || s.includes("staff")) return "lead";
  return "ic";
}

const seniorityConfig: Record<SeniorityLevel, { label: string; className: string }> = {
  ic: { label: "Hands-on IC", className: "bg-badge-ic/15 text-badge-ic border-badge-ic/30" },
  lead: { label: "Team Lead", className: "bg-badge-lead/15 text-badge-lead border-badge-lead/30" },
  director: { label: "Director+", className: "bg-badge-director/15 text-badge-director border-badge-director/30" },
};

function trustToStars(score: number): number {
  if (score >= 80) return 5;
  if (score >= 60) return 4;
  if (score >= 40) return 3;
  if (score >= 20) return 2;
  return 1;
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

type Props = {
  post: FeedPost;
  currentUserId: string | null;
};

export function FeedPostCard({ post, currentUserId }: Props) {
  const stars = post.starRating ?? trustToStars(post.trustScore);
  const level = getSeniorityLevel(post.author.seniority);
  const { label: seniorityLabel, className: badgeClass } = seniorityConfig[level];
  const iconType = DIMENSION_ICON[post.dimension] ?? "up";

  const counts = {
    HELPFUL: post.validations.filter((v) => v.type === "HELPFUL").length,
    MATCHES_EXPERIENCE: post.validations.filter((v) => v.type === "MATCHES_EXPERIENCE").length,
    LEARNED_SOMETHING: post.validations.filter((v) => v.type === "LEARNED_SOMETHING").length,
  };

  const userValidations = currentUserId
    ? (post.validations
        .filter((v) => v.userId === currentUserId)
        .map((v) => v.type) as ("HELPFUL" | "MATCHES_EXPERIENCE" | "LEARNED_SOMETHING")[])
    : null;

  const commentCount = post._count.comments;
  const postHref = `/software/${post.software.slug}/posts/${post.id}`;
  const totalValidations = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <article
      className="rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/30"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <Link href={postHref} className="block p-6 transition-colors hover:bg-secondary/20 rounded-t-xl">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              {post.software.name}
            </h3>
            <span className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</span>
          </div>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
            {seniorityLabel}
          </span>
        </div>

        {/* Star rating */}
        <div className="mb-4 flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i <= stars ? "fill-accent text-accent" : "text-muted-foreground"}`}
            />
          ))}
        </div>

        {/* Content with icon */}
        <div className="mb-4 flex gap-2">
          {iconType === "up" ? (
            <ThumbsUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          ) : (
            <ThumbsDown className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          )}
          <p className="line-clamp-3 text-sm text-foreground/80">{post.content}</p>
        </div>

        {/* Dimension + username */}
        <div className="border-t border-border pt-3 flex items-center justify-between gap-2">
          <p className="text-sm italic text-muted-foreground">
            &ldquo;{post.topic ? (TOPICS.find((t) => t.id === post.topic)?.label ?? DIMENSION_LABELS[post.dimension]) : DIMENSION_LABELS[post.dimension] ?? post.dimension} insight&rdquo;
          </p>
          {post.author.username && (
            <span className="shrink-0 text-xs text-muted-foreground/60">
              @{post.author.username}
            </span>
          )}
        </div>

        {/* Counts + author username */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ThumbsUp className="h-3.5 w-3.5" />
              {totalValidations}
            </span>
            {commentCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                {commentCount}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Validation buttons */}
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
