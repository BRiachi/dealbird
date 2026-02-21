import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

import { headers } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || "";
  const isLinksPage = pathname === "/dashboard/links" || pathname.startsWith("/dashboard/links/");

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main content */}
      <div className="flex-1 min-w-0 pt-16 lg:pt-8">
        {/* Top bar — hidden on mobile (sidebar handles it) */}
        <nav className="hidden lg:flex sticky top-8 z-40 h-10 px-8 items-center justify-end">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/proposals/new" className="px-4 py-2 bg-[#C8FF00] text-black text-sm font-bold rounded-lg hover:bg-[#9FCC00] transition-all">
              + New Proposal
            </Link>
            <div className="flex items-center gap-3">
              {session.user.image ? (
                <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 bg-[#C8FF00] rounded-full flex items-center justify-center text-xs font-bold">
                  {session.user.name?.charAt(0) || "U"}
                </div>
              )}
              <span className="text-sm font-semibold hidden sm:block">{session.user.name || session.user.email}</span>
            </div>
          </div>
        </nav>
        <main className={
          isLinksPage
            ? "w-full h-[calc(100vh-10vh)]" // Adjust as needed to fill remaining space
            : "max-w-[1120px] mx-auto px-6 lg:px-10 py-8"
        }>
          {children}
        </main>
      </div>
    </div>
  );
}
