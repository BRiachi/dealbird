import { prisma } from "../services/database";

/**
 * Outreach Runner Agent
 *
 * Autonomous agent that processes outreach campaigns:
 * 1. Finds scheduled emails ready to send
 * 2. Sends via user's connected Gmail (using stored OAuth tokens)
 * 3. Schedules next sequence steps
 * 4. Updates campaign stats
 *
 * Triggered by heartbeat (cron) or direct API call.
 */

interface SendResult {
  sent: number;
  failed: number;
  skipped: number;
  errors: string[];
}

interface GmailSendResult {
  messageId: string;
  threadId: string;
}

export async function runOutreachAgent(): Promise<SendResult> {
  const now = new Date();
  const result: SendResult = { sent: 0, failed: 0, skipped: 0, errors: [] };

  console.log(`[OutreachRunner] Heartbeat at ${now.toISOString()}`);

  // Reset daily send counters for accounts where lastResetAt is yesterday
  await prisma.emailAccount.updateMany({
    where: {
      lastResetAt: { lt: new Date(now.toDateString()) },
    },
    data: { sentToday: 0, lastResetAt: now },
  });

  // Find scheduled EMAIL-channel emails ready to send (skip LinkedIn)
  const scheduledEmails = await prisma.outreachEmail.findMany({
    where: {
      status: "scheduled",
      channel: "email",
      scheduledFor: { lte: now },
    },
    include: {
      brand: { select: { name: true } },
      campaign: { select: { emailSteps: true, delayDays: true, userId: true } },
      emailAccount: true,
    },
    take: 50,
    orderBy: { scheduledFor: "asc" },
  });

  console.log(
    `[OutreachRunner] Found ${scheduledEmails.length} emails ready to send`
  );

  for (const email of scheduledEmails) {
    // Check if brand already replied in this campaign (stop sequence)
    const alreadyReplied = await prisma.outreachEmail.findFirst({
      where: {
        campaignId: email.campaignId,
        brandId: email.brandId,
        status: "replied",
      },
      select: { id: true },
    });
    if (alreadyReplied) {
      await prisma.outreachEmail.update({
        where: { id: email.id },
        data: { status: "draft" },
      });
      result.skipped++;
      continue;
    }

    // Resolve sending account with fallback
    let account = email.emailAccount;
    if (!account || account.sentToday >= account.dailySendLimit) {
      // Find a fallback account with remaining quota
      const allAccounts = await prisma.emailAccount.findMany({
        where: {
          userId: email.campaign.userId,
          needsReauth: false,
        },
        orderBy: { sentToday: "asc" },
      });
      const fallback = allAccounts.find(a => a.sentToday < a.dailySendLimit) || null;

      if (fallback) {
        account = fallback;
        await prisma.outreachEmail.update({
          where: { id: email.id },
          data: { emailAccountId: fallback.id },
        });
      } else {
        result.skipped++;
        continue;
      }
    }

    if (!email.toEmail) {
      await prisma.outreachEmail.update({
        where: { id: email.id },
        data: { status: "draft" },
      });
      result.skipped++;
      continue;
    }

    try {
      // Get previous thread ID for this brand (for threading)
      let inReplyToThreadId: string | undefined;
      if (email.stepNumber > 1) {
        const prevEmail = await prisma.outreachEmail.findFirst({
          where: {
            campaignId: email.campaignId,
            brandId: email.brandId,
            stepNumber: { lt: email.stepNumber },
            gmailThreadId: { not: null },
          },
          orderBy: { stepNumber: "desc" },
          select: { gmailThreadId: true },
        });
        inReplyToThreadId = prevEmail?.gmailThreadId || undefined;
      }

      // Send via Gmail API
      const gmailResult = await sendViaGmailDirect(
        account,
        email.toEmail,
        email.subject,
        email.body,
        email.trackingId || undefined,
        inReplyToThreadId
      );

      // Mark as sent with Gmail IDs
      await prisma.outreachEmail.update({
        where: { id: email.id },
        data: {
          status: "sent",
          sentAt: now,
          gmailMessageId: gmailResult.messageId,
          gmailThreadId: gmailResult.threadId,
        },
      });

      // Update campaign sent count
      await prisma.outreachCampaign.update({
        where: { id: email.campaignId },
        data: { sentCount: { increment: 1 } },
      });

      // Increment email account daily counter
      await prisma.emailAccount.update({
        where: { id: account.id },
        data: { sentToday: { increment: 1 } },
      });

      // Schedule next email step if exists
      if (email.stepNumber < email.campaign.emailSteps) {
        const nextStep = await prisma.outreachEmail.findFirst({
          where: {
            campaignId: email.campaignId,
            brandId: email.brandId,
            stepNumber: email.stepNumber + 1,
            channel: "email",
            status: "draft",
          },
        });

        if (nextStep) {
          const nextSendDate = new Date(now);
          nextSendDate.setDate(
            nextSendDate.getDate() + email.campaign.delayDays
          );

          await prisma.outreachEmail.update({
            where: { id: nextStep.id },
            data: {
              status: "scheduled",
              scheduledFor: nextSendDate,
              emailAccountId: account.id,
              toEmail: email.toEmail,
            },
          });
        }
      }

      result.sent++;
      console.log(
        `[OutreachRunner] Sent step ${email.stepNumber} to ${email.toEmail} for ${email.brand.name} (thread: ${gmailResult.threadId})`
      );
    } catch (err: any) {
      console.error(
        `[OutreachRunner] Failed to send email ${email.id}:`,
        err.message
      );

      if (
        err.message?.includes("token") ||
        err.message?.includes("reconnect")
      ) {
        await prisma.outreachEmail.update({
          where: { id: email.id },
          data: { status: "bounced" },
        });
        // Mark account as needing re-auth
        if (account) {
          await prisma.emailAccount.update({
            where: { id: account.id },
            data: { needsReauth: true },
          }).catch(() => {});
        }
      }

      result.failed++;
      result.errors.push(`${email.brand.name}: ${err.message}`);
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
      console.log(`[OutreachRunner] Campaign ${campaign.id} completed`);
    }
  }

  console.log(
    `[OutreachRunner] Done: ${result.sent} sent, ${result.failed} failed, ${result.skipped} skipped`
  );

  return result;
}

/**
 * Send email via Gmail API directly from the worker.
 * Uses stored OAuth tokens from EmailAccount.
 */
async function sendViaGmailDirect(
  account: {
    id: string;
    email: string;
    accessToken: string;
    refreshToken: string | null;
    tokenExpiry: Date | null;
  },
  to: string,
  subject: string,
  body: string,
  trackingId?: string,
  inReplyToThreadId?: string
): Promise<GmailSendResult> {
  let accessToken = account.accessToken;

  // Refresh token if expired
  if (account.tokenExpiry && account.tokenExpiry < new Date()) {
    if (!account.refreshToken) {
      throw new Error("Token expired and no refresh token — user must reconnect Gmail");
    }

    const clientId =
      process.env.GOOGLE_GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret =
      process.env.GOOGLE_GMAIL_CLIENT_SECRET ||
      process.env.GOOGLE_CLIENT_SECRET;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        refresh_token: account.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) throw new Error("Failed to refresh Gmail token");

    const tokens = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };
    accessToken = tokens.access_token;

    await prisma.emailAccount.update({
      where: { id: account.id },
      data: {
        accessToken: tokens.access_token,
        tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });
  }

  // Add tracking pixel
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dealbird.ai";
  const trackingPixel = trackingId
    ? `<img src="${appUrl}/api/outreach/track/${trackingId}" width="1" height="1" style="display:none" />`
    : "";

  // Build MIME message
  const htmlBody = body.replace(/\n/g, "<br>") + trackingPixel;
  const rawMessage = [
    `From: ${account.email}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/html; charset=utf-8`,
    "",
    htmlBody,
  ].join("\r\n");

  const encodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const sendBody: Record<string, string> = { raw: encodedMessage };
  if (inReplyToThreadId) {
    sendBody.threadId = inReplyToThreadId;
  }

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendBody),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail API error: ${err}`);
  }

  const data = (await res.json()) as { id: string; threadId: string };
  return { messageId: data.id, threadId: data.threadId };
}
