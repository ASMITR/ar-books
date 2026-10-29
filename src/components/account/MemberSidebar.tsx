"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, BookOpen, ShoppingBag, Download,
  User, Shield, HelpCircle, ShoppingCart, LogOut,
  ChevronRight, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account/dashboard", label: "Overview",         icon: LayoutDashboard },
  { href: "/account/library",   label: "My Library",       icon: BookOpen },
  { href: "/account/orders",    label: "My Orders",        icon: ShoppingBag },
  { href: "/account/downloads", label: "Download History", icon: Download },
  { href: "/account/profile",   label: "Profile Settings", icon: User },
  { href: "/account/security",  label: "Security",         icon: Shield },
  { href: "/contact",           label: "Help & Support",   icon: HelpCircle },
];

// ─── Shared link row (used in both sidebar and dropdown) ─────────────────────
function NavItem({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 px-4 py-3 text-[13px] font-body transition-colors border-l-[3px]",
        active
          ? "border-l-[#FFC928] bg-[#FAF9F6] text-[#203A2B] font-semibold"
          : "border-l-transparent text-[#555] hover:bg-[#FAF9F6] hover:text-[#203A2B] hover:border-l-[#E6DFD5]"
      )}
    >
      <Icon
        size={15}
        className={cn(
          "shrink-0 transition-colors",
          active ? "text-[#203A2B]" : "text-[#A8B5A0] group-hover:text-[#203A2B]"
        )}
        strokeWidth={active ? 2.5 : 2}
      />
      <span className="flex-1 truncate">{label}</span>
      {active && <ChevronRight size={12} className="text-[#C6A66B] shrink-0" />}
    </Link>
  );
}

// ─── Avatar block ─────────────────────────────────────────────────────────────
function Avatar({
  photoURL,
  displayName,
  initials,
}: {
  photoURL?: string | null;
  displayName: string;
  initials: string;
}) {
  return (
    <div className="w-10 h-10 bg-[#FFC928] flex items-center justify-center shrink-0 overflow-hidden">
      {photoURL ? (
        <Image src={photoURL} alt={displayName} width={40} height={40} className="object-cover w-full h-full" />
      ) : (
        <span className="font-heading text-sm font-bold text-[#203A2B]">{initials}</span>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function MemberSidebar() {
  const pathname          = usePathname();
  const { signOut, user } = useAuth();
  const [open, setOpen]   = useState(false);
  const dropdownRef       = useRef<HTMLDivElement>(null);

  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "Reader";
  const initials    = displayName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const activeLink = links.find((l) =>
    l.href === "/account/dashboard" ? pathname === l.href : pathname.startsWith(l.href)
  ) ?? links[0];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <aside className="w-full lg:w-[220px] shrink-0 flex flex-col gap-3">

      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE / TABLET  — compact dropdown  (hidden on lg+)
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden" ref={dropdownRef}>

        {/* Trigger button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-3 bg-[#203A2B] px-4 py-3"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <Avatar photoURL={user?.photoURL} displayName={displayName} initials={initials} />

          <div className="flex-1 min-w-0 text-left">
            <p className="font-body text-[12px] font-semibold text-[#FFFCF7] truncate">{displayName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <activeLink.icon size={11} className="text-[#FFC928] shrink-0" strokeWidth={2} />
              <p className="font-body text-[11px] text-[#A8B5A0] truncate">{activeLink.label}</p>
            </div>
          </div>

          <ChevronDown
            size={16}
            className={cn(
              "text-[#A8B5A0] shrink-0 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown panel */}
        {open && (
          <div className="border border-[#E6DFD5] border-t-0 bg-white shadow-lg">
            <nav className="flex flex-col">
              {links.map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/account/dashboard"
                    ? pathname === href
                    : pathname.startsWith(href);
                return (
                  <NavItem
                    key={href}
                    href={href}
                    label={label}
                    icon={Icon}
                    active={active}
                    onClick={() => setOpen(false)}
                  />
                );
              })}

              <div className="h-px bg-[#F0EEE9] mx-4" />

              <Link
                href="/books"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 px-4 py-3 text-[13px] font-body text-[#555] hover:bg-[#FAF9F6] hover:text-[#203A2B] transition-colors border-l-[3px] border-l-transparent hover:border-l-[#E6DFD5]"
              >
                <ShoppingCart size={15} className="text-[#A8B5A0] group-hover:text-[#203A2B] transition-colors shrink-0" strokeWidth={2} />
                <span className="flex-1">Continue Shopping</span>
              </Link>

              <button
                onClick={() => { setOpen(false); signOut(); }}
                className="group flex items-center gap-3 px-4 py-3 text-[13px] font-body text-[#F12F43]/80 hover:bg-[#FFF5F5] hover:text-[#F12F43] transition-colors border-l-[3px] border-l-transparent hover:border-l-[#F12F43]/30 text-left"
              >
                <LogOut size={15} className="shrink-0" strokeWidth={2} />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DESKTOP — vertical sidebar  (hidden below lg)
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col gap-3">

        {/* Avatar card */}
        <div className="bg-[#203A2B] px-4 py-5 flex items-center gap-3">
          <Avatar photoURL={user?.photoURL} displayName={displayName} initials={initials} />
          <div className="min-w-0">
            <p className="font-body text-[13px] font-semibold text-[#FFFCF7] truncate">{displayName}</p>
            <p className="font-body text-[10px] text-[#A8B5A0] truncate">{user?.email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="bg-white border border-[#E6DFD5] flex flex-col overflow-hidden">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/account/dashboard"
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <NavItem key={href} href={href} label={label} icon={Icon} active={active} />
            );
          })}

          <div className="h-px bg-[#F0EEE9] mx-4" />

          <Link
            href="/books"
            className="group flex items-center gap-3 px-4 py-3 text-[13px] font-body text-[#555] hover:bg-[#FAF9F6] hover:text-[#203A2B] transition-colors border-l-[3px] border-l-transparent hover:border-l-[#E6DFD5]"
          >
            <ShoppingCart size={15} className="text-[#A8B5A0] group-hover:text-[#203A2B] transition-colors shrink-0" strokeWidth={2} />
            <span className="flex-1">Continue Shopping</span>
          </Link>

          <button
            onClick={signOut}
            className="group flex items-center gap-3 px-4 py-3 text-[13px] font-body text-[#F12F43]/80 hover:bg-[#FFF5F5] hover:text-[#F12F43] transition-colors border-l-[3px] border-l-transparent hover:border-l-[#F12F43]/30 text-left"
          >
            <LogOut size={15} className="shrink-0" strokeWidth={2} />
            <span>Logout</span>
          </button>
        </nav>
      </div>

    </aside>
  );
}
