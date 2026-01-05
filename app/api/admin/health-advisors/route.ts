import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { guard } from "@/app/lib/apiGuard";
import { requireRole } from "@/app/lib/requireRole";

export const GET = guard(async () => {
    await requireRole("admin");

    const advisors = await prisma.healthAdvisor.findMany({
        orderBy: { id: "desc" },
        select: {
            id: true,
            userId: true,
            name: true,
            profileImage: true,
            specialization: true,
            qualification: true,
            experience: true,
            available: true,
            user: { select: { id: true, email: true, mobile: true } },
        },
    });

    return NextResponse.json({ status: "success", total: advisors.length, data: advisors });
});
