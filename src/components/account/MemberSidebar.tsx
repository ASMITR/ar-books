"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, BookOpen, ShoppingBag, Download, User, Shield, HelpCircle, ShoppingCart, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/account/library", label: "My Library", icon: BookOpen },
  { href: "/account/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/account/downloads", label: "Download History", icon: Download },
  { href: "/account/profile", label: "Profile Settings", icon: User },
  { href: "/account/security", label: "Security", icon: Shield },
  { href: "/contact", label: "Help & Support", icon: HelpCircle },
];

export function MemberSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <nav className="flex flex-col gap-0.5">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-body transition-colors",
              pathname === href
                ? "bg-[#080808] text-white"
                : "text-[#777777] hover:bg-[#FAF9F6] hover:text-[#080808]"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
        <Link
          href="/books"
          className="flex items-center gap-3 px-4 py-3 text-sm font-body text-[#777777] hover:bg-[#FAF9F6] hover:text-[#080808] transition-colors"
        >
          <ShoppingCart size={16} />
          Continue Shopping
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 text-sm font-body text-[#F12F43] hover:bg-[#FFF0F0] transition-colors text-left"
        >
          <LogOut size={16} />
          Logout
        </button>
      </nav>
    </aside>
  );
}
