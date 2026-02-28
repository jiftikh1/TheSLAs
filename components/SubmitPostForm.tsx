"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { calculatePostScores, getSlopNudge } from "@/lib/scoring";

type Dimension = "PARTNERSHIPS" | "INTEGRATIONS" | "WORKFLOWS" | "ISSUES";

const DIMENSIONS: {
  value: Dimension;
  label: string;
  placeholder: string;
}[] = [
  {
    value: "PARTNERSHIPS",
    label: "Partnerships",
    placeholder:
      "Describe your experience with the vendor relationship — their responsiveness, roadmap follow-through, escalation paths...",
  },
  {
    value: "INTEGRATIONS",
    label: "Integrations",
    placeholder:
      "What integrations did you build or maintain? What was reliable? What broke? What took far more effort than advertised?",
  },
  {
    value: "WORKFLOWS",
    label: "Workflows",
    placeholder:
      "What does this tool genuinely excel at? Where does it become painful at scale? What workflows hit a wall?",
  },
  {
    value: "ISSUES",
    label: "Issues",
    placeholder:
      "What are the landmines? The things you only discover months in? What do you wish someone had warned you about before go-live?",
  },
];

type Props = {
  slug: string;
  softwareName: string;
  initialDimension: Dimension;
};

export function SubmitPostForm({ slug, softwareName, initialDimension }: Props) {
  const router = useRouter();
  const [dimension, setDimension] = useState<Dimension>(initialDimension);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPricingWarning, setShowPricingWarning] = useState(false);

  const charCount = content.trim().length;
  const tooShort = charCount > 0 && charCount < 50;

  const scores = useMemo(() => {
    if (charCount < 10) return null;
    return calculatePostScores(content);
  }, [content, charCount]);

  const nudge = useMemo(() => {
    if (!scores || charCount < 50) return null;
    return getSlopNudge(scores.slopRisk, scores.hasAnchors, charCount);
  }, [scores, charCount]);

  const activePlaceholder =
    DIMENSIONS.find((d) => d.value === dimension)?.placeholder ?? "";

  function trustLabel(score: number) {
    if (score >= 67) return { text: "High confidence", cls: "text-green-600 dark:text-green-400" };
    if (score >= 34) return { text: "Medium confidence", cls: "text-yellow-600 dark:text-yellow-400" };
    return { text: "Low confidence", cls: "text-red-500 dark:text-red-400" };
  }

  async function submitPost() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, dimension, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push(`/software/${slug}?dimension=${dimension}`);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (charCount < 50 || submitting) return;

    if (scores?.flaggedForPricing && !showPricingWarning) {
      setShowPricingWarning(true);
      return;
    }

    await submitPost();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dimension selector */}
      <div>
        <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Which dimension does this cover?
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DIMENSIONS.map((dim) => (
            <button
              key={dim.value}
              type="button"
              onClick={() => {
                setDimension(dim.value);
                setShowPricingWarning(false);
              }}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                dimension === dim.value
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              {dim.label}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div>
        <label
          htmlFor="content"
          className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Your insight about {softwareName}
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setShowPricingWarning(false);
          }}
          placeholder={activePlaceholder}
          rows={9}
          maxLength={5000}
          className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-500"
        />
        <div className="mt-1.5 flex items-center justify-between">
          <span
            className={`text-xs ${tooShort ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"}`}
          >
            {charCount === 0
              ? "Minimum 50 characters"
              : tooShort
                ? `${50 - charCount} more characters needed`
                : `${charCount} / 5000`}
          </span>
          {scores && charCount >= 50 && (() => {
            const t = trustLabel(scores.trustScore);
            return (
              <span className={`text-xs font-medium ${t.cls}`}>{t.text}</span>
            );
          })()}
        </div>
      </div>

      {/* Slop nudge */}
      {nudge && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/60 dark:bg-amber-950/40">
          <p className="text-sm text-amber-800 dark:text-amber-300">{nudge}</p>
        </div>
      )}

      {/* Pricing warning */}
      {showPricingWarning && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800/60 dark:bg-orange-950/40">
          <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
            Pricing language detected
          </p>
          <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
            The SLAs focuses on operational insights, not pricing or contract
            terms. This post will be published but flagged for review. Consider
            removing pricing specifics to keep it focused on real-world
            experience.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setShowPricingWarning(false)}
              className="rounded-md border border-orange-300 bg-white px-3 py-1.5 text-xs font-medium text-orange-800 hover:bg-orange-50 dark:border-orange-700 dark:bg-transparent dark:text-orange-300"
            >
              Edit content
            </button>
            <button
              type="button"
              onClick={submitPost}
              disabled={submitting}
              className="rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Submit anyway"}
            </button>
          </div>
        </div>
      )}

      {/* General error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/60 dark:bg-red-950/40">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Footer: anon note + submit */}
      {!showPricingWarning && (
        <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Published anonymously — only your role and seniority are visible.
          </p>
          <button
            type="submit"
            disabled={charCount < 50 || submitting}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {submitting ? "Publishing..." : "Publish insight"}
          </button>
        </div>
      )}
    </form>
  );
}
