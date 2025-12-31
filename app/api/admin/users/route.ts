import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

/* ============================
   GET /api/users - Fetch all users with role details
============================ */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        mobile: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: "success",
      total: users.length,
      data: users,
    });
  } catch (err) {
    console.error("GET /api/users error:", err);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/* ============================
   POST /api/users - Create new user
============================ */
export async function POST(req: Request) {
  console.log("POST /api/users called");

  try {
    const body = await req.json();
    const { email, mobile, password, roleId } = body;

    // Validation
    if (!email && !mobile) {
      return NextResponse.json(
        { status: "error", message: "Either email or mobile is required" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { status: "error", message: "Password is required" },
        { status: 400 }
      );
    }

    if (!roleId) {
      return NextResponse.json(
        { status: "error", message: "Role ID is required" },
        { status: 400 }
      );
    }

    // Check if role exists
    const roleExists = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!roleExists) {
      return NextResponse.json(
        { status: "error", message: "Invalid role ID" },
        { status: 400 }
      );
    }

    // Check for duplicates
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        return NextResponse.json(
          { status: "error", message: "Email already in use" },
          { status: 400 }
        );
      }
    }

    if (mobile) {
      const existingMobile = await prisma.user.findUnique({
        where: { mobile },
      });
      if (existingMobile) {
        return NextResponse.json(
          { status: "error", message: "Mobile number already in use" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email || null, // optional, can be null
        mobile,
        password: hashedPassword,
        roleId,
      },
      select: {
        id: true,
        email: true,
        mobile: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        status: "success",
        message: "User created successfully",
        data: user,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/users error:", err);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}