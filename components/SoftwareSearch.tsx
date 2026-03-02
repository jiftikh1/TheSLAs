"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Software = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
};

export function SoftwareSearch({ allSoftware }: { allSoftware: Software[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allSoftware;
    return allSoftware.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
  }, [query, allSoftware]);

  const byCategory = useMemo(() => {
    const groups: Record<string, Software[]> = {};
    for (const s of filtered) {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    }
    return groups;
  }, [filtered]);

  const categories = Object.keys(byCategory).sort();

  return (
    <div>
      {/* Search input */}
      <div className="mb-8">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, category, or description..."
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
        {query && (
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {/* Results */}
      {categories.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
          No software matches &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {category}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {byCategory[category].map((software) => (
                  <Link
                    key={software.id}
                    href={`/software/${software.slug}`}
                    className="group rounded-lg border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                  >
                    <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-50 dark:group-hover:text-blue-400">
                      {software.name}
                    </h3>
                    {software.description && (
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {software.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-2">
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {category}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
