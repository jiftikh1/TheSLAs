/**
 * Trust scoring and slop detection utilities
 */

const PRICING_PATTERNS =
  /\$|\bpric(e|ing)\b|\bcost\b|\bper seat\b|\bper user\b|\blicense fee\b|\bcontract term\b|\bnegotiat/i;

const ANCHOR_PATTERNS =
  /\b(\d+\s*(month|year|week|day)s?|Q[1-4]\s*\d{2,4}|\d{4}|last\s+(month|year|quarter)|since\s+\d{4}|after\s+\d+\s*month|in\s+Q[1-4]|version\s+[\d.]+|v[\d.]+)\b/i;

const SLOP_BUZZWORDS =
  /\b(unleash|leverage|robust|scalable|game.?changer|transformative|revolutionary|cutting.?edge|best.?in.?class|paradigm|synergy|holistic|seamless|out.?of.?the.?box|next.?gen|future.?proof)\b/gi;

const VAGUE_SUPERLATIVES = /\b(great|awesome|amazing|terrible|worst|best|perfect|horrible)\b/gi;

export interface PostScores {
  trustScore: number;
  signalQuality: number;
  slopRisk: number;
  hasAnchors: boolean;
  flaggedForPricing: boolean;
}

export function calculatePostScores(content: string): PostScores {
  const charCount = content.trim().length;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const flaggedForPricing = PRICING_PATTERNS.test(content);
  const hasAnchors = ANCHOR_PATTERNS.test(content);

  // Slop risk factors
  let slopRisk = 0;
  if (charCount < 80) slopRisk += 50;
  else if (charCount < 150) slopRisk += 25;
  else if (charCount < 250) slopRisk += 10;

  const slopMatches = content.match(SLOP_BUZZWORDS);
  if (slopMatches) slopRisk += Math.min(40, slopMatches.length * 15);

  const vagueMatches = content.match(VAGUE_SUPERLATIVES);
  if (vagueMatches && vagueMatches.length > 2) slopRisk += 15;

  // No specifics at all
  if (!hasAnchors && wordCount < 30) slopRisk += 20;

  slopRisk = Math.min(100, slopRisk);

  // Signal quality factors
  let signalQuality = 0;
  if (charCount >= 100) signalQuality += 15;
  if (charCount >= 200) signalQuality += 20;
  if (charCount >= 400) signalQuality += 20;
  if (wordCount >= 40) signalQuality += 10;
  if (wordCount >= 80) signalQuality += 10;
  if (hasAnchors) signalQuality += 25;

  signalQuality = Math.min(100, signalQuality);

  // Trust score: penalize for slop, reward for quality
  const trustScore = Math.max(0, Math.round(signalQuality - slopRisk * 0.35));

  return {
    trustScore,
    signalQuality: Math.round(signalQuality),
    slopRisk: Math.round(slopRisk),
    hasAnchors,
    flaggedForPricing,
  };
}

export function getTrustLabel(score: number): {
  label: string;
  color: "green" | "yellow" | "red";
} {
  if (score >= 65) return { label: "High confidence", color: "green" };
  if (score >= 35) return { label: "Medium confidence", color: "yellow" };
  return { label: "Low confidence", color: "red" };
}

export function getSlopNudge(
  slopRisk: number,
  hasAnchors: boolean,
  charCount: number
): string | null {
  if (charCount < 80) {
    return "Too short to be useful. Practitioners want details — what specifically happened, when, and what was the impact?";
  }
  if (slopRisk >= 60) {
    return "This reads like a generic review. Add specifics: version numbers, timeframes, concrete examples from your real experience.";
  }
  if (!hasAnchors && slopRisk >= 35) {
    return "Adding a time reference (e.g., 'after 8 months', 'in Q3 2024', 'on version 12.4') would help other practitioners gauge relevance.";
  }
  return null;
}
