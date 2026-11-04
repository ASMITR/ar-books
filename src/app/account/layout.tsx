import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/auth-server";
import { MemberSidebar } from "@/components/account/MemberSidebar";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden bg-[#F7F5F1]">
      <MemberSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto scrollbar-none">
        <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-8 sm:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
