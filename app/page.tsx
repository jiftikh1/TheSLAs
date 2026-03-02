import { auth } from "@/lib/auth";
import { getAllSoftwareWithStats, getRecentPosts } from "@/lib/software";
import { PlatformsView } from "@/components/PlatformsView";
import Link from "next/link";

export default async function Home() {
  const [session, software, recentPostsRaw] = await Promise.all([
    auth(),
    getAllSoftwareWithStats(),
    getRecentPosts({ limit: 8 }),
  ]);

  const user = session?.user;

  const recentPosts = recentPostsRaw.map((p) => ({
    id: p.id,
    content: p.content,
    dimension: p.dimension as string,
    trustScore: p.trustScore,
    software: p.software,
    author: p.author,
  }));

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Navbar */}
      <header className="border-b border-zinc-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <svg
              className="h-7 w-7 text-red-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-lg font-bold text-zinc-900">The SLAs</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={user ? "/software" : "/login"}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Write a Review
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                {user.role && (
                  <span className="hidden text-sm text-zinc-500 sm:block">
                    {[user.seniority, user.role].filter(Boolean).join(" ")}
                  </span>
                )}
                <Link
                  href="/me"
                  className="text-sm text-zinc-500 hover:text-zinc-900"
                >
                  My activity
                </Link>
                <Link
                  href="/feed"
                  className="text-sm text-zinc-500 hover:text-zinc-900"
                >
                  Feed
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <PlatformsView
        software={software}
        recentPosts={recentPosts}
        isLoggedIn={!!user}
      />
    </div>
  );
}
