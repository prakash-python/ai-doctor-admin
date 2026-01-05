import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {

  // 🚫 DO NOT TOUCH API ROUTES
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const token = await getToken({ req });

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/doctor/:path*",
    "/health_advisor/:path*",
    "/patient/:path*",
    "/api/:path*"   // explicitly bypassed above
  ]
};
