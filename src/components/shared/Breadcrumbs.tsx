import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-[#777777] font-body">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} />}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-[#080808] transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-[#080808]">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
