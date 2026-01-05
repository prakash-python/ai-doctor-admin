import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { guard } from "@/app/lib/apiGuard";

export const GET = guard(async (_req: Request, ctx: any) => {
    const { id } = await ctx.params;
    const appt = await prisma.appointment.findUnique({ where: { id }, include: { doctor: true, patient: true } });
    if (!appt) return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
    return NextResponse.json({ status: "success", data: appt });
});

export const PUT = guard(async (req: Request, ctx: any) => {
    const session = ctx.session;
    const role = session.user.role;
    const { id } = await ctx.params;

    const { status, scheduledAt } = await req.json();

    const appt = await prisma.appointment.findUnique({ where: { id } });
    if (!appt) return NextResponse.json({ message: "Appointment not found" }, { status: 404 });

    // doctor can update their appointment status
    if (role === "doctor") {
        const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
        if (!doctor || doctor.id !== appt.doctorId) return NextResponse.json({ message: "Not permitted" }, { status: 403 });
        const updated = await prisma.appointment.update({ where: { id }, data: { status: status || appt.status } });
        return NextResponse.json({ status: "success", data: updated });
    }

    // patient can cancel
    if (role === "patient") {
        const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } });
        if (!patient || patient.id !== appt.patientId) return NextResponse.json({ message: "Not permitted" }, { status: 403 });
        if (status && status !== "cancelled") return NextResponse.json({ message: "Patients can only cancel" }, { status: 403 });
        const updated = await prisma.appointment.update({ where: { id }, data: { status: "cancelled" } });
        return NextResponse.json({ status: "success", data: updated });
    }

    // admin can update any fields
    if (role === "admin") {
        const data: any = {};
        if (status) data.status = status;
        if (scheduledAt) data.scheduledAt = new Date(scheduledAt);
        const updated = await prisma.appointment.update({ where: { id }, data });
        return NextResponse.json({ status: "success", data: updated });
    }

    return NextResponse.json({ message: "Not permitted" }, { status: 403 });
});

export const DELETE = guard(async (_req: Request, ctx: any) => {
    const session = ctx.session;
    const role = session.user.role;
    const { id } = await ctx.params;

    if (role !== "admin") return NextResponse.json({ message: "Only admin can delete" }, { status: 403 });

    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ status: "success", message: "Deleted" });
});
