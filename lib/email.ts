import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "DealBird <noreply@yourdomain.com>";

export async function sendProposalEmail(
  to: string,
  creatorName: string,
  proposalTitle: string,
  proposalUrl: string,
  total: string
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `New Proposal from ${creatorName}: ${proposalTitle}`,
    html: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 0;">
        <div style="background: #0A0A0A; color: #C8FF00; padding: 12px 20px; border-radius: 12px 12px 0 0; font-weight: 700; font-size: 14px;">
          🐦 DealBird
        </div>
        <div style="background: #fff; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px; padding: 32px;">
          <h2 style="font-size: 20px; margin: 0 0 8px; color: #0A0A0A;">New Proposal</h2>
          <p style="color: #6B6B6B; margin: 0 0 24px; font-size: 14px;">
            ${creatorName} has sent you a proposal for review and approval.
          </p>
          <div style="background: #FAFAFA; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
            <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;">${proposalTitle}</div>
            <div style="font-family: monospace; font-size: 20px; font-weight: 700; color: #0A0A0A;">${total}</div>
          </div>
          <a href="${proposalUrl}" style="display: block; text-align: center; background: #C8FF00; color: #0A0A0A; padding: 14px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
            Review & Sign Proposal →
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 24px; text-align: center;">
            Powered by DealBird — Professional proposals for creator brand deals.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendInvoiceEmail(
  to: string,
  creatorName: string,
  invoiceNumber: string,
  invoiceUrl: string,
  total: string,
  dueDate: string
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Invoice ${invoiceNumber} from ${creatorName}`,
    html: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 0;">
        <div style="background: #0A0A0A; color: #C8FF00; padding: 12px 20px; border-radius: 12px 12px 0 0; font-weight: 700; font-size: 14px;">
          🐦 DealBird
        </div>
        <div style="background: #fff; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px; padding: 32px;">
          <h2 style="font-size: 20px; margin: 0 0 8px; color: #0A0A0A;">Invoice ${invoiceNumber}</h2>
          <p style="color: #6B6B6B; margin: 0 0 24px; font-size: 14px;">
            ${creatorName} has sent you an invoice.
          </p>
          <div style="background: #FAFAFA; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #999; font-size: 13px;">Amount Due</span>
              <span style="font-family: monospace; font-size: 22px; font-weight: 700;">${total}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #999; font-size: 13px;">Due Date</span>
              <span style="font-weight: 600; font-size: 14px;">${dueDate}</span>
            </div>
          </div>
          <a href="${invoiceUrl}" style="display: block; text-align: center; background: #0A0A0A; color: #fff; padding: 14px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
            View Invoice →
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 24px; text-align: center;">
            Powered by DealBird
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendPaymentReminder(
  to: string,
  creatorName: string,
  invoiceNumber: string,
  invoiceUrl: string,
  total: string,
  daysOverdue: number
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Payment Reminder: Invoice ${invoiceNumber} — ${total} due`,
    html: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 0;">
        <div style="background: #0A0A0A; color: #C8FF00; padding: 12px 20px; border-radius: 12px 12px 0 0; font-weight: 700; font-size: 14px;">
          🐦 DealBird
        </div>
        <div style="background: #fff; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px; padding: 32px;">
          <h2 style="font-size: 20px; margin: 0 0 8px; color: #0A0A0A;">Payment Reminder</h2>
          <p style="color: #6B6B6B; margin: 0 0 24px; font-size: 14px;">
            This is a friendly reminder that invoice ${invoiceNumber} from ${creatorName} 
            ${daysOverdue > 0 ? `is ${daysOverdue} days overdue` : "is due soon"}.
          </p>
          <div style="background: ${daysOverdue > 0 ? "#FEF2F2" : "#FFF8E1"}; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
            <div style="font-family: monospace; font-size: 24px; font-weight: 700; text-align: center;">${total}</div>
          </div>
          <a href="${invoiceUrl}" style="display: block; text-align: center; background: #0A0A0A; color: #fff; padding: 14px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
            View Invoice →
          </a>
        </div>
      </div>
    `,
  });
}
