"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, BookOpen, Tag, ShoppingBag,
  CreditCard, Users, Download, Ticket, FileText,
  User, Settings, LogOut, Gift,
  PanelLeftClose, PanelLeftOpen, Menu, X, ExternalLink,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Nav structure ─────────────────────────────────────────────────────────────
// Dashboard and Settings are standalone — everything else lives in dropdown groups.
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
      { href: "/admin/coupons",   label: "Legacy Coupons",   icon: Ticket      },
    ],
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isActive(href: string, pathname: string) {
  if (href === "/admin/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function groupHasActive(items: readonly { href: string }[], pathname: string) {
  return items.some((i) => isActive(i.href, pathname));
}

// ─── Tooltip (for collapsed icon-only mode) ────────────────────────────────────
function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg bg-[#1a2e24] border border-white/[0.08] text-white/80 text-xs font-body px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg">
      {label}
    </span>
  );
}

// ─── Standalone nav link (Dashboard / Settings) ────────────────────────────────
function StandaloneLink({
  href,
  label,
  icon: Icon,
  collapsed,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  collapsed: boolean;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#FFC928]/40",
        collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2.5 w-full",
        active
          ? "bg-[#FFC928]/[0.12] text-[#FFC928]"
          : "text-white/40 hover:bg-white/[0.05] hover:text-white/80",
      )}
    >
      {/* Left active bar */}
      {!collapsed && (
        <span
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full transition-all duration-200",
            active ? "h-5 bg-[#FFC928]" : "h-0 bg-transparent",
          )}
        />
      )}

      <Icon
        size={15}
        strokeWidth={active ? 2.5 : 2}
        className={cn(
          "shrink-0 transition-colors",
          active ? "text-[#FFC928]" : "text-white/30 group-hover:text-white/60",
        )}
      />

      {!collapsed && (
        <span className={cn("text-[13px] font-body font-medium truncate leading-none", active && "font-semibold")}>
          {label}
        </span>
      )}

      {collapsed && <Tooltip label={label} />}
    </Link>
  );
}

// ─── Dropdown group ────────────────────────────────────────────────────────────
function DropdownGroup({
  group,
  collapsed,
  onNavClick,
  forceOpen,
}: {
  group: (typeof NAV_GROUPS)[number];
  collapsed: boolean;
  onNavClick?: () => void;
  forceOpen: boolean; // true when a child is active
}) {
  const pathname = usePathname();
  const hasActive = groupHasActive(group.items, pathname);
  const [open, setOpen] = useState(hasActive || forceOpen);
  const GroupIcon = group.icon;

  // Auto-open when navigating into a child route
  useEffect(() => {
    if (hasActive) setOpen(true);
  }, [hasActive]);

  // Collapsed mode: just show icon with tooltip listing the section
  if (collapsed) {
    return (
      <div className="space-y-0.5">
        {/* Group icon — acts as a visual separator in collapsed mode */}
        <div className="group relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl text-white/20 cursor-default">
          <GroupIcon size={14} strokeWidth={1.5} />
          <Tooltip label={group.label} />
        </div>
        {/* Child items as icon-only links */}
        {group.items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href, pathname);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              title={label}
              className={cn(
                "group relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#FFC928]/40",
                active
                  ? "bg-[#FFC928]/[0.12] text-[#FFC928]"
                  : "text-white/30 hover:bg-white/[0.05] hover:text-white/70",
              )}
            >
              <Icon size={14} strokeWidth={active ? 2.5 : 2} />
              <Tooltip label={label} />
            </Link>
          );
        })}
      </div>
    );
  }

  // Expanded mode: collapsible accordion
  return (
    <div>
      {/* Group header button */}
      <button
        onClick={() => setOpen((s) => !s)}
        className={cn(
          "group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#FFC928]/40",
          hasActive
            ? "text-white/80"
            : "text-white/35 hover:bg-white/[0.04] hover:text-white/70",
        )}
      >
        {/* Left active bar when group has active child */}
        {hasActive && (
          <span className="absolute left-3 -ml-3 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-white/20 rounded-full" />
        )}

        <GroupIcon
          size={15}
          strokeWidth={hasActive ? 2 : 1.8}
          className={cn(
            "shrink-0 transition-colors",
            hasActive ? "text-white/60" : "text-white/25 group-hover:text-white/50",
          )}
        />

        <span className={cn(
          "flex-1 text-left text-[12px] font-body uppercase tracking-[0.08em] leading-none",
          hasActive ? "font-bold text-white/60" : "font-semibold text-white/30 group-hover:text-white/55",
        )}>
          {group.label}
        </span>

        <ChevronDown
          size={13}
          className={cn(
            "shrink-0 transition-transform duration-200 text-white/20",
            open ? "rotate-180" : "rotate-0",
          )}
        />
      </button>

      {/* Children */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="pl-3 pr-0.5 pb-1 space-y-0.5 border-l border-white/[0.06] ml-[19px] mt-0.5">
          {group.items.map(({ href, label, icon: Icon }) => {
            const active = isActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavClick}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#FFC928]/40",
                  active
                    ? "bg-[#FFC928]/[0.10] text-[#FFC928]"
                    : "text-white/35 hover:bg-white/[0.05] hover:text-white/75",
                )}
              >
                <Icon
                  size={13}
                  strokeWidth={active ? 2.5 : 2}
                  className={cn(
                    "shrink-0",
                    active ? "text-[#FFC928]" : "text-white/25 group-hover:text-white/55",
                  )}
                />
                <span className={cn("text-[13px] font-body truncate leading-none", active ? "font-semibold" : "font-medium")}>
                  {label}
                </span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FFC928] shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar content (shared between desktop + mobile drawer) ─────────────────
function SidebarContent({
  collapsed,
  setCollapsed,
  onNavClick,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onNavClick?: () => void;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="flex flex-col h-full select-none">

      {/* ── Brand header ── */}
      <div
        className={cn(
          "flex items-center h-[64px] shrink-0 border-b border-white/[0.06]",
          collapsed ? "justify-center px-2" : "px-4 gap-3",
        )}
      >
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.07] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC928]/40"
          >
            <PanelLeftOpen size={16} />
          </button>
        ) : (
          <>
            <Link href="/" className="flex-1 min-w-0 group">
              <span className="font-heading text-[17px] font-bold text-white/90 tracking-tight leading-none group-hover:text-white transition-colors">
                AR Books
              </span>
              <span className="block text-[9px] font-body text-white/25 uppercase tracking-[0.18em] mt-0.5">Admin Panel</span>
            </Link>
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC928]/40"
            >
              <PanelLeftClose size={15} />
            </button>
          </>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-1 scrollbar-none">

        {/* ── STANDALONE: Dashboard ── */}
        <StandaloneLink
          href="/admin/dashboard"
          label="Dashboard"
          icon={LayoutDashboard}
          collapsed={collapsed}
          active={isActive("/admin/dashboard", pathname)}
          onClick={onNavClick}
        />

        {/* Divider */}
        <div className={cn("my-2", collapsed ? "h-px bg-white/[0.06] mx-2" : "h-px bg-white/[0.06] mx-1")} />

        {/* ── DROPDOWN GROUPS ── */}
        {NAV_GROUPS.map((group) => (
          <DropdownGroup
            key={group.id}
            group={group}
            collapsed={collapsed}
            onNavClick={onNavClick}
            forceOpen={groupHasActive(group.items, pathname)}
          />
        ))}

        {/* Divider */}
        <div className={cn("my-2", collapsed ? "h-px bg-white/[0.06] mx-2" : "h-px bg-white/[0.06] mx-1")} />

        {/* ── STANDALONE: Settings ── */}
        <StandaloneLink
          href="/admin/settings"
          label="Settings"
          icon={Settings}
          collapsed={collapsed}
          active={isActive("/admin/settings", pathname)}
          onClick={onNavClick}
        />

      </nav>

      {/* ── Footer zone ── */}
      <div className="shrink-0 border-t border-white/[0.06] p-2 space-y-0.5">

        {/* User info strip */}
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] mb-2">
            <div className="w-7 h-7 rounded-full bg-[#FFC928]/15 border border-[#FFC928]/20 flex items-center justify-center shrink-0">
              <User size={12} className="text-[#FFC928]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-body font-medium text-white/60 truncate leading-none">
                {user?.email ?? "Admin"}
              </p>
              <p className="text-[10px] text-[#FFC928]/40 mt-0.5 font-body tracking-wide uppercase">
                Administrator
              </p>
            </div>
          </div>
        )}

        {/* Visit site */}
        <Link
          href="/"
          target="_blank"
          title={collapsed ? "Visit site" : undefined}
          className={cn(
            "group flex items-center gap-3 rounded-xl text-[12.5px] font-body text-white/30 hover:bg-white/[0.05] hover:text-white/70 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC928]/40",
            collapsed ? "justify-center w-10 h-10 mx-auto relative" : "px-3 py-2.5 w-full",
          )}
        >
          <ExternalLink size={13} className="shrink-0" />
          {!collapsed && <span>Visit site</span>}
          {collapsed && <Tooltip label="Visit site" />}
        </Link>

        {/* Sign out */}
        <button
          onClick={signOut}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "group flex items-center gap-3 rounded-xl text-[12.5px] font-body text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30",
            collapsed ? "justify-center w-10 h-10 mx-auto relative" : "px-3 py-2.5 w-full",
          )}
        >
          <LogOut size={13} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
          {collapsed && <Tooltip label="Sign out" />}
        </button>
      </div>
    </div>
  );
}

// ─── Mobile drawer ─────────────────────────────────────────────────────────────
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
    <div
      className={cn(
        "lg:hidden fixed inset-0 z-50 flex transition-all duration-300",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "relative w-[272px] max-w-[80vw] h-full bg-[#0e1c16] shadow-2xl flex flex-col transition-transform duration-300 ease-out border-r border-white/[0.05]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-[18px] right-4 w-8 h-8 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.07] rounded-lg transition-all"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
        <SidebarContent collapsed={false} setCollapsed={() => {}} onNavClick={onClose} />
      </div>
    </div>
  );
}

// ─── Mobile top bar ────────────────────────────────────────────────────────────
function MobileTopBar({ onOpen }: { onOpen: () => void }) {
  const pathname = usePathname();

  // Flat list of all nav items for label lookup
  const allItems: { href: string; label: string }[] = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/settings",  label: "Settings"  },
    ...NAV_GROUPS.flatMap((g) => g.items.map((i) => ({ href: i.href, label: i.label }))),
  ];

  const currentLabel = allItems.find((item) => isActive(item.href, pathname))?.label;

  return (
    <div className="lg:hidden flex items-center justify-between h-14 px-4 bg-[#0e1c16] border-b border-white/[0.06] shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/" className="shrink-0">
          <span className="font-heading text-[16px] font-bold text-white/90 tracking-tight">AR Books</span>
        </Link>
        {currentLabel && (
          <>
            <span className="text-white/20 text-sm">/</span>
            <span className="text-[13px] font-body font-semibold text-white/70 truncate">{currentLabel}</span>
          </>
        )}
      </div>
      <button
        onClick={onOpen}
        className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.07] rounded-lg transition-all"
        aria-label="Open menu"
      >
        <Menu size={19} />
      </button>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────
export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <MobileTopBar onOpen={() => setMobileOpen(true)} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <aside
        className={cn(
          "hidden lg:flex shrink-0 h-screen bg-[#0e1c16] text-white flex-col transition-[width] duration-300 ease-in-out border-r border-white/[0.05]",
          collapsed ? "w-[60px]" : "w-[240px]",
        )}
      >
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>
    </>
  );
}
