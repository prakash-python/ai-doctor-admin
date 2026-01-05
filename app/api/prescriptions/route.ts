import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { guard } from "@/app/lib/apiGuard";

export const GET = guard(async (_req: Request, ctx: any) => {
    const session = ctx.session;
    const role = session.user.role;

    if (role === "admin") {
        const items = await prisma.prescription.findMany({ orderBy: { createdAt: "desc" }, include: { doctor: true, patient: true } });
        return NextResponse.json({ status: "success", total: items.length, data: items });
    }

    if (role === "doctor") {
        const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
        if (!doctor) return NextResponse.json({ message: "Doctor profile not found" }, { status: 404 });
        const items = await prisma.prescription.findMany({ where: { doctorId: doctor.id }, orderBy: { createdAt: "desc" }, include: { patient: true } });
        return NextResponse.json({ status: "success", total: items.length, data: items });
    }

    if (role === "patient") {
        const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } });
        if (!patient) return NextResponse.json({ message: "Patient profile not found" }, { status: 404 });
        const items = await prisma.prescription.findMany({ where: { patientId: patient.id }, orderBy: { createdAt: "desc" }, include: { doctor: true } });
        return NextResponse.json({ status: "success", total: items.length, data: items });
    }

    return NextResponse.json({ message: "Not supported for role" }, { status: 403 });
});

export const POST = guard(async (req: Request, ctx: any) => {
    const session = ctx.session;
    const role = session.user.role;
    const { doctorId, patientId, diagnosis, medicines } = await req.json();
    if (!doctorId || !patientId || !diagnosis || !medicines) return NextResponse.json({ message: "doctorId, patientId, diagnosis and medicines are required" }, { status: 400 });

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) return NextResponse.json({ message: "Patient not found" }, { status: 404 });

    // only doctor or admin can create prescription
    if (role === "doctor") {
        const myDoc = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
        if (!myDoc || myDoc.id !== doctorId) return NextResponse.json({ message: "Not permitted" }, { status: 403 });
    } else if (role !== "admin") {
        return NextResponse.json({ message: "Not permitted" }, { status: 403 });
    }

    const p = await prisma.prescription.create({ data: { doctorId, patientId, diagnosis, medicines } });
    return NextResponse.json({ status: "success", data: p }, { status: 201 });
});
