import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

  const { content } = body as Record<string, unknown>;

  if (typeof content !== "string" || content.trim().length < 10) {
    return NextResponse.json(
      { error: "Comment too short (minimum 10 characters)" },
      { status: 400 }
    );
  }
  if (content.trim().length > 2000) {
    return NextResponse.json(
      { error: "Comment too long (maximum 2000 characters)" },
      { status: 400 }
    );
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.moderationStatus === "removed") {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = await prisma.postComment.create({
    data: {
      postId,
      authorId: session.user.id,
      content: content.trim(),
    },
    include: {
      author: {
        select: { id: true, role: true, seniority: true, industry: true, companySize: true },
      },
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
