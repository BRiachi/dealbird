import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkForReplies } from "@/lib/gmail";
import crypto from "crypto";

/**
 * GET /api/cron/reply-check — Check Gmail inboxes for replies to outreach emails
 * Called every 15 minutes by Vercel cron.
 *
 * When a reply is detected:
 * 1. Mark the OutreachEmail as "replied"
 * 2. Increment campaign replyCount
 * 3. Cancel remaining draft/scheduled steps for that brand (stop sequence)
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

  let totalReplies = 0;
  const errors: string[] = [];

  // Find Gmail accounts that have active outreach with thread IDs
  const gmailAccounts = await prisma.emailAccount.findMany({
    where: {
      provider: "gmail",
      needsReauth: false,
      sentEmails: {
        some: {
          gmailThreadId: { not: null },
          status: { in: ["sent", "opened"] },
        },
      },
    },
  });

  for (const account of gmailAccounts) {
    const result = await checkForReplies(account.id);
    errors.push(...result.errors);

    if (result.repliedEmailIds.length > 0) {
      const now = new Date();

      // Mark emails as replied
      await prisma.outreachEmail.updateMany({
        where: { id: { in: result.repliedEmailIds } },
        data: { status: "replied", repliedAt: now },
      });

      // Get campaign/brand pairs to update stats and cancel sequences
      const repliedEmails = await prisma.outreachEmail.findMany({
        where: { id: { in: result.repliedEmailIds } },
        select: { campaignId: true, brandId: true },
      });

      // Deduplicate by campaign:brand pair
      const pairsArr = Array.from(
        new Set(repliedEmails.map((e) => `${e.campaignId}:${e.brandId}`))
      );

      // Update campaign reply counts and cancel remaining steps
      const campaignCounts: Record<string, number> = {};
      for (const pair of pairsArr) {
        const [campaignId, brandId] = pair.split(":");
        campaignCounts[campaignId] = (campaignCounts[campaignId] || 0) + 1;

        // Cancel remaining steps for this brand
        await prisma.outreachEmail.updateMany({
          where: {
            campaignId,
            brandId,
            status: { in: ["draft", "scheduled"] },
          },
          data: { status: "draft" },
        });
      }

      for (const campaignId of Object.keys(campaignCounts)) {
        await prisma.outreachCampaign.update({
          where: { id: campaignId },
          data: { replyCount: { increment: campaignCounts[campaignId] } },
        });
      }

      totalReplies += result.repliedEmailIds.length;
    }
  }

  return NextResponse.json({
    accountsChecked: gmailAccounts.length,
    repliesDetected: totalReplies,
    errors: errors.length > 0 ? errors : undefined,
  });
}
