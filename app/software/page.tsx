export const dynamic = "force-dynamic";

import { getAllSoftware } from "@/lib/software";
import { SoftwareSearch } from "@/components/SoftwareSearch";
import Link from "next/link";

export default async function SoftwarePage() {
  const allSoftware = await getAllSoftware();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                ← Back to Home
              </Link>
              <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                Software Catalog
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {allSoftware.length} platforms with practitioner insights
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <SoftwareSearch allSoftware={allSoftware} />
      </main>
    </div>
  );
}
