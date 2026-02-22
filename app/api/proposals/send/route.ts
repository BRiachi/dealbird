import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { proposalId } = await req.json();

  const proposal = await prisma.proposal.findFirst({
    where: { id: proposalId, userId: session.user.id },
    include: { items: true },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (!proposal.brandEmail) {
    return NextResponse.json({ error: "No brand email set on this proposal" }, { status: 400 });
  }

  const creator = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  if (!creator?.email) {
    return NextResponse.json({ error: "Creator email not found" }, { status: 400 });
  }

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
    userId: session.user.id,
    type: "PROPOSAL_SENT",
    proposalId: proposal.id,
  });

  if (!emailRes.success) {
    console.error("Failed to send proposal email:", emailRes.error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  // Update status to SENT if it was DRAFT
  if (proposal.status === "DRAFT") {
    await prisma.proposal.update({
      where: { id: proposalId },
      data: { status: "SENT", sentAt: new Date() },
    });
  }

  return NextResponse.json({ success: true });
}
