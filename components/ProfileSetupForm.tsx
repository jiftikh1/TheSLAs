"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SENIORITY_OPTIONS = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead / Staff" },
  { value: "director", label: "Director" },
  { value: "vp", label: "VP" },
  { value: "c-level", label: "C-Level" },
];

const COMPANY_SIZE_OPTIONS = [
  { value: "small", label: "Small (< 100 employees)" },
  { value: "medium", label: "Mid-size (100–1,000)" },
  { value: "large", label: "Large (1,000–10,000)" },
  { value: "enterprise", label: "Enterprise (10,000+)" },
];

type Props = {
  nextPath: string;
  initialRole?: string;
  initialSeniority?: string;
  initialIndustry?: string;
  initialCompanySize?: string;
};

export function ProfileSetupForm({
  nextPath,
  initialRole = "",
  initialSeniority = "",
  initialIndustry = "",
  initialCompanySize = "",
}: Props) {
  const router = useRouter();
  const [role, setRole] = useState(initialRole);
  const [seniority, setSeniority] = useState(initialSeniority);
  const [industry, setIndustry] = useState(initialIndustry);
  const [companySize, setCompanySize] = useState(initialCompanySize);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isComplete =
    role.trim().length >= 2 &&
    seniority !== "" &&
    industry.trim().length >= 2 &&
    companySize !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isComplete || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, seniority, industry, companySize }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Role */}
      <div>
        <label
          htmlFor="role"
          className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Your role / job title
        </label>
        <input
          id="role"
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Systems Engineer, RevOps Manager, IT Director"
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
      </div>

      {/* Seniority */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Seniority level
        </label>
        <div className="flex flex-wrap gap-2">
          {SENIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSeniority(opt.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                seniority === opt.value
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Industry */}
      <div>
        <label
          htmlFor="industry"
          className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Industry
        </label>
        <input
          id="industry"
          type="text"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="e.g. Financial Services, Healthcare, SaaS, Retail"
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
      </div>

      {/* Company size */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Company size
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {COMPANY_SIZE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCompanySize(opt.value)}
              className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                companySize === opt.value
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <button
          type="submit"
          disabled={!isComplete || submitting}
          className="w-full rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {submitting ? "Saving..." : "Save profile and continue"}
        </button>
      </div>
    </form>
  );
}
