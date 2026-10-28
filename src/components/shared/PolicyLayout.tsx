import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Section {
  title: string;
  content: React.ReactNode;
}

interface PolicyLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  effectiveDate: string;
  sections: Section[];
  relatedLinks?: { label: string; href: string }[];
}

export function PolicyLayout({
  title,
  subtitle,
  lastUpdated,
  effectiveDate,
  sections,
  relatedLinks,
}: PolicyLayoutProps) {
  return (
    <div className="bg-[#F5EFE6] min-h-screen">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <section className="bg-[#FFFCF7] border-b border-[#E6DFD5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1 h-7 rounded-full bg-[#203A2B]" />
            <p className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-[#A8B5A0]">Legal</p>
          </div>
          <h1 className="font-heading text-[28px] sm:text-[36px] font-bold text-[#242824] leading-tight mb-2">
            {title}
          </h1>
          <p className="font-body text-[13px] text-[#A8B5A0] mb-4">{subtitle}</p>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-1.5 bg-[#F5EFE6] border border-[#E6DFD5] text-[#777] text-[10px] font-body uppercase tracking-[0.12em] px-3 py-1 rounded-full">
              Last updated: {lastUpdated}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#F5EFE6] border border-[#E6DFD5] text-[#777] text-[10px] font-body uppercase tracking-[0.12em] px-3 py-1 rounded-full">
              Effective: {effectiveDate}
            </span>
          </div>
        </div>
      </section>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <section className="py-10 lg:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 lg:gap-12 items-start">

            {/* Main content */}
            <div className="flex flex-col gap-4">
              {sections.map((s, i) => (
                <div
                  key={i}
                  className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm px-6 sm:px-8 py-6"
                >
                  <h2 className="font-heading text-[16px] sm:text-[18px] font-bold text-[#242824] mb-3 flex items-center gap-2">
                    <span className="text-[11px] font-body font-bold text-[#C6A66B] bg-[#C6A66B]/10 border border-[#C6A66B]/20 px-2 py-0.5 rounded-sm shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.title}
                  </h2>
                  <div className="font-body text-[13px] text-[#555] leading-[1.85] flex flex-col gap-3">
                    {s.content}
                  </div>
                </div>
              ))}

              {/* Disclaimer box */}
              <div className="bg-[#203A2B]/6 border border-[#203A2B]/20 rounded-sm px-6 py-5">
                <p className="font-heading text-[13px] font-bold text-[#242824] mb-1">⚠ Important Notice</p>
                <p className="font-body text-[12px] text-[#555] leading-relaxed">
                  By accessing or using this website, you acknowledge that you have read, understood, and agree to be bound by these policies. If you do not agree, please discontinue use of this website immediately. These policies are subject to change without prior notice. Continued use after changes constitutes acceptance.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="flex flex-col gap-4 lg:sticky lg:top-28">

              {/* Quick nav */}
              <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm p-5">
                <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0] mb-4">Sections</p>
                <ul className="flex flex-col gap-2">
                  {sections.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[10px] font-body text-[#C6A66B] font-bold mt-0.5 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-body text-[12px] text-[#555] leading-snug">{s.title}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related links */}
              {relatedLinks && relatedLinks.length > 0 && (
                <div className="bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm p-5">
                  <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0] mb-4">Related</p>
                  <ul className="flex flex-col gap-2">
                    {relatedLinks.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="inline-flex items-center gap-1.5 font-body text-[12px] text-[#203A2B] hover:text-[#315B55] transition-colors"
                        >
                          <ArrowRight size={11} /> {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact */}
              <div className="bg-[#203A2B] rounded-sm p-5">
                <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-[#A8B5A0] mb-2">Questions?</p>
                <p className="font-heading text-[14px] font-bold text-[#FFFCF7] leading-snug mb-4">
                  Need clarification on any policy?
                </p>
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 bg-[#C6A66B] text-[#242824] font-body text-[11px] font-bold uppercase tracking-[0.12em] px-4 py-2.5 hover:bg-[#d4b77e] transition-colors rounded-sm"
                >
                  Contact Us <ArrowRight size={12} />
                </Link>
              </div>

            </aside>
          </div>
        </div>
      </section>

    </div>
  );
}
