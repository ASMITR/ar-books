import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/auth-server";
import { MemberSidebar } from "@/components/account/MemberSidebar";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden bg-[#F4F2EE]">
      <MemberSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto scrollbar-none">
        <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-7 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
