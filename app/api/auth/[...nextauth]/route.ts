import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import type { AuthOptions } from "next-auth";


export const authOptions: AuthOptions = {

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Mobile", type: "text" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { mobile: credentials.identifier }
            ]
          },
          include: { role: true }
        });

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role.name,
          sessionId: ""  
        };
      }
    })
  ],

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8
  },

  jwt: {
    maxAge: 60 * 60 * 8
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sid = user.sessionId;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.sessionId = token.sid as string;
      }
      return session;
    }
  },

  pages: {
    signIn: "/sign-in"
  },

  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
