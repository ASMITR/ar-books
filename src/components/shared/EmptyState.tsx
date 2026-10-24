import Link from "next/link";
import { BookOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, actionLabel, actionHref, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="text-[#E9E7E2] mb-4">
        {icon ?? <BookOpen size={48} strokeWidth={1} />}
      </div>
      <h3 className="font-heading text-2xl text-[#080808] mb-2">{title}</h3>
      {description && (
        <p className="text-[#777777] font-body text-sm max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block bg-[#080808] text-white font-body text-xs font-medium uppercase tracking-wider px-6 py-3 hover:bg-[#789185] transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
