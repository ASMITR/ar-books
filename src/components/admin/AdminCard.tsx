import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}

export function AdminCard({ children, className, title, action }: AdminCardProps) {
  return (
    <div className={cn("bg-white border border-[#E8E6E1] rounded-xl overflow-hidden shadow-sm", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EEE9] bg-[#FAFAF8]">
          {title && <h2 className="font-heading text-[15px] font-bold text-[#0a0a0a] tracking-tight">{title}</h2>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
