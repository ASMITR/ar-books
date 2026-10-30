import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { SetupForm } from "./SetupForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Setup — AR Books" };

// One-time setup page — accessible without auth.
// Server-side check ensures it redirects to /login once setup is complete.
export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  // Check if setup is already done — if so, no one should see this page
  try {
    const setupDoc = await adminDb.collection("settings").doc("setup").get();
    if (setupDoc.exists && setupDoc.data()?.adminCreated === true) {
      redirect("/login");
    }
  } catch {
    // If Firebase isn't reachable, still render the form — the API will validate
  }

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#FFC928] mb-5 rounded-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#080808]">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"
                fill="currentColor" className="text-[#080808]" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
            Admin Setup
          </h1>
          <p className="text-[#6B7280] text-sm font-body mt-2">
            Create the first admin account for AR Books.
            <br />
            <span className="text-[#FFC928] font-semibold">This page works only once.</span>
          </p>
        </div>

        <SetupForm />

        <p className="text-center text-[11px] text-[#4B5563] font-body mt-6">
          After setup, this page will be permanently disabled.
        </p>
      </div>
    </div>
  );
}
