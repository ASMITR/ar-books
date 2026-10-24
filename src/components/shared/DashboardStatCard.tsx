import type { LucideIcon } from "lucide-react";

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon?: LucideIcon;
}

export function DashboardStatCard({ label, value, sub, accent = "#080808", icon: Icon }: DashboardStatCardProps) {
  return (
    <div
      className="bg-white border border-[#E9E7E2] rounded-xl p-5 flex items-start gap-4 hover:shadow-sm transition-shadow"
      style={{ borderLeftColor: accent, borderLeftWidth: 3 }}
    >
      {Icon && (
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: accent + "18" }}>
          <Icon size={17} style={{ color: accent }} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-body uppercase tracking-wider text-[#999] mb-1">{label}</p>
        <p className="font-heading text-2xl font-bold leading-none" style={{ color: accent }}>{value}</p>
        {sub && <p className="text-xs text-[#999] mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}
