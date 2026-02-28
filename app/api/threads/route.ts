import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

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

  const { slug, title, content } = body as Record<string, unknown>;

  if (typeof slug !== "string" || !slug) {
    return NextResponse.json({ error: "Missing software slug" }, { status: 400 });
  }
  if (typeof title !== "string" || title.trim().length < 5) {
    return NextResponse.json(
      { error: "Title too short (minimum 5 characters)" },
      { status: 400 }
    );
  }
  if (title.trim().length > 200) {
    return NextResponse.json(
      { error: "Title too long (maximum 200 characters)" },
      { status: 400 }
    );
  }
  if (typeof content !== "string" || content.trim().length < 20) {
    return NextResponse.json(
      { error: "Content too short (minimum 20 characters)" },
      { status: 400 }
    );
  }
  if (content.trim().length > 5000) {
    return NextResponse.json(
      { error: "Content too long (maximum 5000 characters)" },
      { status: 400 }
    );
  }

  const software = await prisma.software.findUnique({ where: { slug } });
  if (!software) {
    return NextResponse.json({ error: "Software not found" }, { status: 404 });
  }

  const thread = await prisma.thread.create({
    data: {
      softwareId: software.id,
      authorId: session.user.id,
      title: title.trim(),
      content: content.trim(),
    },
  });

  revalidatePath(`/software/${slug}`);
  return NextResponse.json({ thread }, { status: 201 });
}
