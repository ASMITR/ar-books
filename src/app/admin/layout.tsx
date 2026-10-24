import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/auth-server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 min-w-0 flex flex-col lg:overflow-hidden">{children}</main>
    </div>
  );
}
