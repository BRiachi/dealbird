import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/outreach-emails/[id]/mark-sent
 * Manually mark a LinkedIn outreach step as sent.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = await prisma.outreachEmail.findFirst({
    where: { id: params.id, userId: session.user.id, channel: "linkedin" },
  });

  if (!email) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.outreachEmail.update({
    where: { id: email.id },
    data: { status: "sent", sentAt: new Date() },
  });

  await prisma.outreachCampaign.update({
    where: { id: email.campaignId },
    data: { sentCount: { increment: 1 } },
  });

  return NextResponse.json({ success: true });
}
