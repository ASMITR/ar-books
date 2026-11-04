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
    <div className="flex flex-col h-full overflow-hidden bg-[#F3F1ED]">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-[#E8E4DE] px-5 sm:px-7 lg:px-8" style={{ minHeight: 64 }}>
        <div className="flex items-center justify-between gap-4 h-full py-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <h1 className="font-heading text-[20px] sm:text-[23px] font-bold text-[#0a0a0a] leading-tight tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[12px] font-body text-[#a09c96] truncate">{subtitle}</p>
            )}
          </div>
          {action && (
            <div className="shrink-0 flex items-center gap-2">{action}</div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${noPadding ? "" : "p-4 sm:p-6 lg:p-8"}`}>
        {children}
      </div>
    </div>
  );
}
