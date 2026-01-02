import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function requireRole(role: string) {
  const session = await getServerSession(authOptions);

  if (!session) throw new Error("NOT_AUTHENTICATED");
  if (session.user.role !== role) throw new Error("NOT_AUTHORIZED");

  return session;
}
