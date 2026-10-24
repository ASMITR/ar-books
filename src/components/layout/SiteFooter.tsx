import Link from "next/link";
import Image from "next/image";
import { BrandStripeDivider } from "@/components/shared/BrandStripeDivider";

export function SiteFooter() {
  return (
    <footer className="bg-[#080808] text-white mt-auto">
      <BrandStripeDivider />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Image src="/Main_Logo.png" alt="AR Books" width={160} height={48} className="h-10 w-auto brightness-0 invert" />
            <p className="text-sm text-[#777777] leading-relaxed max-w-xs">
              Original eBooks by Asmit Rajaramkar — ideas, skills, and stories delivered directly to you.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-body uppercase tracking-wider text-[#777777] mb-4">Explore</p>
            <ul className="flex flex-col gap-2">
              {[
                { label: "My Books", href: "/books" },
                { label: "About", href: "/about" },
                { label: "Articles", href: "/articles" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[#777777] hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-body uppercase tracking-wider text-[#777777] mb-4">Legal</p>
            <ul className="flex flex-col gap-2">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms & Conditions", href: "/terms" },
                { label: "Refund Policy", href: "/refund-policy" },
                { label: "Download Policy", href: "/download-policy" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[#777777] hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#777777]">
            © 2025 Asmit Rajaramkar. All rights reserved.
          </p>
          <p className="text-xs text-[#777777]">All eBooks are digital products. No physical shipping.</p>
        </div>
      </div>
    </footer>
  );
}
