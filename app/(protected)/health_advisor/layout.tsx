import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AppSidebar from "@/app/components/Sidebar/AppSidebar";

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/sign-in");
  if (session.user.role !== "health_advisor") redirect("/403");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar role="health_advisor" />
      <main className="flex-1 ml-72 p-8 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
