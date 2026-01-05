import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export function guard(handler: Function) {
  return async (req: Request, ctx: any) => {
    try {
      const session = await getServerSession(authOptions);
      if (!session) throw new Error("NOT_AUTHENTICATED");

      
      ctx.session = session;

      return await handler(req, ctx);   // ← keep original signature
    } catch (e: any) {
      if (e.message === "NOT_AUTHENTICATED")
        return NextResponse.json({ message: "Login required" }, { status: 401 });

      if (e.message === "NOT_AUTHORIZED")
        return NextResponse.json({ message: "Permission denied" }, { status: 403 });

      console.error(e);
      return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
  };
}
