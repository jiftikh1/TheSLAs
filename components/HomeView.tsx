"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Shield, Eye, Users, ThumbsUp, ThumbsDown, Star, TrendingUp, MessageSquare, Plus, Search } from "lucide-react";
import { AppNavbar } from "@/components/AppNavbar";

// ── Types ────────────────────────────────────────────────────────────────────

type Post = {
  id: string;
  content: string;
  dimension: string;
  trustScore: number;
  createdAt: Date;
  software: { name: string; slug: string };
  author: { username: string | null; role: string | null; seniority: string | null };
  validationCount: number;
  commentCount: number;
};

type Thread = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  software: { name: string; slug: string };
  author: { role: string | null; seniority: string | null };
  replyCount: number;
};

type TrendingItem = {
  name: string;
  slug: string;
  category: string;
  avgRating: number | null;
  reviewCount: number;
};

type Props = {
  isLoggedIn: boolean;
  recentPosts: Post[];
  threads: Thread[];
  trending: TrendingItem[];
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function trustToStars(score: number): number {
  if (score >= 80) return 5;
  if (score >= 60) return 4;
  if (score >= 40) return 3;
  if (score >= 20) return 2;
  return 1;
}

type SeniorityLevel = "ic" | "lead" | "director";

function getSeniorityLevel(seniority: string | null): SeniorityLevel {
  if (!seniority) return "ic";
  const s = seniority.toLowerCase();
  if (s.includes("vp") || s.includes("director") || s.includes("chief") || s.includes("cto") || s.includes("ceo")) return "director";
  if (s.includes("lead") || s.includes("manager") || s.includes("head") || s.includes("staff")) return "lead";
  return "ic";
}

const seniorityConfig: Record<SeniorityLevel, { label: string; className: string }> = {
  ic: { label: "Hands-on IC", className: "bg-badge-ic/15 text-badge-ic border-badge-ic/30" },
  lead: { label: "Team Lead", className: "bg-badge-lead/15 text-badge-lead border-badge-lead/30" },
  director: { label: "Director+", className: "bg-badge-director/15 text-badge-director border-badge-director/30" },
};

const dimensionIcon: Record<string, "up" | "down"> = {
  PARTNERSHIPS: "up",
  INTEGRATIONS: "up",
  WORKFLOWS: "up",
  ISSUES: "down",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SeniorityBadge({ seniority }: { seniority: string | null }) {
  const level = getSeniorityLevel(seniority);
  const { label, className } = seniorityConfig[level];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= stars ? "fill-accent text-accent" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ post, index }: { post: Post; index: number }) {
  const stars = trustToStars(post.trustScore);
  const iconType = dimensionIcon[post.dimension] ?? "up";

  return (
    <Link
      href={`/software/${post.software.slug}`}
      className="group block rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            {post.software.name}
          </h3>
          <span className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</span>
        </div>
        <SeniorityBadge seniority={post.author.seniority} />
      </div>

      <div className="mb-4">
        <StarRating stars={stars} />
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex gap-2">
          {iconType === "up" ? (
            <ThumbsUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          ) : (
            <ThumbsDown className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          )}
          <p className="text-sm text-foreground/80 line-clamp-3">{post.content}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ThumbsUp className="h-3.5 w-3.5" />
            {post.validationCount}
          </span>
          {post.commentCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              {post.commentCount}
            </span>
          )}
        </div>
        {post.author.username && (
          <span className="text-xs text-muted-foreground/60">@{post.author.username}</span>
        )}
      </div>
    </Link>
  );
}

function DiscussionCard({ thread }: { thread: Thread }) {
  return (
    <Link
      href={`/software/${thread.software.slug}`}
      className="block rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/30"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-1">
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {thread.software.name}
              </span>
              <span className="text-xs text-muted-foreground">{timeAgo(thread.createdAt)}</span>
            </div>
            <h3 className="mb-1.5 font-display font-semibold text-foreground">{thread.title}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{thread.content}</p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              {thread.replyCount} {thread.replyCount === 1 ? "reply" : "replies"}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function TrendingSidebar({ items }: { items: TrendingItem[] }) {
  return (
    <div
      className="rounded-xl border border-border bg-card p-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="font-display font-bold text-foreground">Trending Software</h3>
      </div>
      <div className="space-y-0.5">
        {items.map((item, i) => (
          <Link
            key={item.name}
            href={`/software/${item.slug}`}
            className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-secondary/60"
          >
            <span className={`w-6 text-center font-display text-lg font-bold ${i < 3 ? "text-accent" : "text-muted-foreground"}`}>
              {i + 1}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <span className="font-display text-sm font-bold text-foreground">
                {item.reviewCount}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="truncate font-display text-sm font-semibold text-foreground">
                  {item.name}
                </span>
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{item.category}</span>
                {item.avgRating !== null && (
                  <>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <Star className="h-2.5 w-2.5 fill-accent text-accent" />
                    <span className="text-[10px] text-muted-foreground">{item.avgRating.toFixed(1)}</span>
                  </>
                )}
                <span className="text-[10px] text-muted-foreground">· {item.reviewCount} reviews</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const SENIORITY_FILTERS = [
  { value: "all", label: "All Roles" },
  { value: "ic", label: "Hands-on IC" },
  { value: "lead", label: "Team Lead" },
  { value: "director", label: "Director+" },
] as const;

export function HomeView({ isLoggedIn, recentPosts, threads, trending }: Props) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"reviews" | "discussions">(
    searchParams.get("tab") === "discussions" ? "discussions" : "reviews"
  );

  // Sync tab when URL param changes (e.g., after navigation from Browse)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "discussions") setActiveTab("discussions");
    else if (tab === null || tab === "reviews") setActiveTab("reviews");
  }, [searchParams]);
  const [seniorityFilter, setSeniorityFilter] = useState<"all" | "ic" | "lead" | "director">("all");
  const [search, setSearch] = useState("");

  const filteredPosts = recentPosts.filter((p) => {
    if (seniorityFilter !== "all" && getSeniorityLevel(p.author.seniority) !== seniorityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!p.software.name.toLowerCase().includes(q) && !p.content.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const filteredThreads = threads.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q) || t.software.name.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar isLoggedIn={isLoggedIn} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(164_100%_42%/0.06),transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
              <Shield className="h-3.5 w-3.5" />
              LinkedIn-verified. Always anonymous.
            </div>

            <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-foreground md:text-6xl">
              Honest software reviews
              <br />
              <span className="text-primary">without the politics</span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Real reviews from verified professionals. See how software
              performs from the hands-on builder to the executive buyer —
              completely anonymous.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href={isLoggedIn ? "/software" : "/login"}
                className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:opacity-90"
              >
                Write a Review
              </Link>
              <Link
                href="/software"
                className="rounded-lg border border-primary px-6 py-3 font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Browse Reviews
              </Link>
            </div>

            <div className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-8">
              {[
                { icon: Shield, label: "Verified via LinkedIn" },
                { icon: Eye, label: "Always Anonymous" },
                { icon: Users, label: "Role-Based Reviews" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search bar */}
      <div className="relative z-10 mx-auto -mt-6 max-w-2xl px-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search software, reviews, discussions..."
            className="w-full rounded-xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Tab content */}
          <div className="min-w-0 flex-1">
            {activeTab === "reviews" && (
              <section>
                <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Latest Reviews</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {search ? `Results for "${search}"` : "Honest takes from verified professionals"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Seniority filter */}
                    <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
                      {SENIORITY_FILTERS.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => setSeniorityFilter(f.value)}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                            seniorityFilter === f.value
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                    <Link
                      href={isLoggedIn ? "/software" : "/login"}
                      className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:opacity-90"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Write Review
                    </Link>
                  </div>
                </div>

                {filteredPosts.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card py-16 text-center">
                    <p className="text-muted-foreground">
                      {search ? `No reviews matching "${search}"` : "No reviews yet."}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    {filteredPosts.map((post, i) => (
                      <ReviewCard key={post.id} post={post} index={i} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "discussions" && (
              <section>
                <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Discussions</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {search ? `Results for "${search}"` : "Anonymous threads — like Blind, but for software"}
                    </p>
                  </div>
                  <Link
                    href={isLoggedIn ? "/software" : "/login"}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:opacity-90"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New Thread
                  </Link>
                </div>

                {filteredThreads.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card py-16 text-center">
                    <p className="text-muted-foreground">
                      {search ? `No discussions matching "${search}"` : "No discussions yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredThreads.map((thread) => (
                      <DiscussionCard key={thread.id} thread={thread} />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Trending sidebar — shown on all tabs */}
          {trending.length > 0 && (
            <aside className="w-full shrink-0 lg:w-80">
              <div className="lg:sticky lg:top-24">
                <TrendingSidebar items={trending} />
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
