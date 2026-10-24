import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#E9E7E2]">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[#080808]">{title}</h1>
        {description && <p className="text-sm font-body text-[#999] mt-0.5">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
