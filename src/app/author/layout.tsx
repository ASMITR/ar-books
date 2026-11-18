import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/auth-server";
import { AuthorSidebar } from "@/components/author/AuthorSidebar";

export default async function AuthorLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "author" && user.role !== "admin") redirect("/account/dashboard");

  return (
    <div className="flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden bg-[#F4F2EE]">
      <AuthorSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto scrollbar-none">
        <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-7 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
