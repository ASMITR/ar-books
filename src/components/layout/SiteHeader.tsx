"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  ShoppingCart, Search, Menu, X, User, ChevronDown,
  BookOpen, Library, LogOut, LayoutDashboard, Tag,
  ArrowRight, Package, Heart,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { SearchModal } from "@/components/shared/SearchModal";

const navLinks = [
  { label: "Home",       href: "/"           },
  { label: "Books",      href: "/books"      },
  { label: "Categories", href: "/categories" },
  { label: "Membership", href: "/membership" },
  { label: "Offers",     href: "/#offers", noActive: true },
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
  const headerRef  = useRef<HTMLElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (!user) { setRole(null); return; }
    fetch("/api/auth/me").then(r => r.json()).then(d => setRole(d.role ?? null)).catch(() => setRole(null));
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

  useEffect(() => {
    if (!mobileOpen) return;
    const fn = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMobileOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [mobileOpen]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
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
        ref={headerRef}
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

        {/* Main nav */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[60px]">

            {/* Logo */}
            <Link href="/" className="shrink-0 flex items-center">
              <Image src="/Horizontal_Logo.png" alt="Asmit Rajaramkar Books" width={150} height={38}
                className="h-[26px] sm:h-[28px] w-auto" priority />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
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

              {/* Search pill — desktop */}
              <button onClick={() => setSearchOpen(true)} aria-label="Search books"
                className="hidden sm:flex items-center gap-2 h-8 pl-3 pr-2.5 bg-[#F5F4F1] border border-[#E8E6E1] rounded-full hover:border-[#D0CEC9] hover:bg-[#EEECEA] transition-colors group">
                <Search size={13} strokeWidth={2} className="text-[#AAA] group-hover:text-[#666] transition-colors" />
                <span className="font-body text-[11.5px] text-[#BBB] select-none">Search…</span>
              </button>

              {/* Search icon — mobile */}
              <button onClick={() => setSearchOpen(true)} aria-label="Search"
                className="sm:hidden p-2 text-[#777] hover:text-[#111] transition-colors">
                <Search size={18} strokeWidth={1.8} />
              </button>

              {/* Wishlist */}
              <Link href="/account/library" aria-label="Library"
                className="p-2 text-[#777] hover:text-[#111] transition-colors">
                <Heart size={17} strokeWidth={1.8} />
              </Link>

              {/* Cart */}
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

              <span className="hidden md:block w-px h-4 bg-[#E0DDD8] mx-1" />

              {/* Account — desktop */}
              <div className="relative hidden md:block" ref={accountRef}>
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

              {/* Mobile menu toggle */}
              <button className="lg:hidden p-2 text-[#777] hover:text-[#111] transition-colors"
                onClick={() => setMobileOpen(v => !v)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}>
                {mobileOpen ? <X size={19} strokeWidth={1.8} /> : <Menu size={19} strokeWidth={1.8} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="lg:hidden absolute left-0 right-0 top-full bg-white border-b border-[#ECEAE5]
            shadow-[0_8px_24px_rgba(0,0,0,0.07)] z-40
            animate-in fade-in slide-in-from-top-2 duration-200
            max-h-[calc(100dvh-5rem)] overflow-y-auto">
            <div className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col gap-4">

              {/* Auth */}
              {user ? (
                <div className="flex items-center gap-3 pb-4 border-b border-[#F0EEE9]">
                  <div className="w-9 h-9 rounded-full bg-[#0D1F17] flex items-center justify-center shrink-0">
                    <span className="font-body text-[13px] font-bold text-[#FFC928]">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-[13.5px] font-semibold text-[#111] truncate leading-snug">
                      {user.displayName ?? user.email?.split("@")[0]}
                    </p>
                    <p className="font-body text-[11px] text-[#999] truncate mt-0.5">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2.5 pb-4 border-b border-[#F0EEE9]">
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-[#0D1F17] text-white font-body text-[12.5px] font-semibold hover:bg-[#203A2B] transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}
                    className="flex-1 flex items-center justify-center py-2.5 rounded-xl border border-[#E8E6E1] text-[#666] font-body text-[12.5px] font-semibold hover:text-[#111] hover:border-[#CCC] transition-colors">
                    Register
                  </Link>
                </div>
              )}

              {/* Search */}
              <button onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-[#F5F4F1] border border-[#E8E6E1] hover:border-[#D0CEC9] transition-colors">
                <Search size={15} strokeWidth={1.8} className="shrink-0 text-[#AAA]" />
                <span className="flex-1 text-left font-body text-[13px] text-[#AAA]">Search books…</span>
              </button>

              {/* Nav links */}
              <nav className="flex flex-col gap-0.5">
                {navLinks.map((l) => {
                  const active = isActive(l.href);
                  return (
                    <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-body text-[14px] font-medium transition-colors
                        ${active ? "bg-[#F5F4F1] text-[#111]" : "text-[#666] hover:text-[#111] hover:bg-[#FAFAF8]"}`}>
                      {l.label}
                      <ArrowRight size={12} className="text-[#CCC]" />
                    </Link>
                  );
                })}
              </nav>

              {/* Quick links */}
              <div className="flex flex-col gap-0.5 pt-2 border-t border-[#F0EEE9]">
                <Link href="/cart" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl font-body text-[14px] font-medium text-[#666] hover:text-[#111] hover:bg-[#FAFAF8] transition-colors">
                  <span className="flex items-center gap-3"><ShoppingCart size={15} strokeWidth={1.8} /> Cart</span>
                  {count > 0 && <span className="text-[10px] font-bold text-white bg-[#0D1F17] rounded-full px-1.5 py-0.5 leading-none">{count > 9 ? "9+" : count}</span>}
                </Link>
                <Link href="/account/library" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl font-body text-[14px] font-medium text-[#666] hover:text-[#111] hover:bg-[#FAFAF8] transition-colors">
                  <Heart size={15} strokeWidth={1.8} /> Wishlist
                </Link>
              </div>

              {/* Account links */}
              {user && (
                <div className="flex flex-col gap-0.5 pt-2 border-t border-[#F0EEE9] pb-2">
                  {role === "admin" ? (
                    <MobileItem href="/admin/dashboard" icon={<LayoutDashboard size={14} />} onClick={() => setMobileOpen(false)}>Admin Dashboard</MobileItem>
                  ) : (
                    <>
                      <MobileItem href="/account/dashboard"          icon={<User size={14} />}     onClick={() => setMobileOpen(false)}>My Profile</MobileItem>
                      <MobileItem href="/account/membership"         icon={<Tag size={14} />}      onClick={() => setMobileOpen(false)}>Membership</MobileItem>
                      <MobileItem href="/account/membership/library" icon={<Library size={14} />}  onClick={() => setMobileOpen(false)}>Member Library</MobileItem>
                      <MobileItem href="/account/library"            icon={<BookOpen size={14} />} onClick={() => setMobileOpen(false)}>Purchased Books</MobileItem>
                      <MobileItem href="/account/orders"             icon={<Package size={14} />}  onClick={() => setMobileOpen(false)}>My Orders</MobileItem>
                    </>
                  )}
                  <button onClick={() => { signOut(); setMobileOpen(false); }}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl font-body text-[13.5px] text-[#E53935] hover:bg-red-50 transition-colors mt-1">
                    <LogOut size={14} /> Sign Out
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

function MobileItem({ href, icon, onClick, children }: { href: string; icon: React.ReactNode; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-3 px-3.5 py-3 rounded-xl font-body text-[13.5px] text-[#555] hover:text-[#111] hover:bg-[#FAFAF8] transition-colors">
      <span className="text-[#999] shrink-0">{icon}</span>
      <span className="flex-1">{children}</span>
      <ArrowRight size={11} className="text-[#DDD] shrink-0" />
    </Link>
  );
}
