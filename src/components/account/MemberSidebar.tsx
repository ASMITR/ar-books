"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, BookOpen, ShoppingBag, Download,
  User, Shield, HelpCircle, ShoppingCart, LogOut,
  PanelLeftClose, PanelLeftOpen, Menu, X, ExternalLink,
  ChevronDown, Library, Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    id: "library",
    label: "Library",
    icon: BookOpen,
    items: [
      { href: "/account/membership",         label: "My Membership",   icon: Library   },
      { href: "/account/membership/library", label: "Member Library",  icon: BookOpen  },
      { href: "/account/library",            label: "Purchased Books", icon: BookOpen  },
    ],
  },
  {
    id: "activity",
    label: "Activity",
    icon: ShoppingBag,
    items: [
      { href: "/account/orders",    label: "My Orders",        icon: ShoppingBag },
      { href: "/account/downloads", label: "Download History", icon: Download    },
      { href: "/account/referral",  label: "Refer a Friend",   icon: Gift        },
    ],
  },
  {
    id: "account",
    label: "Account",
    icon: User,
    items: [
      { href: "/account/profile",  label: "Profile Settings", icon: User       },
      { href: "/account/security", label: "Security",         icon: Shield     },
      { href: "/contact",          label: "Help & Support",   icon: HelpCircle },
    ],
  },
] as const;

function isActive(href: string, pathname: string) {
  if (href === "/account/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function groupHasActive(items: readonly { href: string }[], pathname: string) {
  return items.some((i) => isActive(i.href, pathname));
}

function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-full ml-2.5 z-50 whitespace-nowrap rounded-lg bg-[#0D1F17] text-white text-[11px] font-body px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-xl border border-white/10">
      {label}
    </span>
  );
}

function NavLink({
  href, label, icon: Icon, collapsed, active, onClick,
}: {
  href: string; label: string; icon: React.ElementType;
  collapsed: boolean; active: boolean; onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-xl transition-all duration-150 outline-none",
        collapsed ? "justify-center w-9 h-9 mx-auto" : "px-3 py-2.5 w-full",
        active ? "bg-white/[0.10] text-white" : "text-white/40 hover:bg-white/[0.05] hover:text-white/75",
      )}>
      {!collapsed && active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#FFC928] rounded-r-full" />
      )}
      <Icon size={14} strokeWidth={active ? 2.5 : 2}
        className={cn("shrink-0 transition-colors", active ? "text-[#FFC928]" : "text-white/30 group-hover:text-white/60")} />
      {!collapsed && (
        <span className={cn("text-[13px] font-body truncate leading-none", active ? "font-semibold text-white" : "font-medium")}>
          {label}
        </span>
      )}
      {collapsed && <Tooltip label={label} />}
    </Link>
  );
}

function NavGroup({
  group, collapsed, onNavClick, forceOpen,
}: {
  group: (typeof NAV_GROUPS)[number];
  collapsed: boolean; onNavClick?: () => void; forceOpen: boolean;
}) {
  const pathname  = usePathname();
  const hasActive = groupHasActive(group.items, pathname);
  const [open, setOpen] = useState(hasActive || forceOpen);
  const GroupIcon = group.icon;

  useEffect(() => { if (hasActive) setOpen(true); }, [hasActive]);

  if (collapsed) {
    return (
      <div className="space-y-0.5">
        <div className="h-px bg-white/[0.06] mx-2 my-1" />
        {group.items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href, pathname);
          return (
            <Link key={href} href={href} onClick={onNavClick}
              className={cn(
                "group relative flex items-center justify-center w-9 h-9 mx-auto rounded-xl transition-all duration-150",
                active ? "bg-white/[0.10] text-[#FFC928]" : "text-white/30 hover:bg-white/[0.05] hover:text-white/70",
              )}>
              <Icon size={13} strokeWidth={active ? 2.5 : 2} />
              <Tooltip label={label} />
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setOpen(s => !s)}
        className={cn(
          "group flex items-center gap-2.5 w-full px-3 py-2 rounded-xl transition-all duration-150 outline-none",
          hasActive ? "text-white/60" : "text-white/25 hover:bg-white/[0.03] hover:text-white/55",
        )}>
        <GroupIcon size={12} strokeWidth={1.8}
          className={cn("shrink-0", hasActive ? "text-white/40" : "text-white/18 group-hover:text-white/40")} />
        <span className={cn(
          "flex-1 text-left text-[10px] font-body uppercase tracking-[0.12em] leading-none",
          hasActive ? "font-bold text-white/40" : "font-semibold text-white/22 group-hover:text-white/45",
        )}>
          {group.label}
        </span>
        <ChevronDown size={11}
          className={cn("shrink-0 transition-transform duration-200 text-white/15", open ? "rotate-180" : "rotate-0")} />
      </button>

      <div className={cn(
        "overflow-hidden transition-all duration-200 ease-in-out",
        open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
      )}>
        <div className="pl-3 pr-1 pb-1 space-y-0.5 border-l border-white/[0.06] ml-[17px] mt-0.5">
          {group.items.map(({ href, label, icon: Icon }) => {
            const active = isActive(href, pathname);
            return (
              <Link key={href} href={href} onClick={onNavClick}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-150",
                  active ? "bg-white/[0.08] text-white" : "text-white/28 hover:bg-white/[0.04] hover:text-white/70",
                )}>
                <Icon size={12} strokeWidth={active ? 2.5 : 2}
                  className={cn("shrink-0", active ? "text-[#FFC928]" : "text-white/20 group-hover:text-white/50")} />
                <span className={cn("text-[12.5px] font-body truncate leading-none", active ? "font-semibold" : "font-medium")}>
                  {label}
                </span>
                {active && <span className="ml-auto w-1 h-1 rounded-full bg-[#FFC928]/60 shrink-0" />}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  collapsed, setCollapsed, onNavClick,
}: {
  collapsed: boolean; setCollapsed: (v: boolean) => void; onNavClick?: () => void;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "Reader";
  const initials    = displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="flex flex-col h-full select-none">

      {/* Brand header */}
      <div className={cn(
        "flex items-center h-[58px] shrink-0 border-b border-white/[0.06]",
        collapsed ? "justify-center px-2" : "px-4 gap-3",
      )}>
        {collapsed ? (
          <button onClick={() => setCollapsed(false)} title="Expand"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all">
            <PanelLeftOpen size={14} />
          </button>
        ) : (
          <>
            <Link href="/" className="flex-1 min-w-0 group">
              <span className="font-heading text-[15px] font-bold text-white/80 tracking-tight leading-none group-hover:text-white transition-colors">AR Books</span>
              <span className="block text-[9px] font-body text-white/18 uppercase tracking-[0.22em] mt-0.5">My Account</span>
            </Link>
            <button onClick={() => setCollapsed(true)} title="Collapse"
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-white/15 hover:text-white/50 hover:bg-white/[0.05] transition-all">
              <PanelLeftClose size={13} />
            </button>
          </>
        )}
      </div>

      {/* User strip */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-0">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.06]">
            <div className="w-7 h-7 rounded-full bg-[#FFC928]/15 border border-[#FFC928]/20 flex items-center justify-center shrink-0 overflow-hidden">
              {user?.photoURL
                ? <Image src={user.photoURL} alt={displayName} width={28} height={28} className="object-cover w-full h-full rounded-full" />
                : <span className="font-heading text-[10px] font-bold text-[#FFC928]">{initials}</span>
              }
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-body font-semibold text-white/60 truncate leading-none">{displayName}</p>
              <p className="text-[9px] text-[#FFC928]/40 mt-0.5 font-body tracking-widest uppercase">Member</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 scrollbar-none">
        <NavLink
          href="/account/dashboard" label="Overview" icon={LayoutDashboard}
          collapsed={collapsed} active={isActive("/account/dashboard", pathname)} onClick={onNavClick}
        />
        <div className={cn("my-1", collapsed ? "h-px bg-white/[0.06] mx-2" : "h-px bg-white/[0.06] mx-1")} />
        {NAV_GROUPS.map((group) => (
          <NavGroup
            key={group.id} group={group} collapsed={collapsed}
            onNavClick={onNavClick} forceOpen={groupHasActive(group.items, pathname)}
          />
        ))}
      </nav>

      {/* Footer links */}
      <div className="shrink-0 border-t border-white/[0.06] p-2 space-y-0.5">
        {[
          { href: "/books", label: "Browse Books", icon: ShoppingCart, external: false },
          { href: "/",      label: "Visit site",   icon: ExternalLink, external: true  },
        ].map(({ href, label, icon: Icon, external }) => (
          <Link key={href} href={href} target={external ? "_blank" : undefined}
            onClick={!external ? onNavClick : undefined}
            className={cn(
              "group flex items-center gap-2.5 rounded-xl text-[12px] font-body text-white/22 hover:bg-white/[0.04] hover:text-white/55 transition-all duration-150",
              collapsed ? "justify-center w-9 h-9 mx-auto relative" : "px-3 py-2.5 w-full",
            )}>
            <Icon size={12} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
            {collapsed && <Tooltip label={label} />}
          </Link>
        ))}
        <button onClick={signOut}
          className={cn(
            "group flex items-center gap-2.5 rounded-xl text-[12px] font-body text-white/22 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150",
            collapsed ? "justify-center w-9 h-9 mx-auto relative" : "px-3 py-2.5 w-full",
          )}>
          <LogOut size={12} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
          {collapsed && <Tooltip label="Sign out" />}
        </button>
      </div>
    </div>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className={cn("fixed inset-0 z-50 flex transition-all duration-300", open ? "pointer-events-auto" : "pointer-events-none")}>
      <div onClick={onClose}
        className={cn("absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} />
      <div className={cn(
        "relative w-[256px] max-w-[82vw] h-full bg-[#0b1910] shadow-2xl flex flex-col transition-transform duration-300 ease-out border-r border-white/[0.06]",
        open ? "translate-x-0" : "-translate-x-full",
      )}>
        <button onClick={onClose}
          className="absolute top-[18px] right-3.5 w-7 h-7 flex items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.07] rounded-lg transition-all"
          aria-label="Close menu">
          <X size={14} />
        </button>
        <SidebarContent collapsed={false} setCollapsed={() => {}} onNavClick={onClose} />
      </div>
    </div>
  );
}

function MobileTopBar({ onOpen }: { onOpen: () => void }) {
  const pathname = usePathname();
  const allItems = [
    { href: "/account/dashboard", label: "Overview" },
    ...NAV_GROUPS.flatMap((g) => g.items.map((i) => ({ href: i.href, label: i.label }))),
  ];
  const currentLabel = allItems.find((item) => isActive(item.href, pathname))?.label;

  return (
    <div className="lg:hidden flex items-center justify-between h-12 px-4 bg-[#0b1910] border-b border-white/[0.06] shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <Link href="/" className="shrink-0">
          <span className="font-heading text-[14px] font-bold text-white/80 tracking-tight">AR Books</span>
        </Link>
        {currentLabel && (
          <>
            <span className="text-white/15 text-sm">/</span>
            <span className="text-[12px] font-body font-semibold text-white/50 truncate">{currentLabel}</span>
          </>
        )}
      </div>
      <button onClick={onOpen}
        className="w-8 h-8 flex items-center justify-center text-white/35 hover:text-white hover:bg-white/[0.07] rounded-lg transition-all"
        aria-label="Open menu">
        <Menu size={17} />
      </button>
    </div>
  );
}

export function MemberSidebar() {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar — sits above the main content, outside the aside */}
      <MobileTopBar onOpen={() => setMobileOpen(true)} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <aside className={cn(
        "hidden lg:flex shrink-0 h-screen bg-[#0b1910] text-white flex-col transition-[width] duration-300 ease-in-out border-r border-white/[0.06]",
        collapsed ? "w-[54px]" : "w-[228px]",
      )}>
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>
    </>
  );
}
