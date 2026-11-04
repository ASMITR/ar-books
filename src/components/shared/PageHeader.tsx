import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  meta?: { label: string; value: string | number }[];
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, meta, action }: PageHeaderProps) {
  return (
    <section className="bg-white border-b border-[#ECEAE5]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[10px] font-body font-bold uppercase tracking-[0.28em] text-[#A8B5A0] mb-2">
                {eyebrow}
              </p>
            )}
            <h1 className="font-heading text-[26px] sm:text-[32px] font-bold text-[#111] leading-none tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="font-body text-[13px] text-[#999] mt-2 leading-relaxed">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-5 shrink-0">
            {meta && meta.map(({ label, value }, i) => (
              <div key={label} className="flex items-center gap-5">
                {i > 0 && <div className="w-px h-8 bg-[#ECEAE5]" />}
                <div className="text-right">
                  <p className="font-heading text-[22px] font-bold text-[#203A2B] leading-none">{value}</p>
                  <p className="text-[10px] font-body text-[#B8B3AB] uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              </div>
            ))}
            {action}
          </div>
        </div>
      </div>
    </section>
  );
}

interface CtaBannerProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href: string;
  label: string;
}

export function CtaBanner({ eyebrow, title, subtitle, href, label }: CtaBannerProps) {
  return (
    <section className="bg-[#FAFAF7] border-t border-[#ECEAE5] py-12 lg:py-14">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-[#0D1F17] px-8 sm:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: "radial-gradient(ellipse at 90% 10%, rgba(255,201,40,0.2) 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(120,145,133,0.2) 0%, transparent 55%)" }} />
          <div className="relative z-10">
            {eyebrow && (
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-px bg-[#C6A66B]" />
                <p className="text-[10px] font-body font-bold uppercase tracking-[0.22em] text-[#A8B5A0]">{eyebrow}</p>
              </div>
            )}
            <h2 className="font-heading text-[26px] sm:text-[32px] font-bold text-white leading-tight">{title}</h2>
            {subtitle && <p className="font-body text-[13px] text-white/40 mt-1">{subtitle}</p>}
          </div>
          <a href={href}
            className="relative z-10 shrink-0 inline-flex items-center gap-2.5 bg-[#FFC928] text-[#0D1F17] font-body text-[11px] font-bold uppercase tracking-[0.15em] px-7 py-3.5 rounded-xl hover:bg-[#FFD54F] transition-colors shadow-sm whitespace-nowrap">
            {label}
          </a>
        </div>
      </div>
    </section>
  );
}
