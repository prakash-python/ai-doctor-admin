import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";


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
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: "success", data: user });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid user id" },
      { status: 400 }
    );
  }
}
/* ================================
   PUT  /api/users/:id   (UPDATE)
================================ */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const { email, password, role } = body;

    const data: any = {};
    if (email) data.email = email;
    if (role) data.role = role;
    if (password) data.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "User updated",
      data: updatedUser,
    });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: "User not found or invalid data" },
      { status: 400 }
    );
  }
}

/* ================================
   DELETE  /api/users/:id
================================ */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await prisma.user.delete({
      where: { id: id },
    });

    return NextResponse.json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: "User not found" },
      { status: 404 }
    );
  }
}
