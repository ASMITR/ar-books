"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  TrendingUp,
  Brain,
  DollarSign,
  Cpu,
  Zap,
  BookMarked,
  Ghost,
  Rocket,
} from "lucide-react";
import type { Category } from "@/types";

// ─── Per-category visual config ───────────────────────────────────────────────
const CAT_CONFIG: Record<string, {
  Icon: React.ElementType;
  sublabel: string;
  accent: string;
  iconBg: string;
}> = {
  "business":             { Icon: TrendingUp, sublabel: "Strategy · Leadership", accent: "#203A2B", iconBg: "#E4EDE7" },
  "personal-development": { Icon: Brain,       sublabel: "Mindset · Growth",      accent: "#315B55", iconBg: "#E2EDEC" },
  "finance":              { Icon: DollarSign,  sublabel: "Wealth · Investing",    accent: "#4A5C1E", iconBg: "#EBF0DB" },
  "technology":           { Icon: Cpu,         sublabel: "Code · Innovation",     accent: "#1D4060", iconBg: "#DDE8F0" },
  "productivity":         { Icon: Zap,         sublabel: "Focus · Systems",       accent: "#6B3E0D", iconBg: "#F1E6D5" },
  "fiction":              { Icon: BookMarked,  sublabel: "Stories · Imagination", accent: "#4D2060", iconBg: "#ECDFF5" },
  "horror":               { Icon: Ghost,       sublabel: "Dark · Suspense",       accent: "#2D2D2D", iconBg: "#E4E4E4" },
  "science-fiction":      { Icon: Rocket,      sublabel: "Future · Worlds",       accent: "#1A3060", iconBg: "#DAE1F0" },
};

const FALLBACK_ACCENTS = ["#203A2B", "#315B55", "#4A5C1E", "#1D4060", "#6B3E0D", "#4D2060"];
const FALLBACK_ICONBGS = ["#E4EDE7", "#E2EDEC", "#EBF0DB", "#DDE8F0", "#F1E6D5", "#ECDFF5"];

interface CategorySectionProps {
  categories: Category[];
}

// Slot type so we can mix real categories and the "All eBooks" CTA
type GridSlot =
  | { kind: "cat"; cat: Category; index: number }
  | { kind: "all" };

export function CategorySection({ categories }: CategorySectionProps) {
  if (categories.length === 0) return null;

  // Take at most 8 categories so the grid is 3×3 (8 cats + 1 "All eBooks" = 9)
  const visible = categories.slice(0, 8);

  const slots: GridSlot[] = [
    ...visible.map((cat, i): GridSlot => ({ kind: "cat", cat, index: i })),
    { kind: "all" },
  ];

  return (
    <section className="bg-[#F5EFE6] py-12 lg:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex items-end justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-px bg-[#C6A66B]" />
              <p className="text-[10px] font-body font-bold uppercase tracking-[0.3em] text-[#C6A66B]">
                Shop by Genre
              </p>
            </div>
            <h2 className="font-heading text-[30px] sm:text-[38px] font-bold text-[#242824] leading-tight">
              Browse by Category
            </h2>
          </div>
          <Link
            href="/books"
            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-body font-bold uppercase tracking-[0.12em] text-[#203A2B] border-b border-[#203A2B]/40 pb-0.5 hover:border-[#203A2B] transition-colors mb-1"
          >
            View All <ArrowRight size={11} />
          </Link>
        </div>

        {/* ── Responsive grid: 2 col mobile → 3 col tablet → 3 col desktop ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {slots.map((slot, idx) => {
            if (slot.kind === "all") {
              return (
                <Link
                  key="__all"
                  href="/books"
                  className="group flex items-center gap-3 bg-[#203A2B] px-3 sm:px-4 py-3 sm:py-3.5
                    hover:bg-[#315B55] transition-colors duration-200 overflow-hidden"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 bg-white/10">
                    <BookOpen size={15} strokeWidth={1.6} className="text-[#C6A66B]" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <p className="font-heading text-[13px] sm:text-[15px] font-bold text-[#FFFCF7] leading-tight truncate">
                      All eBooks
                    </p>
                    <p className="font-body text-[8px] sm:text-[9px] uppercase tracking-[0.13em] text-[#A8B5A0] truncate">
                      Full Collection
                    </p>
                  </div>
                  <ArrowRight
                    size={12}
                    className="shrink-0 text-[#C6A66B] transition-transform duration-200 group-hover:translate-x-0.5 hidden sm:block"
                  />
                </Link>
              );
            }

            const { cat, index } = slot;
            const cfg    = CAT_CONFIG[cat.slug];
            const Icon   = cfg?.Icon    ?? BookOpen;
            const sub    = cfg?.sublabel ?? "Explore";
            const accent = cfg?.accent   ?? FALLBACK_ACCENTS[index % FALLBACK_ACCENTS.length];
            const iconBg = cfg?.iconBg   ?? FALLBACK_ICONBGS[index % FALLBACK_ICONBGS.length];

            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group relative flex items-center gap-3 bg-white border border-[#E6DFD5]
                  px-3 sm:px-4 py-3 sm:py-3.5
                  hover:border-transparent hover:shadow-md
                  transition-all duration-200 overflow-hidden"
              >
                {/* Left accent bar */}
                <span
                  className="absolute inset-y-0 left-0 w-[3px] scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-bottom"
                  style={{ backgroundColor: accent }}
                />

                {/* Icon */}
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0
                    transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: iconBg }}
                >
                  <Icon size={15} strokeWidth={1.6} style={{ color: accent }} />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <p
                    className="font-heading text-[13px] sm:text-[15px] font-bold leading-tight truncate
                      transition-colors duration-150"
                    style={{ color: "#242824" }}
                  >
                    {cat.name}
                  </p>
                  <p className="font-body text-[8px] sm:text-[9px] uppercase tracking-[0.13em] text-[#A8B5A0] truncate">
                    {sub}
                  </p>
                </div>

                {/* Arrow — desktop only */}
                <ArrowRight
                  size={12}
                  className="shrink-0 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0
                    transition-all duration-200 hidden sm:block"
                  style={{ color: accent }}
                />
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
