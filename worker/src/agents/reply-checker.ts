import { prisma } from "../services/database";

/**
 * Reply Checker Agent
 *
 * Polls Gmail threads for replies to outreach emails.
 * When a reply is detected:
 * 1. Mark the OutreachEmail as "replied"
 * 2. Increment campaign replyCount
 * 3. Cancel remaining draft/scheduled steps for that brand (stop sequence)
 */

interface ReplyCheckResult {
  accountsChecked: number;
  repliesDetected: number;
  errors: string[];
}

export async function runReplyChecker(): Promise<ReplyCheckResult> {
  const result: ReplyCheckResult = { accountsChecked: 0, repliesDetected: 0, errors: [] };

  console.log("[ReplyChecker] Starting reply check...");

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

  result.accountsChecked = gmailAccounts.length;

  for (const account of gmailAccounts) {
    try {
      const repliedIds = await checkAccountForReplies(account);

      if (repliedIds.length > 0) {
        const now = new Date();

        // Mark emails as replied
        await prisma.outreachEmail.updateMany({
          where: { id: { in: repliedIds } },
          data: { status: "replied", repliedAt: now },
        });

        // Get campaign/brand pairs for stats and sequence cancellation
        const repliedEmails = await prisma.outreachEmail.findMany({
          where: { id: { in: repliedIds } },
          select: { campaignId: true, brandId: true },
        });

        // Deduplicate by campaign:brand
        const pairs = new Set(
          repliedEmails.map((e) => `${e.campaignId}:${e.brandId}`)
        );

        const campaignCounts = new Map<string, number>();
        for (const pair of pairs) {
          const [campaignId, brandId] = pair.split(":");
          campaignCounts.set(campaignId, (campaignCounts.get(campaignId) || 0) + 1);

          // Cancel remaining steps for this brand in this campaign
          await prisma.outreachEmail.updateMany({
            where: {
              campaignId,
              brandId,
              status: { in: ["draft", "scheduled"] },
            },
            data: { status: "draft" },
          });
        }

        // Increment reply counts
        for (const [campaignId, count] of campaignCounts) {
          await prisma.outreachCampaign.update({
            where: { id: campaignId },
            data: { replyCount: { increment: count } },
          });
        }

        result.repliesDetected += repliedIds.length;
        console.log(
          `[ReplyChecker] Found ${repliedIds.length} replies for account ${account.email}`
        );
      }
    } catch (err: any) {
      console.error(`[ReplyChecker] Error checking ${account.email}:`, err.message);
      result.errors.push(`${account.email}: ${err.message}`);

      // Mark as needing re-auth if token issue
      if (err.message?.includes("token") || err.message?.includes("401")) {
        await prisma.emailAccount.update({
          where: { id: account.id },
          data: { needsReauth: true },
        }).catch(() => {});
      }
    }
  }

  console.log(
    `[ReplyChecker] Done: ${result.accountsChecked} accounts, ${result.repliesDetected} replies`
  );

  return result;
}

/**
 * Check a single Gmail account for replies to outreach threads.
 */
async function checkAccountForReplies(
  account: {
    id: string;
    email: string;
    accessToken: string;
    refreshToken: string | null;
    tokenExpiry: Date | null;
  }
): Promise<string[]> {
  let accessToken = account.accessToken;

  // Refresh token if expired
  if (account.tokenExpiry && account.tokenExpiry < new Date()) {
    if (!account.refreshToken) {
      throw new Error("Token expired — user must reconnect Gmail");
    }

    const clientId = process.env.GOOGLE_GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

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

    const tokens = (await res.json()) as { access_token: string; expires_in: number };
    accessToken = tokens.access_token;

    await prisma.emailAccount.update({
      where: { id: account.id },
      data: {
        accessToken: tokens.access_token,
        tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });
  }

  // Get outreach emails with thread IDs for this account
  const outreachEmails = await prisma.outreachEmail.findMany({
    where: {
      emailAccountId: account.id,
      gmailThreadId: { not: null },
      status: { in: ["sent", "opened"] },
    },
    select: { id: true, gmailThreadId: true },
  });

  if (outreachEmails.length === 0) return [];

  // Deduplicate thread IDs
  const threadMap = new Map<string, string[]>();
  for (const email of outreachEmails) {
    const tid = email.gmailThreadId!;
    if (!threadMap.has(tid)) threadMap.set(tid, []);
    threadMap.get(tid)!.push(email.id);
  }

  const repliedEmailIds: string[] = [];

  for (const [threadId, emailIds] of threadMap) {
    try {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=metadata&metadataHeaders=From`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) continue;

      const thread = (await res.json()) as {
        messages: Array<{
          payload: {
            headers: Array<{ name: string; value: string }>;
          };
        }>;
      };

      // Check if any message in the thread is NOT from our account
      const hasReply = thread.messages?.some((msg) => {
        const from = msg.payload?.headers?.find(
          (h) => h.name.toLowerCase() === "from"
        )?.value;
        return from && !from.toLowerCase().includes(account.email.toLowerCase());
      });

      if (hasReply) {
        repliedEmailIds.push(...emailIds);
      }
    } catch {
      // Skip this thread on error
    }
  }

  return repliedEmailIds;
}
