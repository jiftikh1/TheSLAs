export const dynamic = "force-dynamic";

import { getAllSoftwareWithStats } from "@/lib/software";
import { BrowseView } from "@/components/BrowseView";
import { auth } from "@/lib/auth";

export default async function SoftwarePage() {
  const [allSoftware, session] = await Promise.all([
    getAllSoftwareWithStats(),
    auth(),
  ]);

  const software = allSoftware.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    category: s.category,
    description: s.description,
    reviewCount: s.reviewCount,
    starRating: s.starRating,
  }));

  return <BrowseView software={software} isLoggedIn={!!session} />;
}
