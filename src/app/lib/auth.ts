/**
 * NextAuth.js Configuration
 *
 * Authentication providers: GitHub, Google
 * Adapter: Prisma
 * Strategy: JWT (Edge-compatible)
 */

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.plan = token.plan as "FREE" | "PRO" | "ENTERPRISE";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.plan = (user as any).plan || "FREE";
      }
      return token;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = nextUrl.pathname.startsWith("/dashboard");
      
      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/auth/signin", nextUrl));
      }
      
      return true;
    },
  },
});

// Type augmentation for session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      plan: "FREE" | "PRO" | "ENTERPRISE";
    };
  }
}
