import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/email-accounts — List user's connected email accounts
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.emailAccount.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      provider: true,
      email: true,
      isDefault: true,
      dailySendLimit: true,
      sentToday: true,
      lastResetAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Reset sentToday if it's a new day
  const now = new Date();
  const updated = accounts.map((a) => ({
    ...a,
    sentToday: now.toDateString() !== a.lastResetAt.toDateString() ? 0 : a.sentToday,
  }));

  return NextResponse.json(updated);
}

/**
 * POST /api/email-accounts — Add custom SMTP account
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { email, smtpHost, smtpPort, smtpUser, smtpPass } = body;

  if (!email || !smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    return NextResponse.json({ error: "All SMTP fields are required" }, { status: 400 });
  }

  const existingCount = await prisma.emailAccount.count({
    where: { userId: session.user.id },
  });

  if (existingCount >= 3) {
    return NextResponse.json(
      { error: "You can connect up to 3 email accounts. Remove one to add another." },
      { status: 400 }
    );
  }

  const account = await prisma.emailAccount.create({
    data: {
      userId: session.user.id,
      provider: "custom_smtp",
      email,
      accessToken: "", // Not used for SMTP
      smtpHost,
      smtpPort: parseInt(smtpPort),
      smtpUser,
      smtpPass,
      isDefault: existingCount === 0,
    },
    select: {
      id: true,
      provider: true,
      email: true,
      isDefault: true,
      dailySendLimit: true,
      sentToday: true,
    },
  });

  return NextResponse.json(account);
}

/**
 * DELETE /api/email-accounts — Remove an email account
 */
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("id");

  if (!accountId) {
    return NextResponse.json({ error: "Account ID required" }, { status: 400 });
  }

  await prisma.emailAccount.deleteMany({
    where: { id: accountId, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
