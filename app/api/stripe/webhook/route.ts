import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const signature = headers().get("Stripe-Signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  switch (event.type) {
    case "checkout.session.completed": {
      // Handle Product Purchase (One-Time)
      // Handle Product Purchase (One-Time)
      if (session.mode === "payment" && session.metadata?.type === "PRODUCT_PURCHASE") {
        // Retrieve line items to handle bumps
        const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ["line_items.data.price.product"],
        });

        const lineItems = expandedSession.line_items?.data || [];

        for (const item of lineItems) {
          const stripeProduct = item.price?.product as Stripe.Product;
          const productId = stripeProduct?.metadata?.productId;
          const sellerId = stripeProduct?.metadata?.sellerId;

          if (productId && sellerId) {
            await prisma.order.create({
              data: {
                productId: productId,
                userId: sellerId,
                buyerEmail: session.customer_details?.email || "unknown",
                buyerName: session.customer_details?.name,
                amount: item.amount_total,
                status: "PAID",
                stripeSessionId: session.id,
                affiliateUserId: session.metadata?.affiliateUserId || null,
              },
            });

            // Update Product Stats
            await prisma.product.update({
              where: { id: productId },
              data: {
                sales: { increment: 1 },
                revenue: { increment: item.amount_total },
              },
            });
          }
        }
        break;
      }

      // Handle Subscription (Existing)
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const priceId = subscription.items.data[0].price.id;
        const plan =
          priceId === process.env.STRIPE_PRO_PRICE_ID
            ? "pro"
            : priceId === process.env.STRIPE_AGENCY_PRICE_ID
              ? "agency"
              : "free";

        await prisma.user.update({
          where: { id: session.metadata!.userId },
          data: {
            stripeCustomerId: subscription.customer as string,
            stripeSubId: subscription.id,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            plan,
          },
        });
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );

        await prisma.user.update({
          where: { stripeSubId: subscription.id },
          data: {
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.user.update({
        where: { stripeSubId: subscription.id },
        data: {
          plan: "free",
          stripeSubId: null,
          stripePriceId: null,
          stripeCurrentPeriodEnd: null,
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
