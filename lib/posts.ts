import prisma from "@/lib/prisma";

const AUTHOR_SELECT = {
  id: true,
  role: true,
  seniority: true,
  industry: true,
  companySize: true,
} as const;

/**
 * Get a single post with its software, author, validations, and comments
 */
export async function getPostById(postId: string) {
  return await prisma.post.findUnique({
    where: { id: postId },
    include: {
      software: { select: { id: true, name: true, slug: true } },
      author: { select: AUTHOR_SELECT },
      validations: { select: { type: true, userId: true } },
      comments: {
        where: { moderationStatus: "published" },
        include: { author: { select: AUTHOR_SELECT } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
