import prisma from "@/lib/prisma";

export type QuadrantEntry = {
  id: string;
  name: string;
  slug: string;
  category: string;
  logoUrl: string | null;
  productScore: number; // 0–100, X axis (WORKFLOWS + INTEGRATIONS avg trust)
  vendorScore: number;  // 0–100, Y axis (PARTNERSHIPS avg trust)
  reviewCount: number;  // total published posts (controls dot size)
  hasEnoughData: boolean; // true when ≥2 posts on each axis
};

export async function getQuadrantData(): Promise<QuadrantEntry[]> {
  const [allSoftware, grouped] = await Promise.all([
    prisma.software.findMany({ orderBy: { name: "asc" } }),
    prisma.post.groupBy({
      by: ["softwareId", "dimension"],
      where: { moderationStatus: "published" },
      _avg: { trustScore: true },
      _count: { id: true },
    }),
  ]);

  // Build a lookup: softwareId → dimension → { avg, count }
  type Row = { avg: number; count: number };
  const lookup = new Map<string, Record<string, Row>>();
  for (const row of grouped) {
    if (!lookup.has(row.softwareId)) lookup.set(row.softwareId, {});
    lookup.get(row.softwareId)![row.dimension] = {
      avg: row._avg.trustScore ?? 50,
      count: row._count.id,
    };
  }

  return allSoftware.map((sw) => {
    const dims = lookup.get(sw.id) ?? {};

    // Product score: weighted avg of WORKFLOWS + INTEGRATIONS
    const productRows = [dims["WORKFLOWS"], dims["INTEGRATIONS"]].filter(Boolean) as Row[];
    const productTotalCount = productRows.reduce((s, r) => s + r.count, 0);
    const productScore =
      productTotalCount > 0
        ? productRows.reduce((s, r) => s + r.avg * r.count, 0) / productTotalCount
        : 50;
    const productPostCount = productTotalCount;

    // Vendor score: PARTNERSHIPS avg
    const vendorRow = dims["PARTNERSHIPS"];
    const vendorScore = vendorRow ? vendorRow.avg : 50;
    const vendorPostCount = vendorRow ? vendorRow.count : 0;

    // Total review count across all dimensions
    const reviewCount = Object.values(dims).reduce((s, r) => s + r.count, 0);

    const hasEnoughData = productPostCount >= 2 && vendorPostCount >= 2;

    return {
      id: sw.id,
      name: sw.name,
      slug: sw.slug,
      category: sw.category,
      logoUrl: sw.logoUrl,
      productScore: Math.round(productScore),
      vendorScore: Math.round(vendorScore),
      reviewCount,
      hasEnoughData,
    };
  });
}
