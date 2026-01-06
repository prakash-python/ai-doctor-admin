import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { guard } from "@/app/lib/apiGuard";
import { requireRole } from "@/app/lib/requireRole";

export const GET = guard(async (_req: Request, ctx: any) => {
    await requireRole("admin");
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

    const doctor = await prisma.doctor.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, email: true, mobile: true } },
        },
    });

    if (!doctor) return NextResponse.json({ message: "Doctor not found" }, { status: 404 });

    return NextResponse.json({ status: "success", data: doctor });
});
