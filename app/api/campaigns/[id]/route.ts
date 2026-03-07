import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/campaigns/[id] — Campaign detail with emails and stats
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaign = await prisma.outreachCampaign.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      scan: { select: { platform: true, handle: true, brandCount: true } },
      emails: {
        include: {
          brand: { select: { name: true, industry: true, logoUrl: true } },
          emailAccount: { select: { email: true, provider: true } },
        },
        orderBy: [{ brandId: "asc" }, { stepNumber: "asc" }],
      },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json(campaign);
}

/**
 * PATCH /api/campaigns/[id] — Update campaign
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, instructions, status, emailSteps, linkedinSteps, delayDays } = body;

  const campaign = await prisma.outreachCampaign.updateMany({
    where: { id: params.id, userId: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(instructions !== undefined && { instructions }),
      ...(status !== undefined && { status }),
      ...(emailSteps !== undefined && { emailSteps }),
      ...(linkedinSteps !== undefined && { linkedinSteps }),
      ...(delayDays !== undefined && { delayDays }),
    },
  });

  if (campaign.count === 0) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/campaigns/[id] — Delete campaign and all emails
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.outreachCampaign.deleteMany({
    where: { id: params.id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
