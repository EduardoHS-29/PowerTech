import { Sidebar } from "@/components/layouts/sidebar";
import { Header } from "@/components/layouts/header";
import { authService } from "@/lib/services/auth/auth.service";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await authService.getCurrentSession();
  if (!session) redirect(ROUTES.LOGIN);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
