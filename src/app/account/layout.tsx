import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/auth-server";
import { MemberSidebar } from "@/components/account/MemberSidebar";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      {/* Thin forest-green top bar */}
      <div className="h-1 bg-gradient-to-r from-[#203A2B] via-[#FFC928] to-[#203A2B]" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
          <MemberSidebar />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
