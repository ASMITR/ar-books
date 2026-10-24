import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/auth-server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") redirect("/admin/login");

  return (
    <div className="h-screen overflow-hidden bg-[#F5F4F0] flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-hidden flex flex-col">{children}</main>
    </div>
  );
}
