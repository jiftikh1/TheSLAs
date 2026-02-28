import { LoginButton } from "@/components/LoginButton";
import { DevLoginForm } from "@/components/DevLoginForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const isDevelopment = process.env.NODE_ENV === "development";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const [session, { callbackUrl }] = await Promise.all([auth(), searchParams]);

  // If already logged in, redirect to callback URL or feed
  if (session) {
    redirect(callbackUrl || "/feed");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            The SLAs
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Peer Software Reality Check
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {isDevelopment ? (
            <>
              <DevLoginForm />
              <div className="flex justify-center">
                <LoginButton />
              </div>
            </>
          ) : (
            <>
              <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                Sign in with your LinkedIn account to join the conversation
              </p>
              <div className="flex justify-center">
                <LoginButton />
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
          <p>
            Your identity is verified through LinkedIn, but your posts remain
            anonymous.
          </p>
          <p className="mt-1">Real professionals. Real insights.</p>
        </div>
      </div>
    </div>
  );
}
