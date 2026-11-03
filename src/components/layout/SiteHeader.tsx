"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  ChevronDown,
  BookOpen,
  Library,
  LogOut,
  LayoutDashboard,
  Tag,
  ArrowRight,
  Package,
  Heart,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { SearchModal } from "@/components/shared/SearchModal";

const navLinks = [
  { label: "Books",      href: "/books"      },
  { label: "Categories", href: "/categories" },
  { label: "Membership", href: "/membership" },
  { label: "Offers",     href: "/#offers"    },
  { label: "Blog",       href: "/articles"   },
];

export function SiteHeader() {
  const { count }         = useCart();
  const { user, signOut } = useAuth();
  const pathname          = usePathname();

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [role,        setRole]        = useState<string | null>(null);
  const headerRef     = useRef<HTMLElement>(null);
  const accountRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (!user) { setRole(null); return; }
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => setRole(d.role ?? null))
      .catch(() => setRole(null));
  }, [user?.uid]);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  // Click-outside for account dropdown
  useEffect(() => {
    if (!accountOpen) return;
    const fn = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [accountOpen]);

  // Click-outside for mobile dropdown
  useEffect(() => {
    if (!mobileOpen) return;
    const fn = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [mobileOpen]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href.split("?")[0].split("#")[0]);

  const initials = (user?.displayName ?? user?.email ?? "U")[0].toUpperCase();

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-50 bg-white transition-all duration-200
          ${scrolled
            ? "shadow-[0_1px_0_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.06)]"
            : "border-b border-[#EAE8E3]"
          }`}
      >
        {/* ── Announcement bar ── */}
        <div className="bg-[#1a1a1a]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-center gap-2">
            <p className="font-body text-[10px] tracking-[0.08em] text-[#999] text-center">
              <span className="hidden sm:inline">Instant digital downloads · No shipping, ever · </span>
              <Link
                href="/membership"
                className="text-white font-medium hover:text-[#ccc] transition-colors underline-offset-2 hover:underline"
              >
                Membership from ₹199/month
              </Link>
            </p>
          </div>
        </div>

        {/* ── Main nav row ── */}
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="shrink-0 flex items-center">
              <Image
                src="/Horizontal_Logo.png"
                alt="Asmit Rajaramkar Books"
                width={150}
                height={38}
                className="h-[28px] sm:h-[30px] w-auto"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <nav
              className="hidden lg:flex items-center justify-center gap-0.5"
              aria-label="Main navigation"
            >
              {navLinks.map((l) => {
                const active = isActive(l.href);
                return (
                  <Link
                    key={l.label}
                    href={l.href}
                    className={`relative px-3.5 py-2 font-body text-[13px] font-medium tracking-[0.01em]
                      transition-colors duration-150 select-none
                      ${active
                        ? "text-[#1a1a1a]"
                        : "text-[#666] hover:text-[#1a1a1a]"
                      }`}
                  >
                    {l.label}
                    <span
                      className={`absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#1a1a1a]
                        transition-opacity duration-150
                        ${active ? "opacity-100" : "opacity-0"}`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1">

              {/* Inline search pill (desktop) */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search books"
                className="hidden sm:flex items-center gap-2.5 h-9 pl-3 pr-2.5
                  bg-[#f5f4f2] border border-[#e8e6e1] rounded-full
                  hover:border-[#d0cdc8] hover:bg-[#f0eeec] transition-colors group"
              >
                <Search size={15} strokeWidth={2} className="text-[#999] group-hover:text-[#666] transition-colors" />
                <span className="font-body text-[12px] text-[#aaa] select-none">Search books…</span>
              </button>

              {/* Mobile search icon */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="sm:hidden p-2 text-[#666] hover:text-[#1a1a1a] transition-colors"
              >
                <Search size={19} strokeWidth={1.7} />
              </button>

              {/* Like / Wishlist */}
              <Link
                href="/account/library"
                aria-label="Wishlist"
                className="relative p-2 text-[#666] hover:text-[#1a1a1a] transition-colors"
              >
                <Heart size={18} strokeWidth={1.7} />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                aria-label={`Cart${count > 0 ? ` — ${count} item${count !== 1 ? "s" : ""}` : ""}`}
                className="relative p-2 text-[#666] hover:text-[#1a1a1a] transition-colors"
              >
                <ShoppingCart size={18} strokeWidth={1.7} />
                {count > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-[#1a1a1a] text-white
                      text-[9px] font-semibold rounded-full flex items-center justify-center px-1 leading-none"
                  >
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </Link>

              {/* Divider */}
              <span className="hidden md:block w-px h-5 bg-[#e0ddd8] mx-1" />

              {/* Account (desktop) */}
              <div className="relative hidden md:block" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen(v => !v)}
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-full border transition-colors
                    ${accountOpen
                      ? "border-[#d0cdc8] bg-[#f5f4f2] text-[#1a1a1a]"
                      : "border-[#e8e6e1] hover:border-[#d0cdc8] hover:bg-[#f5f4f2] text-[#666] hover:text-[#1a1a1a]"
                    }`}
                >
                  {user ? (
                    <div className="w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
                      <span className="font-body text-[10px] font-semibold text-white leading-none">
                        {initials}
                      </span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#f0eeec] border border-[#e8e6e1] flex items-center justify-center shrink-0">
                      <User size={14} strokeWidth={1.8} />
                    </div>
                  )}
                  <ChevronDown
                    size={13}
                    strokeWidth={2.2}
                    className={`text-[#aaa] transition-transform duration-200
                      ${accountOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                {accountOpen && (
                  <div
                    className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-[#e8e6e1]
                      rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.10)] py-1.5 z-50
                      animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150"
                  >
                    {user ? (
                      <>
                        {/* Identity header */}
                        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#f0eee9]">
                          <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
                            <span className="font-body text-[13px] font-semibold text-white">{initials}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-body text-[13px] font-medium text-[#1a1a1a] truncate leading-tight">
                              {user.displayName ?? user.email?.split("@")[0]}
                            </p>
                            <p className="font-body text-[10.5px] text-[#999] truncate mt-0.5">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="pt-1 pb-1">
                          {role === "admin" ? (
                            <DropItem href="/admin/dashboard" icon={<LayoutDashboard size={15} />} onClick={() => setAccountOpen(false)}>
                              Admin Dashboard
                            </DropItem>
                          ) : (
                            <>
                              <DropItem href="/account/dashboard"          icon={<User size={15} />}      onClick={() => setAccountOpen(false)}>My Account</DropItem>
                              <DropItem href="/account/membership"         icon={<Tag size={15} />}       onClick={() => setAccountOpen(false)}>My Membership</DropItem>
                              <DropItem href="/account/membership/library" icon={<Library size={15} />}   onClick={() => setAccountOpen(false)}>Member Library</DropItem>
                              <DropItem href="/account/library"            icon={<BookOpen size={15} />}  onClick={() => setAccountOpen(false)}>Purchased Books</DropItem>
                              <DropItem href="/account/orders"             icon={<Package size={15} />}   onClick={() => setAccountOpen(false)}>My Orders</DropItem>
                            </>
                          )}
                        </div>

                        <div className="border-t border-[#f0eee9] pt-1 pb-1">
                          <button
                            onClick={() => { signOut(); setAccountOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px]
                              font-body text-[#999] hover:text-[#1a1a1a] hover:bg-[#f7f6f4] transition-colors rounded-lg mx-1"
                          >
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="px-3.5 py-3 flex flex-col gap-2">
                        <Link
                          href="/login"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center justify-center gap-2 text-[12.5px] font-body font-medium
                            bg-[#1a1a1a] text-white px-4 py-2.5 rounded-lg hover:bg-[#333] transition-colors"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center justify-center gap-1.5 text-[12px] font-body
                            text-[#666] hover:text-[#1a1a1a] transition-colors py-1.5"
                        >
                          Create account <ArrowRight size={11} />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                className="lg:hidden p-2 text-[#666] hover:text-[#1a1a1a] transition-colors"
                onClick={() => setMobileOpen(v => !v)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen
                  ? <X size={20} strokeWidth={1.7} />
                  : <Menu size={20} strokeWidth={1.7} />
                }
              </button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            MOBILE DROPDOWN PANEL
        ════════════════════════════════════════════════════ */}
        {mobileOpen && (
          <div
            className="lg:hidden absolute left-0 right-0 top-full bg-white border-b border-[#e8e6e1]
              shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-40
              animate-in fade-in slide-in-from-top-2 duration-200
              max-h-[calc(100dvh-4rem)] overflow-y-auto"
          >
            <div className="max-w-[1200px] mx-auto px-5 py-4 flex flex-col gap-5">

              {/* User / Auth */}
              {user ? (
                <div className="flex items-center gap-3 pb-4 border-b border-[#f0eee9]">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
                    <span className="font-body text-[14px] font-semibold text-white">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-[14px] font-medium text-[#1a1a1a] truncate leading-snug">
                      {user.displayName ?? user.email?.split("@")[0]}
                    </p>
                    <p className="font-body text-[11px] text-[#999] truncate mt-0.5">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2.5 pb-4 border-b border-[#f0eee9]">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 flex items-center justify-center py-2.5 rounded-lg
                      bg-[#1a1a1a] text-white font-body text-[12px] font-medium
                      hover:bg-[#333] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 flex items-center justify-center py-2.5 rounded-lg
                      border border-[#e0ddd8] text-[#666] font-body text-[12px] font-medium
                      hover:text-[#1a1a1a] hover:border-[#ccc] transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Search */}
              <button
                onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg
                  bg-[#f7f6f4] border border-[#e8e6e1]
                  hover:border-[#d0cdc8] transition-colors"
              >
                <Search size={16} strokeWidth={1.7} className="shrink-0 text-[#999]" />
                <span className="flex-1 text-left font-body text-[13px] text-[#999]">Search books…</span>
              </button>

              {/* Navigation */}
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.15em] text-[#bbb] mb-2 font-medium">
                  Menu
                </p>
                <nav className="flex flex-col" aria-label="Mobile navigation">
                  {navLinks.map((l) => {
                    const active = isActive(l.href);
                    return (
                      <Link
                        key={l.label}
                        href={l.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-3 rounded-lg font-body
                          text-[14px] font-medium transition-colors
                          ${active
                            ? "bg-[#f7f6f4] text-[#1a1a1a]"
                            : "text-[#666] hover:text-[#1a1a1a] hover:bg-[#fafafa]"
                          }`}
                      >
                        {l.label}
                        <ArrowRight size={13} className="text-[#ccc]" />
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Quick links */}
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.15em] text-[#bbb] mb-2 font-medium">
                  Quick Links
                </p>
                <nav className="flex flex-col gap-0.5">
                  <Link
                    href="/cart"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-3.5 py-3 rounded-lg font-body
                      text-[14px] font-medium text-[#666] hover:text-[#1a1a1a] hover:bg-[#fafafa] transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingCart size={16} strokeWidth={1.7} />
                      Cart
                    </span>
                    {count > 0 && (
                      <span className="text-[10px] font-semibold text-white bg-[#1a1a1a] rounded-full px-1.5 py-0.5 leading-none">
                        {count > 9 ? "9+" : count}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/account/library"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-lg font-body
                      text-[14px] font-medium text-[#666] hover:text-[#1a1a1a] hover:bg-[#fafafa] transition-colors"
                  >
                    <Heart size={16} strokeWidth={1.7} />
                    Wishlist
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-lg font-body
                      text-[14px] font-medium text-[#666] hover:text-[#1a1a1a] hover:bg-[#fafafa] transition-colors"
                  >
                    <Package size={16} strokeWidth={1.7} />
                    Orders
                  </Link>
                </nav>
              </div>

              {/* Account links */}
              {user && (
                <div className="pb-2">
                  <p className="font-body text-[10px] uppercase tracking-[0.15em] text-[#bbb] mb-2 font-medium">
                    My Account
                  </p>
                  <nav className="flex flex-col gap-0.5 rounded-lg border border-[#f0eee9] overflow-hidden">
                    {role === "admin" ? (
                      <MobileAccountItem href="/admin/dashboard" icon={<LayoutDashboard size={15} />} onClick={() => setMobileOpen(false)}>
                        Admin Dashboard
                      </MobileAccountItem>
                    ) : (
                      <>
                        <MobileAccountItem href="/account/dashboard"          icon={<User size={15} />}      onClick={() => setMobileOpen(false)}>My Profile</MobileAccountItem>
                        <MobileAccountItem href="/account/membership"         icon={<Tag size={15} />}       onClick={() => setMobileOpen(false)}>Membership</MobileAccountItem>
                        <MobileAccountItem href="/account/membership/library" icon={<Library size={15} />}   onClick={() => setMobileOpen(false)}>Member Library</MobileAccountItem>
                        <MobileAccountItem href="/account/library"            icon={<BookOpen size={15} />}  onClick={() => setMobileOpen(false)}>Purchased Books</MobileAccountItem>
                        <MobileAccountItem href="/account/orders"             icon={<Package size={15} />}   onClick={() => setMobileOpen(false)}>My Orders</MobileAccountItem>
                      </>
                    )}
                  </nav>
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3.5 py-3 mt-2 rounded-lg font-body
                      text-[13px] text-[#999] hover:text-[#1a1a1a] hover:bg-[#fafafa] transition-colors"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */

function DropItem({
  href, icon, onClick, children,
}: {
  href: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-[12.5px] font-body text-[#444]
        hover:bg-[#f7f6f4] hover:text-[#1a1a1a] transition-colors rounded-lg mx-1"
    >
      <span className="text-[#bbb] shrink-0">{icon}</span>
      {children}
    </Link>
  );
}

function MobileAccountItem({
  href, icon, onClick, children,
}: {
  href: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3.5 px-3.5 py-3 font-body text-[13.5px]
        text-[#666] border-b border-[#f0eee9] last:border-b-0 hover:text-[#1a1a1a] hover:bg-[#fafafa]
        transition-colors"
    >
      <span className="text-[#999] shrink-0">{icon}</span>
      <span className="flex-1">{children}</span>
      <ArrowRight size={12} className="text-[#ddd] shrink-0" />
    </Link>
  );
}
