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
  Sparkles,
  Heart,
  ArrowRight,
  Package,
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
  const accountRef = useRef<HTMLDivElement>(null);

  /* ── Scroll shadow ── */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* ── Fetch role ── */
  useEffect(() => {
    if (!user) { setRole(null); return; }
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => setRole(d.role ?? null))
      .catch(() => setRole(null));
  }, [user?.uid]);

  /* ── Close menus on route change ── */
  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  /* ── Click-outside for account dropdown ── */
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

  /* ── Cmd/Ctrl + K ── */
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

  /* ── Body scroll lock when drawer open ── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href.split("?")[0].split("#")[0]);

  const initials = (user?.displayName ?? user?.email ?? "U")[0].toUpperCase();

  return (
    <>
      {/* ════════════════════════════════════════════════════
          HEADER
      ════════════════════════════════════════════════════ */}
      <header
        className={`sticky top-0 z-50 bg-[#FFFCF7] transition-all duration-300
          ${scrolled
            ? "shadow-[0_4px_24px_rgba(32,58,43,0.10)] border-b border-transparent"
            : "border-b border-[#EAE8E3]"
          }`}
      >
        {/* ── Announcement bar ── */}
        <div className="bg-[#1C3325]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-center gap-2">
            <Sparkles size={8} className="text-[#C6A66B] shrink-0 fill-[#C6A66B]" />
            <p className="font-body text-[10px] tracking-[0.13em] text-[#FFFCF7]/80 text-center">
              <span className="hidden sm:inline">Instant digital downloads · No shipping, ever · </span>
              <Link
                href="/membership"
                className="text-[#C6A66B] font-semibold hover:text-[#d4b67c] transition-colors underline-offset-2 hover:underline"
              >
                Membership from ₹199/month
              </Link>
            </p>
          </div>
        </div>

        {/* ── Main nav row ── */}
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-8">
          <div className="flex items-center justify-between h-[64px] lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-4">

            {/* Logo */}
            <Link href="/" className="shrink-0 flex items-center">
              <Image
                src="/Horizontal_Logo.png"
                alt="Asmit Rajaramkar Books"
                width={160}
                height={40}
                className="h-[30px] sm:h-[34px] w-auto"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <nav
              className="hidden lg:flex items-center justify-center gap-1"
              aria-label="Main navigation"
            >
              {navLinks.map((l) => {
                const active = isActive(l.href);
                return (
                  <Link
                    key={l.label}
                    href={l.href}
                    className={`relative px-4 py-2 font-body text-[12.5px] font-semibold tracking-[0.04em]
                      rounded-md transition-all duration-150 group select-none
                      ${active
                        ? "text-[#203A2B] bg-[#F0EDE8]"
                        : "text-[#5a5a5a] hover:text-[#203A2B] hover:bg-[#F5EFE6]"
                      }`}
                  >
                    {l.label}
                    {/* Active indicator dot */}
                    <span
                      className={`absolute bottom-[6px] left-1/2 -translate-x-1/2 rounded-full bg-[#C6A66B]
                        transition-all duration-200
                        ${active ? "w-1 h-1 opacity-100" : "w-0 h-0 opacity-0 group-hover:w-1 group-hover:h-1 group-hover:opacity-60"}`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-1.5">

              {/* Search — hidden on mobile (in drawer), shown sm+ */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="hidden sm:flex p-2.5 items-center gap-2 text-[#5a5a5a] hover:text-[#203A2B]
                  hover:bg-[#F5EFE6] rounded-md transition-colors group"
              >
                <Search size={17} strokeWidth={1.8} />
                <span className="hidden xl:flex items-center gap-1.5 font-body text-[11px] text-[#A8B5A0]
                  group-hover:text-[#A8B5A0] transition-colors">
                  <kbd className="bg-[#EDE9E3] text-[#888] px-1.5 py-0.5 rounded text-[9px] font-mono leading-none">
                    ⌘K
                  </kbd>
                </span>
              </button>

              {/* Wishlist / Liked — hidden on mobile (in drawer), shown sm+ */}
              <Link
                href="/account/library"
                aria-label="Wishlist"
                className="hidden sm:flex p-2.5 text-[#5a5a5a] hover:text-[#C6A66B] hover:bg-[#FDF7EC] rounded-md transition-colors"
              >
                <Heart size={17} strokeWidth={1.8} />
              </Link>

              {/* Account dropdown (desktop) */}
              <div className="relative hidden md:block" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen(v => !v)}
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-md transition-colors
                    ${accountOpen
                      ? "text-[#203A2B] bg-[#EBE7E1]"
                      : "text-[#5a5a5a] hover:text-[#203A2B] hover:bg-[#F5EFE6]"
                    }`}
                >
                  {user ? (
                    <div className="w-[26px] h-[26px] rounded-full bg-[#203A2B] flex items-center justify-center shrink-0 ring-2 ring-[#C6A66B]/30">
                      <span className="font-body text-[10px] font-bold text-[#FFFCF7] leading-none">
                        {initials}
                      </span>
                    </div>
                  ) : (
                    <User size={17} strokeWidth={1.8} />
                  )}
                  <ChevronDown
                    size={11}
                    strokeWidth={2.2}
                    className={`text-[#A8B5A0] transition-transform duration-200
                      ${accountOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown panel */}
                {accountOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-60 bg-[#FFFCF7] border border-[#E6DFD5]
                      rounded-xl shadow-[0_12px_40px_rgba(32,58,43,0.14)] py-2 z-50
                      animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150"
                  >
                    {user ? (
                      <>
                        {/* Identity header */}
                        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#EDEBE6]">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#203A2B] to-[#315B55]
                            flex items-center justify-center shrink-0 ring-2 ring-[#C6A66B]/20">
                            <span className="font-body text-[12px] font-bold text-[#FFFCF7]">{initials}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-body text-[12.5px] font-semibold text-[#1a1a1a] truncate leading-tight">
                              {user.displayName ?? user.email?.split("@")[0]}
                            </p>
                            <p className="font-body text-[10.5px] text-[#A8B5A0] truncate mt-0.5">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="pt-1.5 pb-1">
                          {role === "admin" ? (
                            <DropItem
                              href="/admin/dashboard"
                              icon={<LayoutDashboard size={13} />}
                              onClick={() => setAccountOpen(false)}
                            >
                              Admin Dashboard
                            </DropItem>
                          ) : (
                            <>
                              <DropItem href="/account/dashboard"          icon={<User size={13} />}         onClick={() => setAccountOpen(false)}>My Account</DropItem>
                              <DropItem href="/account/membership"         icon={<Tag size={13} />}          onClick={() => setAccountOpen(false)}>My Membership</DropItem>
                              <DropItem href="/account/membership/library" icon={<Library size={13} />}      onClick={() => setAccountOpen(false)}>Member Library</DropItem>
                              <DropItem href="/account/library"            icon={<BookOpen size={13} />}     onClick={() => setAccountOpen(false)}>Purchased Books</DropItem>
                              <DropItem href="/account/orders"             icon={<Package size={13} />}      onClick={() => setAccountOpen(false)}>My Orders</DropItem>
                            </>
                          )}
                        </div>

                        <div className="border-t border-[#EDEBE6] pt-1 pb-1">
                          <button
                            onClick={() => { signOut(); setAccountOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px]
                              font-body text-[#E05252] hover:bg-[#FEF2F2] hover:text-[#c94040] transition-colors rounded-md mx-0"
                          >
                            <LogOut size={13} />
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="px-3 py-3 flex flex-col gap-2">
                        <Link
                          href="/login"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center justify-center gap-2 text-[11.5px] font-body font-bold
                            uppercase tracking-[0.1em] bg-[#203A2B] text-[#FFFCF7] px-4 py-2.5
                            hover:bg-[#2c5040] transition-colors rounded-lg"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center justify-center gap-1.5 text-[11.5px] font-body
                            font-medium text-[#555] hover:text-[#203A2B] transition-colors py-1.5"
                        >
                          Create account <ArrowRight size={11} />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                aria-label={`Cart${count > 0 ? ` — ${count} item${count !== 1 ? "s" : ""}` : ""}`}
                className="relative p-2.5 text-[#5a5a5a] hover:text-[#203A2B] hover:bg-[#F5EFE6] rounded-md transition-colors"
              >
                <ShoppingCart size={18} strokeWidth={1.8} />
                {count > 0 && (
                  <span
                    className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#C6A66B] text-[#1a1a1a]
                      text-[8px] font-black rounded-full flex items-center justify-center px-0.5 leading-none"
                  >
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </Link>

              {/* Divider */}
              <span className="hidden lg:block w-px h-5 bg-[#E6DFD5] mx-1" />

              {/* Mobile — search icon */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="sm:hidden p-2.5 text-[#5a5a5a] hover:text-[#203A2B] hover:bg-[#F5EFE6] rounded-md transition-colors"
              >
                <Search size={18} strokeWidth={1.8} />
              </button>

              {/* Separator before hamburger on mobile/tablet */}
              <span className="lg:hidden w-px h-5 bg-[#E6DFD5] mx-1" />

              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2.5 text-[#5a5a5a] hover:text-[#203A2B] hover:bg-[#F5EFE6] rounded-md transition-colors"
                onClick={() => setMobileOpen(v => !v)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen
                  ? <X size={20} strokeWidth={1.8} />
                  : <Menu size={20} strokeWidth={1.8} />
                }
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════
          MOBILE DRAWER — full-height slide-in from right
      ════════════════════════════════════════════════════ */}

      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] bg-[#0D1F14]/60 backdrop-blur-[3px]
          transition-opacity duration-300
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`lg:hidden fixed top-0 right-0 z-[70] h-dvh w-[min(300px,88vw)]
          bg-[#FFFCF7] flex flex-col
          shadow-[-12px_0_50px_rgba(10,26,16,0.22)]
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform
          ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
      >

        {/* ── TOP: Branded header ───────────────────────────── */}
        <div className="relative shrink-0 bg-[#1C3325] px-5 pt-5 pb-6 overflow-hidden">
          {/* subtle radial glow */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-[#C6A66B]/10 blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between mb-5">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <Image
                src="/Horizontal_Logo.png"
                alt="Asmit Rajaramkar Books"
                width={130}
                height={32}
                className="h-[26px] w-auto brightness-0 invert"
              />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} strokeWidth={1.8} />
            </button>
          </div>

          {/* User identity card (logged in) OR guest CTA */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C6A66B] to-[#a8894d]
                flex items-center justify-center shrink-0 ring-2 ring-white/20">
                <span className="font-body text-[14px] font-bold text-[#1C3325] leading-none">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="font-body text-[13px] font-semibold text-white truncate leading-snug">
                  {user.displayName ?? user.email?.split("@")[0]}
                </p>
                <p className="font-body text-[10.5px] text-white/50 truncate mt-0.5">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 flex items-center justify-center py-2.5 rounded-lg
                  bg-[#C6A66B] text-[#1C3325] font-body font-bold text-[11.5px]
                  uppercase tracking-[0.1em] hover:bg-[#d4b67c] active:scale-95 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 flex items-center justify-center py-2.5 rounded-lg
                  border border-white/20 text-white font-body font-bold text-[11.5px]
                  uppercase tracking-[0.1em] hover:bg-white/10 active:scale-95 transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* ── MIDDLE: Scrollable content ───────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* ── Search ── */}
          <div className="px-5 pt-5 pb-1">
            <button
              onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl
                bg-[#F3EFE8] border border-[#E6DFD5] group
                hover:border-[#C6A66B]/60 hover:bg-[#EDE6DA] transition-all active:scale-[0.98]"
            >
              <Search size={16} strokeWidth={1.8} className="shrink-0 text-[#A8B5A0] group-hover:text-[#C6A66B] transition-colors" />
              <span className="flex-1 text-left font-body text-[13.5px] text-[#A0A09A]">Search books…</span>
              <kbd className="font-mono text-[9px] text-[#C8C3BC] bg-white border border-[#E6DFD5] px-1.5 py-1 rounded-md leading-none">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* ── Navigation ── */}
          <div className="px-5 pt-6 pb-1">
            <p className="font-body text-[9.5px] uppercase tracking-[0.2em] text-[#C0BAB2] mb-3 font-medium">
              Explore
            </p>
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {navLinks.map((l) => {
                const active = isActive(l.href);
                return (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-body
                      text-[14.5px] font-semibold transition-all duration-150 active:scale-[0.98]
                      ${active
                        ? "bg-[#203A2B] text-[#FFFCF7] shadow-sm"
                        : "text-[#2a2a2a] hover:bg-[#F0EDE8] hover:text-[#203A2B]"
                      }`}
                  >
                    {/* Left accent bar */}
                    <span className={`w-[3px] h-[18px] rounded-full shrink-0 transition-colors
                      ${active ? "bg-[#C6A66B]" : "bg-[#E6DFD5]"}`}
                    />
                    <span className="flex-1">{l.label}</span>
                    <ArrowRight
                      size={14}
                      strokeWidth={2}
                      className={`shrink-0 transition-colors ${active ? "text-[#C6A66B]" : "text-[#CCC7C0]"}`}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ── Quick Access ── */}
          <div className="px-5 pt-6 pb-1">
            <p className="font-body text-[9.5px] uppercase tracking-[0.2em] text-[#C0BAB2] mb-3 font-medium">
              Quick Access
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* Cart tile */}
              <Link
                href="/cart"
                onClick={() => setMobileOpen(false)}
                className="relative flex flex-col items-center gap-2 py-5 rounded-2xl
                  bg-[#F3EFE8] border border-[#E6DFD5]
                  hover:bg-[#EBE4D8] hover:border-[#C6A66B]/40 active:scale-95
                  transition-all duration-150 group"
              >
                <ShoppingCart size={22} strokeWidth={1.6} className="text-[#203A2B]" />
                <span className="font-body text-[12.5px] font-semibold text-[#333]">Cart</span>
                {count > 0 && (
                  <span className="absolute top-3 right-3 min-w-[18px] h-[18px] bg-[#C6A66B]
                    text-[#1C3325] text-[8.5px] font-black rounded-full flex items-center
                    justify-center px-1 leading-none">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </Link>

              {/* Wishlist tile */}
              <Link
                href="/account/library"
                onClick={() => setMobileOpen(false)}
                className="flex flex-col items-center gap-2 py-5 rounded-2xl
                  bg-[#F3EFE8] border border-[#E6DFD5]
                  hover:bg-[#EBE4D8] hover:border-[#C6A66B]/40 active:scale-95
                  transition-all duration-150 group"
              >
                <Heart size={22} strokeWidth={1.6}
                  className="text-[#203A2B] group-hover:text-[#C6A66B] transition-colors" />
                <span className="font-body text-[12.5px] font-semibold text-[#333]">Wishlist</span>
              </Link>
            </div>
          </div>

          {/* ── Account links (logged-in only) ── */}
          {user && (
            <div className="px-5 pt-6 pb-1">
              <p className="font-body text-[9.5px] uppercase tracking-[0.2em] text-[#C0BAB2] mb-3 font-medium">
                My Account
              </p>
              <div className="rounded-2xl border border-[#EAE8E3] overflow-hidden divide-y divide-[#EAE8E3]">
                {role === "admin" ? (
                  <DrawerAccountItem href="/admin/dashboard" icon={<LayoutDashboard size={16} />} onClick={() => setMobileOpen(false)}>
                    Admin Dashboard
                  </DrawerAccountItem>
                ) : (
                  <>
                    <DrawerAccountItem href="/account/dashboard"          icon={<User size={16} />}         onClick={() => setMobileOpen(false)}>My Profile</DrawerAccountItem>
                    <DrawerAccountItem href="/account/membership"         icon={<Tag size={16} />}          onClick={() => setMobileOpen(false)}>Membership</DrawerAccountItem>
                    <DrawerAccountItem href="/account/membership/library" icon={<Library size={16} />}      onClick={() => setMobileOpen(false)}>Member Library</DrawerAccountItem>
                    <DrawerAccountItem href="/account/library"            icon={<BookOpen size={16} />}     onClick={() => setMobileOpen(false)}>Purchased Books</DrawerAccountItem>
                    <DrawerAccountItem href="/account/orders"             icon={<Package size={16} />}      onClick={() => setMobileOpen(false)}>My Orders</DrawerAccountItem>
                  </>
                )}
              </div>
              <button
                onClick={() => { signOut(); setMobileOpen(false); }}
                className="w-full flex items-center gap-3.5 px-4 py-4 mt-3 rounded-2xl font-body
                  text-[13.5px] font-medium text-[#E05252] bg-[#FEF4F4] border border-[#FCDCDC]
                  hover:bg-[#FDE8E8] active:scale-[0.98] transition-all"
              >
                <LogOut size={15} className="shrink-0" />
                Sign Out
              </button>
            </div>
          )}

          {/* Safe-area bottom padding */}
          <div className="h-6" />
        </div>

        {/* ── BOTTOM: Footer ───────────────────────────────── */}
        <div className="shrink-0 border-t border-[#EAE8E3] px-5 py-4 bg-[#F8F5F0]">
          <p className="font-body text-[10.5px] text-[#C0BAB2] text-center tracking-wide">
            © {new Date().getFullYear()} Asmit Rajaramkar Books
          </p>
        </div>
      </aside>

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
        hover:bg-[#F5EFE6] hover:text-[#203A2B] transition-colors rounded-md mx-1"
    >
      <span className="text-[#B8B3AB] shrink-0">{icon}</span>
      {children}
    </Link>
  );
}

function DrawerAccountItem({
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
      className="flex items-center gap-4 px-4 py-4 font-body text-[13.5px]
        text-[#3a3a3a] bg-white hover:bg-[#F5EFE6] hover:text-[#203A2B]
        transition-colors active:bg-[#EBE6DD]"
    >
      <span className="text-[#A8B5A0] shrink-0">{icon}</span>
      <span className="flex-1">{children}</span>
      <ArrowRight size={13} className="text-[#D0CBC2] shrink-0" />
    </Link>
  );
}
