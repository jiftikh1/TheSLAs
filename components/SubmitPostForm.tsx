"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { calculatePostScores, getSlopNudge } from "@/lib/scoring";
import { TOPICS, getTriggeredFollowUps, type Topic, type Question } from "@/lib/review-questions";
import {
  Monitor, Zap, Plug, Receipt, Headphones, Rocket, AlertTriangle, Shield,
  Mic, Star, ChevronLeft, ChevronRight, CheckCircle,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor, Zap, Plug, Receipt, Headphones, Rocket, AlertTriangle, Shield,
};

type Step = "topic" | "stars" | "questions" | "review";

type Props = {
  slug: string;
  softwareName: string;
};

function assembleContent(
  topic: Topic,
  answers: Record<string, string>,
  questionQueue: Question[]
): string {
  const lines: string[] = [];
  for (const q of questionQueue) {
    const ans = answers[q.id]?.trim();
    if (!ans) continue;
    lines.push(`**${q.text}**`);
    lines.push(ans);
    lines.push("");
  }
  return lines.join("\n").trim();
}

function trustLabel(score: number) {
  if (score >= 67) return { text: "High signal", cls: "text-green-400" };
  if (score >= 34) return { text: "Medium signal", cls: "text-yellow-400" };
  return { text: "Low signal", cls: "text-red-400" };
}

export function SubmitPostForm({ slug, softwareName }: Props) {
  const router = useRouter();

  const [step, setStep] = useState<Step>("topic");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [starRating, setStarRating] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number>(0);

  // Question queue: starts as coreQuestions, follow-ups inserted dynamically
  const [questionQueue, setQuestionQueue] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [insertedFollowUps, setInsertedFollowUps] = useState<Set<string>>(new Set());

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPricingWarning, setShowPricingWarning] = useState(false);

  const currentQuestion = questionQueue[currentQIndex] ?? null;
  const currentAnswer = currentQuestion ? (answers[currentQuestion.id] ?? "") : "";
  const currentTrimmed = currentAnswer.trim();

  // Assembled content for scoring/preview
  const assembledContent = useMemo(() => {
    if (!selectedTopic) return "";
    return assembleContent(selectedTopic, answers, questionQueue);
  }, [selectedTopic, answers, questionQueue]);

  const scores = useMemo(() => {
    if (assembledContent.length < 10) return null;
    return calculatePostScores(assembledContent);
  }, [assembledContent]);

  const nudge = useMemo(() => {
    if (!scores || assembledContent.length < 50) return null;
    return getSlopNudge(scores.slopRisk, scores.hasAnchors, assembledContent.length);
  }, [scores, assembledContent]);

  // --- Step 0: Topic picker ---
  if (step === "topic") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            What are you reviewing?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick the area you have the most direct experience with.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TOPICS.map((topic) => {
            const Icon = ICON_MAP[topic.icon] ?? Monitor;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => {
                  setSelectedTopic(topic);
                  setQuestionQueue([...topic.coreQuestions]);
                  setStep("stars");
                }}
                className="flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="font-display text-sm font-semibold text-foreground">
                  {topic.label}
                </span>
                <span className="text-xs text-muted-foreground leading-snug">
                  {topic.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- Step 1: Star rating ---
  if (step === "stars" && selectedTopic) {
    return (
      <div className="space-y-8">
        <div>
          <button
            type="button"
            onClick={() => setStep("topic")}
            className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <h2 className="font-display text-2xl font-bold text-foreground">
            How would you rate{" "}
            <span className="text-primary">{softwareName}</span> for{" "}
            <span className="italic">{selectedTopic.label.toLowerCase()}</span>?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your honest rating — not influenced by marketing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStarRating(n)}
              onMouseEnter={() => setHoveredStar(n)}
              onMouseLeave={() => setHoveredStar(0)}
              className="transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              <Star
                className={`h-10 w-10 transition-colors ${
                  n <= (hoveredStar || starRating)
                    ? "fill-accent text-accent"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
          {starRating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {["", "Poor", "Fair", "Average", "Good", "Excellent"][starRating]}
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={starRating === 0}
          onClick={() => {
            setCurrentQIndex(0);
            setStep("questions");
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // --- Step 2: Question interview ---
  if (step === "questions" && selectedTopic && currentQuestion) {
    const isRequired = currentQuestion.required;
    const canProceed = !isRequired || currentTrimmed.length >= 50;
    const isLast = currentQIndex === questionQueue.length - 1;
    const tooShort = isRequired && currentTrimmed.length > 0 && currentTrimmed.length < 50;

    function handleNext() {
      if (!canProceed) return;

      // Check follow-up triggers on the current answer
      const triggered = getTriggeredFollowUps(currentTrimmed, currentQuestion);
      const newQueue = [...questionQueue];
      let insertOffset = 0;

      for (const fu of triggered) {
        if (!insertedFollowUps.has(fu.id)) {
          newQueue.splice(currentQIndex + 1 + insertOffset, 0, fu);
          insertOffset++;
          setInsertedFollowUps((prev) => new Set(prev).add(fu.id));
        }
      }

      setQuestionQueue(newQueue);

      if (currentQIndex < newQueue.length - 1) {
        setCurrentQIndex((i) => i + 1);
      } else {
        setStep("review");
      }
    }

    function handleBack() {
      if (currentQIndex > 0) {
        setCurrentQIndex((i) => i - 1);
      } else {
        setStep("stars");
      }
    }

    const progressPct = Math.round(((currentQIndex + 1) / questionQueue.length) * 100);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Mic className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">{selectedTopic.label}</span>
            <span>·</span>
            <span>
              Question {currentQIndex + 1} of {questionQueue.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full bg-secondary">
            <div
              className="h-1.5 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div>
          <p className="font-display text-xl font-semibold text-foreground leading-snug">
            {currentQuestion.text}
          </p>
          {currentQIndex === 0 && (
            <p className="mt-1 text-sm text-muted-foreground italic">
              Let&apos;s talk about {selectedTopic.label.toLowerCase()}. Be specific — the more concrete, the more valuable your review.
            </p>
          )}
        </div>

        {/* Textarea */}
        <div>
          <textarea
            value={currentAnswer}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))
            }
            placeholder={currentQuestion.placeholder}
            rows={6}
            maxLength={1500}
            className="w-full resize-y rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground placeholder-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="mt-1.5 flex items-center justify-between">
            <span className={`text-xs ${tooShort ? "text-destructive" : "text-muted-foreground"}`}>
              {!isRequired
                ? "Optional — skip if not applicable"
                : currentTrimmed.length === 0
                ? "Minimum 50 characters"
                : tooShort
                ? `${50 - currentTrimmed.length} more characters needed`
                : `${currentTrimmed.length} / 1500`}
            </span>
            {scores && assembledContent.length >= 50 && (() => {
              const t = trustLabel(scores.trustScore);
              return <span className={`text-xs font-medium ${t.cls}`}>{t.text}</span>;
            })()}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isRequired && !canProceed}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLast ? "Preview review" : !isRequired && !currentTrimmed ? "Skip" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // --- Step 3: Review & submit ---
  if (step === "review" && selectedTopic) {
    async function doSubmit(force = false) {
      if (!selectedTopic) return;
      if (scores?.flaggedForPricing && !force) {
        setShowPricingWarning(true);
        return;
      }
      setSubmitting(true);
      setError(null);
      try {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            dimension: selectedTopic.dimension,
            content: assembledContent,
            starRating,
            topic: selectedTopic.id,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong");
          return;
        }
        router.push(`/software/${slug}?dimension=${selectedTopic.dimension}`);
        router.refresh();
      } catch {
        setError("Network error — please try again.");
      } finally {
        setSubmitting(false);
      }
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <button
            type="button"
            onClick={() => setStep("questions")}
            className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-primary" />
            <h2 className="font-display text-2xl font-bold text-foreground">
              Review your submission
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            This is how your review will appear — published anonymously.
          </p>
        </div>

        {/* Preview card */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          {/* Topic + stars */}
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-border px-3 py-0.5 text-xs font-medium text-muted-foreground">
              {selectedTopic.label}
            </span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`h-4 w-4 ${n <= starRating ? "fill-accent text-accent" : "text-muted-foreground"}`}
                />
              ))}
            </div>
          </div>

          {/* Assembled content preview */}
          <div className="max-h-80 overflow-y-auto rounded-lg bg-secondary/30 p-4 text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-mono">
            {assembledContent}
          </div>

          {/* Trust score */}
          {scores && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Signal quality:</span>
              <span className={`font-semibold ${trustLabel(scores.trustScore).cls}`}>
                {trustLabel(scores.trustScore).text}
              </span>
              <span>({Math.round(scores.trustScore)}/100)</span>
            </div>
          )}
        </div>

        {/* Slop nudge */}
        {nudge && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <p className="text-sm text-amber-300">{nudge}</p>
          </div>
        )}

        {/* Pricing warning */}
        {showPricingWarning && (
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
            <p className="text-sm font-medium text-orange-200">Pricing language detected</p>
            <p className="mt-1 text-sm text-orange-300/80">
              This post will be published but flagged for review.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setShowPricingWarning(false)}
                className="rounded-md border border-orange-500/30 px-3 py-1.5 text-xs font-medium text-orange-300 hover:bg-orange-500/10"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => doSubmit(true)}
                disabled={submitting}
                className="rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 disabled:opacity-50"
              >
                {submitting ? "Publishing..." : "Submit anyway"}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Footer */}
        {!showPricingWarning && (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Published anonymously — only role &amp; seniority visible.
            </p>
            <button
              type="button"
              disabled={submitting || assembledContent.length < 50}
              onClick={() => doSubmit(false)}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? "Publishing..." : "Submit review"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
