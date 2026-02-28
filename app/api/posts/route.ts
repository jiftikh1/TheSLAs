import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculatePostScores } from "@/lib/scoring";
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

  const { slug, dimension, content } = body as Record<string, unknown>;

  if (typeof slug !== "string" || !slug) {
    return NextResponse.json({ error: "Missing software slug" }, { status: 400 });
  }
  if (typeof dimension !== "string" || !VALID_DIMENSIONS.has(dimension)) {
    return NextResponse.json({ error: "Invalid dimension" }, { status: 400 });
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
