"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type Lens = "all" | "practitioner" | "leader" | "user";

const LENSES: { value: Lens; label: string; description: string }[] = [
  { value: "all", label: "All", description: "" },
  {
    value: "practitioner",
    label: "Practitioners",
    description: "Admins, engineers, RevOps — day-to-day operators",
  },
  {
    value: "leader",
    label: "Leaders",
    description: "Directors, VPs, CIOs — strategic decisions",
  },
  {
    value: "user",
    label: "Power users",
    description: "ICs who live in the tool daily",
  },
];

type Props = { basePath: string };

export function LensToggle({ basePath }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("lens") as Lens) ?? "all";

  const update = useCallback(
    (lens: Lens) => {
      const params = new URLSearchParams(searchParams.toString());
      if (lens === "all") params.delete("lens");
      else params.set("lens", lens);
      router.push(`${basePath}?${params.toString()}`);
    },
    [router, searchParams, basePath]
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-zinc-400 dark:text-zinc-500">View as:</span>
      {LENSES.map((lens) => (
        <button
          key={lens.value}
          onClick={() => update(lens.value)}
          title={lens.description}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            current === lens.value
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600"
          }`}
        >
          {lens.label}
        </button>
      ))}
    </div>
  );
}
