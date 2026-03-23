export const dynamic = "force-dynamic";

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
import { Star, MessageSquare, Compass, Plus } from "lucide-react";

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
  const dimension = VALID_DIMENSIONS.has(rawDim) ? (rawDim as Dimension) : undefined;
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
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-display text-sm font-bold text-primary-foreground">SR</span>
            </div>
            <span className="font-display text-lg font-bold text-foreground">The SLAs</span>
          </Link>

          {/* Center tabs */}
          <div className="hidden items-center gap-1 rounded-lg bg-secondary p-1 md:flex">
            <Link
              href="/feed"
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <Star className="h-4 w-4" />
              Reviews
            </Link>
            <Link
              href="/?tab=discussions"
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground"
            >
              <MessageSquare className="h-4 w-4" />
              Discussions
            </Link>
            <Link
              href="/software"
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground"
            >
              <Compass className="h-4 w-4" />
              Browse
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {session.user?.role && (
              <span className="hidden text-xs text-muted-foreground sm:block">
                {[session.user.seniority, session.user.role].filter(Boolean).join(" · ")}
              </span>
            )}
            <Link
              href="/me"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              My activity
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Profile completion banner */}
        {profileIncomplete && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
            <p className="text-sm text-foreground">
              Complete your profile so your posts show practitioner context.
            </p>
            <Link
              href="/profile/setup"
              className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:opacity-90"
            >
              Set up profile
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Latest Reviews</h1>
            <p className="mt-1 text-sm text-muted-foreground">Honest takes from verified professionals</p>
          </div>
          <Link
            href="/software"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            Write Review
          </Link>
        </div>

        {/* Filter + lens bar */}
        <Suspense fallback={<div className="mb-6 h-24" />}>
          <FeedFilterBar
            allSoftware={allSoftware.map((s) => ({ name: s.name, slug: s.slug }))}
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
          <div className="grid gap-5 md:grid-cols-2">
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
    <div className="rounded-xl border border-border bg-card p-16 text-center">
      <div className="mx-auto max-w-sm">
        <p className="font-display text-base font-medium text-foreground">
          {hasFilters ? "No posts match these filters" : "No insights yet"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {hasFilters
            ? "Try removing some filters or switching dimensions."
            : "Be the first to share what you know."}
        </p>
        <Link
          href={hasFilters ? "/feed" : "/software"}
          className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          {hasFilters ? "Clear filters" : "Browse software catalog"}
        </Link>
      </div>
    </div>
  );
}
