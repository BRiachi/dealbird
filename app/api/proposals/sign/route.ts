import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";

// POST /api/proposals/sign - Brand signs a proposal (public route)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { slug, signature, signatureData } = body;

  if (!slug || !signature) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const proposal = await prisma.proposal.findUnique({
    where: { slug },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (proposal.status === "SIGNED") {
    return NextResponse.json({ error: "Already signed" }, { status: 400 });
  }

  const updated = await prisma.proposal.update({
    where: { slug },
    data: {
      status: "SIGNED",
      signedAt: new Date(),
      signature,
      signatureData: signatureData || null,
    },
    include: { items: true },
  });

  // Send emails
  try {
    const creator = await prisma.user.findUnique({
      where: { id: proposal.userId },
      select: { name: true, email: true },
    });

    if (creator?.email) {
      const proposalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${slug}`;

      // Email to Creator
      await sendEmail({
        to: creator.email,
        replyTo: "noreply@dealbird.ai",
        subject: `Deal Signed: ${proposal.title}`,
        html: emailTemplates.dealSignedCreator(
          creator.name || "Creator",
          proposal.brand,
          proposal.title,
          proposalUrl
        ),
      });

      // Email to Brand (if email exists)
      if (proposal.brandEmail) {
        await sendEmail({
          to: proposal.brandEmail,
          replyTo: creator.email,
          subject: `You signed the deal: ${proposal.title}`,
          html: emailTemplates.dealSignedBrand(
            proposal.brand,
            creator.name || "Creator",
            proposal.title,
            proposalUrl
          ),
        });
      }
    }
  } catch (err) {
    console.error("Failed to send signing emails:", err);
    // Don't block the response if email fails
  }

  return NextResponse.json(updated);
}

// POST /api/proposals/view - Track proposal view (public route)
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { slug, userAgent, referrer } = body;

  const proposal = await prisma.proposal.findUnique({ where: { slug } });
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Record view
  await prisma.proposalView.create({
    data: {
      proposalId: proposal.id,
      userAgent: userAgent || null,
      referrer: referrer || null,
    },
  });

  // Update view count and status
  await prisma.proposal.update({
    where: { slug },
    data: {
      viewCount: { increment: 1 },
      status: proposal.status === "SENT" ? "VIEWED" : proposal.status,
    },
  });

  return NextResponse.json({ success: true });
}
