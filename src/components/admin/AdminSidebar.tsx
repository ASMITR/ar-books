"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, BookOpen, Tag, ShoppingBag,
  CreditCard, Users, Download, FileText,
  Settings, LogOut, Gift, Menu, X,
  Library, ExternalLink, ChevronRight,
  Layers, Receipt, Crown, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Nav structure ────────────────────────────────────────────────────────────
type NavItem = { href: string; label: string; icon: React.ElementType };
type NavSection = { section: string };
type NavEntry = NavItem | NavSection;

const NAV: NavEntry[] = [
  { href: "/admin/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { section: "Catalog" },
  { href: "/admin/books",      label: "Books",      icon: BookOpen  },
  { href: "/admin/series",     label: "Series",     icon: Layers    },
  { href: "/admin/categories", label: "Categories", icon: Tag       },
  { href: "/admin/articles",   label: "Articles",   icon: FileText  },
  { section: "Commerce" },
  { href: "/admin/orders",    label: "Orders",           icon: Receipt    },
  { href: "/admin/payments",  label: "Payments",         icon: CreditCard },
  { href: "/admin/customers", label: "Customers",        icon: Users      },
  { href: "/admin/downloads", label: "Downloads",        icon: Download   },
  { href: "/admin/offers",    label: "Offers & Coupons", icon: Gift       },
  { href: "/admin/coupons",   label: "Referrals",        icon: Layers     },
  { section: "Membership" },
  { href: "/admin/membership",               label: "Overview",    icon: Library },
  { href: "/admin/membership/plans",         label: "Plans",       icon: Crown   },
  { href: "/admin/membership/subscriptions", label: "Subscribers", icon: Users   },
  { section: "System" },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function isActive(href: string, pathname: string) {
  if (href === "/admin/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-full ml-3 z-[60] whitespace-nowrap rounded-xl bg-[#111] text-white text-[11px] font-body font-medium px-3 py-1.5 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150 shadow-xl border border-white/[0.08]">
      {label}
    </span>
  );
}

// ─── Nav item ─────────────────────────────────────────────────────────────────
function NavLink({
  href, label, icon: Icon, collapsed, active, onClick,
}: NavItem & { collapsed: boolean; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl transition-all duration-150 outline-none select-none",
        collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2.5 w-full",
        active
          ? "bg-white text-[#0D1F17] shadow-sm"
          : "text-[#8A9E94] hover:bg-white/[0.06] hover:text-white",
      )}
    >
      {!collapsed && active && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#FFC928]" />
      )}
      <Icon
        size={15}
        strokeWidth={active ? 2.5 : 1.8}
        className={cn(
          "shrink-0 transition-colors",
          active ? "text-[#0D1F17]" : "text-[#4A6358] group-hover:text-[#8A9E94]",
        )}
      />
      {!collapsed && (
        <span className={cn(
          "text-[13px] font-body truncate leading-none flex-1",
          active ? "font-bold text-[#0D1F17]" : "font-medium",
        )}>
          {label}
        </span>
      )}
      {collapsed && <Tooltip label={label} />}
    </Link>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="h-px bg-white/[0.06] mx-2 my-2" />;
  return (
    <p className="px-3 pt-4 pb-1.5 text-[9.5px] font-body font-bold uppercase tracking-[0.18em] text-[#2E4A3A] select-none">
      {label}
    </p>
  );
}

// ─── Sidebar content ──────────────────────────────────────────────────────────
function SidebarContent({
  collapsed,
  setCollapsed,
  onNavClick,
}: {
  collapsed: boolean;
  setCollapsed?: (v: boolean) => void;
  onNavClick?: () => void;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="flex flex-col h-full">

      {/* Brand */}
      <div className={cn(
        "flex items-center shrink-0 h-[60px] border-b border-white/[0.05]",
        collapsed ? "justify-center px-2" : "px-4 gap-3",
      )}>
        {collapsed ? (
          <button
            onClick={() => setCollapsed?.(false)}
            title="Expand sidebar"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-[#2E4A3A] hover:text-white hover:bg-white/[0.07] transition-all"
          >
            <ChevronRight size={15} />
          </button>
        ) : (
          <>
            <Link href="/" className="flex items-center gap-2.5 flex-1 min-w-0 group">
              <div className="w-7 h-7 rounded-xl bg-[#FFC928] flex items-center justify-center shrink-0">
                <Sparkles size={13} className="text-[#0D1F17]" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="font-heading text-[14px] font-bold text-white leading-none tracking-tight group-hover:text-[#FFC928] transition-colors">
                  AR Books
                </p>
                <p className="text-[9px] font-body text-[#2E4A3A] uppercase tracking-[0.2em] mt-0.5">
                  Admin Panel
                </p>
              </div>
            </Link>
            {setCollapsed && (
              <button
                onClick={() => setCollapsed(true)}
                title="Collapse sidebar"
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-[#2E4A3A] hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <ChevronRight size={13} className="rotate-180" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Admin user card */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-1">
          <div className="relative rounded-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/[0.07] px-3.5 py-3 flex items-center gap-3 overflow-hidden">
            <div className="pointer-events-none absolute -top-4 -right-4 w-20 h-20 rounded-full bg-[#FFC928]/[0.08] blur-xl" />
            <div className="relative shrink-0 w-9 h-9 rounded-full border-2 border-[#FFC928]/25 bg-[#FFC928]/10 flex items-center justify-center">
              <ShoppingBag size={13} className="text-[#FFC928]" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-body font-semibold text-white/80 truncate leading-none">
                {user?.email ?? "Admin"}
              </p>
              <p className="text-[10px] font-body text-[#2E4A3A] mt-0.5 uppercase tracking-[0.12em]">Administrator</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 scrollbar-none space-y-0.5">
        {NAV.map((entry, i) => {
          if ("section" in entry) {
            return <SectionLabel key={`sec-${i}`} label={entry.section} collapsed={collapsed} />;
          }
          const active = isActive(entry.href, pathname);
          return (
            <NavLink
              key={entry.href}
              href={entry.href}
              label={entry.label}
              icon={entry.icon}
              collapsed={collapsed}
              active={active}
              onClick={onNavClick}
            />
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/[0.05] p-2 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className={cn(
            "group relative flex items-center gap-3 rounded-2xl transition-all duration-150 text-[#4A6358] hover:bg-white/[0.06] hover:text-[#8A9E94]",
            collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2.5 w-full",
          )}
        >
          <ExternalLink size={14} strokeWidth={1.8} className="shrink-0" />
          {!collapsed && <span className="text-[12.5px] font-body font-medium">Visit Site</span>}
          {collapsed && <Tooltip label="Visit Site" />}
        </Link>

        <button
          onClick={signOut}
          className={cn(
            "group relative flex items-center gap-3 rounded-2xl transition-all duration-150 text-[#4A6358] hover:bg-red-500/10 hover:text-red-400 w-full",
            collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2.5",
          )}
        >
          <LogOut size={14} strokeWidth={1.8} className="shrink-0" />
          {!collapsed && <span className="text-[12.5px] font-body font-medium">Sign out</span>}
          {collapsed && <Tooltip label="Sign out" />}
        </button>
      </div>
    </div>
  );
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────
function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);

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
    <div className={cn(
      "lg:hidden fixed inset-0 z-50 flex transition-all duration-300",
      open ? "pointer-events-auto" : "pointer-events-none",
    )}>
      <div
        ref={overlayRef}
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div className={cn(
        "relative w-[272px] max-w-[85vw] h-full bg-[#0a1a10] flex flex-col",
        "transition-transform duration-300 ease-out shadow-2xl border-r border-white/[0.05]",
        open ? "translate-x-0" : "-translate-x-full",
      )}>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="absolute top-4 right-3.5 w-8 h-8 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all z-10"
        >
          <X size={15} />
        </button>
        <SidebarContent collapsed={false} onNavClick={onClose} />
      </div>
    </div>
  );
}

// ─── Mobile top bar ───────────────────────────────────────────────────────────
function MobileTopBar({ onOpen }: { onOpen: () => void }) {
  const pathname = usePathname();

  const allItems = NAV.filter((e): e is NavItem => "href" in e);
  const current  = allItems.find((item) => isActive(item.href, pathname));

  return (
    <div className="lg:hidden flex items-center justify-between h-14 px-4 bg-[#0a1a10] border-b border-white/[0.05] shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-xl bg-[#FFC928] flex items-center justify-center shrink-0">
          <Sparkles size={12} className="text-[#0D1F17]" strokeWidth={2.5} />
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-heading text-[13px] font-bold text-white/70 tracking-tight shrink-0">AR Books</span>
          {current && (
            <>
              <span className="text-white/15 shrink-0">/</span>
              <span className="text-[12px] font-body font-semibold text-white/40 truncate">{current.label}</span>
            </>
          )}
        </div>
      </div>
      <button
        onClick={onOpen}
        aria-label="Open menu"
        className="w-9 h-9 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all shrink-0"
      >
        <Menu size={18} />
      </button>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function AdminSidebar() {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <MobileTopBar onOpen={() => setMobileOpen(true)} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <aside className={cn(
        "hidden lg:flex shrink-0 h-screen bg-[#0a1a10] text-white flex-col",
        "transition-[width] duration-300 ease-in-out border-r border-white/[0.05]",
        collapsed ? "w-[58px]" : "w-[240px]",
      )}>
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>
    </>
  );
}
