import { NextResponse } from "next/server";

export function guard(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);   // ✅ forward req, params, context
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
