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

  const body = await req.json();
  const {
    email,
    mobile,
    password,
    roleId,
    name,

    // doctor / advisor fields
    specialization,
    qualification,
    experience,
    available,

    // patient fields
    bloodGroup,
    age,
    gender,
  } = body;

  if (!email && !mobile)
    return NextResponse.json({ message: "Email or mobile required" }, { status: 400 });

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

  // default password for created users if not provided
  const toHash = password || "123456";
  const hashed = await bcrypt.hash(toHash, 10);

  const user = await prisma.user.create({
    data: {
      email: email || null,
      mobile,
      password: hashed,
      roleId,
      name: name || null,
    },
    select: {
      id: true,
      email: true,
      mobile: true,
      name: true,
      createdAt: true,
      role: { select: { id: true, name: true, description: true } }
    }
  });

  // create role specific record where needed
  const roleName = role.name;
  try {
    if (roleName === "doctor") {
      if (!specialization || !qualification || typeof experience === "undefined") {
        return NextResponse.json({ message: "Doctor: specialization, qualification and experience are required" }, { status: 400 });
      }

      await prisma.doctor.create({
        data: {
          userId: user.id,
          name: name || (user.email ?? user.mobile),
          specialization,
          qualification,
          experience: Number(experience) || 0,
          available: typeof available === "boolean" ? available : true,
        }
      });
    }

    if (roleName === "patient") {
      if (typeof age === "undefined" || !gender) {
        return NextResponse.json({ message: "Patient: age and gender are required" }, { status: 400 });
      }

      await prisma.patient.create({
        data: {
          userId: user.id,
          name: name || (user.email ?? user.mobile),
          bloodGroup: bloodGroup || null,
          age: Number(age) || 0,
          gender,
        }
      });
    }

    if (roleName === "health_advisor") {
      if (!specialization || !qualification || typeof experience === "undefined") {
        return NextResponse.json({ message: "Health Advisor: specialization, qualification and experience are required" }, { status: 400 });
      }

      await prisma.healthAdvisor.create({
        data: {
          userId: user.id,
          name: name || (user.email ?? user.mobile),
          specialization,
          qualification,
          experience: Number(experience) || 0,
          available: typeof available === "boolean" ? available : true,
        }
      });
    }
  } catch (err: any) {
    // rollback created user if role-specific creation fails
    await prisma.user.delete({ where: { id: user.id } }).catch(() => { });
    return NextResponse.json({ message: err?.message || "Failed to create role record" }, { status: 500 });
  }

  return NextResponse.json({
    status: "success",
    message: "User created",
    data: user
  }, { status: 201 });
});
