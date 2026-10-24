import type { ReactNode } from "react";

interface AdminShellProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  noPadding?: boolean;
}

export function AdminShell({ title, subtitle, action, children, noPadding }: AdminShellProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F4F3F0]">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-[#E8E6E1] px-8" style={{ minHeight: 76 }}>
        <div className="flex items-center justify-between gap-6 h-full py-4">
          <div className="flex flex-col gap-0.5 min-w-0">
            <h1 className="font-heading text-[22px] font-bold text-[#0a0a0a] leading-tight tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[13px] font-body text-[#9e9a94] truncate">{subtitle}</p>
            )}
          </div>
          {action && (
            <div className="shrink-0 flex items-center gap-2">{action}</div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${noPadding ? "" : "p-8"}`}>
        {children}
      </div>
    </div>
  );
}
