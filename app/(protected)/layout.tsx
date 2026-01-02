import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import AppSidebar from "../components/Sidebar/AppSidebar";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/sign-in");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar role={session.user.role} />
      <main className="flex-1 ml-72">
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
