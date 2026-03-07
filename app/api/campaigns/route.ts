import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/campaigns — List user's outreach campaigns
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaigns = await prisma.outreachCampaign.findMany({
    where: { userId: session.user.id },
    include: {
      scan: { select: { platform: true, handle: true } },
      _count: { select: { emails: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(campaigns);
}

/**
 * POST /api/campaigns — Create a new campaign
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, instructions, scanId, emailSteps, linkedinSteps, delayDays } = body;

  if (!name) {
    return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
  }

  // If scanId provided, verify ownership
  if (scanId) {
    const scan = await prisma.brandScan.findFirst({
      where: { id: scanId, userId: session.user.id },
    });
    if (!scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }
  }

  const campaign = await prisma.outreachCampaign.create({
    data: {
      userId: session.user.id,
      name,
      instructions: instructions || null,
      scanId: scanId || null,
      emailSteps: emailSteps || 3,
      linkedinSteps: linkedinSteps || 0,
      delayDays: delayDays || 3,
    },
  });

  return NextResponse.json(campaign);
}
