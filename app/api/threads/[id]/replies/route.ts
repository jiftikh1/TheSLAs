import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: threadId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { content } = body as Record<string, unknown>;

  if (typeof content !== "string" || content.trim().length < 10) {
    return NextResponse.json(
      { error: "Reply too short (minimum 10 characters)" },
      { status: 400 }
    );
  }
  if (content.trim().length > 2000) {
    return NextResponse.json(
      { error: "Reply too long (maximum 2000 characters)" },
      { status: 400 }
    );
  }

  const thread = await prisma.thread.findUnique({ where: { id: threadId } });
  if (!thread || thread.moderationStatus === "removed") {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const reply = await prisma.reply.create({
    data: {
      threadId,
      authorId: session.user.id,
      content: content.trim(),
    },
    include: {
      author: {
        select: { id: true, role: true, seniority: true, industry: true, companySize: true },
      },
    },
  });

  return NextResponse.json({ reply }, { status: 201 });
}
