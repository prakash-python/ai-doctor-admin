import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { guard } from "@/app/lib/apiGuard";
import { requireRole } from "@/app/lib/requireRole";

export const GET = guard(async (_req: Request, ctx: any) => {
    await requireRole("admin");
    const { id } = await ctx.params;

    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

    const patient = await prisma.patient.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, email: true, mobile: true, createdAt: true } },
            appointments: { include: { doctor: { select: { id: true, name: true } } } },
            prescriptions: { include: { doctor: { select: { id: true, name: true } } } },
            consultations: { include: { advisor: { select: { id: true, name: true } } } },
        },
    });

    if (!patient) return NextResponse.json({ message: "Patient not found" }, { status: 404 });

    return NextResponse.json({ status: "success", data: patient });
});
