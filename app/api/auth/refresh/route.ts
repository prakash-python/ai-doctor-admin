// app/api/auth/refresh/route.ts

import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWT_SECRET, ACCESS_TOKEN_TTL } from "@/app/lib/env";
import type { JwtPayload } from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json(
        { status: "error", message: "Refresh token required" },
        { status: 400 }
      );
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as JwtPayload & { userId: string };

    if (!decoded.userId) {
      return NextResponse.json(
        { status: "error", message: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: { select: { name: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user.id, role: user.role.name },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    return NextResponse.json({
      status: "success",
      data: { accessToken: newAccessToken },
    });
  } catch (err) {
    console.error("POST /api/auth/refresh error:", err);
    return NextResponse.json(
      { status: "error", message: "Invalid or expired refresh token" },
      { status: 401 }
    );
  }
}
