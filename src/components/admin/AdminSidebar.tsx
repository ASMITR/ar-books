"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, BookOpen, Tag, ShoppingBag,
  CreditCard, Users, Download, FileText,
  User, Settings, LogOut, Gift,
  PanelLeftClose, PanelLeftOpen, Menu, X, ExternalLink,
  ChevronDown, Library,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    id: "catalog",
    label: "Catalog",
    icon: BookOpen,
    items: [
      { href: "/admin/books",      label: "Books",      icon: BookOpen  },
      { href: "/admin/categories", label: "Categories", icon: Tag       },
      { href: "/admin/articles",   label: "Articles",   icon: FileText  },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    icon: ShoppingBag,
    items: [
      { href: "/admin/orders",    label: "Orders",           icon: ShoppingBag },
      { href: "/admin/payments",  label: "Payments",         icon: CreditCard  },
      { href: "/admin/customers", label: "Customers",        icon: Users       },
      { href: "/admin/downloads", label: "Downloads",        icon: Download    },
      { href: "/admin/offers",    label: "Offers & Coupons", icon: Gift        },
      { href: "/admin/coupons",   label: "Referrals",        icon: Users       },
    ],
  },
  {
    id: "membership",
    label: "Membership",
    icon: Library,
    items: [
      { href: "/admin/membership",               label: "Overview",    icon: Library },
      { href: "/admin/membership/plans",         label: "Plans",       icon: Tag     },
      { href: "/admin/membership/subscriptions", label: "Subscribers", icon: Users   },
    ],
  },
] as const;

function isActive(href: string, pathname: string) {
  if (href === "/admin/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function groupHasActive(items: readonly { href: string }[], pathname: string) {
  return items.some((i) => isActive(i.href, pathname));
}

function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-full ml-2.5 z-50 whitespace-nowrap rounded-lg bg-[#111] text-white text-[11px] font-body px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-xl">
      {label}
    </span>
  );
}

function StandaloneLink({
  href, label, icon: Icon, collapsed, active, onClick,
}: {
  href: string; label: string; icon: React.ElementType;
  collapsed: boolean; active: boolean; onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-xl transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#FFC928]/40",
        collapsed ? "justify-center w-9 h-9 mx-auto" : "px-3 py-2.5 w-full",
        active
          ? "bg-[#FFC928]/[0.14] text-[#FFC928]"
          : "text-white/45 hover:bg-white/[0.06] hover:text-white/85",
      )}
    >
      {!collapsed && active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#FFC928] rounded-full" />
      )}
      <Icon size={14} strokeWidth={active ? 2.5 : 2}
        className={cn("shrink-0", active ? "text-[#FFC928]" : "text-white/35 group-hover:text-white/65")} />
      {!collapsed && (
        <span className={cn("text-[13px] font-body truncate leading-none", active ? "font-semibold text-[#FFC928]" : "font-medium")}>
          {label}
        </span>
      )}
      {collapsed && <Tooltip label={label} />}
    </Link>
  );
}

function DropdownGroup({
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
        <div className="group relative flex items-center justify-center w-9 h-9 mx-auto rounded-xl text-white/15 cursor-default">
          <GroupIcon size={13} strokeWidth={1.5} />
          <Tooltip label={group.label} />
        </div>
        {group.items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href, pathname);
          return (
            <Link key={href} href={href} onClick={onNavClick}
              className={cn(
                "group relative flex items-center justify-center w-9 h-9 mx-auto rounded-xl transition-all duration-150",
                active ? "bg-[#FFC928]/[0.14] text-[#FFC928]" : "text-white/30 hover:bg-white/[0.06] hover:text-white/70",
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
      <button
        onClick={() => setOpen((s) => !s)}
        className={cn(
          "group flex items-center gap-2.5 w-full px-3 py-2 rounded-xl transition-all duration-150 outline-none",
          hasActive ? "text-white/75" : "text-white/30 hover:bg-white/[0.04] hover:text-white/65",
        )}
      >
        <GroupIcon size={13} strokeWidth={hasActive ? 2 : 1.8}
          className={cn("shrink-0", hasActive ? "text-white/50" : "text-white/20 group-hover:text-white/45")} />
        <span className={cn(
          "flex-1 text-left text-[10.5px] font-body uppercase tracking-[0.1em] leading-none",
          hasActive ? "font-bold text-white/50" : "font-semibold text-white/25 group-hover:text-white/50",
        )}>
          {group.label}
        </span>
        <ChevronDown size={12}
          className={cn("shrink-0 transition-transform duration-200 text-white/15", open ? "rotate-180" : "rotate-0")} />
      </button>

      <div className={cn(
        "overflow-hidden transition-all duration-200 ease-in-out",
        open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
      )}>
        <div className="pl-3 pr-0.5 pb-1 space-y-0.5 border-l border-white/[0.07] ml-[18px] mt-0.5">
          {group.items.map(({ href, label, icon: Icon }) => {
            const active = isActive(href, pathname);
            return (
              <Link key={href} href={href} onClick={onNavClick}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-150",
                  active ? "bg-[#FFC928]/[0.10] text-[#FFC928]" : "text-white/30 hover:bg-white/[0.05] hover:text-white/75",
                )}>
                <Icon size={12} strokeWidth={active ? 2.5 : 2}
                  className={cn("shrink-0", active ? "text-[#FFC928]" : "text-white/22 group-hover:text-white/55")} />
                <span className={cn("text-[12.5px] font-body truncate leading-none", active ? "font-semibold" : "font-medium")}>
                  {label}
                </span>
                {active && <span className="ml-auto w-1 h-1 rounded-full bg-[#FFC928]/70 shrink-0" />}
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

  return (
    <div className="flex flex-col h-full select-none">

      {/* Brand */}
      <div className={cn(
        "flex items-center h-[60px] shrink-0 border-b border-white/[0.07]",
        collapsed ? "justify-center px-2" : "px-4 gap-3",
      )}>
        {collapsed ? (
          <button onClick={() => setCollapsed(false)} title="Expand"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/25 hover:text-white/65 hover:bg-white/[0.07] transition-all">
            <PanelLeftOpen size={15} />
          </button>
        ) : (
          <>
            <Link href="/" className="flex-1 min-w-0">
              <span className="font-heading text-[16px] font-bold text-white/85 tracking-tight leading-none">AR Books</span>
              <span className="block text-[9px] font-body text-white/22 uppercase tracking-[0.2em] mt-0.5">Admin Panel</span>
            </Link>
            <button onClick={() => setCollapsed(true)} title="Collapse"
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-white/18 hover:text-white/55 hover:bg-white/[0.06] transition-all">
              <PanelLeftClose size={14} />
            </button>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 scrollbar-none">
        <StandaloneLink
          href="/admin/dashboard" label="Dashboard" icon={LayoutDashboard}
          collapsed={collapsed} active={isActive("/admin/dashboard", pathname)} onClick={onNavClick}
        />
        <div className={cn("my-2.5", collapsed ? "h-px bg-white/[0.07] mx-2" : "h-px bg-white/[0.07] mx-1")} />
        {NAV_GROUPS.map((group) => (
          <DropdownGroup
            key={group.id} group={group} collapsed={collapsed}
            onNavClick={onNavClick} forceOpen={groupHasActive(group.items, pathname)}
          />
        ))}
        <div className={cn("my-2.5", collapsed ? "h-px bg-white/[0.07] mx-2" : "h-px bg-white/[0.07] mx-1")} />
        <StandaloneLink
          href="/admin/settings" label="Settings" icon={Settings}
          collapsed={collapsed} active={isActive("/admin/settings", pathname)} onClick={onNavClick}
        />
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/[0.07] p-2 space-y-0.5">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.05] mb-2">
            <div className="w-7 h-7 rounded-full bg-[#FFC928]/12 border border-[#FFC928]/18 flex items-center justify-center shrink-0">
              <User size={11} className="text-[#FFC928]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-body font-medium text-white/55 truncate leading-none">{user?.email ?? "Admin"}</p>
              <p className="text-[9.5px] text-[#FFC928]/35 mt-0.5 font-body tracking-wide uppercase">Administrator</p>
            </div>
          </div>
        )}

        <Link href="/" target="_blank"
          className={cn(
            "group flex items-center gap-2.5 rounded-xl text-[12px] font-body text-white/28 hover:bg-white/[0.05] hover:text-white/65 transition-all duration-150",
            collapsed ? "justify-center w-9 h-9 mx-auto relative" : "px-3 py-2.5 w-full",
          )}>
          <ExternalLink size={13} className="shrink-0" />
          {!collapsed && <span>Visit site</span>}
          {collapsed && <Tooltip label="Visit site" />}
        </Link>

        <button onClick={signOut}
          className={cn(
            "group flex items-center gap-2.5 rounded-xl text-[12px] font-body text-white/28 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150",
            collapsed ? "justify-center w-9 h-9 mx-auto relative" : "px-3 py-2.5 w-full",
          )}>
          <LogOut size={13} className="shrink-0" />
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
    <div className={cn("lg:hidden fixed inset-0 z-50 flex transition-all duration-300", open ? "pointer-events-auto" : "pointer-events-none")}>
      <div onClick={onClose}
        className={cn("absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} />
      <div className={cn(
        "relative w-[260px] max-w-[80vw] h-full bg-[#0c1a12] shadow-2xl flex flex-col transition-transform duration-300 ease-out border-r border-white/[0.06]",
        open ? "translate-x-0" : "-translate-x-full",
      )}>
        <button onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.07] rounded-lg transition-all"
          aria-label="Close menu">
          <X size={15} />
        </button>
        <SidebarContent collapsed={false} setCollapsed={() => {}} onNavClick={onClose} />
      </div>
    </div>
  );
}

function MobileTopBar({ onOpen }: { onOpen: () => void }) {
  const pathname = usePathname();
  const allItems: { href: string; label: string }[] = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/settings",  label: "Settings"  },
    ...NAV_GROUPS.flatMap((g) => g.items.map((i) => ({ href: i.href, label: i.label }))),
  ];
  const currentLabel = allItems.find((item) => isActive(item.href, pathname))?.label;

  return (
    <div className="lg:hidden flex items-center justify-between h-13 px-4 bg-[#0c1a12] border-b border-white/[0.07] shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <Link href="/" className="shrink-0">
          <span className="font-heading text-[15px] font-bold text-white/85 tracking-tight">AR Books</span>
        </Link>
        {currentLabel && (
          <>
            <span className="text-white/18 text-sm">/</span>
            <span className="text-[12.5px] font-body font-semibold text-white/60 truncate">{currentLabel}</span>
          </>
        )}
      </div>
      <button onClick={onOpen}
        className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.07] rounded-lg transition-all"
        aria-label="Open menu">
        <Menu size={18} />
      </button>
    </div>
  );
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <MobileTopBar onOpen={() => setMobileOpen(true)} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <aside className={cn(
        "hidden lg:flex shrink-0 h-screen bg-[#0c1a12] text-white flex-col transition-[width] duration-300 ease-in-out border-r border-white/[0.06]",
        collapsed ? "w-[56px]" : "w-[232px]",
      )}>
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>
    </>
  );
}
