import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculatePostScores } from "@/lib/scoring";
import { TOPIC_TO_DIMENSION } from "@/lib/review-questions";
import { Dimension } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const VALID_DIMENSIONS = new Set<string>(Object.values(Dimension));

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { slug, dimension: rawDimension, content, starRating, topic } = body as Record<string, unknown>;

  if (typeof slug !== "string" || !slug) {
    return NextResponse.json({ error: "Missing software slug" }, { status: 400 });
  }

  // Resolve dimension: prefer explicit dimension, fall back to topic mapping
  let dimension: string | undefined;
  if (typeof rawDimension === "string" && VALID_DIMENSIONS.has(rawDimension)) {
    dimension = rawDimension;
  } else if (typeof topic === "string" && TOPIC_TO_DIMENSION[topic]) {
    dimension = TOPIC_TO_DIMENSION[topic];
  }

  if (!dimension) {
    return NextResponse.json({ error: "Invalid or missing dimension/topic" }, { status: 400 });
  }

  if (typeof content !== "string") {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  const trimmed = content.trim();
  if (trimmed.length < 50) {
    return NextResponse.json(
      { error: "Content too short (minimum 50 characters)" },
      { status: 400 }
    );
  }
  if (trimmed.length > 5000) {
    return NextResponse.json(
      { error: "Content too long (maximum 5000 characters)" },
      { status: 400 }
    );
  }

  // Validate starRating if provided
  let validatedStarRating: number | undefined;
  if (starRating !== undefined) {
    if (
      typeof starRating !== "number" ||
      !Number.isInteger(starRating) ||
      starRating < 1 ||
      starRating > 5
    ) {
      return NextResponse.json(
        { error: "starRating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }
    validatedStarRating = starRating;
  }

  const software = await prisma.software.findUnique({ where: { slug } });
  if (!software) {
    return NextResponse.json({ error: "Software not found" }, { status: 404 });
  }

  const scores = calculatePostScores(trimmed);
  const moderationStatus = scores.flaggedForPricing ? "flagged" : "published";

  const post = await prisma.post.create({
    data: {
      softwareId: software.id,
      authorId: session.user.id,
      dimension: dimension as Dimension,
      content: trimmed,
      starRating: validatedStarRating,
      topic: typeof topic === "string" ? topic : undefined,
      trustScore: scores.trustScore,
      signalQuality: scores.signalQuality,
      slopRisk: scores.slopRisk,
      hasAnchors: scores.hasAnchors,
      flaggedForPricing: scores.flaggedForPricing,
      moderationStatus,
    },
  });

  return NextResponse.json({ post, scores }, { status: 201 });
}
