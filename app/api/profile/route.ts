import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const VALID_SENIORITY = new Set([
  "junior",
  "mid",
  "senior",
  "lead",
  "director",
  "vp",
  "c-level",
]);

const VALID_COMPANY_SIZE = new Set(["small", "medium", "large", "enterprise"]);

export async function PATCH(req: NextRequest) {
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

  const { role, seniority, industry, companySize } = body as Record<
    string,
    unknown
  >;

  if (typeof role !== "string" || role.trim().length < 2) {
    return NextResponse.json(
      { error: "Role is required (min 2 characters)" },
      { status: 400 }
    );
  }
  if (typeof seniority !== "string" || !VALID_SENIORITY.has(seniority)) {
    return NextResponse.json({ error: "Invalid seniority" }, { status: 400 });
  }
  if (typeof industry !== "string" || industry.trim().length < 2) {
    return NextResponse.json(
      { error: "Industry is required (min 2 characters)" },
      { status: 400 }
    );
  }
  if (typeof companySize !== "string" || !VALID_COMPANY_SIZE.has(companySize)) {
    return NextResponse.json({ error: "Invalid company size" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      role: role.trim(),
      seniority,
      industry: industry.trim(),
      companySize,
    },
    select: { id: true, role: true, seniority: true, industry: true, companySize: true },
  });

  return NextResponse.json({ user });
}
