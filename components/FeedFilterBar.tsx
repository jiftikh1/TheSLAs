"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Software = { name: string; slug: string };

const DIMENSIONS = [
  { value: "", label: "All" },
  { value: "PARTNERSHIPS", label: "Partnerships" },
  { value: "INTEGRATIONS", label: "Integrations" },
  { value: "WORKFLOWS", label: "Workflows" },
  { value: "ISSUES", label: "Issues" },
];

export function FeedFilterBar({ allSoftware }: { allSoftware: Software[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dimension = searchParams.get("dimension") ?? "";
  const software = searchParams.get("software") ?? "";
  const sort = searchParams.get("sort") ?? "latest";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`/feed?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="mb-6 space-y-3">
      {/* Dimension pills */}
      <div className="flex flex-wrap gap-2">
        {DIMENSIONS.map((d) => (
          <button
            key={d.value}
            onClick={() => update("dimension", d.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              dimension === d.value
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Sort + software row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Sort toggle */}
        <div className="flex overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
          {(["latest", "hot"] as const).map((s) => (
            <button
              key={s}
              onClick={() => update("sort", s === "latest" ? "" : s)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                sort === s
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-white text-zinc-500 hover:text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {s === "latest" ? "Latest" : "Most validated"}
            </button>
          ))}
        </div>

        {/* Software filter */}
        <select
          value={software}
          onChange={(e) => update("software", e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <option value="">All software</option>
          {allSoftware.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Active filter summary */}
        {(dimension || software || sort === "hot") && (
          <button
            onClick={() => router.push("/feed")}
            className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            Clear filters ×
          </button>
        )}
      </div>
    </div>
  );
}
