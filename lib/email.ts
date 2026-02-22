import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  fromName?: string; // display name, e.g. the creator's name
  // Optional metadata for logging
  userId?: string;
  type?: string; // PROPOSAL_SENT, INVOICE_SENT, REMINDER, DEAL_SIGNED, PAYMENT_CONFIRMATION
  proposalId?: string;
  invoiceId?: string;
}

export const sendEmail = async ({ to, subject, html, replyTo, fromName, userId, type, proposalId, invoiceId }: EmailPayload) => {
  if (!process.env.RESEND_API_KEY) {
    console.log("⚠️ [EMAIL MOCK] Would send to:", to);
    console.log("Subject:", subject);
    console.log("HTML Preview:", html.substring(0, 100) + "...");
    return { success: true, id: "mock-id" };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const from = process.env.RESEND_FROM_EMAIL
    ? `${fromName || "DealBird"} <${fromEmail}>`
    : `DealBird <${fromEmail}>`; // Resend onboarding strictness

  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
      replyTo: replyTo,
    });

    if (data.error) {
      console.error("❌ [EMAIL RESEND API ERROR]", data.error);
      // Log failed email
      if (userId && type) {
        await prisma.emailLog.create({
          data: { userId, to, subject, type, status: "FAILED", error: JSON.stringify(data.error), proposalId, invoiceId },
        }).catch(() => {});
      }
      return { success: false, error: data.error };
    }

    console.log(`✅ [EMAIL SENT] To: ${to} | ID: ${data.data?.id}`);
    // Log successful email
    if (userId && type) {
      await prisma.emailLog.create({
        data: { userId, to, subject, type, status: "SENT", resendId: data.data?.id, proposalId, invoiceId },
      }).catch(() => {});
    }
    return { success: true, id: data.data?.id };
  } catch (error) {
    console.error("❌ [EMAIL CATCH ERROR]", error);
    // Log failed email
    if (userId && type) {
      await prisma.emailLog.create({
        data: { userId, to, subject, type, status: "FAILED", error: String(error), proposalId, invoiceId },
      }).catch(() => {});
    }
    return { success: false, error };
  }
};

// --- Simple Templates ---

export const getOrderReceiptEmail = (productName: string, price: number, downloadUrl?: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Thanks for your order! 🎉</h2>
    <p>You purchased <strong>${productName}</strong> for $${(price / 100).toFixed(2)}.</p>
    ${downloadUrl
    ? `<a href="${downloadUrl}" style="display:inline-block; background:#000; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; margin: 16px 0;">Access Content</a>`
    : ""}
    <p>If you have any questions, reply to this email.</p>
  </div>
`;

export const getNewSaleEmail = (productName: string, amount: number, buyerEmail: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Cha-ching! New Sale! 💰</h2>
    <p><strong>${buyerEmail}</strong> just purchased <strong>${productName}</strong>.</p>
    <p>Amount: <strong>$${(amount / 100).toFixed(2)}</strong></p>
    <p>Keep up the great work!</p>
  </div>
`;

export const getBookingConfirmationEmail = (productName: string, time: Date, meetingUrl: string | null) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Booking Confirmed! 📅</h2>
    <p>Your session for <strong>${productName}</strong> is scheduled.</p>
    <p><strong>Time:</strong> ${time.toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}</p>
    ${meetingUrl
    ? `<p><strong>Join Link:</strong> <a href="${meetingUrl}">${meetingUrl}</a></p>`
    : ""}
    <p>See you there!</p>
  </div>
`;

export const emailTemplates = {
  dealSignedCreator: (creatorName: string, brand: string, title: string, proposalUrl: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Deal Signed! 🎉</h2>
      <p>Hi ${creatorName}, <strong>${brand}</strong> has signed your proposal: <strong>${title}</strong>.</p>
      <a href="${proposalUrl}" style="display:inline-block; background:#000; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; margin: 16px 0;">View Signed Proposal</a>
    </div>
  `,
  dealSignedBrand: (brand: string, creatorName: string, title: string, proposalUrl: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>You signed the deal! ✅</h2>
      <p>Hi ${brand}, you've signed the proposal <strong>${title}</strong> from <strong>${creatorName}</strong>.</p>
      <a href="${proposalUrl}" style="display:inline-block; background:#000; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; margin: 16px 0;">View Proposal</a>
    </div>
  `,
  invoice: (brand: string, creatorName: string, amount: string, dueDate: string, invoiceUrl: string, invoiceNumber: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Invoice ${invoiceNumber} from ${creatorName}</h2>
      <p>Hi ${brand}, you have a new invoice for <strong>${amount}</strong> due on <strong>${dueDate}</strong>.</p>
      <a href="${invoiceUrl}" style="display:inline-block; background:#000; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; margin: 16px 0;">View Invoice</a>
      <p style="color:#888; font-size:13px;">If you have any questions, reply to this email.</p>
    </div>
  `,
  proposal: (brand: string, creatorName: string, title: string, amount: string, proposalUrl: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Proposal from ${creatorName} 📄</h2>
      <p>Hi ${brand}, you have a new proposal: <strong>${title}</strong> for <strong>${amount}</strong>.</p>
      <a href="${proposalUrl}" style="display:inline-block; background:#000; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; margin: 16px 0;">View & Sign Proposal</a>
      <p style="color:#888; font-size:13px;">If you have any questions, reply to this email.</p>
    </div>
  `,

  // --- Auto-Reminder Tiers ---
  invoiceReminderTier1: (brand: string, creatorName: string, amount: string, dueDate: string, invoiceUrl: string, invoiceNumber: string, daysOverdue: number) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Friendly Reminder</h2>
      <p>Hi ${brand}, just a quick heads-up that Invoice <strong>${invoiceNumber}</strong> for <strong>${amount}</strong> was due on <strong>${dueDate}</strong> (${daysOverdue} days ago).</p>
      <p>If payment is already on its way, feel free to disregard this note.</p>
      <a href="${invoiceUrl}" style="display:inline-block; background:#000; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; margin: 16px 0;">View Invoice</a>
      <p style="color:#888; font-size:13px;">Sent on behalf of ${creatorName} via DealBird.</p>
    </div>
  `,
  invoiceReminderTier2: (brand: string, creatorName: string, amount: string, dueDate: string, invoiceUrl: string, invoiceNumber: string, daysOverdue: number) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color:#B45309;">Action Required</h2>
      <p>Hi ${brand}, Invoice <strong>${invoiceNumber}</strong> for <strong>${amount}</strong> is now <strong>${daysOverdue} days overdue</strong> (due ${dueDate}).</p>
      <p>Please arrange payment at your earliest convenience to avoid further follow-ups.</p>
      <a href="${invoiceUrl}" style="display:inline-block; background:#B45309; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; margin: 16px 0;">Pay Now</a>
      <p style="color:#888; font-size:13px;">Sent on behalf of ${creatorName} via DealBird.</p>
    </div>
  `,
  invoiceReminderTier3: (brand: string, creatorName: string, amount: string, dueDate: string, invoiceUrl: string, invoiceNumber: string, daysOverdue: number) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color:#DC2626;">Final Notice</h2>
      <p>Hi ${brand}, this is a final notice regarding Invoice <strong>${invoiceNumber}</strong> for <strong>${amount}</strong>, now <strong>${daysOverdue} days overdue</strong>.</p>
      <p>If payment is not received promptly, further action may be required. Please settle this balance immediately.</p>
      <a href="${invoiceUrl}" style="display:inline-block; background:#DC2626; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; margin: 16px 0;">Pay Now</a>
      <p style="color:#888; font-size:13px;">Sent on behalf of ${creatorName} via DealBird.</p>
    </div>
  `,

  // --- Payment Confirmation ---
  invoicePaymentConfirmation: (brand: string, creatorName: string, invoiceUrl: string, invoiceNumber: string, fileCount: number) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Payment Received! ✓</h2>
      <p>Hi ${brand}, your payment for Invoice <strong>${invoiceNumber}</strong> from <strong>${creatorName}</strong> has been confirmed.</p>
      ${fileCount > 0 ? `<p><strong>${fileCount} deliverable(s)</strong> are now unlocked and ready for download.</p>` : ""}
      <a href="${invoiceUrl}" style="display:inline-block; background:#000; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; margin: 16px 0;">${fileCount > 0 ? "Download Files" : "View Receipt"}</a>
      <p style="color:#888; font-size:13px;">Thank you for your payment!</p>
    </div>
  `,
};
