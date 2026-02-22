import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, generateInvoiceNumber, calculateTotal } from "@/lib/utils";
import { sendEmail, emailTemplates } from "@/lib/email";

// Create invoice from signed proposal
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { proposalId } = await req.json();

  const proposal = await prisma.proposal.findFirst({
    where: { id: proposalId, userId: session.user.id, status: "SIGNED" },
    include: { items: true, invoice: true, addOns: { where: { isSelected: true } } },
  });

  if (!proposal) return NextResponse.json({ error: "Proposal not found or not signed" }, { status: 400 });
  if (proposal.invoice) return NextResponse.json({ error: "Invoice already exists", id: proposal.invoice.id }, { status: 400 });

  const baseTotal = calculateTotal(proposal.items);
  const addOnsTotal = proposal.addOns.reduce((sum, addon) => sum + addon.price, 0);
  const total = baseTotal + addOnsTotal;

  const invoiceCount = await prisma.invoice.count({ where: { userId: session.user.id } });

  // Combine base items and selected add-ons into a single flat array for invoice items
  const combinedItems = [
    ...proposal.items.map((item) => ({ name: item.name, price: item.price })),
    ...proposal.addOns.map((addon) => ({ name: `+ ${addon.name}`, price: addon.price }))
  ];

  const invoice = await prisma.invoice.create({
    data: {
      slug: generateSlug(),
      number: generateInvoiceNumber(invoiceCount),
      userId: session.user.id,
      proposalId: proposal.id,
      brand: proposal.brand,
      brandEmail: proposal.brandEmail,
      total,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: {
        create: combinedItems.map((item, idx) => ({
          name: item.name,
          price: item.price,
          order: idx,
        })),
      },
    },
  });

  // Send invoice email to the client
  const creator = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/inv/${invoice.slug}`;
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(total / 100);

  await sendEmail({
    to: proposal.brandEmail,
    fromName: creator?.name || undefined,
    replyTo: creator?.email || undefined,
    subject: `Invoice ${invoice.number} from ${creator?.name || "Creator"}`,
    html: emailTemplates.invoice(
      proposal.brand,
      creator?.name || "Creator",
      formattedAmount,
      new Date(invoice.dueDate).toLocaleDateString(),
      invoiceUrl,
      invoice.number
    ),
    userId: session.user.id,
    type: "INVOICE_SENT",
    invoiceId: invoice.id,
  });

  return NextResponse.json(invoice);
}

// Mark paid / send reminder
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { invoiceId, action } = await req.json();

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId: session.user.id },
  });

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  if (action === "markPaid") {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID", paidAt: new Date() },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "sendReminder") {
    // Fetch creator details for email/reply-to
    const creator = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    if (!creator?.email) return NextResponse.json({ error: "Creator email not found" }, { status: 400 });

    const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/inv/${invoice.slug}`;
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(invoice.total / 100);

    const emailRes = await sendEmail({
      to: invoice.brandEmail,
      fromName: creator.name || undefined,
      replyTo: creator.email,
      subject: `Invoice ${invoice.number} from ${creator.name || "Creator"}`,
      html: emailTemplates.invoice(
        invoice.brand,
        creator.name || "Creator",
        formattedAmount,
        new Date(invoice.dueDate).toLocaleDateString(),
        invoiceUrl,
        invoice.number
      ),
      userId: session.user.id,
      type: "REMINDER",
      invoiceId: invoice.id,
    });

    if (!emailRes.success) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { lastReminderAt: new Date(), reminderCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
