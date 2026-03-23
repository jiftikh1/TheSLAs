import { auth } from "@/lib/auth";
import { getSoftwareWithStats } from "@/lib/software";
import { SubmitPostForm } from "@/components/SubmitPostForm";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string>>;
};

export default async function SubmitPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const [{ slug }] = await Promise.all([params, searchParams]);

  // Require profile to be set before submitting
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user?.role) {
    redirect(`/profile/setup?next=/software/${slug}/submit`);
  }

  const software = await getSoftwareWithStats(slug);
  if (!software) notFound();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <Link
            href={`/software/${slug}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {software.name}
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold text-foreground">
            Write a review
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-world experience with {software.name}. Anonymous. No hype.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <SubmitPostForm slug={slug} softwareName={software.name} />
      </main>
    </div>
  );
}
