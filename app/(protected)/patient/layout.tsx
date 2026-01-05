import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Must be logged in
  if (!session) redirect("/sign-in");

  // Must be admin
  if (session.user.role !== "patient") redirect("/403");

  return children;
}
  