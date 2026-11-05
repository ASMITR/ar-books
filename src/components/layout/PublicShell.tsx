import { headers } from "next/headers";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

const SHELL_EXCLUDED = ["/admin", "/account"];

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? hdrs.get("x-invoke-path") ?? "";
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
