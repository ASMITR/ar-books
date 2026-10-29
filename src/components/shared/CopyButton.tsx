"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-[11px] font-body text-[#A8B5A0] hover:text-[#203A2B] transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check size={10} strokeWidth={3} /> : <Copy size={10} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
