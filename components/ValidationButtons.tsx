"use client";

import { useState } from "react";

type ValidationType = "HELPFUL" | "MATCHES_EXPERIENCE" | "LEARNED_SOMETHING";

type ValidationCounts = {
  HELPFUL: number;
  MATCHES_EXPERIENCE: number;
  LEARNED_SOMETHING: number;
};

type Props = {
  postId: string;
  initialCounts: ValidationCounts;
  /** Types the current user has already validated. Null = not logged in. */
  userValidations: ValidationType[] | null;
};

const BUTTONS: { type: ValidationType; label: string }[] = [
  { type: "HELPFUL", label: "Helpful" },
  { type: "MATCHES_EXPERIENCE", label: "Matches my experience" },
  { type: "LEARNED_SOMETHING", label: "Learned something" },
];

export function ValidationButtons({
  postId,
  initialCounts,
  userValidations,
}: Props) {
  const [counts, setCounts] = useState<ValidationCounts>(initialCounts);
  const [active, setActive] = useState<Set<ValidationType>>(
    new Set(userValidations ?? [])
  );
  const [pending, setPending] = useState<ValidationType | null>(null);

  const total =
    counts.HELPFUL + counts.MATCHES_EXPERIENCE + counts.LEARNED_SOMETHING;

  async function toggle(type: ValidationType) {
    if (userValidations === null || pending) return; // not logged in, or in flight
    setPending(type);
    try {
      const res = await fetch(`/api/posts/${postId}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { action: "added" | "removed" };
      setActive((prev) => {
        const next = new Set(prev);
        if (data.action === "added") next.add(type);
        else next.delete(type);
        return next;
      });
      setCounts((prev) => ({
        ...prev,
        [type]: data.action === "added" ? prev[type] + 1 : Math.max(0, prev[type] - 1),
      }));
    } finally {
      setPending(null);
    }
  }

  if (userValidations === null && total === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
      {BUTTONS.map(({ type, label }) => {
        const count = counts[type];
        const isActive = active.has(type);
        const isFetching = pending === type;

        if (userValidations === null) {
          // Read-only: just show counts
          if (count === 0) return null;
          return (
            <span
              key={type}
              className="text-xs text-zinc-400 dark:text-zinc-500"
            >
              {count} {label.toLowerCase()}
            </span>
          );
        }

        return (
          <button
            key={type}
            onClick={() => toggle(type)}
            disabled={isFetching}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
              isActive
                ? "border-zinc-800 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 bg-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            {count > 0 && (
              <span className={isActive ? "opacity-70" : "opacity-60"}>
                {count}
              </span>
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}
