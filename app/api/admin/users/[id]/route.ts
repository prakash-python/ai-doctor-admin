import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { guard } from "@/app/lib/apiGuard";
import { requireRole } from "@/app/lib/requireRole";

/* ================================
   GET /api/admin/users/[id]
================================ */
export const GET = guard(async (
  _req: Request,
  ctx: { params: { id: string } }
) => {
  await requireRole("admin");

  
  const { id } = ctx.params as { id: string };


  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      mobile: true,
      createdAt: true,
      role: { select: { id: true, name: true, description: true } }
    }
  });

  if (!user)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  return NextResponse.json(user);
});

/* ================================
   PUT /api/admin/users/[id]
================================ */
export const PUT = guard(async (req: Request, ctx: any) => {
  await requireRole("admin");

  
  const { id } = ctx.params as { id: string };


  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  const { email, mobile, password, roleId } = await req.json();

  const data: any = {};

  /* EMAIL */
  if (typeof email !== "undefined") {
    if (email === "" || email === null) {
      data.email = null;
    } else if (email !== existingUser.email) {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists)
        return NextResponse.json({ message: "Email already used" }, { status: 400 });
      data.email = email;
    }
  }

  /* MOBILE */
  if (typeof mobile !== "undefined") {
    if (!mobile)
      return NextResponse.json({ message: "Mobile required" }, { status: 400 });

    if (mobile !== existingUser.mobile) {
      const exists = await prisma.user.findUnique({ where: { mobile } });
      if (exists)
        return NextResponse.json({ message: "Mobile already used" }, { status: 400 });
      data.mobile = mobile;
    }
  }

  if (password) data.password = await bcrypt.hash(password, 10);

  if (roleId !== undefined) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role)
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    data.roleId = roleId;
  }

  if (Object.keys(data).length === 0)
    return NextResponse.json({ message: "No valid changes" }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      mobile: true,
      createdAt: true,
      role: { select: { id: true, name: true, description: true } }
    }
  });

  return NextResponse.json({ message: "User updated", data: updated });
});



/* ================================
   DELETE /api/admin/users/[id]
================================ */
export const DELETE = guard(async (_req: Request, ctx: any) => {
  await requireRole("admin");

  const { id } = await ctx.params;

  if (!id)
    return NextResponse.json({ message: "Missing user id" }, { status: 400 });

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ message: "User deleted" });
});
