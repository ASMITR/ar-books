"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Download, BookOpen, Check } from "lucide-react";
import { formatINR } from "@/lib/currency";

interface DownloadCardProps {
  title: string;
  coverImageUrl?: string;
  pricePaise: number;
  downloadUrl: string;
  /** Stagger entrance animation by index */
  index?: number;
}

export function DownloadCard({
  title,
  coverImageUrl,
  pricePaise,
  downloadUrl,
  index = 0,
}: DownloadCardProps) {
  const [state, setState]   = useState<"idle" | "loading" | "done">("idle");
  const [visible, setVisible] = useState(false);

  // Staggered entrance
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200 + index * 150);
    return () => clearTimeout(t);
  }, [index]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let real downloads pass through; only intercept anchors that stay on-page
    if (!downloadUrl.startsWith("http") && !downloadUrl.startsWith("/api")) {
      e.preventDefault();
    }
    if (state !== "idle") return;
    setState("loading");
    // For real /api routes the browser handles the download; we just show feedback
    setTimeout(() => setState("done"), 1800);
    setTimeout(() => setState("idle"), 5000);
  };

  return (
    <div
      className={`transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="group relative bg-[#FFFCF7] border border-[#E6DFD5] hover:border-[#C6A66B] hover:shadow-lg transition-all duration-300">
        {/* Gold top accent on hover */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#C6A66B] via-[#FFC928] to-[#C6A66B] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="p-5 flex gap-4 items-center">
          {/* Book cover */}
          <div className="relative w-[52px] h-[74px] shrink-0 overflow-hidden bg-gradient-to-br from-[#203A2B] to-[#315B55] shadow-md">
            {coverImageUrl ? (
              <Image
                src={coverImageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="52px"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                <BookOpen size={18} className="text-[#A8B5A0]" strokeWidth={1.5} />
                <div className="w-6 h-px bg-[#A8B5A0]/40" />
                <div className="w-4 h-px bg-[#A8B5A0]/30" />
              </div>
            )}
            {/* Spine highlight */}
            <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-white/20 via-white/10 to-transparent" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-heading text-base font-bold text-[#242824] leading-snug line-clamp-2">
              {title}
            </p>
            <div className="flex items-center gap-2.5 mt-2">
              <span className="text-[10px] font-body font-semibold text-[#C6A66B] border border-[#C6A66B]/40 px-2 py-0.5 uppercase tracking-wider">
                PDF
              </span>
              <span className="text-[10px] font-body font-bold text-[#203A2B] tabular-nums">
                {formatINR(pricePaise)}
              </span>
            </div>
          </div>

          {/* Download CTA */}
          <a
            href={downloadUrl}
            onClick={handleClick}
            className={`relative shrink-0 flex flex-col items-center justify-center gap-1.5 w-[88px] h-[64px] font-body text-[10px] font-bold uppercase tracking-[0.1em] transition-all duration-300 overflow-hidden
              ${
                state === "done"
                  ? "bg-emerald-500 text-white cursor-default"
                  : state === "loading"
                  ? "bg-[#203A2B] text-[#A8B5A0] cursor-wait"
                  : "bg-[#203A2B] text-[#FFC928] hover:bg-[#315B55]"
              }`}
            aria-label={`Download ${title}`}
          >
            {state === "loading" ? (
              <>
                <span className="w-4 h-4 border-2 border-[#A8B5A0]/30 border-t-[#FFC928] rounded-full animate-spin" />
                <span>Getting…</span>
              </>
            ) : state === "done" ? (
              <>
                <Check size={16} strokeWidth={2.5} />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Download size={16} strokeWidth={2} />
                <span>Download</span>
              </>
            )}

            {/* Shimmer on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </a>
        </div>
      </div>
    </div>
  );
}
