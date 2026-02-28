import { auth } from "@/lib/auth";
import { getSoftwareWithStats } from "@/lib/software";
import { SubmitPostForm } from "@/components/SubmitPostForm";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Dimension } from "@prisma/client";
import prisma from "@/lib/prisma";

const VALID_DIMENSIONS = new Set<string>(Object.values(Dimension));

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ dimension?: string }>;
};

export default async function SubmitPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const [{ slug }, { dimension: dimensionParam }] = await Promise.all([
    params,
    searchParams,
  ]);

  const rawDimension = dimensionParam?.toUpperCase() ?? "";

  // Require profile to be set before submitting
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user?.role) {
    redirect(
      `/profile/setup?next=/software/${slug}/submit${rawDimension ? `?dimension=${rawDimension}` : ""}`
    );
  }

  const software = await getSoftwareWithStats(slug);
  if (!software) notFound();

  const initialDimension: Dimension = VALID_DIMENSIONS.has(rawDimension)
    ? (rawDimension as Dimension)
    : "PARTNERSHIPS";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <Link
            href={`/software/${slug}`}
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← {software.name}
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Share an insight
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Real-world experience with {software.name}. Anonymous. No hype.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <SubmitPostForm
          slug={slug}
          softwareName={software.name}
          initialDimension={initialDimension}
        />
      </main>
    </div>
  );
}
