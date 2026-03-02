import {
  getSoftwareWithStats,
  getSoftwarePostsByDimension,
  getDimensionTrend,
  type TrendDirection,
  type Lens,
} from "@/lib/software";
import { getThreadsBySoftware } from "@/lib/threads";
import { getDimensionSummary } from "@/lib/ai";
import { PostCard } from "@/components/PostCard";
import { DimensionSummaryCard } from "@/components/DimensionSummary";
import { LensToggle } from "@/components/LensToggle";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Dimension } from "@prisma/client";
import { Suspense } from "react";

const DIMENSIONS: {
  value: Dimension;
  label: string;
  description: string;
}[] = [
  {
    value: "PARTNERSHIPS",
    label: "Partnerships",
    description:
      "Vendor relationship quality, responsiveness, and roadmap trustworthiness",
  },
  {
    value: "INTEGRATIONS",
    label: "Integrations",
    description: "Integration depth, reliability, and ongoing maintenance burden",
  },
  {
    value: "WORKFLOWS",
    label: "Workflows",
    description:
      "What it excels at, where it becomes painful, and what breaks at scale",
  },
  {
    value: "ISSUES",
    label: "Issues",
    description:
      "Known landmines, late-discovery gotchas, and things you only learn months in",
  },
];

const VALID_DIMENSIONS = new Set<string>(Object.values(Dimension));

const VALID_LENSES = new Set<string>(["all", "practitioner", "leader", "user"]);

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ dimension?: string; tab?: string; lens?: string }>;
};

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export default async function SoftwareProfilePage({
  params,
  searchParams,
}: Props) {
  const [session, { slug }, { dimension: dimensionParam, tab, lens: lensParam }] =
    await Promise.all([auth(), params, searchParams]);

  const activeLens: Lens =
    lensParam && VALID_LENSES.has(lensParam)
      ? (lensParam as Lens)
      : "all";

  const software = await getSoftwareWithStats(slug);
  if (!software) notFound();

  const isDiscussions = tab === "discussions";

  const raw = dimensionParam?.toUpperCase() ?? "";
  const activeDimension: Dimension = VALID_DIMENSIONS.has(raw)
    ? (raw as Dimension)
    : "PARTNERSHIPS";

  const [posts, threads, trend, summary] = await Promise.all([
    isDiscussions ? Promise.resolve([]) : getSoftwarePostsByDimension(software.id, activeDimension, activeLens),
    isDiscussions ? getThreadsBySoftware(software.id) : Promise.resolve([]),
    isDiscussions ? Promise.resolve("insufficient_data" as TrendDirection) : getDimensionTrend(software.id, activeDimension),
    isDiscussions ? Promise.resolve(null) : getDimensionSummary(software.name, software.id, activeDimension),
  ]);

  const activeDimInfo = DIMENSIONS.find((d) => d.value === activeDimension)!;
  const totalInsights = Object.values(software.postCounts).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <Link
            href="/software"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Software Catalog
          </Link>

          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {software.name}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {software.category}
                </span>
                {software.website && (
                  <a
                    href={software.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                  >
                    {software.website} ↗
                  </a>
                )}
              </div>
              {software.description && (
                <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
                  {software.description}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                  {totalInsights}
                </div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500">
                  practitioner insights
                </div>
              </div>
              {session && (
                isDiscussions ? (
                  <Link
                    href={`/software/${slug}/threads/new`}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
                  >
                    + Start discussion
                  </Link>
                ) : (
                  <Link
                    href={`/software/${slug}/submit?dimension=${activeDimension}`}
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                  >
                    Share insight
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="flex" aria-label="Sections">
            {DIMENSIONS.map((dim) => {
              const isActive = !isDiscussions && activeDimension === dim.value;
              const count = software.postCounts[dim.value] ?? 0;
              return (
                <Link
                  key={dim.value}
                  href={`/software/${slug}?dimension=${dim.value}`}
                  className={`relative border-b-2 px-5 py-4 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                      : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
                  }`}
                >
                  {dim.label}
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                      isActive
                        ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}
            {/* Discussions tab */}
            <Link
              href={`/software/${slug}?tab=discussions`}
              className={`relative border-b-2 px-5 py-4 text-sm font-medium transition-colors ${
                isDiscussions
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                  : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              Discussions
            </Link>
          </nav>
        </div>
      </div>

      {/* Subtitle bar */}
      <div className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800/50 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {isDiscussions
              ? "Open-ended conversations — ask questions, share context, get candid takes from peers"
              : activeDimInfo.description}
          </p>
          {!isDiscussions && trend !== "insufficient_data" && (
            <TrendBadge trend={trend} />
          )}
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {isDiscussions ? (
          threads.length === 0 ? (
            <EmptyDiscussions
              softwareName={software.name}
              newHref={session ? `/software/${slug}/threads/new` : null}
            />
          ) : (
            <div className="space-y-3">
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/software/${slug}/threads/${thread.id}`}
                  className="block rounded-lg border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {thread.title}
                    </h3>
                    <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                      {formatTimeAgo(thread.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {thread.content}
                  </p>
                  <div className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
                    {thread._count.replies}{" "}
                    {thread._count.replies === 1 ? "reply" : "replies"}
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          <>
            {/* Lens toggle */}
            {!isDiscussions && (
              <div className="mb-5">
                <Suspense fallback={null}>
                  <LensToggle basePath={`/software/${slug}`} />
                </Suspense>
              </div>
            )}

            {posts.length === 0 ? (
              <EmptyState
                dimensionLabel={activeDimInfo.label.toLowerCase()}
                softwareName={software.name}
                submitHref={
                  session
                    ? `/software/${slug}/submit?dimension=${activeDimension}`
                    : null
                }
              />
            ) : (
              <div className="space-y-4">
                {summary && <DimensionSummaryCard summary={summary} />}
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={session?.user?.id ?? null}
                    softwareSlug={slug}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState({
  dimensionLabel,
  softwareName,
  submitHref,
}: {
  dimensionLabel: string;
  softwareName: string;
  submitHref: string | null;
}) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mx-auto max-w-sm">
        <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">
          No insights yet
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Be the first practitioner to share real-world experience with{" "}
          {softwareName}&apos;s {dimensionLabel}.
        </p>
        {submitHref && (
          <Link
            href={submitHref}
            className="mt-6 inline-block rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Share the first insight
          </Link>
        )}
      </div>
    </div>
  );
}

function TrendBadge({ trend }: { trend: TrendDirection }) {
  const config = {
    improving: {
      label: "↑ Improving recently",
      className:
        "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
    },
    declining: {
      label: "↓ Declining recently",
      className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
    },
    stable: {
      label: "→ Holding steady",
      className:
        "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    },
    insufficient_data: null,
  }[trend];

  if (!config) return null;

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function EmptyDiscussions({
  softwareName,
  newHref,
}: {
  softwareName: string;
  newHref: string | null;
}) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mx-auto max-w-sm">
        <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">
          No discussions yet
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Start the first conversation about {softwareName}.
        </p>
        {newHref && (
          <Link
            href={newHref}
            className="mt-6 inline-block rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Start a discussion
          </Link>
        )}
      </div>
    </div>
  );
}
