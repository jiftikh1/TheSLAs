"use client";

import { useState } from "react";
import Link from "next/link";
import type { QuadrantEntry } from "@/lib/quadrant";

type Props = { entries: QuadrantEntry[] };

function dotColor(entry: QuadrantEntry): string {
  if (!entry.hasEnoughData) return "bg-muted-foreground";
  const highProduct = entry.productScore >= 50;
  const highVendor = entry.vendorScore >= 50;
  if (highProduct && highVendor) return "bg-primary";           // Safe Bet — teal
  if (highProduct && !highVendor) return "bg-accent";           // Great Tool, Risky Partner — amber
  if (!highProduct && highVendor) return "bg-blue-400";         // Good Partner, Weak Product — blue
  return "bg-destructive";                                       // Avoid — red
}

function dotSize(reviewCount: number): number {
  return Math.min(32, Math.max(12, 12 + reviewCount * 2));
}

export function ProductVendorQuadrant({ entries }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const hoveredEntry = entries.find((e) => e.id === hovered) ?? null;

  return (
    <div className="space-y-6">
      {/* Axis label — Y */}
      <div className="flex gap-6">
        {/* Y label rotated */}
        <div className="flex items-center justify-center" style={{ writingMode: "vertical-rl" }}>
          <span className="rotate-180 text-xs font-medium uppercase tracking-widest text-muted-foreground select-none">
            Vendor Trust ↑
          </span>
        </div>

        {/* Quadrant chart */}
        <div className="relative aspect-square w-full max-w-2xl">
          {/* Background grid */}
          <div className="absolute inset-0 rounded-xl border border-border bg-card" />

          {/* Quadrant dividers */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/20" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/20" />
          </div>

          {/* Quadrant labels */}
          <div className="absolute inset-0 pointer-events-none select-none">
            {/* Top-right: Safe Bet */}
            <div className="absolute top-3 right-3 text-right">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/60">
                Safe Bet
              </span>
            </div>
            {/* Top-left: Great Tool, Risky Partner */}
            <div className="absolute top-3 left-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-accent/60">
                Great Tool
              </span>
              <br />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-accent/60">
                Risky Partner
              </span>
            </div>
            {/* Bottom-left: Avoid */}
            <div className="absolute bottom-3 left-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-destructive/60">
                Avoid
              </span>
            </div>
            {/* Bottom-right: Good Partner, Weak Product */}
            <div className="absolute bottom-3 right-3 text-right">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-400/60">
                Good Partner
              </span>
              <br />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-400/60">
                Weak Product
              </span>
            </div>
          </div>

          {/* Dots */}
          {entries.map((entry) => {
            const size = dotSize(entry.reviewCount);
            const x = entry.productScore; // 0–100 → 0%–100% of width
            const y = 100 - entry.vendorScore; // invert: high vendor = top
            const isHovered = hovered === entry.id;

            return (
              <Link
                key={entry.id}
                href={`/software/${entry.slug}`}
                className="absolute"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                  width: size,
                  height: size,
                  zIndex: isHovered ? 20 : 10,
                }}
                onMouseEnter={() => setHovered(entry.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  className={`
                    h-full w-full rounded-full transition-all duration-150
                    ${dotColor(entry)}
                    ${entry.hasEnoughData ? "opacity-80 hover:opacity-100 hover:scale-125" : "opacity-20 border-2 border-dashed border-muted-foreground bg-transparent"}
                    ${isHovered ? "ring-2 ring-white/40 ring-offset-1 ring-offset-transparent" : ""}
                  `}
                />

                {/* Tooltip */}
                {isHovered && (
                  <div
                    className="absolute z-50 w-52 rounded-xl border border-border bg-card p-3 shadow-xl pointer-events-none"
                    style={{
                      // Flip left if in right half of chart
                      [x > 55 ? "right" : "left"]: "calc(100% + 8px)",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <p className="font-display text-sm font-bold text-foreground">{entry.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{entry.category}</p>
                    {entry.hasEnoughData ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Product quality</span>
                          <span className="font-semibold text-foreground">{entry.productScore}/100</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Vendor trust</span>
                          <span className="font-semibold text-foreground">{entry.vendorScore}/100</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Reviews</span>
                          <span className="font-semibold text-foreground">{entry.reviewCount}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Not enough data yet</p>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* X axis label */}
      <div className="pl-10 text-center">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground select-none">
          Product Quality →
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 pl-10">
        {[
          { color: "bg-primary", label: "Safe Bet" },
          { color: "bg-accent", label: "Great Tool, Risky Partner" },
          { color: "bg-blue-400", label: "Good Partner, Weak Product" },
          { color: "bg-destructive", label: "Avoid" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded-full ${color} opacity-80`} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full border-2 border-dashed border-muted-foreground opacity-40" />
          <span className="text-xs text-muted-foreground">Insufficient data</span>
        </div>
      </div>
    </div>
  );
}
