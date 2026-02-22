import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, canCreateProposal } from "@/lib/utils";
import { sendEmail, emailTemplates } from "@/lib/email";

// GET /api/proposals - List user's proposals
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proposals = await prisma.proposal.findMany({
    where: { userId: session.user.id },
    include: { items: { orderBy: { order: "asc" } }, invoice: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(proposals);
}

// POST /api/proposals - Create new proposal
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check limits for free tier
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, proposalsThisMonth: true, proposalsResetAt: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Reset monthly counter if needed
  const now = new Date();
  const resetAt = user.proposalsResetAt ? new Date(user.proposalsResetAt) : null;
  let currentCount = user.proposalsThisMonth;

  if (!resetAt || now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
    currentCount = 0;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { proposalsThisMonth: 0, proposalsResetAt: now },
    });
  }

  if (!canCreateProposal(user.plan, currentCount)) {
    return NextResponse.json(
      { error: "Free plan limit reached. Upgrade to Pro for unlimited proposals." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { title, brand, brandEmail, terms, notes, items, addOns, status, expiresAt } = body;

  const proposal = await prisma.proposal.create({
    data: {
      slug: generateSlug(),
      userId: session.user.id,
      title,
      brand,
      brandEmail,
      terms: terms || "Net 30",
      notes,
      status: status || "DRAFT",
      sentAt: status === "SENT" ? new Date() : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      items: {
        create: items.map((item: any, idx: number) => ({
          name: item.name,
          detail: item.detail || "",
          price: Math.round(item.price), // Already in cents from the form
          order: idx,
        })),
      },
      addOns: {
        create: (addOns || []).map((addon: any, idx: number) => ({
          name: addon.name,
          description: addon.description || "",
          price: Math.round(addon.price),
          order: idx,
        })),
      },
    },
    include: { items: true, addOns: true },
  });

  // Increment monthly counter
  await prisma.user.update({
    where: { id: session.user.id },
    data: { proposalsThisMonth: { increment: 1 } },
  });

  // If status is being set to SENT, trigger email
  if (status === "SENT") {
    const creator = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    if (creator?.email && proposal.brandEmail) {
      const proposalUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/p/${proposal.slug}`;
      const total = proposal.items.reduce((acc, item) => acc + item.price, 0);
      const formattedTotal = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(total / 100);

      const emailRes = await sendEmail({
        to: proposal.brandEmail,
        fromName: creator.name || undefined,
        replyTo: creator.email,
        subject: `Proposal: ${proposal.title} from ${creator.name || "Creator"}`,
        html: emailTemplates.proposal(
          proposal.brand,
          creator.name || "Creator",
          proposal.title,
          formattedTotal,
          proposalUrl
        ),
      });

      if (!emailRes.success) {
        console.error("Failed to send proposal POST email:", emailRes.error);
      }
    }
  }

  return NextResponse.json(proposal, { status: 201 });
}

// PUT /api/proposals - Update proposal
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, title, brand, brandEmail, terms, notes, items, addOns, status, expiresAt } = body;

  // Verify ownership
  const existing = await prisma.proposal.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete old items and recreate
  await prisma.proposalItem.deleteMany({ where: { proposalId: id } });
  await prisma.proposalAddOn.deleteMany({ where: { proposalId: id } });

  const proposal = await prisma.proposal.update({
    where: { id },
    data: {
      title,
      brand,
      brandEmail,
      terms,
      notes,
      status: status || existing.status,
      sentAt: status === "SENT" && !existing.sentAt ? new Date() : existing.sentAt,
      expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : existing.expiresAt,
      items: {
        create: items.map((item: any, idx: number) => ({
          name: item.name,
          detail: item.detail || "",
          price: Math.round(item.price), // Already in cents
          order: idx,
        })),
      },
      addOns: {
        create: (addOns || []).map((addon: any, idx: number) => ({
          name: addon.name,
          description: addon.description || "",
          price: Math.round(addon.price),
          order: idx,
        })),
      },
    },
    include: { items: true, addOns: true },
  });

  // If status is being set to SENT, trigger email
  if (status === "SENT") {
    const creator = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    if (creator?.email && proposal.brandEmail) {
      const proposalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${proposal.slug}`;
      const total = proposal.items.reduce((acc, item) => acc + item.price, 0);
      const formattedTotal = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(total / 100);

      const emailRes = await sendEmail({
        to: proposal.brandEmail,
        fromName: creator.name || undefined,
        replyTo: creator.email,
        subject: `Proposal: ${proposal.title} from ${creator.name || "Creator"}`,
        html: emailTemplates.proposal(
          proposal.brand,
          creator.name || "Creator",
          proposal.title,
          formattedTotal,
          proposalUrl
        ),
      });

      if (!emailRes.success) {
        console.error("Failed to send proposal PUT email:", emailRes.error);
      }
    }
  }

  return NextResponse.json(proposal);
}
