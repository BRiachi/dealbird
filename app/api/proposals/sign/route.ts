import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";

// POST /api/proposals/sign - Brand signs a proposal (public route)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { slug, signature, signatureData, selectedAddOnIds } = body;

  if (!slug || !signature) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const proposal = await prisma.proposal.findUnique({
    where: { slug },
    include: { addOns: true },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (proposal.status === "SIGNED") {
    return NextResponse.json({ error: "Already signed" }, { status: 400 });
  }

  // Mark selected add-ons in the database
  if (selectedAddOnIds && Array.isArray(selectedAddOnIds) && selectedAddOnIds.length > 0) {
    await prisma.proposalAddOn.updateMany({
      where: {
        proposalId: proposal.id,
        id: { in: selectedAddOnIds },
      },
      data: { isSelected: true },
    });
  }

  const updated = await prisma.proposal.update({
    where: { slug },
    data: {
      status: "SIGNED",
      signedAt: new Date(),
      signature,
      signatureData: signatureData || null,
    },
    include: { items: true, addOns: true },
  });

  // Send emails (fire and forget with timeout to prevent blocking)
  const sendEmails = async () => {
    try {
      const creator = await prisma.user.findUnique({
        where: { id: proposal.userId },
        select: { name: true, email: true },
      });

      if (creator?.email) {
        const proposalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${slug}`;

        // Send to Creator
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

        // Send to Brand
        if (proposal.brandEmail) {
          await sendEmail({
            to: proposal.brandEmail,
            fromName: creator.name || undefined,
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
    }
  };

  // Execute email sending with a 4s timeout so it doesn't block the response indefinitely
  // We await it to ensure it starts, but race against a timeout
  const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 4000));
  await Promise.race([sendEmails(), timeoutPromise]);

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
