import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const PLANS = {
  free: {
    name: "Free",
    proposalsPerMonth: 3,
    features: ["3 proposals/month", "E-signatures", "Invoice generation", "DealBird branding"],
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 1900, // $19
    proposalsPerMonth: Infinity,
    features: [
      "Unlimited proposals",
      "Remove branding",
      "View analytics",
      "Payment reminders",
      "Contract templates",
      "Tax-ready export",
    ],
  },
  agency: {
    name: "Agency",
    priceId: process.env.STRIPE_AGENCY_PRICE_ID!,
    price: 14900, // $149
    proposalsPerMonth: Infinity,
    features: [
      "Everything in Pro",
      "10+ creator accounts",
      "Team dashboard",
      "Bulk invoicing",
      "Revenue reporting",
    ],
  },
};

export async function createCheckoutSession(userId: string, email: string, priceId: string) {
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    metadata: { userId },
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    allow_promotion_codes: true,
  });
  return session;
}

export async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });
  return session;
}
