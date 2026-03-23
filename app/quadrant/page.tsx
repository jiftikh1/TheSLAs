import { getQuadrantData } from "@/lib/quadrant";
import { ProductVendorQuadrant } from "@/components/ProductVendorQuadrant";
import { AppNavbar } from "@/components/AppNavbar";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function QuadrantPage() {
  const [entries, session] = await Promise.all([getQuadrantData(), auth()]);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar isLoggedIn={!!session} />

      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Community-scored · No vendor fees
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
            The Quadrant
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Product quality vs. vendor trust — derived entirely from practitioner posts.
            No pay-to-play. No analyst relationships. Just real-world signal.
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span>
              <strong className="text-foreground">X axis</strong> — How good the product actually is
              <span className="ml-1 opacity-60">(Workflows + Integrations signal)</span>
            </span>
            <span className="text-border">·</span>
            <span>
              <strong className="text-foreground">Y axis</strong> — How trustworthy the vendor is
              <span className="ml-1 opacity-60">(Partnerships signal)</span>
            </span>
          </div>
        </div>

        {/* Chart */}
        <ProductVendorQuadrant entries={entries} />

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-muted-foreground/60">
          Dot size = review volume. Faded dots = fewer than 2 posts per axis. Scores update in real time as practitioners submit reviews.
        </p>
      </main>
    </div>
  );
}
