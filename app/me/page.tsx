import { auth } from "@/lib/auth";
import { getUserPosts, getUserThreads } from "@/lib/software";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
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

function getTrustLabel(score: number) {
  if (score >= 67) return { label: "High", cls: "text-green-600 dark:text-green-400" };
  if (score >= 34) return { label: "Medium", cls: "text-yellow-600 dark:text-yellow-400" };
  return { label: "Low", cls: "text-red-500 dark:text-red-400" };
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/feed"
              className="text-xl font-bold text-zinc-900 dark:text-zinc-50"
            >
              The SLAs
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Profile summary */}
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {session.user?.name ?? "Your profile"}
              </h1>
              {user?.role && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {[user.seniority, user.role].filter(Boolean).join(" ")}
                  {user.industry ? ` · ${user.industry}` : ""}
                </p>
              )}
            </div>
            <Link
              href="/profile/setup"
              className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              Edit profile
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <div>
              <div className="text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {posts.length}
              </div>
              <div className="text-xs text-zinc-400">insights shared</div>
            </div>
            <div>
              <div className="text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {threads.length}
              </div>
              <div className="text-xs text-zinc-400">discussions started</div>
            </div>
            <div>
              <div className="text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {totalValidationsReceived}
              </div>
              <div className="text-xs text-zinc-400">validations received</div>
            </div>
          </div>
        </div>

        {/* My insights */}
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            My insights ({posts.length})
          </h2>
          {posts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-700">
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                You haven&apos;t shared any insights yet.
              </p>
              <Link
                href="/software"
                className="mt-4 inline-block text-sm text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Browse software to contribute
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => {
                const trust = getTrustLabel(post.trustScore);
                const totalVal = post.validations.length;
                return (
                  <Link
                    key={post.id}
                    href={`/software/${post.software.slug}?dimension=${post.dimension}`}
                    className="block rounded-lg border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                            {post.software.name}
                          </span>
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                            {DIMENSION_LABELS[post.dimension]}
                          </span>
                          {post.moderationStatus === "flagged" && (
                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                              flagged
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                          {post.content}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`text-xs font-medium ${trust.cls}`}>
                          {trust.label}
                        </span>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          {formatTimeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    {totalVal > 0 && (
                      <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
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
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            My discussions ({threads.length})
          </h2>
          {threads.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-700">
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                You haven&apos;t started any discussions yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/software/${thread.software.slug}/threads/${thread.id}`}
                  className="block rounded-lg border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          {thread.software.name}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                        {thread.title}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-xs text-zinc-400">
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
