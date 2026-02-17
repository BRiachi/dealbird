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
    // Magic link email sign-in via Resend HTTP API
    EmailProvider({
      server: {
        host: "smtp.resend.com",
        port: 465,
        secure: true,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY!,
        },
      },
      from: "DealBird <noreply@dealbird.ai>",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "DealBird <noreply@dealbird.ai>",
            to: email,
            subject: "Sign in to DealBird",
            html: `
              <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
                <h2 style="font-size: 20px; font-weight: 700;">🐦 DealBird</h2>
                <p>Click below to sign in to your account:</p>
                <a href="${url}" style="display: inline-block; background: #C8FF00; color: #000; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">Sign In</a>
                <p style="color: #888; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
              </div>
            `,
          }),
        });
        if (!res.ok) {
          const error = await res.text();
          throw new Error(`Resend error: ${error}`);
        }
      },
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
