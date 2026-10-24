"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function AdminModal({ open, onClose, title, subtitle, children, maxWidth = "max-w-md" }: AdminModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} overflow-hidden max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EEE9] bg-[#FAFAF8] shrink-0">
          <div>
            <h2 className="font-heading text-[15px] font-bold text-[#0a0a0a]">{title}</h2>
            {subtitle && <p className="text-[11px] text-[#9e9a94] font-body mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#bbb] hover:text-[#0a0a0a] hover:bg-[#F0EEE9] transition-all"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
