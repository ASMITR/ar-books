"use client";

import { Check, X } from "lucide-react";

const SEQUENCE_RE = /(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|efgh|fghi|ghij|qwer|wert|erty|rtyu|tyui|yuio|uiop|asdf|sdfg|dfgh|fghj|ghjk|hjkl|zxcv|xcvb|cvbn|vbnm)/i;
const COMMON = ["password","password123","welcome1","welcome123","123456","12345678","qwerty","abc123","letmein","admin","iloveyou","monkey","dragon","master","sunshine"];

const rules = [
  { label: "At least 8 characters",                    test: (v: string) => v.length >= 8 },
  { label: "Uppercase (A-Z) and lowercase (a-z)",      test: (v: string) => /[A-Z]/.test(v) && /[a-z]/.test(v) },
  { label: "At least one number (0-9)",                test: (v: string) => /[0-9]/.test(v) },
  { label: "At least one special character (@#$%!*…)", test: (v: string) => /[@#$%!*^&()_\-+=\[\]{};':",./<>?]/.test(v) },
  { label: "No sequences (1234, abcd, qwerty…)",       test: (v: string) => !SEQUENCE_RE.test(v) },
  { label: "Not a common password",                    test: (v: string) => !COMMON.includes(v.toLowerCase()) },
];

export default function PasswordRules({ value }: { value: string }) {
  if (!value) return null;
  return (
    <ul className="flex flex-col gap-1 mt-1">
      {rules.map(({ label, test }) => {
        const ok = test(value);
        return (
          <li key={label} className="flex items-center gap-1.5">
            {ok
              ? <Check size={11} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
              : <X     size={11} className="text-red-400 shrink-0"     strokeWidth={2.5} />}
            <span className={`text-[11px] font-body ${ok ? "text-emerald-600" : "text-[#999]"}`}>{label}</span>
          </li>
        );
      })}
    </ul>
  );
}
