"use client";

import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react";
import { cn } from "cn";

// ─── Spinner ────────────────────────────────────────────────────────────────
function Spinner({ light = false }: { light?: boolean }) {
  return (
    <span
      className={cn(
        "w-3.5 h-3.5 rounded-full border-2 animate-spin shrink-0",
        light
          ? "border-white/30 border-t-white"
          : "border-[#080808]/20 border-t-[#080808]",
      )}
      aria-hidden
    />
  );
}

// ─── Variants ────────────────────────────────────────────────────────────────
const base =
  "inline-flex items-center justify-center gap-2 font-body font-semibold whitespace-nowrap select-none transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0";

const variants = {
  /** Yellow brand CTA — page-level Add / Create / Edit actions */
  primary:
    "bg-[#FFC928] text-[#080808] hover:bg-[#F2B916] active:scale-[0.98] shadow-sm focus-visible:ring-[#FFC928]/60 rounded-lg text-[13px] px-4 py-2.5",

  /** Dark/filled — used in full-page forms (BookForm save) */
  dark: "bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] active:scale-[0.98] shadow-sm focus-visible:ring-[#0a0a0a]/30 rounded-lg text-[14px] px-6 py-3",

  /** Outlined ghost — modal Cancel / secondary actions */
  secondary:
    "border border-[#E6E3DD] bg-transparent text-[#555] hover:bg-[#F2F0EC] hover:border-[#D0CEC9] focus-visible:ring-[#789185]/30 rounded-lg text-sm px-4 py-2.5",

  /** Danger — delete, destructive actions */
  danger:
    "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 focus-visible:ring-red-300/50 rounded-lg text-[13px] px-3.5 py-2",

  /** Small pill — inline table row actions (Edit, View, Publish…) */
  inline:
    "bg-[#F2F0EC] text-[#555] hover:bg-[#E8E5DF] hover:text-[#080808] focus-visible:ring-[#789185]/30 rounded-md text-xs px-2.5 py-1.5",

  /** Subtle link-style — secondary inline (View ↗, Back) */
  ghost:
    "bg-transparent text-[#888] hover:text-[#080808] focus-visible:ring-[#789185]/30 rounded-md text-xs px-2 py-1",
} as const;

export type AdminButtonVariant = keyof typeof variants;

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconEnd?: ReactNode;
}

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(
  (
    {
      variant = "primary",
      loading = false,
      loadingText,
      icon,
      iconEnd,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isLight = variant === "dark";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], className)}
        {...props}
      >
        {loading ? (
          <>
            <Spinner light={isLight} />
            <span>{loadingText ?? children}</span>
          </>
        ) : (
          <>
            {icon && <span className="[&_svg]:size-[14px]">{icon}</span>}
            {children}
            {iconEnd && <span className="[&_svg]:size-[14px]">{iconEnd}</span>}
          </>
        )}
      </button>
    );
  },
);

AdminButton.displayName = "AdminButton";
