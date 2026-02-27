import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  return NextResponse.json({
    email: session?.user?.email ?? null,
    adminEmail: process.env.ADMIN_EMAIL ?? null,
    match: session?.user?.email === process.env.ADMIN_EMAIL,
  });
}
