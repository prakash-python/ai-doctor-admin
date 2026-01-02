import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "../[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionId) {
    return Response.json({ valid: false });
  }

  const active = await prisma.session.findFirst({
    where: {
      id: session.user.sessionId,
      revoked: false,
      expires: { gt: new Date() }
    }
  });

  return Response.json({ valid: !!active });
}
