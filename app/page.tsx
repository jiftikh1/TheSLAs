export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { getAllSoftwareWithStats, getRecentPosts } from "@/lib/software";
import { getRecentThreads } from "@/lib/threads";
import { HomeView } from "@/components/HomeView";

export default async function Home() {
  const [session, software, recentPostsRaw, recentThreads] = await Promise.all([
    auth(),
    getAllSoftwareWithStats(),
    getRecentPosts({ limit: 12 }),
    getRecentThreads(10),
  ]);

  const user = session?.user;

  const recentPosts = recentPostsRaw.map((p) => ({
    id: p.id,
    content: p.content,
    dimension: p.dimension as string,
    trustScore: p.trustScore,
    createdAt: p.createdAt,
    software: p.software,
    author: {
      username: p.author.username,
      role: p.author.role,
      seniority: p.author.seniority,
    },
    validationCount: p.validations.length,
    commentCount: p._count.comments,
  }));

  const threads = recentThreads.map((t) => ({
    id: t.id,
    title: t.title,
    content: t.content,
    createdAt: t.createdAt,
    software: t.software,
    author: { role: t.author.role, seniority: t.author.seniority },
    replyCount: t._count.replies,
  }));

  // Trending: top 6 software by review count
  const trending = [...software]
    .filter((s) => s.reviewCount > 0)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 6)
    .map((s) => ({
      name: s.name,
      slug: s.slug,
      category: s.category,
      avgRating: s.starRating,
      reviewCount: s.reviewCount,
    }));

  return (
    <HomeView
      isLoggedIn={!!user}
      recentPosts={recentPosts}
      threads={threads}
      trending={trending}
    />
  );
}
