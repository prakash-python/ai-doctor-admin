import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, mobile, password, roleId } = body;

    // Validation
    if (!mobile || !password) {
      return NextResponse.json(
        { status: "error", message: "Mobile and password are required" },
        { status: 400 }
      );
    }

    // Default role if not provided (e.g., fetch 'user' role)
    let finalRoleId = roleId;
    if (!roleId) {
      const defaultRole = await prisma.role.findFirst({
        where: { name: "patient" }, // Assume you have a 'patient' role
      });
      if (!defaultRole) {
        return NextResponse.json(
          { status: "error", message: "Default role not found" },
          { status: 500 }
        );
      }
      finalRoleId = defaultRole.id;
    }

    // Check existence
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ mobile }, { email: email || undefined }],
      },
    });
    if (existingUser) {
      return NextResponse.json(
        { status: "error", message: "User with this mobile or email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email || null,
        mobile,
        password: hashedPassword,
        roleId: finalRoleId,
      },
      select: {
        id: true,
        email: true,
        mobile: true,
        role: { select: { name: true } },
      },
    });

    return NextResponse.json(
      { status: "success", message: "User created. Please log in.", data: user },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/auth/signup error:", err);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}