import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/LoginButton";
import { DevLoginForm } from "@/components/DevLoginForm";
import { Shield, Eye, Users, Lock, ArrowRight } from "lucide-react";

const isDevelopment = process.env.NODE_ENV === "development";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const [session, { callbackUrl }] = await Promise.all([auth(), searchParams]);

  if (session) {
    redirect(callbackUrl || "/feed");
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding (desktop only) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(164_100%_42%/0.08),transparent_60%)]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(164 100% 42%) 1px, transparent 1px), linear-gradient(90deg, hsl(164 100% 42%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 flex w-full flex-col justify-between p-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <span className="font-display text-base font-bold text-primary-foreground">
                SR
              </span>
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              The SLAs
            </span>
          </div>

          {/* Hero copy */}
          <div className="max-w-md">
            <h1 className="mb-6 font-display text-5xl font-bold leading-tight text-foreground">
              Honest software reviews
              <br />
              <span className="text-primary">without the politics</span>
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
              Real reviews from verified professionals. See how software
              performs from the hands-on builder to the executive buyer.
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: Shield,
                  title: "Verified Identity",
                  desc: "Sign in to prove you're a real professional",
                },
                {
                  icon: Eye,
                  title: "Always Anonymous",
                  desc: "Your reviews are never tied to your name",
                },
                {
                  icon: Users,
                  title: "Role-Based Insights",
                  desc: "Filter by IC, Lead, or Director perspective",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} The SLAs. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-10 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <span className="font-display text-base font-bold text-primary-foreground">
                SR
              </span>
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              The SLAs
            </span>
          </div>

          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Lock className="h-3 w-3" />
              Verified access only
            </div>
            <h2 className="mb-2 font-display text-2xl font-bold text-foreground">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign in to access honest reviews from verified professionals.
            </p>
          </div>

          <div className="space-y-3">
            {isDevelopment && (
              <DevLoginForm />
            )}
            <LoginButton />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <a
            href="/"
            className="mt-6 flex w-full items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Continue as guest
            <ArrowRight className="h-3.5 w-3.5" />
          </a>

          <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy
            Policy. Your identity is always kept anonymous.
          </p>
        </div>
      </div>
    </div>
  );
}
