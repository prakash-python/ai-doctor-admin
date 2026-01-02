import { prisma } from "@/app/lib/prisma";
import { guard } from "@/app/lib/apiGuard";
import { requireRole } from "@/app/lib/requireRole";

export const GET = guard(async () => {
  const session = await requireRole("admin");

  const [
    totalUsers,
    totalRoles,
    totalDoctors,
    totalHealthAdvisors,
    totalPatients
  ] = await Promise.all([
    prisma.user.count(),
    prisma.role.count(),
    prisma.doctor.count(),
    prisma.healthAdvisor.count(),
    prisma.patient.count()
  ]);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      mobile: true,
      createdAt: true,
      role: { select: { name: true, description: true } }
    }
  });

  return Response.json({
    user,
    stats: {
      totalUsers,
      totalRoles,
      totalDoctors,
      totalHealthAdvisors,
      totalPatients
    }
  });
});
