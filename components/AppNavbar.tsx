"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Star, MessageSquare, Compass, LayoutGrid, Menu, X } from "lucide-react";

interface AppNavbarProps {
  isLoggedIn?: boolean;
  activeTab?: "reviews" | "discussions";
  onTabChange?: (tab: "reviews" | "discussions") => void;
}

export function AppNavbar({ isLoggedIn, activeTab, onTabChange }: AppNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isBrowse = pathname === "/software" || pathname.startsWith("/software/");
  const isHome = pathname === "/";
  const isFeed = pathname === "/feed";
  const isQuadrant = pathname === "/quadrant";

  const reviewsActive = (isHome || isFeed) && activeTab === "reviews";
  const discussionsActive = isHome && activeTab === "discussions";

  function handleTabClick(tab: "reviews" | "discussions") {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      // Navigate to home with the right tab
      router.push(tab === "discussions" ? "/?tab=discussions" : "/");
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-display text-sm font-bold text-primary-foreground">SR</span>
          </div>
          <span className="font-display text-lg font-bold text-foreground">The SLAs</span>
        </Link>

        {/* Center tabs */}
        <div className="hidden items-center gap-1 rounded-lg bg-secondary p-1 md:flex">
          <button
            onClick={() => handleTabClick("reviews")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              reviewsActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className="h-4 w-4" />
            Reviews
          </button>
          <button
            onClick={() => handleTabClick("discussions")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              discussionsActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Discussions
          </button>
          <Link
            href="/software"
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              isBrowse
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Compass className="h-4 w-4" />
            Browse
          </Link>
          <Link
            href="/quadrant"
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              isQuadrant
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Quadrant
          </Link>
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              <Link
                href="/me"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                My activity
              </Link>
              <Link
                href="/feed"
                className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Feed
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Sign in with LinkedIn
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="space-y-2 border-t border-border bg-background p-4 md:hidden">
          <button
            onClick={() => { handleTabClick("reviews"); setMobileOpen(false); }}
            className="flex w-full items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <Star className="h-4 w-4" /> Reviews
          </button>
          <button
            onClick={() => { handleTabClick("discussions"); setMobileOpen(false); }}
            className="flex w-full items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <MessageSquare className="h-4 w-4" /> Discussions
          </button>
          <Link
            href="/software"
            onClick={() => setMobileOpen(false)}
            className="flex w-full items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <Compass className="h-4 w-4" /> Browse
          </Link>
          <Link
            href="/quadrant"
            onClick={() => setMobileOpen(false)}
            className="flex w-full items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <LayoutGrid className="h-4 w-4" /> Quadrant
          </Link>
          {!isLoggedIn && (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex w-full items-center justify-center rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary"
            >
              Sign in with LinkedIn
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
