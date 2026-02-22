import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/emails - List user's email history
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const emails = await prisma.emailLog.findMany({
    where: { userId: session.user.id },
    orderBy: { sentAt: "desc" },
    take: 100,
  });

  return NextResponse.json(emails);
}
