import { auth } from "@/lib/auth";
import { ProfileSetupForm } from "@/components/ProfileSetupForm";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function ProfileSetupPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { next } = await searchParams;
  const nextPath = next && next.startsWith("/") ? next : "/feed";

  // Fetch current user data for pre-filling
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, seniority: true, industry: true, companySize: true },
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Set up your profile
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            This context is shown anonymously with your posts. It helps readers
            understand the lens behind your insights.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <ProfileSetupForm
            nextPath={nextPath}
            initialRole={user?.role ?? ""}
            initialSeniority={user?.seniority ?? ""}
            initialIndustry={user?.industry ?? ""}
            initialCompanySize={user?.companySize ?? ""}
          />
        </div>

        <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Your name is never shown to other users. Only role and seniority
          appear on your posts.
        </p>
      </div>
    </div>
  );
}
