import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ValidationType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const VALID_TYPES = new Set<string>(Object.values(ValidationType));

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type } = body as Record<string, unknown>;
  if (typeof type !== "string" || !VALID_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid validation type" }, { status: 400 });
  }

  // Verify post exists and is published
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.moderationStatus === "removed") {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Upsert: if already validated with this type, remove it (toggle off)
  const existing = await prisma.validation.findUnique({
    where: {
      postId_userId_type: {
        postId,
        userId: session.user.id,
        type: type as ValidationType,
      },
    },
  });

  if (existing) {
    await prisma.validation.delete({ where: { id: existing.id } });
    return NextResponse.json({ action: "removed", type });
  }

  await prisma.validation.create({
    data: { postId, userId: session.user.id, type: type as ValidationType },
  });

  return NextResponse.json({ action: "added", type }, { status: 201 });
}
