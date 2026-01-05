import { prisma } from "@/app/lib/prisma";
import { guard } from "@/app/lib/apiGuard";
import { requireRole } from "@/app/lib/requireRole";

export const GET = guard(async () => {
    const session = await requireRole("health_advisor");

    const [totalPatients, totalConsultations, totalAppointments] = await Promise.all([
        prisma.patient.count(),
        prisma.consultation.count({ where: { advisorId: { not: undefined } } }),
        prisma.appointment.count()
    ]);

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, mobile: true, createdAt: true, role: { select: { name: true } } }
    });

    return Response.json({ user, stats: { totalPatients, totalConsultations, totalAppointments } });
});
