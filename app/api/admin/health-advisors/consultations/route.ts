import { prisma } from "@/app/lib/prisma";
import { guard } from "@/app/lib/apiGuard";
import { requireRole } from "@/app/lib/requireRole";
import { NextResponse } from "next/server";

/* ======================
   CREATE CONSULTATION
====================== */
export const POST = guard(async (req: Request, ctx: any) => {
  await requireRole("health_advisor");

  const { patientId, consultationAt, notes, status } = await req.json();
  if (!patientId || !consultationAt || !notes)
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });

  const advisorId = ctx.session.user.healthAdvisorId;

  const consultation = await prisma.consultation.create({
    data: {
      advisorId,
      patientId,
      consultationAt: new Date(consultationAt),
      notes,
      status: status || "booked",
    },
  });

  return NextResponse.json({ status: "success", data: consultation });
});

/* ======================
   LIST MY CONSULTATIONS
====================== */
export const GET = guard(async (_req: Request, ctx: any) => {
  await requireRole("health_advisor");

  const advisorId = ctx.session.user.healthAdvisorId;

  const consultations = await prisma.consultation.findMany({
    where: { advisorId },
    orderBy: { consultationAt: "desc" },
    include: {
      patient: {
        include: {
          user: { select: { name: true, email: true, mobile: true } },
        },
      },
    },
  });

  return NextResponse.json({ status: "success", data: consultations });
});
