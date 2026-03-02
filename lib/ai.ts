import Anthropic from "@anthropic-ai/sdk";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { Dimension } from "@prisma/client";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type DimensionSummary = {
  practitioners: string;
  leaders: string;
  watchOut: string;
  postCount: number;
};

const DIMENSION_CONTEXT: Record<Dimension, string> = {
  PARTNERSHIPS: "vendor relationships, responsiveness, roadmap trustworthiness, and account management",
  INTEGRATIONS: "integration depth, reliability, maintenance burden, and technical complexity",
  WORKFLOWS: "practical day-to-day use, workflow strengths, limitations at scale, and productivity impact",
  ISSUES: "known problems, late-discovery gotchas, failure modes, and things to watch out for",
};

async function generateSummaryRaw(
  softwareName: string,
  softwareId: string,
  dimension: Dimension
): Promise<DimensionSummary | null> {
  // Fetch the top high-trust published posts for this dimension
  const posts = await prisma.post.findMany({
    where: {
      softwareId,
      dimension,
      moderationStatus: "published",
      slopRisk: { lt: 60 },
    },
    orderBy: [{ trustScore: "desc" }, { createdAt: "desc" }],
    take: 15,
    select: {
      content: true,
      trustScore: true,
      hasAnchors: true,
      author: {
        select: { seniority: true, role: true, industry: true },
      },
    },
  });

  if (posts.length < 3) return null;

  const postsText = posts
    .map((p, i) => {
      const author = [p.author.seniority, p.author.role, p.author.industry]
        .filter(Boolean)
        .join(", ");
      return `[Post ${i + 1}] Author context: ${author || "anonymous"}\nContent: ${p.content}`;
    })
    .join("\n\n---\n\n");

  const systemPrompt = `You are a signal analyst for a practitioner intelligence platform called The SLAs. Your job is to synthesize real practitioner insights about software into clear, honest summaries.

Rules:
- Prefer specific, falsifiable claims over generic impressions
- Surface minority-but-correct perspectives, not just majority opinion
- Do NOT soften or sanitize — practitioners need the unvarnished truth
- Do NOT mention pricing or contract terms
- Write in direct, plain language — no marketing speak
- Each summary should be 2-4 sentences maximum
- Base everything strictly on what practitioners actually wrote`;

  const userPrompt = `Synthesize these ${posts.length} practitioner insights about ${softwareName}'s ${DIMENSION_CONTEXT[dimension]}.

Posts:
${postsText}

Produce three distinct summaries in JSON format:
{
  "practitioners": "What practitioners (admins, engineers, ops) most need to know — focused on operational reality",
  "leaders": "What leaders (directors, VPs) should factor into decisions — focused on risk, trajectory, and strategic fit",
  "watchOut": "The most important warning — the thing people only learn after months in, or the most common surprise"
}

Return only valid JSON, no other text.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  let parsed: { practitioners: string; leaders: string; watchOut: string };
  try {
    // Extract JSON even if there's surrounding text
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    parsed = JSON.parse(match[0]);
  } catch {
    return null;
  }

  return {
    practitioners: parsed.practitioners,
    leaders: parsed.leaders,
    watchOut: parsed.watchOut,
    postCount: posts.length,
  };
}

/**
 * Generate (and cache for 2 hours) a dimension summary.
 * Returns null if there aren't enough posts or if ANTHROPIC_API_KEY is not set.
 */
export function getDimensionSummary(
  softwareName: string,
  softwareId: string,
  dimension: Dimension
): Promise<DimensionSummary | null> {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your-anthropic-api-key") {
    return Promise.resolve(null);
  }

  const cached = unstable_cache(
    () => generateSummaryRaw(softwareName, softwareId, dimension),
    [`summary-${softwareId}-${dimension}`],
    { revalidate: 60 * 60 * 2 } // 2 hours
  );

  return cached();
}
