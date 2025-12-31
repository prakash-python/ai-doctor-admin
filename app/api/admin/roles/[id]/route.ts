// app/api/roles/[id]/route.ts

import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

/* ================================
   GET /api/roles/[id] - Get role by ID
================================ */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const role = await prisma.role.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        { status: "error", message: "Role not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: role,
    });
  } catch (err) {
    console.error("GET /api/roles/[id] error:", err);
    return NextResponse.json(
      { status: "error", message: "Invalid role ID" },
      { status: 400 }
    );
  }
}

/* ================================
   PUT /api/roles/[id] - Update role
================================ */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const body = await req.json();
    const { name, description } = body;

    const updateData: any = {};

    if (name !== undefined) {
      if (!name || name.trim() === "") {
        return NextResponse.json(
          { status: "error", message: "Role name cannot be empty" },
          { status: 400 }
        );
      }

      const normalizedName = name.trim().toLowerCase();

      // Check uniqueness excluding current role
      const existingRole = await prisma.role.findFirst({
        where: {
          name: { equals: normalizedName, mode: "insensitive" },
          NOT: { id },
        },
      });

      if (existingRole) {
        return NextResponse.json(
          { status: "error", message: "Another role with this name already exists" },
          { status: 400 }
        );
      }

      updateData.name = normalizedName;
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { status: "error", message: "No fields provided to update" },
        { status: 400 }
      );
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (err: any) {
    console.error("PUT /api/roles/[id] error:", err);
    if (err.code === "P2025") {
      return NextResponse.json(
        { status: "error", message: "Role not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { status: "error", message: "Failed to update role" },
      { status: 400 }
    );
  }
}

/* ================================
   DELETE /api/roles/[id] - Delete role
================================ */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // Optional: Prevent deletion if role has assigned users
    const userCount = await prisma.user.count({
      where: { roleId: id },
    });

    if (userCount > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: `Cannot delete role. ${userCount} user(s) are assigned to this role.`,
        },
        { status: 400 }
      );
    }

    await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json({
      status: "success",
      message: "Role deleted successfully",
    });
  } catch (err: any) {
    console.error("DELETE /api/roles/[id] error:", err);
    if (err.code === "P2025") {
      return NextResponse.json(
        { status: "error", message: "Role not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { status: "error", message: "Failed to delete role" },
      { status: 500 }
    );
  }
}