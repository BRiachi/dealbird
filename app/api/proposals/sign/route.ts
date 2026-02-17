import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
