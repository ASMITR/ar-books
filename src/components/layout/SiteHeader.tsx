"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ShoppingCart, Search, Menu, X, User, ChevronDown } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "My Books", href: "/books" },
  { label: "About", href: "/about" },
  { label: "Articles", href: "/articles" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const { count } = useCart();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setRole(null); return; }
    fetch("/api/auth/me").then(r => r.json()).then(d => setRole(d.role ?? null)).catch(() => setRole(null));
  }, [user?.uid]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E9E7E2]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image src="/Horizontal_Logo.png" alt="AR Books" width={197} height={48} className="h-12 w-auto" priority />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs font-body font-medium uppercase tracking-wider text-[#080808] hover:text-[#789185] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link href="/search" aria-label="Search" className="p-2 hover:text-[#789185] transition-colors">
              <Search size={18} />
            </Link>

            {/* Account dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-1 p-2 hover:text-[#789185] transition-colors"
                aria-label="Account"
              >
                <User size={18} />
                <ChevronDown size={12} />
              </button>
              {accountOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#E9E7E2] shadow-lg py-1 z-50"
                  onMouseLeave={() => setAccountOpen(false)}
                >
                  {user ? (
                    <>
                      {role === "admin" ? (
                        <Link href="/admin/dashboard" className="block px-4 py-2 text-sm hover:bg-[#FAF9F6]" onClick={() => setAccountOpen(false)}>Admin Dashboard</Link>
                      ) : (
                        <>
                          <Link href="/account/dashboard" className="block px-4 py-2 text-sm hover:bg-[#FAF9F6]" onClick={() => setAccountOpen(false)}>My Account</Link>
                          <Link href="/account/library" className="block px-4 py-2 text-sm hover:bg-[#FAF9F6]" onClick={() => setAccountOpen(false)}>My Library</Link>
                          <Link href="/account/orders" className="block px-4 py-2 text-sm hover:bg-[#FAF9F6]" onClick={() => setAccountOpen(false)}>My Orders</Link>
                        </>
                      )}
                      <hr className="border-[#E9E7E2] my-1" />
                      <button onClick={() => { signOut(); setAccountOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-[#FAF9F6] text-[#F12F43]">
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="block px-4 py-2 text-sm hover:bg-[#FAF9F6]" onClick={() => setAccountOpen(false)}>Sign In</Link>
                      <Link href="/register" className="block px-4 py-2 text-sm hover:bg-[#FAF9F6]" onClick={() => setAccountOpen(false)}>Create Account</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link href="/cart" aria-label={`Cart (${count})`} className="relative p-2 hover:text-[#789185] transition-colors">
              <ShoppingCart size={18} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#FFC928] text-[#080808] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#E9E7E2] px-4 py-4 flex flex-col gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-body font-medium uppercase tracking-wider text-[#080808] hover:text-[#789185]"
            >
              {l.label}
            </Link>
          ))}
          <hr className="border-[#E9E7E2] my-2" />
          {user ? (
            <>
              {role === "admin" ? (
                <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-sm">Admin Dashboard</Link>
              ) : (
                <>
                  <Link href="/account/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-sm">My Account</Link>
                  <Link href="/account/library" onClick={() => setMobileOpen(false)} className="block py-2 text-sm">My Library</Link>
                </>
              )}
              <button onClick={() => { signOut(); setMobileOpen(false); }} className="text-left py-2 text-sm text-[#F12F43]">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-sm">Sign In</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="block py-2 text-sm">Create Account</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
