import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

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

export async function createCheckoutSession(userId: string, email: string, priceOrProductId: string) {
  const stripe = getStripe();

  // If a product ID was passed, look up its default price
  let priceId = priceOrProductId;
  if (priceOrProductId.startsWith("prod_")) {
    const product = await stripe.products.retrieve(priceOrProductId);
    if (product.default_price) {
      priceId = typeof product.default_price === "string"
        ? product.default_price
        : product.default_price.id;
    } else {
      // List prices for this product and take the first active one
      const prices = await stripe.prices.list({ product: priceOrProductId, active: true, limit: 1 });
      if (prices.data.length > 0) {
        priceId = prices.data[0].id;
      } else {
        throw new Error(`No active price found for product ${priceOrProductId}`);
      }
    }
  }

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
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });
  return session;
}

