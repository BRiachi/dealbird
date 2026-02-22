import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function GET(req: NextRequest) {
  // Validate cron secret — reject if CRON_SECRET is not configured or too short
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || cronSecret.length < 16) {
    console.error("[CRON] CRON_SECRET is missing or too short");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let sent = 0;
  let errors = 0;

  // --- 1. Auto-remind overdue invoices ---
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ["PENDING", "OVERDUE"] },
      dueDate: { lt: now },
    },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  for (const invoice of overdueInvoices) {
    const daysOverdue = Math.floor(
      (now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determine tier: reminderCount gates which tier is next
    let tier: 1 | 2 | 3 | null = null;
    if (daysOverdue >= 30 && invoice.reminderCount < 3) tier = 3;
    else if (daysOverdue >= 14 && invoice.reminderCount < 2) tier = 2;
    else if (daysOverdue >= 3 && invoice.reminderCount < 1) tier = 1;

    if (!tier) continue;

    // 3-day cooldown between reminders
    if (invoice.lastReminderAt) {
      const daysSinceLast = Math.floor(
        (now.getTime() - new Date(invoice.lastReminderAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLast < 3) continue;
    }

    // Auto-transition PENDING → OVERDUE
    if (invoice.status === "PENDING") {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "OVERDUE" },
      });
    }

    const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/inv/${invoice.slug}`;
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(invoice.total / 100);
    const creatorName = invoice.user?.name || "Creator";

    const templateFn =
      tier === 1
        ? emailTemplates.invoiceReminderTier1
        : tier === 2
          ? emailTemplates.invoiceReminderTier2
          : emailTemplates.invoiceReminderTier3;

    const subjectPrefix =
      tier === 1 ? "Friendly Reminder" : tier === 2 ? "Action Required" : "Final Notice";

    const result = await sendEmail({
      to: invoice.brandEmail,
      fromName: creatorName,
      replyTo: invoice.user?.email || undefined,
      subject: `${subjectPrefix}: Invoice ${invoice.number}`,
      html: templateFn(
        invoice.brand,
        creatorName,
        formattedAmount,
        new Date(invoice.dueDate).toLocaleDateString(),
        invoiceUrl,
        invoice.number,
        daysOverdue
      ),
    });

    if (result.success) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { lastReminderAt: now, reminderCount: { increment: 1 } },
      });
      sent++;
    } else {
      errors++;
      console.error(`Failed to send reminder for invoice ${invoice.id}:`, result.error);
    }
  }

  // --- 2. Batch-expire proposals past their expiresAt ---
  const expiredCount = await prisma.proposal.updateMany({
    where: {
      status: { in: ["SENT", "VIEWED"] },
      expiresAt: { lt: now },
    },
    data: { status: "EXPIRED" },
  });

  return NextResponse.json({
    invoices: { processed: overdueInvoices.length, sent, errors },
    proposals: { expired: expiredCount.count },
  });
}
