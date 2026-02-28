import { LoginButton } from "@/components/LoginButton";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  // If already logged in, redirect to feed
  if (session) {
    redirect("/feed");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center gap-12 px-8 py-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            The SLAs
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Peer Software Reality Check
          </p>
        </div>

        <div className="max-w-2xl space-y-6 text-center">
          <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
            Honest, transparent, practitioner-driven insights about software —
            how it actually works in the real world.
          </p>
          <div className="grid gap-4 text-left text-zinc-600 dark:text-zinc-400 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Practitioner Truth
              </h3>
              <p className="mt-1 text-sm">
                Real experiences over vendor marketing
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Anonymous Accountability
              </h3>
              <p className="mt-1 text-sm">
                Verified professionals, anonymous posts
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Multi-Dimensional
              </h3>
              <p className="mt-1 text-sm">
                Not a single score, but a complete picture
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Long-Term Trends
              </h3>
              <p className="mt-1 text-sm">
                Track how software evolves over time
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <LoginButton />
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Sign in to share your insights and learn from peers
          </p>
        </div>
      </main>
    </div>
  );
}
