import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { DEV_USERS } from "@/lib/auth-dev";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const { email } = await request.json();

  const devUserTemplate = DEV_USERS.find((u) => u.email === email);
  if (!devUserTemplate) {
    return NextResponse.json({ error: "Invalid dev user" }, { status: 400 });
  }

  // Find or create the user
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email: devUserTemplate.email,
      name: devUserTemplate.name,
      linkedinId: `dev-${devUserTemplate.email}`,
      role: devUserTemplate.role,
      industry: devUserTemplate.industry,
      companySize: devUserTemplate.companySize,
      seniority: devUserTemplate.seniority,
    },
  });

  // Create a database session
  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: { sessionToken, userId: user.id, expires },
  });

  // Set the NextAuth session cookie
  const cookieStore = await cookies();
  cookieStore.set("authjs.session-token", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
    secure: false,
  });

  return NextResponse.json({ ok: true });
}
