// app/api/auth/login/route.ts

import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from "@/app/lib/env";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { status: "error", message: "Missing fields" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { mobile: identifier }],
      },
      select: {
        id: true,
        email: true,
        mobile: true,
        password: true,
        role: { select: { name: true } },
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate tokens using your typed constants
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role.name },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }  // ← Type-safe thanks to JwtTime
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_TTL }
    );

    // Return tokens in body (or set as HttpOnly cookies later)
    return NextResponse.json({
      status: "success",
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          mobile: user.mobile,
          role: user.role.name,
        },
      },
    });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}