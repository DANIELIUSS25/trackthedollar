// src/lib/auth/config.ts
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db/prisma";
import type { UserRole } from "@/types/user";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Credentials provider intentionally left minimal.
      // Implement bcrypt compare here if adding email/password auth.
      async authorize() {
        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // Refresh JWT daily
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in: load role and subscription tier from DB
      if (user?.id) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            role: true,
            subscription: { select: { tier: true, status: true } },
          },
        });

        token.userId = dbUser?.id ?? user.id;
        token.role = (dbUser?.role ?? "USER") as UserRole;
        token.subscriptionTier =
          (dbUser?.subscription?.tier ?? "USER") as UserRole;
        token.subscriptionStatus = dbUser?.subscription?.status ?? null;
      }

      // On explicit session update (e.g., after plan upgrade)
      if (trigger === "update" && session?.tier) {
        token.subscriptionTier = session.tier as UserRole;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as UserRole;
        session.user.subscriptionTier = token.subscriptionTier as UserRole;
        session.user.subscriptionStatus = token.subscriptionStatus as
          | string
          | null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  events: {
    async createUser({ user }) {
      // Provision a default portfolio and subscription record on first sign-up
      if (!user.id) return;

      await Promise.all([
        db.portfolio.create({
          data: {
            userId: user.id,
            name: "My Portfolio",
            isDefault: true,
          },
        }),
        db.subscription.create({
          data: {
            userId: user.id,
            tier: "USER",
          },
        }),
      ]);
    },
  },

  // Prevent leaking detailed errors to the client
  debug: process.env.NODE_ENV === "development",
};

// Augment next-auth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      subscriptionTier: UserRole;
      subscriptionStatus: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId: string;
    role: UserRole;
    subscriptionTier: UserRole;
    subscriptionStatus: string | null;
  }
}
