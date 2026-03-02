/**
 * Development Authentication Utilities
 * Bypasses LinkedIn OAuth for local development
 * DO NOT USE IN PRODUCTION
 */

import prisma from "@/lib/prisma";

export async function createDevUser() {
  const devUser = await prisma.user.upsert({
    where: { email: "dev@example.com" },
    update: {},
    create: {
      email: "dev@example.com",
      name: "Dev User",
      linkedinId: "dev-linkedin-id",
      role: "Senior Systems Engineer",
      industry: "Technology",
      companySize: "medium",
      seniority: "senior",
    },
  });

  return devUser;
}

export const DEV_USERS = [
  {
    email: "dev@example.com",
    name: "Dev User",
    role: "Senior Systems Engineer",
    industry: "Technology",
    companySize: "medium",
    seniority: "senior",
  },
  {
    email: "admin@example.com",
    name: "Sarah Chen",
    role: "VP of Engineering",
    industry: "SaaS",
    companySize: "large",
    seniority: "vp",
  },
  {
    email: "practitioner@example.com",
    name: "Alex Rodriguez",
    role: "RevOps Manager",
    industry: "E-commerce",
    companySize: "medium",
    seniority: "senior",
  },
  {
    email: "user@example.com",
    name: "Jordan Lee",
    role: "Product Manager",
    industry: "FinTech",
    companySize: "small",
    seniority: "mid",
  },
];
