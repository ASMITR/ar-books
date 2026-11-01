"use client";

import Link from "next/link";
import Image from "next/image";
import { WifiOff, RefreshCw, BookOpen } from "lucide-react";

export function OfflineClient() {
  return (
    <div className="min-h-screen bg-[#F5EFE6] flex flex-col items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-8 text-center max-w-sm w-full">

        {/* Logo */}
        <div className="relative w-20 h-20">
          <Image
            src="/icons/icon-192x192.png"
            alt="AR Books"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-[#203A2B]/10 flex items-center justify-center">
          <WifiOff size={28} className="text-[#203A2B]" strokeWidth={1.5} />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-[32px] font-bold text-[#242824] leading-tight">
            You&apos;re offline
          </h1>
          <p className="font-body text-[14px] text-[#777970] leading-relaxed">
            It looks like your internet connection is unavailable. Check your
            connection and try again — your session will be waiting for you.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => window.location.reload()}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#203A2B] text-[#FFFCF7] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-6 py-3.5 hover:bg-[#315B55] transition-colors rounded-sm"
          >
            <RefreshCw size={13} />
            Try Again
          </button>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 border border-[#E6DFD5] text-[#242824] font-body text-[11px] font-bold uppercase tracking-[0.12em] px-6 py-3.5 hover:border-[#203A2B] hover:text-[#203A2B] transition-colors rounded-sm"
          >
            <BookOpen size={13} />
            Go to Homepage
          </Link>
        </div>

        {/* Tip */}
        <p className="font-body text-[11px] text-[#A8B5A0]">
          READ · LEARN · IMAGINE
        </p>
      </div>
    </div>
  );
}
