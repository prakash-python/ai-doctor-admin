// app/api/roles/[id]/route.ts

import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { guard } from "@/app/lib/apiGuard";
import { requireRole } from "@/app/lib/requireRole";
/* ================================
   GET /api/roles/[id] - Get role by ID
================================ */
export const GET = guard(async (
  req: Request,
  { params }: { params: { id: string } }
) => {

  await requireRole("admin");

  const role = await prisma.role.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      _count: { select: { users: true } }
    }
  });

  if (!role)
    return NextResponse.json({ message: "Role not found" }, { status: 404 });

  return NextResponse.json(role);
});

/* ================================
   PUT /api/roles/[id] - Update role
================================ */
export const PUT = guard(async (req: Request, ctx: any) => {
  await requireRole("admin");

   const { id } = await ctx.params; 
  if (!id)
    return NextResponse.json({ message: "Missing role id" }, { status: 400 });

  const { name, description } = await req.json();

  const data: any = {};

  if (name !== undefined) {
    const normalized = name.trim().toLowerCase();
    if (!normalized)
      return NextResponse.json({ message: "Role name required" }, { status: 400 });

    const exists = await prisma.role.findFirst({
      where: {
        name: { equals: normalized, mode: "insensitive" },
        NOT: { id }
      }
    });

    if (exists)
      return NextResponse.json({ message: "Role already exists" }, { status: 400 });

    data.name = normalized;
  }

  if (description !== undefined)
    data.description = description?.trim() || null;

  const updated = await prisma.role.update({
    where: { id },
    data,
    select: { id: true, name: true, description: true, createdAt: true }
  });

  return NextResponse.json({
    status: "success",
    message: "Role updated successfully",
    data: updated
  });
});


/* ================================
   DELETE /api/roles/[id] - Delete role
================================ */
export const DELETE = guard(async (req: Request, ctx: any) => {
  await requireRole("admin");

  const { id } = await ctx.params;     

  if (!id)
    return NextResponse.json({ message: "Missing role id" }, { status: 400 });

  const users = await prisma.user.count({
    where: { roleId: id }
  });

  if (users > 0)
    return NextResponse.json(
      { message: `Role has ${users} users assigned` },
      { status: 400 }
    );

  await prisma.role.delete({ where: { id } });

  return NextResponse.json({
    status: "success",
    message: "Role deleted successfully"
  });
});

