import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];

/**
 * HMAC-sign the state parameter for Gmail OAuth to prevent CSRF.
 */
function signGmailState(userId: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is required for OAuth state signing");
  const sig = crypto.createHmac("sha256", secret).update(`gmail:${userId}`).digest("hex").slice(0, 16);
  return `${userId}:${sig}`;
}

/**
 * Verify and extract userId from HMAC-signed Gmail OAuth state.
 */
export function verifyGmailState(state: string): string | null {
  const [userId, sig] = state.split(":");
  if (!userId || !sig) return null;
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  const expected = crypto.createHmac("sha256", secret).update(`gmail:${userId}`).digest("hex").slice(0, 16);
  if (sig.length !== expected.length) return null;
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  return userId;
}

/**
 * Build the Google OAuth URL for Gmail access.
 * State parameter is HMAC-signed to prevent CSRF.
 */
export function getGmailAuthUrl(userId: string): string {
  const clientId = process.env.GOOGLE_GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail`;

  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GMAIL_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state: signGmailState(userId),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/**
 * Exchange authorization code for tokens and save to EmailAccount.
 */
export async function handleGmailCallback(code: string, userId: string) {
  const clientId = process.env.GOOGLE_GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const tokens = await tokenRes.json();

  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const userInfo = await userInfoRes.json();
  const email = userInfo.email;

  if (!email) throw new Error("Could not get email from Google");

  const existingCount = await prisma.emailAccount.count({ where: { userId } });

  // Check if this is a new account (not re-auth) and enforce 3 Gmail limit
  const existingAccount = await prisma.emailAccount.findUnique({
    where: { userId_email: { userId, email } },
  });
  if (!existingAccount && existingCount >= 3) {
    throw new Error("You can connect up to 3 Gmail accounts. Remove one to add another.");
  }

  await prisma.emailAccount.upsert({
    where: { userId_email: { userId, email } },
    create: {
      userId,
      provider: "gmail",
      email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      tokenExpiry: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : null,
      isDefault: existingCount === 0,
      needsReauth: false,
    },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || undefined,
      tokenExpiry: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : undefined,
      needsReauth: false,
    },
  });

  return email;
}

/**
 * Refresh Gmail access token if expired.
 */
async function refreshAccessToken(accountId: string): Promise<string> {
  const account = await prisma.emailAccount.findUniqueOrThrow({
    where: { id: accountId },
  });

  if (!account.refreshToken) {
    throw new Error("No refresh token available — user must reconnect Gmail");
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

  if (!res.ok) {
    throw new Error("Failed to refresh Gmail token — user must reconnect");
  }

  const tokens = await res.json();

  await prisma.emailAccount.update({
    where: { id: accountId },
    data: {
      accessToken: tokens.access_token,
      tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
    },
  });

  return tokens.access_token;
}

export interface GmailSendResult {
  messageId: string;
  threadId: string;
}

/**
 * Send an email via Gmail API using the user's connected account.
 * Returns Gmail messageId and threadId for reply detection.
 */
export async function sendViaGmail(opts: {
  emailAccountId: string;
  to: string;
  subject: string;
  body: string;
  trackingId?: string;
  inReplyToThreadId?: string;
}): Promise<GmailSendResult> {
  const account = await prisma.emailAccount.findUniqueOrThrow({
    where: { id: opts.emailAccountId },
  });

  const now = new Date();
  const isNewDay = now.toDateString() !== account.lastResetAt.toDateString();

  if (isNewDay) {
    await prisma.emailAccount.update({
      where: { id: account.id },
      data: { sentToday: 0, lastResetAt: now },
    });
  } else if (account.sentToday >= account.dailySendLimit) {
    throw new Error(`Daily send limit reached (${account.dailySendLimit}/day). Try again tomorrow or connect another mailbox.`);
  }

  let accessToken = account.accessToken;
  if (account.tokenExpiry && account.tokenExpiry < now) {
    accessToken = await refreshAccessToken(account.id);
  }

  const trackingPixel = opts.trackingId
    ? `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/outreach/track/${opts.trackingId}" width="1" height="1" style="display:none" />`
    : "";

  const htmlBody = opts.body.replace(/\n/g, "<br>") + trackingPixel;
  const rawMessage = [
    `From: ${account.email}`,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    `Content-Type: text/html; charset=utf-8`,
    "",
    htmlBody,
  ].join("\r\n");

  const encodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const sendBody: { raw: string; threadId?: string } = { raw: encodedMessage };
  if (opts.inReplyToThreadId) {
    sendBody.threadId = opts.inReplyToThreadId;
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
    throw new Error(`Gmail send failed: ${err}`);
  }

  await prisma.emailAccount.update({
    where: { id: account.id },
    data: { sentToday: { increment: 1 } },
  });

  const result = await res.json();
  return { messageId: result.id, threadId: result.threadId };
}

/**
 * Check Gmail inbox for replies to outreach emails sent from this account.
 * Returns IDs of OutreachEmails that received replies.
 */
export async function checkForReplies(emailAccountId: string): Promise<{
  repliedEmailIds: string[];
  errors: string[];
}> {
  const result = { repliedEmailIds: [] as string[], errors: [] as string[] };

  const account = await prisma.emailAccount.findUniqueOrThrow({
    where: { id: emailAccountId },
  });

  if (account.provider !== "gmail") return result;

  let accessToken = account.accessToken;
  if (account.tokenExpiry && account.tokenExpiry < new Date()) {
    try {
      accessToken = await refreshAccessToken(account.id);
    } catch {
      await prisma.emailAccount.update({
        where: { id: account.id },
        data: { needsReauth: true },
      });
      result.errors.push(`Token refresh failed for ${account.email}`);
      return result;
    }
  }

  const sentEmails = await prisma.outreachEmail.findMany({
    where: {
      emailAccountId: account.id,
      gmailThreadId: { not: null },
      status: { in: ["sent", "opened"] },
    },
    select: {
      id: true,
      gmailThreadId: true,
      campaignId: true,
      brandId: true,
    },
  });

  if (sentEmails.length === 0) return result;

  // Deduplicate by threadId
  const threadMap: Record<string, typeof sentEmails> = {};
  for (const email of sentEmails) {
    const tid = email.gmailThreadId!;
    if (!threadMap[tid]) threadMap[tid] = [];
    threadMap[tid].push(email);
  }

  for (const threadId of Object.keys(threadMap)) {
    const emails = threadMap[threadId];
    try {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=metadata&metadataHeaders=From`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!res.ok) continue;

      const thread = await res.json();
      const messages = thread.messages || [];

      const hasReply = messages.some((msg: any) => {
        const fromHeader = msg.payload?.headers?.find(
          (h: any) => h.name.toLowerCase() === "from"
        );
        if (!fromHeader) return false;
        return !fromHeader.value.includes(account.email);
      });

      if (hasReply) {
        for (const email of emails) {
          result.repliedEmailIds.push(email.id);
        }
      }
    } catch (err: any) {
      result.errors.push(`Thread ${threadId}: ${err.message}`);
    }
  }

  return result;
}
