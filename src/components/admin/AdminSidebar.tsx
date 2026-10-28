"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import {
  LayoutDashboard, BookOpen, Tag, ShoppingBag,
  CreditCard, Users, Download, Ticket, FileText, Home,
  User, Settings, LogOut, ChevronDown, PanelLeftClose, PanelLeftOpen, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Overview", icon: LayoutDashboard,
    items: [{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Catalog", icon: BookOpen,
    items: [
      { href: "/admin/books", label: "Books", icon: BookOpen },
      { href: "/admin/categories", label: "Categories", icon: Tag },
      { href: "/admin/articles", label: "Articles", icon: FileText },
    ],
  },
  {
    label: "Commerce", icon: ShoppingBag,
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/payments", label: "Payments", icon: CreditCard },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/downloads", label: "Downloads", icon: Download },
      { href: "/admin/coupons", label: "Coupons", icon: Ticket },
    ],
  },
  {
    label: "Site", icon: Settings,
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: Home },
      { href: "/admin/profile", label: "Author Profile", icon: User },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

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

  const getInitialOpen = () => {
    const map: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      map[g.label] = g.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
    });
    return map;
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(getInitialOpen);
  const toggleGroup = (label: string) => setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={cn("flex items-center h-[68px] border-b border-white/[0.06] shrink-0 px-4", collapsed ? "justify-center" : "gap-3")}>
        {!collapsed ? (
          <>
            <Link href="/" className="flex-1 min-w-0">
              <Image src="/Horizontal_Logo.png" alt="AR Books" width={110} height={30} className="brightness-0 invert opacity-90" />
            </Link>
            <button onClick={() => setCollapsed(true)} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.06] transition-all" title="Collapse">
              <PanelLeftClose size={14} />
            </button>
          </>
        ) : (
          <Link href="/">
            <Image src="/Icon.png" alt="AR Books" width={28} height={28} className="brightness-0 invert opacity-80" />
          </Link>
        )}
      </div>

      {collapsed && (
        <div className="px-3 pt-3 shrink-0">
          <button onClick={() => setCollapsed(false)} className="w-full flex items-center justify-center h-9 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.06] transition-all" title="Expand">
            <PanelLeftOpen size={14} />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navGroups.map((group) => {
          const GroupIcon = group.icon;
          const isGroupActive = group.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
          const isOpen = !collapsed && (openGroups[group.label] ?? false);

          if (collapsed) {
            return (
              <div key={group.label} className="space-y-0.5 pb-1">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href + "/"));
                  return (
                    <Link key={href} href={href} title={label} onClick={onNavClick}
                      className={cn("flex items-center justify-center w-full h-10 rounded-xl transition-all duration-150",
                        active ? "bg-[#FFC928]/20 text-[#FFC928]" : "text-white/30 hover:bg-white/[0.06] hover:text-white/60"
                      )}>
                      <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                    </Link>
                  );
                })}
              </div>
            );
          }

          return (
            <div key={group.label}>
              <button onClick={() => toggleGroup(group.label)}
                className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-body font-medium transition-all duration-150 group",
                  isGroupActive && !isOpen ? "bg-white/[0.06] text-white/80" : isOpen ? "bg-white/[0.04] text-white/70" : "text-white/35 hover:bg-white/[0.04] hover:text-white/70"
                )}>
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
                  isGroupActive || isOpen ? "bg-[#FFC928]/15" : "bg-white/[0.04] group-hover:bg-white/[0.07]"
                )}>
                  <GroupIcon size={13} strokeWidth={2} className={cn(isGroupActive || isOpen ? "text-[#FFC928]" : "text-white/30 group-hover:text-white/50")} />
                </div>
                <span className="flex-1 text-left text-[12.5px]">{group.label}</span>
                <ChevronDown size={13} className={cn("shrink-0 text-white/15 transition-transform duration-200", isOpen && "rotate-180")} />
              </button>

              {isOpen && (
                <div className="mt-0.5 ml-3 pl-3 border-l border-white/[0.07] space-y-0.5 pb-1">
                  {group.items.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href + "/"));
                    return (
                      <Link key={href} href={href} onClick={onNavClick}
                        className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-body transition-all duration-150 group",
                          active ? "bg-[#FFC928] text-[#080808] font-semibold" : "text-white/40 hover:bg-white/[0.06] hover:text-white/80"
                        )}>
                        <Icon size={13} strokeWidth={active ? 2.5 : 2} className={cn("shrink-0", active ? "text-[#080808]" : "text-white/25 group-hover:text-white/50")} />
                        <span>{label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] p-3 shrink-0 space-y-0.5">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] mb-1">
            <div className="w-7 h-7 rounded-full bg-[#FFC928]/15 border border-[#FFC928]/20 flex items-center justify-center shrink-0">
              <User size={12} className="text-[#FFC928]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-body text-white/60 truncate leading-none">{user?.email ?? "Admin"}</p>
              <p className="text-[10px] text-white/20 mt-0.5 font-body tracking-wide">Administrator</p>
            </div>
          </div>
        )}
        <Link href="/" target="_blank" title={collapsed ? "Visit site" : undefined}
          className={cn("flex items-center gap-3 w-full rounded-xl text-[12.5px] font-body text-white/30 hover:bg-white/[0.05] hover:text-white/60 transition-all duration-150",
            collapsed ? "justify-center h-10" : "px-3 py-2.5"
          )}>
          <Home size={13} className="shrink-0" />
          {!collapsed && <span>Visit site</span>}
        </Link>
        <button onClick={signOut} title={collapsed ? "Sign out" : undefined}
          className={cn("flex items-center gap-3 w-full rounded-xl text-[12.5px] font-body text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150",
            collapsed ? "justify-center h-10" : "px-3 py-2.5"
          )}>
          <LogOut size={13} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between h-14 px-4 bg-[#0a1510] border-b border-white/[0.06] shrink-0">
        <Link href="/">
          <Image src="/Horizontal_Logo.png" alt="AR Books" width={100} height={28} className="brightness-0 invert opacity-80" />
        </Link>
        <button onClick={() => setMobileOpen(true)} className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-[260px] h-full bg-[#0a1510] flex flex-col shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-colors">
              <X size={17} />
            </button>
            <SidebarContent collapsed={false} setCollapsed={() => {}} onNavClick={handleNavClick} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden lg:flex shrink-0 h-screen bg-[#0a1510] text-white flex-col transition-all duration-300 ease-in-out border-r border-white/[0.05]",
        collapsed ? "w-[64px]" : "w-[256px]"
      )}>
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>
    </>
  );
}
