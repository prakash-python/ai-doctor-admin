import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export function guard(handler: Function) {
  return async (req: Request, context?: any) => {
    try {
      const session = await getServerSession(authOptions);
      if (!session) throw new Error("NOT_AUTHENTICATED");

      return await handler(req, session, context);
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
