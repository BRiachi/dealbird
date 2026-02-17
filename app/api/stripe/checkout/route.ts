import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession, createPortalSession } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// POST /api/stripe/checkout - Create checkout session
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { priceId, action } = body;

  // If user wants to manage billing
  if (action === "portal") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });
    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 400 });
    }
    const portalSession = await createPortalSession(user.stripeCustomerId);
    return NextResponse.json({ url: portalSession.url });
  }

  // Create checkout
  if (!priceId) {
    return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
  }

  const checkoutSession = await createCheckoutSession(
    session.user.id,
    session.user.email,
    priceId
  );

  return NextResponse.json({ url: checkoutSession.url });
}
