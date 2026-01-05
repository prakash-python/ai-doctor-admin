import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { guard } from "@/app/lib/apiGuard";

export const GET = guard(async (_req: Request, ctx: any) => {
    const session = ctx.session;
    const role = session.user.role;

    // Admin: all appointments
    if (role === "admin") {
        const appts = await prisma.appointment.findMany({
            orderBy: { scheduledAt: "desc" },
            include: { doctor: { select: { id: true, name: true } }, patient: { select: { id: true, name: true, user: { select: { email: true, mobile: true } } } } }
        });
        return NextResponse.json({ status: "success", total: appts.length, data: appts });
    }

    if (role === "doctor") {
        const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
        if (!doctor) return NextResponse.json({ message: "Doctor profile not found" }, { status: 404 });
        const appts = await prisma.appointment.findMany({ where: { doctorId: doctor.id }, orderBy: { scheduledAt: "desc" }, include: { patient: true } });
        return NextResponse.json({ status: "success", total: appts.length, data: appts });
    }

    if (role === "patient") {
        const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } });
        if (!patient) return NextResponse.json({ message: "Patient profile not found" }, { status: 404 });
        const appts = await prisma.appointment.findMany({ where: { patientId: patient.id }, orderBy: { scheduledAt: "desc" }, include: { doctor: true } });
        return NextResponse.json({ status: "success", total: appts.length, data: appts });
    }

    return NextResponse.json({ message: "Not supported for role" }, { status: 403 });
});

export const POST = guard(async (req: Request, ctx: any) => {
    const session = ctx.session;
    const role = session.user.role;

    const { doctorId, patientId, scheduledAt } = await req.json();
    if (!doctorId || !patientId || !scheduledAt) return NextResponse.json({ message: "doctorId, patientId and scheduledAt are required" }, { status: 400 });

    // basic validation
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) return NextResponse.json({ message: "Patient not found" }, { status: 404 });

    // allow patient to create for themselves only
    if (role === "patient") {
        const myPatient = await prisma.patient.findUnique({ where: { userId: session.user.id } });
        if (!myPatient || myPatient.id !== patientId) return NextResponse.json({ message: "Cannot create appointment for other patient" }, { status: 403 });
    }

    const appt = await prisma.appointment.create({ data: { doctorId, patientId, scheduledAt: new Date(scheduledAt), status: "booked" } });
    return NextResponse.json({ status: "success", data: appt }, { status: 201 });
});
