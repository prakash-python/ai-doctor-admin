// app/api/auth/[...nextauth]/route.ts (or .js)

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import type { AuthOptions } from "next-auth";

const adapter = PrismaAdapter(prisma);

// Custom adapter to auto-assign "patient" role on user creation (OAuth signups)
const customAdapter = {
  ...adapter,
  async createUser(profile: any) {
    // Find the "patient" role – throw if not found (safety)
    const patientRole = await prisma.role.findUnique({
      where: { name: "patient" },
    });

    if (!patientRole) {
      throw new Error('Default role "patient" not found in database');
    }

    // Create user with connected patient role
    return prisma.user.create({
      data: {
        name: profile.name,
        email: profile.email,
        image: profile.image,
        emailVerified: profile.emailVerified ? new Date(profile.emailVerified) : null,
        // Connect the patient role
        role: {
          connect: { id: patientRole.id },
        },
      },
    });
  },
};

export const authOptions: AuthOptions = {
  adapter: customAdapter, // ← Use custom adapter

  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    // Credentials (Email/Mobile + Password)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Mobile", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { mobile: credentials.identifier },
            ],
          },
          include: { role: true },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return {
    id: user.id,                    // requireda
    email: user.email ?? null,      // can be null
    name: user.name ?? null,        // can be null
    image: user.image ?? null,      // optional, but good to include
    role: user.role.name,           // your custom field
  };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours
  },

  jwt: {
    maxAge: 60 * 60 * 8,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },

    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard-router`;
    },
  },

  // Removed events.createUser – now handled in custom adapter

  pages: {
    signIn: "/sign-in",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };