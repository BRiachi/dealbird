import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

// GET /api/stripe/connect/callback — Stripe OAuth redirect
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // userId passed as state
  const error = searchParams.get("error");
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error || !code || !state) {
    return NextResponse.redirect(`${origin}/dashboard/settings?stripe_connect=error`);
  }

  const stripe = getStripe();

  try {
    // Exchange code for access token
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });

    const stripeAccountId = response.stripe_user_id;
    if (!stripeAccountId) throw new Error("No account ID returned");

    // Retrieve account to check if it's enabled
    const account = await stripe.accounts.retrieve(stripeAccountId);
    const isEnabled = !!(account.charges_enabled && account.payouts_enabled);

    // Save to user
    await prisma.user.update({
      where: { id: state },
      data: {
        stripeConnectId: stripeAccountId,
        stripeConnectEnabled: isEnabled,
      },
    });

    return NextResponse.redirect(`${origin}/dashboard/settings?stripe_connect=success`);
  } catch (err) {
    console.error("[STRIPE_CONNECT_CALLBACK_ERROR]", err);
    return NextResponse.redirect(`${origin}/dashboard/settings?stripe_connect=error`);
  }
}
