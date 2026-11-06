import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb { label: string; href?: string; }

export function Breadcrumbs({ crumbs, dark }: { crumbs: Crumb[]; dark?: boolean }) {
  const base  = dark ? "text-white/40" : "text-[#777777]";
  const hover = dark ? "hover:text-white/80" : "hover:text-[#080808]";
  const curr  = dark ? "text-white/70" : "text-[#080808]";

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1 text-xs font-body ${base}`}>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} />}
          {crumb.href ? (
            <Link href={crumb.href} className={`transition-colors ${hover}`}>
              {crumb.label}
            </Link>
          ) : (
            <span className={curr}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
