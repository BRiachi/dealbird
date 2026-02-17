import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const stripe = getStripe();

        // Handle both JSON and Form Data (for simple <form> submissions)
        let productId;
        const contentType = req.headers.get("content-type") || "";

        // Parse body
        let body;
        if (contentType.includes("application/json")) {
            body = await req.json();
            productId = body.productId;
        } else {
            const formData = await req.formData();
            productId = formData.get("productId");
            // If formData, we assume no complex JSON for bumps yet, or parse it
        }

        if (!productId || typeof productId !== "string") {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        // Fetch Product
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { user: true },
        });

        if (!product || product.price === 0) {
            return NextResponse.json({ error: "Invalid product or free product" }, { status: 400 });
        }

        // Fetch Bump Product
        let bumpProduct = null;
        if (body?.bumpProductId) {
            bumpProduct = await prisma.product.findUnique({
                where: { id: body.bumpProductId },
            });
        }

        // Affiliate Logic
        let affiliateUserId = null;
        const affiliateHandle = req.cookies.get("dealbird_affiliate")?.value;

        if (affiliateHandle && product.settings && (product.settings as any).affiliate?.active) {
            // Find affiliate user
            const affiliateUser = await prisma.user.findUnique({
                where: { handle: affiliateHandle }
            });
            // Don't allow self-referral
            if (affiliateUser && affiliateUser.id !== product.userId) {
                affiliateUserId = affiliateUser.id;
                console.log("Checkout: Resolved Affiliate:", affiliateHandle, "->", affiliateUserId);
            }
        }

        // Price helper
        const getPrice = (p: any) => {
            const s = (p.settings as any) || {};
            return (s.discountPrice && s.discountPrice < p.price) ? s.discountPrice : p.price;
        };

        const line_items = [
            {
                price_data: {
                    currency: product.currency || "usd",
                    product_data: {
                        name: product.title,
                        description: product.subtitle || "Digital Product",
                        images: product.image ? [product.image] : undefined,
                        metadata: {
                            productId: product.id,
                            sellerId: product.userId,
                        } as Record<string, string>
                    },
                    unit_amount: getPrice(product),
                },
                quantity: 1,
            }
        ];

        if (bumpProduct) {
            line_items.push({
                price_data: {
                    currency: bumpProduct.currency || "usd",
                    product_data: {
                        name: bumpProduct.title + " (Order Bump)",
                        description: bumpProduct.subtitle || "Special Offer",
                        images: bumpProduct.image ? [bumpProduct.image] : undefined,
                        metadata: {
                            productId: bumpProduct.id,
                            sellerId: bumpProduct.userId,
                            isOrderBump: "true"
                        } as Record<string, string>
                    },
                    unit_amount: getPrice(bumpProduct),
                },
                quantity: 1,
            });
        }

        // Determine success/cancel URLs
        const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const successUrl = `${origin}/orders/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${origin}/u/${product.user.handle}?canceled=true`;

        // Parse settings
        const settings = (product.settings as any) || {};

        // Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            customer_email: body?.customerEmail,
            phone_number_collection: settings.checkoutFields?.phone ? { enabled: true } : undefined,
            line_items,
            metadata: {
                type: "PRODUCT_PURCHASE",
                productId: product.id,
                sellerId: product.userId,
                bumpProductId: bumpProduct?.id || "",
                affiliateUserId: affiliateUserId || ""
            },
            // If we want to collect fees later:
            // payment_intent_data: {
            //   application_fee_amount: Math.round(product.price * 0.05), // 5% fee
            // },
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        if (!session.url) {
            throw new Error("Failed to create session URL");
        }

        // If request was form submission, redirect
        if (!contentType.includes("application/json")) {
            return NextResponse.redirect(session.url, 303);
        }

        return NextResponse.json({ url: session.url });

    } catch (err: any) {
        console.error("[CHECKOUT_ERROR]", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
