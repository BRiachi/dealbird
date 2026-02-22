import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { signState } from "@/lib/stripe-connect-state";

// GET — check current Connect status
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeConnectId: true, stripeConnectEnabled: true, paypalEmail: true },
  });

  if (!user?.stripeConnectId) {
    return NextResponse.json({ stripeEnabled: false, paypalEmail: user?.paypalEmail || null });
  }

  const stripe = getStripe();
  try {
    const account = await stripe.accounts.retrieve(user.stripeConnectId);
    const isEnabled = !!(account.charges_enabled && account.payouts_enabled);

    if (isEnabled !== user.stripeConnectEnabled) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeConnectEnabled: isEnabled },
      });
    }

    return NextResponse.json({
      stripeEnabled: isEnabled,
      detailsSubmitted: account.details_submitted,
      paypalEmail: user.paypalEmail || null,
    });
  } catch {
    return NextResponse.json({ stripeEnabled: false, paypalEmail: user.paypalEmail || null });
  }
}

// POST — generate Stripe Connect OAuth URL
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = process.env.STRIPE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Stripe Connect not configured" }, { status: 503 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${origin}/api/stripe/connect/callback`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "read_write",
    redirect_uri: redirectUri,
    state: signState(session.user.id), // HMAC-signed to prevent CSRF in callback
  });

  const url = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
  return NextResponse.json({ url });
}

// DELETE — disconnect Stripe account
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { stripeConnectId: null, stripeConnectEnabled: false },
  });

  return NextResponse.json({ success: true });
}
