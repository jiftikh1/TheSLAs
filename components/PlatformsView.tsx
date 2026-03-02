"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

type Software = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  reviewCount: number;
  starRating: number | null;
};

type RecentPost = {
  id: string;
  content: string;
  dimension: string;
  trustScore: number;
  software: { name: string; slug: string };
  author: { role: string | null; seniority: string | null };
};

type Props = {
  software: Software[];
  recentPosts: RecentPost[];
  isLoggedIn: boolean;
};

function StarRating({
  rating,
  count,
}: {
  rating: number | null;
  count: number;
}) {
  if (count === 0 || rating === null) {
    return <span className="text-sm text-zinc-400">No reviews yet</span>;
  }
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            className={`h-4 w-4 ${
              i <= full
                ? "text-yellow-400"
                : i === full + 1 && hasHalf
                  ? "text-yellow-300"
                  : "text-zinc-200"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-medium text-zinc-700">
        {rating.toFixed(1)}
      </span>
      <span className="text-sm text-zinc-400">
        ({count} {count === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}

function SoftwareLogo({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string | null;
}) {
  if (logoUrl) {
    return (
      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-white p-1">
        <Image
          src={logoUrl}
          alt={name}
          width={48}
          height={48}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }
  return (
    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-zinc-500">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function RecentReviewCard({ post }: { post: RecentPost }) {
  const trustColor =
    post.trustScore >= 67
      ? "bg-green-50 text-green-700"
      : post.trustScore >= 34
        ? "bg-yellow-50 text-yellow-700"
        : "bg-red-50 text-red-700";

  const dimensionLabel: Record<string, string> = {
    PARTNERSHIPS: "Partnerships",
    INTEGRATIONS: "Integrations",
    WORKFLOWS: "Workflows",
    ISSUES: "Issues",
  };

  return (
    <Link
      href={`/software/${post.software.slug}`}
      className="block rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold text-zinc-900">
          {post.software.name}
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${trustColor}`}
        >
          {dimensionLabel[post.dimension] ?? post.dimension}
        </span>
      </div>
      <p className="line-clamp-2 text-sm text-zinc-600">{post.content}</p>
      {(post.author.seniority || post.author.role) && (
        <p className="mt-2 text-xs text-zinc-400">
          {[post.author.seniority, post.author.role].filter(Boolean).join(" · ")}
        </p>
      )}
    </Link>
  );
}

export function PlatformsView({ software, recentPosts, isLoggedIn }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [sort, setSort] = useState("highest");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(software.map((s) => s.category))).sort();
    return ["All Categories", ...cats];
  }, [software]);

  const filtered = useMemo(() => {
    let list = software;

    if (activeCategory !== "All Categories") {
      list = list.filter((s) => s.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q),
      );
    }

    if (sort === "highest") {
      list = [...list].sort((a, b) => (b.starRating ?? 0) - (a.starRating ?? 0));
    } else if (sort === "most_reviewed") {
      list = [...list].sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (sort === "az") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [software, activeCategory, search, sort]);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-zinc-950 via-red-950 to-red-900 px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Discover Service Level Agreements
          <br className="hidden sm:block" /> Through Real Reviews
        </h1>
        <p className="mt-4 text-lg text-zinc-300">
          Make informed decisions with verified reviews from LinkedIn professionals
        </p>
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search platforms, tools, or services..."
              className="w-full rounded-full border-0 bg-white py-3.5 pl-12 pr-6 text-sm text-zinc-900 shadow-lg placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </section>

      {/* Category filter bar */}
      <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-red-600 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <svg
              className="h-4 w-4 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 4a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm4 4a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z"
              />
            </svg>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border-0 bg-transparent text-sm font-medium text-zinc-700 focus:outline-none"
            >
              <option value="highest">Highest Rated</option>
              <option value="most_reviewed">Most Reviewed</option>
              <option value="az">A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* Featured Platforms */}
          <section>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-xl font-bold text-zinc-900">
                Featured Platforms
              </h2>
              <span className="text-sm text-zinc-500">
                {filtered.length} platform{filtered.length !== 1 ? "s" : ""} found
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 py-16 text-center">
                <p className="text-zinc-500">No platforms match your search.</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("All Categories");
                  }}
                  className="mt-4 text-sm text-red-600 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((s) => (
                  <Link
                    key={s.id}
                    href={`/software/${s.slug}`}
                    className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md"
                  >
                    <SoftwareLogo name={s.name} logoUrl={s.logoUrl} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-zinc-900">{s.name}</h3>
                      <p className="text-sm font-medium text-red-600">
                        {s.category}
                      </p>
                      <div className="my-1">
                        <StarRating rating={s.starRating} count={s.reviewCount} />
                      </div>
                      {s.description && (
                        <p className="line-clamp-2 text-sm text-zinc-500">
                          {s.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Recent Verified Reviews */}
          <aside>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-xl font-bold text-zinc-900">
                Recent Verified Reviews
              </h2>
            </div>

            {recentPosts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 py-12 text-center">
                <p className="text-sm text-zinc-500">No verified reviews yet.</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Be the first to write a verified review!
                </p>
                <Link
                  href={isLoggedIn ? "/software" : "/login"}
                  className="mt-4 inline-block rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Write a Review
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPosts.slice(0, 8).map((post) => (
                  <RecentReviewCard key={post.id} post={post} />
                ))}
                <Link
                  href="/feed"
                  className="block pt-2 text-center text-sm text-red-600 hover:underline"
                >
                  View all reviews →
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
