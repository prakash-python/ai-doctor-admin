import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");


  if (!session.user.hasPassword) redirect("/set-password");

  const role = session.user.role;

  if (role === "admin") redirect("/admin/dashboard");
  if (role === "doctor") redirect("/doctor/dashboard");
  if (role === "health_advisor") redirect("/advisor/dashboard");
  if (role === "patient") redirect("/patient/dashboard");

  redirect("/user/dashboard");
}
