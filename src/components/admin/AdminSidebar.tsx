"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import {
  LayoutDashboard, BookOpen, Tag, ShoppingBag,
  CreditCard, Users, Download, Ticket, FileText, Home,
  User, Settings, LogOut, ChevronDown, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Catalog",
    icon: BookOpen,
    items: [
      { href: "/admin/books", label: "Books", icon: BookOpen },
      { href: "/admin/categories", label: "Categories", icon: Tag },
      { href: "/admin/articles", label: "Articles", icon: FileText },
    ],
  },
  {
    label: "Commerce",
    icon: ShoppingBag,
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/payments", label: "Payments", icon: CreditCard },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/downloads", label: "Downloads", icon: Download },
      { href: "/admin/coupons", label: "Coupons", icon: Ticket },
    ],
  },
  {
    label: "Site",
    icon: Settings,
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: Home },
      { href: "/admin/profile", label: "Author Profile", icon: User },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const getInitialOpen = () => {
    const map: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      map[g.label] = g.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + "/")
      );
    });
    return map;
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(getInitialOpen);
  const [collapsed, setCollapsed] = useState(false);

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside
      className={cn(
        "shrink-0 h-screen bg-[#0f0f0e] text-white flex flex-col transition-all duration-300 ease-in-out border-r border-white/[0.06]",
        collapsed ? "w-[68px]" : "w-[272px]"
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex items-center h-[72px] border-b border-white/[0.07] shrink-0 px-4",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="w-9 h-9 rounded-xl bg-[#FFC928] flex items-center justify-center shrink-0 shadow-md">
          <BookOpen size={16} className="text-[#080808]" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[14px] font-bold tracking-widest text-white leading-none">
                AR BOOKS
              </p>
              <p className="text-[11px] text-white/30 font-body uppercase tracking-wider mt-0.5">
                Admin Console
              </p>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.07] transition-all"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={15} />
            </button>
          </>
        )}
      </div>

      {/* Collapsed expand */}
      {collapsed && (
        <div className="px-3 pt-3 shrink-0">
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center h-9 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.07] transition-all"
            title="Expand sidebar"
          >
            <PanelLeftOpen size={15} />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navGroups.map((group) => {
          const GroupIcon = group.icon;
          const isGroupActive = group.items.some(
            (item) => pathname === item.href || pathname.startsWith(item.href + "/")
          );
          const isOpen = !collapsed && (openGroups[group.label] ?? false);

          if (collapsed) {
            // Collapsed: icon-only for each item
            return (
              <div key={group.label} className="space-y-0.5 pb-1">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active =
                    pathname === href ||
                    (href !== "/admin/dashboard" && pathname.startsWith(href + "/"));
                  return (
                    <Link
                      key={href}
                      href={href}
                      title={label}
                      className={cn(
                        "flex items-center justify-center w-full h-10 rounded-xl transition-all duration-150",
                        active
                          ? "bg-[#FFC928]/15 text-[#FFC928]"
                          : "text-white/35 hover:bg-white/[0.07] hover:text-white/70"
                      )}
                    >
                      <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                    </Link>
                  );
                })}
              </div>
            );
          }

          // Expanded: dropdown accordion
          return (
            <div key={group.label}>
              {/* Group trigger button */}
              <button
                onClick={() => toggleGroup(group.label)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-body font-medium transition-all duration-150 group",
                  isGroupActive && !isOpen
                    ? "bg-white/[0.07] text-white"
                    : isOpen
                    ? "bg-white/[0.05] text-white"
                    : "text-white/45 hover:bg-white/[0.05] hover:text-white/80"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
                    isGroupActive || isOpen
                      ? "bg-[#FFC928]/15"
                      : "bg-white/[0.05] group-hover:bg-white/[0.08]"
                  )}
                >
                  <GroupIcon
                    size={14}
                    strokeWidth={2}
                    className={cn(
                      isGroupActive || isOpen ? "text-[#FFC928]" : "text-white/40 group-hover:text-white/60"
                    )}
                  />
                </div>
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown
                  size={14}
                  className={cn(
                    "shrink-0 text-white/20 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              {/* Dropdown items */}
              {isOpen && (
                <div className="mt-1 ml-3 pl-3.5 border-l border-white/[0.08] space-y-0.5 pb-1">
                  {group.items.map(({ href, label, icon: Icon }) => {
                    const active =
                      pathname === href ||
                      (href !== "/admin/dashboard" && pathname.startsWith(href + "/"));
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-body transition-all duration-150 group",
                          active
                            ? "bg-[#FFC928] text-[#0a0a0a] font-semibold shadow-sm"
                            : "text-white/45 hover:bg-white/[0.07] hover:text-white/90"
                        )}
                      >
                        <Icon
                          size={13}
                          strokeWidth={active ? 2.5 : 2}
                          className={cn(
                            "shrink-0",
                            active ? "text-[#0a0a0a]" : "text-white/30 group-hover:text-white/60"
                          )}
                        />
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
      <div className="border-t border-white/[0.07] p-3 shrink-0 space-y-0.5">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.04] mb-1.5">
            <div className="w-8 h-8 rounded-full bg-[#FFC928]/15 border border-[#FFC928]/20 flex items-center justify-center shrink-0">
              <User size={13} className="text-[#FFC928]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-body text-white/75 truncate leading-none font-medium">
                {user?.email ?? "Admin"}
              </p>
              <p className="text-[10.5px] text-white/25 mt-0.5 font-body tracking-wide">
                Administrator
              </p>
            </div>
          </div>
        )}

        <Link
          href="/"
          target="_blank"
          title={collapsed ? "Visit site" : undefined}
          className={cn(
            "flex items-center gap-3 w-full rounded-xl text-[13px] font-body text-white/35 hover:bg-white/[0.06] hover:text-white/70 transition-all duration-150",
            collapsed ? "justify-center h-10" : "px-3 py-2.5"
          )}
        >
          <Home size={14} className="shrink-0" />
          {!collapsed && <span>Visit site</span>}
        </Link>

        <button
          onClick={signOut}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "flex items-center gap-3 w-full rounded-xl text-[13px] font-body text-white/35 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150",
            collapsed ? "justify-center h-10" : "px-3 py-2.5"
          )}
        >
          <LogOut size={14} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
