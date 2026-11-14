"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  ShoppingCart, Search, Menu, X, User, ChevronDown,
  BookOpen, Library, LogOut, LayoutDashboard, Tag,
  ArrowRight, Package, Heart, Home, Layers, Grid3x3,
  Crown, Percent, FileText,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { SearchModal } from "@/components/shared/SearchModal";

const navLinks = [
  { label: "Home",       href: "/",          icon: Home     },
  { label: "Books",      href: "/books",      icon: BookOpen },
  { label: "Series",     href: "/series",     icon: Layers   },
  { label: "Categories", href: "/categories", icon: Grid3x3  },
  { label: "Membership", href: "/membership", icon: Crown    },
  { label: "Offers",     href: "/#offers",    icon: Percent, noActive: true },
  { label: "Blog",       href: "/articles",   icon: FileText },
];

export function SiteHeader() {
  const { count }         = useCart();
  const { user, signOut } = useAuth();
  const pathname          = usePathname();

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [role,        setRole]        = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("ar_role") : null
  );
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (!user) { setRole(null); localStorage.removeItem("ar_role"); return; }
    const controller = new AbortController();
    fetch("/api/auth/me", { signal: controller.signal })
      .then(r => r.json())
      .then(d => {
        const r = d.role ?? null;
        setRole(r);
        if (r) localStorage.setItem("ar_role", r);
        else localStorage.removeItem("ar_role");
      })
      .catch(() => {});
    return () => controller.abort();
  }, [user?.uid]);

  useEffect(() => { setMobileOpen(false); setAccountOpen(false); }, [pathname]);

  useEffect(() => {
    if (!accountOpen) return;
    const fn = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [accountOpen]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMobileOpen(false); setSearchOpen(false); }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0].split("#")[0]);

  const initials = (user?.displayName ?? user?.email ?? "U")[0].toUpperCase();

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white transition-all duration-200
          ${scrolled ? "shadow-[0_1px_0_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)]" : "border-b border-[#ECEAE5]"}`}
      >
        {/* Announcement bar */}
        <div className="bg-[#0D1F17]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-center">
            <p className="font-body text-[10.5px] tracking-[0.06em] text-white/40 text-center">
              <span className="hidden sm:inline">Instant digital downloads · No shipping · </span>
              <Link href="/membership" className="text-[#FFC928] font-semibold hover:text-[#FFD54F] transition-colors">
                Membership from ₹199/month
              </Link>
            </p>
          </div>
        </div>

        {/* ── Mobile / tablet top bar (< lg) ───────────────────────── */}
        <div className="lg:hidden relative flex items-center justify-between h-[56px] px-3 sm:px-5">
          {/* Left: hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-[#555] hover:text-[#111] hover:bg-[#F2F0EC] transition-all"
          >
            <Menu size={20} strokeWidth={1.8} />
          </button>

          {/* Center: logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image src="/Horizontal_Logo.png" alt="AR Books" width={130} height={32}
              className="h-[24px] w-auto" sizes="130px" priority />
          </Link>

          {/* Right: search + cart + avatar */}
          <div className="flex items-center gap-0.5">
            <button onClick={() => setSearchOpen(true)} aria-label="Search"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-[#555] hover:text-[#111] hover:bg-[#F2F0EC] transition-all">
              <Search size={18} strokeWidth={1.8} />
            </button>
            <Link href="/cart"
              aria-label={`Cart${count > 0 ? ` — ${count} item${count !== 1 ? "s" : ""}` : ""}`}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-[#555] hover:text-[#111] hover:bg-[#F2F0EC] transition-all">
              <ShoppingCart size={18} strokeWidth={1.8} />
              {count > 0 && (
                <span className="absolute top-1 right-1 min-w-[15px] h-[15px] bg-[#0D1F17] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
            {user ? (
              <button onClick={() => setMobileOpen(true)} aria-label="Account"
                className="w-9 h-9 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-[#203A2B] flex items-center justify-center ring-2 ring-[#E8E4DF]">
                  <span className="font-body text-[10px] font-bold text-[#FFC928] leading-none">{initials}</span>
                </div>
              </button>
            ) : (
              <Link href="/login"
                className="ml-1 h-8 px-3.5 flex items-center rounded-lg bg-[#0D1F17] text-white font-body text-[11.5px] font-semibold hover:bg-[#203A2B] transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* ── Desktop nav bar (lg+) ─────────────────────────────────── */}
        <div className="hidden lg:block max-w-[1200px] mx-auto px-8">
          <div className="flex items-center justify-between h-[60px]">

            {/* Logo */}
            <Link href="/" className="shrink-0 flex items-center">
              <Image src="/Horizontal_Logo.png" alt="Asmit Rajaramkar Books" width={150} height={38}
                className="h-[28px] w-auto" sizes="150px" priority />
            </Link>

            {/* Nav links */}
            <nav className="flex items-center gap-0.5" aria-label="Main navigation">
              {navLinks.map((l) => {
                const active = !l.noActive && isActive(l.href);
                return (
                  <Link key={l.label} href={l.href}
                    className={`relative px-3.5 py-2 font-body text-[13px] font-medium transition-colors duration-150
                      ${active ? "text-[#111]" : "text-[#777] hover:text-[#111]"}`}>
                    {l.label}
                    {active && <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#111] rounded-full" />}
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-0.5">
              <button onClick={() => setSearchOpen(true)} aria-label="Search books"
                className="flex items-center gap-2 h-8 pl-3 pr-2.5 bg-[#F5F4F1] border border-[#E8E6E1] rounded-full hover:border-[#D0CEC9] hover:bg-[#EEECEA] transition-colors group">
                <Search size={13} strokeWidth={2} className="text-[#AAA] group-hover:text-[#666] transition-colors" />
                <span className="font-body text-[11.5px] text-[#BBB] select-none">Search…</span>
              </button>

              <Link href="/account/library" aria-label="Library"
                className="p-2 text-[#777] hover:text-[#111] transition-colors">
                <Heart size={17} strokeWidth={1.8} />
              </Link>

              <Link href="/cart"
                aria-label={`Cart${count > 0 ? ` — ${count} item${count !== 1 ? "s" : ""}` : ""}`}
                className="relative p-2 text-[#777] hover:text-[#111] transition-colors">
                <ShoppingCart size={17} strokeWidth={1.8} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] bg-[#0D1F17] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </Link>

              <span className="w-px h-4 bg-[#E0DDD8] mx-1" />

              {/* Account dropdown */}
              <div className="relative" ref={accountRef}>
                <button onClick={() => setAccountOpen(v => !v)} aria-label="Account menu"
                  aria-expanded={accountOpen} aria-haspopup="true"
                  className={`flex items-center gap-1.5 h-8 pl-1 pr-2.5 rounded-full transition-all duration-150
                    ${accountOpen ? "bg-[#0D1F17]" : "hover:bg-[#F2F0EC]"}`}>
                  {user ? (
                    <div className="w-6 h-6 rounded-full bg-[#203A2B] flex items-center justify-center shrink-0 ring-2 ring-white">
                      <span className="font-body text-[10px] font-bold text-[#FFC928] leading-none">{initials}</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#F2F0EC] flex items-center justify-center shrink-0">
                      <User size={13} strokeWidth={1.8} className="text-[#888]" />
                    </div>
                  )}
                  <ChevronDown size={11} strokeWidth={2.5}
                    className={`transition-all duration-200 ${accountOpen ? "rotate-180 text-white" : "text-[#BBB]"}`} />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[268px] bg-white rounded-2xl
                    shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]
                    border border-[#ECEAE5] z-50 overflow-hidden
                    animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150">
                    {user ? (
                      <>
                        <div className="bg-[#0D1F17] px-4 py-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#203A2B] border-2 border-[#FFC928]/25 flex items-center justify-center shrink-0">
                            <span className="font-body text-[13px] font-bold text-[#FFC928]">{initials}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-body text-[12.5px] font-semibold text-white truncate leading-tight">
                              {user.displayName ?? user.email?.split("@")[0]}
                            </p>
                            <p className="font-body text-[11px] text-white/35 truncate mt-0.5">{user.email}</p>
                          </div>
                          {role === "admin" && (
                            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-[#FFC928] text-[#0D1F17] px-2 py-0.5 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="p-2">
                          {role === "admin" ? (
                            <DropItem href="/admin/dashboard" icon={<LayoutDashboard size={13} />} onClick={() => setAccountOpen(false)}>
                              Admin Dashboard
                            </DropItem>
                          ) : (
                            <>
                              <DropItem href="/account/dashboard"          icon={<User size={13} />}     onClick={() => setAccountOpen(false)}>My Account</DropItem>
                              <DropItem href="/account/membership"         icon={<Tag size={13} />}      onClick={() => setAccountOpen(false)}>My Membership</DropItem>
                              <DropItem href="/account/membership/library" icon={<Library size={13} />}  onClick={() => setAccountOpen(false)}>Member Library</DropItem>
                              <DropItem href="/account/library"            icon={<BookOpen size={13} />} onClick={() => setAccountOpen(false)}>Purchased Books</DropItem>
                              <DropItem href="/account/orders"             icon={<Package size={13} />}  onClick={() => setAccountOpen(false)}>My Orders</DropItem>
                            </>
                          )}
                        </div>
                        <div className="px-2 pb-2 border-t border-[#F2F0EC] pt-2">
                          <button onClick={() => { signOut(); setAccountOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-body text-[#E53935] hover:bg-red-50 transition-colors">
                            <LogOut size={13} className="shrink-0" /> Sign out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 flex flex-col gap-2">
                        <div className="px-1 py-2 text-center">
                          <p className="font-body text-[13px] font-semibold text-[#111]">Welcome to AR Books</p>
                          <p className="font-body text-[11px] text-[#999] mt-0.5">Sign in to access your library</p>
                        </div>
                        <Link href="/login" onClick={() => setAccountOpen(false)}
                          className="flex items-center justify-center gap-2 text-[13px] font-body font-semibold bg-[#0D1F17] text-white px-4 py-2.5 rounded-xl hover:bg-[#203A2B] transition-colors">
                          Sign In
                        </Link>
                        <Link href="/register" onClick={() => setAccountOpen(false)}
                          className="flex items-center justify-center gap-1.5 text-[12.5px] font-body font-medium border border-[#E8E4DF] text-[#555] px-4 py-2.5 rounded-xl hover:bg-[#F7F5F2] hover:text-[#111] transition-colors">
                          Create free account <ArrowRight size={11} />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile / tablet drawer (< lg) ────────────────────────────── */}
      <div className={`lg:hidden fixed inset-0 z-[60] transition-all duration-300 ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        {/* Backdrop */}
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
        />

        {/* Panel */}
        <div className={`absolute left-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-[#0D1F17] flex flex-col shadow-2xl transition-transform duration-300 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>

          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 h-[56px] border-b border-white/[0.07] shrink-0">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <Image src="/Horizontal_Logo.png" alt="AR Books" width={120} height={30}
                className="h-[22px] w-auto brightness-0 invert" sizes="120px" />
            </Link>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu"
              className="w-8 h-8 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
              <X size={16} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 flex flex-col gap-0.5 scrollbar-none">

            {/* User card / auth buttons */}
            {user ? (
              <div className="mx-1 mb-3 rounded-2xl bg-white/[0.06] border border-white/[0.07] px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#203A2B] border-2 border-[#FFC928]/30 flex items-center justify-center shrink-0">
                  <span className="font-body text-[13px] font-bold text-[#FFC928]">{initials}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-body text-[13px] font-semibold text-white truncate leading-snug">
                    {user.displayName ?? user.email?.split("@")[0]}
                  </p>
                  <p className="font-body text-[11px] text-white/35 truncate mt-0.5">{user.email}</p>
                </div>
                {role === "admin" && (
                  <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-[#FFC928] text-[#0D1F17] px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            ) : (
              <div className="mx-1 mb-3 flex gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-[#FFC928] text-[#0D1F17] font-body text-[12.5px] font-bold hover:opacity-90 transition-opacity">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}
                  className="flex-1 flex items-center justify-center py-2.5 rounded-xl border border-white/[0.12] text-white/70 font-body text-[12.5px] font-medium hover:bg-white/[0.06] hover:text-white transition-all">
                  Register
                </Link>
              </div>
            )}

            {/* Search */}
            <button
              onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
              className="mx-1 mb-2 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.09] transition-colors"
            >
              <Search size={14} strokeWidth={1.8} className="shrink-0 text-white/40" />
              <span className="flex-1 text-left font-body text-[13px] text-white/30">Search books…</span>
              <span className="font-body text-[10px] text-white/20 border border-white/[0.1] rounded px-1.5 py-0.5">⌘K</span>
            </button>

            {/* Browse */}
            <p className="px-4 pt-2 pb-1 font-body text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/25 select-none">Browse</p>
            {navLinks.map((l) => {
              const active = !l.noActive && isActive(l.href);
              const Icon = l.icon;
              return (
                <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl font-body text-[13.5px] font-medium transition-all ${
                    active ? "bg-white text-[#0D1F17] shadow-sm" : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                  }`}>
                  <Icon size={15} strokeWidth={active ? 2.5 : 1.8} className={active ? "text-[#0D1F17]" : "text-white/30"} />
                  <span className="flex-1">{l.label}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-[#FFC928] shrink-0" />}
                </Link>
              );
            })}

            {/* Quick access */}
            <p className="px-4 pt-4 pb-1 font-body text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/25 select-none">Quick Access</p>
            <Link href="/cart" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl font-body text-[13.5px] font-medium text-white/60 hover:bg-white/[0.06] hover:text-white transition-all">
              <ShoppingCart size={15} strokeWidth={1.8} className="text-white/30" />
              <span className="flex-1">Cart</span>
              {count > 0 && (
                <span className="text-[10px] font-bold text-[#0D1F17] bg-[#FFC928] rounded-full px-2 py-0.5 leading-none">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
            <Link href="/account/library" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl font-body text-[13.5px] font-medium text-white/60 hover:bg-white/[0.06] hover:text-white transition-all">
              <Heart size={15} strokeWidth={1.8} className="text-white/30" />
              <span className="flex-1">Wishlist</span>
            </Link>

            {/* Account links */}
            {user && (
              <>
                <p className="px-4 pt-4 pb-1 font-body text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/25 select-none">Account</p>
                {role === "admin" ? (
                  <DrawerItem href="/admin/dashboard" icon={<LayoutDashboard size={15} />} onClick={() => setMobileOpen(false)}>Admin Dashboard</DrawerItem>
                ) : (
                  <>
                    <DrawerItem href="/account/dashboard"          icon={<User size={15} />}     onClick={() => setMobileOpen(false)}>My Profile</DrawerItem>
                    <DrawerItem href="/account/membership"         icon={<Tag size={15} />}      onClick={() => setMobileOpen(false)}>Membership</DrawerItem>
                    <DrawerItem href="/account/membership/library" icon={<Library size={15} />}  onClick={() => setMobileOpen(false)}>Member Library</DrawerItem>
                    <DrawerItem href="/account/library"            icon={<BookOpen size={15} />} onClick={() => setMobileOpen(false)}>Purchased Books</DrawerItem>
                    <DrawerItem href="/account/orders"             icon={<Package size={15} />}  onClick={() => setMobileOpen(false)}>My Orders</DrawerItem>
                  </>
                )}
              </>
            )}
          </div>

          {/* Drawer footer */}
          <div className="shrink-0 border-t border-white/[0.07] p-3">
            {user ? (
              <button
                onClick={() => { signOut(); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-body text-[13px] text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={15} strokeWidth={1.8} className="shrink-0" />
                Sign Out
              </button>
            ) : (
              <p className="text-center font-body text-[11px] text-white/20 py-2">
                AR Books · Official eBook Store
              </p>
            )}
          </div>
        </div>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function DropItem({ href, icon, onClick, children }: { href: string; icon: React.ReactNode; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-body text-[#444] hover:bg-[#F7F5F2] hover:text-[#0D1F17] transition-colors group">
      <span className="w-6 h-6 rounded-lg bg-[#F2F0EC] group-hover:bg-[#E8E4DF] flex items-center justify-center shrink-0 transition-colors text-[#888] group-hover:text-[#203A2B]">
        {icon}
      </span>
      <span className="flex-1 font-medium">{children}</span>
      <ArrowRight size={10} className="text-[#D0CCC6] group-hover:text-[#203A2B] transition-colors shrink-0" />
    </Link>
  );
}

function DrawerItem({ href, icon, onClick, children }: { href: string; icon: React.ReactNode; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 rounded-2xl font-body text-[13.5px] font-medium text-white/60 hover:bg-white/[0.06] hover:text-white transition-all">
      <span className="text-white/30 shrink-0">{icon}</span>
      <span className="flex-1">{children}</span>
    </Link>
  );
}
