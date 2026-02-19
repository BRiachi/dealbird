import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendEmail, getOrderReceiptEmail, getNewSaleEmail, getBookingConfirmationEmail } from "@/lib/email";

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
            const buyerEmail = session.customer_details?.email || "unknown";
            let finalAffiliateId = session.metadata?.affiliateUserId || null;

            // LIFETIME AFFILIATE LOGIC
            // 1. Check if buyer corresponds to a registered User
            if (buyerEmail !== "unknown") {
              const buyerUser = await prisma.user.findUnique({
                where: { email: buyerEmail },
                select: { id: true, referredById: true } // Optimization: only select needed fields
              }).catch(() => null); // Fail safely if DB issue

              if (buyerUser) {
                if (buyerUser.referredById) {
                  // EXISTING BINDING: Honor the lifetime referrer
                  console.log(`[AFFILIATE] Overriding cookie ${finalAffiliateId} with lifetime referrer ${buyerUser.referredById} for ${buyerEmail}`);
                  finalAffiliateId = buyerUser.referredById;
                } else if (finalAffiliateId && finalAffiliateId !== buyerUser.id) {
                  // NEW BINDING: Bind this user to the affiliate for life (if not self-referral)
                  // We do this asynchronously to not block the webhook significantly, but await is safer for consistency
                  await prisma.user.update({
                    where: { id: buyerUser.id },
                    data: { referredById: finalAffiliateId }
                  }).catch(e => console.error("[AFFILIATE_BIND_ERROR]", e));

                  console.log(`[AFFILIATE] Binding ${buyerEmail} to referrer ${finalAffiliateId} for life`);
                }
              }
            }

            const order = await prisma.order.create({
              data: {
                productId: productId,
                userId: sellerId,
                buyerEmail: buyerEmail,
                buyerName: session.customer_details?.name,
                amount: item.amount_total,
                status: "PAID",
                stripeSessionId: session.id,
                affiliateUserId: finalAffiliateId,
              },
            });

            // Handle Booking Creation for Main Product

            // Handle Booking Creation for Main Product
            if (productId === session.metadata?.productId && session.metadata?.bookingStart) {
              const bookingStart = new Date(session.metadata.bookingStart);
              const bookingEnd = new Date(session.metadata.bookingEnd);

              // Find Profile
              const profile = await prisma.appointmentProfile.findUnique({
                where: { productId }
              });

              if (profile) {
                const booking = await prisma.booking.create({
                  data: {
                    profileId: profile.id,
                    orderId: order.id,
                    startTime: bookingStart,
                    endTime: bookingEnd,
                    status: "CONFIRMED",
                    meetingUrl: profile.location === "google_meet" ? "https://meet.google.com/new" :
                      profile.location === "zoom" ? "https://zoom.us/j/placeholder" : null
                  },
                  include: {
                    profile: { include: { product: true } }
                  }
                });
                console.log(`[WEBHOOK] Booking created for Order ${order.id}`);

                // Send Booking Confirmation Email
                if (buyerEmail !== "unknown") {
                  await sendEmail({
                    to: buyerEmail,
                    subject: `Booking Confirmed: ${booking.profile.product.title}`,
                    html: getBookingConfirmationEmail(
                      booking.profile.product.title,
                      booking.startTime,
                      booking.meetingUrl
                    )
                  });
                }
              }
            }

            // Fetch Seller for Email Notifications
            const seller = await prisma.user.findUnique({
              where: { id: sellerId },
              select: { email: true }
            });

            const productName = typeof item.price?.product === "object" && "name" in item.price.product
              ? (item.price.product as Stripe.Product).name
              : "Product";

            // Send Order Receipt to Buyer
            if (buyerEmail !== "unknown") {
              await sendEmail({
                to: buyerEmail,
                subject: `Receipt for your order`,
                html: getOrderReceiptEmail(productName, item.amount_total, undefined)
              });
            }

            // Send New Sale Alert to Seller
            if (seller?.email) {
              await sendEmail({
                to: seller.email,
                subject: `💰 New Sale! $${(item.amount_total / 100).toFixed(2)}`,
                html: getNewSaleEmail(productName, item.amount_total, buyerEmail)
              });
            }

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

      // Handle Membership Product Purchase (Subscription)
      if (session.mode === "subscription" && session.metadata?.type === "MEMBERSHIP_PURCHASE") {
        const productId = session.metadata.productId;
        const sellerId = session.metadata.sellerId;
        const buyerEmail = session.customer_details?.email || "unknown";

        if (productId && sellerId) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

          await prisma.order.create({
            data: {
              productId,
              userId: sellerId,
              buyerEmail,
              buyerName: session.customer_details?.name,
              amount: subscription.items.data[0].price.unit_amount || 0,
              status: "PAID",
              stripeSessionId: session.id,
              affiliateUserId: session.metadata.affiliateUserId || null,
            },
          });

          await prisma.product.update({
            where: { id: productId },
            data: { sales: { increment: 1 }, revenue: { increment: subscription.items.data[0].price.unit_amount || 0 } },
          });

          const seller = await prisma.user.findUnique({ where: { id: sellerId }, select: { email: true } });
          if (buyerEmail !== "unknown") {
            await sendEmail({
              to: buyerEmail,
              subject: "Membership Confirmed!",
              html: getOrderReceiptEmail("Membership", subscription.items.data[0].price.unit_amount || 0),
            });
          }
          if (seller?.email) {
            await sendEmail({
              to: seller.email,
              subject: `New Membership! $${((subscription.items.data[0].price.unit_amount || 0) / 100).toFixed(2)}/mo`,
              html: getNewSaleEmail("Membership", subscription.items.data[0].price.unit_amount || 0, buyerEmail),
            });
          }
        }
        break;
      }

      // Handle Invoice Payment
      if (session.mode === "payment" && session.metadata?.type === "INVOICE_PAYMENT") {
        const invoiceId = session.metadata.invoiceId;
        if (invoiceId) {
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: "PAID", paidAt: new Date() },
          });
          console.log(`[WEBHOOK] Invoice ${invoiceId} marked as PAID`);
        }
        break;
      }

      // Handle Platform Subscription (pro/agency plan upgrade)
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

    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      if (account.id) {
        const isEnabled = account.charges_enabled && account.payouts_enabled;
        console.log(`[WEBHOOK] Account ${account.id} updated. Enabled: ${isEnabled}`);

        await prisma.user.update({
          where: { stripeConnectId: account.id },
          data: { stripeConnectEnabled: isEnabled }
        }).catch(() => {
          // Ignore if user not found (might be platform account)
          console.warn(`[WEBHOOK] User not found for Connect ID ${account.id}`);
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
