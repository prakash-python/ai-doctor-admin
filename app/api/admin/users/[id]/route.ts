// app/api/users/[id]/route.ts

import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

/* ================================
   GET /api/users/[id] - Get user by ID
================================ */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: user,
    });
  } catch (err) {
    console.error("GET /api/users/[id] error:", err);
    return NextResponse.json(
      { status: "error", message: "Invalid user ID or server error" },
      { status: 400 }
    );
  }
}

/* ================================
   PUT /api/users/[id] - Update user
================================ */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const body = await req.json();
    const { email, mobile, password, roleId } = body;

    // Build update data dynamically
    const updateData: any = {};

    if (email !== undefined) {
      // Allow clearing email (set to null)
      if (email === null || email === "") {
        updateData.email = null;
      } else {
        // Check if email is already used by another user
        const existingEmail = await prisma.user.findFirst({
          where: { email, NOT: { id } },
        });
        if (existingEmail) {
          return NextResponse.json(
            { status: "error", message: "Email already in use by another user" },
            { status: 400 }
          );
        }
        updateData.email = email;
      }
    }

    if (mobile !== undefined) {
      if (!mobile) {
        return NextResponse.json(
          { status: "error", message: "Mobile number is required" },
          { status: 400 }
        );
      }
      // Check if mobile is already used by another user
      const existingMobile = await prisma.user.findFirst({
        where: { mobile, NOT: { id } },
      });
      if (existingMobile) {
        return NextResponse.json(
          { status: "error", message: "Mobile number already in use" },
          { status: 400 }
        );
      }
      updateData.mobile = mobile;
    }

    if (roleId !== undefined) {
      // Validate role exists
      const roleExists = await prisma.role.findUnique({
        where: { id: roleId },
      });
      if (!roleExists) {
        return NextResponse.json(
          { status: "error", message: "Invalid role ID" },
          { status: 400 }
        );
      }
      updateData.roleId = roleId;
    }

    if (password !== undefined && password !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { status: "error", message: "No valid fields provided to update" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error("PUT /api/users/[id] error:", err);
    return NextResponse.json(
      { status: "error", message: "User not found or invalid data" },
      { status: 400 }
    );
  }
}

/* ================================
   DELETE /api/users/[id] - Delete user
================================ */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("DELETE /api/users/[id] error:", err);
    return NextResponse.json(
      { status: "error", message: "User not found or cannot be deleted" },
      { status: 404 }
    );
  }
}