import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: any) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Only JWT existence check here (Edge safe)
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/doctor/:path*", "/user/:path*"]
};
