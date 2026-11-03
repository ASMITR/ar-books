import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function BrandStoryBanner() {
  return (
    <section className="bg-[#FFFCF7] py-14 lg:py-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden border border-[#E6DFD5]">

          {/* ── Left: Editorial image ── */}
          <div className="relative min-h-[280px] sm:min-h-[360px] lg:min-h-[480px] overflow-hidden bg-[#1C3325]">
            <Image
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=80"
              alt="Books and reading environment — Asmit Rajaramkar Books"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center opacity-70 mix-blend-luminosity"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1C3325]/80 via-[#203A2B]/60 to-[#203A2B]/30" />

            {/* Decorative patterns */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
              <defs>
                <pattern id="bs-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.7" fill="#C6A66B" fillOpacity="0.10" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#bs-dots)" />
            </svg>

            {/* Gold top accent */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#C6A66B] to-transparent" />

            {/* Corner brackets */}
            <svg className="absolute top-5 left-5 pointer-events-none" width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden style={{ opacity: 0.4 }}>
              <path d="M0 18 L0 0 L18 0" stroke="#C6A66B" strokeWidth="1.4" fill="none" />
            </svg>
            <svg className="absolute bottom-5 right-5 pointer-events-none" width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden style={{ opacity: 0.4 }}>
              <path d="M36 18 L36 36 L18 36" stroke="#C6A66B" strokeWidth="1.4" fill="none" />
            </svg>

            {/* Quote overlay */}
            <div className="absolute bottom-8 left-8 right-8">
              <span
                className="block font-heading font-bold text-[#C6A66B] leading-none select-none"
                style={{ fontSize: 80, opacity: 0.25 }}
                aria-hidden
              >
                "
              </span>
              <p className="font-heading text-[18px] sm:text-[22px] font-bold text-[#FFFCF7] leading-snug -mt-4">
                Words that open<br />worlds.
              </p>
            </div>
          </div>

          {/* ── Right: Brand copy ── */}
          <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-14 xl:px-16 py-12 lg:py-16 bg-[#F5EFE6]">

            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-6 h-px bg-[#C6A66B]" />
              <p className="text-[10px] font-body font-bold uppercase tracking-[0.35em] text-[#C6A66B]">
                Our Story
              </p>
            </div>

            {/* Heading */}
            <h2 className="font-heading text-[34px] sm:text-[42px] lg:text-[46px] font-bold text-[#242824] leading-[1.07] mb-5">
              Where Every Word<br />
              <span className="text-[#203A2B]">Has a Purpose</span>
            </h2>

            {/* Body */}
            <p className="font-body text-[13px] sm:text-[14px] text-[#6B7068] leading-[1.9] mb-4 max-w-md border-l-2 border-[#C6A66B]/50 pl-4">
              Asmit Rajaramkar Books is an independent digital publishing imprint built for modern readers. Every title is written and curated to inspire action, expand thinking, and stay relevant long after you close the last page.
            </p>
            <p className="font-body text-[13px] text-[#777970] leading-relaxed mb-8 max-w-md">
              From business strategy and personal finance to fiction and productivity — the collection is designed to accompany you through every stage of growth.
            </p>

            {/* CTA */}
            <Link
              href="/about"
              className="group inline-flex items-center gap-3 self-start"
            >
              <span className="flex items-center justify-center w-11 h-11 bg-[#203A2B] text-[#FFFCF7] group-hover:bg-[#315B55] transition-colors duration-200">
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
              <span className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[#203A2B] border-b border-[#203A2B]/30 pb-0.5 group-hover:border-[#203A2B] transition-colors">
                Discover Our Story
              </span>
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}
