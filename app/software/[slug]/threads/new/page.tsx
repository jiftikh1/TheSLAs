import { auth } from "@/lib/auth";
import { getSoftwareWithStats } from "@/lib/software";
import { NewThreadForm } from "@/components/NewThreadForm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

export default async function NewThreadPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { slug } = await params;

  // Require profile before posting
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user?.role) {
    redirect(`/profile/setup?next=/software/${slug}/threads/new`);
  }

  const software = await getSoftwareWithStats(slug);
  if (!software) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <Link
            href={`/software/${slug}?tab=discussions`}
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← {software.name} discussions
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Start a discussion
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Ask a question or open a candid conversation about {software.name}.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <NewThreadForm slug={slug} softwareName={software.name} />
        </div>
      </main>
    </div>
  );
}
