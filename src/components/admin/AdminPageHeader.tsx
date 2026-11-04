import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#E8E4DE]">
      <div>
        <h1 className="font-heading text-[24px] font-bold text-[#0a0a0a] leading-tight">{title}</h1>
        {description && <p className="text-[13px] font-body text-[#999] mt-1">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
