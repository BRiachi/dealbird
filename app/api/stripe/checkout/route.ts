import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession, createPortalSession, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// GET /api/stripe/checkout?plan=pro|agency or ?portal=true
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const plan = searchParams.get("plan");
  const portal = searchParams.get("portal");

  // Manage billing portal
  if (portal === "true") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });
    if (!user?.stripeCustomerId) {
      return NextResponse.redirect(new URL("/dashboard/settings?error=no_subscription", req.url));
    }
    const portalSession = await createPortalSession(user.stripeCustomerId);
    return NextResponse.redirect(portalSession.url!);
  }

  // Create checkout for plan upgrade
  if (plan && (plan === "pro" || plan === "agency")) {
    const planConfig = PLANS[plan as keyof typeof PLANS];
    if (!("priceId" in planConfig) || !planConfig.priceId) {
      return NextResponse.redirect(new URL("/dashboard/settings?error=invalid_plan", req.url));
    }
    const checkoutSession = await createCheckoutSession(
      session.user.id,
      session.user.email,
      planConfig.priceId
    );
    return NextResponse.redirect(checkoutSession.url!);
  }

  return NextResponse.redirect(new URL("/dashboard/settings", req.url));
}

// POST /api/stripe/checkout - Create checkout session (for API calls)
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

