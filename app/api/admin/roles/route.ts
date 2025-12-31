// app/api/roles/route.ts

import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

/* ================================
   GET /api/roles - Get all roles
================================ */
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        _count: {
          select: { users: true }, // Optional: count how many users have this role
        },
      },
    });

    return NextResponse.json({
      status: "success",
      total: roles.length,
      data: roles,
    });
  } catch (err) {
    console.error("GET /api/roles error:", err);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

/* ================================
   POST /api/roles - Create new role
================================ */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { status: "error", message: "Role name is required" },
        { status: 400 }
      );
    }

    const normalizedName = name.trim().toLowerCase();

    // Check if role with same name already exists (case-insensitive)
    const existingRole = await prisma.role.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: "insensitive",
        },
      },
    });

    if (existingRole) {
      return NextResponse.json(
        { status: "error", message: "Role with this name already exists" },
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: {
        name: normalizedName,
        description: description?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Role created successfully",
        data: role,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/roles error:", err);
    if (err.code === "P2002") {
      return NextResponse.json(
        { status: "error", message: "Role name must be unique" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}