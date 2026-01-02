import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { guard } from "@/app/lib/apiGuard";
import { requireRole } from "@/app/lib/requireRole";

/* ================================
   GET /api/roles  (ADMIN ONLY)
================================ */
export const GET = guard(async () => {
  await requireRole("admin");

  const roles = await prisma.role.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      _count: { select: { users: true } },
    },
  });

  return NextResponse.json({
    status: "success",
    total: roles.length,
    data: roles,
  });
});

/* ================================
   POST /api/roles  (ADMIN ONLY)
================================ */
export const POST = guard(async (req: Request) => {
  await requireRole("admin");

  const body = await req.json();
  const { name, description } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ message: "Role name required" }, { status: 400 });
  }

  const normalizedName = name.trim().toLowerCase();

  const exists = await prisma.role.findFirst({
    where: { name: { equals: normalizedName, mode: "insensitive" } },
  });

  if (exists)
    return NextResponse.json({ message: "Role already exists" }, { status: 400 });

  const role = await prisma.role.create({
    data: { name: normalizedName, description: description?.trim() || null },
  });

  return NextResponse.json({ status: "success", data: role }, { status: 201 });
});
