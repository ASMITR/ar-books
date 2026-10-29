"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, Mail } from "lucide-react";
import { NewsletterForm } from "@/components/home/NewsletterForm";

const shopLinks = [
  { label: "All Books", href: "/books" },
];

const helpLinks = [
  { label: "FAQs",              href: "/faqs" },
  { label: "Returns & Refunds", href: "/refund-policy" },
  { label: "Download Policy",   href: "/download-policy" },
  { label: "Contact Us",        href: "/contact" },
];

const aboutLinks = [
  { label: "Our Story",          href: "/about" },
  { label: "Articles",           href: "/articles" },
  { label: "Privacy Policy",     href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Cookie Policy",      href: "/cookie-policy" },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "#",
    d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    label: "X / Twitter",
    href: "#",
    d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "YouTube",
    href: "#",
    d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

// ── Reusable accordion group (mobile only) ───────────────────────────────────
function FooterAccordion({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#FFFCF7]/8 lg:border-0">
      {/* Mobile toggle */}
      <button
        className="lg:hidden w-full flex items-center justify-between py-4 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-[11px] font-body font-bold uppercase tracking-[0.18em] text-[#FFFCF7]">
          {title}
        </span>
        <ChevronDown
          size={15}
          className={`text-[#A8B5A0] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Desktop heading (always visible) */}
      <p className="hidden lg:block text-[11px] font-body font-bold uppercase tracking-[0.18em] text-[#FFFCF7] mb-5 pb-3 border-b border-[#FFFCF7]/10">
        {title}
      </p>

      {/* Links — always visible on desktop, toggled on mobile */}
      <ul
        className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 lg:max-h-none lg:pb-0
          ${open ? "max-h-60 pb-4" : "max-h-0 lg:max-h-none"}`}
      >
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-[12px] text-[#A8B5A0] hover:text-[#FFFCF7] transition-colors duration-150 inline-flex items-center gap-1.5 group"
            >
              <span className="w-0 h-px bg-[#C6A66B] group-hover:w-3 transition-all duration-200 hidden lg:inline-block" />
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main footer ──────────────────────────────────────────────────────────────
export function SiteFooter() {
  return (
    <footer className="bg-[#1a2e20] text-[#FFFCF7]">

      {/* Top gold accent line */}
      <div className="h-[3px] bg-gradient-to-r from-[#203A2B] via-[#C6A66B] to-[#203A2B]" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-14 pb-8">

        {/* ── Brand + Social (always full-width on mobile) ─────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-8 border-b border-[#FFFCF7]/8 lg:hidden">
          <div>
            <Link href="/" className="inline-block mb-3">
              <Image
                src="/Horizontal_Logo.png"
                alt="Asmit Rajaramkar Books"
                width={140}
                height={36}
                className="h-8 w-auto brightness-0 invert opacity-90"
              />
            </Link>
            <p className="text-[12px] text-[#A8B5A0] leading-relaxed max-w-[240px]">
              Discover stories, explore ideas, and find inspiration on every page.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[11px] text-[#A8B5A0]">
              <Mail size={12} className="shrink-0 text-[#C6A66B]" />
              <span>support@arbooks.in</span>
            </div>
            <div className="flex items-center gap-2.5">
              {socialLinks.map(({ label, href, d }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-full border border-[#FFFCF7]/10 flex items-center justify-center text-[#A8B5A0] hover:border-[#C6A66B] hover:text-[#C6A66B] transition-all duration-200"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d={d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Accordion link groups (mobile/tablet) ────────────────── */}
        <div className="lg:hidden">
          <FooterAccordion title="Shop"  links={shopLinks} />
          <FooterAccordion title="Help"  links={helpLinks} />
          <FooterAccordion title="About" links={aboutLinks} />

          {/* Newsletter — always expanded on mobile */}
          <div className="pt-6 pb-2">
            <p className="text-[11px] font-body font-bold uppercase tracking-[0.18em] text-[#FFFCF7] mb-3">
              Newsletter
            </p>
            <p className="text-[12px] text-[#A8B5A0] mb-4 leading-relaxed">
              New releases, reading picks &amp; exclusive deals — straight to your inbox.
            </p>
            <NewsletterForm source="footer" variant="footer" />
          </div>
        </div>

        {/* ── Desktop 5-column grid ─────────────────────────────────── */}
        <div className="hidden lg:grid lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.8fr] gap-8">

          {/* Col 1: Brand */}
          <div>
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/Horizontal_Logo.png"
                alt="Asmit Rajaramkar Books"
                width={150}
                height={38}
                className="h-9 w-auto brightness-0 invert opacity-90"
              />
            </Link>
            <p className="text-[12px] text-[#A8B5A0] leading-[1.8] mb-6 max-w-[220px]">
              Discover stories, explore ideas, and find inspiration on every page.
            </p>
            <div className="flex flex-col gap-2.5 mb-6">
              <div className="flex items-center gap-2.5 text-[11px] text-[#A8B5A0]">
                <Mail size={12} className="shrink-0 text-[#C6A66B]" />
                <span>support@arbooks.in</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              {socialLinks.map(({ label, href, d }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-full border border-[#FFFCF7]/10 flex items-center justify-center text-[#A8B5A0] hover:border-[#C6A66B] hover:text-[#C6A66B] hover:bg-[#C6A66B]/10 transition-all duration-200"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d={d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Shop */}
          <div>
            <p className="text-[11px] font-body font-bold uppercase tracking-[0.18em] text-[#FFFCF7] mb-5 pb-3 border-b border-[#FFFCF7]/10">Shop</p>
            <ul className="flex flex-col gap-3">
              {shopLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[12px] text-[#A8B5A0] hover:text-[#FFFCF7] transition-colors inline-flex items-center gap-1.5 group">
                    <span className="w-0 h-px bg-[#C6A66B] group-hover:w-3 transition-all duration-200" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Help */}
          <div>
            <p className="text-[11px] font-body font-bold uppercase tracking-[0.18em] text-[#FFFCF7] mb-5 pb-3 border-b border-[#FFFCF7]/10">Help</p>
            <ul className="flex flex-col gap-3">
              {helpLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[12px] text-[#A8B5A0] hover:text-[#FFFCF7] transition-colors inline-flex items-center gap-1.5 group">
                    <span className="w-0 h-px bg-[#C6A66B] group-hover:w-3 transition-all duration-200" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: About */}
          <div>
            <p className="text-[11px] font-body font-bold uppercase tracking-[0.18em] text-[#FFFCF7] mb-5 pb-3 border-b border-[#FFFCF7]/10">About</p>
            <ul className="flex flex-col gap-3">
              {aboutLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[12px] text-[#A8B5A0] hover:text-[#FFFCF7] transition-colors inline-flex items-center gap-1.5 group">
                    <span className="w-0 h-px bg-[#C6A66B] group-hover:w-3 transition-all duration-200" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Newsletter */}
          <div>
            <p className="text-[11px] font-body font-bold uppercase tracking-[0.18em] text-[#FFFCF7] mb-5 pb-3 border-b border-[#FFFCF7]/10">Newsletter</p>
            <p className="text-[12px] text-[#A8B5A0] mb-5 leading-[1.7]">
              New releases, reading picks &amp; exclusive deals — straight to your inbox.
            </p>
            <NewsletterForm source="footer" variant="footer" />
          </div>

        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────── */}
      <div className="border-t border-[#FFFCF7]/8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] text-[#A8B5A0]">
              © {new Date().getFullYear()} Asmit Rajaramkar. All rights reserved.
            </p>
            <p className="text-[10px] text-[#A8B5A0]/60">
              Asmit Rajaramkar — Independent Publisher &amp; Author · support@arbooks.in
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-1">
            <Link href="/privacy"        className="text-[11px] text-[#A8B5A0] hover:text-[#FFFCF7] transition-colors">Privacy Policy</Link>
            <span className="text-[#A8B5A0]/30 hidden sm:inline">·</span>
            <Link href="/terms"          className="text-[11px] text-[#A8B5A0] hover:text-[#FFFCF7] transition-colors">Terms &amp; Conditions</Link>
            <span className="text-[#A8B5A0]/30 hidden sm:inline">·</span>
            <Link href="/refund-policy"  className="text-[11px] text-[#A8B5A0] hover:text-[#FFFCF7] transition-colors">Refund Policy</Link>
            <span className="text-[#A8B5A0]/30 hidden sm:inline">·</span>
            <Link href="/cookie-policy"  className="text-[11px] text-[#A8B5A0] hover:text-[#FFFCF7] transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
