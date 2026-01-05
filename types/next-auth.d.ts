import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {

  interface Session {
    user: {
      id: string;
      role: string;
      sessionId: string;
      email?: string | null;
      hasPassword: Boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    email: string;
    sessionId: string;
    hasPassword: Boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    sid: string;
    hasPassword: Boolean;
  }
}
