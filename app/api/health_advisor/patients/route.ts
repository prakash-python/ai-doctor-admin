import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { guard } from "@/app/lib/apiGuard";
import { requireRole } from "@/app/lib/requireRole";

export const GET = guard(async (req, ctx) => {
    await requireRole("health_advisor");

    // For now return all patients; could be scoped to advisor later
    const patients = await prisma.patient.findMany({
        orderBy: { id: "desc" },
        select: {
            id: true,
            userId: true,
            name: true,
            profileImage: true,
            bloodGroup: true,
            age: true,
            gender: true,
            user: { select: { id: true, email: true, mobile: true, createdAt: true } },
        },
    });

    return NextResponse.json({ status: "success", total: patients.length, data: patients });
});
