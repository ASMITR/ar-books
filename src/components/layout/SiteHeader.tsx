"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShoppingCart, Search, Menu, X, User, ChevronDown, Truck, Star, Headphones } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { SearchModal } from "@/components/shared/SearchModal";

const navLinks = [
  { label: "Home",     href: "/" },
  { label: "Books",    href: "/books" },
  { label: "Articles", href: "/articles" },
  { label: "About Us", href: "/about" },
  { label: "Contact",  href: "/contact" },
];

export function SiteHeader() {
  const { count }                       = useCart();
  const { user, signOut }               = useAuth();
  const pathname                        = usePathname();
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [accountOpen, setAccountOpen]   = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [role, setRole]                 = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!user) { setRole(null); return; }
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => setRole(d.role ?? null))
      .catch(() => setRole(null));
  }, [user?.uid]);

  // Close menus on route change
  useEffect(() => { setMobileOpen(false); setAccountOpen(false); setSearchOpen(false); }, [pathname]);

  // Open search with Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className={`sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? "shadow-md" : ""}`}>

      {/* ── Announcement Bar ──────────────────────────────────────────── */}
      <div className="bg-[#203A2B] text-[#FFFCF7]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[30px] flex items-center justify-between">

          <div className="flex items-center gap-2 text-[10px] tracking-wide">
            <Truck size={11} className="shrink-0 opacity-75" />
            <span className="hidden sm:inline opacity-90">Discover Books That Inspire</span>
            <span className="sm:hidden opacity-90">Books That Inspire</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] tracking-wide">
            <Star size={10} className="shrink-0 fill-[#C6A66B] text-[#C6A66B]" />
            <span className="opacity-90">Stories That Stay With You</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] tracking-wide">
            <Headphones size={11} className="shrink-0 opacity-75" />
            <span className="opacity-90">Reader Support</span>
          </div>

        </div>
      </div>

      {/* ── Main Nav ──────────────────────────────────────────────────── */}
      <div className="bg-[#FFFCF7] border-b border-[#E6DFD5]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[64px]">

            {/* Logo */}
            <Link href="/" className="shrink-0">
              <Image
                src="/Horizontal_Logo.png"
                alt="Asmit Rajaramkar Books"
                width={180}
                height={44}
                className="h-10 w-auto"
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-7" aria-label="Main navigation">
              {navLinks.map((l) => {
                const active = isActive(l.href) && !(l.href === "/books" && pathname === "/");
                return (
                  <Link
                    key={l.label}
                    href={l.href}
                    className={`relative text-[11px] font-body font-semibold uppercase tracking-[0.1em] py-1 transition-colors duration-200 group
                      ${active ? "text-[#203A2B]" : "text-[#242824] hover:text-[#203A2B]"}`}
                  >
                    {l.label}
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] bg-[#203A2B] transition-all duration-200
                        ${active ? "w-full" : "w-0 group-hover:w-full"}`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-0.5">

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="p-2.5 text-[#242824] hover:text-[#203A2B] hover:bg-[#F5EFE6] rounded-sm transition-colors"
              >
                <Search size={18} />
              </button>

              {/* Account dropdown */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-0.5 p-2.5 text-[#242824] hover:text-[#203A2B] hover:bg-[#F5EFE6] rounded-sm transition-colors"
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                >
                  <User size={18} />
                  <ChevronDown size={12} className={`transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`} />
                </button>

                {accountOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 bg-[#FFFCF7] border border-[#E6DFD5] shadow-xl py-1.5 z-50 rounded-sm"
                    onMouseLeave={() => setAccountOpen(false)}
                  >
                    {user ? (
                      <>
                        {role === "admin" ? (
                          <Link href="/admin/dashboard" className="flex items-center px-4 py-2.5 text-[12px] font-body text-[#242824] hover:bg-[#F5EFE6] hover:text-[#203A2B] transition-colors" onClick={() => setAccountOpen(false)}>
                            Admin Dashboard
                          </Link>
                        ) : (
                          <>
                            <Link href="/account/dashboard" className="flex items-center px-4 py-2.5 text-[12px] font-body text-[#242824] hover:bg-[#F5EFE6] hover:text-[#203A2B] transition-colors" onClick={() => setAccountOpen(false)}>My Account</Link>
                            <Link href="/account/library"   className="flex items-center px-4 py-2.5 text-[12px] font-body text-[#242824] hover:bg-[#F5EFE6] hover:text-[#203A2B] transition-colors" onClick={() => setAccountOpen(false)}>My Library</Link>
                            <Link href="/account/orders"    className="flex items-center px-4 py-2.5 text-[12px] font-body text-[#242824] hover:bg-[#F5EFE6] hover:text-[#203A2B] transition-colors" onClick={() => setAccountOpen(false)}>My Orders</Link>
                          </>
                        )}
                        <div className="border-t border-[#E6DFD5] my-1" />
                        <button
                          onClick={() => { signOut(); setAccountOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-[12px] font-body text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login"    className="flex items-center px-4 py-2.5 text-[12px] font-body text-[#242824] hover:bg-[#F5EFE6] hover:text-[#203A2B] transition-colors" onClick={() => setAccountOpen(false)}>Sign In</Link>
                        <Link href="/register" className="flex items-center px-4 py-2.5 text-[12px] font-body text-[#242824] hover:bg-[#F5EFE6] hover:text-[#203A2B] transition-colors" onClick={() => setAccountOpen(false)}>Create Account</Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                aria-label={`Cart, ${count} item${count !== 1 ? "s" : ""}`}
                className="relative p-2.5 text-[#242824] hover:text-[#203A2B] hover:bg-[#F5EFE6] rounded-sm transition-colors"
              >
                <ShoppingCart size={18} />
                {count > 0 && (
                  <span className="absolute top-1 right-1 bg-[#203A2B] text-[#FFFCF7] text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5 leading-none">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </Link>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2.5 text-[#242824] hover:bg-[#F5EFE6] rounded-sm transition-colors ml-0.5"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Drawer ─────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#FFFCF7] border-t border-[#E6DFD5] px-4 pb-6 pt-2">

            {/* Nav links */}
            <nav className="flex flex-col" aria-label="Mobile navigation">
              {/* Mobile search */}
              <button
                onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                className="flex items-center gap-3 py-3 text-[12px] font-body font-semibold uppercase tracking-wider text-[#242824] hover:text-[#203A2B] border-b border-[#E6DFD5] transition-colors"
              >
                <Search size={14} /> Search Books
              </button>
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="flex items-center justify-between py-3 text-[12px] font-body font-semibold uppercase tracking-wider text-[#242824] hover:text-[#203A2B] border-b border-[#E6DFD5] last:border-0 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Account section */}
            <div className="mt-4 pt-4 border-t border-[#E6DFD5] flex flex-col gap-1">
              {user ? (
                <>
                  {role === "admin" ? (
                    <Link href="/admin/dashboard" className="block py-2.5 text-[12px] font-body text-[#242824] hover:text-[#203A2B]">Admin Dashboard</Link>
                  ) : (
                    <>
                      <Link href="/account/dashboard" className="block py-2.5 text-[12px] font-body text-[#242824] hover:text-[#203A2B]">My Account</Link>
                      <Link href="/account/library"   className="block py-2.5 text-[12px] font-body text-[#242824] hover:text-[#203A2B]">My Library</Link>
                      <Link href="/account/orders"    className="block py-2.5 text-[12px] font-body text-[#242824] hover:text-[#203A2B]">My Orders</Link>
                    </>
                  )}
                  <button onClick={() => signOut()} className="text-left py-2.5 text-[12px] font-body text-red-600">Sign Out</button>
                </>
              ) : (
                <div className="flex gap-3 pt-1">
                  <Link href="/login"    className="flex-1 text-center text-[11px] font-body font-bold uppercase tracking-wider border border-[#242824] text-[#242824] py-2.5 hover:bg-[#242824] hover:text-[#FFFCF7] transition-colors">Sign In</Link>
                  <Link href="/register" className="flex-1 text-center text-[11px] font-body font-bold uppercase tracking-wider bg-[#203A2B] text-[#FFFCF7] py-2.5 hover:bg-[#315B55] transition-colors">Register</Link>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
