import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      mobile: true,
      createdAt: true,
      role: {
        select: { id: true, name: true, description: true }
      }
    }
  });

  return NextResponse.json({ status: "success", user });
}
