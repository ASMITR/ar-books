"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface RichTextProps {
  content: string;
  className?: string;
}

/**
 * Custom li for unordered lists (gold dot bullet).
 */
function UlItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 font-body text-[13px] text-[#777970] leading-relaxed">
      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#C6A66B] mt-[7px]" />
      <span>{children}</span>
    </li>
  );
}

/**
 * Custom li for ordered lists (numbered badge).
 */
function OlItem({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 font-body text-[13px] text-[#777970] leading-relaxed">
      <span className="shrink-0 w-5 h-5 mt-0.5 rounded-full bg-[#203A2B]/10 flex items-center justify-center text-[10px] font-bold text-[#203A2B]">
        {index}
      </span>
      <span>{children}</span>
    </li>
  );
}

const components: Components = {
  // Paragraphs
  p({ children }) {
    return (
      <p className="font-body text-[13px] text-[#777970] leading-[1.9] mb-4 last:mb-0">
        {children}
      </p>
    );
  },

  // Bold
  strong({ children }) {
    return <strong className="font-semibold text-[#242824]">{children}</strong>;
  },

  // Italic
  em({ children }) {
    return <em className="italic text-[#555]">{children}</em>;
  },

  // Unordered list — renders li children with gold dot
  ul({ children }) {
    // Map over children to replace li with UlItem
    const items = Array.isArray(children) ? children : [children];
    return (
      <ul className="my-3 flex flex-col gap-2 pl-1 list-none">
        {items.map((child, i) => {
          if (!child || typeof child !== "object" || !("props" in child)) return child;
          return <UlItem key={i}>{(child as React.ReactElement<{ children?: React.ReactNode }>).props.children}</UlItem>;
        })}
      </ul>
    );
  },

  // Ordered list — renders li children with numbered badges
  ol({ children }) {
    const items = Array.isArray(children) ? children : [children];
    let counter = 0;
    return (
      <ol className="my-3 flex flex-col gap-2 pl-1 list-none">
        {items.map((child, i) => {
          if (!child || typeof child !== "object" || !("props" in child)) return child;
          counter++;
          return (
            <OlItem key={i} index={counter}>
              {(child as React.ReactElement<{ children?: React.ReactNode }>).props.children}
            </OlItem>
          );
        })}
      </ol>
    );
  },

  // li — fallback (shouldn't normally be called since ul/ol handle it above)
  li({ children }) {
    return (
      <li className="flex items-start gap-2.5 font-body text-[13px] text-[#777970] leading-relaxed">
        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#C6A66B] mt-[7px]" />
        <span>{children}</span>
      </li>
    );
  },

  // Headings inside description
  h1({ children }) {
    return (
      <h3 className="font-heading text-[18px] font-bold text-[#242824] mt-5 mb-2 first:mt-0">
        {children}
      </h3>
    );
  },
  h2({ children }) {
    return (
      <h3 className="font-heading text-[16px] font-bold text-[#242824] mt-4 mb-2 first:mt-0">
        {children}
      </h3>
    );
  },
  h3({ children }) {
    return (
      <h4 className="font-heading text-[14px] font-bold text-[#242824] mt-3 mb-1.5 first:mt-0">
        {children}
      </h4>
    );
  },

  // Horizontal rule
  hr() {
    return <hr className="my-4 border-[#E6DFD5]" />;
  },

  // Blockquote — callout style
  blockquote({ children }) {
    return (
      <blockquote className="my-4 pl-4 border-l-2 border-[#C6A66B] bg-[#F5EFE6] py-2 pr-3 rounded-r-sm">
        <span className="font-body text-[12px] italic text-[#777970]">{children}</span>
      </blockquote>
    );
  },

  // Inline code
  code({ children }) {
    return (
      <code className="font-mono text-[12px] bg-[#F5EFE6] text-[#203A2B] px-1.5 py-0.5 rounded-sm">
        {children}
      </code>
    );
  },
};

export function RichText({ content, className = "" }: RichTextProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
