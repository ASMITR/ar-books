"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

const SHELL_EXCLUDED = ["/admin", "/account"];

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const excluded = SHELL_EXCLUDED.some((p) => pathname.startsWith(p));

  if (excluded) return <>{children}</>;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
