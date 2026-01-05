import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { guard } from "@/app/lib/apiGuard";

export const GET = guard(async (_req: Request, ctx: any) => {
    const { id } = await ctx.params;
    const item = await prisma.prescription.findUnique({ where: { id }, include: { doctor: true, patient: true } });
    if (!item) return NextResponse.json({ message: "Prescription not found" }, { status: 404 });
    return NextResponse.json({ status: "success", data: item });
});

export const PUT = guard(async (req: Request, ctx: any) => {
    const session = ctx.session;
    const role = session.user.role;
    const { id } = await ctx.params;

    const { diagnosis, medicines } = await req.json();
    const item = await prisma.prescription.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ message: "Prescription not found" }, { status: 404 });

    if (role === "doctor") {
        const myDoc = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
        if (!myDoc || myDoc.id !== item.doctorId) return NextResponse.json({ message: "Not permitted" }, { status: 403 });
        const updated = await prisma.prescription.update({ where: { id }, data: { diagnosis: diagnosis ?? item.diagnosis, medicines: medicines ?? item.medicines } });
        return NextResponse.json({ status: "success", data: updated });
    }

    if (role === "admin") {
        const updated = await prisma.prescription.update({ where: { id }, data: { diagnosis: diagnosis ?? item.diagnosis, medicines: medicines ?? item.medicines } });
        return NextResponse.json({ status: "success", data: updated });
    }

    return NextResponse.json({ message: "Not permitted" }, { status: 403 });
});

export const DELETE = guard(async (_req: Request, ctx: any) => {
    const session = ctx.session;
    const role = session.user.role;
    const { id } = await ctx.params;
    if (role !== "admin") return NextResponse.json({ message: "Only admin can delete" }, { status: 403 });
    await prisma.prescription.delete({ where: { id } });
    return NextResponse.json({ status: "success", message: "Deleted" });
});
