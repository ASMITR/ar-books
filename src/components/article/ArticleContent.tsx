"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  // ── Headings ───────────────────────────────────────────────────────────────
  h1: ({ children }) => (
    <h1 className="font-heading text-[28px] sm:text-[32px] font-bold text-[#1a2318] leading-tight mt-12 mb-4 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-heading text-[22px] sm:text-[26px] font-bold text-[#1a2318] leading-tight mt-10 mb-4 pb-2 border-b border-[#E6DFD5]">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-heading text-[18px] sm:text-[20px] font-bold text-[#242824] leading-snug mt-8 mb-3">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="font-heading text-[16px] font-bold text-[#242824] mt-6 mb-2">
      {children}
    </h4>
  ),

  // ── Paragraph ─────────────────────────────────────────────────────────────
  p: ({ children }) => (
    <p className="font-body text-[15px] sm:text-[16px] text-[#3d3d3d] leading-[1.85] mb-5">
      {children}
    </p>
  ),

  // ── Bold / Italic ─────────────────────────────────────────────────────────
  strong: ({ children }) => (
    <strong className="font-semibold text-[#1a2318]">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-[#555]">{children}</em>
  ),

  // ── Links ─────────────────────────────────────────────────────────────────
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-[#203A2B] underline underline-offset-2 decoration-[#C6A66B]/60 hover:text-[#315B55] hover:decoration-[#C6A66B] transition-colors font-medium"
    >
      {children}
    </a>
  ),

  // ── Blockquote ────────────────────────────────────────────────────────────
  blockquote: ({ children }) => (
    <blockquote className="relative my-8 pl-6 border-l-[3px] border-[#C6A66B] bg-[#FDF8F0] py-4 pr-5 rounded-r-sm">
      <div className="absolute top-3 left-4 text-[#C6A66B] text-3xl leading-none font-heading select-none opacity-40">&ldquo;</div>
      <div className="font-body text-[15px] text-[#555] leading-[1.8] italic pl-4">
        {children}
      </div>
    </blockquote>
  ),

  // ── Lists ─────────────────────────────────────────────────────────────────
  ul: ({ children }) => (
    <ul className="my-5 pl-0 space-y-2 list-none">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-5 pl-0 space-y-2 list-none counter-reset-[item]">
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => {
    // Check if parent is ordered list by looking at the node
    const isOrdered = (props as { node?: { type?: string; ordered?: boolean } }).node?.ordered;
    return (
      <li className="flex items-start gap-3 font-body text-[15px] text-[#3d3d3d] leading-[1.8]">
        <span className={`shrink-0 mt-[5px] ${isOrdered
          ? "w-5 h-5 rounded-full bg-[#203A2B]/10 text-[#203A2B] text-[10px] font-bold flex items-center justify-center"
          : "w-[6px] h-[6px] rounded-full bg-[#C6A66B] mt-[10px]"
        }`}>
          {isOrdered ? null : null}
        </span>
        <span className="flex-1">{children}</span>
      </li>
    );
  },

  // ── Horizontal rule ───────────────────────────────────────────────────────
  hr: () => (
    <div className="my-10 flex items-center gap-4">
      <div className="flex-1 h-px bg-[#E6DFD5]" />
      <span className="text-[#C6A66B] text-lg">✦</span>
      <div className="flex-1 h-px bg-[#E6DFD5]" />
    </div>
  ),

  // ── Code (inline + block) ─────────────────────────────────────────────────
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="block bg-[#1a2318] text-[#A8D5A2] font-mono text-[13px] leading-[1.7] p-5 rounded-sm overflow-x-auto my-6 whitespace-pre">
          {children}
        </code>
      );
    }
    return (
      <code className="bg-[#F0EBE3] text-[#203A2B] font-mono text-[13px] px-1.5 py-0.5 rounded">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <div className="my-6">{children}</div>,

  // ── Images ────────────────────────────────────────────────────────────────
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      className="w-full rounded-sm border border-[#E6DFD5] my-6 shadow-sm"
    />
  ),

  // ── Tables (GFM) ─────────────────────────────────────────────────────────
  table: ({ children }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm font-body border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[#203A2B] text-[#FFFCF7]">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left text-[11px] uppercase tracking-[0.08em] font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 border-b border-[#E6DFD5] text-[#3d3d3d]">{children}</td>
  ),
  tr: ({ children }) => (
    <tr className="even:bg-[#FAF9F6] hover:bg-[#F5EFE6] transition-colors">{children}</tr>
  ),
};

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div className="min-w-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
