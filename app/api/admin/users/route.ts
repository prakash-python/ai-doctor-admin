import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { guard } from "@/app/lib/apiGuard";
import { requireRole } from "@/app/lib/requireRole";

/* ============================
   GET /api/admin/users
============================ */
export const GET = guard(async () => {
  await requireRole("admin");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
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

  return NextResponse.json({
    status: "success",
    total: users.length,
    data: users
  });
});


/* ============================
   POST /api/admin/users
============================ */
export const POST = guard(async (req: Request) => {
  await requireRole("admin");

  const { email, mobile, password, roleId } = await req.json();

  if (!email && !mobile)
    return NextResponse.json({ message: "Email or mobile required" }, { status: 400 });

  if (!password)
    return NextResponse.json({ message: "Password required" }, { status: 400 });

  if (!roleId)
    return NextResponse.json({ message: "Role is required" }, { status: 400 });

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role)
    return NextResponse.json({ message: "Invalid role" }, { status: 400 });

  if (email) {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
  }

  if (mobile) {
    const exists = await prisma.user.findUnique({ where: { mobile } });
    if (exists)
      return NextResponse.json({ message: "Mobile already exists" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email: email || null, mobile, password: hashed, roleId },
    select: {
      id: true,
      email: true,
      mobile: true,
      createdAt: true,
      role: { select: { id: true, name: true, description: true } }
    }
  });

  return NextResponse.json({
    status: "success",
    message: "User created",
    data: user
  }, { status: 201 });
});
