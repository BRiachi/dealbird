import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/campaigns/[id]/generate-sequence
 * AI generates email sequence for selected brands in a campaign.
 * Body: { brandIds: string[], emailAccountId?: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { brandIds, emailAccountId } = body;

  if (!brandIds?.length) {
    return NextResponse.json({ error: "Select at least one brand" }, { status: 400 });
  }

  // Verify campaign ownership
  const campaign = await prisma.outreachCampaign.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  // Verify brand ownership
  const brands = await prisma.brand.findMany({
    where: { id: { in: brandIds }, userId: session.user.id },
    include: {
      videoMentions: {
        include: { video: { select: { url: true, title: true, viewCount: true } } },
      },
    },
  });

  if (brands.length === 0) {
    return NextResponse.json({ error: "No valid brands selected" }, { status: 400 });
  }

  // Get user info for email context
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  // Generate outreach emails for each brand × each step
  const emailsToCreate = [];
  const now = new Date();

  for (const brand of brands) {
    const outreachData = brand.outreachEmail as any;

    // Email steps
    for (let step = 1; step <= campaign.emailSteps; step++) {
      const scheduledFor = new Date(now);
      scheduledFor.setDate(scheduledFor.getDate() + (step - 1) * campaign.delayDays);

      let subject = "";
      let emailBody = "";

      if (step === 1 && outreachData?.subject) {
        subject = outreachData.subject;
        emailBody = outreachData.body;
      } else if (step === 2) {
        subject = `Re: ${outreachData?.subject || `Partnership with ${brand.name}`}`;
        emailBody = `Hi there,\n\nJust wanted to follow up on my previous email about a potential partnership between ${user?.name || "me"} and ${brand.name}.\n\nI'd love to chat about how we can create authentic content together that resonates with my audience.\n\nWould you be open to a quick 15-minute call this week?\n\nBest,\n${user?.name || ""}`;
      } else if (step === 3) {
        subject = `Re: ${outreachData?.subject || `Partnership with ${brand.name}`}`;
        emailBody = `Hi,\n\nI know inboxes get busy, so I wanted to send one final note. I'm genuinely excited about the potential to work with ${brand.name}.\n\nIf the timing isn't right, no worries at all. But if you're interested, I'd love to connect.\n\nHere's my calendar if it's easier to book directly: [will add link]\n\nThanks for your time!\n\n${user?.name || ""}`;
      } else {
        subject = `Following up — ${brand.name} x ${user?.name || "Creator"} partnership`;
        emailBody = `Hi,\n\nJust checking in one more time about a potential content partnership.\n\nBest,\n${user?.name || ""}`;
      }

      emailsToCreate.push({
        userId: session.user.id,
        campaignId: campaign.id,
        brandId: brand.id,
        emailAccountId: emailAccountId || null,
        subject,
        body: emailBody,
        stepNumber: step,
        channel: "email",
        status: "draft",
        scheduledFor,
      });
    }

    // LinkedIn steps (manual send — no emailAccountId)
    const linkedinSteps = campaign.linkedinSteps || 0;
    for (let li = 1; li <= linkedinSteps; li++) {
      const liStepNumber = campaign.emailSteps + li;
      const scheduledFor = new Date(now);
      scheduledFor.setDate(scheduledFor.getDate() + (liStepNumber - 1) * campaign.delayDays);

      let subject = "";
      let messageBody = "";

      if (li === 1) {
        // Connection request note (300 char max)
        subject = `LinkedIn — Connect with ${brand.name}`;
        messageBody = `Hi! I'm ${user?.name || "a creator"} and I love what ${brand.name} is doing. I've been creating content in the ${brand.industry || "space"} and would love to explore a partnership. Let's connect!`;
      } else if (li === 2) {
        subject = `LinkedIn — Follow up with ${brand.name}`;
        messageBody = `Hey! Just following up on my connection request. I'd love to chat about how we could work together — I have some ideas that could be a great fit for ${brand.name}. Open to a quick call?`;
      } else {
        subject = `LinkedIn — Final note to ${brand.name}`;
        messageBody = `Hi! Last message from me — just wanted to circle back about a potential content partnership with ${brand.name}. If the timing works, I'd love to connect. Either way, keep up the great work!`;
      }

      emailsToCreate.push({
        userId: session.user.id,
        campaignId: campaign.id,
        brandId: brand.id,
        emailAccountId: null, // LinkedIn = manual send
        subject,
        body: messageBody,
        stepNumber: liStepNumber,
        channel: "linkedin",
        status: "draft",
        scheduledFor,
      });
    }
  }

  // Bulk create emails
  await prisma.outreachEmail.createMany({ data: emailsToCreate });

  // Update campaign stats
  await prisma.outreachCampaign.update({
    where: { id: campaign.id },
    data: { totalBrands: brands.length },
  });

  return NextResponse.json({
    success: true,
    emailsCreated: emailsToCreate.length,
    brandsAdded: brands.length,
  });
}
