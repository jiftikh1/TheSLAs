import prisma from "@/lib/prisma";
import { Dimension, Prisma } from "@prisma/client";

/**
 * Get all software entries
 */
export async function getAllSoftware() {
  return await prisma.software.findMany({
    orderBy: { name: "asc" },
  });
}

/**
 * Get all software with aggregated review stats (review count + star rating)
 * for the home page catalog view.
 */
export async function getAllSoftwareWithStats() {
  const allSoftware = await prisma.software.findMany({
    orderBy: { name: "asc" },
    include: {
      posts: {
        where: { moderationStatus: "published" },
        select: { trustScore: true },
      },
    },
  });

  return allSoftware.map((s) => {
    const reviewCount = s.posts.length;
    const avgTrust =
      reviewCount > 0
        ? s.posts.reduce((sum, p) => sum + p.trustScore, 0) / reviewCount
        : null;
    // Map 0-100 trust score to 0-5 star rating (1 decimal)
    const starRating =
      avgTrust !== null ? Math.round((avgTrust / 100) * 5 * 10) / 10 : null;

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      category: s.category,
      description: s.description,
      logoUrl: s.logoUrl,
      website: s.website,
      reviewCount,
      starRating,
    };
  });
}

/**
 * Get software by slug
 */
export async function getSoftwareBySlug(slug: string) {
  return await prisma.software.findUnique({
    where: { slug },
    include: {
      posts: {
        include: {
          author: {
            select: {
              id: true,
              role: true,
              seniority: true,
              industry: true,
              companySize: true,
            },
          },
          validations: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/**
 * Get software with post counts by dimension
 */
export async function getSoftwareWithStats(slug: string) {
  const software = await prisma.software.findUnique({
    where: { slug },
  });

  if (!software) return null;

  const postCounts = await prisma.post.groupBy({
    by: ["dimension"],
    where: { softwareId: software.id },
    _count: true,
  });

  const dimensionCounts = postCounts.reduce(
    (acc, item) => {
      acc[item.dimension] = item._count;
      return acc;
    },
    {} as Record<string, number>
  );

  const avgTrust = await prisma.post.aggregate({
    where: { softwareId: software.id },
    _avg: { trustScore: true },
  });

  return {
    ...software,
    postCounts: dimensionCounts,
    averageTrustScore: avgTrust._avg.trustScore || 0,
  };
}

/**
 * Search software by name or category
 */
export async function searchSoftware(query: string) {
  return await prisma.software.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { category: { contains: query } },
        { description: { contains: query } },
      ],
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Get posts for a software by dimension (for the profile page tabs)
 */
export async function getSoftwarePostsByDimension(
  softwareId: string,
  dimension: Dimension,
  lens: Lens = "all"
) {
  return await prisma.post.findMany({
    where: {
      softwareId,
      dimension,
      moderationStatus: "published",
      ...lensAuthorFilter(lens),
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          role: true,
          seniority: true,
          industry: true,
          companySize: true,
        },
      },
      validations: {
        select: { type: true, userId: true },
      },
      _count: { select: { comments: true } },
    },
    orderBy: [{ trustScore: "desc" }, { createdAt: "desc" }],
  });
}

export type Lens = "all" | "practitioner" | "leader" | "user";

const LENS_SENIORITY: Record<Lens, string[] | null> = {
  all: null,
  practitioner: ["junior", "mid", "senior", "lead"],
  leader: ["director", "vp", "c-level"],
  user: null, // power users identified by role content — no reliable DB filter yet, show all
};

function lensAuthorFilter(lens: Lens) {
  const seniorities = LENS_SENIORITY[lens];
  if (!seniorities) return undefined;
  return { author: { seniority: { in: seniorities } } };
}

export type FeedFilters = {
  dimension?: Dimension;
  softwareSlug?: string;
  sort?: "latest" | "hot";
  lens?: Lens;
  limit?: number;
};

/**
 * Get posts for the feed, with optional filters
 */
export async function getRecentPosts(filters: FeedFilters | number = {}) {
  // Back-compat: accept plain number as limit
  const opts: FeedFilters =
    typeof filters === "number" ? { limit: filters } : filters;

  const { dimension, softwareSlug, sort = "latest", lens = "all", limit = 30 } = opts;

  const where = {
    moderationStatus: "published",
    ...(dimension ? { dimension } : {}),
    ...(softwareSlug ? { software: { slug: softwareSlug } } : {}),
    ...lensAuthorFilter(lens),
  };

  const orderBy: Prisma.PostOrderByWithRelationInput[] =
    sort === "hot"
      ? [{ validations: { _count: "desc" } }, { createdAt: "desc" }]
      : [{ createdAt: "desc" }];

  return await prisma.post.findMany({
    where,
    include: {
      software: { select: { id: true, name: true, slug: true } },
      author: {
        select: {
          id: true,
          username: true,
          role: true,
          seniority: true,
          industry: true,
          companySize: true,
        },
      },
      validations: { select: { type: true, userId: true } },
      _count: { select: { comments: true } },
    },
    orderBy,
    take: limit,
  });
}

/**
 * Get software grouped by category
 */
export async function getSoftwareByCategory() {
  const allSoftware = await getAllSoftware();

  const grouped = allSoftware.reduce(
    (acc, software) => {
      if (!acc[software.category]) {
        acc[software.category] = [];
      }
      acc[software.category].push(software);
      return acc;
    },
    {} as Record<string, typeof allSoftware>
  );

  return grouped;
}

export type TrendDirection =
  | "improving"
  | "declining"
  | "stable"
  | "insufficient_data";

/**
 * Compute trend direction for a software dimension by comparing
 * avg trust score in the last 30 days vs the 30–90 day window.
 */
export async function getDimensionTrend(
  softwareId: string,
  dimension: Dimension
): Promise<TrendDirection> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const base = {
    softwareId,
    dimension,
    moderationStatus: "published",
    slopRisk: { lt: 60 }, // exclude obvious slop from trend
  };

  const [recent, older] = await Promise.all([
    prisma.post.aggregate({
      where: { ...base, createdAt: { gte: thirtyDaysAgo } },
      _avg: { trustScore: true },
      _count: { id: true },
    }),
    prisma.post.aggregate({
      where: { ...base, createdAt: { gte: ninetyDaysAgo, lt: thirtyDaysAgo } },
      _avg: { trustScore: true },
      _count: { id: true },
    }),
  ]);

  if ((recent._count.id ?? 0) < 2 || (older._count.id ?? 0) < 2) {
    return "insufficient_data";
  }

  const diff = (recent._avg.trustScore ?? 0) - (older._avg.trustScore ?? 0);
  if (diff >= 8) return "improving";
  if (diff <= -8) return "declining";
  return "stable";
}

/**
 * Get posts authored by a specific user
 */
export async function getUserPosts(userId: string) {
  return await prisma.post.findMany({
    where: { authorId: userId, moderationStatus: { not: "removed" } },
    include: {
      software: { select: { id: true, name: true, slug: true } },
      validations: { select: { type: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get threads authored by a specific user
 */
export async function getUserThreads(userId: string) {
  return await prisma.thread.findMany({
    where: { authorId: userId, moderationStatus: { not: "removed" } },
    include: {
      software: { select: { id: true, name: true, slug: true } },
      _count: { select: { replies: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
