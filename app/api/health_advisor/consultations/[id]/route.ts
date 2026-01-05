import { prisma } from "@/app/lib/prisma";
import { guard } from "@/app/lib/apiGuard";
import { requireRole } from "@/app/lib/requireRole";
import { NextResponse } from "next/server";

/* GET BY ID */
export const GET = guard(async (_req: Request, ctx: any) => {
  await requireRole("health_advisor");

  const { id } = ctx.params as { id: string };
  const advisorId = ctx.session.user.healthAdvisorId;

  const consultation = await prisma.consultation.findFirst({
    where: { id, advisorId },
    include: { patient: { include: { user: true } } },
  });

  if (!consultation)
    return NextResponse.json({ message: "Not found" }, { status: 404 });

  return NextResponse.json({ status: "success", data: consultation });
});

/* UPDATE */
export const PUT = guard(async (req: Request, ctx: any) => {
  await requireRole("health_advisor");

  const { id } = ctx.params as { id: string };
  const advisorId = ctx.session.user.healthAdvisorId;
  const { consultationAt, notes, status } = await req.json();

  const updated = await prisma.consultation.updateMany({
    where: { id, advisorId },
    data: {
      consultationAt: consultationAt ? new Date(consultationAt) : undefined,
      notes,
      status,
    },
  });

  if (!updated.count)
    return NextResponse.json({ message: "Not found" }, { status: 404 });

  return NextResponse.json({ status: "success" });
});

/* DELETE */
export const DELETE = guard(async (_req: Request, ctx: any) => {
  await requireRole("health_advisor");

  const { id } = ctx.params as { id: string };
  const advisorId = ctx.session.user.healthAdvisorId;

  const deleted = await prisma.consultation.deleteMany({
    where: { id, advisorId },
  });

  if (!deleted.count)
    return NextResponse.json({ message: "Not found" }, { status: 404 });

  return NextResponse.json({ status: "deleted" });
});
