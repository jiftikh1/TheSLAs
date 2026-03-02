import prisma from "@/lib/prisma";

const AUTHOR_SELECT = {
  id: true,
  role: true,
  seniority: true,
  industry: true,
  companySize: true,
} as const;

/**
 * Get all threads for a software, ordered by most recent activity
 */
export async function getThreadsBySoftware(softwareId: string) {
  return await prisma.thread.findMany({
    where: { softwareId, moderationStatus: "published" },
    include: {
      author: { select: AUTHOR_SELECT },
      _count: { select: { replies: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a single thread with all replies
 */
export async function getThreadById(threadId: string) {
  return await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      software: { select: { id: true, name: true, slug: true } },
      author: { select: AUTHOR_SELECT },
      replies: {
        where: { moderationStatus: "published" },
        include: { author: { select: AUTHOR_SELECT } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
