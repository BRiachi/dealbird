import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendViaGmail } from "@/lib/gmail";
import crypto from "crypto";

/**
 * GET /api/cron/outreach — Process scheduled outreach emails
 * Called every 5 minutes by Vercel cron.
 *
 * Features:
 * - Multi-mailbox fallback (if assigned account hits limit, try another)
 * - Gmail thread tracking (stores messageId/threadId for reply detection)
 * - Reply-based sequence cancellation (skips if brand already replied)
 * - Skips LinkedIn steps (manual send only)
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || cronSecret.length < 16) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const expected = `Bearer ${cronSecret}`;
  if (
    !authHeader ||
    authHeader.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  // Reset daily send counters
  await prisma.emailAccount.updateMany({
    where: { lastResetAt: { lt: new Date(now.toDateString()) } },
    data: { sentToday: 0, lastResetAt: now },
  });

  // Find scheduled emails ready to send
  const scheduledEmails = await prisma.outreachEmail.findMany({
    where: {
      status: "scheduled",
      scheduledFor: { lte: now },
      channel: "email", // Skip LinkedIn steps — manual only
    },
    include: {
      brand: { select: { name: true } },
      campaign: { select: { emailSteps: true, delayDays: true } },
      emailAccount: true,
    },
    take: 50,
    orderBy: { scheduledFor: "asc" },
  });

  for (const email of scheduledEmails) {
    // Check if brand already replied — cancel remaining sequence
    const hasReply = await prisma.outreachEmail.findFirst({
      where: {
        campaignId: email.campaignId,
        brandId: email.brandId,
        status: "replied",
      },
    });
    if (hasReply) {
      await prisma.outreachEmail.update({
        where: { id: email.id },
        data: { status: "draft" },
      });
      skipped++;
      continue;
    }

    let activeAccount = email.emailAccount;

    if (!activeAccount) {
      skipped++;
      continue;
    }

    // Multi-mailbox fallback: if assigned account hit limit, find another
    if (activeAccount.sentToday >= activeAccount.dailySendLimit) {
      const allAccounts = await prisma.emailAccount.findMany({
        where: { userId: email.userId },
        orderBy: { sentToday: "asc" },
      });
      const fallback = allAccounts.find(
        (a) => a.sentToday < a.dailySendLimit && a.id !== activeAccount!.id
      );

      if (!fallback) {
        skipped++;
        continue;
      }

      // Re-assign to fallback account
      await prisma.outreachEmail.update({
        where: { id: email.id },
        data: { emailAccountId: fallback.id },
      });
      activeAccount = fallback;
    }

    if (!email.toEmail) {
      await prisma.outreachEmail.update({
        where: { id: email.id },
        data: { status: "draft" },
      });
      skipped++;
      continue;
    }

    try {
      const gmailResult = await sendViaGmail({
        emailAccountId: activeAccount.id,
        to: email.toEmail,
        subject: email.subject,
        body: email.body,
        trackingId: email.trackingId || undefined,
        inReplyToThreadId: email.gmailThreadId || undefined,
      });

      // Mark as sent with Gmail IDs for reply detection
      await prisma.outreachEmail.update({
        where: { id: email.id },
        data: {
          status: "sent",
          sentAt: now,
          gmailMessageId: gmailResult.messageId,
          gmailThreadId: gmailResult.threadId,
        },
      });

      await prisma.outreachCampaign.update({
        where: { id: email.campaignId },
        data: { sentCount: { increment: 1 } },
      });

      // Schedule next email step (skip LinkedIn steps — manual only)
      if (email.stepNumber < email.campaign.emailSteps) {
        const nextStep = await prisma.outreachEmail.findFirst({
          where: {
            campaignId: email.campaignId,
            brandId: email.brandId,
            stepNumber: email.stepNumber + 1,
            status: "draft",
            channel: "email",
          },
        });

        if (nextStep) {
          const nextSendDate = new Date(now);
          nextSendDate.setDate(nextSendDate.getDate() + email.campaign.delayDays);

          await prisma.outreachEmail.update({
            where: { id: nextStep.id },
            data: {
              status: "scheduled",
              scheduledFor: nextSendDate,
              gmailThreadId: gmailResult.threadId, // Keep in same thread
            },
          });
        }
      }

      sent++;
    } catch (err: any) {
      console.error(`Failed to send outreach email ${email.id}:`, err.message);

      if (err.message?.includes("token") || err.message?.includes("reconnect")) {
        await prisma.outreachEmail.update({
          where: { id: email.id },
          data: { status: "bounced" },
        });
      }

      failed++;
    }
  }

  // Check for completed campaigns
  const activeCampaigns = await prisma.outreachCampaign.findMany({
    where: { status: "active" },
    select: { id: true },
  });

  for (const campaign of activeCampaigns) {
    const pendingCount = await prisma.outreachEmail.count({
      where: {
        campaignId: campaign.id,
        status: { in: ["draft", "scheduled"] },
      },
    });

    if (pendingCount === 0) {
      await prisma.outreachCampaign.update({
        where: { id: campaign.id },
        data: { status: "completed" },
      });
    }
  }

  return NextResponse.json({
    processed: scheduledEmails.length,
    sent,
    failed,
    skipped,
    timestamp: now.toISOString(),
  });
}
