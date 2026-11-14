import Link from "next/link";
import { CheckCircle, BookOpen, ArrowRight, Library } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Membership Activated — AR Books" };

export default function MembershipSuccessPage() {
  return (
    <div className="bg-[#F5EFE6] min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-[#FFFCF7] border border-[#E6DFD5] rounded-sm overflow-hidden shadow-lg">
        {/* Green top bar */}
        <div className="h-[4px] bg-gradient-to-r from-[#203A2B] via-[#315B55] to-[#203A2B]" />

        <div className="px-8 py-10 text-center flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle size={32} className="text-emerald-600" strokeWidth={1.5} />
          </div>

          <div>
            <h1 className="font-heading text-[28px] font-bold text-[#1a1a1a] leading-tight mb-2">
              Welcome to Your Membership!
            </h1>
            <p className="font-body text-[14px] text-[#777970] leading-relaxed max-w-sm mx-auto">
              Your subscription is being activated. You&apos;ll receive a confirmation email shortly.
              It may take a moment for access to fully activate.
            </p>
          </div>

          {/* What to do next */}
          <div className="w-full flex flex-col gap-3 text-left bg-[#F5EFE6] border border-[#E6DFD5] rounded-sm p-5">
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[#A8B5A0]">Next steps</p>
            {[
              { Icon: Library,  text: "Visit your membership library to start reading" },
              { Icon: BookOpen, text: "Download eligible eBooks on your plan"          },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#203A2B]/10 rounded-sm flex items-center justify-center shrink-0">
                  <Icon size={12} className="text-[#203A2B]" strokeWidth={1.8} />
                </div>
                <span className="font-body text-[13px] text-[#555]">{text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link href="/account/membership/library"
              className="flex-1 flex items-center justify-center gap-2 bg-[#203A2B] text-[#FFFCF7]
                font-body text-[11px] font-bold uppercase tracking-[0.15em] px-5 py-3.5 rounded-sm
                hover:bg-[#2c5040] transition-colors">
              <BookOpen size={13} /> My Library
            </Link>
            <Link href="/account/membership"
              className="flex-1 flex items-center justify-center gap-2 border border-[#E6DFD5] text-[#555]
                font-body text-[11px] font-bold uppercase tracking-[0.15em] px-5 py-3.5 rounded-sm
                hover:border-[#203A2B] hover:text-[#203A2B] transition-colors">
              My Membership <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
