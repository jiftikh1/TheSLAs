export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { getUserPosts, getUserThreads } from "@/lib/software";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { Star, MessageSquare, Compass } from "lucide-react";
import prisma from "@/lib/prisma";

const DIMENSION_LABELS: Record<string, string> = {
  PARTNERSHIPS: "Partnerships",
  INTEGRATIONS: "Integrations",
  WORKFLOWS: "Workflows",
  ISSUES: "Issues",
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

function trustToStars(score: number): number {
  if (score >= 80) return 5;
  if (score >= 60) return 4;
  if (score >= 40) return 3;
  if (score >= 20) return 2;
  return 1;
}

export default async function MePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [posts, threads, user] = await Promise.all([
    getUserPosts(session.user.id),
    getUserThreads(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, seniority: true, industry: true, companySize: true, reputationTier: true },
    }),
  ]);

  const totalValidationsReceived = posts.reduce(
    (sum, p) => sum + p.validations.length,
    0
  );

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

          <div className="hidden items-center gap-1 rounded-lg bg-secondary p-1 md:flex">
            <Link href="/feed" className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground">
              <Star className="h-4 w-4" /> Reviews
            </Link>
            <Link href="/?tab=discussions" className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground">
              <MessageSquare className="h-4 w-4" /> Discussions
            </Link>
            <Link href="/software" className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground">
              <Compass className="h-4 w-4" /> Browse
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/profile/setup" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Edit profile
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Profile card */}
        <div
          className="mb-8 rounded-xl border border-border bg-card p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-bold text-foreground">
              {session.user?.name ?? "Your profile"}
            </h1>
            {session.user?.username && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                @{session.user.username}
              </span>
            )}
          </div>
          {user?.role && (
            <p className="mt-1 text-sm text-muted-foreground">
              {[user.seniority, user.role].filter(Boolean).join(" ")}
              {user.industry ? ` · ${user.industry}` : ""}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Your anonymous handle — shown instead of your name on all posts.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
            {[
              { value: posts.length, label: "insights shared" },
              { value: threads.length, label: "discussions started" },
              { value: totalValidationsReceived, label: "validations received" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-xl font-bold tabular-nums text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* My insights */}
        <section className="mb-8">
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            My insights ({posts.length})
          </h2>
          {posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                You haven&apos;t shared any insights yet.
              </p>
              <Link
                href="/software"
                className="mt-4 inline-block text-sm text-primary underline-offset-2 hover:underline"
              >
                Browse software to contribute
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => {
                const stars = trustToStars(post.trustScore);
                const totalVal = post.validations.length;
                return (
                  <Link
                    key={post.id}
                    href={`/software/${post.software.slug}/posts/${post.id}`}
                    className="block rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-semibold text-foreground">
                            {post.software.name}
                          </span>
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                            {DIMENSION_LABELS[post.dimension]}
                          </span>
                          {post.moderationStatus === "flagged" && (
                            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                              flagged
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                          {post.content}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map((i) => (
                            <Star key={i} className={`h-3 w-3 ${i <= stars ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatTimeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    {totalVal > 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {totalVal} validation{totalVal !== 1 ? "s" : ""} received
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* My threads */}
        <section>
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            My discussions ({threads.length})
          </h2>
          {threads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                You haven&apos;t started any discussions yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/software/${thread.software.slug}/threads/${thread.id}`}
                  className="block rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-display font-semibold text-foreground">
                        {thread.software.name}
                      </span>
                      <p className="mt-1 text-sm text-muted-foreground">{thread.title}</p>
                    </div>
                    <div className="shrink-0 text-right text-xs text-muted-foreground">
                      <p>{thread._count.replies} replies</p>
                      <p className="mt-0.5">{formatTimeAgo(thread.createdAt)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
