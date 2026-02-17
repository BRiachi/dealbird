import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

// Dev-only credentials provider for local admin login
const devProviders = process.env.NODE_ENV !== "production" ? [
  CredentialsProvider({
    id: "dev-login",
    name: "Dev Login",
    credentials: {
      email: { label: "Email", type: "email" },
    },
    async authorize(credentials) {
      if (!credentials?.email) return null;
      // Find or create admin user
      let user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: credentials.email,
            name: "Admin",
            handle: "admin",
            plan: "pro",
            emailVerified: new Date(),
          },
        });
      }
      return { id: user.id, name: user.name, email: user.email };
    },
  }),
] : [];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    ...devProviders,
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // Magic link email sign-in via Resend
    EmailProvider({
      server: {
        host: "smtp.resend.com",
        port: 465,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY!,
        },
      },
      from: "DealBird <noreply@dealbird.ai>",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        // Fetch plan info
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { plan: true, handle: true },
        });
        if (user) {
          session.user.plan = user.plan;
          session.user.handle = user.handle;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

// Type augmentation
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      plan?: string;
      handle?: string | null;
    };
  }
}
