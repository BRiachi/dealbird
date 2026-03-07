import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/campaigns/[id]/launch — Activate campaign
 * Changes all draft emails to scheduled, sets campaign status to active.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify campaign ownership
  const campaign = await prisma.outreachCampaign.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  // Get ALL email accounts for round-robin (default first)
  const emailAccounts = await prisma.emailAccount.findMany({
    where: { userId: session.user.id, needsReauth: false },
    orderBy: { isDefault: "desc" },
  });
  if (emailAccounts.length === 0) {
    return NextResponse.json(
      { error: "Connect a Gmail or SMTP account in Settings before launching" },
      { status: 400 }
    );
  }

  // Get email-channel drafts to schedule
  const draftEmails = await prisma.outreachEmail.findMany({
    where: { campaignId: campaign.id, status: "draft", channel: "email" },
    orderBy: [{ brandId: "asc" }, { stepNumber: "asc" }],
  });
  if (draftEmails.length === 0) {
    return NextResponse.json(
      { error: "No emails in this campaign. Add brands first." },
      { status: 400 }
    );
  }

  // Round-robin assign step-1 emails across all connected accounts
  const now = new Date();
  const step1Emails = draftEmails.filter((e) => e.stepNumber === 1);

  for (let i = 0; i < step1Emails.length; i++) {
    const account = emailAccounts[i % emailAccounts.length];
    await prisma.outreachEmail.update({
      where: { id: step1Emails[i].id },
      data: {
        status: "scheduled",
        scheduledFor: now,
        emailAccountId: account.id,
      },
    });
  }

  // Later steps stay draft — inherit account from their step 1 brand
  const laterEmails = draftEmails.filter((e) => e.stepNumber > 1);
  for (const email of laterEmails) {
    const step1Idx = step1Emails.findIndex((e) => e.brandId === email.brandId);
    const accountId = step1Idx >= 0
      ? emailAccounts[step1Idx % emailAccounts.length].id
      : emailAccounts[0].id;

    const scheduledFor = new Date(now);
    scheduledFor.setDate(scheduledFor.getDate() + (email.stepNumber - 1) * campaign.delayDays);

    await prisma.outreachEmail.update({
      where: { id: email.id },
      data: { emailAccountId: accountId, scheduledFor },
    });
  }

  // Activate campaign
  await prisma.outreachCampaign.update({
    where: { id: campaign.id },
    data: { status: "active" },
  });

  return NextResponse.json({
    success: true,
    scheduledCount: step1Emails.length,
    totalEmails: draftEmails.length,
    accountsUsed: Math.min(emailAccounts.length, step1Emails.length),
  });
}
