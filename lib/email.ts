import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "DealBird <noreply@dealbird.ai>";

interface EmailPayload {
  to: string;
  replyTo: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, replyTo, subject, html }: EmailPayload) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error };
  }
}

export const emailTemplates = {
  invoice: (
    brandName: string,
    creatorName: string,
    amount: string,
    dueDate: string,
    invoiceUrl: string,
    invoiceNumber: string
  ) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="DealBird" style="width: 48px; border-radius: 12px;">
      </div>
      <div style="background: #fff; border: 1px solid #eee; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h2 style="margin: 0 0 20px; font-size: 24px; color: #111;">New Invoice from ${creatorName}</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 24px;">
          Hi ${brandName},<br><br>
          Here's invoice <strong>${invoiceNumber}</strong> for <strong>${amount}</strong>.
          Please arrange payment by <strong>${dueDate}</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${invoiceUrl}" style="background: #000; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">View & Pay Invoice</a>
        </div>
        <p style="font-size: 14px; color: #888; text-align: center;">
          or copy this link: <a href="${invoiceUrl}" style="color: #666;">${invoiceUrl}</a>
        </p>
      </div>
      <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
        Sent via <strong>DealBird</strong> on behalf of ${creatorName}
      </div>
    </div>
  `,

  proposal: (
    brandName: string,
    creatorName: string,
    proposalTitle: string,
    totalAmount: string,
    proposalUrl: string
  ) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="DealBird" style="width: 48px; border-radius: 12px;">
      </div>
      <div style="background: #fff; border: 1px solid #eee; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h2 style="margin: 0 0 20px; font-size: 24px; color: #111;">Proposal: ${proposalTitle}</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 24px;">
          Hi ${brandName},<br><br>
          ${creatorName} has sent you a proposal for <strong>${proposalTitle}</strong> totaling <strong>${totalAmount}</strong>.
          Review the details and sign directly online.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${proposalUrl}" style="background: #C8FF00; color: #000; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Review Proposal</a>
        </div>
        <p style="font-size: 14px; color: #888; text-align: center;">
          or copy this link: <a href="${proposalUrl}" style="color: #666;">${proposalUrl}</a>
        </p>
      </div>
      <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
        Sent via <strong>DealBird</strong> on behalf of ${creatorName}
      </div>
    </div>
  `
};
