import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// POST /api/invoices/pay — create a Stripe checkout session for a public invoice
export async function POST(req: NextRequest) {
    try {
        const { slug } = await req.json();
        if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

        const invoice = await prisma.invoice.findUnique({
            where: { slug },
            include: { user: { select: { name: true, email: true, stripeConnectId: true } } },
        });

        if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        if (invoice.status === "PAID") return NextResponse.json({ error: "Already paid" }, { status: 400 });

        const stripe = getStripe();
        const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            customer_email: invoice.brandEmail,
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `Invoice ${invoice.number}`,
                            description: `From ${invoice.user?.name || "Creator"}`,
                        },
                        unit_amount: invoice.total,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                type: "INVOICE_PAYMENT",
                invoiceId: invoice.id,
                invoiceSlug: slug,
                sellerId: invoice.userId,
            },
            success_url: `${origin}/inv/${slug}?paid=true`,
            cancel_url: `${origin}/inv/${slug}`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error("[INVOICE_PAY_ERROR]", err);
        return NextResponse.json({ error: "Payment session creation failed" }, { status: 500 });
    }
}
