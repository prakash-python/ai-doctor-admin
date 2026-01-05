import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export function guard(handler: Function) {
  return async (req: Request, ctx: any) => {
    const session = await getServerSession(authOptions);

    if (!session)
      return NextResponse.json({ message: "Login required" }, { status: 401 });

    ctx.session = session;
    return handler(req, ctx);
  };
}
