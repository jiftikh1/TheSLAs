"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Layers, Building2, Star, TrendingUp, ArrowLeft, Search } from "lucide-react";
import { AppNavbar } from "@/components/AppNavbar";

type Software = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  reviewCount: number;
  starRating: number | null;
};

type Props = {
  software: Software[];
  isLoggedIn: boolean;
};

type View = "landing" | "categories" | "companies";

export function BrowseView({ software, isLoggedIn }: Props) {
  const [view, setView] = useState<View>("landing");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const map: Record<string, { tools: Software[] }> = {};
    for (const s of software) {
      if (!map[s.category]) map[s.category] = { tools: [] };
      map[s.category].tools.push(s);
    }
    return Object.entries(map).map(([name, { tools }]) => ({ name, tools })).sort((a, b) => a.name.localeCompare(b.name));
  }, [software]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.tools.some((t) => t.name.toLowerCase().includes(q))
    );
  }, [categories, search]);

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return software;
    const q = search.toLowerCase();
    return software.filter(
      (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [software, search]);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar isLoggedIn={isLoggedIn} />

      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Back button */}
        {view !== "landing" && (
          <button
            onClick={() => { setView("landing"); setSearch(""); }}
            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        {/* Landing */}
        {view === "landing" && (
          <>
            <div className="mb-10 text-center">
              <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                Browse Software
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Explore by category or company
              </p>
            </div>

            <div className="mx-auto mb-10 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories or companies..."
                  className="w-full rounded-xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
              <button
                onClick={() => setView("categories")}
                className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center transition-all hover:border-primary/50"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Layers className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Categories</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{categories.length} categories</p>
                </div>
              </button>

              <button
                onClick={() => setView("companies")}
                className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center transition-all hover:border-primary/50"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 transition-colors group-hover:bg-accent/20">
                  <Building2 className="h-7 w-7 text-accent" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Companies</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{software.length} software tools</p>
                </div>
              </button>
            </div>
          </>
        )}

        {/* Categories view */}
        {view === "categories" && (
          <>
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">Categories</h1>
            <p className="mb-6 text-sm text-muted-foreground">Browse software by what it does</p>
            <div className="mb-8 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCategories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/software?category=${encodeURIComponent(cat.name)}`}
                  className="group rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <h3 className="font-display font-semibold text-foreground transition-colors group-hover:text-primary">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {cat.tools.map((t) => t.name).join(", ")}
                  </p>
                </Link>
              ))}
            </div>
            {filteredCategories.length === 0 && (
              <p className="py-16 text-center text-muted-foreground">
                No categories matching &ldquo;{search}&rdquo;
              </p>
            )}
          </>
        )}

        {/* Companies view */}
        {view === "companies" && (
          <>
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">Companies</h1>
            <p className="mb-6 text-sm text-muted-foreground">All reviewed software tools</p>
            <div className="mb-8 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search companies..."
                  className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCompanies.map((comp) => (
                <Link
                  key={comp.id}
                  href={`/software/${comp.slug}`}
                  className="group rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <h3 className="font-display font-semibold text-foreground transition-colors group-hover:text-primary">
                    {comp.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">{comp.category}</p>
                  {comp.reviewCount > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        <span className="text-xs text-muted-foreground">
                          {comp.starRating?.toFixed(1) ?? "—"}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {comp.reviewCount} reviews
                      </span>
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                </Link>
              ))}
            </div>
            {filteredCompanies.length === 0 && (
              <p className="py-16 text-center text-muted-foreground">
                No companies matching &ldquo;{search}&rdquo;
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
