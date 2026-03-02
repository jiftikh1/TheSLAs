import { auth } from "@/lib/auth";
import { getRecentPosts, getAllSoftware, type Lens } from "@/lib/software";
import { FeedPostCard } from "@/components/FeedPostCard";
import { FeedFilterBar } from "@/components/FeedFilterBar";
import { LensToggle } from "@/components/LensToggle";
import { LogoutButton } from "@/components/LogoutButton";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Dimension } from "@prisma/client";
import { Suspense } from "react";

const VALID_DIMENSIONS = new Set<string>(Object.values(Dimension));

const VALID_LENSES = new Set<string>(["all", "practitioner", "leader", "user"]);

type Props = {
  searchParams: Promise<{
    dimension?: string;
    software?: string;
    sort?: string;
    lens?: string;
  }>;
};

export default async function FeedPage({ searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { dimension: dimParam, software: swParam, sort: sortParam, lens: lensParam } =
    await searchParams;

  const rawDim = dimParam?.toUpperCase() ?? "";
  const dimension = VALID_DIMENSIONS.has(rawDim)
    ? (rawDim as Dimension)
    : undefined;
  const softwareSlug = swParam || undefined;
  const sort: "latest" | "hot" = sortParam === "hot" ? "hot" : "latest";
  const lens: Lens =
    lensParam && VALID_LENSES.has(lensParam) ? (lensParam as Lens) : "all";

  const [posts, allSoftware, user] = await Promise.all([
    getRecentPosts({ dimension, softwareSlug, sort, lens, limit: 40 }),
    getAllSoftware(),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    }),
  ]);

  const profileIncomplete = !user?.role;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Nav */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/feed"
              className="text-xl font-bold text-zinc-900 dark:text-zinc-50"
            >
              The SLAs
            </Link>
            <Link
              href="/software"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Browse software
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/me"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              My activity
            </Link>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {session.user?.role
                ? `${session.user.seniority ?? ""} ${session.user.role}`.trim()
                : session.user?.name ?? "Practitioner"}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Profile completion banner */}
        {profileIncomplete && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/60 dark:bg-amber-950/40">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Complete your profile so your posts show practitioner context.
            </p>
            <Link
              href="/profile/setup"
              className="shrink-0 rounded-md bg-amber-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              Set up profile
            </Link>
          </div>
        )}

        {/* Filter + lens bar */}
        <Suspense fallback={<div className="mb-6 h-24" />}>
          <FeedFilterBar
            allSoftware={allSoftware.map((s) => ({
              name: s.name,
              slug: s.slug,
            }))}
          />
        </Suspense>
        <Suspense fallback={null}>
          <div className="mb-6">
            <LensToggle basePath="/feed" />
          </div>
        </Suspense>

        {posts.length === 0 ? (
          <EmptyFeed hasFilters={!!(dimension || softwareSlug || lens !== "all")} />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                currentUserId={session.user?.id ?? null}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyFeed({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mx-auto max-w-sm">
        <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">
          {hasFilters ? "No posts match these filters" : "No insights yet"}
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {hasFilters
            ? "Try removing some filters or switching dimensions."
            : "Be the first to share what you know. Browse the software catalog and add a real-world insight."}
        </p>
        <Link
          href={hasFilters ? "/feed" : "/software"}
          className="mt-6 inline-block rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {hasFilters ? "Clear filters" : "Browse software catalog"}
        </Link>
      </div>
    </div>
  );
}
