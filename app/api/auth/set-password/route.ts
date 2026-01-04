import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { guard } from "@/app/lib/apiGuard";

export const POST = guard(async (req: Request, session: any) => {
  const { password } = await req.json();

  if (!password || password.length < 8) {
    return Response.json({ error: "Weak password" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return Response.json({ success: true, email:session.user.email });
});
